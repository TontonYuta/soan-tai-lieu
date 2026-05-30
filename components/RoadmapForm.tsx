
import React, { useState } from 'react';
import { Target, Zap, Clock, BookOpen, GraduationCap, Wand2, Map, FileText, ClipboardList } from 'lucide-react';
import { RoadmapConfig, GenerationStatus } from '../types';

interface RoadmapFormProps {
  onSubmit: (data: RoadmapConfig) => void;
  status: GenerationStatus;
}

const RoadmapForm: React.FC<RoadmapFormProps> = ({ onSubmit, status }) => {
  const [config, setConfig] = useState<RoadmapConfig>({
    subject: '',
    topic: '',
    duration: '14 ngày',
    currentLevel: 'Mới bắt đầu / Mất gốc',
    target: 'Nắm vững kiến thức cơ bản và giải được các bài tập mức độ thông hiểu',
    syllabus: ''
  });

  const isLoading = status === GenerationStatus.LOADING;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(config);
  };

  const handleChange = (field: keyof RoadmapConfig, value: any) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const inputClass = "w-full pl-10 pr-4 py-2.5 bg-[#ffffff] border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-sm font-semibold text-slate-700 placeholder:text-slate-600 shadow-sm";
  const labelClass = "block text-[11px] font-bold text-slate-700 mb-1.5 uppercase tracking-wider";
  const iconClass = "absolute left-3.5 top-3 w-4 h-4 text-slate-600 group-hover:text-amber-500 transition-colors";

  return (
    <div className="bg-[#ffffff]/80 backdrop-blur-xl rounded-[2rem] shadow-xl border border-white/60 p-6 lg:p-8 animate-in slide-in-from-left-4 duration-500 scrollbar-hide">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 shadow-sm ring-4 ring-amber-50/50">
            <Map className="w-6 h-6" />
        </div>
        <div>
            <h2 className="text-xl font-bold text-slate-800">Lộ trình Học tập</h2>
            <p className="text-xs text-slate-700 font-medium">Cá nhân hóa theo đề cương có sẵn</p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="p-5 rounded-2xl bg-white border border-slate-100 space-y-4">
            <div className="group relative">
                <label className={labelClass}>Môn học</label>
                <div className="relative">
                    <BookOpen className={iconClass} />
                    <input
                        type="text"
                        className={inputClass}
                        placeholder="Vd: Toán cao cấp A1, Giải tích..."
                        value={config.subject}
                        onChange={e => handleChange('subject', e.target.value)}
                        required
                    />
                </div>
            </div>

            <div className="group relative">
                <label className={labelClass}>Mục tiêu lộ trình</label>
                <div className="relative">
                    <Target className={iconClass} />
                    <input
                        type="text"
                        className={inputClass}
                        placeholder="Vd: Ôn thi cuối kỳ, Học lấy gốc..."
                        value={config.topic}
                        onChange={e => handleChange('topic', e.target.value)}
                        required
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="group relative">
                    <label className={labelClass}>Tổng thời gian</label>
                    <div className="relative">
                        <Clock className={iconClass} />
                        <input
                            type="text"
                            className={inputClass}
                            placeholder="Vd: 30 ngày..."
                            value={config.duration}
                            onChange={e => handleChange('duration', e.target.value)}
                            required
                        />
                    </div>
                </div>
                <div className="group relative">
                    <label className={labelClass}>Trình độ</label>
                    <div className="relative">
                        <Zap className={iconClass} />
                        <input
                            type="text"
                            className={inputClass}
                            placeholder="Vd: Đã biết cơ bản"
                            value={config.currentLevel}
                            onChange={e => handleChange('currentLevel', e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="group relative">
                <label className={labelClass}>Đề cương có sẵn (Tùy chọn)</label>
                <div className="relative">
                    <ClipboardList className="absolute left-3.5 top-3 w-4 h-4 text-indigo-400" />
                    <textarea
                        className={`${inputClass} pl-10 min-h-[100px] pt-3 border-indigo-100 bg-indigo-50/20 focus:ring-indigo-500/20 focus:border-indigo-500`}
                        placeholder="Dán nội dung đề cương môn học (Vd: Đề cương Bách Khoa, Syllabus khóa học...) AI sẽ bám sát nội dung này."
                        value={config.syllabus}
                        onChange={e => handleChange('syllabus', e.target.value)}
                    />
                </div>
                <p className="text-[9px] text-slate-600 font-bold mt-1.5 flex items-center gap-1 uppercase">
                    <FileText className="w-3 h-3" />
                    AI sẽ lập lộ trình dựa trên thứ tự chương mục trong đề cương.
                </p>
            </div>

            <div className="group relative">
                <label className={labelClass}>Kết quả mong muốn</label>
                <div className="relative">
                    <GraduationCap className={iconClass} />
                    <textarea
                        className={`${inputClass} pl-10 min-h-[80px] pt-3`}
                        placeholder="Vd: Đạt điểm A, Làm được các bài tập phức tạp..."
                        value={config.target}
                        onChange={e => handleChange('target', e.target.value)}
                    />
                </div>
            </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || !config.subject || !config.topic}
          className={`w-full group flex items-center justify-center gap-3 py-4 px-6 rounded-2xl text-white font-bold shadow-lg shadow-amber-200 transition-all duration-300
            ${isLoading ? 'bg-slate-300 cursor-not-allowed' : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:shadow-amber-500/30'}`}
        >
          {isLoading ? (
             <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
          ) : (
            <>
              <Wand2 className="w-5 h-5" />
              Tạo Lộ Trình Theo Đề Cương
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default RoadmapForm;
