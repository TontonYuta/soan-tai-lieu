
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ExamForm from './components/ExamForm';
import LearningForm from './components/LearningForm';
import RoadmapForm from './components/RoadmapForm';
import TTSForm from './components/TTSForm';
import SimilarExerciseForm from './components/SimilarExerciseForm';
import OutputDisplay from './components/OutputDisplay';
import { generateExamPrompt, generateLearningPrompt, generateRoadmapPrompt, generateTTSPrompt, generateSimilarExercisePrompt } from './services/gemini';
import { ExamConfig, LearningConfig, RoadmapConfig, TTSConfig, SimilarExerciseConfig, GenerationStatus } from './types';
import { Sparkles, GraduationCap, BookOpen, Link as LinkIcon, Trash2, ArrowRight, Map, Zap, Lightbulb, ClipboardCheck, MessageSquareText, Info, ExternalLink, Save, Volume2, PlusCircle } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'exam' | 'learning' | 'roadmap' | 'tts' | 'similar'>('roadmap');
  const [status, setStatus] = useState<GenerationStatus>(GenerationStatus.IDLE);
  const [promptContent, setPromptContent] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  
  // Link Gemini cố định
  const [geminiLink, setGeminiLink] = useState<string>(localStorage.getItem('gemini_fixed_link') || '');
  const [isEditingLink, setIsEditingLink] = useState(false);

  const [learningContext, setLearningContext] = useState<string | null>(null);
  const [contextMetadata, setContextMetadata] = useState<{topic: string, subject: string, grade: string} | null>(null);

  const handleSaveLink = () => {
    localStorage.setItem('gemini_fixed_link', geminiLink);
    setIsEditingLink(false);
  };

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
            setLearningContext(`Lộ trình/Bài học: ${config.topic}`);
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
            setContextMetadata({ topic: config.topic, subject: config.subject, grade: 'Hệ thống' });
            setLearningContext(`Lộ trình tổng thể: ${config.topic}`);
            setStatus(GenerationStatus.SUCCESS);
        } catch (err) {
            setStatus(GenerationStatus.ERROR);
            setError('Lỗi khi thiết kế Lộ trình học.');
        }
    }, 400);
  };

  const handleTTSGenerate = (config: TTSConfig) => {
    setStatus(GenerationStatus.LOADING);
    setError(null);
    setTimeout(() => {
        try {
            setPromptContent(generateTTSPrompt(config));
            setStatus(GenerationStatus.SUCCESS);
        } catch (err) {
            setStatus(GenerationStatus.ERROR);
            setError('Lỗi khi tối ưu văn bản TTS.');
        }
    }, 400);
  };

  const handleSimilarGenerate = (config: SimilarExerciseConfig) => {
    setStatus(GenerationStatus.LOADING);
    setError(null);
    setTimeout(() => {
        try {
            setPromptContent(generateSimilarExercisePrompt(config));
            setStatus(GenerationStatus.SUCCESS);
        } catch (err) {
            setStatus(GenerationStatus.ERROR);
            setError('Lỗi khi tạo bài tập tương tự.');
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
        
        {/* Fixed Chat Link Manager */}
        <div className="mb-8 max-w-3xl mx-auto w-full">
            <div className="bg-indigo-900 rounded-[2rem] p-4 shadow-xl border border-indigo-800 flex flex-col md:flex-row items-center gap-4">
                <div className="flex items-center gap-3 px-4 py-2 bg-indigo-800/50 rounded-2xl shrink-0">
                    <MessageSquareText className="w-5 h-5 text-indigo-300" />
                    <span className="text-xs font-black text-indigo-100 uppercase tracking-widest">Kênh Gemini Cố định</span>
                </div>
                
                <div className="flex-1 w-full relative group">
                    <input 
                        type="text"
                        placeholder="Dán link đoạn chat Gemini của bạn tại đây..."
                        value={geminiLink}
                        onChange={(e) => setGeminiLink(e.target.value)}
                        onFocus={() => setIsEditingLink(true)}
                        className="w-full bg-indigo-950/50 border border-indigo-700/50 rounded-xl px-4 py-2.5 text-sm text-indigo-100 placeholder:text-indigo-400/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all font-medium"
                    />
                    {isEditingLink && (
                        <button 
                            onClick={handleSaveLink}
                            className="absolute right-2 top-1.5 p-1.5 bg-indigo-500 hover:bg-indigo-400 text-white rounded-lg transition-colors shadow-lg"
                        >
                            <Save className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {geminiLink && !isEditingLink && (
                    <a 
                        href={geminiLink} 
                        target="_blank" 
                        rel="noreferrer"
                        className="flex items-center gap-2 px-6 py-2.5 bg-white text-indigo-900 rounded-xl text-xs font-black hover:bg-indigo-50 transition-all shadow-lg shrink-0"
                    >
                        <ExternalLink className="w-4 h-4" />
                        VÀO ĐOẠN CHAT
                    </a>
                )}
            </div>
            <p className="text-[10px] text-slate-400 font-bold mt-2 px-6 flex items-center gap-2">
                <Info className="w-3 h-3" />
                Dán link này để AI ghi nhớ bài học cũ, tránh trùng lặp kiến thức khi sinh Prompt mới.
            </p>
        </div>

        <div className="flex flex-col items-center mb-12">
            <div className="flex items-center gap-3 mb-6 bg-white px-4 py-2 rounded-2xl shadow-sm border border-slate-100">
                <div className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-tighter ${activeTab === 'roadmap' ? 'text-amber-600' : 'text-slate-400'}`}>
                    1. Lộ trình
                </div>
                <ArrowRight className="w-3 h-3 text-slate-300" />
                <div className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-tighter ${activeTab === 'learning' ? 'text-teal-600' : 'text-slate-400'}`}>
                    2. Bài Học
                </div>
                <ArrowRight className="w-3 h-3 text-slate-300" />
                <div className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-tighter ${activeTab === 'exam' ? 'text-indigo-600' : 'text-slate-400'}`}>
                    3. Đề Thi
                </div>
                <ArrowRight className="w-3 h-3 text-slate-300" />
                <div className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-tighter ${activeTab === 'tts' ? 'text-purple-600' : 'text-slate-400'}`}>
                    4. Nghe (TTS)
                </div>
                <ArrowRight className="w-3 h-3 text-slate-300" />
                <div className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-tighter ${activeTab === 'similar' ? 'text-amber-600' : 'text-slate-400'}`}>
                    5. Tương tự
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
                <button
                    onClick={() => setActiveTab('tts')}
                    className={`flex items-center gap-2 px-6 py-3 rounded-[1.5rem] text-sm font-extrabold transition-all
                    ${activeTab === 'tts' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-500 hover:bg-white'}`}
                >
                    <Volume2 className="w-4 h-4" />
                    Nghe (TTS)
                </button>
                <button
                    onClick={() => setActiveTab('similar')}
                    className={`flex items-center gap-2 px-6 py-3 rounded-[1.5rem] text-sm font-extrabold transition-all
                    ${activeTab === 'similar' ? 'bg-amber-600 text-white shadow-lg' : 'text-slate-500 hover:bg-white'}`}
                >
                    <PlusCircle className="w-4 h-4" />
                    Tương tự
                </button>
            </div>

            {learningContext && (
                <div className="mt-8 w-full max-w-2xl bg-gradient-to-br from-indigo-500 to-purple-600 p-[1px] rounded-3xl shadow-lg animate-in zoom-in-95 duration-300">
                    <div className="bg-white/95 px-6 py-4 rounded-[calc(1.5rem-1px)] flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
                                <LinkIcon className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="text-[10px] font-black text-indigo-800 uppercase tracking-widest">Đang giữ ngữ cảnh đồng bộ</h4>
                                <p className="text-sm text-slate-600 font-semibold">{contextMetadata?.topic}</p>
                            </div>
                        </div>
                        <button onClick={clearContext} className="p-2 text-slate-300 hover:text-red-500 transition-colors"><Trash2 className="w-5 h-5" /></button>
                    </div>
                </div>
            )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-4">
            {activeTab === 'roadmap' ? (
                <RoadmapForm onSubmit={handleRoadmapGenerate} status={status} />
            ) : activeTab === 'learning' ? (
                <LearningForm onSubmit={handleLearningGenerate} status={status} />
            ) : activeTab === 'exam' ? (
                <ExamForm 
                    onSubmit={handleExamGenerate} 
                    status={status} 
                    initialContext={learningContext || undefined}
                    contextTopic={contextMetadata?.topic}
                    contextSubject={contextMetadata?.subject}
                    contextGrade={contextMetadata?.grade}
                />
            ) : activeTab === 'tts' ? (
                <TTSForm onSubmit={handleTTSGenerate} status={status} />
            ) : (
                <SimilarExerciseForm onSubmit={handleSimilarGenerate} status={status} />
            )}
            
            {/* TIP BOX */}
            <div className="mt-8 p-6 bg-amber-50 rounded-3xl border border-amber-100 flex gap-4 shadow-sm">
                <div className="text-amber-600 shrink-0"><Info className="w-5 h-5" /></div>
                <p className="text-xs font-semibold text-amber-800 leading-relaxed">
                    <b>Bí kíp:</b> Luôn sử dụng nút <b>VÀO ĐOẠN CHAT</b> ở phía trên để dán các prompt kế tiếp nhau. AI sẽ không bao giờ ra đề trùng với bài đã giảng.
                </p>
            </div>
          </div>

          <div className="lg:col-span-8 space-y-6">
            <OutputDisplay content={promptContent} status={status} error={error} />
            
            <div className="p-8 bg-slate-900 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[80px] rounded-full -mr-20 -mt-20 group-hover:bg-indigo-500/20 transition-all"></div>
                <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                            <Zap className="w-6 h-6" />
                        </div>
                        <h3 className="text-2xl font-black tracking-tight">Chiến thuật "Sợi chỉ đỏ"</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all">
                            <h5 className="font-bold text-amber-400 mb-2">Bước 1: Link Cố định</h5>
                            <p className="text-slate-400 text-sm">Sau khi gõ Prompt đầu tiên vào Gemini, hãy copy link đoạn chat đó dán vào ô "Kênh Gemini Cố định" phía trên.</p>
                        </div>
                        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all">
                            <h5 className="font-bold text-teal-400 mb-2">Bước 2: Dán nối tiếp</h5>
                            <p className="text-slate-400 text-sm">Với các Prompt Bài học & Đề thi sau đó, chỉ cần dán nối tiếp vào cùng một chat. AI sẽ biết bạn đã dạy gì để không trùng bài.</p>
                        </div>
                    </div>

                    <div className="mt-8 flex items-center gap-3 text-[10px] font-black text-indigo-400 uppercase tracking-widest bg-indigo-500/10 w-fit px-5 py-2.5 rounded-full border border-indigo-500/20">
                        <Sparkles className="w-4 h-4" />
                        Đảm bảo hệ thống kiến thức Logic & Khoa học
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
