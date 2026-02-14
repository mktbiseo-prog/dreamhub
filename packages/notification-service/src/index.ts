// ---------------------------------------------------------------------------
// @dreamhub/notification-service — Public API
// ---------------------------------------------------------------------------

// Core service
export { NotificationService } from "./notification-service";

// Event listener (EventBus → Notifications)
export { NotificationEventListener } from "./event-listener";

// Preference manager
export { NotificationPreferenceManager } from "./preferences";

// Channel providers
export { InAppNotificationProvider } from "./providers/in-app.provider";
export { PushNotificationProvider } from "./providers/push.provider";
export { EmailNotificationProvider } from "./providers/email.provider";
export type { PushRecord } from "./providers/push.provider";
export type { EmailRecord } from "./providers/email.provider";

// Templates
export { renderTemplate, NOTIFICATION_TEMPLATES, FALLBACK_EN } from "./templates";

// Internal types
export type {
  DeliveryResult,
  SendResult,
  NotificationProvider,
  NotificationTemplate,
  TemplateMap,
} from "./types";
