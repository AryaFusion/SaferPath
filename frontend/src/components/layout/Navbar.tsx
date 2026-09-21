import { useState } from "react";
import { Menu, X } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const navLinks = [
  { label: "How It Works", href: "#how-it-works" },
  { label: "About", href: "#about" },
];

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated } = useAuth();

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-x-0 top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
      <nav
        className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10"
        aria-label="Main navigation"
      >
        {/* Logo */}
        <a
          href="#home"
          onClick={closeMenu}
          className="group flex items-center gap-2.5"
          aria-label="SaferPath home"
        >
          <div className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-slate-900">
            <svg
              viewBox="0 0 36 36"
              className="h-7 w-7"
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

          <span className="text-[17px] font-semibold tracking-tight text-slate-900">
            SaferPath
          </span>
        </a>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm font-medium text-slate-600 transition-colors duration-200 hover:text-slate-950"
            >
              {link.label}
            </a>
          ))}

          {isAuthenticated ? (
            <Link
              to="/home"
              className="rounded-full bg-emerald-700 px-5 py-2 text-sm font-medium text-white transition-all duration-200 hover:bg-emerald-800 hover:shadow-md"
            >
              Open App
            </Link>
          ) : (
            <Link
              to="/login"
              className="rounded-full bg-slate-900 px-5 py-2 text-sm font-medium text-white transition-all duration-200 hover:bg-slate-800 hover:shadow-md"
            >
              Login
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={() => setIsMenuOpen((open) => !open)}
          className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-700 transition-colors hover:bg-slate-100 md:hidden"
          aria-label={
            isMenuOpen ? "Close navigation menu" : "Open navigation menu"
          }
          aria-expanded={isMenuOpen}
          aria-controls="mobile-navigation"
        >
          {isMenuOpen ? (
            <X size={21} strokeWidth={2} />
          ) : (
            <Menu size={21} strokeWidth={2} />
          )}
        </button>
      </nav>

      {/* Mobile Navigation */}
      <div
        id="mobile-navigation"
        className={`overflow-hidden border-t border-slate-200 bg-white transition-all duration-200 md:hidden ${
          isMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="mx-auto flex max-w-7xl flex-col px-5 py-4 sm:px-8">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={closeMenu}
              className="rounded-xl px-3 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-950"
            >
              {link.label}
            </a>
          ))}

          {isAuthenticated ? (
            <Link
              to="/home"
              onClick={closeMenu}
              className="mt-3 rounded-xl bg-emerald-700 px-3 py-3 text-center text-sm font-medium text-white transition-colors hover:bg-emerald-800"
            >
              Open App
            </Link>
          ) : (
            <Link
              to="/login"
              onClick={closeMenu}
              className="mt-3 rounded-xl bg-slate-900 px-3 py-3 text-center text-sm font-medium text-white transition-colors hover:bg-slate-800"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </motion.header>
  );
}