import React from 'react';
import { FileEdit, Sparkles } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-20 backdrop-blur-md bg-white/70 border-b border-white/50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-indigo-600 to-violet-600 p-2 rounded-xl shadow-lg shadow-indigo-200">
              <FileEdit className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                Soạn đề Latex cùng Yuta
              </h1>
              <p className="text-xs text-slate-500 font-medium tracking-wide">AI Powered Exam Builder</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/50 border border-indigo-100 shadow-sm backdrop-blur-sm">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-semibold text-slate-600">Pro Version</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;