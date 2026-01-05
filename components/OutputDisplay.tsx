import React, { useState } from 'react';
import { Copy, Check, ExternalLink, Bot, AlertCircle, Terminal, Sparkles, FileText, Info, ShieldCheck, Zap } from 'lucide-react';
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
      <div className="h-full min-h-[600px] flex flex-col items-center justify-center bg-white/60 backdrop-blur-xl rounded-[2.5rem] border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-12 text-center relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/5 via-purple-500/5 to-pink-500/5 opacity-50 group-hover:opacity-100 transition-opacity duration-700"></div>
        <div className="relative z-10 bg-white p-6 rounded-3xl shadow-xl shadow-indigo-100 mb-8 border border-indigo-50 animate-float">
          <Bot className="w-16 h-16 text-indigo-600" />
        </div>
        <h3 className="relative z-10 text-2xl font-bold text-slate-800 mb-3">Sẵn sàng thiết kế</h3>
        <p className="relative z-10 text-slate-500 text-base max-w-sm leading-relaxed">
          AI đã được huấn luyện để xử lý bố cục trắc nghiệm thông minh. Hãy nhập thông tin đề thi.
        </p>
      </div>
    );
  }

  if (status === GenerationStatus.ERROR) {
    return (
      <div className="h-full min-h-[600px] flex flex-col items-center justify-center bg-red-50/80 backdrop-blur-xl rounded-[2.5rem] border border-red-100 p-8 text-center">
        <AlertCircle className="w-12 h-12 text-red-600 mb-4" />
        <h3 className="text-xl font-bold text-red-900 mb-2">Đã xảy ra lỗi</h3>
        <p className="text-red-700 max-w-md">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white/90 backdrop-blur-2xl rounded-[2rem] shadow-xl border border-white/50 overflow-hidden flex flex-col h-full min-h-[600px]">
      {/* Editor Header */}
      <div className="border-b border-slate-200 bg-slate-50/80 p-4 flex flex-wrap gap-4 justify-between items-center">
        <div className="flex items-center gap-4">
            <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
            </div>
            <div className="flex items-center gap-2 text-slate-700 bg-white px-3 py-1 rounded-lg border border-slate-200 shadow-sm">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-xs font-bold uppercase tracking-tight">Smart LaTeX Engine</span>
            </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all
              ${copied ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-100' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'}`}
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Đã chép!' : 'Sao chép mã'}
          </button>
          
          <button
            onClick={handleCopyAndOpenGemini}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Mở Gemini
          </button>
        </div>
      </div>

      {/* Compiler Notice & Layout Info */}
      <div className="px-6 py-4 bg-gradient-to-r from-indigo-50 to-blue-50 border-b border-indigo-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-indigo-600" />
            <p className="text-xs font-bold text-slate-600">
                Chế độ: <span className="text-indigo-600 underline">Bố cục trắc nghiệm tự thích ứng (Adaptive Layout)</span>
            </p>
          </div>
          <div className="hidden md:flex items-center gap-2 text-[10px] font-black text-indigo-400 bg-white px-3 py-1 rounded-full border border-indigo-100 shadow-sm">
             OVERLEAF: PDFLATEX
          </div>
      </div>
      
      {/* Editor Content */}
      <div className="relative flex-1 bg-[#0F172A] group">
        <textarea 
            readOnly
            className="w-full h-full p-8 font-mono text-sm leading-relaxed text-blue-100 bg-transparent resize-none focus:outline-none selection:bg-indigo-500/30"
            value={content}
            spellCheck={false}
        />
        <div className="absolute right-6 bottom-6 flex flex-col items-end gap-2">
            <span className="px-3 py-1 bg-emerald-500/20 backdrop-blur-md rounded-lg text-[10px] font-bold text-emerald-400 border border-emerald-500/20">
                TỐI ƯU CHO PHƯƠNG ÁN DÀI
            </span>
            <span className="px-3 py-1 bg-white/5 backdrop-blur-md rounded-lg text-[10px] font-bold text-white/30 border border-white/5 uppercase">
                Clean Code - No Meta Info
            </span>
        </div>
      </div>
    </div>
  );
};

export default OutputDisplay;