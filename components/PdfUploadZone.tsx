import React, { useState, useRef } from 'react';
import { FileUp, FileText, Trash2, Eye, EyeOff, Loader2, CheckCircle2, BookOpen } from 'lucide-react';
import { AttachedPdfData } from '../types';

interface PdfUploadZoneProps {
  attachedPdf: AttachedPdfData | null;
  onPdfChange: (data: AttachedPdfData | null) => void;
  title?: string;
  description?: string;
}

export const PdfUploadZone: React.FC<PdfUploadZoneProps> = ({
  attachedPdf,
  onPdfChange,
  title = 'Đính Kèm File PDF Tài Liệu Tham Khảo (RAG / Đổi Số / SGK):',
  description = 'AI sẽ tự động đọc hiểu đề bài, cấu trúc câu hỏi và lý thuyết từ file PDF đính kèm để biên soạn tài liệu LaTeX.',
}) => {
  const [isParsing, setIsParsing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
      // Đọc file dạng Base64
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

      // Gọi API phân tích PDF
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

      onPdfChange(pdfData);
    } catch (err: any) {
      setError(err.message || 'Lỗi khi xử lý file PDF.');
      onPdfChange(null);
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

  const [viewMode, setViewMode] = useState<'text' | 'pdf' | null>(null);

  const toggleViewMode = (mode: 'text' | 'pdf') => {
    if (viewMode === mode) {
      setViewMode(null);
    } else {
      setViewMode(mode);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-black uppercase tracking-wider text-black flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5 text-indigo-600 stroke-[3]" />
          <span>{title}</span>
        </label>
        {attachedPdf && (
          <span className="text-[10px] font-black uppercase text-green-700 bg-green-100 px-2 py-0.5 border border-black flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Đã kết nối RAG
          </span>
        )}
      </div>

      {!attachedPdf && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-black bg-slate-50 hover:bg-[#FFED66]/20 p-4 text-center cursor-pointer transition-all shadow-[2px_2px_0_0_rgba(0,0,0,1)] group"
        >
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

          {isParsing ? (
            <div className="flex flex-col items-center justify-center gap-2 py-2">
              <Loader2 className="w-6 h-6 text-black animate-spin" />
              <span className="text-xs font-black uppercase tracking-wider text-black">
                Đang đọc và phân tích cấu trúc toán học từ PDF...
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-1.5">
              <div className="p-2 bg-white border-2 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] group-hover:bg-[#FFED66] transition-colors">
                <FileUp className="w-5 h-5 text-black stroke-[2.5]" />
              </div>
              <div className="text-xs font-black uppercase text-black">
                Kéo thả file PDF vào đây hoặc <span className="underline decoration-2 text-indigo-600">chọn từ máy tính</span>
              </div>
              <p className="text-[10px] text-gray-600 font-bold max-w-md">
                {description}
              </p>
            </div>
          )}
        </div>
      )}

      {error && (
        <p className="text-xs font-bold text-red-600 bg-red-50 p-2 border-2 border-red-500">
          ⚠️ {error}
        </p>
      )}

      {attachedPdf && (
        <div className="p-3 bg-[#A3E635]/20 border-2 border-black shadow-[3px_3px_0_0_rgba(0,0,0,1)] space-y-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-[#A3E635] border-2 border-black text-black">
                <FileText className="w-4 h-4 stroke-[3]" />
              </div>
              <div>
                <div className="text-xs font-black text-black truncate max-w-xs sm:max-w-md">
                  {attachedPdf.fileName}
                </div>
                <div className="text-[10px] font-bold text-gray-700">
                  {attachedPdf.numPages} trang • {attachedPdf.fileSize} • {attachedPdf.text.length} ký tự toán học
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => toggleViewMode('text')}
                className={`px-2 py-1 border-2 border-black text-[10px] font-black uppercase flex items-center gap-1 shadow-[2px_2px_0_0_rgba(0,0,0,1)] cursor-pointer ${
                  viewMode === 'text' ? 'bg-[#FFED66] text-black' : 'bg-white hover:bg-gray-100'
                }`}
              >
                {viewMode === 'text' ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                <span>{viewMode === 'text' ? 'Ẩn Text RAG' : 'Xem Text RAG'}</span>
              </button>

              <button
                type="button"
                onClick={() => toggleViewMode('pdf')}
                className={`px-2 py-1 border-2 border-black text-[10px] font-black uppercase flex items-center gap-1 shadow-[2px_2px_0_0_rgba(0,0,0,1)] cursor-pointer ${
                  viewMode === 'pdf' ? 'bg-[#00CECB] text-black' : 'bg-white hover:bg-gray-100'
                }`}
              >
                {viewMode === 'pdf' ? <EyeOff className="w-3 h-3" /> : <BookOpen className="w-3 h-3" />}
                <span>{viewMode === 'pdf' ? 'Ẩn Xem PDF' : 'Review PDF (Trực Quan)'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setViewMode(null);
                  onPdfChange(null);
                }}
                className="px-2 py-1 bg-[#FF5E5B] text-white border-2 border-black text-[10px] font-black uppercase flex items-center gap-1 hover:bg-[#E04845] shadow-[2px_2px_0_0_rgba(0,0,0,1)] cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
                <span>Gỡ File</span>
              </button>
            </div>
          </div>

          {viewMode === 'text' && (
            <div className="mt-2 p-2.5 bg-white border-2 border-black max-h-48 overflow-y-auto font-mono text-[11px] text-gray-800 whitespace-pre-wrap leading-relaxed">
              {attachedPdf.text ? (
                attachedPdf.text.slice(0, 3000) + (attachedPdf.text.length > 3000 ? '\n\n... (Đã trích xuất toàn bộ tài liệu)' : '')
              ) : (
                <span className="italic text-gray-400">Không có văn bản dạng text thuần (tài liệu chứa nhiều ảnh quét). AI sẽ đọc trực tiếp bằng cơ chế Multimodal.</span>
              )}
            </div>
          )}

          {viewMode === 'pdf' && (
            <div className="mt-2 border-2 border-black bg-slate-800 overflow-hidden shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
              {attachedPdf.tempPath ? (
                <iframe
                  src={`/api/view-pdf?path=${encodeURIComponent(attachedPdf.tempPath)}#toolbar=0`}
                  className="w-full h-80 border-none bg-slate-700"
                  title="PDF Visual Review"
                />
              ) : (
                <div className="p-4 text-center text-xs font-bold text-white">
                  Đang chuẩn bị file PDF để xem trực quan...
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PdfUploadZone;
