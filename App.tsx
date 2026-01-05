import React, { useState } from 'react';
import Header from './components/Header';
import ExamForm from './components/ExamForm';
import LearningForm from './components/LearningForm';
import OutputDisplay from './components/OutputDisplay';
import { generateExamPrompt, generateLearningPrompt } from './services/gemini';
import { ExamConfig, LearningConfig, GenerationStatus } from './types';
import { Sparkles, GraduationCap, BookOpen, Link as LinkIcon, Trash2, ArrowRight, Layers, Zap } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'exam' | 'learning'>('learning');
  const [status, setStatus] = useState<GenerationStatus>(GenerationStatus.IDLE);
  const [promptContent, setPromptContent] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  
  // Hệ thống lưu trữ ngữ cảnh đồng bộ nâng cao
  const [learningContext, setLearningContext] = useState<string | null>(null);
  const [contextMetadata, setContextMetadata] = useState<{topic: string, subject: string, grade: string} | null>(null);

  const handleExamGenerate = (config: ExamConfig) => {
    setStatus(GenerationStatus.LOADING);
    setError(null);
    
    // Xử lý tức thì không qua AI để lấy Prompt Master
    setTimeout(() => {
        try {
            const prompt = generateExamPrompt(config);
            setPromptContent(prompt);
            setStatus(GenerationStatus.SUCCESS);
        } catch (err: any) {
            setStatus(GenerationStatus.ERROR);
            setError('Lỗi khi thiết kế cấu trúc Prompt.');
        }
    }, 400); // Giả lập một chút delay để UX mượt mà hơn
  };

  const handleLearningGenerate = (config: LearningConfig) => {
    setStatus(GenerationStatus.LOADING);
    setError(null);

    // Xử lý tức thì 100% không dùng AI cho bước tạo Prompt
    setTimeout(() => {
        try {
            const prompt = generateLearningPrompt(config);
            setPromptContent(prompt);
            // Lưu lại metadata để đồng bộ nếu người dùng muốn soạn đề sau đó
            setContextMetadata({ 
                topic: config.topic, 
                subject: config.subject,
                grade: config.grade
            });
            // Giả lập nội dung tham khảo là tên chủ đề bài học
            setLearningContext(`Bài học về ${config.topic} cho đối tượng ${config.audience}`);
            setStatus(GenerationStatus.SUCCESS);
        } catch (err: any) {
            setStatus(GenerationStatus.ERROR);
            setError('Lỗi khi khởi tạo Prompt bài học.');
        }
    }, 400);
  };

  const clearContext = () => {
    setLearningContext(null);
    setContextMetadata(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Header />
      
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Step Navigator */}
        <div className="flex flex-col items-center mb-12">
            <div className="flex items-center gap-3 mb-6 bg-white px-4 py-2 rounded-2xl shadow-sm border border-slate-100">
                <div className={`flex items-center gap-2 text-xs font-bold uppercase tracking-tighter transition-colors duration-300 ${activeTab === 'learning' ? 'text-teal-600' : 'text-slate-400'}`}>
                    <span className="w-5 h-5 rounded-full bg-teal-50 flex items-center justify-center border border-teal-100">1</span>
                    Soạn Bài Học
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300" />
                <div className={`flex items-center gap-2 text-xs font-bold uppercase tracking-tighter transition-colors duration-300 ${activeTab === 'exam' ? 'text-indigo-600' : 'text-slate-400'}`}>
                    <span className="w-5 h-5 rounded-full bg-indigo-50 flex items-center justify-center border border-indigo-100">2</span>
                    Soạn Đề Thi
                </div>
            </div>

            <div className="bg-white/40 backdrop-blur-md p-1.5 rounded-[2rem] border border-white shadow-2xl flex items-center gap-2">
                <button
                    onClick={() => setActiveTab('learning')}
                    className={`flex items-center gap-2 px-8 py-3.5 rounded-[1.5rem] text-sm font-extrabold transition-all duration-500
                    ${activeTab === 'learning' 
                        ? 'bg-teal-600 text-white shadow-xl shadow-teal-200 scale-105' 
                        : 'text-slate-500 hover:bg-white hover:text-teal-600'}`}
                >
                    <BookOpen className="w-4 h-4" />
                    Bắt đầu Soạn bài
                </button>
                <button
                    onClick={() => setActiveTab('exam')}
                    className={`flex items-center gap-2 px-8 py-3.5 rounded-[1.5rem] text-sm font-extrabold transition-all duration-500
                    ${activeTab === 'exam' 
                        ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200 scale-105' 
                        : 'text-slate-500 hover:bg-white hover:text-indigo-600'}`}
                >
                    <GraduationCap className="w-4 h-4" />
                    Thiết kế Đề thi
                </button>
            </div>

            {/* Sync Status Banner */}
            {learningContext && (
                <div className="mt-8 w-full max-w-2xl bg-gradient-to-br from-amber-400 to-orange-500 p-[1px] rounded-3xl shadow-lg shadow-orange-200/50 group">
                    <div className="bg-white/95 backdrop-blur-sm px-6 py-4 rounded-[calc(1.5rem-1px)] flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600 animate-float">
                                <LinkIcon className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="text-xs font-black text-amber-800 uppercase tracking-widest">Đang đồng bộ kiến thức</h4>
                                <p className="text-sm text-slate-600 font-semibold line-clamp-1">
                                    Môn {contextMetadata?.subject}: {contextMetadata?.topic} (Lớp {contextMetadata?.grade})
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            {activeTab !== 'exam' && (
                                <button 
                                    onClick={() => setActiveTab('exam')}
                                    className="px-5 py-2.5 bg-indigo-600 text-white text-xs font-black rounded-2xl hover:bg-indigo-700 transition-all shadow-md active:scale-95"
                                >
                                    SANG SOẠN ĐỀ
                                </button>
                            )}
                            <button 
                                onClick={clearContext}
                                className="p-2.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                title="Xóa dữ liệu đồng bộ"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-4 lg:sticky lg:top-28">
            {activeTab === 'learning' ? (
                <LearningForm onSubmit={handleLearningGenerate} status={status} />
            ) : (
                <ExamForm 
                    onSubmit={handleExamGenerate} 
                    status={status} 
                    initialContext={learningContext || undefined}
                    contextTopic={contextMetadata?.topic}
                    contextSubject={contextMetadata?.subject}
                    contextGrade={contextMetadata?.grade}
                />
            )}
          </div>

          <div className="lg:col-span-8 space-y-6">
            <OutputDisplay 
              content={promptContent} 
              status={status} 
              error={error} 
            />
            
            {status === GenerationStatus.SUCCESS && (
                 <div className="p-8 glass-card rounded-[2.5rem] border-white shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="flex items-start gap-6">
                        <div className={`w-14 h-14 rounded-3xl flex items-center justify-center shadow-lg transform rotate-3 ${activeTab === 'exam' ? 'bg-indigo-600 text-white' : 'bg-teal-600 text-white'}`}>
                            <Zap className="w-7 h-7" />
                        </div>
                        <div className="flex-1">
                            <h4 className={`text-xl font-extrabold mb-2 ${activeTab === 'exam' ? 'text-indigo-900' : 'text-teal-900'}`}>
                                Prompt Master đã sẵn sàng!
                            </h4>
                            <p className="text-slate-600 leading-relaxed font-medium">
                                Đây là bản đặc tả đã được tối ưu hóa cấu trúc sư phạm và mã lệnh LaTeX. Hãy sao chép và dán vào các công cụ như <b>ChatGPT Plus</b>, <b>Claude 3.5</b> hoặc <b>Gemini Pro</b> để nhận file LaTeX hoàn hảo.
                            </p>
                        </div>
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
