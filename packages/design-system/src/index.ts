// ---------------------------------------------------------------------------
// @dreamhub/design-system — Public API
// ---------------------------------------------------------------------------

// Utility
export { cn } from "./lib/utils";

// Components
export { Button, buttonVariants } from "./components/Button";
export type { ButtonProps } from "./components/Button";

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  cardVariants,
} from "./components/Card";
export type { CardProps } from "./components/Card";

export { Input } from "./components/Input";
export type { InputProps } from "./components/Input";

export { Avatar, avatarVariants } from "./components/Avatar";
export type { AvatarProps } from "./components/Avatar";

export { MobileNav, DesktopNav } from "./components/Navigation";
export type {
  NavItem,
  MobileNavProps,
  DesktopNavProps,
} from "./components/Navigation";

export { ToastProvider, useToast } from "./components/Toast";
export type {
  ToastVariant,
  ToastData,
  ToastOptions,
} from "./components/Toast";

export { SkeletonLoader, skeletonVariants } from "./components/SkeletonLoader";
export type { SkeletonLoaderProps } from "./components/SkeletonLoader";

export { Badge, badgeVariants } from "./components/Badge";
export type { BadgeProps } from "./components/Badge";

export { ThemeProvider, useTheme } from "./components/ThemeProvider";
export type {
  Theme,
  ServiceTheme,
  ThemeContextValue,
  ThemeProviderProps,
} from "./components/ThemeProvider";
