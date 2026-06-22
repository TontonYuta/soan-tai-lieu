import React, { useState } from 'react';
import { VideoConfig, GenerationStatus } from '../types';
import { Video, Type, Clock, Users, BookOpen, Wand2, MonitorPlay , ChevronDown} from "lucide-react";

interface VideoFormProps {
  onGenerateManim: (config: VideoConfig) => void;
  onGenerateScript: (config: VideoConfig) => void;
  status: GenerationStatus;
}

const VideoForm: React.FC<VideoFormProps> = ({ onGenerateManim, onGenerateScript, status }) => {
  const [config, setConfig] = useState<VideoConfig>({
    subject: '',
    topic: '',
    duration: '3-5 phút',
    tone: 'academic',
    audience: 'Học sinh trung học',
    format: 'horizontal'
  });

  const isLoading = status === GenerationStatus.LOADING;

  const handleChange = (field: keyof VideoConfig, value: string) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmitManim = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerateManim(config);
  };

  const handleSubmitScript = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerateScript(config);
  };

  const inputClass = "w-full pl-10 pr-4 py-2.5 bg-[#ffffff] border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-sm font-semibold text-slate-700 placeholder:text-slate-600 shadow-sm";
  const selectClass = "w-full pl-10 pr-8 py-2.5 bg-[#ffffff] border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-sm font-semibold text-slate-700 shadow-sm  cursor-pointer appearance-none";
  const labelClass = "block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider";
  const iconClass = "pointer-events-none absolute left-3.5 top-[11px] w-4 h-4 text-slate-600";

  return (
    <div className="bg-[#ffffff] rounded-none shadow-[8px_8px_0_0_rgba(0,0,0,1)] border-4 border-black p-6 lg:p-8 animate-in slide-in-from-left-4 duration-500 w-full">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-purple-50 flex items-center justify-center text-purple-600 border-4 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] rounded-none">
          <Video className="w-6 h-6 stroke-[3]" />
        </div>
        <div>
          <h2 className="text-xl font-black text-black">Video & Animation</h2>
          <p className="text-sm text-slate-700 font-medium">Tạo kịch bản & Manim Code</p>
        </div>
      </div>

      <form className="space-y-6">
        <div className="p-5 bg-[#ffffff] border-4 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] space-y-4">
          <div className="flex items-center gap-2 mb-2 pb-2 border-b-2 border-slate-100">
            <div className="w-6 h-6 bg-purple-100 border-2 border-black flex items-center justify-center text-purple-600">
              <span className="text-xs font-black">1</span>
            </div>
            <h3 className="font-bold text-slate-800 uppercase tracking-wider text-sm">Thông tin video</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="group relative">
              <label className={labelClass}>Môn học</label>
              <div className="relative">
                <BookOpen className={iconClass} />
                <input
                  type="text"
                  required
                  placeholder="VD: Toán học..."
                  className={inputClass}
                  value={config.subject}
                  onChange={e => handleChange('subject', e.target.value)}
                />
              </div>
            </div>

            <div className="group relative">
              <label className={labelClass}>Chủ đề</label>
              <div className="relative">
                <Type className={iconClass} />
                <input
                  type="text"
                  required
                  placeholder="VD: Định lý Pythagoras..."
                  className={inputClass}
                  value={config.topic}
                  onChange={e => handleChange('topic', e.target.value)}
                />
              </div>
            </div>

            <div className="group relative">
              <label className={labelClass}>Thời lượng dự kiến</label>
              <div className="relative">
                <Clock className={iconClass} />
                <input
                  type="text"
                  placeholder="VD: 3-5 phút"
                  className={inputClass}
                  value={config.duration}
                  onChange={e => handleChange('duration', e.target.value)}
                />
              </div>
            </div>

            <div className="group relative">
              <label className={labelClass}>Đối tượng</label>
              <div className="relative">
                <Users className={iconClass} />
                <input
                  type="text"
                  placeholder="VD: Học sinh trung học"
                  className={inputClass}
                  value={config.audience}
                  onChange={e => handleChange('audience', e.target.value)}
                />
              </div>
            </div>

            <div className="group relative">
              <label className={labelClass}>Giọng văn / Phong cách</label>
              <div className="relative">
                <Wand2 className={iconClass} />
                <select
                  className={selectClass}
                  value={config.tone}
                  onChange={e => handleChange('tone', e.target.value as any)}
                >
                  <option value="academic">Học thuật / Chuyên sâu</option>
                  <option value="creative">Sáng tạo / Hấp dẫn</option>
                  <option value="simple">Đơn giản / Dễ hiểu</option>
                </select>
<ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
              </div>
            </div>

            <div className="group relative">
              <label className={labelClass}>Định dạng Video</label>
              <div className="relative">
                <MonitorPlay className={iconClass} />
                <select
                  className={selectClass}
                  value={config.format}
                  onChange={e => handleChange('format', e.target.value as any)}
                >
                  <option value="horizontal">Ngang (16:9 - YouTube)</option>
                  <option value="vertical">Dọc (9:16 - TikTok/Shorts)</option>
                </select>
<ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
              </div>
            </div>
          </div>
          
          <div className="group relative mt-4">
            <label className={labelClass}>Nội dung chi tiết / Yêu cầu thêm (Tùy chọn)</label>
            <div className="relative">
              <textarea
                placeholder="VD: Tập trung vào 3 dạng bài tập cơ bản, hoặc đưa ra các ví dụ thực tế về đời sống..."
                className="w-full p-4 bg-[#ffffff] border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-sm font-semibold text-slate-700 placeholder:text-slate-600 shadow-sm min-h-[100px]"
                value={config.details || ''}
                onChange={e => handleChange('details', e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={handleSubmitScript}
            disabled={isLoading || !config.subject || !config.topic}
            className={`flex-1 py-4 px-6 text-white font-black uppercase tracking-widest transition-all border-4 border-black
            ${(isLoading || !config.subject || !config.topic)
              ? 'bg-slate-300 cursor-not-allowed shadow-none'
              : 'bg-[#FF90E8] text-black hover:bg-[#FFB4F0] shadow-[6px_6px_0_0_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0_0_rgba(0,0,0,1)]'}`}
          >
            {isLoading ? 'ĐANG TẠO...' : 'Tạo Kịch Bản'}
          </button>
          
          <button
            type="button"
            onClick={handleSubmitManim}
            disabled={isLoading || !config.subject || !config.topic}
            className={`flex-1 py-4 px-6 text-white font-black uppercase tracking-widest transition-all border-4 border-black
            ${(isLoading || !config.subject || !config.topic)
              ? 'bg-slate-300 cursor-not-allowed shadow-none'
              : 'bg-[#00CECB] text-black hover:bg-[#33D7D5] shadow-[6px_6px_0_0_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0_0_rgba(0,0,0,1)]'}`}
          >
            {isLoading ? 'ĐANG CODE...' : 'Code Manim'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default VideoForm;
