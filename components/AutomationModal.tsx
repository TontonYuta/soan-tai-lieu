import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Play, Square, CheckCircle2, AlertTriangle, Loader2, 
  FileText, ExternalLink, Download, Settings, Copy, Check, Eye,
  FolderOpen, Monitor, Sparkles, Code, Subtitles, Film, ListVideo,
  Clock, Cpu, Volume2, Mic, Zap, Edit3, RefreshCw, Terminal, Bot
} from 'lucide-react';
import { AutomationClient, AutomationProgress } from '../services/automationClient';
import { generateManimRevisionPrompt } from '../services/prompts/manim';

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

import { 
  AI_PROVIDERS, 
  AiModelConfig, 
  AiProviderConfig, 
  getProviderUrl, 
  isUrlBelongsToProvider 
} from '../services/aiProviders';

export { AI_PROVIDERS, getProviderUrl, isUrlBelongsToProvider };
export type { AiModelConfig, AiProviderConfig };

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
  const [revisionFeedback, setRevisionFeedback] = useState<string>('');

  // Rerender Video State (Tự sửa code, import file .py và chỉnh chất lượng 480p/720p/1080p)
  const [rerenderQuality, setRerenderQuality] = useState<'480p' | '720p' | '1080p'>('480p');
  const [customPythonCode, setCustomPythonCode] = useState<string>('');
  const [activeTabMode, setActiveTabMode] = useState<'auto' | 'rerender'>('auto');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Quota & Limit State (Antigravity Dynamic Quota)
  const [quotaWeekly, setQuotaWeekly] = useState<number>(98);
  const [quota5h, setQuota5h] = useState<number>(95);
  const [quotaStatus, setQuotaStatus] = useState<string>('🟢 Khả dụng (Antigravity Active)');

  // Bấm giờ thời gian làm task (Task Stopwatch Timer)
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const terminalRef = useRef<HTMLDivElement | null>(null);

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
  const [renderMode, setRenderMode] = useState<'local' | 'overleaf'>(() => {
    return (localStorage.getItem('yuta_render_mode') as 'local' | 'overleaf') || 'local';
  });
  const [selectedAi, setSelectedAi] = useState<string>(() => {
    return localStorage.getItem('yuta_ai_provider') || 'antigravity';
  });
  const [enableCreditOverages, setEnableCreditOverages] = useState(false);

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

  const setHeadless = (val: boolean) => {
    setHeadlessState(val);
    localStorage.setItem('yuta_headless', String(val));
    if (onToggleHeadless) {
      onToggleHeadless(val);
    }
  };

  // Live log & progress synchronization across Mobile and Desktop
  useEffect(() => {
    let interval: any = null;
    const syncState = () => {
      AutomationClient.getCurrentState().then((state) => {
        if (!state) return;
        if (state.logs && Array.isArray(state.logs) && state.logs.length > 0) {
          setLogs((prev) => {
            const merged = [...prev];
            let changed = false;
            for (const item of state.logs) {
              if (!merged.includes(item)) {
                merged.push(item);
                changed = true;
              }
            }
            return changed ? merged : prev;
          });
        }
        if (state.isRunning !== undefined) {
          setIsRunning(state.isRunning);
          if (!state.isRunning) {
            stopTimer();
          }
        }
        if (state.progress) {
          setProgress(state.progress);
          if (state.progress.step === 'COMPLETED' || state.progress.step === 'ERROR') {
            setIsRunning(false);
            stopTimer();
          }
        }
      }).catch(() => {});
    };

    if (isOpen) {
      syncState();
      interval = setInterval(syncState, 1500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isOpen]);

  // Tự động cuộn xuống dòng log cuối cùng
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs]);

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

  useEffect(() => {
    if (externalHeadless !== undefined) {
      setHeadlessState(externalHeadless);
    }
  }, [externalHeadless]);

  // Đồng bộ nhà cung cấp AI và Quota mỗi khi mở Modal
  useEffect(() => {
    if (isOpen) {
      const savedAi = localStorage.getItem('yuta_ai_provider') || 'antigravity';
      setSelectedAi(savedAi);
      localStorage.setItem('yuta_ai_provider', savedAi);
      const prov = AI_PROVIDERS.find((p) => p.id === savedAi) || AI_PROVIDERS[0];
      const savedModel = localStorage.getItem(`yuta_ai_model_${savedAi}`) || prov.models[0]?.id || '';
      setSelectedModel(savedModel);
      const targetUrl = getProviderUrl(savedAi, savedModel);
      setAiUrl(targetUrl);

      // Cập nhật Hạn ngạch Antigravity Quota
      AutomationClient.getQuota().then(data => {
        if (data) {
          setQuotaWeekly(data.weekly);
          setQuota5h(data.fiveHour);
          setQuotaStatus(data.status);
        }
      }).catch(() => {});
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

  // Đồng bộ mã nguồn Python khi nhận được từ AI hoặc từ prompt
  useEffect(() => {
    if (progress.manimCode && !customPythonCode) {
      setCustomPythonCode(progress.manimCode);
    } else if (!customPythonCode && promptContent) {
      const match = promptContent.match(/```(?:python)?\s*([\s\S]*?from manim[\s\S]*?)```/i);
      if (match && match[1]) {
        setCustomPythonCode(match[1].trim());
      }
    }
  }, [progress.manimCode, promptContent]);

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

  const rawVideoUrl = currentVideoItem?.videoUrl || progress.videoUrl;
  const rawVideoPath = currentVideoItem?.videoPath || progress.videoPath;

  const getMediaUrl = (url?: string, filePath?: string) => {
    if (url && (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:'))) return url;
    if (url && url.startsWith('/downloads/')) return url;
    if (url) return `/downloads/${url.replace(/^\//, '')}`;
    if (filePath) {
      if (filePath.includes('Downloads/')) {
        const rel = filePath.split('Downloads/').pop();
        if (rel) return `/downloads/${rel}`;
      }
      const filename = filePath.split('/').pop();
      if (filename) return `/downloads/${filename}`;
    }
    return undefined;
  };

  const currentVideoUrl = getMediaUrl(rawVideoUrl, rawVideoPath);
  const currentVideoPath = rawVideoPath;
  const currentAudioUrl = getMediaUrl(currentVideoItem?.audioUrl || progress.audioUrl, currentVideoItem?.audioPath || progress.audioPath);
  const currentAudioPath = currentVideoItem?.audioPath || progress.audioPath;

  const addLog = (msg: string) => {
    if (!msg) return;
    const time = new Date().toLocaleTimeString('vi-VN', { hour12: false });
    const curSec = startTimeRef.current ? Math.floor((Date.now() - startTimeRef.current) / 1000) : 0;
    const formatted = `[${formatDuration(curSec)}] [${time}] ${msg}`;
    setLogs((prev) => {
      if (prev.some((line) => line.includes(msg))) return prev;
      return [...prev, formatted];
    });
  };

  const handleStart = async (overridePrompt?: string | React.MouseEvent) => {
    const isRevision = typeof overridePrompt === 'string' && overridePrompt.trim().length > 0;
    const activePrompt = isRevision ? (overridePrompt as string) : promptContent;
    if (!activePrompt) {
      alert('Chưa có nội dung Prompt! Vui lòng chọn cấu hình đề và tạo prompt trước.');
      return;
    }

    const countMatch = activePrompt.match(/GỒM ĐÚNG\s*(\d+)\s*TẬP/i) || activePrompt.match(/(\d+)\s*tập/i);
    const detectedSeriesCount = countMatch ? parseInt(countMatch[1], 10) : undefined;

    const effectiveAi = selectedAi || 'antigravity';
    const effectiveModel = selectedModel || currentModel?.id || currentAi.models[0]?.id || 'gemini-3.8-flash-high';
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
    if (isRevision) {
      addLog(`✏️ Nhận yêu cầu chỉnh sửa/sửa lỗi từ người dùng -> Đang truyền prompt tinh chỉnh tới Antigravity AGY...`);
    }
    if (isPlaylistTask) {
      addLog(`Chế độ Chuỗi Playlist: Sản xuất tự động ${seriesCount || detectedSeriesCount || 3} tập video MP4 liên hoàn.`);
    }
    if (attachedPdfPath) {
      addLog(`Tài liệu RAG đính kèm: ${attachedPdfName || 'document.pdf'}`);
    }
    if (enableVoice === true) {
      const voiceLabel = (voiceName && voiceName.includes('NamMinh')) ? 'Nam Minh (Nam)' : 'Hoài My (Nữ)';
      addLog(`🎙️ Lồng tiếng AI: Đã kích hoạt thuyết minh giọng đọc [${voiceLabel}].`);
    }

    await AutomationClient.startPipeline(
      {
        prompt: activePrompt,
        browserType: browserType,
        aiProvider: effectiveAi,
        provider: effectiveAi,
        aiUrl: effectiveAiUrl,
        geminiUrl: effectiveAi === 'gemini' ? effectiveAiUrl : undefined,
        overleafUrl: overleafUrl || undefined,
        renderMode: renderMode,
        headless: headless,
        attachedPdfPath: attachedPdfPath,
        isSeries: isPlaylistTask,
        seriesCount: seriesCount || detectedSeriesCount,
        seriesOutline: seriesOutline,
        topic: topic,
        subject: subject,
        model: effectiveModel,
        modelName: effectiveModelName,
        enableVoice: enableVoice !== undefined ? enableVoice : (typeof window !== 'undefined' ? localStorage.getItem('yuta_manim_enable_voice') === 'true' : false),
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

  const handleReGenerateWithFeedback = async () => {
    if (!revisionFeedback.trim()) return;
    const currentCode = progress.manimCode || progress.latexCode || '';
    const revPrompt = generateManimRevisionPrompt(
      { 
        subject: subject || 'Toán học',
        topic: topic || 'Bài giảng',
        duration: '60 giây',
        tone: 'simple',
        audience: 'Học sinh & Người tự học',
        format: 'vertical' 
      },
      currentCode,
      revisionFeedback
    );
    setRevisionFeedback('');
    await handleStart(revPrompt);
  };

  const handleRerenderDirect = async (overrideQuality?: '480p' | '720p' | '1080p') => {
    const codeToRun = customPythonCode.trim() || progress.manimCode || '';
    if (!codeToRun) {
      alert('Vui lòng nhập, dán hoặc tải file mã nguồn Python Manim (scene.py) để Rerender!');
      return;
    }
    const q = overrideQuality || rerenderQuality;
    startTimer();
    setIsRunning(true);
    setLogs([]);
    addLog(`⚡ Kích hoạt RERENDER MANIM CE TRỰC TIẾP [Chất lượng: ${q.toUpperCase()}]...`);
    addLog(`✓ Chế độ Offline/Direct: Bỏ qua AI prompt -> Tiết kiệm 100% thời gian chờ và quota.`);

    await AutomationClient.rerenderManim(
      codeToRun,
      q,
      (update) => {
        setProgress(update);
        addLog(update.message);
        if (update.step === 'COMPLETED' || update.step === 'ERROR') {
          setIsRunning(false);
          stopTimer();
        }
      },
      {
        topic: topic,
        subject: subject,
        enableVoice: enableVoice,
        voiceName: voiceName,
        voiceSpeed: voiceSpeed,
      }
    );
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      if (content) {
        setCustomPythonCode(content);
        addLog(`✓ Đã import thành công file mã nguồn: ${file.name} (${content.length} ký tự).`);
      }
    };
    reader.readAsText(file);
  };

  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setCustomPythonCode(text);
        addLog(`✓ Đã dán mã từ Clipboard (${text.length} ký tự).`);
      }
    } catch {
      alert('Không thể đọc Clipboard. Vui lòng dán thủ công bằng Ctrl+V vào khung soạn thảo.');
    }
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
                  Đã hoàn thành {(progress.playlistVideos || []).length}{progress.seriesCount ? `/${progress.seriesCount}` : ''} tập MP4
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
            <div className={`text-[10px] font-bold px-2.5 py-1.5 border flex items-center justify-between flex-wrap gap-1 ${
              selectedAi === 'antigravity' ? 'bg-[#FF5757]/15 border-red-500 text-red-950' : 'bg-[#f4f4f5] border-black/20 text-gray-700'
            }`}>
              <div className="flex items-center gap-2 flex-wrap">
                <span>💡 {currentModel?.desc || 'Mô hình lập trình AI'}</span>
                {selectedAi === 'antigravity' && (
                  <span className="bg-[#FFED66] text-black font-black uppercase text-[10px] px-2 py-0.5 border border-black shadow-[1px_1px_0_0_rgba(0,0,0,1)]">
                    ⚡ Hạn Ngạch (Quota): 5 giờ / 1 tuần (5h / 1w) • Auto Reset
                  </span>
                )}
              </div>
              <span className="font-mono text-indigo-800 font-bold">{currentAi.id === 'chatgpt' ? 'Mode: ' : 'Model: '}{currentModel?.id}</span>
            </div>
          </div>

          {/* Antigravity Quota Compact Indicator (Trích xuất phần trăm hạn ngạch) */}
          {(selectedAi === 'antigravity' || selectedAi === 'gemini') && (
            <div className="p-3 bg-[#FFED66]/30 border-2 border-black flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 font-black uppercase text-black">
                <Zap className="w-4 h-4 text-purple-700 stroke-[3]" />
                <span>⚡ Hạn Ngạch Antigravity Quota (Còn Lại):</span>
              </div>
              <div className="flex items-center gap-2 flex-wrap font-mono">
                <div className="flex items-center gap-1.5 bg-emerald-600 text-white font-black px-3 py-1 border border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)]" title="Hạn ngạch tuần 1w còn lại">
                  <span className="text-[10px] text-emerald-100 font-sans font-bold">Hàng tuần (1w):</span>
                  <span className="text-sm">{quotaWeekly}%</span>
                </div>
                <div className="flex items-center gap-1.5 bg-emerald-600 text-white font-black px-3 py-1 border border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)]" title="Hạn ngạch 5 tiếng 5h còn lại">
                  <span className="text-[10px] text-emerald-100 font-sans font-bold">5 Tiếng (5h):</span>
                  <span className="text-sm">{quota5h}%</span>
                </div>
                <div className="flex items-center gap-1.5 bg-white text-black font-bold px-2.5 py-1 border border-black text-xs">
                  <span className="text-emerald-700 font-black">{quotaStatus}</span>
                </div>
              </div>
            </div>
          )}

          {/* Hidden File Input cho việc import file .py */}
          <input
            type="file"
            ref={fileInputRef}
            accept=".py,.txt"
            className="hidden"
            onChange={handleFileUpload}
          />

          {/* Chế độ Làm Việc: 1-Click Tự Động AI vs ⚡ Rerender Video Nhanh */}
          {isManimTask && (
            <div className="p-1 bg-black border-2 border-black grid grid-cols-2 gap-1 text-xs font-black uppercase shadow-[3px_3px_0_0_rgba(0,0,0,1)]">
              <button
                type="button"
                onClick={() => setActiveTabMode('auto')}
                className={`py-2 px-3 flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  activeTabMode === 'auto'
                    ? 'bg-[#FFED66] text-black shadow-none translate-x-[1px] translate-y-[1px]'
                    : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                }`}
              >
                <Bot className="w-4 h-4" />
                <span>1. Tự Động Hóa AI Agent (2 Lượt Kịch Bản + Mã)</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTabMode('rerender')}
                className={`py-2 px-3 flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  activeTabMode === 'rerender'
                    ? 'bg-[#00CECB] text-black shadow-none translate-x-[1px] translate-y-[1px]'
                    : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                }`}
              >
                <Zap className="w-4 h-4 fill-current" />
                <span>2. ⚡ Rerender Video Nhanh (Import / Sửa Code)</span>
              </button>
            </div>
          )}

          {/* KHỐI RERENDER NHANH ĐỘC LẬP KHI CHỌN TAB RERENDER */}
          {isManimTask && activeTabMode === 'rerender' && (
            <div className="bg-[#00CECB]/15 border-4 border-black p-4 shadow-[6px_6px_0_0_rgba(0,0,0,1)] space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-black stroke-[3] fill-black" />
                  <h4 className="text-sm font-black uppercase text-black tracking-wider">
                    ⚡ Rerender Video Manim Trực Tiếp (Tối Ưu Thời Gian Kiểm Thử)
                  </h4>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase bg-black text-[#00CECB] px-2 py-0.5 border border-black font-mono">
                    Local Offline Render • Không tốn Quota AI
                  </span>
                </div>
              </div>

              <p className="text-xs font-bold text-black">
                Dán mã Manim Python đã sửa bằng tay hoặc tải file <code>scene.py</code> từ máy tính lên. Chọn chất lượng <strong>480p</strong> để render siêu tốc trong 15-30 giây kiểm tra nhanh bố cục trước khi xuất bản 1080p.
              </p>

              {/* Thanh chọn chất lượng Render */}
              <div className="flex items-center justify-between flex-wrap gap-2 p-2 bg-white border-2 border-black">
                <div className="flex items-center gap-1.5 text-xs font-black uppercase text-black">
                  <span>🎬 Chọn chất lượng render:</span>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    type="button"
                    disabled={isRunning}
                    onClick={() => setRerenderQuality('480p')}
                    className={`px-3 py-1.5 border-2 border-black text-xs font-black uppercase transition-all cursor-pointer flex items-center gap-1 ${
                      rerenderQuality === '480p'
                        ? 'bg-[#A3E635] text-black shadow-[2px_2px_0_0_rgba(0,0,0,1)]'
                        : 'bg-gray-100 text-gray-700 hover:bg-white'
                    }`}
                    title="Render cực nhanh (-ql: 480p 15fps), khuyên dùng để kiểm thử nhanh chuyển động và bố cục"
                  >
                    <span>⚡ 480p (Rất nhanh ~15s - Test)</span>
                  </button>
                  <button
                    type="button"
                    disabled={isRunning}
                    onClick={() => setRerenderQuality('720p')}
                    className={`px-3 py-1.5 border-2 border-black text-xs font-black uppercase transition-all cursor-pointer flex items-center gap-1 ${
                      rerenderQuality === '720p'
                        ? 'bg-[#FFED66] text-black shadow-[2px_2px_0_0_rgba(0,0,0,1)]'
                        : 'bg-gray-100 text-gray-700 hover:bg-white'
                    }`}
                    title="Render chuẩn HD (-qm: 720p 30fps)"
                  >
                    <span>🎬 720p (HD Chuẩn)</span>
                  </button>
                  <button
                    type="button"
                    disabled={isRunning}
                    onClick={() => setRerenderQuality('1080p')}
                    className={`px-3 py-1.5 border-2 border-black text-xs font-black uppercase transition-all cursor-pointer flex items-center gap-1 ${
                      rerenderQuality === '1080p'
                        ? 'bg-[#9333EA] text-white shadow-[2px_2px_0_0_rgba(0,0,0,1)]'
                        : 'bg-gray-100 text-gray-700 hover:bg-white'
                    }`}
                    title="Render độ nét cao (-qh: 1080p 60fps), dành cho video chính thức"
                  >
                    <span>🌟 1080p (Full HD Chuẩn Nét)</span>
                  </button>
                </div>
              </div>

              {/* Nút thao tác nhanh với Code */}
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-[11px] font-black uppercase font-mono text-gray-700">
                  Mã Python Manim (scene.py) - {customPythonCode.length} ký tự
                </span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    type="button"
                    onClick={handlePasteClipboard}
                    className="px-2.5 py-1 bg-white hover:bg-[#FFED66] border border-black text-[11px] font-black uppercase cursor-pointer shadow-[1px_1px_0_0_rgba(0,0,0,1)]"
                  >
                    📋 Dán Từ Clipboard
                  </button>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-2.5 py-1 bg-white hover:bg-[#FFED66] border border-black text-[11px] font-black uppercase cursor-pointer shadow-[1px_1px_0_0_rgba(0,0,0,1)]"
                  >
                    📂 Tải File .py Lên
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (progress.manimCode) {
                        setCustomPythonCode(progress.manimCode);
                      }
                    }}
                    disabled={!progress.manimCode}
                    className="px-2.5 py-1 bg-white hover:bg-[#FFED66] border border-black text-[11px] font-black uppercase cursor-pointer disabled:opacity-40"
                  >
                    🔄 Lấy Code Gốc
                  </button>
                </div>
              </div>

              {/* Trình soạn thảo Code Python */}
              <textarea
                value={customPythonCode}
                onChange={(e) => setCustomPythonCode(e.target.value)}
                placeholder="Dán hoặc viết mã nguồn Manim Python (scene.py) tại đây... Bắt đầu bằng: from manim import *"
                className="w-full h-64 p-3 bg-[#0f172a] text-[#38bdf8] font-mono text-xs border-2 border-black focus:outline-none selection:bg-[#FFED66] selection:text-black resize-y leading-relaxed"
                spellCheck={false}
              />

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  disabled={isRunning || !customPythonCode.trim()}
                  onClick={() => handleRerenderDirect()}
                  className={`flex items-center gap-2 px-5 py-3 border-[3px] border-black text-xs font-black uppercase tracking-wider shadow-[4px_4px_0_0_rgba(0,0,0,1)] transition-all cursor-pointer ${
                    isRunning || !customPythonCode.trim()
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed border-gray-400 shadow-none'
                      : 'bg-[#A3E635] hover:bg-[#86EFAC] text-black active:translate-x-[2px] active:translate-y-[2px] active:shadow-none'
                  }`}
                >
                  <Zap className="w-4 h-4 stroke-[3] fill-black" />
                  <span>⚡ Bắt Đầu Rerender Ngay ({rerenderQuality.toUpperCase()})</span>
                </button>
              </div>
            </div>
          )}

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
                <span className="px-2 py-0.5 bg-[#A3E635] text-black text-[10px] font-mono border border-black animate-pulse">
                  ⚡ Sync Phone ⇄ PC
                </span>
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

                {/* 3. Chế Độ Biên Dịch LaTeX (Local vs Overleaf) */}
                {!isManimTask && (
                  <div className="space-y-2">
                    <label className="block text-[11px] font-black uppercase text-black">
                      ⚡ Chọn Môi Trường Biên Dịch LaTeX:
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setRenderMode('local');
                          localStorage.setItem('yuta_render_mode', 'local');
                        }}
                        className={`p-2.5 border-2 border-black text-center text-xs font-black transition-all cursor-pointer ${
                          renderMode === 'local'
                            ? 'bg-[#A3E635] text-black shadow-[2px_2px_0_0_rgba(0,0,0,1)]'
                            : 'bg-white text-black hover:bg-gray-100'
                        }`}
                      >
                        <span className="block text-xs mb-0.5">⚡ Local Máy Tính</span>
                        <span className="text-[9px] font-bold text-gray-700 block">Biên dịch cục bộ (1-3s) • Ổn định 100%</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setRenderMode('overleaf');
                          localStorage.setItem('yuta_render_mode', 'overleaf');
                        }}
                        className={`p-2.5 border-2 border-black text-center text-xs font-black transition-all cursor-pointer ${
                          renderMode === 'overleaf'
                            ? 'bg-[#00CECB] text-black shadow-[2px_2px_0_0_rgba(0,0,0,1)]'
                            : 'bg-white text-black hover:bg-gray-100'
                        }`}
                      >
                        <span className="block text-xs mb-0.5">☁️ Overleaf Cloud</span>
                        <span className="text-[9px] font-bold text-gray-700 block">Đồng bộ link dự án web</span>
                      </button>
                    </div>

                    {renderMode === 'overleaf' && (
                      <div className="pt-1">
                        <label className="block text-[10px] font-black uppercase text-gray-800 mb-1">
                          Link Dự Án Overleaf Của Bạn (Tùy chọn):
                        </label>
                        <input
                          type="text"
                          placeholder="https://www.overleaf.com/project/xxxxxxxxxxxxxxxx"
                          value={overleafUrl}
                          onChange={(e) => setOverleafUrl(e.target.value)}
                          className="w-full bg-white border-2 border-black px-3 py-1.5 text-xs font-bold text-black focus:outline-none"
                        />
                      </div>
                    )}
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



            {/* Terminal Window Header Bar */}
            <div className="flex items-center justify-between bg-black text-[#A3E635] px-3 py-1.5 border-4 border-b-0 border-black font-mono text-xs font-black uppercase">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-[#A3E635] stroke-[3]" />
                <span>🖥️ Real-Time System Log ({logs.length} dòng)</span>
                {isRunning && (
                  <span className="w-2 h-2 rounded-full bg-[#A3E635] animate-ping ml-1" />
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(logs.join('\n'));
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="px-2 py-0.5 bg-[#FFED66] text-black border border-black text-[10px] font-sans font-black uppercase hover:bg-yellow-300 transition-all cursor-pointer"
                >
                  {copied ? '✓ Đã Copy Log' : 'Copy All Logs'}
                </button>
                <button
                  type="button"
                  onClick={() => setLogs([])}
                  className="px-2 py-0.5 bg-[#FF5E5B] text-white border border-black text-[10px] font-sans font-black uppercase hover:bg-red-600 transition-all cursor-pointer"
                >
                  Xóa Log
                </button>
              </div>
            </div>

            {/* Terminal Window Content */}
            <div ref={terminalRef} className="bg-[#18181b] border-4 border-black p-3 font-mono text-xs text-[#A3E635] h-48 overflow-y-auto space-y-1.5 shadow-[4px_4px_0_0_rgba(0,0,0,1)] select-text">
              {logs.length === 0 ? (
                <div className="text-gray-500 italic py-4 text-center">
                  [Hệ thống sẵn sàng. Nhấn "BẮT ĐẦU CHẠY 1-CLICK" để xem log giám sát thời gian thực...]
                </div>
              ) : (
                logs.map((log, idx) => (
                  <div key={idx} className="leading-relaxed border-b border-gray-800/60 pb-1 whitespace-pre-wrap font-mono">
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
                            ? `🎉 1-Click Xuất Trọn Bộ Playlist (${(progress.playlistVideos || []).length} Tập) Thành Công!`
                            : currentVideoUrl 
                            ? '🎉 1-Click Xuất Video Manim MP4 Thành Công!' 
                            : '1-Click Sinh Mã Manim Hoàn Tất!'}
                        </h4>
                        <p className="text-xs font-bold text-black mt-0.5">
                          {hasPlaylist ? (
                            <>Đã tự động sản xuất <strong>{(progress.playlistVideos || []).length} tập video MP4</strong> và lưu file mục lục <strong>danh_sach_phat.md</strong>.</>
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
                              <ListVideo className="w-3 h-3" /> {(progress.playlistVideos || []).length} Tập hoàn thành
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
                          Danh Sách Phát Playlist ({(progress.playlistVideos || []).length} Tập Đã Sản Xuất)
                        </span>
                        <span className="text-[10px] font-black uppercase bg-black text-white px-2 py-0.5 border border-black font-mono">
                          Đang phát: Tập {selectedPlaylistIndex + 1}/{(progress.playlistVideos || []).length}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
                        {(progress.playlistVideos || []).map((item, idx) => (
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
                            ? `Xem Trực Tiếp [Tập ${selectedPlaylistIndex + 1}/${(progress.playlistVideos || []).length}] ${currentVideoItem?.title ? `- ${currentVideoItem.title}` : ''}`
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

                  {/* Code Editor & Rerender Section: cho phép người dùng tự sửa mã hoặc đổi chất lượng */}
                  {(!progress.videoUrl || showCodePreview) && (
                    <div className="border-4 border-black shadow-[6px_6px_0_0_rgba(0,0,0,1)] bg-[#0f172a] text-[#38bdf8] font-mono text-xs p-4 space-y-3">
                      <div className="flex justify-between items-center pb-2 border-b border-gray-700 text-gray-300 text-xs flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <Code className="w-4 h-4 text-[#00CECB]" />
                          <span className="font-bold text-white">Mã nguồn Manim CE (scene.py):</span>
                          <span className="text-gray-400 font-normal">{(customPythonCode || progress.manimCode || '').length} ký tự</span>
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <button
                            type="button"
                            onClick={handlePasteClipboard}
                            className="px-2 py-0.5 bg-zinc-800 hover:bg-zinc-700 text-white border border-gray-600 text-[10px] font-sans font-bold uppercase transition-colors cursor-pointer"
                          >
                            📋 Dán Code
                          </button>
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="px-2 py-0.5 bg-zinc-800 hover:bg-zinc-700 text-white border border-gray-600 text-[10px] font-sans font-bold uppercase transition-colors cursor-pointer"
                          >
                            📂 Import .py
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(customPythonCode || progress.manimCode || '');
                              setCopied(true);
                              setTimeout(() => setCopied(false), 2000);
                            }}
                            className="px-2 py-0.5 bg-zinc-800 hover:bg-zinc-700 text-white border border-gray-600 text-[10px] font-sans font-bold uppercase transition-colors cursor-pointer"
                          >
                            {copied ? '✓ Đã Chép' : 'Copy'}
                          </button>
                        </div>
                      </div>

                      {/* Editor Textarea có thể chỉnh sửa tự do */}
                      <textarea
                        value={customPythonCode || progress.manimCode || ''}
                        onChange={(e) => setCustomPythonCode(e.target.value)}
                        placeholder="Mã nguồn Manim Python (scene.py)..."
                        className="w-full h-64 p-3 bg-zinc-950 text-[#38bdf8] font-mono text-xs border border-gray-700 focus:outline-none focus:border-[#00CECB] selection:bg-[#FFED66] selection:text-black resize-y leading-relaxed"
                        spellCheck={false}
                      />

                      {/* Toolbar Rerender & Chọn chất lượng */}
                      <div className="flex items-center justify-between flex-wrap gap-2 pt-1 border-t border-gray-800 font-sans">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[11px] font-black uppercase text-gray-300">Chất lượng:</span>
                          <button
                            type="button"
                            disabled={isRunning}
                            onClick={() => setRerenderQuality('480p')}
                            className={`px-2 py-1 border text-[10px] font-black uppercase transition-all cursor-pointer ${
                              rerenderQuality === '480p'
                                ? 'bg-[#A3E635] text-black border-black font-black shadow-[1px_1px_0_0_rgba(0,0,0,1)]'
                                : 'bg-zinc-800 text-gray-300 border-zinc-700 hover:bg-zinc-700'
                            }`}
                            title="480p 15fps: Rất nhanh ~15s để kiểm thử nhanh"
                          >
                            ⚡ 480p (Kiểm thử)
                          </button>
                          <button
                            type="button"
                            disabled={isRunning}
                            onClick={() => setRerenderQuality('720p')}
                            className={`px-2 py-1 border text-[10px] font-black uppercase transition-all cursor-pointer ${
                              rerenderQuality === '720p'
                                ? 'bg-[#FFED66] text-black border-black font-black shadow-[1px_1px_0_0_rgba(0,0,0,1)]'
                                : 'bg-zinc-800 text-gray-300 border-zinc-700 hover:bg-zinc-700'
                            }`}
                          >
                            🎬 720p (HD)
                          </button>
                          <button
                            type="button"
                            disabled={isRunning}
                            onClick={() => setRerenderQuality('1080p')}
                            className={`px-2 py-1 border text-[10px] font-black uppercase transition-all cursor-pointer ${
                              rerenderQuality === '1080p'
                                ? 'bg-[#9333EA] text-white border-black font-black shadow-[1px_1px_0_0_rgba(0,0,0,1)]'
                                : 'bg-zinc-800 text-gray-300 border-zinc-700 hover:bg-zinc-700'
                            }`}
                          >
                            🌟 1080p (Full HD)
                          </button>
                        </div>

                        <button
                          type="button"
                          disabled={isRunning || !(customPythonCode || progress.manimCode)}
                          onClick={() => handleRerenderDirect()}
                          className={`flex items-center gap-1.5 px-4 py-2 border-2 border-black text-xs font-black uppercase transition-all cursor-pointer shadow-[2px_2px_0_0_rgba(0,0,0,1)] ${
                            isRunning || !(customPythonCode || progress.manimCode)
                              ? 'bg-gray-500 text-gray-300 cursor-not-allowed border-gray-600 shadow-none'
                              : 'bg-[#00CECB] hover:bg-[#2DD4BF] text-black active:translate-x-[1px] active:translate-y-[1px]'
                          }`}
                          title="Rerender video trực tiếp từ code Python trên mà không qua AI (tiết kiệm thời gian & quota)"
                        >
                          <Zap className="w-3.5 h-3.5 stroke-[3] fill-black" />
                          <span>⚡ Rerender Video ({rerenderQuality.toUpperCase()})</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* KHỐI CHỈNH SỬA & FIX LỖI VIDEO (RE-PROMPT ANTIGRAVITY AGY) */}
                  <div className="bg-[#FFED66] border-4 border-black p-4 shadow-[6px_6px_0_0_rgba(0,0,0,1)] space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Edit3 className="w-5 h-5 text-black stroke-[3]" />
                        <h4 className="text-sm font-black uppercase text-black tracking-wider">
                          ✏️ Chỉnh Sửa Video & Sửa Lỗi (Re-Prompt Antigravity AGY)
                        </h4>
                      </div>
                      <span className="text-[10px] font-black uppercase bg-black text-[#FFED66] px-2 py-0.5 border border-black font-mono">
                        1-Click Refine
                      </span>
                    </div>
                    <p className="text-xs font-bold text-black">
                      Nhập các lỗi còn tồn tại trong video hoặc các câu từ cần điều chỉnh (Vd: "Thay màu đồ thị sang màu Vàng", "Sửa câu thoại ở phân cảnh 2 thành...", "Đưa tiêu đề lên cao 0.5 unit..."):
                    </p>
                    <textarea
                      value={revisionFeedback}
                      onChange={(e) => setRevisionFeedback(e.target.value)}
                      placeholder="Vd: 1. Sửa lời thoại ở phân cảnh 2 thành: '...'\n2. Đổi màu đồ thị hàm số từ Xanh sang Vàng\n3. Cho hiệu ứng hào quang Outro xuất hiện muộn hơn 1s..."
                      className="w-full p-3 bg-white border-[3px] border-black text-xs font-bold text-black placeholder:text-gray-500 min-h-[80px] shadow-[3px_3px_0_0_rgba(0,0,0,1)] focus:outline-none"
                    />
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={handleReGenerateWithFeedback}
                        disabled={isRunning || !revisionFeedback.trim()}
                        className={`flex items-center gap-2 px-4 py-2.5 border-[3px] border-black text-xs font-black uppercase shadow-[4px_4px_0_0_rgba(0,0,0,1)] transition-all cursor-pointer ${
                          isRunning || !revisionFeedback.trim()
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed border-gray-400 shadow-none'
                            : 'bg-[#A3E635] hover:bg-[#86EFAC] text-black active:translate-x-[2px] active:translate-y-[2px] active:shadow-none'
                        }`}
                        title="Tự động truyền phản hồi sửa lỗi cho Antigravity Agent để viết lại mã Python scene.py và render video lại từ đầu"
                      >
                        <Zap className="w-4 h-4 stroke-[3] fill-black" />
                        <span>⚡ Gửi Phản Hồi & Render Lại Video (1-Click)</span>
                      </button>
                    </div>
                  </div>
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
                          Tự động biên dịch từ Overleaf / Antigravity Engine
                        </span>
                      </div>
                      <iframe
                        src={progress.pdfPath ? `/api/view-pdf?path=${encodeURIComponent(progress.pdfPath)}#toolbar=0` : progress.pdfUrl}
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
              <div className="flex items-center gap-2 flex-wrap">
                {isManimTask && (
                  <button
                    type="button"
                    onClick={() => handleRerenderDirect()}
                    className="flex items-center gap-1.5 px-5 py-3 bg-[#00CECB] hover:bg-[#2DD4BF] text-black border-4 border-black text-xs font-black uppercase tracking-wider shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer"
                    title="Render lại video Manim trực tiếp từ code Python scene.py mà không qua AI (tiết kiệm thời gian & quota)"
                  >
                    <Zap className="w-4 h-4 stroke-[3] fill-black" />
                    <span>⚡ RERENDER ({rerenderQuality.toUpperCase()})</span>
                  </button>
                )}
                <button
                  onClick={() => handleStart()}
                  className="flex items-center gap-2 px-8 py-3 bg-[#A3E635] text-black border-4 border-black text-sm font-black uppercase tracking-widest shadow-[6px_6px_0_0_rgba(0,0,0,1)] hover:bg-[#86EFAC] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all cursor-pointer"
                >
                  <Play className="w-5 h-5 text-black stroke-[3]" /> BẮT ĐẦU CHẠY 1-CLICK
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AutomationModal;
