export { Button, buttonVariants, type ButtonProps } from "./components/button";
export { Input, type InputProps } from "./components/input";
export { Label, type LabelProps } from "./components/label";
export { Textarea, type TextareaProps } from "./components/textarea";
export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "./components/card";
export { SignInForm, type SignInFormProps } from "./components/sign-in-form";
export { cn } from "./lib/utils";

// ── Chat Components ─────────────────────────────────────────────────────────
export {
  ChatProvider,
  useChat,
  ConversationList,
  ChatRoom,
  SERVICE_COLORS,
  DEFAULT_ICEBREAKERS,
  type Conversation,
  type Message,
  type ServiceSource,
  type ConversationParticipant,
  type TypingState,
  type IcebreakerPrompt,
  type SpecialCard,
  type MatchCard,
  type ProductCard,
  type ProjectCard,
} from "./components/chat";

// ── Notification Components ─────────────────────────────────────────────────
export {
  NotificationProvider,
  useNotifications,
  NotificationCenter,
  ToastNotification,
  NotificationBadge,
  NOTIFICATION_CONFIG,
  SERVICE_NOTIFICATION_COLORS,
  type ToastItem,
  type NotificationItem,
  type NotificationAction,
  type NotificationPriority,
} from "./components/notifications";
