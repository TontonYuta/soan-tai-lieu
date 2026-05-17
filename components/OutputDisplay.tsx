
import React, { useState } from 'react';
import { Copy, Check, ExternalLink, Bot, AlertCircle, Zap, ShieldCheck, Sparkles, Terminal } from 'lucide-react';
import { GenerationStatus } from '../types';

interface OutputDisplayProps {
  content: string;
  status: GenerationStatus;
  error?: string | null;
  isLatex?: boolean;
}

const OutputDisplay: React.FC<OutputDisplayProps> = ({ content, status, error, isLatex = true }) => {
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
    const fixedLink = localStorage.getItem('gemini_fixed_link');
    if (fixedLink && fixedLink.includes('gemini.google.com')) {
        window.open(fixedLink, '_blank');
    } else {
        window.open('https://gemini.google.com/app', '_blank');
    }
  };

  if (status === GenerationStatus.IDLE) {
    return (
      <div className="h-full min-h-[600px] flex flex-col items-center justify-center brutal-card p-12 text-center relative overflow-hidden group border-4 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)]">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/notebook.png')] opacity-20 group-hover:opacity-40 transition-opacity duration-700"></div>
        <div className="relative z-10 bg-[#A3E635] p-6 border-4 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] mb-8">
          <Bot className="w-16 h-16 text-black stroke-[3]" />
        </div>
        <h3 className="relative z-10 text-2xl font-black text-black mb-3 uppercase tracking-widest">Sẵn sàng thiết kế</h3>
        <p className="relative z-10 text-black font-bold text-base max-w-sm leading-relaxed border-b-4 border-black pb-2">
          Hệ thống loại bỏ lỗi Markdown, đảm bảo mã LaTeX chuẩn.
        </p>
      </div>
    );
  }

  if (status === GenerationStatus.ERROR) {
    return (
      <div className="h-full min-h-[600px] flex flex-col items-center justify-center bg-[#FF5E5B] border-4 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] p-8 text-center">
        <AlertCircle className="w-16 h-16 text-black stroke-[3] mb-4" />
        <h3 className="text-2xl font-black text-black uppercase tracking-widest mb-2">Đã xảy ra lỗi</h3>
        <p className="text-black font-bold uppercase">{error}</p>
      </div>
    );
  }

  const isFixedLinkSet = !!localStorage.getItem('gemini_fixed_link');

  return (
    <div className="brutal-card border-4 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] overflow-hidden flex flex-col h-full min-h-[600px]">
      {/* Editor Header */}
      <div className="border-b-4 border-black bg-[#FFED66] p-4 flex flex-wrap gap-4 justify-between items-center">
        <div className="flex items-center gap-4">
            <div className="flex gap-1.5 border-4 border-black p-1 bg-[#FEF9C3]">
                <div className="w-4 h-4 rounded-none border-2 border-black bg-[#FF5E5B]"></div>
                <div className="w-4 h-4 rounded-none border-2 border-black bg-[#FFED66]"></div>
                <div className="w-4 h-4 rounded-none border-2 border-black bg-[#00CECB]"></div>
            </div>
            <div className="flex items-center gap-2 text-black bg-[#FEF9C3] px-3 py-1 border-4 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
                <Terminal className="w-4 h-4 text-black stroke-[3]" />
                <span className="text-xs font-black uppercase tracking-widest">{isLatex ? 'LaTeX Source' : 'Markdown Source'}</span>
            </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className={`flex items-center gap-2 px-4 py-2 border-4 border-black text-xs font-black uppercase tracking-widest transition-all
              ${copied ? 'bg-[#00CECB] text-black shadow-none translate-x-[4px] translate-y-[4px]' : 'bg-[#FFF9D2] text-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:bg-[#FFECA1] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none'}`}
          >
            {copied ? <Check className="w-4 h-4 stroke-[3]" /> : <Copy className="w-4 h-4 stroke-[3]" />}
            {copied ? 'Đã chép!' : 'Sao chép mã'}
          </button>
          
          <button
            onClick={handleCopyAndOpenGemini}
            className={`flex items-center gap-2 px-4 py-2 border-4 border-black text-xs font-black uppercase tracking-widest transition-all
              ${isFixedLinkSet ? 'bg-[#A3E635] text-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none' : 'bg-[#FF90E8] text-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none'}`}
          >
            <ExternalLink className="w-4 h-4 stroke-[3]" />
            {isFixedLinkSet ? 'Kênh Cố Định' : 'Mở Gemini'}
          </button>
        </div>
      </div>

      {/* Compiler Notice */}
      <div className={`px-6 py-4 border-b-4 border-black flex items-center justify-between ${isLatex ? 'bg-[#FF5E5B]' : 'bg-[#00CECB]'}`}>
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-black stroke-[3]" />
            <p className="text-xs font-black text-black uppercase">
                {isLatex ? (
                  <>Compiler: <span className="bg-[#FEF9C3] px-1 border-2 border-black">PDFLaTeX</span> | No Markdown</>
                ) : (
                  <>Format: <span className="bg-[#FEF9C3] px-1 border-2 border-black">Markdown</span></>
                )}
            </p>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-black text-black bg-[#FEF9C3] px-3 py-1 border-2 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
             {isLatex ? 'CLEAN FOR OVERLEAF' : 'READY FOR CHAT'}
          </div>
      </div>
      
      {/* Editor Content */}
      <div className="relative flex-1 bg-[#000000] group">
        <textarea 
            readOnly
            className={`w-full h-full p-8 font-mono text-sm leading-relaxed ${isLatex ? 'text-[#A3E635]' : 'text-[#FFF9D2]'} bg-transparent resize-none focus:outline-none selection:bg-[#FF90E8]/50 border-none !shadow-none`}
            value={content}
            spellCheck={false}
        />
        <div className="absolute right-6 bottom-6 flex flex-col items-end gap-2">
            {isLatex && (
              <span className="px-3 py-1 bg-[#111111] text-[10px] font-black text-[#FFED66] border-2 border-[#FFED66] uppercase">
                  Strict LaTeX Rules Applied
              </span>
            )}
        </div>
      </div>
    </div>
  );
};

export default OutputDisplay;
