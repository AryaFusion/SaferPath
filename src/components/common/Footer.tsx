import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-16 border-t border-stone-200 bg-[#FAFAF8] py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-4 text-center sm:text-left">
        <div className="space-y-1">
          <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700">
            Safety boundary
          </h4>
          <p className="text-xs text-stone-500 leading-relaxed max-w-3xl">
            SaferPath does not guarantee safety, predict crime, or replace emergency services. It shares context and evidence so you can make your own decision.
          </p>
        </div>

        <div className="pt-4 border-t border-stone-200/60 flex flex-col sm:flex-row items-center justify-between text-[11px] text-stone-400 gap-2">
          <span>Team Ignited · CX1002 · CODEX 2026</span>
          <div className="flex items-center gap-4">
            <span className="hover:text-stone-600 transition-colors">Safety Context Engine</span>
            <span>•</span>
            <span className="hover:text-stone-600 transition-colors">Privacy First</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
