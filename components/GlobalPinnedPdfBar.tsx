import React, { useState, useRef } from 'react';
import { 
  Pin, 
  PinOff, 
  FileUp, 
  FileText, 
  Trash2, 
  Eye, 
  EyeOff, 
  Loader2, 
  CheckCircle2, 
  BookOpen, 
  Sparkles, 
  RefreshCw,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { AttachedPdfData } from '../types';

interface GlobalPinnedPdfBarProps {
  pinnedPdf: AttachedPdfData | null;
  isActive: boolean;
  onSetPinnedPdf: (pdf: AttachedPdfData | null) => void;
  onToggleActive: (active: boolean) => void;
}

export const GlobalPinnedPdfBar: React.FC<GlobalPinnedPdfBarProps> = ({
  pinnedPdf,
  isActive,
  onSetPinnedPdf,
  onToggleActive,
}) => {
  const [isParsing, setIsParsing] = useState(false);
  const [viewMode, setViewMode] = useState<'text' | 'pdf' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setError('Vui lòng chỉ tải lên file định dạng PDF (.pdf)!');
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      setError('Dung lượng file PDF vượt quá 25MB!');
      return;
    }

    setError(null);
    setIsParsing(true);

    try {
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const result = reader.result as string;
          const base64 = result.split(',')[1];
          resolve(base64);
        };
        reader.onerror = reject;
      });

      reader.readAsDataURL(file);
      const fileBase64 = await base64Promise;

      const resp = await fetch('/api/parse-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          fileBase64: fileBase64,
        }),
      });

      const resData = await resp.json();

      if (!resp.ok || !resData.success) {
        throw new Error(resData.error || 'Không thể trích xuất nội dung từ file PDF.');
      }

      const pdfData: AttachedPdfData = {
        fileName: file.name,
        numPages: resData.numPages || 1,
        fileSize: resData.fileSize || `${Math.round(file.size / 1024)} KB`,
        text: resData.text || '',
        tempPath: resData.tempPath,
      };

      onSetPinnedPdf(pdfData);
      onToggleActive(true);
      setIsExpanded(true);
    } catch (err: any) {
      setError(err.message || 'Lỗi khi xử lý file PDF.');
    } finally {
      setIsParsing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const toggleViewMode = (mode: 'text' | 'pdf') => {
    if (viewMode === mode) {
      setViewMode(null);
    } else {
      setViewMode(mode);
    }
  };

  return (
    <div className="mb-8 max-w-3xl mx-auto w-full">
      <div className={`p-4 border-4 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] transition-colors ${
        pinnedPdf && isActive ? 'bg-[#00CECB]/15 border-black' : 'bg-white border-black'
      }`}>
        
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b-2 border-black">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 border-2 border-black flex items-center justify-center shadow-[3px_3px_0_0_rgba(0,0,0,1)] ${
              pinnedPdf && isActive ? 'bg-[#FFED66] text-black' : 'bg-[#FF5E5B] text-white'
            }`}>
              {pinnedPdf && isActive ? (
                <Pin className="w-5 h-5 stroke-[3] rotate-45" />
              ) : (
                <PinOff className="w-5 h-5 stroke-[3]" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-black text-black uppercase tracking-wider">
                  Ghim Tài Liệu RAG Toàn Bộ Studio
                </h3>
                {pinnedPdf && (
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 border border-black flex items-center gap-1 ${
                    isActive ? 'bg-[#A3E635] text-black shadow-[2px_2px_0_0_rgba(0,0,0,1)]' : 'bg-gray-200 text-gray-700'
                  }`}>
                    {isActive ? (
                      <>
                        <CheckCircle2 className="w-3 h-3 stroke-[3]" />
                        Đang Ghim RAG
                      </>
                    ) : (
                      'Tạm Ngừng RAG'
                    )}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-gray-700 font-bold">
                Dùng chung cho cả Soạn Tài Liệu LaTeX (Đề thi, Bài tập, Bài học) VÀ Tạo Video Hoạt Họa Manim CE
              </p>
            </div>
          </div>

          {/* Toggle Switch */}
          {pinnedPdf && (
            <div className="flex items-center gap-2 shrink-0">
              <label className="flex items-center gap-2 text-xs font-black uppercase text-black cursor-pointer bg-white px-2.5 py-1 border-2 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] select-none hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => onToggleActive(e.target.checked)}
                  className="w-4 h-4 border-2 border-black rounded-none accent-black cursor-pointer"
                />
                <span>{isActive ? 'Bật RAG' : 'Tắt RAG'}</span>
              </label>

              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1 border-2 border-black bg-white hover:bg-[#FFED66] shadow-[2px_2px_0_0_rgba(0,0,0,1)] cursor-pointer"
                title={isExpanded ? 'Thu gọn' : 'Mở rộng'}
              >
                {isExpanded ? <ChevronUp className="w-4 h-4 stroke-[3]" /> : <ChevronDown className="w-4 h-4 stroke-[3]" />}
              </button>
            </div>
          )}
        </div>

        {/* File Input ngầm */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              handleFile(e.target.files[0]);
            }
          }}
          className="hidden"
        />

        {/* Nội dung khi CHƯA có file ghim */}
        {!pinnedPdf && (
          <div className="pt-3">
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => fileInputRef.current?.click()}
              className="border-3 border-dashed border-black bg-[#FFED66]/10 hover:bg-[#FFED66]/30 p-5 text-center cursor-pointer transition-all shadow-[3px_3px_0_0_rgba(0,0,0,1)] group"
            >
              {isParsing ? (
                <div className="flex flex-col items-center justify-center gap-2 py-3">
                  <Loader2 className="w-7 h-7 text-black animate-spin" />
                  <span className="text-xs font-black uppercase tracking-wider text-black">
                    Đang đọc & nạp tri thức toán học từ PDF vào bộ nhớ RAG...
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-2">
                  <div className="p-2.5 bg-[#FFED66] border-2 border-black shadow-[3px_3px_0_0_rgba(0,0,0,1)] group-hover:bg-[#FFECA1] transition-colors">
                    <FileUp className="w-6 h-6 text-black stroke-[2.5]" />
                  </div>
                  <div className="text-xs font-black uppercase text-black">
                    Kéo thả file PDF vào đây hoặc <span className="underline decoration-2 text-indigo-700">bấm để chọn từ máy tính</span>
                  </div>
                  <p className="text-[10px] text-gray-600 font-bold max-w-lg">
                    Tải lên Sách giáo khoa, Đề thi mẫu, Chuyên đề, Luận văn để Ghim làm RAG. AI sẽ tự động đọc hiểu và đồng bộ vào mọi form tạo đề thi, bài tập và video Manim.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Nội dung khi ĐÃ CÓ file ghim */}
        {pinnedPdf && (
          <div className="pt-3 space-y-3">
            <div className="p-3 bg-white border-2 border-black shadow-[3px_3px_0_0_rgba(0,0,0,1)] flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#FFED66] border-2 border-black text-black shrink-0">
                  <FileText className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <div className="text-sm font-black text-black flex items-center gap-2 flex-wrap">
                    <span className="truncate max-w-xs sm:max-w-md">{pinnedPdf.fileName}</span>
                    <span className="text-[10px] bg-[#A3E635] text-black px-1.5 py-0.2 border border-black font-black uppercase">
                      📌 Đang Ghim Toàn Cục
                    </span>
                  </div>
                  <div className="text-[11px] font-bold text-gray-700 flex items-center gap-2 mt-0.5">
                    <span>{pinnedPdf.numPages} trang</span>
                    <span>•</span>
                    <span>{pinnedPdf.fileSize}</span>
                    <span>•</span>
                    <span className="text-indigo-700 font-black">{pinnedPdf.text.length.toLocaleString()} ký tự text trích xuất</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 flex-wrap w-full md:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => toggleViewMode('text')}
                  className={`px-2.5 py-1.5 border-2 border-black text-xs font-black uppercase flex items-center gap-1.5 shadow-[2px_2px_0_0_rgba(0,0,0,1)] cursor-pointer ${
                    viewMode === 'text' ? 'bg-[#FFED66] text-black' : 'bg-white hover:bg-gray-100'
                  }`}
                  title="Xem trước văn bản được trích xuất để AI làm RAG"
                >
                  {viewMode === 'text' ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{viewMode === 'text' ? 'Ẩn Text' : 'Xem Text RAG'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => toggleViewMode('pdf')}
                  className={`px-2.5 py-1.5 border-2 border-black text-xs font-black uppercase flex items-center gap-1.5 shadow-[2px_2px_0_0_rgba(0,0,0,1)] cursor-pointer ${
                    viewMode === 'pdf' ? 'bg-[#00CECB] text-black' : 'bg-white hover:bg-gray-100'
                  }`}
                  title="Xem trực quan file PDF gốc"
                >
                  {viewMode === 'pdf' ? <EyeOff className="w-3.5 h-3.5" /> : <BookOpen className="w-3.5 h-3.5" />}
                  <span>{viewMode === 'pdf' ? 'Ẩn PDF' : 'Review PDF'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-2.5 py-1.5 bg-[#FFECA1] hover:bg-[#FFED66] text-black border-2 border-black text-xs font-black uppercase flex items-center gap-1.5 shadow-[2px_2px_0_0_rgba(0,0,0,1)] cursor-pointer"
                  title="Tải lên file PDF khác để thay thế tài liệu ghim này"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Đổi File</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setViewMode(null);
                    onSetPinnedPdf(null);
                  }}
                  className="px-2.5 py-1.5 bg-[#FF5E5B] hover:bg-[#E04845] text-white border-2 border-black text-xs font-black uppercase flex items-center gap-1.5 shadow-[2px_2px_0_0_rgba(0,0,0,1)] cursor-pointer"
                  title="Bỏ ghim tài liệu này"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Bỏ Ghim</span>
                </button>
              </div>
            </div>

            {/* Xem trước Text RAG */}
            {viewMode === 'text' && (
              <div className="p-3 bg-white border-2 border-black shadow-[3px_3px_0_0_rgba(0,0,0,1)] space-y-2">
                <div className="flex items-center justify-between text-xs font-black uppercase border-b border-black pb-1">
                  <span>Nội dung Text Toán Học Đang Nạp Vào RAG (Trích xuất từ PDF):</span>
                  <span className="text-gray-500">{pinnedPdf.text.length} ký tự</span>
                </div>
                <div className="max-h-60 overflow-y-auto font-mono text-xs text-gray-800 whitespace-pre-wrap leading-relaxed bg-slate-50 p-2.5 border border-black">
                  {pinnedPdf.text ? (
                    pinnedPdf.text.slice(0, 15000) + (pinnedPdf.text.length > 15000 ? '\n\n... [Đã tải đầy đủ toàn bộ nội dung PDF]' : '')
                  ) : (
                    <span className="italic text-gray-400">Không có văn bản dạng text thuần (tài liệu chứa nhiều ảnh quét). AI sẽ đọc trực tiếp bằng cơ chế Multimodal.</span>
                  )}
                </div>
              </div>
            )}

            {/* Xem trực quan PDF */}
            {viewMode === 'pdf' && (
              <div className="border-2 border-black bg-slate-800 overflow-hidden shadow-[3px_3px_0_0_rgba(0,0,0,1)]">
                {pinnedPdf.tempPath ? (
                  <iframe
                    src={`/api/view-pdf?path=${encodeURIComponent(pinnedPdf.tempPath)}#toolbar=0`}
                    className="w-full h-96 border-none bg-slate-700"
                    title="PDF Pinned Preview"
                  />
                ) : (
                  <div className="p-4 text-center text-xs font-bold text-white">
                    Đang chuẩn bị file PDF để xem trực quan...
                  </div>
                )}
              </div>
            )}

            {/* Thanh thông báo tính năng đang kết nối */}
            {isActive && (
              <div className="p-2 bg-[#A3E635]/30 border-2 border-black flex items-center justify-between text-[11px] font-black uppercase text-black flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-black stroke-[3]" />
                  <span>Đang tự động đồng bộ RAG vào:</span>
                </div>
                <div className="flex items-center gap-2 flex-wrap text-[10px]">
                  <span className="bg-white px-1.5 py-0.5 border border-black">Đề Thi</span>
                  <span className="bg-white px-1.5 py-0.5 border border-black">Bài Học</span>
                  <span className="bg-white px-1.5 py-0.5 border border-black">Phiếu Bài Tập</span>
                  <span className="bg-white px-1.5 py-0.5 border border-black">Bài Tương Tự</span>
                  <span className="bg-white px-1.5 py-0.5 border border-black">Lộ Trình</span>
                  <span className="bg-[#9333EA] text-white px-1.5 py-0.5 border border-black">🎬 Video Manim</span>
                </div>
              </div>
            )}
          </div>
        )}

        {error && (
          <p className="mt-2 text-xs font-bold text-red-600 bg-red-50 p-2 border-2 border-red-500">
            ⚠️ {error}
          </p>
        )}
      </div>
    </div>
  );
};

export default GlobalPinnedPdfBar;
