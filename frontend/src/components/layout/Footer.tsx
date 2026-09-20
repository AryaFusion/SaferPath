import { motion } from "framer-motion";

const footerLinks = [
  { label: "How It Works", href: "#how-it-works" },
  { label: "About", href: "#about" },
  { label: "Login", href: "/login" },
  { label: "Privacy", href: "/privacy" },
  { label: "Accessibility", href: "/accessibility" },
];

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-[#0a0e1a] text-slate-400">
      {/* Top edge highlight */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/25 to-transparent" />

      <div className="mx-auto max-w-6xl px-5 sm:px-8 lg:px-10">
        {/* Main footer content */}
        <div className="flex flex-col items-center gap-10 py-14 sm:py-16 md:flex-row md:items-start md:justify-between md:gap-8">
          {/* Brand column */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center md:items-start"
          >
            {/* Logo mark + name */}
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.07]">
                <svg
                  viewBox="0 0 36 36"
                  className="h-5 w-5"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M8 27C11 22 12 18 16 14C19 11 22 10 28 9"
                    stroke="white"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M19 23C22 19 24 16 28 14"
                    stroke="white"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  <circle cx="8" cy="27" r="2" fill="white" />
                </svg>
              </div>
              <span className="text-[15px] font-semibold tracking-tight text-white">
                SaferPath
              </span>
            </div>

            <p className="mt-3 max-w-[260px] text-center text-[13px] leading-relaxed text-slate-500 md:text-left">
              Context-aware route planning that adapts to the time you travel.
            </p>
          </motion.div>

          {/* Links */}
          <motion.nav
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.08 }}
            aria-label="Footer navigation"
            className="flex flex-wrap justify-center gap-x-7 gap-y-3 md:gap-x-8"
          >
            {footerLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-[13px] font-medium text-slate-500 transition-colors duration-200 hover:text-white"
              >
                {link.label}
              </a>
            ))}
          </motion.nav>
        </div>

        {/* Divider */}
        <div className="h-px bg-white/[0.06]" />

        {/* Copyright */}
        <div className="py-6">
          <p className="text-center text-[12px] text-slate-600">
            &copy; 2026 SaferPath
          </p>
        </div>
      </div>
    </footer>
  );
}
