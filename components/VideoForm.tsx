import React, { useState, useEffect } from 'react';
import { 
  Video as VideoIcon, Clock, Users, Layout, Wand2, Info, 
  Code, FileText, ChevronDown, BookOpen, Film, Smartphone, 
  Monitor, Sparkles, Sliders, CheckSquare, Square, Layers
} from "lucide-react";
import { VideoConfig, GenerationStatus } from '../types';

interface VideoFormProps {
  onSubmitScript: (data: VideoConfig) => void;
  onSubmitManim: (data: VideoConfig) => void;
  status: GenerationStatus;
  contextTopic?: string;
  contextSubject?: string;
}

const MATH_PRESETS = [
  { id: 'calculus', label: '📈 Giải tích & Đồ thị hàm số', topic: 'Ý nghĩa hình học của Đạo hàm & Tiếp tuyến' },
  { id: '3d_geometry', label: '🧊 Hình học không gian 3D', topic: 'Khối đa diện xoay 360 độ & Mặt phẳng cắt' },
  { id: 'trigonometry', label: '🔄 Vòng tròn lượng giác động', topic: 'Chuyển động quét góc & Giá trị Sin, Cos' },
  { id: 'vector', label: '↗️ Vectơ & Hệ trục Oxyz', topic: 'Quy tắc cộng vectơ & Tích có hướng' },
  { id: 'algebra', label: '📐 Biến đổi đại số & Phương trình', topic: 'Khai triển hằng đẳng thức & Biến đổi tương đương' }
];

