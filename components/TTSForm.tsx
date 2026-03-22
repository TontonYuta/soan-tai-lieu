
import React, { useState } from 'react';
import { MessageSquare, Volume2, Sparkles, Wand2, BookOpen, Layout, Info, Mic2 } from 'lucide-react';
import { TTSConfig, GenerationStatus } from '../types';

interface TTSFormProps {
  onSubmit: (data: TTSConfig) => void;
  status: GenerationStatus;
}

const TTSForm: React.FC<TTSFormProps> = ({ onSubmit, status }) => {
  const [config, setConfig] = useState<TTSConfig>({
    subject: '',
    topic: '',
    content: '',
    style: 'normal',
    emphasize: false,
    keepTerms: false
  });

  const isLoading = status === GenerationStatus.LOADING;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(config);
  };

  const handleChange = (field: keyof TTSConfig, value: any) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const inputClass = "w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-semibold text-slate-700 placeholder:text-slate-400 shadow-sm group-hover:border-indigo-300";
  const labelClass = "block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider";
  const iconClass = "absolute left-3.5 top-3 w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors duration-300";
  const selectClass = "w-full pl-10 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-semibold text-slate-700 shadow-sm appearance-none group-hover:border-indigo-300 cursor-pointer";
  const textareaClass = "w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-semibold text-slate-700 placeholder:text-slate-400 shadow-sm group-hover:border-indigo-300 min-h-[120px]";

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 p-6 lg:p-8 h-fit sticky top-28 overflow-y-auto max-h-[calc(100vh-9rem)] scrollbar-hide">
      
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm ring-4 ring-indigo-50/50">
            <Volume2 className="w-6 h-6" />
        </div>
        <div>
            <h2 className="text-xl font-bold text-slate-800">Chuyển đổi TTS</h2>
            <p className="text-xs text-slate-500 font-medium">Tối ưu văn bản cho giọng đọc AI</p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* SECTION 1: INFO */}
        <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-100 space-y-4 hover:border-indigo-100 transition-colors duration-300">
             <div className="flex items-center gap-2 mb-2 pb-3 border-b border-slate-200/60">
                <div className="w-6 h-6 rounded-lg bg-white shadow-sm flex items-center justify-center text-indigo-600">
                    <Info className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Thông tin cơ bản</h3>
            </div>

            <div className="space-y-4">
                <div className="group relative">
                    <label className={labelClass}>Môn học</label>
                    <div className="relative">
                        <BookOpen className={iconClass} />
                        <input
                            type="text"
                            className={inputClass}
                            placeholder="Vd: Lịch sử, Sinh học..."
                            value={config.subject}
                            onChange={e => handleChange('subject', e.target.value)}
                            required
                        />
                    </div>
                </div>
                
                <div className="group relative">
                    <label className={labelClass}>Chủ đề</label>
                    <div className="relative">
                        <Layout className={iconClass} />
                        <input
                            type="text"
                            className={inputClass}
                            placeholder="Vd: Chiến dịch Điện Biên Phủ"
                            value={config.topic}
                            onChange={e => handleChange('topic', e.target.value)}
                            required
                        />
                    </div>
                </div>
            </div>
        </div>

        {/* SECTION 2: CONTENT */}
        <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-100 space-y-4 hover:border-indigo-100 transition-colors duration-300">
            <div className="flex items-center gap-2 mb-2 pb-3 border-b border-slate-200/60">
                <div className="w-6 h-6 rounded-lg bg-white shadow-sm flex items-center justify-center text-indigo-600">
                    <MessageSquare className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Nội dung tài liệu</h3>
            </div>

            <div className="group relative">
                <div className="relative">
                    <Mic2 className={iconClass} />
                    <textarea
                        className={textareaClass}
                        placeholder="Dán nội dung, công thức, bảng hoặc mã LaTeX cần chuyển đổi tại đây..."
                        value={config.content}
                        onChange={e => handleChange('content', e.target.value)}
                        required
                    />
                </div>
            </div>
        </div>

        {/* SECTION 3: OPTIONS */}
        <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-100 space-y-4 hover:border-indigo-100 transition-colors duration-300">
            <div className="flex items-center gap-2 mb-2 pb-3 border-b border-slate-200/60">
                <div className="w-6 h-6 rounded-lg bg-white shadow-sm flex items-center justify-center text-indigo-600">
                    <Sparkles className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Tùy chỉnh giọng đọc</h3>
            </div>

            <div className="space-y-4">
                <div className="group relative">
                    <label className={labelClass}>Phong cách</label>
                    <div className="relative">
                        <Sparkles className={iconClass} />
                        <select 
                            className={selectClass}
                            value={config.style}
                            onChange={e => handleChange('style', e.target.value)}
                        >
                            <option value="normal">Mặc định</option>
                            <option value="slow">Giọng chậm (Dễ nghe)</option>
                            <option value="teaching">Giọng giảng bài (Sư phạm)</option>
                            <option value="podcast">Giọng podcast (Kể chuyện)</option>
                        </select>
                    </div>
                </div>

                <div className="flex flex-col gap-3">
                    <label className="flex items-center gap-3 cursor-pointer group/check">
                        <div className="relative flex items-center">
                            <input 
                                type="checkbox" 
                                className="peer sr-only"
                                checked={config.emphasize}
                                onChange={e => handleChange('emphasize', e.target.checked)}
                            />
                            <div className="w-10 h-5 bg-slate-200 rounded-full peer peer-checked:bg-indigo-500 transition-colors"></div>
                            <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
                        </div>
                        <span className="text-xs font-bold text-slate-600 group-hover/check:text-indigo-600 transition-colors">Nhấn mạnh ý chính</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer group/check">
                        <div className="relative flex items-center">
                            <input 
                                type="checkbox" 
                                className="peer sr-only"
                                checked={config.keepTerms}
                                onChange={e => handleChange('keepTerms', e.target.checked)}
                            />
                            <div className="w-10 h-5 bg-slate-200 rounded-full peer peer-checked:bg-indigo-500 transition-colors"></div>
                            <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
                        </div>
                        <span className="text-xs font-bold text-slate-600 group-hover/check:text-indigo-600 transition-colors">Giữ nguyên thuật ngữ chuyên ngành</span>
                    </label>
                </div>
            </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || !config.subject || !config.topic || !config.content}
          className={`w-full group relative flex items-center justify-center gap-3 py-4 px-6 rounded-2xl text-white font-bold shadow-lg shadow-indigo-200 transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0
            ${(isLoading || !config.subject || !config.topic || !config.content)
              ? 'bg-slate-300 cursor-not-allowed shadow-none' 
              : 'bg-gradient-to-r from-indigo-500 to-purple-500 hover:shadow-indigo-500/30'}`}
        >
          {isLoading ? (
             <>
               <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
               <span className="text-sm">Đang tối ưu...</span>
             </>
          ) : (
            <>
              <Wand2 className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              <span className="text-sm">Tạo Prompt TTS</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default TTSForm;
