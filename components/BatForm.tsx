import React, { useState, useEffect } from 'react';
import { Terminal, Settings, Wand2, Info, Layout } from "lucide-react";
import { BatConfig, GenerationStatus } from '../types';

interface BatFormProps {
  onSubmit: (data: BatConfig) => void;
  status: GenerationStatus;
  contextTopic?: string;
  contextSubject?: string;
}

const BatForm: React.FC<BatFormProps> = ({ onSubmit, status, contextTopic, contextSubject }) => {
  const [config, setConfig] = useState<BatConfig>({
    task: contextTopic ? `Script dọn dẹp file rác LaTeX và tổ chức thư mục cho ${contextSubject || ''} - ${contextTopic}` : 'Tự động dọn dẹp file rác .aux, .log sau khi biên dịch LaTeX',
    details: ''
  });

  useEffect(() => {
    if (contextTopic || contextSubject) {
      setConfig(prev => ({
        ...prev,
        task: `Script dọn dẹp file rác LaTeX và tổ chức thư mục cho ${contextSubject || ''} - ${contextTopic}`
      }));
    }
  }, [contextTopic, contextSubject]);

  const isLoading = status === GenerationStatus.LOADING;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(config);
  };

  const handleChange = (field: keyof BatConfig, value: any) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const inputClass = "w-full pl-10 pr-4 py-2.5 bg-[#ffffff] rounded-none border-[3px] border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] focus:ring-0 focus:translate-y-1 focus:translate-x-1 focus:shadow-none transition-all text-sm font-bold text-black placeholder:text-gray-700 uppercase";
  const labelClass = "block text-xs font-black text-black mb-1.5 uppercase tracking-widest";
  const iconClass = "pointer-events-none absolute left-3.5 top-[13px] w-4 h-4 text-black font-black";

  return (
    <div className="bg-[#ffffff] rounded-none shadow-[8px_8px_0_0_rgba(0,0,0,1)] border-4 border-black p-6 lg:p-8 h-fit sticky top-28 overflow-y-auto max-h-[calc(100vh-9rem)] scrollbar-hide">
      
      <div className="flex items-center gap-4 mb-8 border-b-4 border-black pb-4">
        <div className="w-12 h-12 bg-[#FFED66] flex items-center justify-center text-black border-4 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] rounded-none">
            <Terminal className="w-6 h-6 stroke-[3]" />
        </div>
        <div>
            <h2 className="text-2xl font-black text-black uppercase tracking-widest">Automation Script</h2>
            <p className="text-xs text-black font-bold uppercase tracking-wider">Windows Batch (.bat)</p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* SECTION 1: INFO */}
        <div className="p-5 bg-[#ffffff] border-[3px] border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] space-y-4">
             <div className="flex items-center gap-2 mb-2 pb-3 border-b-4 border-black">
                <div className="w-6 h-6 bg-[#A3E635] border-2 border-black flex items-center justify-center text-black">
                    <Info className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <h3 className="text-sm font-black text-black uppercase tracking-wider">Thông tin kịch bản</h3>
            </div>

            <div className="space-y-4">
                <div className="group relative">
                    <label className={labelClass}>Mục tiêu / Tác vụ</label>
                    <div className="relative">
                        <Terminal className={iconClass} />
                        <input
                            type="text"
                            className={inputClass}
                            placeholder="Vd: Tự động xóa file .log, .aux..."
                            value={config.task}
                            onChange={e => handleChange('task', e.target.value)}
                            required
                        />
                    </div>
                </div>

                <div className="group relative mt-4">
                    <label className={labelClass}>Yêu cầu nâng cao (Tùy chọn)</label>
                    <div className="relative">
                        <textarea
                            className={inputClass + " min-h-[100px] pt-3 pl-4"}
                            placeholder="Vd: Thêm màu sắc hiển thị, kiểm tra thư mục tồn tại..."
                            value={config.details || ''}
                            onChange={e => handleChange('details', e.target.value)}
                        />
                    </div>
                </div>

            </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || !config.task}
          className={`w-full relative flex items-center justify-center gap-3 py-4 px-6 rounded-none text-black font-black uppercase tracking-widest text-lg border-4 border-black shadow-[6px_6px_0_0_rgba(0,0,0,1)] transition-all duration-75 active:translate-y-[6px] active:translate-x-[6px] active:shadow-none
            ${(isLoading || !config.task)
              ? 'bg-[#E2E8F0] cursor-not-allowed text-gray-700 shadow-none border-gray-400' 
              : 'bg-[#FFED66] hover:bg-[#FFD700]'}`}
        >
          {isLoading ? (
             <>
               <span className="w-5 h-5 border-4 border-black border-t-transparent rounded-full animate-spin"/>
               <span>Đang tạo...</span>
             </>
          ) : (
            <>
              <Wand2 className="w-6 h-6 stroke-[3]" />
              <span>Tạo Script .BAT</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default BatForm;
