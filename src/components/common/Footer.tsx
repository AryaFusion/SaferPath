import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-20 border-t border-[#e5dfd5] bg-[#faf8f5] py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-4 text-left">
        <div className="space-y-1">
          <h2 className="text-xs font-bold uppercase tracking-wider text-stone-700">
            Safety Boundary & Product Statement
          </h2>
          <p className="text-xs text-stone-600 leading-relaxed">
            SaferPath does not guarantee safety, predict crime, or replace emergency services. It shares verified physical evidence, lighting context, and active pedestrian observations so you can make your own informed decision.
          </p>
        </div>

        <div className="pt-4 border-t border-[#e5dfd5]/60 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-stone-500 gap-2">
          <span>Team Ignited · CX1002 · CODEX 2026</span>
          <div className="flex items-center gap-4">
            <span>Time-Aware Context Engine</span>
            <span>•</span>
            <span>Privacy First Data Architecture</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
