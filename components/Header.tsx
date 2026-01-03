import React from 'react';
import { FileEdit, Sparkles } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-white/20 shadow-sm supports-[backdrop-filter]:bg-white/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center gap-4">
            <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl blur opacity-40 group-hover:opacity-60 transition-opacity duration-500"></div>
                <div className="relative bg-gradient-to-br from-indigo-600 to-violet-700 p-2.5 rounded-2xl shadow-xl shadow-indigo-200 ring-1 ring-white/20">
                  <FileEdit className="w-6 h-6 text-white" />
                </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 via-indigo-800 to-slate-800 bg-clip-text text-transparent tracking-tight">
                Latex Builder
              </h1>
              <p className="text-xs text-slate-500 font-semibold tracking-wider uppercase flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                Powered by Gemini
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <div className="hidden sm:flex flex-col items-end mr-2">
                <span className="text-xs font-bold text-slate-700">Yuta Education</span>
                <span className="text-[10px] text-slate-400 font-medium">Standardized Exams</span>
             </div>
             <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-b from-white to-slate-50 border border-indigo-100 shadow-sm shadow-indigo-100/50">
                <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span className="text-sm font-bold text-slate-700">Pro</span>
             </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;