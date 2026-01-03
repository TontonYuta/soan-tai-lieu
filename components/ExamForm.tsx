import React, { useState } from 'react';
import { Settings2, Clock, Calculator, School, Calendar, Wand2, BookOpen, GraduationCap, LayoutDashboard, FileSpreadsheet } from 'lucide-react';
import { ExamConfig, GenerationStatus } from '../types';

interface ExamFormProps {
  onSubmit: (data: ExamConfig) => void;
  status: GenerationStatus;
}

const ExamForm: React.FC<ExamFormProps> = ({ onSubmit, status }) => {
  const currentYear = new Date().getFullYear();
  const [config, setConfig] = useState<ExamConfig>({
    school: '',
    examName: 'Kiểm tra Giữa kỳ I',
    year: `${currentYear} - ${currentYear + 1}`,
    subject: '',
    topic: '',
    grade: '12',
    time: 60,
    counts: { mc: 25, essay: 3 },
    matrix: { lv1: 12, lv2: 8, lv3: 5, lv4: 3 }
  });

  const questionsTotal = config.counts.mc + config.counts.essay;
  const matrixTotal = config.matrix.lv1 + config.matrix.lv2 + config.matrix.lv3 + config.matrix.lv4;
  const isMatrixValid = matrixTotal === questionsTotal;
  const isLoading = status === GenerationStatus.LOADING;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isMatrixValid) {
      onSubmit(config);
    }
  };

  const handleChange = (field: keyof ExamConfig, value: any) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleMatrixChange = (key: keyof typeof config.matrix, value: string) => {
    const num = parseInt(value) || 0;
    setConfig(prev => ({
      ...prev,
      matrix: { ...prev.matrix, [key]: num }
    }));
  };

  const handleCountChange = (key: keyof typeof config.counts, value: string) => {
    const num = parseInt(value) || 0;
    setConfig(prev => ({
      ...prev,
      counts: { ...prev.counts, [key]: num }
    }));
  };

  const inputClass = "w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-semibold text-slate-700 placeholder:text-slate-400 shadow-sm group-hover:border-indigo-300";
  const labelClass = "block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider";
  const iconClass = "absolute left-3.5 top-3 w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors duration-300";

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 p-6 lg:p-8 h-fit sticky top-28 overflow-y-auto max-h-[calc(100vh-9rem)] scrollbar-hide">
      
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm ring-4 ring-indigo-50/50">
            <Settings2 className="w-6 h-6" />
        </div>
        <div>
            <h2 className="text-xl font-bold text-slate-800">Cấu hình Đề thi</h2>
            <p className="text-xs text-slate-500 font-medium">Thiết lập thông số để tạo đề chuẩn LaTeX</p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* SECTION 1: INFO */}
        <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-100 space-y-4 hover:border-indigo-100 transition-colors duration-300">
            <div className="flex items-center gap-2 mb-2 pb-3 border-b border-slate-200/60">
                <div className="w-6 h-6 rounded-lg bg-white shadow-sm flex items-center justify-center text-indigo-600">
                    <School className="w-3.5 h-3.5" />
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
                            placeholder="Vd: Sở GD&ĐT Hà Nội"
                            value={config.school}
                            onChange={e => handleChange('school', e.target.value)}
                            required
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                     <div className="group relative">
                        <label className={labelClass}>Tên kỳ thi</label>
                        <div className="relative">
                            <FileSpreadsheet className={iconClass} />
                            <input
                                type="text"
                                className={inputClass}
                                placeholder="Vd: Giữa kỳ I"
                                value={config.examName}
                                onChange={e => handleChange('examName', e.target.value)}
                                required
                            />
                        </div>
                    </div>
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
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="group relative">
                        <label className={labelClass}>Môn học</label>
                        <div className="relative">
                            <BookOpen className={iconClass} />
                            <input
                                type="text"
                                className={inputClass}
                                placeholder="Vd: Toán"
                                value={config.subject}
                                onChange={e => handleChange('subject', e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <div className="group relative">
                        <label className={labelClass}>Khối lớp</label>
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
                    <label className={labelClass}>Chủ đề bài học</label>
                    <div className="relative">
                        <LayoutDashboard className={iconClass} />
                        <input
                            type="text"
                            className={inputClass}
                            placeholder="Vd: Khảo sát hàm số..."
                            value={config.topic}
                            onChange={e => handleChange('topic', e.target.value)}
                            required
                        />
                    </div>
                </div>

                 <div className="group relative">
                    <label className={labelClass}>Thời gian làm bài</label>
                    <div className="relative">
                        <Clock className={iconClass} />
                        <input
                            type="number"
                            min="1"
                            className={inputClass}
                            value={config.time}
                            onChange={e => handleChange('time', parseInt(e.target.value) || 0)}
                        />
                        <div className="absolute right-4 top-2.5 text-xs font-bold text-slate-400 py-1">phút</div>
                    </div>
                </div>
            </div>
        </div>

        {/* SECTION 2: STRUCTURE */}
        <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-100 space-y-4 hover:border-indigo-100 transition-colors duration-300">
            <div className="flex justify-between items-center mb-2 pb-3 border-b border-slate-200/60">
                <div className="flex items-center gap-2">
                     <div className="w-6 h-6 rounded-lg bg-white shadow-sm flex items-center justify-center text-indigo-600">
                        <Calculator className="w-3.5 h-3.5" />
                    </div>
                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Cấu trúc đề</h3>
                </div>
                <div className="px-3 py-1 bg-white rounded-lg border border-slate-200 text-xs font-bold text-slate-600 shadow-sm">
                    Tổng: {questionsTotal} câu
                </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm hover:border-indigo-300 transition-all">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Trắc nghiệm</label>
                    <input
                        type="number"
                        min="0"
                        className="w-full bg-transparent border-none p-0 text-xl font-bold text-slate-700 focus:ring-0"
                        value={config.counts.mc}
                        onChange={e => handleCountChange('mc', e.target.value)}
                    />
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm hover:border-indigo-300 transition-all">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Tự luận</label>
                    <input
                        type="number"
                        min="0"
                        className="w-full bg-transparent border-none p-0 text-xl font-bold text-slate-700 focus:ring-0"
                        value={config.counts.essay}
                        onChange={e => handleCountChange('essay', e.target.value)}
                    />
                </div>
            </div>
        </div>

        {/* SECTION 3: MATRIX */}
        <div className={`p-5 rounded-2xl bg-slate-50/80 border space-y-4 transition-colors duration-300 ${isMatrixValid ? 'border-slate-100 hover:border-indigo-100' : 'border-red-200 bg-red-50/50'}`}>
             <div className="flex justify-between items-center mb-2 pb-3 border-b border-slate-200/60">
                <div className="flex items-center gap-2">
                     <div className={`w-6 h-6 rounded-lg shadow-sm flex items-center justify-center ${isMatrixValid ? 'bg-white text-indigo-600' : 'bg-red-100 text-red-500'}`}>
                        <Calculator className="w-3.5 h-3.5" />
                    </div>
                    <h3 className={`text-xs font-bold uppercase tracking-wide ${isMatrixValid ? 'text-slate-700' : 'text-red-600'}`}>Ma trận độ khó</h3>
                </div>
                <div className={`px-3 py-1 rounded-lg border text-xs font-bold shadow-sm flex items-center gap-1.5 ${isMatrixValid ? 'bg-white border-slate-200 text-slate-600' : 'bg-red-100 border-red-200 text-red-600'}`}>
                    <span>{matrixTotal}/{questionsTotal}</span>
                </div>
             </div>
             
             <div className="grid grid-cols-4 gap-2">
                 {[
                     { k: 'lv1', l: 'NB', full: 'Nhận biết', c: 'text-blue-600 bg-blue-50/50 border-blue-100' },
                     { k: 'lv2', l: 'TH', full: 'Thông hiểu', c: 'text-emerald-600 bg-emerald-50/50 border-emerald-100' },
                     { k: 'lv3', l: 'VD', full: 'Vận dụng', c: 'text-amber-600 bg-amber-50/50 border-amber-100' },
                     { k: 'lv4', l: 'VDC', full: 'V.D Cao', c: 'text-rose-600 bg-rose-50/50 border-rose-100' }
                 ].map((item) => (
                     <div key={item.k} className={`p-2 rounded-xl border ${item.c} hover:shadow-sm transition-all text-center group`}>
                        <label className="block text-[9px] font-bold uppercase opacity-70 mb-1 cursor-help" title={item.full}>{item.l}</label>
                        <input 
                            type="number" 
                            min="0"
                            className="w-full bg-transparent border-none p-0 text-center text-lg font-bold focus:ring-0"
                            value={(config.matrix as any)[item.k]}
                            onChange={e => handleMatrixChange(item.k as any, e.target.value)}
                        />
                     </div>
                 ))}
             </div>
             {!isMatrixValid && (
                 <div className="text-[11px] text-red-600 font-medium text-center animate-pulse">
                    Tổng số câu chưa khớp!
                 </div>
             )}
        </div>

        <button
          type="submit"
          disabled={isLoading || !config.subject || !config.topic || !isMatrixValid}
          className={`w-full group relative flex items-center justify-center gap-3 py-4 px-6 rounded-2xl text-white font-bold shadow-lg shadow-indigo-200 transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0
            ${(isLoading || !isMatrixValid)
              ? 'bg-slate-300 cursor-not-allowed shadow-none' 
              : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:shadow-indigo-500/30'}`}
        >
          {isLoading ? (
             <>
               <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
               <span className="text-sm">Đang khởi tạo...</span>
             </>
          ) : (
            <>
              <Wand2 className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              <span className="text-sm">Tạo Prompt Đề Thi</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default ExamForm;