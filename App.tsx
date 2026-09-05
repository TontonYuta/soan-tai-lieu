import React, { useState } from 'react';
import Header from './components/Header';
import ExamForm from './components/ExamForm';
import LearningForm from './components/LearningForm';
import RoadmapForm from './components/RoadmapForm';
import WorksheetForm from './components/WorksheetForm';
import SimilarExerciseForm from './components/SimilarExerciseForm';
import VideoForm from './components/VideoForm';
import BatForm from './components/BatForm';
import OutputDisplay from './components/OutputDisplay';
import ReadmeModal from './components/ReadmeModal';
import AutomationModal from './components/AutomationModal';
import { 
  generateExamPrompt, 
  generateLearningPrompt, 
  generateRoadmapPrompt, 
  generateWorksheetPrompt, 
  generateSimilarPrompt,
  generateManimStoryboardPrompt,
  generateManimCodePrompt,
  generateVideoManimPrompt, 
  generateVideoScriptPrompt, 
  generateBatPrompt 
} from './services/gemini';
import { 
  ExamConfig, 
  LearningConfig, 
  RoadmapConfig, 
  WorksheetConfig, 
  SimilarExerciseConfig,
  VideoConfig, 
  BatConfig, 
  GenerationStatus 
} from './types';
import { 
  Sparkles, 
  GraduationCap, 
  BookOpen, 
  Trash2, 
  ArrowRight, 
  Map, 
  Save, 
  Book, 
  Video as VideoIcon, 
  Terminal, 
  Info, 
  ExternalLink,
  MessageSquareText,
  Zap
} from 'lucide-react';


