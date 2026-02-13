import OpenAI from "openai";

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB

const MOCK_TRANSCRIPT =
  "This is a mock transcription. I've been thinking about building a new project that combines AI with personal journaling. The idea is to create a second brain that helps people organize their thoughts and discover hidden patterns in their thinking.";

/**
 * Transcribe audio using OpenAI Whisper API.
 * Falls back to a mock transcript when no API key is configured.
 */
export async function transcribeAudio(
  audioBlob: Blob,
  filename: string = "recording.webm"
): Promise<string> {
  if (audioBlob.size > MAX_FILE_SIZE) {
    throw new Error("Audio file exceeds 25MB limit");
  }

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    console.warn("[Transcribe] No OPENAI_API_KEY found, using mock transcript");
    return MOCK_TRANSCRIPT;
  }

  try {
    const openai = new OpenAI({ apiKey });
    const file = new File([audioBlob], filename, { type: audioBlob.type });

    const response = await openai.audio.transcriptions.create({
      model: "whisper-1",
      file,
    });

    return response.text;
  } catch (error) {
    console.error("[Transcribe] Whisper API failed, falling back to mock:", error);
    return MOCK_TRANSCRIPT;
  }
}
