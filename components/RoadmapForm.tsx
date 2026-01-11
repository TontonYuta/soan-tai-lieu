
import React, { useState } from 'react';
import { Route, Target, Zap, Clock, BookOpen, GraduationCap, Wand2, Info, Map } from 'lucide-react';
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
    target: 'Nắm vững kiến thức cơ bản và giải được các bài tập mức độ thông hiểu'
  });

  const isLoading = status === GenerationStatus.LOADING;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(config);
  };

  const handleChange = (field: keyof RoadmapConfig, value: any) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const inputClass = "w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-sm font-semibold text-slate-700 placeholder:text-slate-400 shadow-sm";
  const labelClass = "block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider";
  const iconClass = "absolute left-3.5 top-3 w-4 h-4 text-slate-400 group-hover:text-amber-500 transition-colors";

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-xl border border-white/60 p-6 lg:p-8 animate-in slide-in-from-left-4 duration-500">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 shadow-sm ring-4 ring-amber-50/50">
            <Map className="w-6 h-6" />
        </div>
        <div>
            <h2 className="text-xl font-bold text-slate-800">Lộ trình Học tập</h2>
            <p className="text-xs text-slate-500 font-medium">Thiết kế con đường chinh phục kiến thức</p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-100 space-y-4">
            <div className="group relative">
                <label className={labelClass}>Môn học</label>
                <div className="relative">
                    <BookOpen className={iconClass} />
                    <input
                        type="text"
                        className={inputClass}
                        placeholder="Vd: Toán học, Tiếng Anh..."
                        value={config.subject}
                        onChange={e => handleChange('subject', e.target.value)}
                        required
                    />
                </div>
            </div>

            <div className="group relative">
                <label className={labelClass}>Mục tiêu đề ra</label>
                <div className="relative">
                    <Target className={iconClass} />
                    <input
                        type="text"
                        className={inputClass}
                        placeholder="Vd: Lấy gốc hình học 12, IELTS 7.0..."
                        value={config.topic}
                        onChange={e => handleChange('topic', e.target.value)}
                        required
                    />
                </div>
            </div>

            <div className="group relative">
                <label className={labelClass}>Tổng thời gian</label>
                <div className="relative">
                    <Clock className={iconClass} />
                    <input
                        type="text"
                        className={inputClass}
                        placeholder="Vd: 7 ngày, 30 ngày..."
                        value={config.duration}
                        onChange={e => handleChange('duration', e.target.value)}
                        required
                    />
                </div>
            </div>

            <div className="group relative">
                <label className={labelClass}>Trình độ hiện tại</label>
                <div className="relative">
                    <Zap className={iconClass} />
                    <input
                        type="text"
                        className={inputClass}
                        placeholder="Vd: Chưa biết gì, Đã có nền tảng..."
                        value={config.currentLevel}
                        onChange={e => handleChange('currentLevel', e.target.value)}
                    />
                </div>
            </div>

            <div className="group relative">
                <label className={labelClass}>Kết quả mong muốn</label>
                <div className="relative">
                    <GraduationCap className={iconClass} />
                    <textarea
                        className={`${inputClass} pl-10 min-h-[80px] pt-3`}
                        placeholder="Vd: Làm được bài tập vận dụng cao, Thi đạt 8.0..."
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
              Tạo Lộ Trình Từng Ngày
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default RoadmapForm;
