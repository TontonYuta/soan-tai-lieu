import React from 'react';
import { Zap, Eye } from 'lucide-react';

export interface RerenderTabProps {
  isManimTask: boolean;
  activeTabMode: 'auto' | 'rerender';
  isRunning: boolean;
  renderMode: 'local' | 'overleaf';
  setRenderMode: (mode: 'local' | 'overleaf') => void;
  rerenderQuality: '480p' | '720p' | '1080p';
  setRerenderQuality: (q: '480p' | '720p' | '1080p') => void;
  customLatexCode: string;
  setCustomLatexCode: (code: string) => void;
  customPythonCode: string;
  setCustomPythonCode: (code: string) => void;
  pdfUrl?: string;
  manimCode?: string;
  latexCode?: string;
  promptContent?: string;
  onRerenderLatexDirect: () => void;
  onRerenderDirect: () => void;
  onPasteClipboardLatex: () => void;
  onPasteClipboard: () => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  fileInputLatexRef: React.RefObject<HTMLInputElement | null>;
}

export const RerenderTab: React.FC<RerenderTabProps> = ({
  isManimTask,
  activeTabMode,
  isRunning,
  renderMode,
  setRenderMode,
  rerenderQuality,
  setRerenderQuality,
  customLatexCode,
  setCustomLatexCode,
  customPythonCode,
  setCustomPythonCode,
  pdfUrl,
  manimCode,
  latexCode,
  promptContent,
  onRerenderLatexDirect,
  onRerenderDirect,
  onPasteClipboardLatex,
  onPasteClipboard,
  fileInputRef,
  fileInputLatexRef,
}) => {
  if (activeTabMode !== 'rerender') {
    return null;
  }

  // KHỐI RERENDER TÀI LIỆU PDF LATEX ĐỘC LẬP
  if (!isManimTask) {
    return (
      <div className="bg-[#00CECB]/15 border-4 border-black p-4 shadow-[6px_6px_0_0_rgba(0,0,0,1)] space-y-3 animate-in fade-in">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-black stroke-[3] fill-black" />
            <h4 className="text-sm font-black uppercase text-black tracking-wider">
              ⚡ Rerender Tài Liệu PDF Trực Tiếp (Biên Dịch pdflatex Siêu Tốc)
            </h4>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase bg-black text-[#00CECB] px-2 py-0.5 border border-black font-mono">
              Local pdflatex • Biên Dịch Siêu Tốc ~1s • Không tốn Quota AI
            </span>
          </div>
        </div>

        <p className="text-xs font-bold text-black">
          Dán mã nguồn LaTeX đã chỉnh sửa bằng tay hoặc tải file <code>tailieu.tex</code> từ máy tính lên. Hệ thống sẽ sử dụng trình biên dịch <code>pdflatex</code> cục bộ để xuất file PDF ngay lập tức mà không cần gọi lại AI.
        </p>

        {/* Thanh thao tác và chế độ biên dịch */}
        <div className="flex items-center justify-between flex-wrap gap-2 p-2 bg-white border-2 border-black">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase text-black">⚙️ Chế độ:</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={isRunning}
                onClick={() => setRenderMode('local')}
                className={`px-2.5 py-1 border-2 border-black text-xs font-black uppercase transition-all cursor-pointer ${
                  renderMode === 'local'
                    ? 'bg-[#A3E635] text-black shadow-[2px_2px_0_0_rgba(0,0,0,1)]'
                    : 'bg-gray-100 text-gray-700 hover:bg-white'
                }`}
                title="Biên dịch tức thì bằng pdflatex cục bộ trên máy tính (khuyên dùng)"
              >
                ⚡ pdflatex Cục Bộ (~1s)
              </button>
              <button
                type="button"
                disabled={isRunning}
                onClick={() => setRenderMode('overleaf')}
                className={`px-2.5 py-1 border-2 border-black text-xs font-black uppercase transition-all cursor-pointer ${
                  renderMode === 'overleaf'
                    ? 'bg-[#FFED66] text-black shadow-[2px_2px_0_0_rgba(0,0,0,1)]'
                    : 'bg-gray-100 text-gray-700 hover:bg-white'
                }`}
                title="Đẩy mã nguồn lên Overleaf để biên dịch trực tuyến"
              >
                🌐 Overleaf Cloud
              </button>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={onPasteClipboardLatex}
              className="px-2.5 py-1 bg-white hover:bg-[#FFED66] border border-black text-[11px] font-black uppercase cursor-pointer shadow-[1px_1px_0_0_rgba(0,0,0,1)]"
            >
              📋 Dán Từ Clipboard
            </button>
            <button
              type="button"
              onClick={() => fileInputLatexRef.current?.click()}
              className="px-2.5 py-1 bg-white hover:bg-[#FFED66] border border-black text-[11px] font-black uppercase cursor-pointer shadow-[1px_1px_0_0_rgba(0,0,0,1)]"
            >
              📂 Tải File .tex Lên
            </button>
            <button
              type="button"
              onClick={() => {
                if (latexCode) {
                  setCustomLatexCode(latexCode);
                } else if (promptContent) {
                  const match =
                    promptContent.match(/```(?:latex)?\s*([\s\S]*?\\begin\{document\}[\s\S]*?)```/i) ||
                    promptContent.match(/```(?:latex)?\s*([\s\S]*?\\documentclass[\s\S]*?)```/i);
                  if (match && match[1]) {
                    setCustomLatexCode(match[1].trim());
                  } else if (promptContent.includes('\\documentclass') || promptContent.includes('\\begin{document}')) {
                    setCustomLatexCode(promptContent.trim());
                  }
                }
              }}
              className="px-2.5 py-1 bg-white hover:bg-[#FFED66] border border-black text-[11px] font-black uppercase cursor-pointer"
            >
              🔄 Lấy Mã LaTeX Gốc
            </button>
          </div>
        </div>

        {/* Trình soạn thảo Code LaTeX */}
        <div className="relative">
          <textarea
            value={customLatexCode}
            onChange={(e) => setCustomLatexCode(e.target.value)}
            placeholder="Dán hoặc viết mã nguồn LaTeX (tailieu.tex) tại đây... Bắt đầu bằng: \documentclass{article}"
            className="w-full h-64 p-3 bg-[#0f172a] text-[#86efac] font-mono text-xs border-2 border-black focus:outline-none selection:bg-[#FFED66] selection:text-black resize-y leading-relaxed"
            spellCheck={false}
          />
          <span className="absolute right-3 bottom-3 text-[10px] font-mono bg-black text-[#A3E635] px-2 py-0.5 border border-black">
            {customLatexCode.length} ký tự
          </span>
        </div>

        {/* Nút thực thi Rerender PDF */}
        <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
          <div className="flex items-center gap-2">
            {pdfUrl && (
              <a
                href={pdfUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-2 bg-[#A3E635] text-black border-2 border-black text-xs font-black uppercase shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:bg-[#86EFAC] cursor-pointer"
              >
                <Eye className="w-4 h-4 stroke-[3]" />
                <span>👁️ Mở Xem PDF Vừa Xuất</span>
              </a>
            )}
          </div>

          <button
            type="button"
            disabled={isRunning || !customLatexCode.trim()}
            onClick={onRerenderLatexDirect}
            className={`flex items-center gap-2 px-5 py-3 border-[3px] border-black text-xs font-black uppercase tracking-wider shadow-[4px_4px_0_0_rgba(0,0,0,1)] transition-all cursor-pointer ${
              isRunning || !customLatexCode.trim()
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed border-gray-400 shadow-none'
                : 'bg-[#A3E635] hover:bg-[#86EFAC] text-black active:translate-x-[2px] active:translate-y-[2px] active:shadow-none'
            }`}
          >
            <Zap className="w-4 h-4 stroke-[3] fill-black" />
            <span>⚡ Bắt Đầu Rerender PDF Ngay (Biên Dịch Offline)</span>
          </button>
        </div>
      </div>
    );
  }

  // KHỐI RERENDER NHANH ĐỘC LẬP CHO MANIM
  return (
    <div className="bg-[#00CECB]/15 border-4 border-black p-4 shadow-[6px_6px_0_0_rgba(0,0,0,1)] space-y-3 animate-in fade-in">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-black stroke-[3] fill-black" />
          <h4 className="text-sm font-black uppercase text-black tracking-wider">
            ⚡ Rerender Video Manim Trực Tiếp (Tối Ưu Thời Gian Kiểm Thử)
          </h4>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black uppercase bg-black text-[#00CECB] px-2 py-0.5 border border-black font-mono">
            Local Offline Render • Không tốn Quota AI
          </span>
        </div>
      </div>

      <p className="text-xs font-bold text-black">
        Dán mã Manim Python đã sửa bằng tay hoặc tải file <code>scene.py</code> từ máy tính lên. Chọn chất lượng <strong>480p</strong> để render siêu tốc trong 15-30 giây kiểm tra nhanh bố cục trước khi xuất bản 1080p.
      </p>

      {/* Thanh chọn chất lượng Render */}
      <div className="flex items-center justify-between flex-wrap gap-2 p-2 bg-white border-2 border-black">
        <div className="flex items-center gap-1.5 text-xs font-black uppercase text-black">
          <span>🎬 Chọn chất lượng render:</span>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            disabled={isRunning}
            onClick={() => setRerenderQuality('480p')}
            className={`px-3 py-1.5 border-2 border-black text-xs font-black uppercase transition-all cursor-pointer flex items-center gap-1 ${
              rerenderQuality === '480p'
                ? 'bg-[#A3E635] text-black shadow-[2px_2px_0_0_rgba(0,0,0,1)]'
                : 'bg-gray-100 text-gray-700 hover:bg-white'
            }`}
            title="Render cực nhanh (-ql: 480p 15fps), khuyên dùng để kiểm thử nhanh chuyển động và bố cục"
          >
            <span>⚡ 480p (Rất nhanh ~15s - Test)</span>
          </button>
          <button
            type="button"
            disabled={isRunning}
            onClick={() => setRerenderQuality('720p')}
            className={`px-3 py-1.5 border-2 border-black text-xs font-black uppercase transition-all cursor-pointer flex items-center gap-1 ${
              rerenderQuality === '720p'
                ? 'bg-[#FFED66] text-black shadow-[2px_2px_0_0_rgba(0,0,0,1)]'
                : 'bg-gray-100 text-gray-700 hover:bg-white'
            }`}
            title="Render chuẩn HD (-qm: 720p 30fps)"
          >
            <span>🎬 720p (HD Chuẩn)</span>
          </button>
          <button
            type="button"
            disabled={isRunning}
            onClick={() => setRerenderQuality('1080p')}
            className={`px-3 py-1.5 border-2 border-black text-xs font-black uppercase transition-all cursor-pointer flex items-center gap-1 ${
              rerenderQuality === '1080p'
                ? 'bg-[#9333EA] text-white shadow-[2px_2px_0_0_rgba(0,0,0,1)]'
                : 'bg-gray-100 text-gray-700 hover:bg-white'
            }`}
            title="Render độ nét cao (-qh: 1080p 60fps), dành cho video chính thức"
          >
            <span>🌟 1080p (Full HD Chuẩn Nét)</span>
          </button>
        </div>
      </div>

      {/* Nút thao tác nhanh với Code */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <span className="text-[11px] font-black uppercase font-mono text-gray-700">
          Mã Python Manim (scene.py) - {customPythonCode.length} ký tự
        </span>
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={onPasteClipboard}
            className="px-2.5 py-1 bg-white hover:bg-[#FFED66] border border-black text-[11px] font-black uppercase cursor-pointer shadow-[1px_1px_0_0_rgba(0,0,0,1)]"
          >
            📋 Dán Từ Clipboard
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-2.5 py-1 bg-white hover:bg-[#FFED66] border border-black text-[11px] font-black uppercase cursor-pointer shadow-[1px_1px_0_0_rgba(0,0,0,1)]"
          >
            📂 Tải File .py Lên
          </button>
          <button
            type="button"
            onClick={() => {
              if (manimCode) {
                setCustomPythonCode(manimCode);
              }
            }}
            disabled={!manimCode}
            className="px-2.5 py-1 bg-white hover:bg-[#FFED66] border border-black text-[11px] font-black uppercase cursor-pointer disabled:opacity-40"
          >
            🔄 Lấy Code Gốc
          </button>
        </div>
      </div>

      {/* Trình soạn thảo Code Python */}
      <textarea
        value={customPythonCode}
        onChange={(e) => setCustomPythonCode(e.target.value)}
        placeholder="Dán hoặc viết mã nguồn Manim Python (scene.py) tại đây... Bắt đầu bằng: from manim import *"
        className="w-full h-64 p-3 bg-[#0f172a] text-[#38bdf8] font-mono text-xs border-2 border-black focus:outline-none selection:bg-[#FFED66] selection:text-black resize-y leading-relaxed"
        spellCheck={false}
      />

      <div className="flex items-center justify-end gap-2 pt-1">
        <button
          type="button"
          disabled={isRunning || !customPythonCode.trim()}
          onClick={onRerenderDirect}
          className={`flex items-center gap-2 px-5 py-3 border-[3px] border-black text-xs font-black uppercase tracking-wider shadow-[4px_4px_0_0_rgba(0,0,0,1)] transition-all cursor-pointer ${
            isRunning || !customPythonCode.trim()
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed border-gray-400 shadow-none'
              : 'bg-[#A3E635] hover:bg-[#86EFAC] text-black active:translate-x-[2px] active:translate-y-[2px] active:shadow-none'
          }`}
        >
          <Zap className="w-4 h-4 stroke-[3] fill-black" />
          <span>⚡ Bắt Đầu Rerender Ngay ({rerenderQuality.toUpperCase()})</span>
        </button>
      </div>
    </div>
  );
};
