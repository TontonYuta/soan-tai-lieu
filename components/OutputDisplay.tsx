import React, { useState } from 'react';
import { Copy, Check, ExternalLink, Bot, AlertCircle, Code2, Terminal, Sparkles } from 'lucide-react';
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
      <div className="h-full min-h-[600px] flex flex-col items-center justify-center bg-white/60 backdrop-blur-xl rounded-3xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-12 text-center relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/5 via-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
        
        <div className="relative z-10 bg-white p-6 rounded-3xl shadow-xl shadow-indigo-100 mb-8 border border-indigo-50 animate-bounce-slow">
            <div className="absolute -top-3 -right-3">
                <Sparkles className="w-8 h-8 text-yellow-400 fill-yellow-400" />
            </div>
          <Bot className="w-16 h-16 text-indigo-600" />
        </div>
        <h3 className="relative z-10 text-2xl font-bold text-slate-800 mb-3">Sẵn sàng khởi tạo</h3>
        <p className="relative z-10 text-slate-500 text-base max-w-sm leading-relaxed">
          Hãy nhập thông tin đề thi ở cột bên trái, AI sẽ giúp bạn viết prompt chuẩn hóa LaTeX trong tích tắc.
        </p>
      </div>
    );
  }

  if (status === GenerationStatus.ERROR) {
    return (
      <div className="h-full min-h-[600px] flex flex-col items-center justify-center bg-red-50/80 backdrop-blur-xl rounded-3xl border border-red-100 p-8 text-center">
        <div className="bg-red-100 p-4 rounded-full mb-4">
            <AlertCircle className="w-12 h-12 text-red-600" />
        </div>
        <h3 className="text-xl font-bold text-red-900 mb-2">Đã xảy ra lỗi</h3>
        <p className="text-red-700 max-w-md">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white/90 backdrop-blur-2xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-white/50 overflow-hidden flex flex-col h-full min-h-[600px] transition-all duration-500">
      {/* Editor Header */}
      <div className="border-b border-slate-200 bg-slate-50/80 backdrop-blur-sm p-4 flex flex-wrap gap-4 justify-between items-center">
        <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
            </div>
            <div className="h-5 w-px bg-slate-300 mx-1"></div>
            <div className="flex items-center gap-2 text-slate-600">
                <Terminal className="w-4 h-4 text-indigo-500" />
                <span className="text-xs font-bold uppercase tracking-wider">Generated Prompt</span>
            </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200
              ${copied 
                ? 'bg-green-100 text-green-700 ring-1 ring-green-200' 
                : 'bg-white hover:bg-slate-50 text-slate-700 ring-1 ring-slate-200 shadow-sm'}`}
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Đã sao chép' : 'Sao chép'}
          </button>
          
          <button
            onClick={handleCopyAndOpenGemini}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-lg hover:shadow-indigo-500/30 text-white shadow-md transition-all duration-200"
          >
            <ExternalLink className="w-4 h-4" />
            Mở Gemini
          </button>
        </div>
      </div>
      
      {/* Editor Content */}
      <div className="relative flex-1 bg-slate-50/30 group">
        <textarea 
            readOnly
            className="w-full h-full p-6 font-mono text-sm leading-7 text-slate-700 bg-transparent resize-none focus:outline-none selection:bg-indigo-200 selection:text-indigo-900"
            value={content}
            spellCheck={false}
        />
        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <div className="bg-slate-800 text-white text-[10px] px-2 py-1 rounded shadow-lg font-mono">
                Markdown Mode
            </div>
        </div>
      </div>
    </div>
  );
};

export default OutputDisplay;