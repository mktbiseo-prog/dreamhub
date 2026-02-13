/** Request permission for browser notifications. Returns true if granted. */
export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return false;
  }
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;

  const result = await Notification.requestPermission();
  return result === "granted";
}

/** Show a browser notification (only when tab is not focused). */
export function showBrowserNotification(
  title: string,
  options?: { body?: string; icon?: string; tag?: string }
): void {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission !== "granted") return;

  // Only show browser notification when the page is hidden
  if (!document.hidden) return;

  const notification = new Notification(title, {
    body: options?.body,
    icon: options?.icon ?? "/favicon.ico",
    tag: options?.tag,
  });

  notification.onclick = () => {
    window.focus();
    notification.close();
  };
}
