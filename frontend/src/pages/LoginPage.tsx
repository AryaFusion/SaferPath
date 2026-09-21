import { useState, useId } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, ArrowLeft, AlertCircle, CheckCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface FieldError {
  email?: string;
  password?: string;
}

function validate(email: string, password: string): FieldError {
  const errors: FieldError = {};
  if (!email.trim()) {
    errors.email = "Email address is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Enter a valid email address.";
  }
  if (!password) {
    errors.password = "Password is required.";
  } else if (password.length < 6) {
    errors.password = "Password must be at least 6 characters.";
  }
  return errors;
}

export default function LoginPage() {
  const emailId = useId();
  const passwordId = useId();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FieldError>({});
  const [isLoading, setIsLoading] = useState(false);
  const [touched, setTouched] = useState({ email: false, password: false });
  const [view, setView] = useState<"login" | "forgot">("login");
  const [forgotSuccess, setForgotSuccess] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleBlur = (field: "email" | "password") => {
    setTouched((t) => ({ ...t, [field]: true }));
    const errs = validate(email, password);
    setErrors(errs);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ email: true, password: true });
    const errs = validate(email, password);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setIsLoading(true);
    // Prototype login simulation
    await new Promise((r) => setTimeout(r, 800));
    setIsLoading(false);
    
    login(email);
    navigate("/home");
  };

  return (
    <div className="min-h-screen bg-[#f8faf9] flex flex-col">
      {/* ── Top bar ── */}
      <header className="flex items-center justify-between px-5 py-5 sm:px-10">
        {/* Logo */}
        <a
          href="/"
          className="flex items-center gap-2.5"
          aria-label="SaferPath home"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900">
            <svg viewBox="0 0 36 36" className="h-6 w-6" fill="none" aria-hidden="true">
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

        {/* Back to site */}
        <Link
          to="/"
          className="flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to site
        </Link>
      </header>

      {/* ── Main content ── */}
      <main className="flex flex-1 items-center justify-center px-5 py-10 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="w-full max-w-[420px]"
        >
          <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white px-8 py-10 shadow-sm sm:px-10">
            <AnimatePresence mode="wait">
              {view === "login" ? (
                <motion.div
                  key="login"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Heading */}
                  <div className="mb-8">
                    <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-600">
                      Welcome back
                    </p>
                    <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                      Continue to SaferPath
                    </h1>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleSubmit} noValidate className="space-y-5">
                    {/* Email */}
                    <div>
                      <label htmlFor={emailId} className="mb-1.5 block text-sm font-medium text-slate-700">
                        Email address
                      </label>
                      <input
                        id={emailId}
                        type="email"
                        autoComplete="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (touched.email) {
                            setErrors((prev) => ({ ...prev, ...validate(e.target.value, password) }));
                          }
                        }}
                        onBlur={() => handleBlur("email")}
                        placeholder="you@example.com"
                        className={`w-full rounded-xl border px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-150 focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 ${
                          errors.email && touched.email ? "border-red-300 bg-red-50/40 focus:ring-red-200 focus:border-red-400" : "border-slate-200 bg-slate-50/60 hover:border-slate-300"
                        }`}
                      />
                      {errors.email && touched.email && (
                        <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-red-600">
                          <AlertCircle className="h-3.5 w-3.5 shrink-0" /> {errors.email}
                        </p>
                      )}
                    </div>

                    {/* Password */}
                    <div>
                      <div className="mb-1.5 flex items-center justify-between">
                        <label htmlFor={passwordId} className="text-sm font-medium text-slate-700">Password</label>
                        <button
                          type="button"
                          onClick={() => setView("forgot")}
                          className="text-xs font-medium text-slate-500 transition-colors hover:text-slate-900"
                        >
                          Forgot password?
                        </button>
                      </div>
                      <div className="relative">
                        <input
                          id={passwordId}
                          type={showPassword ? "text" : "password"}
                          autoComplete="current-password"
                          value={password}
                          onChange={(e) => {
                            setPassword(e.target.value);
                            if (touched.password) {
                              setErrors((prev) => ({ ...prev, ...validate(email, e.target.value) }));
                            }
                          }}
                          onBlur={() => handleBlur("password")}
                          placeholder="••••••••"
                          className={`w-full rounded-xl border px-4 py-2.5 pr-11 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-150 focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 ${
                            errors.password && touched.password ? "border-red-300 bg-red-50/40 focus:ring-red-200 focus:border-red-400" : "border-slate-200 bg-slate-50/60 hover:border-slate-300"
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-0.5 text-slate-400 hover:text-slate-700"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {errors.password && touched.password && (
                        <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-red-600">
                          <AlertCircle className="h-3.5 w-3.5 shrink-0" /> {errors.password}
                        </p>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="mt-1 w-full rounded-xl bg-slate-900 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-150 hover:bg-slate-800 disabled:opacity-60"
                    >
                      {isLoading ? "Signing in…" : "Login"}
                    </button>
                  </form>

                  <div className="my-6 flex items-center gap-3">
                    <div className="h-px flex-1 bg-slate-100" />
                    <span className="text-xs text-slate-400">or</span>
                    <div className="h-px flex-1 bg-slate-100" />
                  </div>

                  <p className="text-center text-sm text-slate-500">
                    Don&apos;t have an account?{" "}
                    <Link
                      to="/register"
                      className="font-semibold text-slate-900 underline-offset-2 transition-colors hover:text-emerald-700 hover:underline"
                    >
                      Create an account
                    </Link>
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="forgot"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="mb-6">
                    <button
                      onClick={() => { setView("login"); setForgotSuccess(false); }}
                      className="mb-4 flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" /> Back to login
                    </button>
                    <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Forgot your password?</h1>
                  </div>

                  {!forgotSuccess ? (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (email.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                          setForgotSuccess(true);
                        } else {
                          setErrors({ email: "Please enter a valid email." });
                          setTouched({ ...touched, email: true });
                        }
                      }}
                      className="space-y-5"
                    >
                      <p className="text-sm text-slate-500">Enter your email address and we will send you a link to reset your password.</p>
                      <div>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@example.com"
                          className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-2.5 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-900/10"
                        />
                        {errors.email && touched.email && view === "forgot" && (
                          <p className="mt-1.5 text-xs font-medium text-red-600">{errors.email}</p>
                        )}
                      </div>
                      <button
                        type="submit"
                        className="w-full rounded-xl bg-slate-900 py-2.5 text-sm font-semibold text-white transition-all hover:bg-slate-800"
                      >
                        Send reset link
                      </button>
                    </form>
                  ) : (
                    <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-5 text-center">
                      <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                        <CheckCircle className="h-5 w-5" />
                      </div>
                      <p className="text-sm font-medium text-slate-900">Link sent (Prototype)</p>
                      <p className="mt-1 text-xs text-slate-600">If this email is registered, password reset instructions would be sent here.</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Trust note */}
          <p className="mt-5 text-center text-[12px] text-slate-400">
            Your information stays under your control.
          </p>
        </motion.div>
      </main>

      {/* ── Footer strip ── */}
      <footer className="pb-6 text-center text-[11px] text-slate-400">
        &copy; 2026 SaferPath &mdash;{" "}
        <a href="/privacy" className="underline-offset-2 hover:underline">
          Privacy
        </a>{" "}
        &middot;{" "}
        <a href="/accessibility" className="underline-offset-2 hover:underline">
          Accessibility
        </a>
      </footer>
    </div>
  );
}
