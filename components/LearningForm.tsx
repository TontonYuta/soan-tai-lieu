import React, { useState, useEffect } from 'react';
import { BookOpen, GraduationCap, Wand2, School, Calendar, Layout, Info, ChevronDown, Target, Users, Zap } from "lucide-react";
import { LearningConfig, GenerationStatus } from '../types';
import PdfUploadZone from './PdfUploadZone';


interface LearningFormProps {
  onSubmit: (data: LearningConfig) => void;
  onDirectAutomate?: (data: LearningConfig) => void;
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

const LearningForm: React.FC<LearningFormProps> = ({ onSubmit, onDirectAutomate, status, contextTopic, contextSubject, contextGrade }) => {

  const currentYear = new Date().getFullYear();
  const [config, setConfig] = useState<LearningConfig>({
    school: COMMON_SCHOOLS[0],
    year: `${currentYear} - ${currentYear + 1}`,
    subject: contextSubject || 'Toán học',
    grade: contextGrade || '12',
    topic: contextTopic || '',
    goal: 'summary',
    tone: 'academic',
    audience: 'Học sinh trung bình - khá',
    language: 'vietnamese',
    details: ''
  });

  useEffect(() => {
    if (contextTopic || contextSubject || contextGrade) {
      setConfig(prev => ({
        ...prev,
        topic: contextTopic || prev.topic,
        subject: contextSubject || prev.subject,
        grade: contextGrade || prev.grade
      }));
    }
  }, [contextTopic, contextSubject, contextGrade]);

  const isLoading = status === GenerationStatus.LOADING;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (config.subject && config.topic) {
      onSubmit(config);
    }
  };

  const handleChange = (field: keyof LearningConfig, value: any) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const inputClass = "w-full pl-10 pr-4 py-2.5 bg-[#ffffff] rounded-none border-[3px] border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] focus:ring-0 focus:translate-y-1 focus:translate-x-1 focus:shadow-none transition-all text-sm font-bold text-black placeholder:text-gray-500 uppercase";
  const selectClass = "w-full pl-10 pr-8 py-2.5 bg-[#ffffff] rounded-none border-[3px] border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] focus:ring-0 focus:translate-y-1 focus:translate-x-1 focus:shadow-none transition-all text-sm font-bold text-black uppercase cursor-pointer appearance-none";
  const labelClass = "block text-xs font-black text-black mb-1.5 uppercase tracking-widest";
  const iconClass = "pointer-events-none absolute left-3.5 top-[13px] w-4 h-4 text-black font-black";

  return (
    <div className="bg-[#ffffff] rounded-none shadow-[8px_8px_0_0_rgba(0,0,0,1)] border-4 border-black p-6 lg:p-8 h-fit sticky top-28 overflow-y-auto max-h-[calc(100vh-9rem)] scrollbar-hide">
      
      <div className="flex items-center gap-4 mb-8 border-b-4 border-black pb-4">
        <div className="w-12 h-12 bg-[#00CECB] flex items-center justify-center text-black border-4 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] rounded-none">
            <BookOpen className="w-6 h-6 stroke-[3]" />
        </div>
        <div>
            <h2 className="text-2xl font-black text-black uppercase tracking-widest">Thiết Kế Bài Học</h2>
            <p className="text-xs text-black font-bold uppercase tracking-wider">Bài Giảng Lý Thuyết & Ví Dụ</p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* SECTION 1: METADATA */}
        <div className="p-5 bg-[#ffffff] border-[3px] border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] space-y-4">
             <div className="flex items-center gap-2 mb-2 pb-3 border-b-4 border-black">
                <div className="w-6 h-6 bg-[#A3E635] border-2 border-black flex items-center justify-center text-black">
                    <Info className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <h3 className="text-sm font-black text-black uppercase tracking-wider">Thông tin bài học</h3>
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
                      <label className={labelClass}>Khối lớp</label>
                      <div className="relative">
                          <GraduationCap className={iconClass} />
                          <input
                              type="text"
                              className={inputClass}
                              placeholder="12"
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
                        <Layout className={iconClass} />
                        <input
                            type="text"
                            className={inputClass}
                            placeholder="Vd: Phương pháp tọa độ hóa hình không gian"
                            value={config.topic}
                            onChange={e => handleChange('topic', e.target.value)}
                            required
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="group relative">
                      <label className={labelClass}>Mục tiêu bài học</label>
                      <div className="relative">
                          <Target className={iconClass} />
                          <select
                              className={selectClass}
                              value={config.goal}
                              onChange={e => handleChange('goal', e.target.value)}
                          >
                              <option value="summary">Tóm tắt trọng tâm lý thuyết</option>
                              <option value="detailed">Chi tiết toàn bộ kiến thức</option>
                              <option value="exercises">Lý thuyết kèm ví dụ minh họa</option>
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black pointer-events-none stroke-[3]" />
                      </div>
                  </div>

