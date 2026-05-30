import React, { useState } from 'react';
import { Settings2, Clock, ListChecks, PieChart, GraduationCap, ChevronRight, Calculator, School, Calendar, Wand2 } from 'lucide-react';
import { ExamConfig, GenerationStatus } from '../types';

interface InputFormProps {
  onSubmit: (data: ExamConfig) => void;
  status: GenerationStatus;
}

const InputForm: React.FC<InputFormProps> = ({ onSubmit, status }) => {
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
    matrix: { lv1: 12, lv2: 8, lv3: 5, lv4: 3 } // Totals 28 initially
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

  // Helper for input classes
  const inputClass = "w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-[#ffffff] transition-all text-sm font-medium shadow-sm hover:border-indigo-300";
  const labelClass = "block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide";

  return (
    <div className="bg-[#ffffff]/80 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 p-6 h-fit sticky top-24 overflow-y-auto max-h-[calc(100vh-8rem)]">
      <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-3 pb-4 border-b border-slate-100">
        <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
            <Settings2 className="w-5 h-5" />
        </div>
        Thiết lập đề thi
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* NHÓM 1: THÔNG TIN CƠ BẢN */}
        <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs font-bold">1</span>
                <h3 className="text-sm font-bold text-slate-800">Thông tin chung</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                {/* School */}
                <div className="col-span-2 group">
                    <label className={labelClass}>Tên Trường / Sở GD&ĐT</label>
                    <div className="relative transition-transform duration-200 origin-left">
                        <School className="absolute left-3 top-2.5 w-4 h-4 text-slate-600 group-hover:text-indigo-500 transition-colors" />
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

                {/* Exam Name & Year */}
                <div className="group">
                    <label className={labelClass}>Tên kỳ thi</label>
                    <input
                        type="text"
                        className={`${inputClass} pl-3`}
                        placeholder="Vd: Giữa kỳ I"
                        value={config.examName}
                        onChange={e => handleChange('examName', e.target.value)}
                        required
                    />
                </div>
                <div className="group">
                    <label className={labelClass}>Năm học</label>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-slate-600 group-hover:text-indigo-500 transition-colors" />
                        <input
                            type="text"
                            className={inputClass}
                            placeholder="Vd: 2024 - 2025"
                            value={config.year}
                            onChange={e => handleChange('year', e.target.value)}
                        />
                    </div>
                </div>

                {/* Subject & Grade */}
                <div className="group">
                    <label className={labelClass}>Môn học</label>
                    <input
                        type="text"
                        className={`${inputClass} pl-3`}
                        placeholder="Vd: Toán"
                        value={config.subject}
                        onChange={e => handleChange('subject', e.target.value)}
                        required
                    />
                </div>
                <div className="group">
                    <label className={labelClass}>Lớp / Trình độ</label>
                    <div className="relative">
                        <GraduationCap className="absolute left-3 top-2.5 w-4 h-4 text-slate-600 group-hover:text-indigo-500 transition-colors" />
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

                {/* Time */}
                <div className="group">
                    <label className={labelClass}>Thời gian (phút)</label>
                    <div className="relative">
                        <Clock className="absolute left-3 top-2.5 w-4 h-4 text-slate-600 group-hover:text-indigo-500 transition-colors" />
                        <input
                            type="number"
                            min="1"
                            className={inputClass}
                            value={config.time}
                            onChange={e => handleChange('time', parseInt(e.target.value) || 0)}
                        />
                    </div>
                </div>
                
                {/* Topic */}
                <div className="col-span-2 group">
                    <label className={labelClass}>Chủ đề bài học</label>
                    <input
                        type="text"
                        className={`${inputClass} pl-3`}
                        placeholder="Vd: Khảo sát hàm số..."
                        value={config.topic}
                        onChange={e => handleChange('topic', e.target.value)}
                        required
                    />
                </div>
            </div>
        </div>

        {/* NHÓM 2: CẤU TRÚC */}
        <div className="space-y-4">
            <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-100 text-purple-600 text-xs font-bold">2</span>
                    <h3 className="text-sm font-bold text-slate-800">Cấu trúc đề</h3>
                </div>
                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-100">
                    Tổng: {questionsTotal} câu
                </span>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-3 rounded-xl border border-slate-100">
                    <label className="block text-xs font-medium text-slate-600 mb-1">Trắc nghiệm</label>
                    <input
                        type="number"
                        min="0"
                        className="w-full bg-[#ffffff] border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 font-semibold text-slate-700"
                        value={config.counts.mc}
                        onChange={e => handleCountChange('mc', e.target.value)}
                    />
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-100">
                    <label className="block text-xs font-medium text-slate-600 mb-1">Tự luận</label>
                    <input
                        type="number"
                        min="0"
                        className="w-full bg-[#ffffff] border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 font-semibold text-slate-700"
                        value={config.counts.essay}
                        onChange={e => handleCountChange('essay', e.target.value)}
                    />
                </div>
            </div>
        </div>

        {/* NHÓM 3: MA TRẬN */}
        <div className="space-y-4">
             <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-pink-100 text-pink-600 text-xs font-bold">3</span>
                    <h3 className="text-sm font-bold text-slate-800">Ma trận độ khó</h3>
                </div>
                <span className={`text-xs font-bold flex items-center gap-1 px-3 py-1.5 rounded-full border ${isMatrixValid ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
                    <Calculator className="w-3 h-3" />
                    {matrixTotal} / {questionsTotal}
                </span>
             </div>
             
             <div className="grid grid-cols-2 gap-3">
                 {[
                     { k: 'lv1', l: 'Nhận biết', c: 'bg-blue-50/50 border-blue-100 text-blue-700 focus-ring-blue-500' },
                     { k: 'lv2', l: 'Thông hiểu', c: 'bg-emerald-50/50 border-emerald-100 text-emerald-700 focus-ring-emerald-500' },
                     { k: 'lv3', l: 'Vận dụng', c: 'bg-amber-50/50 border-amber-100 text-amber-700 focus-ring-amber-500' },
                     { k: 'lv4', l: 'V.Dụng cao', c: 'bg-rose-50/50 border-rose-100 text-rose-700 focus-ring-rose-500' }
                 ].map((item) => (
                     <div key={item.k} className={`p-3 rounded-xl border ${item.c} hover:shadow-sm transition-shadow`}>
                        <label className="block text-[10px] font-bold uppercase mb-1 opacity-80">{item.l}</label>
                        <input 
                            type="number" 
                            min="0"
                            className="w-full bg-[#ffffff]/80 border-transparent rounded-lg px-2 py-1.5 text-sm text-center focus:ring-2 font-bold shadow-sm"
                            value={(config.matrix as any)[item.k]}
                            onChange={e => handleMatrixChange(item.k as any, e.target.value)}
                        />
                     </div>
                 ))}
             </div>
             {!isMatrixValid && (
                 <div className="text-xs text-red-600 bg-red-50 p-3 rounded-xl border border-red-100 flex items-start gap-2 animate-pulse">
                    <span className="font-bold">⚠️ Lưu ý:</span> 
                    Tổng số câu ma trận ({matrixTotal}) chưa khớp tổng số câu hỏi ({questionsTotal}).
                 </div>
             )}
        </div>

        <button
          type="submit"
          disabled={isLoading || !config.subject || !config.topic || !isMatrixValid}
          className={`w-full group relative flex items-center justify-center gap-2 py-4 px-6 rounded-2xl text-white font-bold shadow-lg transition-all duration-300 transform hover:-translate-y-1
            ${(isLoading || !isMatrixValid)
              ? 'bg-slate-300 cursor-not-allowed shadow-none' 
              : 'bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-[length:200%_auto] hover:bg-right hover:shadow-indigo-500/30'}`}
        >
          {isLoading ? (
             <>
               <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
               Đang xử lý...
             </>
          ) : (
            <>
              <Wand2 className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              Tạo Prompt Ngay
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default InputForm;