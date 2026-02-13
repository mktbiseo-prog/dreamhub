"use client";

import {
  Brain,
  CalendarDays,
  ShoppingBag,
  MapPin,
  Coffee,
} from "lucide-react";

interface ServiceCard {
  name: string;
  description: string;
  icon: typeof Brain;
  status: "active" | "coming_soon";
  href?: string;
  gradient: string;
}

const services: ServiceCard[] = [
  {
    name: "Dream Brain",
    description: "Your AI-powered second brain. Capture, connect, and discover thoughts.",
    icon: Brain,
    status: "active",
    href: "/",
    gradient: "from-brand-500/20 to-blue-500/20",
  },
  {
    name: "Dream Planner",
    description: "Plan your dreams with AI-guided milestones and task management.",
    icon: CalendarDays,
    status: "coming_soon",
    gradient: "from-emerald-500/20 to-teal-500/20",
  },
  {
    name: "Dream Store",
    description: "Support dreamers by purchasing their products and stories.",
    icon: ShoppingBag,
    status: "active",
    href: "/dream-store",
    gradient: "from-pink-500/20 to-rose-500/20",
  },
  {
    name: "Dream Place",
    description: "Find your dream collaborators through AI-powered matching.",
    icon: MapPin,
    status: "coming_soon",
    gradient: "from-amber-500/20 to-orange-500/20",
  },
  {
    name: "Dream Cafe",
    description: "Book a creative workspace and network with fellow dreamers.",
    icon: Coffee,
    status: "coming_soon",
    gradient: "from-yellow-500/20 to-amber-500/20",
  },
];

interface HubGatewayViewProps {
  userName: string | null;
  userEmail: string;
}

export function HubGatewayView({ userName, userEmail }: HubGatewayViewProps) {
  const initial = (userName || userEmail || "U").charAt(0).toUpperCase();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-lg font-bold text-gray-100">Dream Hub</h1>
        <p className="mt-1 text-sm text-gray-500">
          Your gateway to the Dream ecosystem
        </p>
      </div>

      {/* Service Cards */}
      <div className="flex flex-col gap-3">
        {services.map((service) => {
          const Icon = service.icon;
          const isActive = service.status === "active";
          const Wrapper = isActive && service.href ? "a" : "div";

          return (
            <Wrapper
              key={service.name}
              {...(isActive && service.href ? { href: service.href } : {})}
              className={`group rounded-2xl border p-4 transition-all ${
                isActive
                  ? "border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/10 cursor-pointer"
                  : "border-white/[0.04] bg-white/[0.02] opacity-60"
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${service.gradient}`}
                >
                  <Icon className="h-6 w-6 text-gray-200" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-gray-100">
                      {service.name}
                    </h3>
                    <span
                      className={`rounded-md px-2 py-0.5 text-[10px] font-medium ${
                        isActive
                          ? "bg-emerald-500/15 text-emerald-400"
                          : "bg-white/[0.06] text-gray-500"
                      }`}
                    >
                      {isActive ? "Active" : "Coming Soon"}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-gray-400 leading-relaxed">
                    {service.description}
                  </p>
                </div>
              </div>
            </Wrapper>
          );
        })}
      </div>

      {/* Dream ID Card */}
      <div className="rounded-2xl border border-brand-500/20 bg-gradient-to-br from-brand-500/10 to-blue-500/10 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-blue-500 text-base font-bold text-white">
            {initial}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-brand-300">Dream ID</p>
            <p className="text-sm font-semibold text-gray-100 truncate">
              {userName || "Anonymous Dreamer"}
            </p>
            <p className="text-xs text-gray-500 truncate">{userEmail}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
