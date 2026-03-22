
import React, { useState } from 'react';
import { ClipboardList, PlusCircle, Sparkles, Wand2, BookOpen, Layout, Info, HelpCircle } from 'lucide-react';
import { SimilarExerciseConfig, GenerationStatus } from '../types';

interface SimilarExerciseFormProps {
  onSubmit: (data: SimilarExerciseConfig) => void;
  status: GenerationStatus;
}

const SimilarExerciseForm: React.FC<SimilarExerciseFormProps> = ({ onSubmit, status }) => {
  const [config, setConfig] = useState<SimilarExerciseConfig>({
    subject: '',
    topic: '',
    count: 3,
    difficulty: 'keep',
    sourceExercises: '',
    includeSolution: true
  });

  const isLoading = status === GenerationStatus.LOADING;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(config);
  };

  const handleChange = (field: keyof SimilarExerciseConfig, value: any) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const inputClass = "w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-sm font-semibold text-slate-700 placeholder:text-slate-400 shadow-sm group-hover:border-amber-300";
  const labelClass = "block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider";
  const iconClass = "absolute left-3.5 top-3 w-4 h-4 text-slate-400 group-hover:text-amber-500 transition-colors duration-300";
  const selectClass = "w-full pl-10 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-sm font-semibold text-slate-700 shadow-sm appearance-none group-hover:border-amber-300 cursor-pointer";
  const textareaClass = "w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-sm font-semibold text-slate-700 placeholder:text-slate-400 shadow-sm group-hover:border-amber-300 min-h-[150px]";

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 p-6 lg:p-8 h-fit sticky top-28 overflow-y-auto max-h-[calc(100vh-9rem)] scrollbar-hide">
      
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 shadow-sm ring-4 ring-amber-50/50">
            <PlusCircle className="w-6 h-6" />
        </div>
        <div>
            <h2 className="text-xl font-bold text-slate-800">Bài tập Tương tự</h2>
            <p className="text-xs text-slate-500 font-medium">Tạo bài tập mới từ bài mẫu có sẵn</p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* SECTION 1: INFO */}
        <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-100 space-y-4 hover:border-amber-100 transition-colors duration-300">
             <div className="flex items-center gap-2 mb-2 pb-3 border-b border-slate-200/60">
                <div className="w-6 h-6 rounded-lg bg-white shadow-sm flex items-center justify-center text-amber-600">
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
                            placeholder="Vd: Toán học, Hóa học..."
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
                            placeholder="Vd: Đạo hàm, Este..."
                            value={config.topic}
                            onChange={e => handleChange('topic', e.target.value)}
                            required
                        />
                    </div>
                </div>
            </div>
        </div>

        {/* SECTION 2: SOURCE EXERCISES */}
        <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-100 space-y-4 hover:border-amber-100 transition-colors duration-300">
            <div className="flex items-center gap-2 mb-2 pb-3 border-b border-slate-200/60">
                <div className="w-6 h-6 rounded-lg bg-white shadow-sm flex items-center justify-center text-amber-600">
                    <ClipboardList className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Bài tập mẫu (Dán vào đây)</h3>
            </div>

            <div className="group relative">
                <div className="relative">
                    <HelpCircle className={iconClass} />
                    <textarea
                        className={textareaClass}
                        placeholder="Dán các bài tập mẫu bạn muốn AI dựa vào để tạo bài tương tự..."
                        value={config.sourceExercises}
                        onChange={e => handleChange('sourceExercises', e.target.value)}
                        required
                    />
                </div>
            </div>
        </div>

        {/* SECTION 3: OPTIONS */}
        <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-100 space-y-4 hover:border-amber-100 transition-colors duration-300">
            <div className="flex items-center gap-2 mb-2 pb-3 border-b border-slate-200/60">
                <div className="w-6 h-6 rounded-lg bg-white shadow-sm flex items-center justify-center text-amber-600">
                    <Sparkles className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Tùy chỉnh bài tập mới</h3>
            </div>

            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="group relative">
                        <label className={labelClass}>Số lượng bài</label>
                        <div className="relative">
                            <PlusCircle className={iconClass} />
                            <input
                                type="number"
                                min="1"
                                max="10"
                                className={inputClass}
                                value={config.count}
                                onChange={e => handleChange('count', parseInt(e.target.value))}
                            />
                        </div>
                    </div>
                    <div className="group relative">
                        <label className={labelClass}>Độ khó</label>
                        <div className="relative">
                            <Sparkles className={iconClass} />
                            <select 
                                className={selectClass}
                                value={config.difficulty}
                                onChange={e => handleChange('difficulty', e.target.value)}
                            >
                                <option value="keep">Giữ nguyên</option>
                                <option value="easier">Dễ hơn</option>
                                <option value="harder">Khó hơn</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-3">
                    <label className="flex items-center gap-3 cursor-pointer group/check">
                        <div className="relative flex items-center">
                            <input 
                                type="checkbox" 
                                className="peer sr-only"
                                checked={config.includeSolution}
                                onChange={e => handleChange('includeSolution', e.target.checked)}
                            />
                            <div className="w-10 h-5 bg-slate-200 rounded-full peer peer-checked:bg-amber-500 transition-colors"></div>
                            <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
                        </div>
                        <span className="text-xs font-bold text-slate-600 group-hover/check:text-amber-600 transition-colors">Bao gồm lời giải chi tiết</span>
                    </label>
                </div>
            </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || !config.subject || !config.topic || !config.sourceExercises}
          className={`w-full group relative flex items-center justify-center gap-3 py-4 px-6 rounded-2xl text-white font-bold shadow-lg shadow-amber-200 transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0
            ${(isLoading || !config.subject || !config.topic || !config.sourceExercises)
              ? 'bg-slate-300 cursor-not-allowed shadow-none' 
              : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:shadow-amber-500/30'}`}
        >
          {isLoading ? (
             <>
               <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
               <span className="text-sm">Đang tạo bài tập...</span>
             </>
          ) : (
            <>
              <Wand2 className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              <span className="text-sm">Tạo Prompt Bài Tập</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default SimilarExerciseForm;
