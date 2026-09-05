import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Play, Square, CheckCircle2, AlertTriangle, Loader2, 
  FileText, ExternalLink, Download, Settings, Copy, Check, Eye,
  FolderOpen, Monitor, Sparkles, Code, Subtitles, Film, ListVideo,
  Clock, Cpu, Volume2, Mic
} from 'lucide-react';
import { AutomationClient, AutomationProgress } from '../services/automationClient';

interface AutomationModalProps {
  isOpen: boolean;
  onClose: () => void;
  promptContent: string;
  headless?: boolean;
  onToggleHeadless?: (val: boolean) => void;
  attachedPdfPath?: string;
  attachedPdfName?: string;
  isSeries?: boolean;
  seriesCount?: number;
  seriesOutline?: string;
  enableVoice?: boolean;
  voiceName?: string;
  voiceSpeed?: string;
  topic?: string;
  subject?: string;
}

export interface AiModelConfig {
  id: string;
  name: string;
  badge?: string;
  desc: string;
  urlModifier?: string;
}

export interface AiProviderConfig {
  id: string;
  name: string;
  fullName: string;
  url: string;
  icon: string;
  bg: string;
  models: AiModelConfig[];
}

export const AI_PROVIDERS: AiProviderConfig[] = [
  {
    id: 'gemini',
    name: 'Gemini',
    fullName: 'Google Gemini',
    url: 'https://gemini.google.com/app',
    icon: '✨',
    bg: 'bg-[#00CECB]',
    models: [
      { id: 'gemini-3.1-pro', name: 'Gemini 3.1 Pro', badge: 'Khuyên Dùng', desc: 'Mạnh nhất về logic, suy luận sâu & code Manim hoàn hảo' },
      { id: 'gemini-3.8-flash', name: 'Gemini 3.8 Flash', badge: 'Mới & Nhanh', desc: 'Thế hệ Flash mới nhất, tốc độ phản hồi cực nhanh, chính xác cao' },
      { id: 'gemini-3.5-flash-lite', name: 'Gemini 3.5 Flash Lite', badge: 'Siêu Nhẹ', desc: 'Mô hình gọn nhẹ, tối ưu hóa tốc độ phản hồi tức thì' },
    ]
  },
  {
    id: 'chatgpt',
    name: 'ChatGPT',
    fullName: 'ChatGPT (OpenAI)',
    url: 'https://chatgpt.com',
    icon: '🟢',
    bg: 'bg-[#A3E635]',
    models: [
      { id: 'chatgpt-think', name: 'Bật Think (Suy nghĩ sâu)', badge: 'Khuyên Dùng', desc: 'Bật chế độ Reason/Think trên ChatGPT để giải toán STEM & lập trình Manim chuẩn xác', urlModifier: 'https://chatgpt.com' },
      { id: 'chatgpt-no-think', name: 'Tắt Think (Tiêu chuẩn)', badge: 'Nhanh', desc: 'Tắt chế độ Think, phản hồi trực tiếp với tốc độ nhanh nhất', urlModifier: 'https://chatgpt.com' },
    ]
  },
  {
    id: 'claude',
    name: 'Claude',
    fullName: 'Claude (Anthropic)',
    url: 'https://claude.ai/new',
    icon: '🟣',
    bg: 'bg-[#FF90E8]',
    models: [
      { id: 'claude-3-7-sonnet', name: 'Claude 3.7 Sonnet', badge: 'Vô Địch Code', desc: 'Hybrid reasoning lập trình số 1 hiện nay', urlModifier: 'https://claude.ai/new?model=claude-3-7-sonnet' },
      { id: 'claude-3-5-sonnet', name: 'Claude 3.5 Sonnet', badge: 'Chuẩn Mực', desc: 'Code Manim cực kỳ sạch, sư phạm và chặt chẽ', urlModifier: 'https://claude.ai/new' },
      { id: 'claude-3-5-haiku', name: 'Claude 3.5 Haiku', badge: 'Nhanh Nhẹ', desc: 'Tốc độ phản hồi tức thì cho phân cảnh ngắn', urlModifier: 'https://claude.ai/new' },
    ]
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    fullName: 'DeepSeek AI',
    url: 'https://chat.deepseek.com',
    icon: '🔵',
    bg: 'bg-[#60A5FA]',
    models: [
      { id: 'deepseek-r1', name: 'DeepSeek-R1 (DeepThink)', badge: 'DeepThink R1', desc: 'Tư duy reasoning toán học mã nguồn mở số 1 thế giới', urlModifier: 'https://chat.deepseek.com' },
      { id: 'deepseek-v3', name: 'DeepSeek-V3', badge: 'Siêu Tốc', desc: 'Tổng quát siêu tốc, bóc tách code mượt mà', urlModifier: 'https://chat.deepseek.com' },
    ]
  },
  {
    id: 'grok',
    name: 'Grok',
    fullName: 'xAI Grok',
    url: 'https://grok.com',
    icon: '⚡',
    bg: 'bg-[#FFED66]',
    models: [
      { id: 'grok-3', name: 'Grok 3 (Think Mode)', badge: 'Mới Nhất', desc: 'Siêu mô hình thế hệ mới của xAI với khả năng suy luận mở rộng', urlModifier: 'https://grok.com' },
      { id: 'grok-2', name: 'Grok 2', desc: 'Mô hình thế hệ 2 của xAI', urlModifier: 'https://grok.com' },
    ]
  }
];

export const isUrlBelongsToProvider = (url: string, providerId: string): boolean => {
  if (!url) return false;
  const lower = url.toLowerCase();
  switch (providerId) {
    case 'chatgpt':
      return lower.includes('chatgpt.com') || lower.includes('openai.com');
    case 'gemini':
      return lower.includes('gemini.google.com');
    case 'claude':
      return lower.includes('claude.ai');
    case 'deepseek':
      return lower.includes('deepseek.com');
    case 'grok':
      return lower.includes('grok.com') || lower.includes('x.com');
    default:
      return true;
  }
};

export const getProviderUrl = (providerId: string, modelId?: string): string => {
  const provider = AI_PROVIDERS.find(p => p.id === providerId) || AI_PROVIDERS[0];
  if (modelId) {
    const m = provider.models.find(x => x.id === modelId);
    if (m?.urlModifier) return m.urlModifier;
  }
  const customSaved = localStorage.getItem(`yuta_ai_url_${providerId}`);
  if (customSaved && isUrlBelongsToProvider(customSaved, providerId)) {
    return customSaved;
  }
  return provider.url;
};

