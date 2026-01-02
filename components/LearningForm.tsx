import React, { useState } from 'react';
import { BookOpen, GraduationCap, Sparkles, Target, Users, Wand2, School, Calendar } from 'lucide-react';
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

  const inputClass = "w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:bg-white transition-all text-sm font-medium shadow-sm hover:border-teal-300";
  const labelClass = "block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide";
  const selectClass = "w-full pl-3 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:bg-white transition-all text-sm font-medium shadow-sm hover:border-teal-300 appearance-none";

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 p-6 h-fit sticky top-24 overflow-y-auto max-h-[calc(100vh-8rem)]">
      <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-3 pb-4 border-b border-slate-100">
        <div className="p-2 bg-teal-50 rounded-lg text-teal-600">
            <BookOpen className="w-5 h-5" />
        </div>
        Soạn Bài Học (LaTeX)
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Thông tin cơ bản */}
        <div className="space-y-4">
             <div className="flex items-center gap-2 mb-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-teal-100 text-teal-600 text-xs font-bold">1</span>
                <h3 className="text-sm font-bold text-slate-800">Thông tin chung</h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {/* School */}
                <div className="col-span-2 group">
                    <label className={labelClass}>Tên Trường / Sở GD&ĐT</label>
                    <div className="relative">
                        <School className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 group-hover:text-teal-500 transition-colors" />
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

                 {/* Year */}
                 <div className="group">
                    <label className={labelClass}>Năm học</label>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 group-hover:text-teal-500 transition-colors" />
                        <input
                            type="text"
                            className={inputClass}
                            placeholder="Vd: 2024 - 2025"
                            value={config.year}
                            onChange={e => handleChange('year', e.target.value)}
                        />
                    </div>
                </div>

                <div className="group">
                    <label className={labelClass}>Lớp</label>
                    <div className="relative">
                        <GraduationCap className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 group-hover:text-teal-500 transition-colors" />
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

                <div className="group col-span-2">
                    <label className={labelClass}>Môn học</label>
                    <input
                        type="text"
                        className={`${inputClass} pl-3`}
                        placeholder="Vd: Vật lý, Lịch sử, Toán..."
                        value={config.subject}
                        onChange={e => handleChange('subject', e.target.value)}
                        required
                    />
                </div>
                
                <div className="group col-span-2">
                    <label className={labelClass}>Chủ đề / Tên bài</label>
                    <input
                        type="text"
                        className={`${inputClass} pl-3`}
                        placeholder="Vd: Khảo sát sự biến thiên và vẽ đồ thị hàm số"
                        value={config.topic}
                        onChange={e => handleChange('topic', e.target.value)}
                        required
                    />
                </div>
            </div>
        </div>

        {/* Cấu hình nội dung */}
        <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-orange-100 text-orange-600 text-xs font-bold">2</span>
                <h3 className="text-sm font-bold text-slate-800">Yêu cầu nội dung</h3>
            </div>

            <div className="space-y-4">
                <div className="group">
                    <label className={labelClass}>Mục tiêu tài liệu</label>
                    <div className="relative">
                        <Target className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                        <select 
                            className={`${selectClass} pl-9`}
                            value={config.goal}
                            onChange={e => handleChange('goal', e.target.value)}
                        >
                            <option value="summary">Tóm tắt / Cheat Sheet (Ngắn gọn)</option>
                            <option value="detailed">Bài giảng chi tiết (Lý thuyết + Ví dụ)</option>
                            <option value="exercises">Phiếu bài tập (Có đáp án)</option>
                        </select>
                    </div>
                </div>

                <div className="group">
                    <label className={labelClass}>Phong cách viết</label>
                    <div className="relative">
                        <Sparkles className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                        <select 
                            className={`${selectClass} pl-9`}
                            value={config.tone}
                            onChange={e => handleChange('tone', e.target.value)}
                        >
                            <option value="academic">Hàn lâm / Chuẩn mực (SGK)</option>
                            <option value="creative">Sáng tạo / Sinh động</option>
                            <option value="simple">Đơn giản / Cơ bản (Cho người mất gốc)</option>
                        </select>
                    </div>
                </div>

                <div className="group">
                     <label className={labelClass}>Đối tượng học sinh</label>
                     <div className="relative">
                        <Users className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 group-hover:text-teal-500 transition-colors" />
                        <input
                            type="text"
                            className={inputClass}
                            placeholder="Vd: Học sinh mất gốc, Học sinh đội tuyển..."
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
          className={`w-full group relative flex items-center justify-center gap-2 py-4 px-6 rounded-2xl text-white font-bold shadow-lg transition-all duration-300 transform hover:-translate-y-1
            ${(isLoading || !config.subject || !config.school)
              ? 'bg-slate-300 cursor-not-allowed shadow-none' 
              : 'bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-500 bg-[length:200%_auto] hover:bg-right hover:shadow-teal-500/30'}`}
        >
          {isLoading ? (
             <>
               <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
               Đang xử lý...
             </>
          ) : (
            <>
              <Wand2 className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              Tạo Bài Học (LaTeX)
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default LearningForm;