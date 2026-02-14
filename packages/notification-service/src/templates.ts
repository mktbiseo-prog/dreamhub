// ---------------------------------------------------------------------------
// Notification Templates — i18n key mapping + English fallbacks
//
// Each NotificationType maps to title/body i18n keys. When the i18n system
// doesn't have a translation, FALLBACK_EN provides default English strings.
// ---------------------------------------------------------------------------

import { NotificationType } from "@dreamhub/shared-types";
import type { TemplateMap } from "./types";

/** i18n key mapping for each notification type */
export const NOTIFICATION_TEMPLATES: TemplateMap = {
  [NotificationType.MATCH_FOUND]: {
    titleKey: "notification.match_found.title",
    bodyKey: "notification.match_found.body",
  },
  [NotificationType.MATCH_ACCEPTED]: {
    titleKey: "notification.match_accepted.title",
    bodyKey: "notification.match_accepted.body",
  },
  [NotificationType.DOORBELL_RUNG]: {
    titleKey: "notification.doorbell_rung.title",
    bodyKey: "notification.doorbell_rung.body",
  },
  [NotificationType.THOUGHT_MILESTONE]: {
    titleKey: "notification.thought_milestone.title",
    bodyKey: "notification.thought_milestone.body",
  },
  [NotificationType.PROJECT_STAGE_CHANGED]: {
    titleKey: "notification.project_stage_changed.title",
    bodyKey: "notification.project_stage_changed.body",
  },
  [NotificationType.TEAM_MEMBER_JOINED]: {
    titleKey: "notification.team_member_joined.title",
    bodyKey: "notification.team_member_joined.body",
  },
  [NotificationType.STORE_PURCHASE]: {
    titleKey: "notification.store_purchase.title",
    bodyKey: "notification.store_purchase.body",
  },
  [NotificationType.FUNDING_MILESTONE]: {
    titleKey: "notification.funding_milestone.title",
    bodyKey: "notification.funding_milestone.body",
  },
  [NotificationType.GRIT_SCORE_UP]: {
    titleKey: "notification.grit_score_up.title",
    bodyKey: "notification.grit_score_up.body",
  },
  [NotificationType.NEW_MESSAGE]: {
    titleKey: "notification.new_message.title",
    bodyKey: "notification.new_message.body",
  },
  [NotificationType.WELCOME]: {
    titleKey: "notification.welcome.title",
    bodyKey: "notification.welcome.body",
  },
};

/**
 * English fallback strings. Used when the i18n system returns the key itself
 * (i.e., no translation file exists for the key).
 *
 * Placeholders use {param} syntax matching @dreamhub/i18n interpolation.
 */
export const FALLBACK_EN: Record<string, string> = {
  // MATCH_FOUND
  "notification.match_found.title": "New Match Found!",
  "notification.match_found.body": "You have a {score}% match — check it out!",

  // MATCH_ACCEPTED
  "notification.match_accepted.title": "Match Accepted!",
  "notification.match_accepted.body": "Your match has been accepted. Start a conversation!",

  // DOORBELL_RUNG
  "notification.doorbell_rung.title": "Someone Rang Your Doorbell!",
  "notification.doorbell_rung.body": "A dreamer is interested in your dream. Check who visited!",

  // THOUGHT_MILESTONE
  "notification.thought_milestone.title": "Thought Milestone Reached!",
  "notification.thought_milestone.body": "You've recorded {count} thoughts. Keep going!",

  // PROJECT_STAGE_CHANGED
  "notification.project_stage_changed.title": "Project Stage Updated",
  "notification.project_stage_changed.body": "Your project moved to the {stage} stage.",

  // TEAM_MEMBER_JOINED
  "notification.team_member_joined.title": "New Team Member!",
  "notification.team_member_joined.body": "{name} joined your team.",

  // STORE_PURCHASE
  "notification.store_purchase.title": "New Purchase!",
  "notification.store_purchase.body": "Someone purchased your product for ${amount}.",

  // FUNDING_MILESTONE
  "notification.funding_milestone.title": "Funding Milestone!",
  "notification.funding_milestone.body": "Your project reached {percent}% of its funding goal!",

  // GRIT_SCORE_UP
  "notification.grit_score_up.title": "Grit Score Increased!",
  "notification.grit_score_up.body": "Your grit score is now {score}. Great consistency!",

  // NEW_MESSAGE
  "notification.new_message.title": "New Message",
  "notification.new_message.body": "{senderName} sent you a message.",

  // WELCOME
  "notification.welcome.title": "Welcome to Dream Hub!",
  "notification.welcome.body": "Hi {name}, your Dream ID is ready. Start exploring!",
};

/**
 * Render a notification template with i18n support.
 *
 * Uses @dreamhub/i18n `t()` with fallback chain:
 *   1. User's locale translation
 *   2. English translation from i18n files
 *   3. FALLBACK_EN inline strings
 *   4. The key itself (should never happen)
 */
export function renderTemplate(
  type: NotificationType,
  locale: string,
  params: Record<string, string | number> = {},
): { title: string; body: string } {
  const template = NOTIFICATION_TEMPLATES[type];

  let title: string;
  let body: string;

  try {
    const { t } = require("@dreamhub/i18n");
    title = t(template.titleKey, locale, params);
    body = t(template.bodyKey, locale, params);

    // If i18n returned the key itself, use fallback
    if (title === template.titleKey) {
      title = interpolateFallback(template.titleKey, params);
    }
    if (body === template.bodyKey) {
      body = interpolateFallback(template.bodyKey, params);
    }
  } catch {
    // i18n not available — use fallback directly
    title = interpolateFallback(template.titleKey, params);
    body = interpolateFallback(template.bodyKey, params);
  }

  return { title, body };
}

/** Interpolate {param} placeholders in fallback strings */
function interpolateFallback(
  key: string,
  params: Record<string, string | number>,
): string {
  const template = FALLBACK_EN[key] ?? key;
  return template.replace(/\{(\w+)\}/g, (match, paramKey: string) => {
    if (paramKey in params) {
      return String(params[paramKey]);
    }
    return match;
  });
}