const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'roadmap' | 'learning' | 'worksheet' | 'similar' | 'exam' | 'video' | 'bat'>('worksheet');
  const [status, setStatus] = useState<GenerationStatus>(GenerationStatus.IDLE);
  const [promptContent, setPromptContent] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isReadmeOpen, setIsReadmeOpen] = useState(false);
  const [isAutomationOpen, setIsAutomationOpen] = useState(false);
  const [headless, setHeadless] = useState<boolean>(
    localStorage.getItem('yuta_headless') === 'true'
  );
  const [activeAttachedPdf, setActiveAttachedPdf] = useState<{ path?: string; name?: string } | null>(null);
  const [videoExtraConfig, setVideoExtraConfig] = useState<{
    isSeries?: boolean;
    seriesCount?: number;
    seriesOutline?: string;
    enableVoice?: boolean;
    voiceName?: string;
    voiceSpeed?: string;
  }>({});
  const [currentVideoConfig, setCurrentVideoConfig] = useState<VideoConfig | null>(null);

  const handleHeadlessToggle = (val: boolean) => {
    setHeadless(val);
    localStorage.setItem('yuta_headless', String(val));
  };
  
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
    if (config.attachedPdf) {
      setActiveAttachedPdf({ path: config.attachedPdf.tempPath, name: config.attachedPdf.fileName });
    } else {
      setActiveAttachedPdf(null);
    }
    setTimeout(() => {
        try {
            setPromptContent(generateExamPrompt(config));
            setContextMetadata({ topic: config.topic, subject: config.subject, grade: config.grade });
            setLearningContext(`Đề thi: ${config.topic}`);
            setStatus(GenerationStatus.SUCCESS);
            setIsAutomationOpen(true);
        } catch (err) {
            setStatus(GenerationStatus.ERROR);
            setError('Lỗi khi thiết kế cấu trúc Prompt Đề thi.');
        }
    }, 300);
  };

  const handleLearningGenerate = (config: LearningConfig) => {
    setStatus(GenerationStatus.LOADING);
    setError(null);
    if (config.attachedPdf) {
      setActiveAttachedPdf({ path: config.attachedPdf.tempPath, name: config.attachedPdf.fileName });
    } else {
      setActiveAttachedPdf(null);
    }
    setTimeout(() => {
        try {
            setPromptContent(generateLearningPrompt(config));
            setContextMetadata({ topic: config.topic, subject: config.subject, grade: config.grade });
            setLearningContext(`Bài học: ${config.topic}`);
            setStatus(GenerationStatus.SUCCESS);
            setIsAutomationOpen(true);
        } catch (err) {
            setStatus(GenerationStatus.ERROR);
            setError('Lỗi khi khởi tạo Prompt Bài học.');
        }
    }, 300);
  };

  const handleRoadmapGenerate = (config: RoadmapConfig) => {
    setStatus(GenerationStatus.LOADING);
    setError(null);
    if (config.attachedPdf) {
      setActiveAttachedPdf({ path: config.attachedPdf.tempPath, name: config.attachedPdf.fileName });
    } else {
      setActiveAttachedPdf(null);
    }
    setTimeout(() => {
        try {
            setPromptContent(generateRoadmapPrompt(config));
            setContextMetadata({ topic: config.topic, subject: config.subject, grade: 'Hệ thống' });
            setLearningContext(`Lộ trình: ${config.topic}`);
            setStatus(GenerationStatus.SUCCESS);
            setIsAutomationOpen(true);
        } catch (err) {
            setStatus(GenerationStatus.ERROR);
            setError('Lỗi khi thiết kế Lộ trình học.');
        }
    }, 300);
  };

  const handleWorksheetGenerate = (config: WorksheetConfig) => {
    setStatus(GenerationStatus.LOADING);
    setError(null);
    if (config.attachedPdf) {
      setActiveAttachedPdf({ path: config.attachedPdf.tempPath, name: config.attachedPdf.fileName });
    } else {
      setActiveAttachedPdf(null);
    }
    setTimeout(() => {
        try {
            setPromptContent(generateWorksheetPrompt(config));
            setContextMetadata({ topic: config.topic, subject: config.subject, grade: config.grade });
            setLearningContext(`Bài tập: ${config.topic}`);
            setStatus(GenerationStatus.SUCCESS);
            setIsAutomationOpen(true);
        } catch (err) {
            setStatus(GenerationStatus.ERROR);
            setError('Lỗi khi thiết kế cấu trúc phiếu bài tập.');
        }
    }, 300);
  };

  const handleSimilarGenerate = (config: SimilarExerciseConfig) => {
    setStatus(GenerationStatus.LOADING);
    setError(null);
    if (config.attachedPdf) {
      setActiveAttachedPdf({ path: config.attachedPdf.tempPath, name: config.attachedPdf.fileName });
    } else {
      setActiveAttachedPdf(null);
    }
    setTimeout(() => {
        try {
            setPromptContent(generateSimilarPrompt(config));
            setContextMetadata({ topic: config.topic, subject: config.subject, grade: config.grade || '12' });
            setLearningContext(`Bài tập tương tự: ${config.topic}`);
            setStatus(GenerationStatus.SUCCESS);
            setIsAutomationOpen(true);
        } catch (err) {
            setStatus(GenerationStatus.ERROR);
            setError('Lỗi khi thiết kế prompt bài tập tương tự.');
        }
    }, 300);
  };



  const handleDirectAutomate = (
    prompt: string,
    metadata: { topic: string; subject: string; grade?: string },
    label: string
  ) => {
    setPromptContent(prompt);
    setContextMetadata({ topic: metadata.topic, subject: metadata.subject, grade: metadata.grade || '12' });
    setLearningContext(`${label}: ${metadata.topic}`);
    setStatus(GenerationStatus.SUCCESS);
    setIsAutomationOpen(true);
  };

  const handleVideoScriptGenerate = (config: VideoConfig) => {
    if (config.attachedPdf) {
      setActiveAttachedPdf({ path: config.attachedPdf.tempPath, name: config.attachedPdf.fileName });
    } else {
      setActiveAttachedPdf(null);
    }
    setStatus(GenerationStatus.LOADING);
    setError(null);
    setTimeout(() => {
        try {
            setPromptContent(generateVideoScriptPrompt(config));
            setContextMetadata({ topic: config.topic, subject: config.subject, grade: config.audience });
            setLearningContext(`Video Script: ${config.topic}`);
            setStatus(GenerationStatus.SUCCESS);
        } catch (err) {
            setStatus(GenerationStatus.ERROR);
            setError('Lỗi khi thiết kế kịch bản video.');
        }
    }, 400);
  };

  const handleVideoManimGenerate = (config: VideoConfig) => {
    setCurrentVideoConfig(config);
    if (config.attachedPdf) {
      setActiveAttachedPdf({ path: config.attachedPdf.tempPath, name: config.attachedPdf.fileName });
    } else {
      setActiveAttachedPdf(null);
    }
    setVideoExtraConfig({
      isSeries: config.isSeries,
      seriesCount: config.seriesCount,
      seriesOutline: config.seriesOutline || config.details,
      enableVoice: config.enableVoice,
      voiceName: config.voiceName,
      voiceSpeed: config.voiceSpeed,
    });
    setStatus(GenerationStatus.LOADING);
    setError(null);
    setTimeout(() => {
        try {
            setPromptContent(generateManimStoryboardPrompt(config));
            setContextMetadata({ topic: config.topic, subject: config.subject, grade: config.audience });
            setLearningContext(config.isSeries ? `Chuỗi Playlist (${config.seriesCount || 3} Tập): ${config.topic}` : `Video Manim: ${config.topic}`);
            setStatus(GenerationStatus.SUCCESS);
        } catch (err) {
            setStatus(GenerationStatus.ERROR);
            setError('Lỗi khi biên soạn kịch bản Manim.');
        }
    }, 400);
  };

  const handleBatGenerate = (config: BatConfig) => {
    setStatus(GenerationStatus.LOADING);
    setError(null);
    setTimeout(() => {
        try {
            setPromptContent(generateBatPrompt(config));
            setStatus(GenerationStatus.SUCCESS);
        } catch (err) {
            setStatus(GenerationStatus.ERROR);
            setError('Lỗi khi thiết kế script .bat.');
        }
    }, 400);
  };

  const handleForwardContext = (targetTab: 'roadmap' | 'learning' | 'worksheet' | 'similar' | 'exam' | 'video' | 'bat') => {
    setActiveTab(targetTab);
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  const clearContext = () => {
    setLearningContext(null);
    setContextMetadata(null);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header onOpenReadme={() => setIsReadmeOpen(true)} />
      
      <ReadmeModal isOpen={isReadmeOpen} onClose={() => setIsReadmeOpen(false)} />
      <AutomationModal 
        isOpen={isAutomationOpen} 
        onClose={() => setIsAutomationOpen(false)} 
        promptContent={promptContent} 
        headless={headless}
        onToggleHeadless={handleHeadlessToggle}
        attachedPdfPath={activeAttachedPdf?.path}
        attachedPdfName={activeAttachedPdf?.name}
        isSeries={videoExtraConfig.isSeries}
        seriesCount={videoExtraConfig.seriesCount}
        seriesOutline={videoExtraConfig.seriesOutline}
        enableVoice={videoExtraConfig.enableVoice}
        voiceName={videoExtraConfig.voiceName}
        voiceSpeed={videoExtraConfig.voiceSpeed}
        topic={contextMetadata?.topic}
        subject={contextMetadata?.subject}
      />


      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Fixed Chat Link Manager */}
        <div className="mb-8 max-w-3xl mx-auto w-full">
            <div className="bg-indigo-900 rounded-none p-4 shadow-[8px_8px_0_0_rgba(0,0,0,1)] border-4 border-black flex flex-col md:flex-row items-center gap-4">
                <div className="flex items-center gap-3 px-4 py-2 bg-indigo-800/80 rounded-none shrink-0 border-2 border-indigo-400">
                    <MessageSquareText className="w-5 h-5 text-[#FFED66]" />
                    <span className="text-xs font-black text-white uppercase tracking-widest">Kênh Gemini Cố Định</span>
                </div>
                
                <div className="flex-1 w-full relative group">
                    <input 
                        type="text"
                        placeholder="Dán link đoạn chat Gemini của bạn tại đây..."
                        value={geminiLink}
                        onChange={(e) => setGeminiLink(e.target.value)}
                        onFocus={() => setIsEditingLink(true)}
                        className="w-full bg-white border-2 border-black px-4 py-2.5 text-sm text-black placeholder:text-gray-500 focus:outline-none transition-all font-bold"
                    />
                    {isEditingLink && (
                        <button 
                            onClick={handleSaveLink}
                            className="absolute right-2 top-1.5 p-1.5 bg-[#A3E635] hover:bg-[#86EFAC] text-black border-2 border-black transition-colors shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none cursor-pointer"
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
                        className="flex items-center gap-2 px-6 py-2.5 bg-[#FFED66] text-black border-4 border-black text-xs font-black uppercase tracking-widest hover:bg-[#FFECA1] transition-all shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none shrink-0 cursor-pointer"
                    >
                        <ExternalLink className="w-4 h-4 stroke-[3]" />
                        VÀO ĐOẠN CHAT
                    </a>
                )}
            </div>
            <p className="text-[10px] text-black font-bold uppercase mt-2 px-3 flex items-center gap-2 bg-[#FF90E8] w-fit border-2 border-black py-1 shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
                <Info className="w-3.5 h-3.5 stroke-[3]" />
                Dán link này để AI ghi nhớ bài học cũ, tránh trùng lặp kiến thức và duy trì ngữ cảnh.
            </p>
        </div>

        <div className="flex flex-col items-center mb-8">
            <div className="flex items-center gap-3 mb-6 bg-[#ffffff] px-4 py-2 border-4 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] flex-wrap justify-center">
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
                <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${activeTab === 'similar' ? 'text-[#FB7185]' : 'text-black opacity-50'}`}>
                    4. Bài tương tự
                </div>
                <ArrowRight className="w-3 h-3 text-black" />
                <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${activeTab === 'exam' ? 'text-[#FF90E8]' : 'text-black opacity-50'}`}>
                    5. Đề thi
                </div>
                <ArrowRight className="w-3 h-3 text-black" />
                <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${activeTab === 'video' ? 'text-[#9333EA]' : 'text-black opacity-50'}`}>
                    6. Video
                </div>
                <ArrowRight className="w-3 h-3 text-black" />
                <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${activeTab === 'bat' ? 'text-[#FFED66]' : 'text-black opacity-50'}`}>
                    7. Script
                </div>
            </div>

            {/* Quick Automation Mode Bar */}
            <div className="flex items-center justify-between w-full max-w-2xl mb-4 px-3 py-2 bg-white border-2 border-black shadow-[3px_3px_0_0_rgba(0,0,0,1)] flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-black stroke-[3] fill-black" />
                <span className="text-[11px] font-black uppercase tracking-wider text-black">Tự Động Hóa:</span>
              </div>
              <label className="flex items-center gap-2 text-xs font-black uppercase text-black cursor-pointer bg-[#FFED66] px-3 py-1 border-2 border-black hover:bg-[#FDE047] shadow-[2px_2px_0_0_rgba(0,0,0,1)] select-none">
                <input
                  type="checkbox"
                  checked={headless}
                  onChange={(e) => handleHeadlessToggle(e.target.checked)}
                  className="w-4 h-4 border-2 border-black rounded-none accent-black cursor-pointer"
                />
                <span>⚡ Chạy ngầm (Ẩn trình duyệt / Headless)</span>
              </label>
            </div>

            <div className="brutal-card p-2 border-4 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] flex items-center gap-2 flex-wrap justify-center bg-[#ffffff]">

                <button
                    onClick={() => setActiveTab('roadmap')}
                    className={`flex items-center gap-2 px-5 py-3 rounded-none text-xs font-black uppercase tracking-widest transition-all cursor-pointer
                    ${activeTab === 'roadmap' ? 'bg-[#FF5E5B] text-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] border-4 border-black' : 'text-black hover:bg-[#ffffff] hover:border-4 hover:border-black'}`}
                >
                    <Map className="w-4 h-4 stroke-[3]" />
                    Lộ trình
                </button>
                <button
                    onClick={() => setActiveTab('learning')}
                    className={`flex items-center gap-2 px-5 py-3 rounded-none text-xs font-black uppercase tracking-widest transition-all cursor-pointer
                    ${activeTab === 'learning' ? 'bg-[#00CECB] text-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] border-4 border-black' : 'text-black hover:bg-[#ffffff] hover:border-4 hover:border-black'}`}
                >
                    <BookOpen className="w-4 h-4 stroke-[3]" />
                    Bài học
                </button>
                <button
                    onClick={() => setActiveTab('worksheet')}
                    className={`flex items-center gap-2 px-5 py-3 rounded-none text-xs font-black uppercase tracking-widest transition-all cursor-pointer
                    ${activeTab === 'worksheet' ? 'bg-[#A3E635] text-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] border-4 border-black' : 'text-black hover:bg-[#ffffff] hover:border-4 hover:border-black'}`}
                >
                    <Book className="w-4 h-4 stroke-[3]" />
                    Bài tập
                </button>
                <button
                    onClick={() => setActiveTab('similar')}
                    className={`flex items-center gap-2 px-5 py-3 rounded-none text-xs font-black uppercase tracking-widest transition-all cursor-pointer
                    ${activeTab === 'similar' ? 'bg-[#FB7185] text-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] border-4 border-black' : 'text-black hover:bg-[#ffffff] hover:border-4 hover:border-black'}`}
                >
                    <Sparkles className="w-4 h-4 stroke-[3]" />
                    Bài tương tự
                </button>
                <button
                    onClick={() => setActiveTab('exam')}
                    className={`flex items-center gap-2 px-5 py-3 rounded-none text-xs font-black uppercase tracking-widest transition-all cursor-pointer
                    ${activeTab === 'exam' ? 'bg-[#FF90E8] text-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] border-4 border-black' : 'text-black hover:bg-[#ffffff] hover:border-4 hover:border-black'}`}
                >
                    <GraduationCap className="w-4 h-4 stroke-[3]" />
                    Đề thi
                </button>
                <button
                    onClick={() => setActiveTab('video')}
                    className={`flex items-center gap-2 px-5 py-3 rounded-none text-xs font-black uppercase tracking-widest transition-all cursor-pointer
                    ${activeTab === 'video' ? 'bg-[#9333EA] text-white shadow-[4px_4px_0_0_rgba(0,0,0,1)] border-4 border-black' : 'text-black hover:bg-[#ffffff] hover:border-4 hover:border-black'}`}
                >
                    <VideoIcon className="w-4 h-4 stroke-[3]" />
                    Video
                </button>
                <button
                    onClick={() => setActiveTab('bat')}
                    className={`flex items-center gap-2 px-5 py-3 rounded-none text-xs font-black uppercase tracking-widest transition-all cursor-pointer
                    ${activeTab === 'bat' ? 'bg-[#FFED66] text-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] border-4 border-black' : 'text-black hover:bg-[#ffffff] hover:border-4 hover:border-black'}`}
                >
                    <Terminal className="w-4 h-4 stroke-[3]" />
                    Script .BAT
                </button>
            </div>
        </div>

        {/* Global Context Notice */}
        {learningContext && (
            <div className="mb-8 p-4 bg-[#FFED66] border-4 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-none bg-[#FF5E5B] border border-black animate-pulse" />
                    <div>
                        <p className="text-xs font-black text-black uppercase">
                            Đang giữ ngữ cảnh kiến thức: <span className="underline">{learningContext}</span>
                        </p>
                        <p className="text-[10px] text-black font-bold uppercase">
                            Tự động chuyển tiếp nội dung sang các form tiếp theo
                        </p>
                    </div>
                </div>
                <button 
                    onClick={clearContext}
                    className="p-1 hover:bg-[#ffffff] text-black border-2 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all cursor-pointer"
                    title="Xóa ngữ cảnh đang lưu"
                >
                    <Trash2 className="w-4 h-4 stroke-[3]" />
                </button>
            </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Form */}
          <div className="lg:col-span-6 space-y-6">
            {activeTab === 'roadmap' && (
              <RoadmapForm 
                onSubmit={handleRoadmapGenerate} 
                onDirectAutomate={(cfg) => handleDirectAutomate(generateRoadmapPrompt(cfg), { topic: cfg.topic, subject: cfg.subject }, 'Lộ trình')}
                status={status} 
              />
            )}

            {activeTab === 'learning' && (
              <LearningForm 
                onSubmit={handleLearningGenerate} 
                onDirectAutomate={(cfg) => handleDirectAutomate(generateLearningPrompt(cfg), { topic: cfg.topic, subject: cfg.subject, grade: cfg.grade }, 'Bài học')}
                status={status} 
                initialContext={learningContext || undefined}
                contextTopic={contextMetadata?.topic}
                contextSubject={contextMetadata?.subject}
                contextGrade={contextMetadata?.grade}
              />
            )}

            {activeTab === 'worksheet' && (
              <WorksheetForm 
                onSubmit={handleWorksheetGenerate} 
                onDirectAutomate={(cfg) => handleDirectAutomate(generateWorksheetPrompt(cfg), { topic: cfg.topic, subject: cfg.subject, grade: cfg.grade }, 'Phiếu bài tập')}
                status={status} 
                contextTopic={contextMetadata?.topic}
                contextSubject={contextMetadata?.subject}
                contextGrade={contextMetadata?.grade}
              />
            )}

            {activeTab === 'similar' && (
              <SimilarExerciseForm
                onSubmit={handleSimilarGenerate}
                onDirectAutomate={(cfg) => handleDirectAutomate(generateSimilarPrompt(cfg), { topic: cfg.topic, subject: cfg.subject, grade: cfg.grade }, 'Bài tập tương tự')}
                status={status}
                contextTopic={contextMetadata?.topic}
                contextSubject={contextMetadata?.subject}
                contextGrade={contextMetadata?.grade}
              />
            )}

            {activeTab === 'exam' && (
              <ExamForm 
                onSubmit={handleExamGenerate} 
                onDirectAutomate={(cfg) => handleDirectAutomate(generateExamPrompt(cfg), { topic: cfg.topic, subject: cfg.subject, grade: cfg.grade }, 'Đề thi')}
                status={status} 
                initialContext={learningContext || undefined}
                contextTopic={contextMetadata?.topic}
                contextSubject={contextMetadata?.subject}
                contextGrade={contextMetadata?.grade}
              />
            )}


            {activeTab === 'video' && (
              <VideoForm 
                onSubmitManim={handleVideoManimGenerate}
                onDirectAutomateManim={(cfg) => {
                  setCurrentVideoConfig(cfg);
                  setActiveAttachedPdf(null);
                  setVideoExtraConfig({
                    isSeries: cfg.isSeries,
                    seriesCount: cfg.seriesCount,
                    seriesOutline: cfg.seriesOutline || cfg.details,
                    enableVoice: cfg.enableVoice,
                    voiceName: cfg.voiceName,
                    voiceSpeed: cfg.voiceSpeed,
                  });
                  handleDirectAutomate(
                    generateManimStoryboardPrompt(cfg), 
                    { topic: cfg.topic, subject: cfg.subject, grade: cfg.audience }, 
                    cfg.isSeries ? `Chuỗi Playlist (${cfg.seriesCount || 3} Tập)` : 'Video Manim'
                  );
                }}
                status={status} 
                contextTopic={contextMetadata?.topic}
                contextSubject={contextMetadata?.subject}
              />
            )}

            {activeTab === 'bat' && (
              <BatForm 
                onSubmit={handleBatGenerate} 
                status={status} 
                contextTopic={contextMetadata?.topic}
                contextSubject={contextMetadata?.subject}
              />
            )}
          </div>

          {/* Right Column: Output */}
          <div className="lg:col-span-6 sticky top-28">
            <OutputDisplay 
              content={promptContent} 
              status={status} 
              error={error} 
              videoConfig={activeTab === 'video' ? currentVideoConfig : null}
              onSelectPrompt={(p) => setPromptContent(p)}
              onForwardContext={handleForwardContext}
              onOpenAutomation={() => setIsAutomationOpen(true)}
            />
          </div>


        </div>
      </main>
    </div>
  );
};

export default App;