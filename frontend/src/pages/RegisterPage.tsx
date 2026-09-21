import { useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, ArrowLeft, AlertCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface RegisterError {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    home: "",
    work: "",
    college: ""
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<RegisterError>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(false);

  const validate = (data: typeof form): RegisterError => {
    const errs: RegisterError = {};
    if (!data.email.trim()) {
      errs.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errs.email = "Enter a valid email address.";
    }
    
    if (!data.password) {
      errs.password = "Password is required.";
    } else if (data.password.length < 8) {
      errs.password = "Use at least 8 characters.";
    }
    
    if (data.password !== data.confirmPassword) {
      errs.confirmPassword = "Passwords do not match.";
    }
    
    return errs;
  };

  const handleBlur = (field: string) => {
    setTouched((t) => ({ ...t, [field]: true }));
    setErrors(validate(form));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (touched[name]) {
      setErrors(validate({ ...form, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const allTouched = Object.keys(form).reduce((acc, key) => ({ ...acc, [key]: true }), {});
    setTouched(allTouched);
    
    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setIsLoading(true);
    // Prototype loading
    await new Promise((r) => setTimeout(r, 800));
    setIsLoading(false);
    
    register({
      name: form.name,
      email: form.email,
      phone: form.phone,
      home: form.home,
      work: form.work,
      college: form.college
    });
    
    navigate("/home");
  };

  return (
    <div className="min-h-screen bg-[#f8faf9] flex flex-col">
      {/* ── Top bar ── */}
      <header className="flex items-center justify-between px-5 py-5 sm:px-10">
        <Link to="/" className="flex items-center gap-2.5" aria-label="SaferPath home">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900">
            <svg viewBox="0 0 36 36" className="h-6 w-6" fill="none" aria-hidden="true">
              <path d="M8 27C11 22 12 18 16 14C19 11 22 10 28 9" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M19 23C22 19 24 16 28 14" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="8" cy="27" r="2" fill="white" />
            </svg>
          </div>
          <span className="text-[17px] font-semibold tracking-tight text-slate-900">SaferPath</span>
        </Link>
        <Link to="/login" className="flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900">
          <ArrowLeft className="h-4 w-4" /> Back to login
        </Link>
      </header>

      {/* ── Main content ── */}
      <main className="flex flex-1 items-center justify-center px-5 py-8 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="w-full max-w-[500px]"
        >
          <div className="rounded-2xl border border-slate-200/80 bg-white px-8 py-10 shadow-sm sm:px-10">
            <div className="mb-8 text-center sm:text-left">
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                Create your SaferPath account
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                Set up your account to plan journeys, manage preferences, and use SaferPath features.
              </p>
            </div>

            <form onSubmit={handleSubmit} noValidate className="space-y-8">
              
              {/* SECTION: YOUR DETAILS */}
              <div>
                <h2 className="mb-4 text-[11px] font-bold uppercase tracking-wider text-slate-400">Your Details</h2>
                <div className="space-y-4">
                  {/* Name */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">Full name <span className="text-slate-400 font-normal">(Optional)</span></label>
                    <input
                      name="name" type="text" autoComplete="name" value={form.name}
                      onChange={handleChange} onBlur={() => handleBlur("name")}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-2.5 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-900/10"
                    />
                  </div>
                  
                  {/* Email */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">Email address *</label>
                    <input
                      name="email" type="email" autoComplete="email" value={form.email}
                      onChange={handleChange} onBlur={() => handleBlur("email")}
                      className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-slate-900/10 ${errors.email && touched.email ? "border-red-300 bg-red-50 focus:border-red-400" : "border-slate-200 bg-slate-50/60 focus:border-slate-400"}`}
                    />
                    {errors.email && touched.email && <p className="mt-1 flex items-center gap-1 text-xs font-medium text-red-600"><AlertCircle className="h-3.5 w-3.5" />{errors.email}</p>}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">Phone number <span className="text-slate-400 font-normal">(Optional)</span></label>
                    <input
                      name="phone" type="tel" autoComplete="tel" value={form.phone}
                      onChange={handleChange} onBlur={() => handleBlur("phone")}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-2.5 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-900/10"
                    />
                  </div>

                  {/* Password */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-700">Password *</label>
                      <div className="relative">
                        <input
                          name="password" type={showPassword ? "text" : "password"} autoComplete="new-password" value={form.password}
                          onChange={handleChange} onBlur={() => handleBlur("password")}
                          className={`w-full rounded-xl border px-4 py-2.5 pr-10 text-sm outline-none focus:ring-2 focus:ring-slate-900/10 ${errors.password && touched.password ? "border-red-300 bg-red-50 focus:border-red-400" : "border-slate-200 bg-slate-50/60 focus:border-slate-400"}`}
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {errors.password && touched.password && <p className="mt-1 flex items-center gap-1 text-xs font-medium text-red-600"><AlertCircle className="h-3.5 w-3.5 shrink-0" />{errors.password}</p>}
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-700">Confirm password *</label>
                      <div className="relative">
                        <input
                          name="confirmPassword" type={showPassword ? "text" : "password"} autoComplete="new-password" value={form.confirmPassword}
                          onChange={handleChange} onBlur={() => handleBlur("confirmPassword")}
                          className={`w-full rounded-xl border px-4 py-2.5 pr-10 text-sm outline-none focus:ring-2 focus:ring-slate-900/10 ${errors.confirmPassword && touched.confirmPassword ? "border-red-300 bg-red-50 focus:border-red-400" : "border-slate-200 bg-slate-50/60 focus:border-slate-400"}`}
                        />
                      </div>
                      {errors.confirmPassword && touched.confirmPassword && <p className="mt-1 flex items-center gap-1 text-xs font-medium text-red-600"><AlertCircle className="h-3.5 w-3.5 shrink-0" />{errors.confirmPassword}</p>}
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION: OPTIONAL DETAILS */}
              <div className="border-t border-slate-100 pt-8">
                <h2 className="mb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">Personalize Your Experience (Optional)</h2>
                <p className="mb-4 text-xs text-slate-500">You can add these details now or later from your Profile.</p>
                
                <div className="space-y-4">
                  <div>
                    <div className="mb-1.5 flex items-end justify-between">
                      <label className="block text-sm font-medium text-slate-700">Home</label>
                      <span className="text-[11px] text-slate-400">Useful for frequently planned journeys</span>
                    </div>
                    <input name="home" type="text" value={form.home} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-2.5 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-900/10" />
                  </div>
                  
                  <div>
                    <div className="mb-1.5 flex items-end justify-between">
                      <label className="block text-sm font-medium text-slate-700">Work</label>
                      <span className="text-[11px] text-slate-400">Useful for quickly planning regular journeys</span>
                    </div>
                    <input name="work" type="text" value={form.work} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-2.5 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-900/10" />
                  </div>

                  <div>
                    <div className="mb-1.5 flex items-end justify-between">
                      <label className="block text-sm font-medium text-slate-700">College</label>
                      <span className="text-[11px] text-slate-400">Useful for quickly planning regular journeys</span>
                    </div>
                    <input name="college" type="text" value={form.college} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-2.5 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-900/10" />
                  </div>
                </div>
              </div>
              
              {/* Privacy & Trusted Contact */}
              <div className="rounded-xl bg-slate-50 p-4">
                <h4 className="text-sm font-semibold text-slate-900">Set up a trusted contact later</h4>
                <p className="mt-1 text-xs text-slate-600">
                  You can add a trusted contact from your Profile before using journey check-in.
                </p>
                <hr className="my-3 border-slate-200" />
                <p className="text-[11px] leading-relaxed text-slate-500">
                  By creating an account, you agree to SaferPath's Terms and Privacy Policy. <strong className="font-medium text-slate-700">You can use route planning without sharing your home, workplace, college, contacts, or continuous location.</strong>
                </p>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-emerald-700 disabled:opacity-60"
              >
                {isLoading ? "Creating account…" : "Create account"}
              </button>
            </form>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