const VideoForm: React.FC<VideoFormProps> = ({ 
  onSubmitScript, 
  onSubmitManim, 
  status, 
  contextTopic, 
  contextSubject 
}) => {
  const [config, setConfig] = useState<VideoConfig>({
    subject: contextSubject || 'Toán học',
    topic: contextTopic || 'Ý nghĩa hình học của Tích phân & Đạo hàm',
    mathType: 'calculus',
    duration: '60 giây (Shorts)',
    tone: 'simple',
    audience: 'Học sinh THPT & Đại học',
    format: 'vertical',
    renderQuality: '1080p',
    fps: 60,
    safeZoneShorts: true,
    details: ''
  });

  useEffect(() => {
    if (contextTopic || contextSubject) {
      setConfig(prev => ({
        ...prev,
        topic: contextTopic || prev.topic,
        subject: contextSubject || prev.subject
      }));
    }
  }, [contextTopic, contextSubject]);

  const isLoading = status === GenerationStatus.LOADING;
  const isVertical = config.format === 'vertical';

  const handleChange = (field: keyof VideoConfig, value: any) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleSelectPreset = (preset: typeof MATH_PRESETS[0]) => {
    setConfig(prev => ({
      ...prev,
      mathType: preset.id as any,
      topic: preset.topic
    }));
  };

  const inputClass = "w-full pl-10 pr-4 py-2.5 bg-[#ffffff] rounded-none border-[3px] border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] focus:ring-0 focus:translate-y-1 focus:translate-x-1 focus:shadow-none transition-all text-sm font-bold text-black placeholder:text-gray-500 uppercase";
  const selectClass = "w-full pl-10 pr-8 py-2.5 bg-[#ffffff] rounded-none border-[3px] border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] focus:ring-0 focus:translate-y-1 focus:translate-x-1 focus:shadow-none transition-all text-sm font-bold text-black uppercase cursor-pointer appearance-none";
  const labelClass = "block text-xs font-black text-black mb-1.5 uppercase tracking-widest";
  const iconClass = "pointer-events-none absolute left-3.5 top-[13px] w-4 h-4 text-black font-black";

  return (
    <div className="bg-[#ffffff] rounded-none shadow-[8px_8px_0_0_rgba(0,0,0,1)] border-4 border-black p-6 lg:p-8 h-fit sticky top-28 overflow-y-auto max-h-[calc(100vh-9rem)] scrollbar-hide">
      
      {/* Header */}
      <div className="flex items-center gap-4 mb-6 border-b-4 border-black pb-4">
        <div className="w-12 h-12 bg-[#9333EA] flex items-center justify-center text-white border-4 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] rounded-none">
          <Film className="w-6 h-6 stroke-[3]" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-black uppercase tracking-widest">Video & Manim Studio</h2>
          <p className="text-xs text-black font-bold uppercase tracking-wider">Diễn Hoạt Toán Học Trực Quan & Kịch Bản</p>
        </div>
      </div>

      {/* Preset Fast Selector */}
      <div className="mb-6 p-4 bg-[#FFED66] border-[3px] border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] space-y-2">
        <span className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
          <Sparkles className="w-4 h-4 stroke-[3]" /> Chọn nhanh chủ đề mẫu Manim:
        </span>
        <div className="flex flex-wrap gap-1.5">
          {MATH_PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => handleSelectPreset(p)}
              className={`px-2.5 py-1.5 border-2 border-black text-[11px] font-black uppercase transition-all cursor-pointer
                ${config.mathType === p.id 
                  ? 'bg-black text-white shadow-none translate-x-[2px] translate-y-[2px]' 
                  : 'bg-white text-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:bg-[#FFECA1]'}`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        
        {/* SECTION 1: VIDEO SETTINGS */}
        <div className="p-5 bg-[#ffffff] border-[3px] border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] space-y-4">
          <div className="flex items-center gap-2 mb-2 pb-3 border-b-4 border-black">
            <div className="w-6 h-6 bg-[#A3E635] border-2 border-black flex items-center justify-center text-black">
              <Info className="w-3.5 h-3.5 stroke-[3]" />
            </div>
            <h3 className="text-sm font-black text-black uppercase tracking-wider">Cấu hình video & Định dạng</h3>
          </div>

          <div className="space-y-4">
            {/* Format Selection Cards */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  handleChange('format', 'vertical');
                  handleChange('duration', '60 giây (Shorts)');
                }}
                className={`p-3 border-2 border-black flex flex-col items-center gap-2 transition-all cursor-pointer text-center
                  ${isVertical 
                    ? 'bg-[#9333EA] text-white shadow-[4px_4px_0_0_rgba(0,0,0,1)]' 
                    : 'bg-[#ffffff] text-black hover:bg-[#FFECA1] shadow-[2px_2px_0_0_rgba(0,0,0,1)]'}`}
              >
                <Smartphone className="w-6 h-6 stroke-[3]" />
                <span className="text-xs font-black uppercase">Dọc 9:16 (Shorts/TikTok)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  handleChange('format', 'horizontal');
                  handleChange('duration', '3 - 5 phút');
                }}
                className={`p-3 border-2 border-black flex flex-col items-center gap-2 transition-all cursor-pointer text-center
                  ${!isVertical 
                    ? 'bg-[#9333EA] text-white shadow-[4px_4px_0_0_rgba(0,0,0,1)]' 
                    : 'bg-[#ffffff] text-black hover:bg-[#FFECA1] shadow-[2px_2px_0_0_rgba(0,0,0,1)]'}`}
              >
                <Monitor className="w-6 h-6 stroke-[3]" />
                <span className="text-xs font-black uppercase">Ngang 16:9 (YouTube)</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="group relative">
                <label className={labelClass}>Môn học</label>
                <div className="relative">
                  <BookOpen className={iconClass} />
                  <input
                    type="text"
                    className={inputClass}
                    placeholder="Toán học"
                    value={config.subject}
                    onChange={e => handleChange('subject', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="group relative">
                <label className={labelClass}>Thời lượng</label>
                <div className="relative">
                  <Clock className={iconClass} />
                  <input
                    type="text"
                    className={inputClass}
                    placeholder="60 giây, 3 phút..."
                    value={config.duration}
                    onChange={e => handleChange('duration', e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="group relative">
              <label className={labelClass}>Chủ đề toán học cần diễn hoạt</label>
              <div className="relative">
                <Layout className={iconClass} />
                <input
                  type="text"
                  className={inputClass}
                  placeholder="Vd: Ý nghĩa hình học của Tích phân & Đạo hàm"
                  value={config.topic}
                  onChange={e => handleChange('topic', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="group relative">
                <label className={labelClass}>Chất lượng Render (Manim Flag)</label>
                <div className="relative">
                  <Sliders className={iconClass} />
                  <select
                    className={selectClass}
                    value={config.renderQuality || '1080p'}
                    onChange={e => handleChange('renderQuality', e.target.value)}
                  >
                    <option value="1080p">Full HD 1080p 60fps (-pqh)</option>
                    <option value="480p">Xem trước nhanh 480p (-pql)</option>
                    <option value="4k">Chất lượng siêu nét 4K (-pqk)</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black pointer-events-none stroke-[3]" />
                </div>
              </div>

              <div className="group relative">
                <label className={labelClass}>Phong cách kịch bản</label>
                <div className="relative">
                  <Wand2 className={iconClass} />
                  <select
                    className={selectClass}
                    value={config.tone}
                    onChange={e => handleChange('tone', e.target.value)}
                  >
                    <option value="simple">Trực quan, dễ hiểu, hài hước</option>
                    <option value="creative">Thu hút, bắt trend triệu view</option>
                    <option value="academic">Sư phạm, chuẩn chỉ, học thuật</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black pointer-events-none stroke-[3]" />
                </div>
              </div>
            </div>

            <div className="group relative">
              <label className={labelClass}>Đối tượng khán giả</label>
              <div className="relative">
                <Users className={iconClass} />
                <input
                  type="text"
                  className={inputClass}
                  placeholder="Học sinh lớp 12, Ôn thi ĐGNL / THPT..."
                  value={config.audience}
                  onChange={e => handleChange('audience', e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Safe zone toggle for 9:16 */}
            {isVertical && (
              <div className="p-3 bg-[#00CECB]/20 border-2 border-black">
                <span className="text-[11px] font-black text-black uppercase block">
                  🛡️ Đã kích hoạt Vùng An Toàn (Safe Zone) 9:16
                </span>
                <span className="text-[10px] text-gray-700 font-medium">
                  Tự động căn chỉnh khoảng trống 15% trên và 20% dưới để không bị che bởi giao diện TikTok/Shorts.
                </span>
              </div>
            )}

            <div className="group relative mt-2">
              <label className={labelClass}>Yêu cầu chi tiết về Animation (Tùy chọn)</label>
              <textarea
                className="w-full p-3 bg-[#ffffff] rounded-none border-[3px] border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] text-sm font-medium text-black placeholder:text-gray-500 min-h-[70px]"
                placeholder="Vd: Tiếp tuyến di chuyển theo hàm số, tô màu phần diện tích giới hạn bởi 2 đồ thị..."
                value={config.details || ''}
                onChange={e => handleChange('details', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => onSubmitScript(config)}
            disabled={isLoading || !config.subject || !config.topic}
            className={`relative flex items-center justify-center gap-3 py-4 px-4 rounded-none text-black font-black uppercase tracking-widest text-sm border-4 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] transition-all duration-75 active:translate-y-[4px] active:translate-x-[4px] active:shadow-none cursor-pointer
              ${(isLoading || !config.subject || !config.topic)
                ? 'bg-[#E2E8F0] cursor-not-allowed text-gray-500 shadow-none border-gray-400' 
                : 'bg-[#FFED66] hover:bg-[#FFECA1]'}`}
          >
            <FileText className="w-5 h-5 stroke-[3]" />
            <span>Tạo Kịch Bản Lời Thoại</span>
          </button>

          <button
            type="button"
            onClick={() => onSubmitManim(config)}
            disabled={isLoading || !config.subject || !config.topic}
            className={`relative flex items-center justify-center gap-3 py-4 px-4 rounded-none text-white font-black uppercase tracking-widest text-sm border-4 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] transition-all duration-75 active:translate-y-[4px] active:translate-x-[4px] active:shadow-none cursor-pointer
              ${(isLoading || !config.subject || !config.topic)
                ? 'bg-[#E2E8F0] cursor-not-allowed text-gray-500 shadow-none border-gray-400' 
                : 'bg-[#9333EA] hover:bg-[#7E22CE]'}`}
          >
            <Code className="w-5 h-5 stroke-[3]" />
            <span>Tạo Mã Python Manim</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoForm;