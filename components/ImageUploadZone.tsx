import React, { useState, useRef } from 'react';
import { 
  Image as ImageIcon, 
  Trash2, 
  Eye, 
  EyeOff, 
  Loader2, 
  CheckCircle2, 
  Sparkles, 
  Layers, 
  Info,
  Maximize2
} from 'lucide-react';
import { AttachedImageData } from '../types';

interface ImageUploadZoneProps {
  attachedImage: AttachedImageData | null;
  onImageChange: (data: AttachedImageData | null) => void;
  title?: string;
  description?: string;
}

export const ImageUploadZone: React.FC<ImageUploadZoneProps> = ({
  attachedImage,
  onImageChange,
  title = '🖼️ Đính Kèm Hình Ảnh Minh Họa / Sơ Đồ / Đề Bài (ImageMobject):',
  description = 'Tải lên hình ảnh đề bài, sơ đồ thí nghiệm hoặc hình vẽ SGK để AI tự động chèn vào video Manim và vẽ hoạt họa chú thích trực quan.',
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml'];
    if (!validTypes.includes(file.type) && !file.name.match(/\.(png|jpe?g|webp|svg)$/i)) {
      setError('Vui lòng chỉ tải lên file định dạng hình ảnh (.png, .jpg, .jpeg, .webp, .svg)!');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setError('Dung lượng ảnh vượt quá 15MB!');
      return;
    }

    setError(null);
    setIsUploading(true);

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

      const resp = await fetch('/api/upload-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          fileBase64: fileBase64,
          layoutMode: attachedImage?.layoutMode || 'top_card',
          description: attachedImage?.description || ''
        }),
      });

      const resData = await resp.json();

      if (!resp.ok || !resData.success) {
        throw new Error(resData.error || 'Không thể tải lên hình ảnh.');
      }

      const imgData: AttachedImageData = {
        fileName: file.name,
        filePath: resData.filePath,
        previewUrl: resData.previewUrl || URL.createObjectURL(file),
        fileSize: resData.fileSize || `${Math.round(file.size / 1024)} KB`,
        layoutMode: attachedImage?.layoutMode || 'top_card',
        description: attachedImage?.description || ''
      };

      onImageChange(imgData);
      setShowPreview(true);
    } catch (err: any) {
      setError(err.message || 'Lỗi khi xử lý file hình ảnh.');
      onImageChange(null);
    } finally {
      setIsUploading(false);
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

  const handleRemove = () => {
    onImageChange(null);
    setShowPreview(false);
    setError(null);
  };

  const handleLayoutChange = (mode: 'top_card' | 'split_left' | 'fullscreen' | 'overlay') => {
    if (!attachedImage) return;
    onImageChange({
      ...attachedImage,
      layoutMode: mode
    });
  };

  const handleDescChange = (desc: string) => {
    if (!attachedImage) return;
    onImageChange({
      ...attachedImage,
      description: desc
    });
  };

  return (
    <div className="group relative border-[3px] border-black p-4 bg-[#ffffff] shadow-[4px_4px_0_0_rgba(0,0,0,1)] transition-all">
      <div className="flex items-center justify-between mb-2">
        <label className="block text-xs font-black text-black uppercase tracking-widest flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-[#9333EA]" />
          <span>{title}</span>
        </label>
        {attachedImage && (
          <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase text-emerald-700 bg-emerald-100 border border-emerald-500 px-2 py-0.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Đã đính kèm ảnh
          </span>
        )}
      </div>

      <p className="text-[11px] text-gray-600 font-semibold mb-3">
        {description}
      </p>

      {/* Upload Zone */}
      {!attachedImage ? (
        <div>
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-black hover:border-purple-600 bg-purple-50/40 hover:bg-purple-100/50 p-4 text-center cursor-pointer transition-colors flex flex-col items-center justify-center gap-2"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png, image/jpeg, image/jpg, image/webp, image/svg+xml"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  handleFile(e.target.files[0]);
                }
              }}
              className="hidden"
            />
            {isUploading ? (
              <div className="flex items-center gap-2 text-purple-700 font-bold text-xs py-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Đang tải lên và xử lý hình ảnh...</span>
              </div>
            ) : (
              <>
                <div className="w-10 h-10 rounded-full bg-purple-200 border-2 border-black flex items-center justify-center text-purple-900 shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div className="text-xs font-black uppercase text-black">
                  Kéo thả hoặc nhấn để chọn hình ảnh
                </div>
                <div className="text-[10px] text-gray-500 font-medium">
                  Hỗ trợ PNG, JPG, WEBP, SVG (tối đa 15MB)
                </div>
              </>
            )}
          </div>
          {error && (
            <p className="text-[11px] font-bold text-red-600 mt-2 bg-red-50 border border-red-300 p-2">
              ⚠️ {error}
            </p>
          )}
        </div>
      ) : (
        /* Image Attached Card */
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-slate-50 border-2 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
            <div className="flex items-center gap-3 overflow-hidden">
              {attachedImage.previewUrl && (
                <img 
                  src={attachedImage.previewUrl} 
                  alt={attachedImage.fileName}
                  className="w-12 h-12 object-cover border-2 border-black shadow-[1px_1px_0_0_rgba(0,0,0,1)] shrink-0 bg-white"
                />
              )}
              <div className="truncate">
                <div className="text-xs font-black text-black truncate max-w-[200px] sm:max-w-xs">
                  {attachedImage.fileName}
                </div>
                <div className="text-[10px] font-bold text-gray-500">
                  {attachedImage.fileSize || 'Ảnh đính kèm'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className="p-1.5 border border-black bg-white hover:bg-slate-100 text-black text-xs font-bold transition-all"
                title={showPreview ? "Thu nhỏ xem trước" : "Phóng to xem ảnh"}
              >
                {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="p-1.5 border border-black bg-red-100 hover:bg-red-200 text-red-700 text-xs font-bold transition-all"
                title="Xóa ảnh này"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Image Preview Box */}
          {showPreview && attachedImage.previewUrl && (
            <div className="p-2 bg-slate-900 border-2 border-black flex justify-center items-center max-h-56 overflow-hidden">
              <img 
                src={attachedImage.previewUrl} 
                alt="Xem trước ảnh" 
                className="max-h-52 object-contain rounded"
              />
            </div>
          )}

          {/* Bố cục hiển thị ảnh trong Video Manim */}
          <div className="p-3 bg-purple-50/60 border-2 border-black space-y-2">
            <div className="text-[11px] font-black uppercase text-black flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-purple-700" />
              <span>Bố Cục Hiển Thị Ảnh Trong Video:</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {[
                { id: 'top_card', label: '🎴 Top Card', desc: 'Thẻ trên, lời giải thẻ dưới' },
                { id: 'split_left', label: '↔️ Chia Đôi', desc: 'Ảnh bên trái, chữ bên phải' },
                { id: 'overlay', label: '🎯 Chú Thích', desc: 'Vẽ vector đè lên ảnh' }
              ].map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleLayoutChange(opt.id as any)}
                  className={`p-1.5 border-2 border-black text-left transition-all text-xs ${
                    (attachedImage.layoutMode || 'top_card') === opt.id
                      ? 'bg-purple-600 text-white font-black shadow-[2px_2px_0_0_rgba(0,0,0,1)]'
                      : 'bg-white text-black hover:bg-white/80 font-bold'
                  }`}
                >
                  <div className="text-[10px] uppercase leading-tight">{opt.label}</div>
                  <div className={`text-[8px] leading-tight ${attachedImage.layoutMode === opt.id ? 'text-purple-100' : 'text-gray-600'}`}>
                    {opt.desc}
                  </div>
                </button>
              ))}
            </div>

            {/* Chú thích / Yêu cầu AI vẽ trên ảnh */}
            <div className="mt-2">
              <label className="block text-[10px] font-black uppercase text-black mb-1">
                Yêu cầu chú thích trên ảnh (Tùy chọn cho AI):
              </label>
              <input
                type="text"
                placeholder="Vd: Chỉ mũi tên vào đỉnh S, tô viền xanh câu 1, khoanh tròn điểm cực trị..."
                value={attachedImage.description || ''}
                onChange={(e) => handleDescChange(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-black text-xs font-semibold text-black placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-purple-600"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploadZone;
