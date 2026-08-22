import React, { useState } from 'react';
import { Map, Target, Calendar, Award, Wand2, Info, ChevronDown, BookOpen } from "lucide-react";
import { RoadmapConfig, GenerationStatus } from '../types';

interface RoadmapFormProps {
  onSubmit: (data: RoadmapConfig) => void;
  status: GenerationStatus;
}

const RoadmapForm: React.FC<RoadmapFormProps> = ({ onSubmit, status }) => {
  const [config, setConfig] = useState<RoadmapConfig>({
    subject: 'Toán học',
    topic: '',
    duration: '4 tuần',
    currentLevel: 'Mất gốc / Căn bản',
    target: 'Đạt điểm 8+ thi THPT Quốc gia',
    syllabus: '',
    language: 'vietnamese',
    details: ''
  });

  const isLoading = status === GenerationStatus.LOADING;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (config.subject && config.topic) {
      onSubmit(config);
    }
  };

  const handleChange = (field: keyof RoadmapConfig, value: any) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const inputClass = "w-full pl-10 pr-4 py-2.5 bg-[#ffffff] rounded-none border-[3px] border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] focus:ring-0 focus:translate-y-1 focus:translate-x-1 focus:shadow-none transition-all text-sm font-bold text-black placeholder:text-gray-500 uppercase";
  const selectClass = "w-full pl-10 pr-8 py-2.5 bg-[#ffffff] rounded-none border-[3px] border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] focus:ring-0 focus:translate-y-1 focus:translate-x-1 focus:shadow-none transition-all text-sm font-bold text-black uppercase cursor-pointer appearance-none";
  const labelClass = "block text-xs font-black text-black mb-1.5 uppercase tracking-widest";
  const iconClass = "pointer-events-none absolute left-3.5 top-[13px] w-4 h-4 text-black font-black";

  return (
    <div className="bg-[#ffffff] rounded-none shadow-[8px_8px_0_0_rgba(0,0,0,1)] border-4 border-black p-6 lg:p-8 h-fit sticky top-28 overflow-y-auto max-h-[calc(100vh-9rem)] scrollbar-hide">
      
      <div className="flex items-center gap-4 mb-8 border-b-4 border-black pb-4">
        <div className="w-12 h-12 bg-[#FF5E5B] flex items-center justify-center text-black border-4 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] rounded-none">
            <Map className="w-6 h-6 stroke-[3]" />
        </div>
        <div>
            <h2 className="text-2xl font-black text-black uppercase tracking-widest">Lộ Trình Học Tập</h2>
            <p className="text-xs text-black font-bold uppercase tracking-wider">Kế hoạch A - Z chuẩn LaTeX</p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* SECTION 1: INFO */}
        <div className="p-5 bg-[#ffffff] border-[3px] border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] space-y-4">
             <div className="flex items-center gap-2 mb-2 pb-3 border-b-4 border-black">
                <div className="w-6 h-6 bg-[#FFED66] border-2 border-black flex items-center justify-center text-black">
                    <Info className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <h3 className="text-sm font-black text-black uppercase tracking-wider">Thông tin lộ trình</h3>
            </div>

            <div className="space-y-4">
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
                      <label className={labelClass}>Thời gian dự kiến</label>
                      <div className="relative">
                          <Calendar className={iconClass} />
                          <input
                              type="text"
                              className={inputClass}
                              placeholder="Vd: 4 tuần, 2 tháng..."
                              value={config.duration}
                              onChange={e => handleChange('duration', e.target.value)}
                              required
                          />
                      </div>
                  </div>
                </div>

                <div className="group relative">
                    <label className={labelClass}>Chủ đề / Chuyên đề</label>
                    <div className="relative">
                        <Target className={iconClass} />
                        <input
                            type="text"
                            className={inputClass}
                            placeholder="Vd: Hàm số & Hình không gian Oxyz"
                            value={config.topic}
                            onChange={e => handleChange('topic', e.target.value)}
                            required
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="group relative">
                      <label className={labelClass}>Trình độ hiện tại</label>
                      <div className="relative">
                          <Award className={iconClass} />
                          <input
                              type="text"
                              className={inputClass}
                              placeholder="Mất gốc, căn bản..."
                              value={config.currentLevel}
                              onChange={e => handleChange('currentLevel', e.target.value)}
                              required
                          />
                      </div>
                  </div>

                  <div className="group relative">
                      <label className={labelClass}>Mục tiêu đầu ra</label>
                      <div className="relative">
                          <Award className={iconClass} />
                          <input
                              type="text"
                              className={inputClass}
                              placeholder="Đạt điểm 8+ THPT"
                              value={config.target}
                              onChange={e => handleChange('target', e.target.value)}
                              required
                          />
                      </div>
                  </div>
                </div>

                <div className="group relative">
                    <label className={labelClass}>Ngôn ngữ</label>
                    <div className="relative">
                        <Wand2 className={iconClass} />
                        <select
                            className={selectClass}
                            value={config.language || 'vietnamese'}
                            onChange={e => handleChange('language', e.target.value)}
                        >
                            <option value="vietnamese">Tiếng Việt</option>
                            <option value="bilingual">Song ngữ Anh - Việt</option>
                            <option value="english">Tiếng Anh</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black pointer-events-none stroke-[3]" />
                    </div>
                </div>

                <div className="group relative mt-2">
                    <label className={labelClass}>Yêu cầu nâng cao / Đề cương sẵn có (Tùy chọn)</label>
                    <textarea
                        className="w-full p-3 bg-[#ffffff] rounded-none border-[3px] border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] text-sm font-medium text-black placeholder:text-gray-500 min-h-[70px]"
                        placeholder="Vd: Chia theo 4 giai đoạn, mỗi tuần kèm bài tập tự luyện và checkpoint đánh giá..."
                        value={config.details || ''}
                        onChange={e => handleChange('details', e.target.value)}
                    />
                </div>
            </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || !config.subject || !config.topic}
          className={`w-full relative flex items-center justify-center gap-3 py-4 px-6 rounded-none text-black font-black uppercase tracking-widest text-lg border-4 border-black shadow-[6px_6px_0_0_rgba(0,0,0,1)] transition-all duration-75 active:translate-y-[6px] active:translate-x-[6px] active:shadow-none
            ${(isLoading || !config.subject || !config.topic)
              ? 'bg-[#E2E8F0] cursor-not-allowed text-gray-500 shadow-none border-gray-400' 
              : 'bg-[#FF5E5B] hover:bg-[#E04845]'}`}
        >
          {isLoading ? (
             <>
               <span className="w-5 h-5 border-4 border-black border-t-transparent rounded-full animate-spin"/>
               <span>Đang tạo lộ trình...</span>
             </>
          ) : (
            <>
              <Wand2 className="w-6 h-6 stroke-[3]" />
              <span>Tạo Lộ Trình LaTeX</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default RoadmapForm;