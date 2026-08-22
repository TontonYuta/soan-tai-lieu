import React, { useState, useEffect } from 'react';
import { Wand2, Sparkles, BookOpen, Layout, HelpCircle, Info, PlusCircle, CheckSquare, Square, FileText } from "lucide-react";
import { SimilarExerciseConfig, GenerationStatus } from '../types';

interface SimilarExerciseFormProps {
  onSubmit: (data: SimilarExerciseConfig) => void;
  status: GenerationStatus;
  contextTopic?: string;
  contextSubject?: string;
  contextGrade?: string;
}

const SimilarExerciseForm: React.FC<SimilarExerciseFormProps> = ({ 
  onSubmit, 
  status, 
  contextTopic, 
  contextSubject, 
  contextGrade 
}) => {
  const [config, setConfig] = useState<SimilarExerciseConfig>({
    subject: contextSubject || 'Toán học',
    topic: contextTopic || '',
    grade: contextGrade || '12',
    sourceExercises: '',
    count: 3,
    difficulty: 'keep',
    includeSolution: true,
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
    if (config.subject && config.topic && config.sourceExercises.trim()) {
      onSubmit(config);
    }
  };

  const handleChange = (field: keyof SimilarExerciseConfig, value: any) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const inputClass = "w-full pl-10 pr-4 py-2.5 bg-[#ffffff] rounded-none border-[3px] border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] focus:ring-0 focus:translate-y-1 focus:translate-x-1 focus:shadow-none transition-all text-sm font-bold text-black placeholder:text-gray-500 uppercase";
  const selectClass = "w-full pl-10 pr-4 py-2.5 bg-[#ffffff] rounded-none border-[3px] border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] focus:ring-0 focus:translate-y-1 focus:translate-x-1 focus:shadow-none transition-all text-sm font-bold text-black uppercase cursor-pointer appearance-none";
  const textareaClass = "w-full p-4 bg-[#ffffff] rounded-none border-[3px] border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] focus:ring-0 focus:translate-y-1 focus:translate-x-1 focus:shadow-none transition-all text-sm font-medium text-black placeholder:text-gray-500 min-h-[140px]";
  const labelClass = "block text-xs font-black text-black mb-1.5 uppercase tracking-widest";
  const iconClass = "pointer-events-none absolute left-3.5 top-[13px] w-4 h-4 text-black font-black";

  return (
    <div className="bg-[#ffffff] rounded-none shadow-[8px_8px_0_0_rgba(0,0,0,1)] border-4 border-black p-6 lg:p-8 h-fit sticky top-28 overflow-y-auto max-h-[calc(100vh-9rem)] scrollbar-hide">
      
      {/* Header */}
      <div className="flex items-center gap-4 mb-8 border-b-4 border-black pb-4">
        <div className="w-12 h-12 bg-[#FB7185] flex items-center justify-center text-black border-4 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] rounded-none">
          <Sparkles className="w-6 h-6 stroke-[3]" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-black uppercase tracking-widest">Bài Tập Tương Tự</h2>
          <p className="text-xs text-black font-bold uppercase tracking-wider">Đổi số & Phát triển biến thể đề</p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* SECTION 1: INFO */}
        <div className="p-5 bg-[#ffffff] border-[3px] border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] space-y-4">
          <div className="flex items-center gap-2 mb-2 pb-3 border-b-4 border-black">
            <div className="w-6 h-6 bg-[#A3E635] border-2 border-black flex items-center justify-center text-black">
              <Info className="w-3.5 h-3.5 stroke-[3]" />
            </div>
            <h3 className="text-sm font-black text-black uppercase tracking-wider">Thông tin chuyên đề</h3>
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
                    placeholder="Vd: Toán học"
                    value={config.subject}
                    onChange={e => handleChange('subject', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="group relative">
                <label className={labelClass}>Khối lớp</label>
                <div className="relative">
                  <Layout className={iconClass} />
                  <select
                    className={selectClass}
                    value={config.grade || '12'}
                    onChange={e => handleChange('grade', e.target.value)}
                  >
                    <option value="10">Lớp 10</option>
                    <option value="11">Lớp 11</option>
                    <option value="12">Lớp 12</option>
                    <option value="Ôn thi THPT">Ôn thi THPT QG</option>
                    <option value="Đại học">Đại học / Cao đẳng</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="group relative">
              <label className={labelClass}>Chủ đề / Dạng bài</label>
              <div className="relative">
                <Layout className={iconClass} />
                <input
                  type="text"
                  className={inputClass}
                  placeholder="Vd: Cực trị hàm ẩn, Khoảng cách trong không gian Oxyz..."
                  value={config.topic}
                  onChange={e => handleChange('topic', e.target.value)}
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: SOURCE EXERCISES */}
        <div className="p-5 bg-[#ffffff] border-[3px] border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] space-y-4">
          <div className="flex items-center gap-2 mb-2 pb-3 border-b-4 border-black">
            <div className="w-6 h-6 bg-[#00CECB] border-2 border-black flex items-center justify-center text-black">
              <FileText className="w-3.5 h-3.5 stroke-[3]" />
            </div>
            <h3 className="text-sm font-black text-black uppercase tracking-wider">Bài toán gốc (Dán đề bài mẫu vào đây)</h3>
          </div>

          <div className="group relative">
            <textarea
              className={textareaClass}
              placeholder="Dán câu hỏi hoặc bài toán mẫu (text hoặc mã LaTeX) bạn muốn AI nhân bản hoặc đổi số..."
              value={config.sourceExercises}
              onChange={e => handleChange('sourceExercises', e.target.value)}
              required
            />
          </div>
        </div>

        {/* SECTION 3: OPTIONS */}
        <div className="p-5 bg-[#ffffff] border-[3px] border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] space-y-4">
          <div className="flex items-center gap-2 mb-2 pb-3 border-b-4 border-black">
            <div className="w-6 h-6 bg-[#FFED66] border-2 border-black flex items-center justify-center text-black">
              <PlusCircle className="w-3.5 h-3.5 stroke-[3]" />
            </div>
            <h3 className="text-sm font-black text-black uppercase tracking-wider">Cấu hình phát triển</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="group relative">
              <label className={labelClass}>Số lượng bài tương tự</label>
              <input
                type="number"
                min="1"
                max="10"
                className={inputClass + " pl-4"}
                value={config.count}
                onChange={e => handleChange('count', parseInt(e.target.value) || 1)}
              />
            </div>

            <div className="group relative">
              <label className={labelClass}>Định hướng độ khó</label>
              <select 
                className={selectClass + " pl-4"}
                value={config.difficulty}
                onChange={e => handleChange('difficulty', e.target.value)}
              >
                <option value="keep">Tương đương bài mẫu</option>
                <option value="easier">Dễ hơn (Số liệu tròn, ít bước)</option>
                <option value="harder">Khó hơn (Tăng biến đổi & bẫy)</option>
              </select>
            </div>
          </div>

          <div className="pt-2 border-t-2 border-dashed border-black">
            <button
              type="button"
              onClick={() => handleChange('includeSolution', !config.includeSolution)}
              className="flex items-center gap-3 p-2 bg-[#ffffff] border-2 border-black w-full shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:bg-[#FFECA1] transition-all cursor-pointer text-left"
            >
              {config.includeSolution ? (
                <CheckSquare className="w-5 h-5 text-black stroke-[3] shrink-0" />
              ) : (
                <Square className="w-5 h-5 text-black stroke-[2] shrink-0" />
              )}
              <span className="text-xs font-black text-black uppercase">
                Bao gồm lời giải chi tiết từng bước
              </span>
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || !config.subject || !config.topic || !config.sourceExercises.trim()}
          className={`w-full relative flex items-center justify-center gap-3 py-4 px-6 rounded-none text-black font-black uppercase tracking-widest text-lg border-4 border-black shadow-[6px_6px_0_0_rgba(0,0,0,1)] transition-all duration-75 active:translate-y-[6px] active:translate-x-[6px] active:shadow-none
            ${(isLoading || !config.subject || !config.topic || !config.sourceExercises.trim())
              ? 'bg-[#E2E8F0] cursor-not-allowed text-gray-500 shadow-none border-gray-400' 
              : 'bg-[#FB7185] hover:bg-[#F43F5E]'}`}
        >
          {isLoading ? (
            <>
              <span className="w-5 h-5 border-4 border-black border-t-transparent rounded-full animate-spin"/>
              <span>Đang tạo prompt...</span>
            </>
          ) : (
            <>
              <Wand2 className="w-6 h-6 stroke-[3]" />
              <span>Tạo Prompt Bài Tập Tương Tự</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default SimilarExerciseForm;