
import React, { useState } from 'react';
import Header from './components/Header';
import ExamForm from './components/ExamForm';
import LearningForm from './components/LearningForm';
import RoadmapForm from './components/RoadmapForm';
import OutputDisplay from './components/OutputDisplay';
import { generateExamPrompt, generateLearningPrompt, generateRoadmapPrompt } from './services/gemini';
import { ExamConfig, LearningConfig, RoadmapConfig, GenerationStatus } from './types';
import { Sparkles, GraduationCap, BookOpen, Link as LinkIcon, Trash2, ArrowRight, Map, Zap, Lightbulb, ClipboardCheck, Code2, Repeat } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'exam' | 'learning' | 'roadmap'>('roadmap');
  const [status, setStatus] = useState<GenerationStatus>(GenerationStatus.IDLE);
  const [promptContent, setPromptContent] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  
  const [learningContext, setLearningContext] = useState<string | null>(null);
  const [contextMetadata, setContextMetadata] = useState<{topic: string, subject: string, grade: string} | null>(null);

  const handleExamGenerate = (config: ExamConfig) => {
    setStatus(GenerationStatus.LOADING);
    setError(null);
    setTimeout(() => {
        try {
            setPromptContent(generateExamPrompt(config));
            setStatus(GenerationStatus.SUCCESS);
        } catch (err) {
            setStatus(GenerationStatus.ERROR);
            setError('Lỗi khi thiết kế cấu trúc Prompt Đề thi.');
        }
    }, 400);
  };

  const handleLearningGenerate = (config: LearningConfig) => {
    setStatus(GenerationStatus.LOADING);
    setError(null);
    setTimeout(() => {
        try {
            setPromptContent(generateLearningPrompt(config));
            setContextMetadata({ topic: config.topic, subject: config.subject, grade: config.grade });
            setLearningContext(`Bài học về ${config.topic}`);
            setStatus(GenerationStatus.SUCCESS);
        } catch (err) {
            setStatus(GenerationStatus.ERROR);
            setError('Lỗi khi khởi tạo Prompt Bài học.');
        }
    }, 400);
  };

  const handleRoadmapGenerate = (config: RoadmapConfig) => {
    setStatus(GenerationStatus.LOADING);
    setError(null);
    setTimeout(() => {
        try {
            setPromptContent(generateRoadmapPrompt(config));
            setStatus(GenerationStatus.SUCCESS);
        } catch (err) {
            setStatus(GenerationStatus.ERROR);
            setError('Lỗi khi thiết kế Lộ trình học.');
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
        
        <div className="flex flex-col items-center mb-12">
            <div className="flex items-center gap-3 mb-6 bg-white px-4 py-2 rounded-2xl shadow-sm border border-slate-100">
                <div className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-tighter ${activeTab === 'roadmap' ? 'text-amber-600' : 'text-slate-400'}`}>
                    Lộ trình
                </div>
                <ArrowRight className="w-3 h-3 text-slate-300" />
                <div className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-tighter ${activeTab === 'learning' ? 'text-teal-600' : 'text-slate-400'}`}>
                    Bài Học
                </div>
                <ArrowRight className="w-3 h-3 text-slate-300" />
                <div className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-tighter ${activeTab === 'exam' ? 'text-indigo-600' : 'text-slate-400'}`}>
                    Đề Thi
                </div>
            </div>

            <div className="bg-white/40 backdrop-blur-md p-1.5 rounded-[2rem] border border-white shadow-2xl flex items-center gap-2">
                <button
                    onClick={() => setActiveTab('roadmap')}
                    className={`flex items-center gap-2 px-6 py-3 rounded-[1.5rem] text-sm font-extrabold transition-all
                    ${activeTab === 'roadmap' ? 'bg-amber-500 text-white shadow-lg' : 'text-slate-500 hover:bg-white'}`}
                >
                    <Map className="w-4 h-4" />
                    Lộ trình
                </button>
                <button
                    onClick={() => setActiveTab('learning')}
                    className={`flex items-center gap-2 px-6 py-3 rounded-[1.5rem] text-sm font-extrabold transition-all
                    ${activeTab === 'learning' ? 'bg-teal-600 text-white shadow-lg' : 'text-slate-500 hover:bg-white'}`}
                >
                    <BookOpen className="w-4 h-4" />
                    Bài học
                </button>
                <button
                    onClick={() => setActiveTab('exam')}
                    className={`flex items-center gap-2 px-6 py-3 rounded-[1.5rem] text-sm font-extrabold transition-all
                    ${activeTab === 'exam' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:bg-white'}`}
                >
                    <GraduationCap className="w-4 h-4" />
                    Đề thi
                </button>
            </div>

            {learningContext && (
                <div className="mt-8 w-full max-w-2xl bg-gradient-to-br from-amber-400 to-orange-500 p-[1px] rounded-3xl shadow-lg group animate-bounce-subtle">
                    <div className="bg-white/95 px-6 py-4 rounded-[calc(1.5rem-1px)] flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
                                <LinkIcon className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="text-[10px] font-black text-amber-800 uppercase tracking-widest">Đang đồng bộ kiến thức</h4>
                                <p className="text-sm text-slate-600 font-semibold">{contextMetadata?.topic}</p>
                            </div>
                        </div>
                        <button onClick={clearContext} className="p-2 text-slate-300 hover:text-red-500"><Trash2 className="w-5 h-5" /></button>
                    </div>
                </div>
            )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-4 lg:sticky lg:top-28">
            {activeTab === 'roadmap' ? (
                <RoadmapForm onSubmit={handleRoadmapGenerate} status={status} />
            ) : activeTab === 'learning' ? (
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
            <OutputDisplay content={promptContent} status={status} error={error} />
            
            {status === GenerationStatus.SUCCESS && (
                 <div className="p-8 glass-card rounded-[2.5rem] border-white shadow-xl animate-in fade-in zoom-in duration-300">
                    <div className="flex items-start gap-6">
                        <div className={`w-14 h-14 rounded-3xl flex items-center justify-center shadow-lg transform rotate-3 
                          ${activeTab === 'exam' ? 'bg-indigo-600' : activeTab === 'learning' ? 'bg-teal-600' : 'bg-amber-500'} text-white`}>
                            <Zap className="w-7 h-7" />
                        </div>
                        <div className="flex-1">
                            <h4 className="text-xl font-extrabold mb-2">Prompt Master đã sẵn sàng!</h4>
                            <p className="text-slate-600 font-medium">
                                Hãy sao chép mã này và dán vào <b>ChatGPT</b> hoặc <b>Claude</b> để nhận được kết quả LaTeX chuẩn xác nhất.
                            </p>
                        </div>
                    </div>
                 </div>
            )}

            {/* HƯỚNG DẪN SỬ DỤNG */}
            <div className="mt-12 p-10 bg-slate-900 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[80px] rounded-full -mr-20 -mt-20"></div>
                <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-amber-400">
                            <Lightbulb className="w-6 h-6" />
                        </div>
                        <h3 className="text-2xl font-black tracking-tight">Quy trình học tập khép kín</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="space-y-4">
                            <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center font-black text-sm shadow-lg shadow-amber-500/20">1</div>
                            <h5 className="font-bold text-lg">Lên Lộ Trình Chi Tiết</h5>
                            <p className="text-slate-400 text-sm leading-relaxed">AI đề xuất học gì từng ngày và quan trọng nhất là <b>"Học gì tiếp theo"</b> để bạn không bao giờ dừng lại.</p>
                        </div>
                        <div className="space-y-4">
                            <div className="w-10 h-10 rounded-full bg-teal-500 flex items-center justify-center font-black text-sm shadow-lg shadow-teal-500/20">2</div>
                            <h5 className="font-bold text-lg">Soạn Bài Học Gối Đầu</h5>
                            <p className="text-slate-400 text-sm leading-relaxed">Biến các đầu việc trong lộ trình thành tài liệu học tập LaTeX chuyên sâu ngay lập tức.</p>
                        </div>
                        <div className="space-y-4">
                            <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center font-black text-sm shadow-lg shadow-indigo-500/20">3</div>
                            <h5 className="font-bold text-lg">Kiểm Tra & Lặp Lại</h5>
                            <p className="text-slate-400 text-sm leading-relaxed">Tạo đề thi để đánh giá kiến thức, sau đó quay lại bước 1 với chủ đề nâng cao mà AI đã gợi ý.</p>
                        </div>
                    </div>

                    <div className="mt-10 pt-8 border-t border-white/10 flex flex-wrap gap-6 items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-widest">
                        <div className="flex items-center gap-2">
                            <Repeat className="w-4 h-4 text-amber-400" />
                            Học tập suốt đời
                        </div>
                        <div className="flex items-center gap-2">
                            <Code2 className="w-4 h-4 text-blue-400" />
                            Latex hóa kiến thức
                        </div>
                        <div className="flex items-center gap-2 text-indigo-400">
                            YUTA LEARNING SYSTEM
                        </div>
                    </div>
                </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
