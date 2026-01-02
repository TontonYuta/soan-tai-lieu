import React, { useState } from 'react';
import Header from './components/Header';
import ExamForm from './components/ExamForm';
import LearningForm from './components/LearningForm';
import OutputDisplay from './components/OutputDisplay';
import { generateExamContent, generateLearningContent } from './services/gemini';
import { ExamConfig, LearningConfig, GenerationStatus } from './types';
import { Sparkles, GraduationCap, BookOpen } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'exam' | 'learning'>('exam');
  const [status, setStatus] = useState<GenerationStatus>(GenerationStatus.IDLE);
  const [promptContent, setPromptContent] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleExamGenerate = async (config: ExamConfig) => {
    setStatus(GenerationStatus.LOADING);
    setError(null);
    setPromptContent('');
    try {
      const content = await generateExamContent(config);
      setPromptContent(content);
      setStatus(GenerationStatus.SUCCESS);
    } catch (err: any) {
      setStatus(GenerationStatus.ERROR);
      setError(err.message || 'Có lỗi xảy ra.');
    }
  };

  const handleLearningGenerate = async (config: LearningConfig) => {
    setStatus(GenerationStatus.LOADING);
    setError(null);
    setPromptContent('');
    try {
      const content = await generateLearningContent(config);
      setPromptContent(content);
      setStatus(GenerationStatus.SUCCESS);
    } catch (err: any) {
      setStatus(GenerationStatus.ERROR);
      setError(err.message || 'Có lỗi xảy ra.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Header />
      
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
            <div className="bg-white/50 backdrop-blur-sm p-1 rounded-2xl border border-white/60 shadow-sm flex items-center gap-1">
                <button
                    onClick={() => setActiveTab('exam')}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300
                    ${activeTab === 'exam' 
                        ? 'bg-white text-indigo-600 shadow-md shadow-indigo-100 ring-1 ring-black/5 scale-100' 
                        : 'text-slate-500 hover:bg-white/50 hover:text-slate-700'}`}
                >
                    <GraduationCap className="w-4 h-4" />
                    Soạn Đề Thi
                </button>
                <button
                    onClick={() => setActiveTab('learning')}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300
                    ${activeTab === 'learning' 
                        ? 'bg-white text-teal-600 shadow-md shadow-teal-100 ring-1 ring-black/5 scale-100' 
                        : 'text-slate-500 hover:bg-white/50 hover:text-slate-700'}`}
                >
                    <BookOpen className="w-4 h-4" />
                    Soạn Bài Học
                </button>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full items-start">
          {/* Left Column: Input Forms */}
          <div className="lg:col-span-4 z-10">
            {activeTab === 'exam' ? (
                <div className="animate-in fade-in slide-in-from-left-4 duration-500">
                    <ExamForm onSubmit={handleExamGenerate} status={status} />
                </div>
            ) : (
                <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                    <LearningForm onSubmit={handleLearningGenerate} status={status} />
                </div>
            )}
          </div>

          {/* Right Column: Output */}
          <div className="lg:col-span-8 z-0">
            <OutputDisplay 
              content={promptContent} 
              status={status} 
              error={error} 
            />
            
            {status === GenerationStatus.SUCCESS && (
                 <div className={`mt-6 p-5 backdrop-blur-md rounded-2xl border flex items-start gap-3 shadow-sm transition-colors duration-500
                    ${activeTab === 'exam' 
                        ? 'bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border-indigo-100 text-indigo-900' 
                        : 'bg-gradient-to-r from-teal-500/10 to-emerald-500/10 border-teal-100 text-teal-900'}`
                 }>
                    <Sparkles className={`w-5 h-5 flex-shrink-0 mt-0.5 ${activeTab === 'exam' ? 'text-indigo-600' : 'text-teal-600'}`} />
                    <div className="text-sm">
                        <strong className={`block mb-1 ${activeTab === 'exam' ? 'text-indigo-700' : 'text-teal-700'}`}>Mẹo nhỏ:</strong> 
                        Sao chép prompt trên và dán vào ChatGPT hoặc Gemini. 
                        {activeTab === 'exam' 
                            ? ' Nếu kết quả chưa ưng ý, hãy yêu cầu AI "điều chỉnh lại căn lề" hoặc "thêm lời giải chi tiết".'
                            : ' Bạn có thể yêu cầu AI "thêm ví dụ thực tế" hoặc "giải thích lại phần này đơn giản hơn".'}
                    </div>
                 </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;