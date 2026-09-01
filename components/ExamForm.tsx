import React, { useState, useEffect } from 'react';
import { 
  Clock, School, Wand2, BookOpen, GraduationCap, LayoutDashboard, 
  CheckCircle2, AlertCircle, Sparkles, Info, CheckSquare, Square, 
  Sliders, Layers, Zap
} from "lucide-react";
import { ExamConfig, GenerationStatus } from '../types';
import PdfUploadZone from './PdfUploadZone';



interface ExamFormProps {
  onSubmit: (data: ExamConfig) => void;
  onDirectAutomate?: (data: ExamConfig) => void;
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
  "Thi thử Tốt nghiệp THPT Quốc gia",
  "Đánh giá Năng lực (HSA / V-SAT)",
  "Kiểm tra Giữa kỳ I",
  "Kiểm tra Cuối kỳ I",
  "Kiểm tra Giữa kỳ II",
  "Kiểm tra Cuối kỳ II",
  "Kiểm tra 1 Tiết (45 phút)",
  "Khảo sát chất lượng Toán học"
];

const ExamForm: React.FC<ExamFormProps> = ({ 
  onSubmit, 
  status, 
  initialContext, 
  contextTopic, 
  contextSubject, 
  contextGrade 
}) => {
  const currentYear = new Date().getFullYear();
  const [useContext, setUseContext] = useState(!!initialContext);
  
  const [config, setConfig] = useState<ExamConfig>({
    school: 'Sở GD&ĐT',
    examName: 'Thi thử Tốt nghiệp THPT Quốc gia',
    year: `${currentYear} - ${currentYear + 1}`,
    subject: contextSubject || 'Toán học',
    topic: contextTopic || '',
    grade: contextGrade || '12',
    examFormat: 'standard2025',
    language: 'vietnamese',
    time: 90,
    counts: {
      part1_mc: 12,
      part2_tf: 4,
      part3_sa: 6,
      mc: 12,
      essay: 0
    },
    matrix: { lv1: 6, lv2: 8, lv3: 6, lv4: 2 },
    includeTikZ: true,
    referenceContent: initialContext || '',
    details: ''
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

  const is2025 = config.examFormat === 'standard2025';
  
  const questionsTotal = is2025 
    ? (Number(config.counts.part1_mc || 0) + Number(config.counts.part2_tf || 0) + Number(config.counts.part3_sa || 0))
    : (Number(config.counts.mc || 0) + Number(config.counts.essay || 0));

  const matrixTotal = Number(config.matrix.lv1) + Number(config.matrix.lv2) + Number(config.matrix.lv3) + Number(config.matrix.lv4);
  const isMatrixValid = matrixTotal === questionsTotal;
  const isLoading = status === GenerationStatus.LOADING;

  // Preset switchers
  const applyPreset = (preset: 'thpt90' | 'test45' | 'test15' | 'classic') => {
    if (preset === 'thpt90') {
      setConfig(prev => ({
        ...prev,
        examFormat: 'standard2025',
        time: 90,
        counts: { ...prev.counts, part1_mc: 12, part2_tf: 4, part3_sa: 6 },
        matrix: { lv1: 6, lv2: 8, lv3: 6, lv4: 2 }
      }));
    } else if (preset === 'test45') {
      setConfig(prev => ({
        ...prev,
        examFormat: 'standard2025',
        time: 45,
        counts: { ...prev.counts, part1_mc: 6, part2_tf: 2, part3_sa: 3 },
        matrix: { lv1: 3, lv2: 4, lv3: 3, lv4: 1 }
      }));
    } else if (preset === 'test15') {
      setConfig(prev => ({
        ...prev,
        examFormat: 'standard2025',
        time: 15,
        counts: { ...prev.counts, part1_mc: 4, part2_tf: 1, part3_sa: 1 },
        matrix: { lv1: 2, lv2: 2, lv3: 1, lv4: 1 }
      }));
    } else if (preset === 'classic') {
      setConfig(prev => ({
        ...prev,
        examFormat: 'classic',
        time: 90,
        counts: { ...prev.counts, mc: 25, essay: 3 },
        matrix: { lv1: 10, lv2: 10, lv3: 5, lv4: 3 }
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isMatrixValid && config.subject && config.topic) {
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

  const inputClass = "w-full pl-10 pr-4 py-2.5 bg-[#ffffff] rounded-none border-[3px] border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] focus:ring-0 focus:translate-y-1 focus:translate-x-1 focus:shadow-none transition-all text-sm font-bold text-black placeholder:text-gray-500 uppercase";
  const selectClass = "w-full pl-10 pr-4 py-2.5 bg-[#ffffff] rounded-none border-[3px] border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] focus:ring-0 focus:translate-y-1 focus:translate-x-1 focus:shadow-none transition-all text-sm font-bold text-black uppercase cursor-pointer appearance-none";
  const labelClass = "block text-xs font-black text-black mb-1.5 uppercase tracking-widest";
  const iconClass = "pointer-events-none absolute left-3.5 top-[13px] w-4 h-4 text-black font-black";

  return (
    <div className="bg-[#ffffff] rounded-none shadow-[8px_8px_0_0_rgba(0,0,0,1)] border-4 border-black p-6 lg:p-8 h-fit sticky top-28 overflow-y-auto max-h-[calc(100vh-9rem)] scrollbar-hide">
      
      {/* Header */}
      <div className="flex items-center gap-4 mb-6 border-b-4 border-black pb-4">
        <div className="w-12 h-12 bg-[#FF90E8] flex items-center justify-center text-black border-4 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] rounded-none">
          <GraduationCap className="w-6 h-6 stroke-[3]" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-black uppercase tracking-widest">Đề Thi Chuẩn Hóa</h2>
          <p className="text-xs text-black font-bold uppercase tracking-wider">Format 2025--2026 & Vẽ Hình TikZ</p>
        </div>
      </div>

      {/* Format Switcher */}
      <div className="mb-6 p-3 bg-[#FFED66] border-[3px] border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
            <Layers className="w-4 h-4 stroke-[3]" /> Định dạng đề thi:
          </span>
          <span className="text-[10px] font-black bg-black text-white px-2 py-0.5 uppercase">
            {is2025 ? 'Quy chế mới 2025' : 'Truyền thống'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => applyPreset('thpt90')}
            className={`p-2 border-2 border-black text-xs font-black uppercase transition-all cursor-pointer text-center
              ${is2025 
                ? 'bg-[#ffffff] text-black shadow-[3px_3px_0_0_rgba(0,0,0,1)] translate-x-[1px] translate-y-[1px]' 
                : 'bg-transparent text-black hover:bg-[#FFECA1]'}`}
          >
            ⭐ Chuẩn Bộ GD&ĐT (3 Phần)
          </button>
          
          <button
            type="button"
            onClick={() => applyPreset('classic')}
            className={`p-2 border-2 border-black text-xs font-black uppercase transition-all cursor-pointer text-center
              ${!is2025 
                ? 'bg-[#ffffff] text-black shadow-[3px_3px_0_0_rgba(0,0,0,1)] translate-x-[1px] translate-y-[1px]' 
                : 'bg-transparent text-black hover:bg-[#FFECA1]'}`}
          >
            Đề TN + Tự Luận (Cổ điển)
          </button>
        </div>

        {/* Quick Presets */}
        {is2025 && (
          <div className="flex items-center gap-2 pt-1">
            <span className="text-[10px] font-black uppercase text-black">Mẫu nhanh:</span>
            <button
              type="button"
              onClick={() => applyPreset('thpt90')}
              className="px-2 py-1 bg-white border border-black text-[10px] font-black uppercase hover:bg-[#A3E635] cursor-pointer"
            >
              90p (12+4+6)
            </button>
            <button
              type="button"
              onClick={() => applyPreset('test45')}
              className="px-2 py-1 bg-white border border-black text-[10px] font-black uppercase hover:bg-[#A3E635] cursor-pointer"
            >
              45p (6+2+3)
            </button>
            <button
              type="button"
              onClick={() => applyPreset('test15')}
              className="px-2 py-1 bg-white border border-black text-[10px] font-black uppercase hover:bg-[#A3E635] cursor-pointer"
            >
              15p (4+1+1)
            </button>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* SECTION 1: METADATA */}
        <div className="p-5 bg-[#ffffff] border-[3px] border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] space-y-4">
          <div className="flex items-center gap-2 mb-2 pb-3 border-b-4 border-black">
            <div className="w-6 h-6 bg-[#A3E635] border-2 border-black flex items-center justify-center text-black">
              <Info className="w-3.5 h-3.5 stroke-[3]" />
            </div>
            <h3 className="text-sm font-black text-black uppercase tracking-wider">Thông tin kỳ thi</h3>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="group relative">
                <label className={labelClass}>Đơn vị / Trường</label>
                <div className="relative">
                  <School className={iconClass} />
                  <input 
                    type="text" 
                    list="schools-list"
                    className={inputClass} 
                    value={config.school} 
                    onChange={e => setConfig({...config, school: e.target.value})} 
                    placeholder="Sở GD&ĐT..."
                    required 
                  />
                  <datalist id="schools-list">
                    {COMMON_SCHOOLS.map(s => <option key={s} value={s} />)}
                  </datalist>
                </div>
              </div>

              <div className="group relative">
                <label className={labelClass}>Tên kỳ thi</label>
                <div className="relative">
                  <BookOpen className={iconClass} />
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

              <div className="group relative">
                <label className={labelClass}>Thời gian (phút)</label>
                <div className="relative">
                  <Clock className={iconClass} />
                  <input type="number" className={inputClass} value={config.time} onChange={e => setConfig({...config, time: parseInt(e.target.value)||0})} />
                </div>
              </div>
            </div>

            <div className="group relative">
              <label className={labelClass}>Chủ đề trọng tâm</label>
              <div className="relative">
                <LayoutDashboard className={iconClass} />
                <input type="text" className={inputClass} placeholder="Vd: Khảo sát hàm số, Hình không gian Oxyz, Tích phân..." value={config.topic} onChange={e => setConfig({...config, topic: e.target.value})} required />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="group relative">
                <label className={labelClass}>Ngôn ngữ</label>
                <div className="relative">
                  <Sparkles className={iconClass} />
                  <select 
                    className={selectClass}
                    value={config.language || "vietnamese"}
                    onChange={e => setConfig({...config, language: e.target.value as any})}
                  >
                    <option value="vietnamese">Tiếng Việt (Chuẩn)</option>
                    <option value="bilingual">Song ngữ Anh - Việt</option>
                    <option value="english">Tiếng Anh (Toán Quốc tế)</option>
                  </select>
                </div>
              </div>

              <div className="group relative">
                <label className={labelClass}>Năm học</label>
                <input 
                  type="text" 
                  className={inputClass + " pl-4"}
                  value={config.year} 
                  onChange={e => setConfig({...config, year: e.target.value})} 
                />
              </div>
            </div>

            {/* TikZ Graphic Option */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setConfig(prev => ({ ...prev, includeTikZ: !prev.includeTikZ }))}
                className="flex items-center gap-3 p-2.5 bg-[#ffffff] border-2 border-black w-full shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:bg-[#FFECA1] transition-all cursor-pointer text-left"
              >
                {config.includeTikZ ? (
                  <CheckSquare className="w-5 h-5 text-black stroke-[3] shrink-0" />
                ) : (
                  <Square className="w-5 h-5 text-black stroke-[2] shrink-0" />
                )}
                <div>
                  <span className="text-xs font-black text-black uppercase block">
                    Bắt buộc AI vẽ Đồ thị & Hình học TikZ
                  </span>
                  <span className="text-[10px] text-gray-700 font-medium">
                    Tự động tạo hình không gian, bảng biến thiên chuẩn xác cho câu hình học & giải tích
                  </span>
                </div>
              </button>
            </div>

            {/* PDF Upload RAG Zone */}
            <div className="pt-2">

              <PdfUploadZone
                attachedPdf={config.attachedPdf || null}
                onPdfChange={(pdfData) => setConfig(prev => ({ ...prev, attachedPdf: pdfData || undefined }))}
                title="Đính Kèm File Đề Thi Mẫu / Đề Cương PDF (RAG):"
                description="AI sẽ đọc ma trận, câu hỏi và hình vẽ trong file đề thi PDF này để thiết kế đề thi tương đương."
              />
            </div>

            <div className="group relative mt-2">
              <label className={labelClass}>Yêu cầu nâng cao (Tùy chọn)</label>
              <textarea 
                className="w-full p-3 bg-[#ffffff] rounded-none border-[3px] border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] text-sm font-medium text-black placeholder:text-gray-500 min-h-[60px]" 
                placeholder="Vd: 3 câu toán thực tế, bám sát đề minh họa HSA / V-SAT..." 
                value={config.details || ''} 
                onChange={e => setConfig({...config, details: e.target.value})} 
              />
            </div>
          </div>
        </div>


        {/* SECTION 2: QUESTION COUNTS & MATRIX */}
        <div className="p-5 bg-[#ffffff] border-[3px] border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] space-y-4">
          <div className="flex items-center gap-2 mb-2 pb-3 border-b-4 border-black">
            <div className="w-6 h-6 bg-[#00CECB] border-2 border-black flex items-center justify-center text-black">
              <Sliders className="w-3.5 h-3.5 stroke-[3]" />
            </div>
            <h3 className="text-sm font-black text-black uppercase tracking-wider">
              {is2025 ? 'Số câu hỏi theo 3 Phần (Chuẩn 2025)' : 'Số câu Trắc nghiệm & Tự luận'}
            </h3>
          </div>

          {is2025 ? (
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-[#ffffff] p-3 border-2 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] text-center">
                <span className="text-[10px] font-black uppercase block text-black">Phần I: 4 Lựa chọn</span>
                <input 
                  type="number" 
                  min="0"
                  className="w-full text-center text-xl font-black bg-transparent border-none p-0 focus:ring-0 text-black mt-1" 
                  value={config.counts.part1_mc || 12} 
                  onChange={e => handleCountChange('part1_mc', e.target.value)} 
                />
              </div>

              <div className="bg-[#ffffff] p-3 border-2 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] text-center">
                <span className="text-[10px] font-black uppercase block text-black">Phần II: Đúng / Sai</span>
                <input 
                  type="number" 
                  min="0"
                  className="w-full text-center text-xl font-black bg-transparent border-none p-0 focus:ring-0 text-black mt-1" 
                  value={config.counts.part2_tf || 4} 
                  onChange={e => handleCountChange('part2_tf', e.target.value)} 
                />
              </div>

              <div className="bg-[#ffffff] p-3 border-2 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] text-center">
                <span className="text-[10px] font-black uppercase block text-black">Phần III: Điền đáp số</span>
                <input 
                  type="number" 
                  min="0"
                  className="w-full text-center text-xl font-black bg-transparent border-none p-0 focus:ring-0 text-black mt-1" 
                  value={config.counts.part3_sa || 6} 
                  onChange={e => handleCountChange('part3_sa', e.target.value)} 
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#ffffff] p-3 border-2 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] text-center">
                <span className={labelClass}>Trắc nghiệm (câu)</span>
                <input type="number" className="w-full text-center text-xl font-black bg-transparent border-none p-0 focus:ring-0 text-black" value={config.counts.mc || 25} onChange={e => handleCountChange('mc', e.target.value)} />
              </div>
              <div className="bg-[#ffffff] p-3 border-2 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] text-center">
                <span className={labelClass}>Tự luận (câu)</span>
                <input type="number" className="w-full text-center text-xl font-black bg-transparent border-none p-0 focus:ring-0 text-black" value={config.counts.essay || 3} onChange={e => handleCountChange('essay', e.target.value)} />
              </div>
            </div>
          )}

          {/* Matrix levels */}
          <div className="pt-2">
            <span className="text-xs font-black uppercase tracking-widest block mb-2 text-black">
              Ma trận 4 mức độ tư duy:
            </span>
            <div className="grid grid-cols-4 gap-2">
              {[
                { k: 'lv1', l: 'Nhận biết (NB)', c: 'bg-[#93C5FD]' },
                { k: 'lv2', l: 'Thông hiểu (TH)', c: 'bg-[#86EFAC]' },
                { k: 'lv3', l: 'Vận dụng (VD)', c: 'bg-[#FDE047]' },
                { k: 'lv4', l: 'VDC (Nâng cao)', c: 'bg-[#FCA5A5]' }
              ].map((item) => (
                <div key={item.k} className={`p-2.5 border-2 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] text-center ${item.c}`}>
                  <div className="text-[9px] font-black uppercase text-black mb-1">{item.l}</div>
                  <input type="number" min="0" className="w-full text-center font-black bg-transparent border-none p-0 focus:ring-0 text-base text-black" value={(config.matrix as any)[item.k]} onChange={e => handleMatrixChange(item.k as any, e.target.value)} />
                </div>
              ))}
            </div>
          </div>
          
          <div className={`flex items-center justify-center gap-2 py-2.5 border-2 border-black font-black text-xs uppercase tracking-widest ${isMatrixValid ? 'bg-[#A3E635] text-black' : 'bg-[#FF5E5B] text-black animate-pulse'}`}>
            {isMatrixValid ? <CheckCircle2 className="w-4 h-4 stroke-[3]" /> : <AlertCircle className="w-4 h-4 stroke-[3]" />}
            {isMatrixValid ? `Hợp lệ: Tổng ${matrixTotal} câu` : `Lệch: Tổng ma trận ${matrixTotal} / ${questionsTotal} câu`}
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || !config.subject || !config.topic || !isMatrixValid}
          className={`w-full relative flex items-center justify-center gap-3 py-4 px-6 rounded-none text-black font-black uppercase tracking-widest text-lg border-4 border-black shadow-[6px_6px_0_0_rgba(0,0,0,1)] transition-all duration-75 active:translate-y-[6px] active:translate-x-[6px] active:shadow-none cursor-pointer
            ${(isLoading || !isMatrixValid || !config.subject || !config.topic)
              ? 'bg-[#E2E8F0] cursor-not-allowed text-gray-500 shadow-none border-gray-400' 
              : 'bg-[#FF90E8] hover:bg-[#F472B6]'}`}
        >
          {isLoading ? (
            <>
              <span className="w-5 h-5 border-4 border-black border-t-transparent rounded-full animate-spin"/>
              <span>Đang thiết kế đề thi...</span>
            </>
          ) : (
            <>
              <Zap className="w-6 h-6 stroke-[3] fill-black" />
              <span>⚡ Thiết Kế Đề Thi LaTeX ({is2025 ? 'Format 2025' : 'Classic'})</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};



export default ExamForm;