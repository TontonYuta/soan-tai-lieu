import React, { useState } from 'react';
import { Book, User, Layout, Wand2, Info, GraduationCap, School } from 'lucide-react';
import { WorksheetConfig, GenerationStatus } from '../types';

interface WorksheetFormProps {
  onSubmit: (data: WorksheetConfig) => void;
  status: GenerationStatus;
}

const WorksheetForm: React.FC<WorksheetFormProps> = ({ onSubmit, status }) => {
  const [config, setConfig] = useState<WorksheetConfig>({
    subject: '',
    topic: '',
    grade: '',
    teacherName: '',
    language: 'bilingual'
  });

  const isLoading = status === GenerationStatus.LOADING;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(config);
  };

  const handleChange = (field: keyof WorksheetConfig, value: any) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const inputClass = "w-full pl-10 pr-4 py-2.5 bg-[#FEF9C3] rounded-none border-[3px] border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] focus:ring-0 focus:translate-y-1 focus:translate-x-1 focus:shadow-none transition-all text-sm font-bold text-black placeholder:text-gray-500 uppercase";
  const selectClass = "w-full pl-10 pr-8 py-2.5 bg-[#FEF9C3] rounded-none border-[3px] border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] focus:ring-0 focus:translate-y-1 focus:translate-x-1 focus:shadow-none transition-all text-sm font-bold text-black uppercase appearance-none cursor-pointer";
  const labelClass = "block text-xs font-black text-black mb-1.5 uppercase tracking-widest";
  const iconClass = "absolute left-3.5 top-[13px] w-4 h-4 text-black font-black";

  return (
    <div className="bg-[#FEF9C3] rounded-none shadow-[8px_8px_0_0_rgba(0,0,0,1)] border-4 border-black p-6 lg:p-8 h-fit sticky top-28 overflow-y-auto max-h-[calc(100vh-9rem)] scrollbar-hide">
      
      <div className="flex items-center gap-4 mb-8 border-b-4 border-black pb-4">
        <div className="w-12 h-12 bg-[#FF5E5B] flex items-center justify-center text-black border-4 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] rounded-none">
            <Book className="w-6 h-6 stroke-[3]" />
        </div>
        <div>
            <h2 className="text-2xl font-black text-black uppercase tracking-widest">Phiếu Bài Tập</h2>
            <p className="text-xs text-black font-bold uppercase tracking-wider">Chuẩn Retro LaTeX (XeLaTeX)</p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* SECTION 1: INFO */}
        <div className="p-5 bg-[#FEF9C3] border-[3px] border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] space-y-4">
             <div className="flex items-center gap-2 mb-2 pb-3 border-b-4 border-black">
                <div className="w-6 h-6 bg-[#FFED66] border-2 border-black flex items-center justify-center text-black">
                    <Info className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <h3 className="text-sm font-black text-black uppercase tracking-wider">Thông tin chung</h3>
            </div>

            <div className="space-y-4">
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
                            placeholder="Vd: 9"
                            value={config.grade}
                            onChange={e => handleChange('grade', e.target.value)}
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
                            placeholder="Vd: Số Nguyên"
                            value={config.topic}
                            onChange={e => handleChange('topic', e.target.value)}
                            required
                        />
                    </div>
                </div>

                <div className="group relative">
                    <label className={labelClass}>Ngôn ngữ</label>
                    <div className="relative">
                        <Wand2 className={iconClass} />
                        <select
                            className={selectClass}
                            value={config.language || 'bilingual'}
                            onChange={e => handleChange('language', e.target.value)}
                        >
                             <option value="bilingual">Song ngữ Anh - Việt</option>
                             <option value="vietnamese">Thuần Việt</option>
                        </select>
                    </div>
                </div>

                <div className="group relative">
                    <label className={labelClass}>Người biên soạn (Giáo viên)</label>
                    <div className="relative">
                        <User className={iconClass} />
                        <input
                            type="text"
                            className={inputClass}
                            placeholder="Vd: Thầy Trần Huy Hoàng"
                            value={config.teacherName}
                            onChange={e => handleChange('teacherName', e.target.value)}
                            required
                        />
                    </div>
                </div>
            </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || !config.subject || !config.topic || !config.teacherName}
          className={`w-full relative flex items-center justify-center gap-3 py-4 px-6 rounded-none text-black font-black uppercase tracking-widest text-lg border-4 border-black shadow-[6px_6px_0_0_rgba(0,0,0,1)] transition-all duration-75 active:translate-y-[6px] active:translate-x-[6px] active:shadow-none
            ${(isLoading || !config.subject || !config.topic || !config.teacherName)
              ? 'bg-[#E2E8F0] cursor-not-allowed text-gray-500 shadow-none border-gray-400' 
              : 'bg-[#A3E635] hover:bg-[#00CECB]'}`}
        >
          {isLoading ? (
             <>
               <span className="w-5 h-5 border-4 border-black border-t-transparent rounded-full animate-spin"/>
               <span>Đang tạo...</span>
             </>
          ) : (
            <>
              <Wand2 className="w-6 h-6 stroke-[3]" />
              <span>Tạo Worksheet</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default WorksheetForm;