export const AutomationModal: React.FC<AutomationModalProps> = ({
  isOpen,
  onClose,
  promptContent,
  headless: externalHeadless,
  onToggleHeadless,
  attachedPdfPath,
  attachedPdfName,
  isSeries,
  seriesCount,
  seriesOutline,
  enableVoice,
  voiceName,
  voiceSpeed,
  topic,
  subject,
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState<AutomationProgress>({
    step: 'INIT',
    progress: 0,
    message: 'Sẵn sàng kích hoạt luồng tự động hóa 1-Click.',
  });
  const [logs, setLogs] = useState<string[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showCodePreview, setShowCodePreview] = useState(false);
  const [selectedPlaylistIndex, setSelectedPlaylistIndex] = useState<number>(0);

  // Bấm giờ thời gian làm task (Task Stopwatch Timer)
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  const formatDuration = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const startTimer = () => {
    setElapsedSeconds(0);
    startTimeRef.current = Date.now();
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = window.setInterval(() => {
      if (startTimeRef.current) {
        setElapsedSeconds(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      stopTimer();
    };
  }, []);

  // Settings
  const [browserType, setBrowserType] = useState<'chrome' | 'firefox' | 'edge'>(
    (localStorage.getItem('yuta_browser_type') as any) || 'chrome'
  );
  const [overleafUrl, setOverleafUrl] = useState<string>(
    localStorage.getItem('yuta_overleaf_url') || 'https://www.overleaf.com/project/695bb729a951d226e9078147'
  );
  const [headless, setHeadlessState] = useState<boolean>(() => {
    if (externalHeadless !== undefined) return externalHeadless;
    return localStorage.getItem('yuta_headless') === 'true';
  });

  useEffect(() => {
    if (externalHeadless !== undefined) {
      setHeadlessState(externalHeadless);
    }
  }, [externalHeadless]);

  const setHeadless = (val: boolean) => {
    setHeadlessState(val);
    localStorage.setItem('yuta_headless', String(val));
    if (onToggleHeadless) {
      onToggleHeadless(val);
    }
  };

  const [selectedAi, setSelectedAi] = useState<string>(
    localStorage.getItem('yuta_ai_provider') || 'gemini'
  );

  const currentAi = AI_PROVIDERS.find((p) => p.id === selectedAi) || AI_PROVIDERS[0];

  const [selectedModel, setSelectedModel] = useState<string>(() => {
    const saved = localStorage.getItem(`yuta_ai_model_${selectedAi}`);
    if (saved && currentAi.models.some(m => m.id === saved)) return saved;
    return currentAi.models[0]?.id || '';
  });

  const currentModel = currentAi.models.find((m) => m.id === selectedModel) || currentAi.models[0];

  const [aiUrl, setAiUrl] = useState<string>(() => {
    return getProviderUrl(selectedAi, selectedModel);
  });

  // Đồng bộ nhà cung cấp AI và Model từ localStorage mỗi khi mở Modal
  useEffect(() => {
    if (isOpen) {
      const savedAi = localStorage.getItem('yuta_ai_provider') || 'gemini';
      setSelectedAi(savedAi);
      const prov = AI_PROVIDERS.find((p) => p.id === savedAi) || AI_PROVIDERS[0];
      const savedModel = localStorage.getItem(`yuta_ai_model_${savedAi}`) || prov.models[0]?.id || '';
      setSelectedModel(savedModel);
      const targetUrl = getProviderUrl(savedAi, savedModel);
      setAiUrl(targetUrl);
    }
  }, [isOpen]);

  const handleSelectAi = (providerId: string) => {
    setSelectedAi(providerId);
    localStorage.setItem('yuta_ai_provider', providerId);
    const provider = AI_PROVIDERS.find(p => p.id === providerId) || AI_PROVIDERS[0];
    const savedModel = localStorage.getItem(`yuta_ai_model_${providerId}`) || provider.models[0]?.id || '';
    setSelectedModel(savedModel);
    const targetUrl = getProviderUrl(providerId, savedModel);
    setAiUrl(targetUrl);
    localStorage.setItem('yuta_ai_url', targetUrl);
    localStorage.setItem(`yuta_ai_url_${providerId}`, targetUrl);
  };

  const handleSelectModel = (modelId: string) => {
    setSelectedModel(modelId);
    localStorage.setItem(`yuta_ai_model_${selectedAi}`, modelId);
    const targetUrl = getProviderUrl(selectedAi, modelId);
    setAiUrl(targetUrl);
    localStorage.setItem('yuta_ai_url', targetUrl);
    localStorage.setItem(`yuta_ai_url_${selectedAi}`, targetUrl);
  };

  useEffect(() => {
    localStorage.setItem('yuta_browser_type', browserType);
  }, [browserType]);

  useEffect(() => {
    if (overleafUrl) {
      localStorage.setItem('yuta_overleaf_url', overleafUrl);
    }
  }, [overleafUrl]);

  useEffect(() => {
    localStorage.setItem('yuta_ai_provider', selectedAi);
  }, [selectedAi]);

  const currentProvider = AI_PROVIDERS.find(p => p.id === selectedAi) || AI_PROVIDERS[0];

  if (!isOpen) return null;

  const isManimTask = promptContent.includes('Manim') || 
                      promptContent.includes('Scene') || 
                      promptContent.includes('scene.py') ||
                      promptContent.includes('VOICEOVER_SCRIPT') ||
                      promptContent.includes('KỊCH BẢN SƯ PHẠM');
  const isPlaylistTask = isManimTask && (
    Boolean(isSeries) ||
    promptContent.includes('PLAYLIST') || 
    promptContent.includes('CHUỖI') || 
    promptContent.includes('TẬP TRONG CHUỖI PLAYLIST') ||
    Boolean(progress.isSeries) ||
    Boolean(progress.playlistVideos && progress.playlistVideos.length > 0)
  );
  const isScriptTask = !isManimTask && (promptContent.includes('KỊCH BẢN') || promptContent.includes('PHÂN CẢNH') || promptContent.includes('SRT'));

  const STEPS = isManimTask ? [
    { id: 'CONNECTING_CHROME', label: '1. Kết nối Browser' },
    { id: 'OPENING_GEMINI', label: `2. Mở ${currentAi.name}` },
    { id: 'SENDING_PROMPT', label: '3. [Lượt 1] Kịch Bản & Thoại' },
    { id: 'WAITING_GEMINI', label: '4. [Lượt 2] Sinh Code Manim' },
    { id: 'RENDERING_VIDEO', label: isPlaylistTask ? '5. Render & Sửa Lỗi' : '5. Render Manim CE' },
    { id: 'COMPLETED', label: isPlaylistTask ? '6. Xuất Trọn Bộ Playlist' : '6. Xuất Video MP4' },
  ] : isScriptTask ? [
    { id: 'CONNECTING_CHROME', label: '1. Kết nối Browser' },
    { id: 'OPENING_GEMINI', label: `2. Mở ${currentAi.name}` },
    { id: 'SENDING_PROMPT', label: '3. Gửi Prompt AI' },
    { id: 'EXTRACTING_LATEX', label: '4. Bóc tách Kịch Bản' },
    { id: 'COMPLETED', label: '5. Xuất SRT & MD' },
  ] : [
    { id: 'CONNECTING_CHROME', label: '1. Kết nối Browser' },
    { id: 'OPENING_GEMINI', label: `2. Mở ${currentAi.name}` },
    { id: 'SENDING_PROMPT', label: '3. Gửi Prompt & Giải' },
    { id: 'EXTRACTING_LATEX', label: '4. Bóc tách LaTeX' },
    { id: 'OPENING_OVERLEAF', label: '5. Mở Overleaf & Dán' },
    { id: 'RECOMPILING', label: '6. Recompile & PDF' },
    { id: 'DOWNLOADING_PDF', label: '7. Tải PDF về máy' },
  ];

  const hasPlaylist = Boolean(progress.playlistVideos && progress.playlistVideos.length > 0);
  const currentVideoItem = (hasPlaylist && progress.playlistVideos) 
    ? progress.playlistVideos[Math.min(selectedPlaylistIndex, progress.playlistVideos.length - 1)] 
    : null;
  const currentVideoUrl = currentVideoItem?.videoUrl || progress.videoUrl;
  const currentVideoPath = currentVideoItem?.videoPath || progress.videoPath;
  const currentAudioUrl = currentVideoItem?.audioUrl || progress.audioUrl;
  const currentAudioPath = currentVideoItem?.audioPath || progress.audioPath;

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString();
    const curSec = startTimeRef.current ? Math.floor((Date.now() - startTimeRef.current) / 1000) : 0;
    setLogs((prev) => [...prev, `[${formatDuration(curSec)}] [${time}] ${msg}`]);
  };

  const handleStart = async () => {
    if (!promptContent) {
      alert('Chưa có nội dung Prompt! Vui lòng chọn cấu hình đề và tạo prompt trước.');
      return;
    }

    const countMatch = promptContent.match(/GỒM ĐÚNG\s*(\d+)\s*TẬP/i) || promptContent.match(/(\d+)\s*tập/i);
    const detectedSeriesCount = countMatch ? parseInt(countMatch[1], 10) : undefined;

    const effectiveAi = selectedAi || 'gemini';
    const effectiveModel = selectedModel || currentModel?.id || currentAi.models[0]?.id || 'gemini-3.1-pro';
    const effectiveModelName = currentAi.models.find(m => m.id === effectiveModel)?.name || currentModel?.name || 'Gemini 3.1 Pro';

    let effectiveAiUrl = aiUrl;
    if (!effectiveAiUrl || !isUrlBelongsToProvider(effectiveAiUrl, effectiveAi)) {
      effectiveAiUrl = getProviderUrl(effectiveAi, effectiveModel);
    }

    startTimer();
    setSelectedPlaylistIndex(0);
    setIsRunning(true);
    setLogs([]);
    addLog(`Bắt đầu quy trình tự động hóa 1-Click với ${currentAi.fullName} [Model: ${effectiveModelName}]...`);
    if (isPlaylistTask) {
      addLog(`Chế độ Chuỗi Playlist: Sản xuất tự động ${seriesCount || detectedSeriesCount || 3} tập video MP4 liên hoàn.`);
    }
    if (attachedPdfPath) {
      addLog(`Tài liệu RAG đính kèm: ${attachedPdfName || 'document.pdf'}`);
    }
    if (enableVoice !== false) {
      const voiceLabel = (voiceName && voiceName.includes('NamMinh')) ? 'Nam Minh (Nam)' : 'Hoài My (Nữ)';
      addLog(`🎙️ Lồng tiếng AI: Đã kích hoạt thuyết minh giọng đọc [${voiceLabel}].`);
    }

    await AutomationClient.startPipeline(
      {
        prompt: promptContent,
        browserType: browserType,
        aiProvider: effectiveAi,
        provider: effectiveAi,
        aiUrl: effectiveAiUrl,
        geminiUrl: effectiveAi === 'gemini' ? effectiveAiUrl : undefined,
        overleafUrl: overleafUrl || undefined,
        headless: headless,
        attachedPdfPath: attachedPdfPath,
        isSeries: isPlaylistTask,
        seriesCount: seriesCount || detectedSeriesCount,
        seriesOutline: seriesOutline,
        topic: topic,
        subject: subject,
        model: effectiveModel,
        modelName: effectiveModelName,
        enableVoice: enableVoice !== undefined ? enableVoice : true,
        voiceName: voiceName || 'vi-VN-HoaiMyNeural',
        voiceSpeed: voiceSpeed || '+0%',
      },
      (update) => {
        setProgress(update);
        addLog(update.message);

        if (update.step === 'COMPLETED' || update.step === 'ERROR') {
          setIsRunning(false);
          stopTimer();
        }
      }
    );
  };



  const handleStop = async () => {
    addLog('Đang gửi lệnh dừng quy trình...');
    await AutomationClient.stop();
    setIsRunning(false);
    stopTimer();
  };

  const handleCopyLatex = () => {
    const textToCopy = progress.manimCode || progress.scriptContent || progress.latexCode;
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadTextFile = (filename: string, text: string) => {
    const element = document.createElement('a');
    const file = new Blob([text], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleOpenPdfFile = async () => {
    if (progress.pdfPath) {
      try {
        await fetch('/api/open-file', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filePath: progress.pdfPath }),
        });
      } catch {}
    }
  };

  const handleOpenVideoFile = async (customPath?: string) => {
    const targetPath = customPath || currentVideoPath || progress.videoPath;
    if (targetPath) {
      try {
        await fetch('/api/open-file', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filePath: targetPath }),
        });
      } catch {}
    }
  };

  const handleOpenDownloadsFolder = async () => {
    try {
      await fetch('/api/open-folder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folderPath: progress.pdfPath ? undefined : undefined }),
      });
    } catch {}
  };


  // Tính trạng thái của từng Step
  const getStepStatus = (stepId: string) => {
    const stepOrder = STEPS.map((s) => s.id);
    const currentIndex = stepOrder.indexOf(progress.step);
    const stepIndex = stepOrder.indexOf(stepId);

    if (progress.step === 'COMPLETED') return 'completed';
    if (progress.step === 'ERROR' && stepIndex === currentIndex) return 'error';
    if (currentIndex !== -1 && stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'pending';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#ffffff] border-4 border-black shadow-[12px_12px_0_0_rgba(0,0,0,1)] w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Header Modal */}
        <div className="bg-[#FFED66] border-b-4 border-black p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#FF5E5B] border-2 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
              <Play className="w-5 h-5 text-black stroke-[3]" />
            </div>
            <div>
              <h2 className="text-lg font-black text-black uppercase tracking-wider">
                {isPlaylistTask
                  ? `⚡ 1-Click Playlist Manim: ${currentAi.name} [${currentModel?.name || ''}] ➔ Chuỗi Video MP4`
                  : isManimTask
                  ? `⚡ 1-Click Manim: ${currentAi.name} [${currentModel?.name || ''}] ➔ Xuất Video MP4`
                  : isScriptTask
                  ? `⚡ 1-Click Video: ${currentAi.name} [${currentModel?.name || ''}] ➔ Kịch Bản & Phụ Đề SRT`
                  : `⚡ Tự Động Hóa 1-Click: ${currentAi.name} [${currentModel?.name || ''}] ➔ Xuất PDF`}
              </h2>
              <p className="text-[11px] font-bold text-black uppercase">
                {isPlaylistTask
                  ? 'Tự động tạo mã Python từng tập • Tự sửa lỗi (Self-Healing) • Xuất trọn bộ Playlist MP4'
                  : isManimTask
                  ? 'Quy trình 2 lượt (Kịch bản ➔ Code Manim) • Render Manim CE ra video MP4 • Tự sửa lỗi'
                  : isScriptTask
                  ? 'Tự động tạo bảng phân cảnh • Xuất phụ đề .SRT và tài liệu .MD'
                  : 'Tự động kết nối Chrome • Không cần API key • Trích xuất và xuất bản tự động'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Live Stopwatch Timer Badge */}
            <div 
              className={`flex items-center gap-1.5 px-3 py-1.5 border-2 border-black font-mono font-black text-xs transition-all ${
                isRunning ? 'bg-[#FF5E5B] text-white shadow-[2px_2px_0_0_rgba(0,0,0,1)] animate-pulse' : 'bg-white text-black shadow-[2px_2px_0_0_rgba(0,0,0,1)]'
              }`}
              title="Đồng hồ bấm giờ thời gian thực thi task"
            >
              <Clock className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
              <span>{formatDuration(elapsedSeconds)}</span>
            </div>

            <button 
              onClick={onClose}
              disabled={isRunning}
              className="p-1.5 bg-[#ffffff] hover:bg-[#FF5E5B] border-2 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all cursor-pointer disabled:opacity-50"
            >
              <X className="w-5 h-5 text-black stroke-[3]" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* Progress Bar & Status Text */}
          <div className="bg-[#f4f4f5] border-4 border-black p-4 shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-black uppercase text-black flex items-center gap-2">
                {isRunning ? <Loader2 className="w-4 h-4 animate-spin text-[#00CECB]" /> : <FileText className="w-4 h-4 text-black" />}
                {progress.message}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black font-mono text-black bg-white px-2 py-0.5 border-2 border-black flex items-center gap-1 shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
                  <Clock className="w-3.5 h-3.5 text-black" />
                  {formatDuration(elapsedSeconds)}
                </span>
                <span className="text-sm font-black text-black bg-[#FFED66] px-2 py-0.5 border-2 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
                  {progress.progress}%
                </span>
              </div>
            </div>
            
            {/* Thanh tiến trình */}
            <div className="w-full h-4 bg-white border-2 border-black overflow-hidden">
              <div 
                className={`h-full transition-all duration-300 ${progress.step === 'ERROR' ? 'bg-[#FF5E5B]' : progress.step === 'COMPLETED' ? 'bg-[#A3E635]' : 'bg-[#00CECB]'}`}
                style={{ width: `${progress.progress}%` }}
              />
            </div>

            {hasPlaylist && (
              <div className="mt-2.5 pt-2 border-t border-black/10 flex items-center justify-between text-[11px] font-bold text-gray-800">
                <span className="flex items-center gap-1.5 text-purple-700 font-black uppercase">
                  <ListVideo className="w-3.5 h-3.5 text-purple-600" />
                  Tiến độ Playlist:
                </span>
                <span className="font-mono bg-white px-2 py-0.5 border border-black">
                  Đã hoàn thành {progress.playlistVideos!.length}{progress.seriesCount ? `/${progress.seriesCount}` : ''} tập MP4
                </span>
              </div>
            )}

            {attachedPdfName && (
              <div className="mt-2.5 pt-2 border-t border-black/10 flex items-center justify-between text-[11px] font-bold text-gray-800">
                <span className="flex items-center gap-1.5 text-indigo-700 font-black uppercase">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  Tài liệu RAG đính kèm:
                </span>
                <span className="font-mono bg-white px-2 py-0.5 border border-black truncate max-w-xs sm:max-w-md">
                  {attachedPdfName}
                </span>
              </div>
            )}
          </div>

          {/* AI Platform & Model Selector Card (Trực quan & chọn nhanh) */}
          <div className="bg-white border-4 border-black p-3.5 shadow-[4px_4px_0_0_rgba(0,0,0,1)] space-y-2.5">
            {/* Row 1: AI Provider Selector */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-black stroke-[3]" />
                <span className="text-xs font-black uppercase tracking-wider text-black">
                  1. Nền tảng AI:
                </span>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {AI_PROVIDERS.map((ai) => (
                  <button
                    key={ai.id}
                    type="button"
                    disabled={isRunning}
                    onClick={() => handleSelectAi(ai.id)}
                    className={`py-1.5 px-3 border-2 border-black text-xs font-black uppercase flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 ${
                      selectedAi === ai.id
                        ? `${ai.bg} text-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] scale-[1.02]`
                        : 'bg-white text-black hover:bg-gray-100'
                    }`}
                  >
                    <span>{ai.icon}</span>
                    <span>{ai.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Row 2: AI Model Selector for current provider */}
            <div className="pt-2 border-t-2 border-black/10 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-black stroke-[2.5]" />
                <span className="text-[11px] font-black uppercase text-gray-800">
                  {currentAi.id === 'chatgpt' ? '2. Chế độ Suy nghĩ (Think Mode) ChatGPT:' : `2. Chọn Model ${currentAi.name}:`}
                </span>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {currentAi.models.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    disabled={isRunning}
                    onClick={() => handleSelectModel(m.id)}
                    title={m.desc}
                    className={`py-1 px-2.5 border-2 border-black text-xs font-black uppercase flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 ${
                      selectedModel === m.id
                        ? 'bg-black text-[#FFED66] shadow-none translate-x-[1px] translate-y-[1px]'
                        : 'bg-white text-black hover:bg-[#FFED66] shadow-[2px_2px_0_0_rgba(0,0,0,1)]'
                    }`}
                  >
                    <span>{m.name}</span>
                    {m.badge && (
                      <span className={`text-[9px] px-1 py-0.2 border ${
                        selectedModel === m.id ? 'bg-[#FFED66] text-black border-black font-black' : 'bg-gray-200 text-gray-800 border-gray-400'
                      }`}>
                        {m.badge}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Description of active model */}
            <div className="text-[10px] text-gray-600 font-bold bg-[#f4f4f5] px-2.5 py-1 border border-black/20 flex items-center justify-between flex-wrap gap-1">
              <span>💡 {currentModel?.desc || 'Mô hình lập trình AI'}</span>
              <span className="font-mono text-indigo-700">{currentAi.id === 'chatgpt' ? 'Mode: ' : 'Model: '}{currentModel?.id}</span>
            </div>
          </div>


          {/* Stepper Visualization */}
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
            {STEPS.map((s) => {
              const st = getStepStatus(s.id);
              return (
                <div 
                  key={s.id}
                  className={`p-2 border-2 border-black text-[10px] font-black uppercase text-center transition-all ${
                    st === 'completed' ? 'bg-[#A3E635] text-black' :
                    st === 'current' ? 'bg-[#FFED66] text-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] animate-pulse' :
                    st === 'error' ? 'bg-[#FF5E5B] text-black' :
                    'bg-[#f4f4f5] text-gray-400'
                  }`}
                >
                  {st === 'completed' ? '✓ ' : ''}{s.label}
                </div>
              );
            })}
          </div>

          {/* Terminal Logs & Live Output */}
          <div className="space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs font-black uppercase tracking-widest text-black flex items-center gap-2">
                📜 Nhật ký thực thi:
              </span>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1.5 text-xs font-black uppercase text-black cursor-pointer bg-[#FFED66] px-2.5 py-1 border-2 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:bg-[#FDE047] select-none">
                  <input
                    type="checkbox"
                    checked={headless}
                    onChange={(e) => setHeadless(e.target.checked)}
                    className="w-3.5 h-3.5 border-2 border-black rounded-none accent-black cursor-pointer"
                  />
                  <span>⚡ Chạy ngầm (Headless)</span>
                </label>
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="text-[11px] font-black uppercase flex items-center gap-1 bg-[#ffffff] border-2 border-black px-2 py-1 shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:bg-[#FFED66] cursor-pointer"
                >
                  <Settings className="w-3.5 h-3.5" />
                  {showSettings ? 'Ẩn' : 'Cấu Hình Link'}
                </button>
              </div>
            </div>


            {/* Collapsible Settings */}
            {showSettings && (
              <div className="p-4 bg-[#FFED66]/30 border-4 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] space-y-4 animate-in fade-in">
                {/* 1. Chọn Nền Tảng AI */}
                <div>
                  <label className="block text-[11px] font-black uppercase text-black mb-2">
                    🤖 Chọn Nền Tảng AI Tạo Mã (Prompt Engine):
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                    {AI_PROVIDERS.map((ai) => (
                      <button
                        key={ai.id}
                        type="button"
                        onClick={() => handleSelectAi(ai.id)}
                        className={`py-2 px-2 border-2 border-black text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          selectedAi === ai.id
                            ? `${ai.bg} text-black shadow-[3px_3px_0_0_rgba(0,0,0,1)] scale-[1.02]`
                            : 'bg-white text-black hover:bg-gray-100'
                        }`}
                      >
                        <span className="text-sm">{ai.icon}</span>
                        <span>{ai.name}</span>
                      </button>
                    ))}
                  </div>

                  <div className="mt-2.5">
                    <label className="block text-[10px] font-black uppercase text-gray-700 mb-1">
                      Link Web AI / Đoạn Chat Cố Định:
                    </label>
                    <input
                      type="text"
                      placeholder="https://chatgpt.com hoặc https://gemini.google.com/app..."
                      value={aiUrl}
                      onChange={(e) => {
                        const val = e.target.value;
                        setAiUrl(val);
                        localStorage.setItem('yuta_ai_url', val);
                        localStorage.setItem(`yuta_ai_url_${selectedAi}`, val);
                      }}
                      className="w-full bg-white border-2 border-black px-3 py-1.5 text-xs font-bold text-black focus:outline-none"
                    />
                    <span className="text-[10px] text-gray-600 font-bold block mt-1">
                      * Bạn có thể dán link 1 đoạn chat cụ thể để AI nhớ ngữ cảnh bài học trước.
                    </span>
                  </div>
                </div>

                {/* 2. Chọn Trình Duyệt */}
                <div>
                  <label className="block text-[11px] font-black uppercase text-black mb-2">
                    🌐 Chọn Trình Duyệt Tự Động Hóa:
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setBrowserType('chrome')}
                      className={`py-2 px-3 border-2 border-black text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        browserType === 'chrome'
                          ? 'bg-[#00CECB] text-black shadow-[2px_2px_0_0_rgba(0,0,0,1)]'
                          : 'bg-white text-black hover:bg-gray-100'
                      }`}
                    >
                      🌐 Chrome (Khuyên Dùng)
                    </button>
                    <button
                      type="button"
                      onClick={() => setBrowserType('firefox')}
                      className={`py-2 px-3 border-2 border-black text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        browserType === 'firefox'
                          ? 'bg-[#FF5E5B] text-white shadow-[2px_2px_0_0_rgba(0,0,0,1)]'
                          : 'bg-white text-black hover:bg-gray-100'
                      }`}
                    >
                      🦊 Firefox
                    </button>
                    <button
                      type="button"
                      onClick={() => setBrowserType('edge')}
                      className={`py-2 px-3 border-2 border-black text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        browserType === 'edge'
                          ? 'bg-[#A3E635] text-black shadow-[2px_2px_0_0_rgba(0,0,0,1)]'
                          : 'bg-white text-black hover:bg-gray-100'
                      }`}
                    >
                      🌊 Edge
                    </button>
                  </div>
                  <span className="text-[10px] text-gray-600 font-bold block mt-1">
                    * Google Chrome được khuyên dùng nhất vì chạy native không bị hạn chế sandbox của Snap.
                  </span>
                </div>

                {/* 3. Link Overleaf (Chỉ hiển thị cho LaTeX) */}
                {!isManimTask && (
                  <div>
                    <label className="block text-[11px] font-black uppercase text-black mb-1">
                      Link Dự Án Overleaf Của Bạn (Tùy chọn):
                    </label>
                    <input
                      type="text"
                      placeholder="https://www.overleaf.com/project/xxxxxxxxxxxxxxxx"
                      value={overleafUrl}
                      onChange={(e) => setOverleafUrl(e.target.value)}
                      className="w-full bg-white border-2 border-black px-3 py-1.5 text-xs font-bold text-black focus:outline-none"
                    />
                    <span className="text-[10px] text-gray-600 font-bold block mt-1">
                      * Nếu để trống, robot sẽ mở trang quản lý dự án Overleaf mặc định.
                    </span>
                  </div>
                )}

                {isManimTask && (
                  <div className="p-2.5 bg-[#9333EA]/10 border-2 border-black text-[11px] font-bold text-black flex items-center gap-2">
                    <span>🎬</span>
                    <span><strong>Quy trình Manim 1-Click:</strong> Robot gửi prompt tới AI đã chọn, nhận mã <code>scene.py</code> và tự động biên dịch bằng Manim CE (kèm auto-install thư viện Python nếu thiếu) ra video MP4.</span>
                  </div>
                )}

                <div className="flex items-center gap-4 pt-1">
                  <label className="flex items-center gap-2 text-xs font-black uppercase cursor-pointer">
                    <input
                      type="checkbox"
                      checked={headless}
                      onChange={(e) => setHeadless(e.target.checked)}
                      className="w-4 h-4 border-2 border-black rounded-none accent-black cursor-pointer"
                    />
                    Chạy ngầm (Headless - không bật cửa sổ trình duyệt)
                  </label>
                </div>
              </div>
            )}



            {/* Terminal Window */}
            <div className="bg-[#18181b] border-4 border-black p-3 font-mono text-xs text-[#A3E635] h-36 overflow-y-auto space-y-1 shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
              {logs.length === 0 ? (
                <div className="text-gray-500 italic">Nhấn "BẮT ĐẦU CHẠY 1-CLICK" để xem tiến trình thời gian thực...</div>
              ) : (
                logs.map((log, idx) => (
                  <div key={idx} className="leading-tight">
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Success Area: Action & Downloads */}
          {progress.step === 'COMPLETED' && (
            <div className="space-y-4 animate-in slide-in-from-bottom-2">
              {progress.contentType === 'manim' ? (
                /* MANIM SUCCESS VIEW */
                <>
                  <div className="bg-[#A3E635] border-4 border-black p-4 shadow-[6px_6px_0_0_rgba(0,0,0,1)] flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <Film className="w-8 h-8 text-black stroke-[3] shrink-0" />
                      <div>
                        <h4 className="text-base font-black uppercase text-black flex items-center gap-2">
                          <Sparkles className="w-5 h-5 fill-black" />
                          {hasPlaylist
                            ? `🎉 1-Click Xuất Trọn Bộ Playlist (${progress.playlistVideos!.length} Tập) Thành Công!`
                            : currentVideoUrl 
                            ? '🎉 1-Click Xuất Video Manim MP4 Thành Công!' 
                            : '1-Click Sinh Mã Manim Hoàn Tất!'}
                        </h4>
                        <p className="text-xs font-bold text-black mt-0.5">
                          {hasPlaylist ? (
                            <>Đã tự động sản xuất <strong>{progress.playlistVideos!.length} tập video MP4</strong> và lưu file mục lục <strong>danh_sach_phat.md</strong>.</>
                          ) : currentVideoUrl ? (
                            <>Đã render xong video <strong>{currentVideoPath ? currentVideoPath.split('/').pop() : 'video.mp4'}</strong> và lưu mã nguồn <strong>scene.py</strong>.</>
                          ) : (
                            <>Đã lưu mã nguồn <strong>scene.py</strong> và kịch bản render vào thư mục downloads.</>
                          )}
                        </p>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <span className="inline-flex items-center gap-1 text-[11px] font-mono font-black bg-black text-[#FFED66] px-2 py-0.5 border border-black shadow-[1px_1px_0_0_rgba(0,0,0,1)]">
                            <Clock className="w-3 h-3" /> Tổng thời gian: {formatDuration(elapsedSeconds)}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[11px] font-black bg-white text-black px-2 py-0.5 border border-black shadow-[1px_1px_0_0_rgba(0,0,0,1)]">
                            <Cpu className="w-3 h-3" /> {currentAi.name}: {currentModel?.name || currentAi.name}
                          </span>
                          {Boolean(currentAudioUrl || progress.audioUrl) && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-black bg-[#FF90E8] text-black px-2 py-0.5 border border-black shadow-[1px_1px_0_0_rgba(0,0,0,1)]">
                              <Mic className="w-3 h-3" /> 🎙️ Lồng tiếng AI ({voiceName?.includes('NamMinh') ? 'Nam Minh' : 'Hoài My'})
                            </span>
                          )}
                          {hasPlaylist && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-black bg-[#9333EA] text-white px-2 py-0.5 border border-black shadow-[1px_1px_0_0_rgba(0,0,0,1)]">
                              <ListVideo className="w-3 h-3" /> {progress.playlistVideos!.length} Tập hoàn thành
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap justify-end">
                      {currentVideoPath && (
                        <button
                          onClick={() => handleOpenVideoFile(currentVideoPath)}
                          className="flex items-center gap-1.5 px-4 py-2.5 bg-black text-[#FFED66] border-2 border-black text-xs font-black uppercase shadow-[3px_3px_0_0_rgba(0,0,0,1)] hover:bg-[#27272a] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all cursor-pointer"
                          title="Mở file MP4 bằng ứng dụng xem video mặc định của hệ thống"
                        >
                          <Play className="w-4 h-4 stroke-[3] fill-[#FFED66]" /> Mở Video (Hệ Thống)
                        </button>
                      )}

                      {currentVideoUrl && (
                        <a
                          href={currentVideoUrl}
                          download={currentVideoPath ? currentVideoPath.split('/').pop() : 'video_manim.mp4'}
                          className="flex items-center gap-1.5 px-3 py-2 bg-white text-black border-2 border-black text-xs font-black uppercase shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:bg-[#FFED66] hover:translate-x-[1px] hover:translate-y-[1px] transition-all cursor-pointer"
                        >
                          <Download className="w-4 h-4 stroke-[3]" /> Tải MP4
                        </a>
                      )}

                      {currentAudioUrl && (
                        <a
                          href={currentAudioUrl}
                          download={currentAudioPath ? currentAudioPath.split('/').pop() : 'voiceover.mp3'}
                          className="flex items-center gap-1.5 px-3 py-2 bg-[#FF90E8] text-black border-2 border-black text-xs font-black uppercase shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:bg-[#F472B6] hover:translate-x-[1px] hover:translate-y-[1px] transition-all cursor-pointer"
                          title="Tải file âm thanh thuyết minh giọng đọc AI (.mp3)"
                        >
                          <Volume2 className="w-4 h-4 stroke-[3]" /> Tải Audio (.mp3)
                        </a>
                      )}

                      <button
                        onClick={handleOpenDownloadsFolder}
                        className="flex items-center gap-1.5 px-3 py-2 bg-white text-black border-2 border-black text-xs font-black uppercase shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:bg-[#FFED66] transition-all cursor-pointer"
                      >
                        <FolderOpen className="w-4 h-4 stroke-[3]" /> Thư Mục
                      </button>

                      <button
                        onClick={() => handleDownloadTextFile('scene.py', progress.manimCode || progress.latexCode || '')}
                        className="flex items-center gap-1.5 px-3 py-2 bg-white text-black border-2 border-black text-xs font-black uppercase shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:bg-[#FFED66] transition-all cursor-pointer"
                      >
                        <Download className="w-4 h-4 stroke-[3]" /> Tải scene.py
                      </button>

                      <button
                        onClick={handleCopyLatex}
                        className="flex items-center gap-1.5 px-3 py-2 bg-white text-black border-2 border-black text-xs font-black uppercase shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:bg-[#FFED66] cursor-pointer"
                      >
                        {copied ? <Check className="w-4 h-4 stroke-[3]" /> : <Copy className="w-4 h-4 stroke-[3]" />}
                        {copied ? 'Đã Chép' : 'Copy Code'}
                      </button>
                    </div>
                  </div>

                  {/* THANH ĐIỀU HƯỚNG TẬP TRONG PLAYLIST */}
                  {hasPlaylist && (
                    <div className="bg-[#FFED66] border-4 border-black p-3 shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-black uppercase text-black flex items-center gap-2">
                          <ListVideo className="w-4 h-4 stroke-[3]" />
                          Danh Sách Phát Playlist ({progress.playlistVideos!.length} Tập Đã Sản Xuất)
                        </span>
                        <span className="text-[10px] font-black uppercase bg-black text-white px-2 py-0.5 border border-black font-mono">
                          Đang phát: Tập {selectedPlaylistIndex + 1}/{progress.playlistVideos!.length}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
                        {progress.playlistVideos!.map((item, idx) => (
                          <button
                            key={idx}
                            onClick={() => setSelectedPlaylistIndex(idx)}
                            className={`px-3 py-2 border-2 border-black text-xs font-black uppercase transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                              selectedPlaylistIndex === idx
                                ? 'bg-black text-[#FFED66] shadow-none translate-x-[2px] translate-y-[2px]'
                                : 'bg-white text-black hover:bg-[#FF90E8] shadow-[2px_2px_0_0_rgba(0,0,0,1)]'
                            }`}
                          >
                            <Play className={`w-3.5 h-3.5 stroke-[3] ${selectedPlaylistIndex === idx ? 'fill-[#FFED66]' : ''}`} />
                            <span>Tập {item.episode || (idx + 1)}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Video Live Player (nếu render thành công) */}
                  {currentVideoUrl && (
                    <div className="border-4 border-black shadow-[6px_6px_0_0_rgba(0,0,0,1)] bg-black overflow-hidden">
                      <div className="bg-[#FFED66] border-b-2 border-black px-4 py-2 flex items-center justify-between">
                        <span className="text-xs font-black uppercase text-black flex items-center gap-2">
                          <Film className="w-4 h-4 stroke-[3]" />
                          {hasPlaylist 
                            ? `Xem Trực Tiếp [Tập ${selectedPlaylistIndex + 1}/${progress.playlistVideos!.length}] ${currentVideoItem?.title ? `- ${currentVideoItem.title}` : ''}`
                            : 'Xem Trực Tiếp Video Manim (Live Player)'}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black uppercase bg-[#00CECB] text-black px-2 py-0.5 border border-black font-mono">
                            MP4 • 720p 30fps
                          </span>
                          <button
                            onClick={() => setShowCodePreview(!showCodePreview)}
                            className="text-[10px] font-black uppercase bg-white hover:bg-black hover:text-white px-2 py-0.5 border border-black transition-colors cursor-pointer"
                          >
                            {showCodePreview ? 'Ẩn Code' : 'Xem Code scene.py'}
                          </button>
                        </div>
                      </div>
                      <div className="p-3 bg-zinc-950 flex justify-center items-center">
                        <video
                          key={currentVideoUrl}
                          controls
                          autoPlay
                          loop
                          playsInline
                          className="max-h-[440px] w-auto max-w-full border-2 border-zinc-700 shadow-2xl bg-black"
                          src={currentVideoUrl}
                        >
                          Trình duyệt không hỗ trợ thẻ video HTML5.
                        </video>
                      </div>
                    </div>
                  )}

                  {/* Code Preview: hiển thị nếu không có video hoặc khi người dùng bật xem */}
                  {(!progress.videoUrl || showCodePreview) && (
                    <div className="border-4 border-black shadow-[6px_6px_0_0_rgba(0,0,0,1)] bg-[#0f172a] text-[#38bdf8] font-mono text-xs p-4 max-h-96 overflow-y-auto">
                      <div className="flex justify-between items-center mb-2 pb-1 border-b border-gray-700 text-gray-400 text-[11px]">
                        <span>Mã nguồn Manim CE (Python):</span>
                        <span className="text-green-400">scene.py</span>
                      </div>
                      <pre>{progress.manimCode || progress.latexCode}</pre>
                    </div>
                  )}
                </>
              ) : progress.contentType === 'script' ? (
                /* VIDEO SCRIPT SUCCESS VIEW */
                <>
                  <div className="bg-[#FF90E8] border-4 border-black p-4 shadow-[6px_6px_0_0_rgba(0,0,0,1)] flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <FileText className="w-8 h-8 text-black stroke-[3] shrink-0" />
                      <div>
                        <h4 className="text-base font-black uppercase text-black flex items-center gap-2">
                          <Sparkles className="w-5 h-5 fill-black" /> 1-Click Tạo Kịch Bản & Phụ Đề!
                        </h4>
                        <p className="text-xs font-bold text-black mt-0.5">
                          Đã lưu <strong>kich_ban_video.md</strong> và <strong>phude.srt</strong> vào máy tính.
                        </p>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <span className="inline-flex items-center gap-1 text-[11px] font-mono font-black bg-black text-[#FFED66] px-2 py-0.5 border border-black shadow-[1px_1px_0_0_rgba(0,0,0,1)]">
                            <Clock className="w-3 h-3" /> Tổng thời gian: {formatDuration(elapsedSeconds)}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[11px] font-black bg-white text-black px-2 py-0.5 border border-black shadow-[1px_1px_0_0_rgba(0,0,0,1)]">
                            <Cpu className="w-3 h-3" /> {currentAi.name}: {currentModel?.name || currentAi.name}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap justify-end">
                      <button
                        onClick={() => handleDownloadTextFile('kich_ban_video.md', progress.scriptContent || progress.latexCode || '')}
                        className="flex items-center gap-1.5 px-3 py-2 bg-white text-black border-2 border-black text-xs font-black uppercase shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:bg-[#FFED66] transition-all cursor-pointer"
                      >
                        <Download className="w-4 h-4 stroke-[3]" /> Tải Kịch Bản (.md)
                      </button>

                      <button
                        onClick={() => handleDownloadTextFile('phude.srt', progress.srtContent || `1\n00:00:00,000 --> 00:00:10,000\nKịch bản Video\n`)}
                        className="flex items-center gap-1.5 px-3 py-2 bg-[#00CECB] text-black border-2 border-black text-xs font-black uppercase shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:bg-[#2DD4BF] transition-all cursor-pointer"
                      >
                        <Subtitles className="w-4 h-4 stroke-[3]" /> Tải Phụ Đề (.srt)
                      </button>

                      <button
                        onClick={handleOpenDownloadsFolder}
                        className="flex items-center gap-1.5 px-3 py-2 bg-black text-[#FFED66] border-2 border-black text-xs font-black uppercase shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:bg-[#27272a] transition-all cursor-pointer"
                      >
                        <FolderOpen className="w-4 h-4 stroke-[3]" /> Thư Mục
                      </button>

                      <button
                        onClick={handleCopyLatex}
                        className="flex items-center gap-1.5 px-3 py-2 bg-white text-black border-2 border-black text-xs font-black uppercase shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:bg-[#FFED66] cursor-pointer"
                      >
                        {copied ? <Check className="w-4 h-4 stroke-[3]" /> : <Copy className="w-4 h-4 stroke-[3]" />}
                        {copied ? 'Đã Chép' : 'Copy Kịch Bản'}
                      </button>
                    </div>
                  </div>

                  {/* Script Preview */}
                  <div className="border-4 border-black shadow-[6px_6px_0_0_rgba(0,0,0,1)] bg-white text-black font-sans text-xs p-4 max-h-96 overflow-y-auto whitespace-pre-wrap">
                    {progress.scriptContent || progress.latexCode}
                  </div>
                </>
              ) : (
                /* LATEX / PDF SUCCESS VIEW */
                <>
                  <div className="bg-[#A3E635] border-4 border-black p-4 shadow-[6px_6px_0_0_rgba(0,0,0,1)] flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-8 h-8 text-black stroke-[3] shrink-0" />
                      <div>
                        <h4 className="text-base font-black uppercase text-black flex items-center gap-2">
                          <Sparkles className="w-5 h-5 fill-black" /> Xuất File PDF Thành Công!
                        </h4>
                        <p className="text-xs font-bold text-black mt-0.5">
                          File PDF đã được tự động lưu vào máy tính ({progress.pdfPath ? progress.pdfPath.split('/').pop() : 'TaiLieu.pdf'}).
                        </p>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <span className="inline-flex items-center gap-1 text-[11px] font-mono font-black bg-black text-[#FFED66] px-2 py-0.5 border border-black shadow-[1px_1px_0_0_rgba(0,0,0,1)]">
                            <Clock className="w-3 h-3" /> Tổng thời gian: {formatDuration(elapsedSeconds)}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[11px] font-black bg-white text-black px-2 py-0.5 border border-black shadow-[1px_1px_0_0_rgba(0,0,0,1)]">
                            <Cpu className="w-3 h-3" /> {currentAi.name}: {currentModel?.name || currentAi.name}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap justify-end">
                      {progress.pdfPath && (
                        <button
                          onClick={handleOpenPdfFile}
                          className="flex items-center gap-1.5 px-4 py-2.5 bg-black text-[#FFED66] border-2 border-black text-xs font-black uppercase shadow-[3px_3px_0_0_rgba(0,0,0,1)] hover:bg-[#27272a] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all cursor-pointer"
                          title="Mở file PDF ngay lập tức bằng ứng dụng đọc PDF mặc định của máy bạn"
                        >
                          <Monitor className="w-4 h-4 stroke-[3]" /> Mở File PDF
                        </button>
                      )}

                      <button
                        onClick={handleOpenDownloadsFolder}
                        className="flex items-center gap-1.5 px-3 py-2 bg-white text-black border-2 border-black text-xs font-black uppercase shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:bg-[#FFED66] hover:translate-x-[1px] hover:translate-y-[1px] transition-all cursor-pointer"
                        title="Mở thư mục chứa file PDF trên máy tính"
                      >
                        <FolderOpen className="w-4 h-4 stroke-[3]" /> Thư Mục
                      </button>

                      {progress.pdfUrl && (
                        <a
                          href={progress.pdfUrl}
                          download
                          className="flex items-center gap-1.5 px-3 py-2 bg-white text-black border-2 border-black text-xs font-black uppercase shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:bg-[#FFED66] hover:translate-x-[1px] hover:translate-y-[1px] transition-all cursor-pointer"
                        >
                          <Download className="w-4 h-4 stroke-[3]" /> Tải Về
                        </a>
                      )}

                      {progress.latexCode && (
                        <button
                          onClick={handleCopyLatex}
                          className="flex items-center gap-1.5 px-3 py-2 bg-white text-black border-2 border-black text-xs font-black uppercase shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:bg-[#FFED66] cursor-pointer"
                        >
                          {copied ? <Check className="w-4 h-4 stroke-[3]" /> : <Copy className="w-4 h-4 stroke-[3]" />}
                          {copied ? 'Đã Chép LaTeX' : 'Copy LaTeX'}
                        </button>
                      )}
                    </div>
                  </div>

                  {progress.pdfUrl && (
                    <div className="border-4 border-black shadow-[6px_6px_0_0_rgba(0,0,0,1)] bg-white overflow-hidden">
                      <div className="bg-[#FFED66] border-b-2 border-black px-4 py-2 flex items-center justify-between">
                        <span className="text-xs font-black uppercase text-black flex items-center gap-2">
                          <FileText className="w-4 h-4 stroke-[3]" /> Xem Trước Tài Liệu PDF (Live Preview)
                        </span>
                        <span className="text-[11px] font-bold text-gray-700">
                          Tự động biên dịch từ Overleaf
                        </span>
                      </div>
                      <iframe
                        src={progress.pdfUrl}
                        className="w-full h-96 border-none bg-[#525659]"
                        title="PDF Live Preview"
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          )}


          {/* Error Message */}
          {progress.step === 'ERROR' && (
            <div className="bg-[#FF5E5B] border-4 border-black p-4 shadow-[4px_4px_0_0_rgba(0,0,0,1)] flex items-center gap-3 text-black">
              <AlertTriangle className="w-6 h-6 stroke-[3] shrink-0" />
              <div>
                <h4 className="text-xs font-black uppercase">Quá trình gặp sự cố:</h4>
                <p className="text-xs font-bold">{progress.error || progress.message}</p>
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="bg-[#ffffff] border-t-4 border-black p-4 flex items-center justify-between flex-wrap gap-3">
          <div className="text-[11px] font-black uppercase text-black">
            Status: <span className="bg-[#FFED66] px-2 py-0.5 border border-black">{progress.step}</span>
          </div>

          <div className="flex items-center gap-3">
            {isRunning ? (
              <button
                onClick={handleStop}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#FF5E5B] text-black border-4 border-black text-xs font-black uppercase tracking-widest shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all cursor-pointer"
              >
                <Square className="w-4 h-4 stroke-[3]" /> Dừng Tiến Trình
              </button>
            ) : (
              <button
                onClick={handleStart}
                className="flex items-center gap-2 px-8 py-3 bg-[#A3E635] text-black border-4 border-black text-sm font-black uppercase tracking-widest shadow-[6px_6px_0_0_rgba(0,0,0,1)] hover:bg-[#86EFAC] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all cursor-pointer"
              >
                <Play className="w-5 h-5 text-black stroke-[3]" /> BẮT ĐẦU CHẠY 1-CLICK
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AutomationModal;
