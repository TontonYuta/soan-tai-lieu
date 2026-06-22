
import React, { useState, useEffect } from 'react';
import { Settings2, Clock, Calculator, School, Wand2, BookOpen, GraduationCap, LayoutDashboard, FileSpreadsheet, Link as LinkIcon, CheckCircle2, Circle, AlertCircle , Sparkles, ChevronDown} from "lucide-react";
import { ExamConfig, GenerationStatus } from '../types';

interface ExamFormProps {
  onSubmit: (data: ExamConfig) => void;
  status: GenerationStatus;
  initialContext?: string;
  contextTopic?: string;
  contextSubject?: string;
  contextGrade?: string;
}

const COMMON_SCHOOLS = [
  "Sở GD&ĐT Hà Nội",
  "Sở GD&ĐT TP. Hồ Chí Minh",
  "THPT Chuyên Hà Nội - Amsterdam",
  "THPT Chuyên Lê Hồng Phong",
  "THPT Bình Xuyên",
  "THPT Chuyên Lam Sơn",
  "THPT Chuyên Phan Bội Châu",
  "Trường Đại học Sư phạm Hà Nội"
];

const COMMON_EXAMS = [
  "Kiểm tra Giữa kỳ I",
  "Kiểm tra Cuối kỳ I",
  "Kiểm tra Giữa kỳ II",
  "Kiểm tra Cuối kỳ II",
  "Thi thử THPT Quốc gia",
  "Kiểm tra 15 phút",
  "Kiểm tra định kỳ",
  "Khảo sát chất lượng"
];

