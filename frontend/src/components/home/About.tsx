import { motion } from "framer-motion";

export default function About() {
  return (
    <section
      id="about"
      className="relative overflow-hidden bg-white py-24 sm:py-28 lg:py-32"
    >
      {/* Subtle background texture */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute left-1/2 top-0 h-px w-[70%] -translate-x-1/2 bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
      </div>

      <div className="mx-auto max-w-3xl px-5 sm:px-8">
        {/* Eyebrow */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className="mb-5 text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-600/80 sm:text-xs"
        >
          About SaferPath
        </motion.p>

        {/* Main headline */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.55, delay: 0.05 }}
          className="text-center text-2xl font-semibold leading-snug tracking-tight text-slate-900 sm:text-3xl lg:text-[2.1rem]"
        >
          A journey is more than getting from A to B.
        </motion.h2>

        {/* Body text */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.55, delay: 0.12 }}
          className="mx-auto mt-6 max-w-2xl text-center text-[15px] leading-relaxed text-slate-500 sm:text-base sm:leading-relaxed lg:text-[17px] lg:leading-relaxed"
        >
          SaferPath adds useful safety context to everyday route planning. It
          helps you understand factors such as lighting, activity, help points,
          reports, and route conditions that can change with the time you travel.
          The goal is simple: give you more context so you can make a more
          informed decision about your journey.
        </motion.p>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-8 text-center text-[13px] font-medium tracking-wide text-slate-400 sm:text-sm"
        >
          Time-aware&ensp;·&ensp;Evidence-based&ensp;·&ensp;User-controlled.
        </motion.p>
      </div>

      {/* Bottom divider */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0" aria-hidden="true">
        <div className="mx-auto h-px w-[70%] bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
      </div>
    </section>
  );
}
