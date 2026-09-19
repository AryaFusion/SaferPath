import React from "react";
import { useSafety } from "../../context/SafetyContext";
import type { AppRoute } from "../../lib/routes";
import {
  MapPin,
  FileText,
  MapPinned,
  ClipboardList,
  Navigation,
  Bookmark,
  Settings,
  ShieldCheck,
  Shield,
} from "lucide-react";

export const Sidebar: React.FC = () => {
  const { tab, setTab } = useSafety();

  const mainNavItems: {
    path: AppRoute;
    label: string;
    icon: React.ReactNode;
  }[] = [
    {
      path: "/route",
      label: "Plan a route",
      icon: <MapPin className="w-4 h-4" />,
    },
    {
      path: "/evidence",
      label: "Evidence",
      icon: <FileText className="w-4 h-4" />,
    },
    {
      path: "/help",
      label: "Help nearby",
      icon: <MapPinned className="w-4 h-4" />,
    },
    {
      path: "/reports",
      label: "Reports",
      icon: <ClipboardList className="w-4 h-4" />,
    },
    {
      path: "/trip",
      label: "Active trip",
      icon: <Navigation className="w-4 h-4" />,
    },
  ];

  const secondaryNavItems: {
    path: AppRoute;
    label: string;
    icon: React.ReactNode;
  }[] = [
    {
      path: "/saved-places",
      label: "Saved places",
      icon: <Bookmark className="w-4 h-4" />,
    },
    {
      path: "/settings",
      label: "Settings",
      icon: <Settings className="w-4 h-4" />,
    },
    {
      path: "/privacy",
      label: "Privacy",
      icon: <ShieldCheck className="w-4 h-4" />,
    },
    {
      path: "/landing",
      label: "About SaferPath",
      icon: <Shield className="w-4 h-4" />,
    },
  ];

  return (
    <aside className="w-56 bg-[#F5F7FB] border-r border-[#DCE3EE] flex flex-col justify-between p-3.5 min-h-screen shrink-0 hidden md:flex">
      {/* Top Brand Logo & Navigation */}
      <div className="space-y-5">
        <button
          onClick={() => setTab("/route")}
          className="flex items-center gap-2.5 px-2 py-1 text-left cursor-pointer group rounded-md focus-visible-ring"
        >
          <div className="w-6 h-6 rounded-md bg-[#2563EB] text-white flex items-center justify-center font-bold text-xs shrink-0">
            <Shield className="w-3.5 h-3.5" />
          </div>
          <div className="flex flex-col justify-center">
            <span className="text-sm font-bold text-[#172033] tracking-tight block leading-tight">
              SaferPath
            </span>
            <span className="text-[11px] text-[#64748B] font-medium block leading-none mt-0.5">
              Mobility context
            </span>
          </div>
        </button>

        {/* Primary Navigation */}
        <nav className="space-y-0.5" aria-label="Sidebar Navigation">
          {mainNavItems.map((item) => {
            const isActive = tab === item.path;
            return (
              <button
                key={item.path}
                onClick={() => setTab(item.path)}
                className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-xs font-medium transition-colors cursor-pointer text-left focus-visible-ring ${
                  isActive
                    ? "bg-[#EFF6FF] text-[#2563EB] font-semibold border-l-2 border-[#2563EB]"
                    : "text-[#64748B] hover:text-[#172033] hover:bg-[#F7FAFF]"
                }`}
              >
                <span
                  className={`shrink-0 flex items-center justify-center ${isActive ? "text-[#2563EB]" : "text-[#64748B]"}`}
                >
                  {item.icon}
                </span>
                <span className="inline-flex items-center leading-none">
                  {item.label}
                </span>
              </button>
            );
          })}

          <div className="my-2.5 border-t border-[#DCE3EE]" />

          {secondaryNavItems.map((item) => {
            const isActive = tab === item.path;
            return (
              <button
                key={item.path}
                onClick={() => setTab(item.path)}
                className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-xs font-medium transition-colors cursor-pointer text-left focus-visible-ring ${
                  isActive
                    ? "bg-[#EFF6FF] text-[#2563EB] font-semibold border-l-2 border-[#2563EB]"
                    : "text-[#64748B] hover:text-[#172033] hover:bg-[#F7FAFF]"
                }`}
              >
                <span
                  className={`shrink-0 flex items-center justify-center ${isActive ? "text-[#2563EB]" : "text-[#64748B]"}`}
                >
                  {item.icon}
                </span>
                <span className="inline-flex items-center leading-none">
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Info Box */}
      <div className="border-t border-[#DCE3EE] pt-3 text-[11px] text-[#64748B] space-y-0.5">
        <div className="font-semibold text-[#172033]">SaferPath v1.0</div>
        <div>Contextual pedestrian telemetry</div>
      </div>
    </aside>
  );
};

export default Sidebar;
