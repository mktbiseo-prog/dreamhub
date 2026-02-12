import { Bell } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-5 py-4 backdrop-blur-xl bg-gray-950/80 border-b border-white/5">
      <h1 className="text-xl font-bold bg-gradient-to-r from-brand-400 to-blue-400 bg-clip-text text-transparent">
        Dream Brain
      </h1>
      <button
        type="button"
        className="relative flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-white/10"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5 text-gray-400" />
        <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-brand-500" />
      </button>
    </header>
  );
}
