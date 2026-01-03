import React, { useState } from 'react';
import { Copy, Check, ExternalLink, Bot, AlertCircle, Terminal, Sparkles, FileText } from 'lucide-react';
import { GenerationStatus } from '../types';

interface OutputDisplayProps {
  content: string;
  status: GenerationStatus;
  error?: string | null;
}

const OutputDisplay: React.FC<OutputDisplayProps> = ({ content, status, error }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (content) {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyAndOpenGemini = async () => {
    await handleCopy();
    window.open('https://gemini.google.com/app', '_blank');
  };

  if (status === GenerationStatus.IDLE) {
    return (
      <div className="h-full min-h-[600px] flex flex-col items-center justify-center bg-white/60 backdrop-blur-xl rounded-[2rem] border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-12 text-center relative overflow-hidden group transition-all duration-500 hover:shadow-[0_20px_40px_rgb(0,0,0,0.06)]">
        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/5 via-purple-500/5 to-pink-500/5 opacity-50 group-hover:opacity-100 transition-opacity duration-700"></div>
        
        <div className="relative z-10 bg-white p-6 rounded-3xl shadow-xl shadow-indigo-100 mb-8 border border-indigo-50 group-hover:scale-105 transition-transform duration-500">
            <div className="absolute -top-3 -right-3 animate-pulse">
                <Sparkles className="w-8 h-8 text-amber-400 fill-amber-400" />
            </div>
          <Bot className="w-16 h-16 text-indigo-600" />
        </div>
        <h3 className="relative z-10 text-2xl font-bold text-slate-800 mb-3">Sẵn sàng khởi tạo</h3>
        <p className="relative z-10 text-slate-500 text-base max-w-sm leading-relaxed">
          Nhập thông tin đề thi hoặc bài học ở cột bên trái để AI tạo mã nguồn LaTeX chuẩn.
        </p>
      </div>
    );
  }

  if (status === GenerationStatus.ERROR) {
    return (
      <div className="h-full min-h-[600px] flex flex-col items-center justify-center bg-red-50/80 backdrop-blur-xl rounded-[2rem] border border-red-100 p-8 text-center">
        <div className="bg-red-100 p-5 rounded-full mb-6 animate-bounce">
            <AlertCircle className="w-12 h-12 text-red-600" />
        </div>
        <h3 className="text-xl font-bold text-red-900 mb-2">Đã xảy ra lỗi</h3>
        <p className="text-red-700 max-w-md">{error}</p>
        <button 
            onClick={() => window.location.reload()}
            className="mt-6 px-6 py-2 bg-white text-red-600 border border-red-200 rounded-xl font-bold shadow-sm hover:bg-red-50 transition-colors"
        >
            Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white/90 backdrop-blur-2xl rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-white/50 overflow-hidden flex flex-col h-full min-h-[600px] transition-all duration-500 hover:shadow-[0_20px_40px_rgb(0,0,0,0.12)]">
      {/* Editor Header */}
      <div className="border-b border-slate-200 bg-slate-50/80 backdrop-blur-sm p-4 flex flex-wrap gap-4 justify-between items-center z-10">
        <div className="flex items-center gap-4">
            <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400 shadow-sm"></div>
                <div className="w-3 h-3 rounded-full bg-amber-400 shadow-sm"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-400 shadow-sm"></div>
            </div>
            <div className="h-6 w-px bg-slate-200"></div>
            <div className="flex items-center gap-2 text-slate-700 bg-white px-3 py-1 rounded-lg border border-slate-200 shadow-sm">
                <FileText className="w-3.5 h-3.5 text-indigo-500" />
                <span className="text-xs font-bold tracking-wide">prompt.txt</span>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-slate-400 text-xs font-mono">
                 <Terminal className="w-3.5 h-3.5" />
                 <span>read-only</span>
            </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200
              ${copied 
                ? 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200' 
                : 'bg-white hover:bg-slate-50 text-slate-700 ring-1 ring-slate-200 shadow-sm hover:shadow'}`}
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Đã chép!' : 'Sao chép'}
          </button>
          
          <button
            onClick={handleCopyAndOpenGemini}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-600 to-violet-600 hover:to-indigo-600 hover:shadow-lg hover:shadow-indigo-500/30 text-white shadow-md transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Mở Gemini
          </button>
        </div>
      </div>
      
      {/* Editor Content */}
      <div className="relative flex-1 bg-slate-50/30 group">
        <textarea 
            readOnly
            className="w-full h-full p-6 font-mono text-sm leading-relaxed text-slate-700 bg-transparent resize-y focus:outline-none selection:bg-indigo-100 selection:text-indigo-900 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent hover:scrollbar-thumb-slate-300"
            value={content}
            spellCheck={false}
        />
        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <div className="bg-slate-800/90 backdrop-blur text-white text-[10px] px-3 py-1.5 rounded-lg shadow-xl font-mono border border-white/10">
                Markdown Preview
            </div>
        </div>
      </div>
    </div>
  );
};

export default OutputDisplay;