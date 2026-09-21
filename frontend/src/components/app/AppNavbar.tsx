import { motion, AnimatePresence } from "framer-motion";
import {
  Home, Map, FileText, LifeBuoy, Settings, Menu, Bell, X,
  User, Lock, Accessibility, Info, PhoneCall, LogOut, ChevronRight, Settings2,
} from "lucide-react";
import { useLocation, Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";

const navItems = [
  { label: "Home", href: "/home", icon: Home },
  { label: "Trips", href: "/trips", icon: Map },
  { label: "Reports", href: "/reports", icon: FileText },
  { label: "Help Nearby", href: "/help", icon: LifeBuoy },
  { label: "Settings", href: "/settings", icon: Settings },
];

const menuItems = [
  { label: "Profile / Personal Details", icon: User },
  { label: "Notifications", icon: Bell },
  { label: "Privacy", icon: Lock },
  { label: "Accessibility", icon: Accessibility },
  { label: "About SaferPath", icon: Info },
  { label: "Support & Emergency Info", icon: PhoneCall },
];

function SaferPathLogo({ size = "md" }: { size?: "sm" | "md" }) {
  const boxSize = size === "sm" ? "h-7 w-7 rounded-md" : "h-8 w-8 rounded-lg";
  const svgSize = size === "sm" ? "h-4 w-4" : "h-5 w-5";
  return (
    <div className={`flex items-center justify-center bg-emerald-700 ${boxSize}`}>
      <svg viewBox="0 0 36 36" className={svgSize} fill="none" aria-hidden="true">
        <path d="M8 27C11 22 12 18 16 14C19 11 22 10 28 9" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M19 23C22 19 24 16 28 14" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="8" cy="27" r="2" fill="white" />
      </svg>
    </div>
  );
}

export default function AppNavbar() {
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);
  const avatarRef = useRef<HTMLDivElement>(null);

  // Close avatar menu on click-outside or Escape
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) {
        setAvatarMenuOpen(false);
      }
    }
    function keyHandler(e: KeyboardEvent) {
      if (e.key === "Escape") setAvatarMenuOpen(false);
    }
    document.addEventListener("mousedown", handler);
    document.addEventListener("keydown", keyHandler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("keydown", keyHandler);
    };
  }, []);

  return (
    <>
      {/* ─── Desktop Top Navigation ─── */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="fixed inset-x-0 top-0 z-50 hidden border-b border-slate-200/80 bg-white/95 backdrop-blur-md md:block"
      >
        <nav
          className="mx-auto flex h-14 max-w-[1360px] items-center justify-between px-6 lg:px-10"
          aria-label="Product navigation"
        >
          <div className="flex items-center gap-10">
            <Link to="/home" className="flex items-center gap-2.5" aria-label="SaferPath home">
              <SaferPathLogo />
              <span className="text-[16px] font-bold tracking-tight text-slate-900">SaferPath</span>
            </Link>
            <div className="flex items-center gap-6 lg:gap-8">
              {navItems.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.label}
                    to={item.href}
                    className={`text-[13px] font-semibold transition-colors duration-150 ${
                      isActive ? "text-emerald-700" : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
          {/* Desktop: Bell + Avatar with dropdown */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setNotifOpen(true)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
              aria-label="Notifications"
            >
              <Bell className="h-4.5 w-4.5" />
            </button>
            {/* Avatar + dropdown */}
            <div className="relative" ref={avatarRef}>
              <button
                onClick={() => setAvatarMenuOpen((o) => !o)}
                aria-label="Account menu"
                aria-expanded={avatarMenuOpen}
                className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-emerald-100 text-emerald-700 ring-2 ring-emerald-200 transition-all hover:ring-emerald-400 focus:outline-none focus:ring-emerald-500"
              >
                <span className="text-xs font-bold">A</span>
              </button>
              <AnimatePresence>
                {avatarMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-[calc(100%+8px)] z-30 w-52 rounded-2xl border border-slate-200 bg-white py-2 shadow-xl"
                  >
                    <div className="border-b border-slate-100 px-4 py-3">
                      <p className="text-sm font-semibold text-slate-900">Arya</p>
                      <p className="text-xs text-slate-500">arya@example.com</p>
                    </div>
                    {[
                      { label: "Personal Details", icon: User },
                      { label: "Settings", icon: Settings2 },
                      { label: "Privacy", icon: Lock },
                      { label: "Accessibility", icon: Accessibility },
                    ].map((item) => (
                      <button key={item.label} className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50">
                        <item.icon className="h-4 w-4 text-slate-400" />
                        {item.label}
                      </button>
                    ))}
                    <div className="mt-1 border-t border-slate-100 pt-1">
                      <button className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50">
                        <LogOut className="h-4 w-4" />
                        Log out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </nav>
      </motion.header>

      {/* ─── Mobile Top Bar ─── */}
      <div className="fixed inset-x-0 top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur-md md:hidden">
        <div className="flex h-14 items-center justify-between px-4">
          {/* Hamburger → account drawer */}
          <button
            onClick={() => setDrawerOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100"
            aria-label="Account menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Logo */}
          <Link to="/home" className="flex items-center gap-2" aria-label="SaferPath home">
            <SaferPathLogo size="sm" />
            <span className="text-[15px] font-bold tracking-tight text-slate-900">SaferPath</span>
          </Link>

          {/* Bell */}
          <button
            onClick={() => setNotifOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* ─── Mobile Bottom Tab Bar ─── */}
      <motion.nav
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200/80 bg-white/95 pb-safe backdrop-blur-md md:hidden"
        aria-label="Mobile navigation"
      >
        <div className="flex h-16 items-center justify-around px-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.label}
                to={item.href}
                className={`flex flex-col items-center justify-center gap-0.5 rounded-lg px-2 py-1.5 ${
                  isActive ? "text-emerald-700" : "text-slate-400"
                }`}
              >
                <item.icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 1.8} />
                <span className={`text-[10px] font-semibold ${isActive ? "text-emerald-700" : "text-slate-400"}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </motion.nav>

      {/* ─── Account Side Drawer (mobile hamburger) ─── */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
              className="fixed inset-0 z-[60] bg-slate-900/30 backdrop-blur-sm"
            />
            {/* Drawer */}
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 left-0 z-[70] flex w-72 flex-col bg-white shadow-xl"
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <div className="flex items-center gap-2.5">
                  <SaferPathLogo size="sm" />
                  <span className="text-[15px] font-bold tracking-tight text-slate-900">SaferPath</span>
                </div>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
                  aria-label="Close menu"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Profile pill */}
              <div className="mx-4 my-4 flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                  <span className="text-sm font-bold">A</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Arya</p>
                  <p className="text-xs text-slate-500">arya@example.com</p>
                </div>
              </div>

              {/* Menu items */}
              <nav className="flex-1 px-3">
                {menuItems.map((item) => (
                  <button
                    key={item.label}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50"
                  >
                    <item.icon className="h-4 w-4 shrink-0 text-slate-400" />
                    <span className="flex-1 font-medium">{item.label}</span>
                    <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
                  </button>
                ))}
              </nav>

              {/* Logout */}
              <div className="border-t border-slate-100 px-3 py-4">
                <button className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-red-600 transition-colors hover:bg-red-50">
                  <LogOut className="h-4 w-4 shrink-0" />
                  <span className="font-medium">Logout</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ─── Notification Panel ─── */}
      <AnimatePresence>
        {notifOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setNotifOpen(false)}
              className="fixed inset-0 z-[60] bg-slate-900/20"
            />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
              transition={{ duration: 0.18 }}
              className="fixed right-4 top-16 z-[70] w-80 rounded-2xl border border-slate-200 bg-white shadow-xl md:right-10 md:top-[60px]"
            >
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <h3 className="text-sm font-bold text-slate-900">Notifications</h3>
                <button
                  onClick={() => setNotifOpen(false)}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              {/* Empty state */}
              <div className="flex flex-col items-center justify-center px-5 py-12 text-center">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
                  <Bell className="h-5 w-5 text-slate-400" />
                </div>
                <p className="text-sm font-semibold text-slate-700">You're all caught up.</p>
                <p className="mt-1 text-xs text-slate-400">Journey reminders, active trip updates, and report notifications will appear here.</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