const ExamForm: React.FC<ExamFormProps> = ({ onSubmit, status, initialContext, contextTopic, contextSubject, contextGrade }) => {
  const currentYear = new Date().getFullYear();
  const [useContext, setUseContext] = useState(!!initialContext);
  
  const [config, setConfig] = useState<ExamConfig>({
    school: '',
    examName: 'Kiểm tra Giữa kỳ I',
    year: `${currentYear} - ${currentYear + 1}`,
    subject: contextSubject || '',
    topic: contextTopic || '',
    grade: contextGrade || '12',
    language: 'bilingual',
    time: 60,
    counts: { mc: 25, essay: 3 },
    matrix: { lv1: 12, lv2: 8, lv3: 5, lv4: 3 },
    referenceContent: initialContext || ''
  });

  useEffect(() => {
    if (initialContext) {
        setUseContext(true);
        setConfig(prev => ({ 
            ...prev, 
            referenceContent: initialContext,
            topic: contextTopic || prev.topic,
            subject: contextSubject || prev.subject,
            grade: contextGrade || prev.grade
        }));
    }
  }, [initialContext, contextTopic, contextSubject, contextGrade]);

  const questionsTotal = config.counts.mc + config.counts.essay;
  const matrixTotal = config.matrix.lv1 + config.matrix.lv2 + config.matrix.lv3 + config.matrix.lv4;
  const isMatrixValid = matrixTotal === questionsTotal;
  const isLoading = status === GenerationStatus.LOADING;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isMatrixValid) {
      onSubmit({
          ...config,
          referenceContent: useContext ? config.referenceContent : undefined
      });
    }
  };

  const handleCountChange = (key: keyof typeof config.counts, value: string) => {
    const num = parseInt(value) || 0;
    setConfig(prev => ({ ...prev, counts: { ...prev.counts, [key]: num } }));
  };

  const handleMatrixChange = (key: keyof typeof config.matrix, value: string) => {
    const num = parseInt(value) || 0;
    setConfig(prev => ({ ...prev, matrix: { ...prev.matrix, [key]: num } }));
  };

  const inputClass = "w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-[#ffffff] transition-all text-sm font-bold text-slate-700 placeholder:text-slate-300 shadow-sm";
  const labelClass = "block text-[10px] font-black text-slate-600 mb-1.5 uppercase tracking-[0.15em]";
  const iconClass = "pointer-events-none absolute left-4 top-3.5 w-4.5 h-4.5 text-slate-300 group-focus-within:text-indigo-500 transition-colors";

  return (
    <div className="glass-card rounded-[2.5rem] shadow-2xl shadow-indigo-100 border-white p-6 lg:p-10 space-y-10 animate-in slide-in-from-left-4 duration-500">
      
      <div className="flex items-center gap-5">
        <div className="w-14 h-14 rounded-3xl bg-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-200 transform -rotate-2">
            <Settings2 className="w-7 h-7" />
        </div>
        <div>
            <h2 className="text-2xl font-black text-indigo-950 tracking-tight">Cấu hình Đề thi</h2>
            <p className="text-xs text-slate-600 font-bold uppercase tracking-widest">Ma trận chuẩn LaTeX</p>
        </div>
      </div>

      {initialContext && (
          <div 
            onClick={() => setUseContext(!useContext)}
            className={`cursor-pointer p-5 rounded-3xl border-2 transition-all duration-300 flex items-center justify-between group
            ${useContext 
                ? 'bg-indigo-50 border-indigo-200 shadow-inner translate-x-1' 
                : 'bg-white border-slate-100 hover:border-indigo-100 hover:bg-[#ffffff]'}`}
          >
            <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${useContext ? 'bg-indigo-600 text-white scale-110 rotate-12' : 'bg-slate-200 text-slate-600 group-hover:bg-indigo-100'}`}>
                    <LinkIcon className="w-5 h-5" />
                </div>
                <div>
                    <h5 className={`text-xs font-black uppercase tracking-wider ${useContext ? 'text-indigo-800' : 'text-slate-700'}`}>Đồng bộ hóa kiến thức</h5>
                    <p className="text-[10px] font-bold text-slate-600 truncate max-w-[140px]">Dựa trên bài học đã soạn</p>
                </div>
            </div>
            {useContext ? <CheckCircle2 className="w-6 h-6 text-indigo-600 fill-indigo-50" /> : <Circle className="w-6 h-6 text-slate-300" />}
          </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-8">
        
        <div className="space-y-5">
            <div className="group relative">
                <label className={labelClass}>Trường / Sở Giáo Dục</label>
                <div className="relative">
                    <School className={iconClass} />
                    <input 
                      type="text" 
                      list="schools-list"
                      className={inputClass} 
                      placeholder="Chọn hoặc nhập tên trường" 
                      value={config.school} 
                      onChange={e => setConfig({...config, school: e.target.value})} 
                      required 
                    />
                    <datalist id="schools-list">
                      {COMMON_SCHOOLS.map(s => <option key={s} value={s} />)}
                    </datalist>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-5">
                 <div className="group relative">
                    <label className={labelClass}>Tên kỳ thi</label>
                    <div className="relative">
                        <FileSpreadsheet className={iconClass} />
                        <input 
                          type="text" 
                          list="exams-list"
                          className={inputClass} 
                          value={config.examName} 
                          onChange={e => setConfig({...config, examName: e.target.value})} 
                          required 
                        />
                        <datalist id="exams-list">
                          {COMMON_EXAMS.map(e => <option key={e} value={e} />)}
                        </datalist>
                    </div>
                </div>
                <div className="group relative">
                    <label className={labelClass}>Thời gian</label>
                    <div className="relative">
                        <Clock className={iconClass} />
                        <input type="number" className={inputClass} value={config.time} onChange={e => setConfig({...config, time: parseInt(e.target.value)||0})} />
                        <span className="absolute right-4 top-3.5 text-[10px] font-black text-slate-300">PHÚT</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-5">
                <div className="group relative">
                    <label className={labelClass}>Môn học</label>
                    <div className="relative">
                        <BookOpen className={iconClass} />
                        <input type="text" className={inputClass} placeholder="Toán học" value={config.subject} onChange={e => setConfig({...config, subject: e.target.value})} required />
                    </div>
                </div>
                <div className="group relative">
                    <label className={labelClass}>Khối lớp</label>
                    <div className="relative">
                        <GraduationCap className={iconClass} />
                        <input type="text" className={inputClass} placeholder="12" value={config.grade} onChange={e => setConfig({...config, grade: e.target.value})} required />
                    </div>
                </div>
            </div>

            <div className="group relative">
                <label className={labelClass}>Chủ đề bài thi</label>
                <div className="relative">
                    <LayoutDashboard className={iconClass} />
                    <input type="text" className={inputClass} placeholder="Vd: Ứng dụng đạo hàm" value={config.topic} onChange={e => setConfig({...config, topic: e.target.value})} required />
                </div>
            </div>

            
            <div className="group relative">
                <label className={labelClass}>Ngôn ngữ</label>
                <div className="relative">
                    <Sparkles className={iconClass} />
                    <select 
                        className={inputClass + " appearance-none cursor-pointer pl-11"}
                        value={config.language || "bilingual"}
                        onChange={e => setConfig({...config, language: e.target.value as any})}
                    >
                        <option value="bilingual">Song ngữ Anh - Việt</option>
                        <option value="vietnamese">Thuần Việt</option>
                        <option value="english">Thuần Anh</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
            </div>

            <div className="group relative mt-4">
                <label className={labelClass}>Yêu cầu thêm (Tùy chọn)</label>
                <div className="relative">
                    <textarea 
                        className={inputClass + " min-h-[80px]"} 
                        placeholder="Vd: Bám sát đề minh họa 2025, cho ví dụ thực tế..." 
                        value={config.details || ''} 
                        onChange={e => setConfig({...config, details: e.target.value})} 
                    />
                </div>
            </div>

        </div>

        <div className="p-6 bg-white/50 rounded-[2rem] border border-slate-100 space-y-6">
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#ffffff] p-4 rounded-2xl shadow-sm border border-slate-100 group transition-all hover:ring-2 hover:ring-indigo-500/20">
                    <span className={labelClass}>Trắc nghiệm</span>
                    <input type="number" className="w-full text-2xl font-black bg-transparent border-none p-0 focus:ring-0 text-indigo-900" value={config.counts.mc} onChange={e => handleCountChange('mc', e.target.value)} />
                </div>
                <div className="bg-[#ffffff] p-4 rounded-2xl shadow-sm border border-slate-100 group transition-all hover:ring-2 hover:ring-indigo-500/20">
                    <span className={labelClass}>Tự luận</span>
                    <input type="number" className="w-full text-2xl font-black bg-transparent border-none p-0 focus:ring-0 text-indigo-900" value={config.counts.essay} onChange={e => handleCountChange('essay', e.target.value)} />
                </div>
            </div>

            <div className="grid grid-cols-4 gap-2">
                {[
                    { k: 'lv1', l: 'NB', c: 'border-blue-200 text-blue-600 bg-blue-50/30' },
                    { k: 'lv2', l: 'TH', c: 'border-emerald-200 text-emerald-600 bg-emerald-50/30' },
                    { k: 'lv3', l: 'VD', c: 'border-amber-200 text-amber-600 bg-amber-50/30' },
                    { k: 'lv4', l: 'VDC', c: 'border-rose-200 text-rose-600 bg-rose-50/30' }
                ].map((item) => (
                    <div key={item.k} className={`p-3 rounded-2xl border text-center transition-all hover:scale-105 ${item.c}`}>
                        <div className="text-[9px] font-black opacity-60 mb-1">{item.l}</div>
                        <input type="number" className="w-full text-center font-black bg-transparent border-none p-0 focus:ring-0 text-base" value={(config.matrix as any)[item.k]} onChange={e => handleMatrixChange(item.k as any, e.target.value)} />
                    </div>
                ))}
            </div>
            
            <div className={`flex items-center justify-center gap-2 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${isMatrixValid ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' : 'bg-rose-100 text-rose-600 animate-pulse'}`}>
                {isMatrixValid ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                {isMatrixValid ? `Hợp lệ: ${matrixTotal} câu` : `Chênh lệch: ${matrixTotal - questionsTotal} câu`}
            </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || !config.subject || !config.topic || !isMatrixValid}
          className={`w-full group flex items-center justify-center gap-4 py-5 px-8 rounded-3xl text-white font-black shadow-xl transition-all duration-300 transform hover:-translate-y-1 active:scale-95
            ${(isLoading || !isMatrixValid)
              ? 'bg-slate-200 cursor-not-allowed text-slate-600' 
              : 'bg-gradient-to-r from-indigo-600 to-violet-700 hover:shadow-indigo-500/40'}`}
        >
          {isLoading ? (
             <span className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin"/>
          ) : (
            <>
              <Wand2 className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              THIẾT KẾ ĐỀ {useContext ? 'ĐỒNG BỘ' : ''}
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default ExamForm;
