import React from 'react';
import { FileEdit, Sparkles, HelpCircle } from 'lucide-react';

interface HeaderProps {
  onOpenReadme?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onOpenReadme }) => {
  return (
    <header className="sticky top-0 z-50 bg-[#ffffff] border-b-4 border-black shadow-[0_8px_0_0_rgba(0,0,0,1)] hover:shadow-none transition-shadow duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center gap-4 group cursor-pointer" onClick={onOpenReadme}>
            <div className="relative group">
                <div className="relative bg-[#FF5E5B] border-4 border-black p-2.5 rounded-none shadow-[4px_4px_0_0_rgba(0,0,0,1)] group-hover:translate-x-1 group-hover:translate-y-1 group-hover:-ml-1 group-hover:-mt-1 group-hover:shadow-none transition-all">
                  <FileEdit className="w-6 h-6 text-black stroke-[3]" />
                </div>
            </div>
            <div>
              <h1 className="text-2xl font-black text-black tracking-widest uppercase">
                Yuta<span className="text-[#00CECB]">!</span>LaTeX Math
              </h1>
              <p className="text-[10px] text-black font-black tracking-widest uppercase flex items-center gap-1">
                <span className="w-2 h-2 border-2 border-black rounded-none bg-[#A3E635]"></span>
                Soạn Thảo & Tự Động Hóa Toán Học
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <button 
                onClick={onOpenReadme}
                className="flex items-center gap-2 px-4 py-2 bg-[#00CECB] text-black font-black uppercase text-xs tracking-wider border-4 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all cursor-pointer"
             >
                <HelpCircle className="w-4 h-4 stroke-[3]" />
                <span className="hidden sm:inline">Hướng Dẫn</span> README
             </button>

             <div className="hidden sm:flex flex-col items-end mr-2">
                <span className="text-xs font-black text-black uppercase tracking-widest">Yuta Education</span>
                <span className="text-[10px] text-black font-bold uppercase border-b-2 border-black">Toán Học & Manim</span>
             </div>
             <div className="flex items-center gap-2 px-4 py-2 rounded-none bg-[#FFED66] border-4 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
                <Sparkles className="w-4 h-4 text-black stroke-[3]" />
                <span className="text-sm font-black text-black uppercase">Pro</span>
             </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;