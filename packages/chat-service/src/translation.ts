// ---------------------------------------------------------------------------
// @dreamhub/chat-service — Translation Bridge
//
// Connects chat messages to @dreamhub/translation-service for async
// multi-language translation using the optimistic strategy.
// ---------------------------------------------------------------------------

import type { Server } from "socket.io";
import type {
  ServerToClientEvents,
  ClientToServerEvents,
  InterServerEvents,
  SocketData,
} from "./types";
import type { MessageHandler } from "./message-handler";

type ChatIO = Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;

export interface TranslationBridgeOptions {
  io: ChatIO;
  messageHandler: MessageHandler;
  participantLanguages: Map<string, string>;
}

/**
 * Bridge between chat messages and the translation service.
 *
 * When a message is sent in a multi-language room, this triggers async
 * translation for each receiver language that differs from the sender.
 * Translations are stored on the message and broadcast via socket.
 */
export class ChatTranslationBridge {
  private io: ChatIO;
  private messageHandler: MessageHandler;
  private participantLanguages: Map<string, string>;

  constructor(options: TranslationBridgeOptions) {
    this.io = options.io;
    this.messageHandler = options.messageHandler;
    this.participantLanguages = options.participantLanguages;
  }

  /**
   * Set a user's preferred language.
   */
  setUserLanguage(userId: string, language: string): void {
    this.participantLanguages.set(userId, language);
  }

  /**
   * Get a user's preferred language (defaults to "en").
   */
  getUserLanguage(userId: string): string {
    return this.participantLanguages.get(userId) || "en";
  }

  /**
   * Get target languages for translation based on room participants.
   * Excludes the sender's language.
   */
  getTargetLanguages(
    senderLang: string,
    participantIds: string[],
  ): string[] {
    const languages = new Set<string>();
    for (const userId of participantIds) {
      const lang = this.getUserLanguage(userId);
      if (lang !== senderLang) {
        languages.add(lang);
      }
    }
    return [...languages];
  }

  /**
   * Process a message for translation.
   * If room has multi-language participants, triggers async translation
   * and emits message:translated when done.
   */
  async translateMessage(
    roomId: string,
    messageId: string,
    content: string,
    senderLang: string,
    participantIds: string[],
    translateFn?: (
      text: string,
      toLang: string,
    ) => Promise<string>,
  ): Promise<void> {
    const targetLangs = this.getTargetLanguages(senderLang, participantIds);
    if (targetLangs.length === 0 || !translateFn) return;

    const translations: Record<string, string> = {};

    await Promise.allSettled(
      targetLangs.map(async (toLang) => {
        try {
          const translated = await translateFn(content, toLang);
          translations[toLang] = translated;
          this.messageHandler.addTranslation(
            roomId,
            messageId,
            toLang,
            translated,
          );
        } catch (error) {
          console.error(
            `[chat-service] Translation failed for ${messageId} → ${toLang}:`,
            error,
          );
        }
      }),
    );

    if (Object.keys(translations).length > 0) {
      this.io.to(roomId).emit("message:translated", {
        messageId,
        translations,
      });
    }
  }

  /**
   * Clear all language data (for testing).
   */
  clear(): void {
    this.participantLanguages.clear();
  }
}
