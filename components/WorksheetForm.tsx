import React, { useState, useEffect } from 'react';
import { Book, User, Layout, Wand2, Info, GraduationCap, ChevronDown, Zap, FileText } from "lucide-react";
import { WorksheetConfig, GenerationStatus } from '../types';
import PdfUploadZone from './PdfUploadZone';


interface WorksheetFormProps {

  onSubmit: (data: WorksheetConfig) => void;
  onDirectAutomate?: (data: WorksheetConfig) => void;
  status: GenerationStatus;
  contextTopic?: string;
  contextSubject?: string;
  contextGrade?: string;
}

const WorksheetForm: React.FC<WorksheetFormProps> = ({ 
  onSubmit, 
  onDirectAutomate,
  status, 
  contextTopic, 
  contextSubject, 
  contextGrade 
}) => {

  const [config, setConfig] = useState<WorksheetConfig>({
    subject: contextSubject || 'Toán học',
    topic: contextTopic || '',
    grade: contextGrade || '12',
    teacherName: 'Giáo viên',
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
    if (config.subject && config.topic && config.teacherName) {
      onSubmit(config);
    }
  };

  const handleChange = (field: keyof WorksheetConfig, value: any) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const inputClass = "w-full pl-10 pr-4 py-2.5 bg-[#ffffff] rounded-none border-[3px] border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] focus:ring-0 focus:translate-y-1 focus:translate-x-1 focus:shadow-none transition-all text-sm font-bold text-black placeholder:text-gray-500 uppercase";
  const selectClass = "w-full pl-10 pr-8 py-2.5 bg-[#ffffff] rounded-none border-[3px] border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] focus:ring-0 focus:translate-y-1 focus:translate-x-1 focus:shadow-none transition-all text-sm font-bold text-black uppercase cursor-pointer appearance-none";
  const labelClass = "block text-xs font-black text-black mb-1.5 uppercase tracking-widest";
  const iconClass = "pointer-events-none absolute left-3.5 top-[13px] w-4 h-4 text-black font-black";

  return (
    <div className="bg-[#ffffff] rounded-none shadow-[8px_8px_0_0_rgba(0,0,0,1)] border-4 border-black p-6 lg:p-8 h-fit sticky top-28 overflow-y-auto max-h-[calc(100vh-9rem)] scrollbar-hide">
      
      <div className="flex items-center gap-4 mb-8 border-b-4 border-black pb-4">
        <div className="w-12 h-12 bg-[#A3E635] flex items-center justify-center text-black border-4 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] rounded-none">
            <Book className="w-6 h-6 stroke-[3]" />
        </div>
        <div>
            <h2 className="text-2xl font-black text-black uppercase tracking-widest">Phiếu Bài Tập</h2>
            <p className="text-xs text-black font-bold uppercase tracking-wider">Chuẩn PDFLaTeX & Dòng Chấm</p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* SECTION 1: INFO */}
        <div className="p-5 bg-[#ffffff] border-[3px] border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] space-y-4">
             <div className="flex items-center gap-2 mb-2 pb-3 border-b-4 border-black">
                <div className="w-6 h-6 bg-[#FFED66] border-2 border-black flex items-center justify-center text-black">
                    <Info className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <h3 className="text-sm font-black text-black uppercase tracking-wider">Thông tin chung</h3>
            </div>

            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="group relative">
                      <label className={labelClass}>Môn học</label>
                      <div className="relative">
                          <Book className={iconClass} />
                          <input
                              type="text"
                              className={inputClass}
                              placeholder="Vd: Toán học"
                              value={config.subject}
                              onChange={e => handleChange('subject', e.target.value)}
                              required
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
                    <label className={labelClass}>Chủ đề</label>
                    <div className="relative">
                        <Layout className={iconClass} />
                        <input
                            type="text"
                            className={inputClass}
                            placeholder="Vd: Tích phân & Ứng dụng hình học"
                            value={config.topic}
                            onChange={e => handleChange('topic', e.target.value)}
                            required
                        />
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
                      <label className={labelClass}>Người biên soạn (Giáo viên)</label>
                      <div className="relative">
                          <User className={iconClass} />
                          <input
                              type="text"
                              className={inputClass}
                              placeholder="Vd: Thầy Yuta"
                              value={config.teacherName}
                              onChange={e => handleChange('teacherName', e.target.value)}
                              required
                          />
                      </div>
                  </div>
                </div>

                <div className="group relative mt-4">
                    <PdfUploadZone 
                      attachedPdf={config.attachedPdf || null} 
                      onPdfChange={(pdfData) => handleChange('attachedPdf', pdfData || undefined)} 
                    />
                </div>

                <div className="group relative mt-4">
                    <label className={labelClass}>Yêu cầu nâng cao (Tùy chọn)</label>
                    <div className="relative">
                        <textarea
                            className="w-full p-3 bg-[#ffffff] rounded-none border-[3px] border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] text-sm font-medium text-black placeholder:text-gray-500 min-h-[80px]"
                            placeholder="Vd: 5 bài toán thực tế, có dòng kẻ chấm (\dongke) để học sinh làm trực tiếp..."
                            value={config.details || ''}
                            onChange={e => handleChange('details', e.target.value)}
                        />
                    </div>
                </div>
            </div>
        </div>


        {/* Action Buttons: 2 nút chuẩn 1-Click */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            onClick={() => onDirectAutomate ? onDirectAutomate(config) : onSubmit(config)}
            disabled={isLoading || !config.subject || !config.topic || !config.teacherName}
            className={`relative flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-none text-black font-black uppercase tracking-wider text-xs sm:text-sm border-4 border-black shadow-[5px_5px_0_0_rgba(0,0,0,1)] transition-all duration-75 active:translate-y-[3px] active:translate-x-[3px] active:shadow-none cursor-pointer
              ${(isLoading || !config.subject || !config.topic || !config.teacherName)
                ? 'bg-[#E2E8F0] cursor-not-allowed text-gray-500 shadow-none border-gray-400' 
                : 'bg-[#A3E635] hover:bg-[#86EFAC]'}`}
            title="Kích hoạt tự động hóa 1-Click: Biên dịch LaTeX trên Overleaf & Xuất PDF"
          >
            <Zap className="w-5 h-5 stroke-[3] fill-black" />
            <span>⚡ Chạy 1-Click (Xuất PDF)</span>
          </button>

          <button
            type="submit"
            disabled={isLoading || !config.subject || !config.topic || !config.teacherName}
            className={`relative flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-none text-black font-black uppercase tracking-wider text-xs sm:text-sm border-4 border-black shadow-[5px_5px_0_0_rgba(0,0,0,1)] transition-all duration-75 active:translate-y-[3px] active:translate-x-[3px] active:shadow-none cursor-pointer
              ${(isLoading || !config.subject || !config.topic || !config.teacherName)
                ? 'bg-[#E2E8F0] cursor-not-allowed text-gray-500 shadow-none border-gray-400' 
                : 'bg-[#FFED66] hover:bg-[#FFECA1]'}`}
            title="Sinh Prompt LaTeX và hiển thị bên cột xem trước"
          >
            <FileText className="w-5 h-5 stroke-[3]" />
            <span>📝 Tạo Prompt LaTeX</span>
          </button>
        </div>
      </form>
    </div>
  );
};


export default WorksheetForm;