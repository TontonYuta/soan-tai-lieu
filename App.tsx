
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ExamForm from './components/ExamForm';
import LearningForm from './components/LearningForm';
import RoadmapForm from './components/RoadmapForm';
import WorksheetForm from './components/WorksheetForm';
import VideoForm from './components/VideoForm';
import OutputDisplay from './components/OutputDisplay';
import { generateExamPrompt, generateLearningPrompt, generateRoadmapPrompt, generateWorksheetPrompt, generateVideoManimPrompt, generateVideoScriptPrompt } from './services/gemini';
import { ExamConfig, LearningConfig, RoadmapConfig, WorksheetConfig, VideoConfig, GenerationStatus } from './types';
import { Sparkles, GraduationCap, BookOpen, Link as LinkIcon, Trash2, ArrowRight, Map, Zap, Lightbulb, ClipboardCheck, MessageSquareText, Info, ExternalLink, Save, Book, Video as VideoIcon } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'exam' | 'learning' | 'roadmap' | 'worksheet' | 'video'>('worksheet');
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

  
  const handleVideoScriptGenerate = (config: VideoConfig) => {
    setStatus(GenerationStatus.LOADING);
    setError(null);
    setTimeout(() => {
        try {
            setPromptContent(generateVideoScriptPrompt(config));
            setStatus(GenerationStatus.SUCCESS);
        } catch (err) {
            setStatus(GenerationStatus.ERROR);
            setError('Lỗi khi thiết kế kịch bản video.');
        }
    }, 400);
  };

  const handleVideoManimGenerate = (config: VideoConfig) => {
    setStatus(GenerationStatus.LOADING);
    setError(null);
    setTimeout(() => {
        try {
            setPromptContent(generateVideoManimPrompt(config));
            setStatus(GenerationStatus.SUCCESS);
        } catch (err) {
            setStatus(GenerationStatus.ERROR);
            setError('Lỗi khi biên soạn code Manim.');
        }
    }, 400);
  };

  const handleWorksheetGenerate = (config: WorksheetConfig) => {
    setStatus(GenerationStatus.LOADING);
    setError(null);
    setTimeout(() => {
        try {
            setPromptContent(generateWorksheetPrompt(config));
            setStatus(GenerationStatus.SUCCESS);
        } catch (err) {
            setStatus(GenerationStatus.ERROR);
            setError('Lỗi khi thiết kế cấu trúc phiếu bài tập.');
        }
    }, 400);
  };

  const clearContext = () => {
    setLearningContext(null);
    setContextMetadata(null);
  };

  return (
    <div className="min-h-screen flex flex-col">
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
                            className="absolute right-2 top-1.5 p-1.5 bg-[#A3E635] hover:bg-[#86EFAC] text-black border-2 border-black transition-colors shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
                        >
                            <Save className="w-4 h-4 stroke-[3]" />
                        </button>
                    )}
                </div>

                {geminiLink && !isEditingLink && (
                    <a 
                        href={geminiLink} 
                        target="_blank" 
                        rel="noreferrer"
                        className="flex items-center gap-2 px-6 py-2.5 bg-[#FFED66] text-black border-4 border-black text-xs font-black uppercase tracking-widest hover:bg-[#FFECA1] transition-all shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none shrink-0"
                    >
                        <ExternalLink className="w-4 h-4 stroke-[3]" />
                        VÀO ĐOẠN CHAT
                    </a>
                )}
            </div>
            <p className="text-[10px] text-black font-bold uppercase mt-2 px-6 flex items-center gap-2 bg-[#FF90E8] w-fit border-2 border-black py-1 px-2 shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
                <Info className="w-3 h-3 stroke-[3]" />
                Dán link này để AI ghi nhớ bài học cũ, tránh trùng lặp kiến thức.
            </p>
        </div>

        <div className="flex flex-col items-center mb-12">
            <div className="flex items-center gap-3 mb-6 bg-[#ffffff] px-4 py-2 border-4 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
                <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${activeTab === 'roadmap' ? 'text-[#FF5E5B]' : 'text-black opacity-50'}`}>
                    1. Lộ trình
                </div>
                <ArrowRight className="w-3 h-3 text-black" />
                <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${activeTab === 'learning' ? 'text-[#00CECB]' : 'text-black opacity-50'}`}>
                    2. Bài học
                </div>
                <ArrowRight className="w-3 h-3 text-black" />
                <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${activeTab === 'worksheet' ? 'text-[#A3E635]' : 'text-black opacity-50'}`}>
                    3. Bài tập
                </div>
                <ArrowRight className="w-3 h-3 text-black" />
                <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${activeTab === 'exam' ? 'text-[#FF90E8]' : 'text-black opacity-50'}`}>
                    4. Đề thi
                </div>
                <ArrowRight className="w-3 h-3 text-black" />
                <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${activeTab === 'video' ? 'text-[#9333EA]' : 'text-black opacity-50'}`}>
                    5. Video
                </div>
            </div>

            <div className="brutal-card p-2 border-4 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] flex items-center gap-2 flex-wrap justify-center bg-[#ffffff]">
                <button
                    onClick={() => setActiveTab('roadmap')}
                    className={`flex items-center gap-2 px-6 py-3 rounded-none text-sm font-black uppercase tracking-widest transition-all
                    ${activeTab === 'roadmap' ? 'bg-[#FF5E5B] text-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] border-4 border-black' : 'text-black hover:bg-[#ffffff] hover:border-4 hover:border-black'}`}
                >
                    <Map className="w-4 h-4 stroke-[3]" />
                    Lộ trình
                </button>
                <button
                    onClick={() => setActiveTab('video')}
                    className={`flex items-center gap-2 px-6 py-3 rounded-none text-sm font-black uppercase tracking-widest transition-all
                    ${activeTab === 'video' ? 'bg-[#9333EA] text-white shadow-[4px_4px_0_0_rgba(0,0,0,1)] border-4 border-black' : 'text-black hover:bg-[#ffffff] hover:border-4 hover:border-black'}`}
                >
                    <VideoIcon className="w-4 h-4 stroke-[3]" />
                    Video
                </button>
  
                <button
                    onClick={() => setActiveTab('learning')}
                    className={`flex items-center gap-2 px-6 py-3 rounded-none text-sm font-black uppercase tracking-widest transition-all
                    ${activeTab === 'learning' ? 'bg-[#00CECB] text-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] border-4 border-black' : 'text-black hover:bg-[#ffffff] hover:border-4 hover:border-black'}`}
                >
                    <BookOpen className="w-4 h-4 stroke-[3]" />
                    Bài học
                </button>
                <button
                    onClick={() => setActiveTab('worksheet')}
                    className={`flex items-center gap-2 px-6 py-3 rounded-none text-sm font-black uppercase tracking-widest transition-all
                    ${activeTab === 'worksheet' ? 'bg-[#A3E635] text-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] border-4 border-black' : 'text-black hover:bg-[#ffffff] hover:border-4 hover:border-black'}`}
                >
                    <Book className="w-4 h-4 stroke-[3]" />
                    Bài tập
                </button>
                <button
                    onClick={() => setActiveTab('exam')}
                    className={`flex items-center gap-2 px-6 py-3 rounded-none text-sm font-black uppercase tracking-widest transition-all
                    ${activeTab === 'exam' ? 'bg-[#FF90E8] text-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] border-4 border-black' : 'text-black hover:bg-[#ffffff] hover:border-4 hover:border-black'}`}
                >
                    <GraduationCap className="w-4 h-4 stroke-[3]" />
                    Đề thi
                </button>
            </div>

            {learningContext && (
                <div className="mt-8 w-full max-w-2xl">
                    <div className="bg-[#ffffff] border-4 border-black px-6 py-4 flex items-center justify-between shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 border-2 border-black bg-[#A3E635] flex items-center justify-center text-black shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
                                <LinkIcon className="w-5 h-5 stroke-[3]" />
                            </div>
                            <div>
                                <h4 className="text-[10px] font-black text-black uppercase tracking-widest border-b-2 border-black inline-block mb-1">Đang giữ ngữ cảnh đồng bộ</h4>
                                <p className="text-sm text-black font-bold uppercase">{contextMetadata?.topic}</p>
                            </div>
                        </div>
                        <button onClick={clearContext} className="p-2 text-black hover:text-[#FF5E5B] transition-colors"><Trash2 className="w-5 h-5 stroke-[3]" /></button>
                    </div>
                </div>
            )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-4">
            {activeTab === 'worksheet' ? (
                <WorksheetForm onSubmit={handleWorksheetGenerate} status={status} />
            ) : activeTab === 'video' ? (
                <VideoForm onGenerateScript={handleVideoScriptGenerate} onGenerateManim={handleVideoManimGenerate} status={status} />
            ) : activeTab === 'roadmap' ? (
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
            
            {/* TIP BOX */}
            <div className="mt-8 p-6 bg-amber-50 rounded-3xl border border-amber-100 flex gap-4 shadow-sm">
                <div className="text-amber-600 shrink-0"><Info className="w-5 h-5" /></div>
                <p className="text-xs font-semibold text-amber-800 leading-relaxed">
                    <b>Bí kíp:</b> Luôn sử dụng nút <b>VÀO ĐOẠN CHAT</b> ở phía trên để dán các prompt kế tiếp nhau. AI sẽ không bao giờ ra đề trùng với bài đã giảng.
                </p>
            </div>
          </div>

          <div className="lg:col-span-8 space-y-6">
            <OutputDisplay content={promptContent} status={status} error={error} isLatex={activeTab !== 'video'} />
            
            <div className="p-8 bg-[#ffffff] border-4 border-black text-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF90E8]/10 blur-[80px] rounded-none -mr-20 -mt-20 group-hover:bg-[#FF90E8]/20 transition-all"></div>
                <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 bg-[#ffffff] border-4 border-black flex items-center justify-center text-black">
                            <Zap className="w-6 h-6 stroke-[3]" />
                        </div>
                        <h3 className="text-2xl font-black tracking-widest uppercase">Chiến thuật "Sợi chỉ đỏ"</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="p-6 bg-[#A3E635] text-black border-4 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_rgba(0,0,0,1)] transition-all">
                            <h5 className="font-black text-black uppercase mb-2">Bước 1: Link Cố định</h5>
                            <p className="text-black text-sm font-bold">Sau khi gõ Prompt đầu tiên vào Gemini, hãy copy link đoạn chat đó dán vào ô "Kênh Gemini Cố định" phía trên.</p>
                        </div>
                        <div className="p-6 bg-[#00CECB] text-black border-4 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_rgba(0,0,0,1)] transition-all">
                            <h5 className="font-black text-black uppercase mb-2">Bước 2: Dán nối tiếp</h5>
                            <p className="text-black text-sm font-bold">Với các Prompt Bài học & Đề thi sau đó, chỉ cần dán nối tiếp vào cùng một chat. AI sẽ biết bạn đã dạy gì để không trùng bài.</p>
                        </div>
                    </div>

                    <div className="mt-8 flex items-center gap-3 text-xs font-black text-black uppercase tracking-widest bg-[#FFED66] border-4 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] w-fit px-5 py-2.5">
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
