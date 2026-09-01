import React, { useState } from 'react';
import { 
  Copy, Check, ExternalLink, Terminal, AlertCircle, Bot, Zap, 
  ShieldCheck, Download, Play, FileCode, Sparkles 
} from 'lucide-react';
import { GenerationStatus } from '../types';

interface OutputDisplayProps {
  content: string;
  status: GenerationStatus;
  error: string | null;
  onForwardContext?: (targetTab: 'roadmap' | 'learning' | 'worksheet' | 'similar' | 'exam' | 'video' | 'bat') => void;
  onOpenAutomation?: () => void;
}

const OutputDisplay: React.FC<OutputDisplayProps> = ({ content, status, error, onForwardContext, onOpenAutomation }) => {
  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState<string | null>(null);

  const handleCopy = () => {
    if (!content) return;
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyAndOpenGemini = () => {
    if (!content) return;
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    
    const targetUrl = localStorage.getItem('yuta_ai_url') || localStorage.getItem('gemini_fixed_link') || 'https://gemini.google.com/app';
    window.open(targetUrl, '_blank');
  };


  // Helper tải file text
  const downloadFile = (filename: string, text: string) => {
    const element = document.createElement('a');
    const file = new Blob([text], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    setDownloaded(filename);
    setTimeout(() => setDownloaded(null), 2500);
  };

  // Trích xuất mã nguồn bên trong markdown codeblock
  const extractCode = (raw: string, lang: string): string => {
    const regex = new RegExp(`\`\`\`(?:${lang})?\\s*([\\s\\S]*?)\`\`\``, 'i');
    const match = raw.match(regex);
    if (match && match[1]) {
      return match[1].trim();
    }
    return raw;
  };

  // Xác định định dạng kết quả
  const isLatex = content.includes('\\documentclass') || content.includes('\\begin{document}') || content.includes('\\usepackage');
  const isManim = content.includes('from manim import') || content.includes('class MainScene') || content.includes('ThreeDScene');
  const isBat = content.includes('@echo off') || content.includes('chcp 65001');

  // Xử lý tải script chạy Manim
  const handleDownloadManimBat = () => {
    const batContent = `@echo off
chcp 65001 >nul
title Yuta!LaTeX - Render Manim Video
color 0A
cls
echo ========================================================
echo   YUTA MANIM STUDIO - DANG RENDER VIDEO TOAN HOC
echo ========================================================
echo.
echo [1/2] Dang kiem tra moi truong Manim...
where manim >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Chua cai dat Manim CE! Vui long cai dat: pip install manim
    pause
    exit /b
)

echo [2/2] Dang render scene.py chat luong cao (1080p 60fps)...
manim -pqh scene.py MainScene
if %errorlevel% neq 0 (
    echo [ERROR] Co loi xay ra trong qua trinh render Manim!
) else (
    echo.
    echo ========================================================
    echo   [SUCCESS] RENDER VIDEO HOAN TAT!
    echo ========================================================
)
echo.
pause
`;
    downloadFile('render_manim.bat', batContent);
  };

  // Xử lý tải script biên dịch LaTeX
  const handleDownloadLatexBat = () => {
    const batContent = `@echo off
chcp 65001 >nul
title Yuta!LaTeX - Bien Dich PDFLaTeX
color 0B
cls
echo ========================================================
echo   YUTA LATEX STUDIO - BIEN DICH TAI LIEU TOAN HOC
echo ========================================================
echo.
echo [1/3] Dang bien dich pdflatex lan 1...
pdflatex -interaction=nonstopmode tailieu.tex >nul
echo [2/3] Dang bien dich pdflatex lan 2 de cap nhat chi so trang...
pdflatex -interaction=nonstopmode tailieu.tex >nul

echo [3/3] Dang don dep file rac (.aux, .log, .out)...
del *.aux *.log *.out *.toc *.synctex.gz 2>nul

echo.
echo ========================================================
echo   [SUCCESS] XUAT FILE PDF HOAN TAT: tailieu.pdf
echo ========================================================
if exist tailieu.pdf start tailieu.pdf
echo.
pause
`;
    downloadFile('compile_latex.bat', batContent);
  };

  if (status === GenerationStatus.IDLE) {
    return (
      <div className="h-full min-h-[600px] flex flex-col items-center justify-center bg-[#ffffff] border-4 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] p-8 text-center relative overflow-hidden">
        <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-[#FFED66] border-4 border-black rounded-none -rotate-12 z-0"></div>
        <div className="w-24 h-24 bg-[#00CECB] flex items-center justify-center border-4 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] mb-6 rounded-none relative z-10">
          <Bot className="w-16 h-16 text-black stroke-[3]" />
        </div>
        <h3 className="relative z-10 text-2xl font-black text-black mb-3 uppercase tracking-widest">Sẵn Sàng Thiết Kế</h3>
        <p className="relative z-10 text-black font-bold text-base max-w-sm leading-relaxed border-b-4 border-black pb-2">
          Hệ thống loại bỏ lỗi Markdown, đảm bảo mã LaTeX Toán học & Manim chuẩn xác.
        </p>
      </div>
    );
  }

  if (status === GenerationStatus.ERROR) {
    return (
      <div className="h-full min-h-[550px] flex flex-col items-center justify-center bg-[#FF5E5B] border-4 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] p-8 text-center">
        <AlertCircle className="w-16 h-16 text-black stroke-[3] mb-4" />
        <h3 className="text-2xl font-black text-black uppercase tracking-widest mb-2">Đã Xảy Ra Lỗi</h3>
        <p className="text-black font-bold uppercase">{error}</p>
      </div>
    );
  }

  const isFixedLinkSet = !!localStorage.getItem('gemini_fixed_link');

  return (
    <div className="brutal-card border-4 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] bg-white overflow-hidden flex flex-col h-full min-h-[620px]">
      {/* Editor Header */}
      <div className="border-b-4 border-black bg-[#FFED66] p-3 sm:p-4 flex flex-wrap gap-3 justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5 border-4 border-black p-1 bg-[#ffffff]">
            <div className="w-3.5 h-3.5 rounded-none border-2 border-black bg-[#FF5E5B]"></div>
            <div className="w-3.5 h-3.5 rounded-none border-2 border-black bg-[#FFED66]"></div>
            <div className="w-3.5 h-3.5 rounded-none border-2 border-black bg-[#00CECB]"></div>
          </div>
          <div className="flex items-center gap-2 text-black bg-[#ffffff] px-3 py-1 border-2 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
            <Terminal className="w-4 h-4 text-black stroke-[3]" />
            <span className="text-xs font-black uppercase tracking-widest">
              {isLatex ? 'LaTeX Source' : isManim ? 'Python Manim Scene' : isBat ? 'Windows Batch (.BAT)' : 'Markdown Prompt'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Nút Tự Động Hóa 1-Click Duy Nhất */}
          {onOpenAutomation && (
            <button
              onClick={onOpenAutomation}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#A3E635] text-black border-2 border-black text-xs font-black uppercase tracking-widest shadow-[3px_3px_0_0_rgba(0,0,0,1)] hover:bg-[#86EFAC] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all cursor-pointer"
              title="Tự động dán sang Gemini, lấy mã LaTeX và compile trên Overleaf để ra PDF"
            >
              <Zap className="w-4 h-4 stroke-[3] fill-black" />
              ⚡ Chạy 1-Click (Xuất PDF)
            </button>
          )}

          {/* Nút copy prompt */}
          <button
            onClick={handleCopy}
            className={`flex items-center gap-1.5 px-3 py-2 border-2 border-black text-xs font-black uppercase tracking-widest transition-all cursor-pointer
              ${copied ? 'bg-[#00CECB] text-black shadow-none translate-x-[2px] translate-y-[2px]' : 'bg-[#ffffff] text-black shadow-[3px_3px_0_0_rgba(0,0,0,1)] hover:bg-[#FFECA1] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none'}`}
          >
            {copied ? <Check className="w-4 h-4 stroke-[3]" /> : <Copy className="w-4 h-4 stroke-[3]" />}
            {copied ? 'Đã Chép!' : 'Sao Chép'}
          </button>
          
          {/* Nút mở Gemini */}
          <button
            onClick={handleCopyAndOpenGemini}
            className={`flex items-center gap-1.5 px-3 py-2 border-2 border-black text-xs font-black uppercase tracking-widest transition-all cursor-pointer
              ${isFixedLinkSet ? 'bg-[#FFED66] text-black shadow-[3px_3px_0_0_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none' : 'bg-[#FF90E8] text-black shadow-[3px_3px_0_0_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none'}`}
          >
            <ExternalLink className="w-4 h-4 stroke-[3]" />
            {isFixedLinkSet ? 'Kênh Cố Định' : 'Mở Gemini'}
          </button>
        </div>
      </div>

      {/* Compiler Notice & Quick Download Bar */}
      <div className={`px-4 py-2 border-b-2 border-black flex items-center justify-between flex-wrap gap-2 ${isLatex ? 'bg-[#fef2f2]' : isManim ? 'bg-[#faf5ff]' : 'bg-[#f0fdf4]'}`}>
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 stroke-[3] text-black" />
          <p className="text-[11px] font-black uppercase text-black">
            {isLatex ? (
              <>Compiler: <span className="bg-[#ffffff] px-1 border border-black text-black">PDFLaTeX</span> | TikZ & pgfplots Ready</>
            ) : isManim ? (
              <>Engine: <span className="bg-[#ffffff] px-1 border border-black text-black">Manim CE</span> | Python 3.9+</>
            ) : (
              <>Format: <span className="bg-[#ffffff] px-1 border border-black text-black">Markdown / Batch</span></>
            )}
          </p>
        </div>

        {/* Quick Save Buttons */}
        <div className="flex items-center gap-2">
          {isManim ? (
            <>
              <button
                onClick={() => downloadFile('scene.py', extractCode(content, 'python'))}
                className="flex items-center gap-1 text-[11px] font-black text-black bg-white px-2.5 py-1 border border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:bg-[#FFED66] cursor-pointer"
              >
                <Download className="w-3 h-3 stroke-[3]" /> Tải scene.py
              </button>
              <button
                onClick={handleDownloadManimBat}
                className="flex items-center gap-1 text-[11px] font-black text-black bg-[#A3E635] px-2.5 py-1 border border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:bg-[#86EFAC] cursor-pointer"
              >
                <Play className="w-3 h-3 stroke-[3]" /> Tải render.bat
              </button>
            </>
          ) : isLatex ? (
            <>
              <button
                onClick={() => downloadFile('tailieu.tex', extractCode(content, 'latex'))}
                className="flex items-center gap-1 text-[11px] font-black text-black bg-white px-2.5 py-1 border border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:bg-[#FFED66] cursor-pointer"
              >
                <Download className="w-3 h-3 stroke-[3]" /> Tải .tex
              </button>
              <button
                onClick={handleDownloadLatexBat}
                className="flex items-center gap-1 text-[11px] font-black text-black bg-[#A3E635] px-2.5 py-1 border border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:bg-[#86EFAC] cursor-pointer"
              >
                <Play className="w-3 h-3 stroke-[3]" /> Tải compile.bat
              </button>
            </>
          ) : isBat ? (
            <button
              onClick={() => downloadFile('script.bat', extractCode(content, 'bat'))}
              className="flex items-center gap-1 text-[11px] font-black text-black bg-[#FFED66] px-2.5 py-1 border border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:bg-white cursor-pointer"
            >
              <Download className="w-3 h-3 stroke-[3]" /> Tải script.bat
            </button>
          ) : null}
        </div>
      </div>

      {downloaded && (
        <div className="bg-[#A3E635] border-b-2 border-black px-4 py-1.5 text-xs font-black text-black flex items-center justify-between animate-in fade-in">
          <span>✓ Đã tải xuống thành công: <strong>{downloaded}</strong></span>
        </div>
      )}
      
      {/* Editor Content - Full Height, Zero Gap */}
      <div className="flex-1 flex flex-col min-h-0 bg-white relative">
        <textarea 
          readOnly
          className="w-full flex-1 min-h-[480px] p-5 font-mono text-sm leading-relaxed text-black bg-white resize-none focus:outline-none selection:bg-[#FFED66] border-none"
          value={content}
          spellCheck={false}
        />
      </div>

      {/* Compact Forward Context Footer */}
      {onForwardContext && (
        <div className="border-t-2 border-black bg-[#f8fafc] px-4 py-2.5 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-1.5 text-[10px] font-black text-black uppercase tracking-wider">
            <Zap className="w-3.5 h-3.5 stroke-[3] text-black" />
            <span>Chuyển tiếp:</span>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => onForwardContext('learning')}
              className="px-2 py-1 bg-white hover:bg-[#00CECB] text-black border border-black text-[10px] font-black uppercase transition-all cursor-pointer"
            >
              📖 Bài Học
            </button>
            <button
              onClick={() => onForwardContext('worksheet')}
              className="px-2 py-1 bg-white hover:bg-[#A3E635] text-black border border-black text-[10px] font-black uppercase transition-all cursor-pointer"
            >
              📝 Bài Tập
            </button>
            <button
              onClick={() => onForwardContext('similar')}
              className="px-2 py-1 bg-white hover:bg-[#FB7185] text-black border border-black text-[10px] font-black uppercase transition-all cursor-pointer"
            >
              ✨ Bài Tương Tự
            </button>
            <button
              onClick={() => onForwardContext('exam')}
              className="px-2 py-1 bg-white hover:bg-[#FF90E8] text-black border border-black text-[10px] font-black uppercase transition-all cursor-pointer"
            >
              🎓 Đề Thi
            </button>
            <button
              onClick={() => onForwardContext('video')}
              className="px-2 py-1 bg-white hover:bg-[#9333EA] hover:text-white text-black border border-black text-[10px] font-black uppercase transition-all cursor-pointer"
            >
              🎬 Video
            </button>
            <button
              onClick={() => onForwardContext('bat')}
              className="px-2 py-1 bg-white hover:bg-[#FFED66] text-black border border-black text-[10px] font-black uppercase transition-all cursor-pointer"
            >
              💻 Script
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OutputDisplay;