                  <div className="group relative">
                      <label className={labelClass}>Đối tượng người học</label>
                      <div className="relative">
                          <Users className={iconClass} />
                          <input
                              type="text"
                              className={inputClass}
                              placeholder="Học sinh trung bình - khá"
                              value={config.audience}
                              onChange={e => handleChange('audience', e.target.value)}
                              required
                          />
                      </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                  <div className="group relative">
                      <label className={labelClass}>Đơn vị / Trường</label>
                      <div className="relative">
                          <School className={iconClass} />
                          <input
                              type="text"
                              list="common-schools"
                              className={inputClass}
                              value={config.school}
                              onChange={e => handleChange('school', e.target.value)}
                              required
                          />
                          <datalist id="common-schools">
                              {COMMON_SCHOOLS.map(s => <option key={s} value={s} />)}
                          </datalist>
                      </div>
                  </div>
                </div>

                <div className="group relative mt-3">
                    <PdfUploadZone
                      attachedPdf={config.attachedPdf || null}
                      onPdfChange={(pdfData) => handleChange('attachedPdf', pdfData || undefined)}
                      title="Đính Kèm Tài Liệu Sách / Giáo Trình PDF (RAG):"
                      description="AI sẽ trích xuất lý thuyết, định lý và ví dụ từ file PDF này để biên soạn bài giảng chuẩn xác."
                    />
                </div>

                <div className="group relative mt-2">
                    <label className={labelClass}>Yêu cầu thêm (Tùy chọn)</label>
                    <textarea
                        className="w-full p-3 bg-[#ffffff] rounded-none border-[3px] border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] text-sm font-medium text-black placeholder:text-gray-500 min-h-[70px]"
                        placeholder="Vd: Thêm mẹo tính nhanh Casio, phân biệt các dạng toán thường gặp..."
                        value={config.details || ''}
                        onChange={e => handleChange('details', e.target.value)}
                    />
                </div>
            </div>
        </div>


        <button
          type="submit"
          disabled={isLoading || !config.subject || !config.topic}
          className={`w-full relative flex items-center justify-center gap-3 py-4 px-6 rounded-none text-black font-black uppercase tracking-widest text-lg border-4 border-black shadow-[6px_6px_0_0_rgba(0,0,0,1)] transition-all duration-75 active:translate-y-[6px] active:translate-x-[6px] active:shadow-none cursor-pointer
            ${(isLoading || !config.subject || !config.topic)
              ? 'bg-[#E2E8F0] cursor-not-allowed text-gray-500 shadow-none border-gray-400' 
              : 'bg-[#00CECB] hover:bg-[#00B4B1]'}`}
        >
          {isLoading ? (
             <>
               <span className="w-5 h-5 border-4 border-black border-t-transparent rounded-full animate-spin"/>
               <span>Đang thiết kế bài học...</span>
             </>
          ) : (
            <>
              <Zap className="w-6 h-6 stroke-[3] fill-black" />
              <span>⚡ Soạn Bài Học Lý Thuyết (LaTeX)</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};



export default LearningForm;