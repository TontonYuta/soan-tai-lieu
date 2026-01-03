import React, { useState } from 'react';
import { BookOpen, GraduationCap, Sparkles, Target, Users, Wand2, School, Calendar, Layout, Info } from 'lucide-react';
import { LearningConfig, GenerationStatus } from '../types';

interface LearningFormProps {
  onSubmit: (data: LearningConfig) => void;
  status: GenerationStatus;
}

const LearningForm: React.FC<LearningFormProps> = ({ onSubmit, status }) => {
  const currentYear = new Date().getFullYear();
  const [config, setConfig] = useState<LearningConfig>({
    school: '',
    year: `${currentYear} - ${currentYear + 1}`,
    subject: '',
    grade: '',
    topic: '',
    goal: 'summary',
    tone: 'academic',
    audience: 'Học sinh trung bình - khá'
  });

  const isLoading = status === GenerationStatus.LOADING;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(config);
  };

  const handleChange = (field: keyof LearningConfig, value: any) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const inputClass = "w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-sm font-semibold text-slate-700 placeholder:text-slate-400 shadow-sm group-hover:border-teal-300";
  const labelClass = "block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider";
  const iconClass = "absolute left-3.5 top-3 w-4 h-4 text-slate-400 group-hover:text-teal-500 transition-colors duration-300";
  const selectClass = "w-full pl-10 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-sm font-semibold text-slate-700 shadow-sm appearance-none group-hover:border-teal-300 cursor-pointer";

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 p-6 lg:p-8 h-fit sticky top-28 overflow-y-auto max-h-[calc(100vh-9rem)] scrollbar-hide">
      
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-600 shadow-sm ring-4 ring-teal-50/50">
            <BookOpen className="w-6 h-6" />
        </div>
        <div>
            <h2 className="text-xl font-bold text-slate-800">Tài liệu Học tập</h2>
            <p className="text-xs text-slate-500 font-medium">Soạn bài giảng, phiếu bài tập LaTeX</p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* SECTION 1: INFO */}
        <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-100 space-y-4 hover:border-teal-100 transition-colors duration-300">
             <div className="flex items-center gap-2 mb-2 pb-3 border-b border-slate-200/60">
                <div className="w-6 h-6 rounded-lg bg-white shadow-sm flex items-center justify-center text-teal-600">
                    <Info className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Thông tin chung</h3>
            </div>

            <div className="space-y-4">
                <div className="group relative">
                    <label className={labelClass}>Tên Trường / Sở GD&ĐT</label>
                    <div className="relative">
                        <School className={iconClass} />
                        <input
                            type="text"
                            className={inputClass}
                            placeholder="Vd: THPT Chuyên..."
                            value={config.school}
                            onChange={e => handleChange('school', e.target.value)}
                            required
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="group relative">
                        <label className={labelClass}>Năm học</label>
                        <div className="relative">
                            <Calendar className={iconClass} />
                            <input
                                type="text"
                                className={inputClass}
                                placeholder="Vd: 2024 - 2025"
                                value={config.year}
                                onChange={e => handleChange('year', e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="group relative">
                        <label className={labelClass}>Lớp</label>
                        <div className="relative">
                            <GraduationCap className={iconClass} />
                            <input
                                type="text"
                                className={inputClass}
                                placeholder="Vd: 12"
                                value={config.grade}
                                onChange={e => handleChange('grade', e.target.value)}
                                required
                            />
                        </div>
                    </div>
                </div>

                <div className="group relative">
                    <label className={labelClass}>Môn học</label>
                    <div className="relative">
                        <BookOpen className={iconClass} />
                        <input
                            type="text"
                            className={inputClass}
                            placeholder="Vd: Vật lý"
                            value={config.subject}
                            onChange={e => handleChange('subject', e.target.value)}
                            required
                        />
                    </div>
                </div>
                
                <div className="group relative">
                    <label className={labelClass}>Chủ đề / Tên bài</label>
                    <div className="relative">
                        <Layout className={iconClass} />
                        <input
                            type="text"
                            className={inputClass}
                            placeholder="Vd: Dòng điện xoay chiều"
                            value={config.topic}
                            onChange={e => handleChange('topic', e.target.value)}
                            required
                        />
                    </div>
                </div>
            </div>
        </div>

        {/* SECTION 2: CONTENT CONFIG */}
        <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-100 space-y-4 hover:border-teal-100 transition-colors duration-300">
            <div className="flex items-center gap-2 mb-2 pb-3 border-b border-slate-200/60">
                <div className="w-6 h-6 rounded-lg bg-white shadow-sm flex items-center justify-center text-teal-600">
                    <Target className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Yêu cầu nội dung</h3>
            </div>

            <div className="space-y-4">
                <div className="group relative">
                    <label className={labelClass}>Mục tiêu tài liệu</label>
                    <div className="relative">
                        <Target className={iconClass} />
                        <select 
                            className={selectClass}
                            value={config.goal}
                            onChange={e => handleChange('goal', e.target.value)}
                        >
                            <option value="summary">Tóm tắt / Cheat Sheet</option>
                            <option value="detailed">Bài giảng chi tiết (Lý thuyết + Ví dụ)</option>
                            <option value="exercises">Phiếu bài tập (Có đáp án)</option>
                        </select>
                    </div>
                </div>

                <div className="group relative">
                    <label className={labelClass}>Phong cách viết</label>
                    <div className="relative">
                        <Sparkles className={iconClass} />
                        <select 
                            className={selectClass}
                            value={config.tone}
                            onChange={e => handleChange('tone', e.target.value)}
                        >
                            <option value="academic">Hàn lâm / Chuẩn mực</option>
                            <option value="creative">Sáng tạo / Sinh động</option>
                            <option value="simple">Đơn giản / Cơ bản</option>
                        </select>
                    </div>
                </div>

                <div className="group relative">
                     <label className={labelClass}>Đối tượng học sinh</label>
                     <div className="relative">
                        <Users className={iconClass} />
                        <input
                            type="text"
                            className={inputClass}
                            placeholder="Vd: Mất gốc, Đội tuyển..."
                            value={config.audience}
                            onChange={e => handleChange('audience', e.target.value)}
                        />
                    </div>
                </div>
            </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || !config.subject || !config.topic || !config.school}
          className={`w-full group relative flex items-center justify-center gap-3 py-4 px-6 rounded-2xl text-white font-bold shadow-lg shadow-teal-200 transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0
            ${(isLoading || !config.subject || !config.school)
              ? 'bg-slate-300 cursor-not-allowed shadow-none' 
              : 'bg-gradient-to-r from-teal-500 to-emerald-500 hover:shadow-teal-500/30'}`}
        >
          {isLoading ? (
             <>
               <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
               <span className="text-sm">Đang khởi tạo...</span>
             </>
          ) : (
            <>
              <Wand2 className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              <span className="text-sm">Tạo Prompt Bài Học</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default LearningForm;