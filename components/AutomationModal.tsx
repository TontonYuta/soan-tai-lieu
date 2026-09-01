import React, { useState, useEffect } from 'react';
import { 
  X, Play, Square, CheckCircle2, AlertTriangle, Loader2, 
  FileText, ExternalLink, Download, Settings, Copy, Check, Eye,
  FolderOpen, Monitor, Sparkles
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
}

const AI_PROVIDERS = [
  { id: 'gemini', name: 'Gemini', fullName: 'Google Gemini', url: 'https://gemini.google.com/app', icon: '✨', bg: 'bg-[#00CECB]' },
  { id: 'chatgpt', name: 'ChatGPT', fullName: 'ChatGPT (OpenAI)', url: 'https://chatgpt.com', icon: '🟢', bg: 'bg-[#A3E635]' },
  { id: 'claude', name: 'Claude', fullName: 'Claude (Anthropic)', url: 'https://claude.ai/new', icon: '🟣', bg: 'bg-[#FF90E8]' },
  { id: 'grok', name: 'Grok', fullName: 'xAI Grok', url: 'https://grok.com', icon: '⚡', bg: 'bg-[#FFED66]' },
  { id: 'deepseek', name: 'DeepSeek', fullName: 'DeepSeek AI', url: 'https://chat.deepseek.com', icon: '🔵', bg: 'bg-[#60A5FA]' },
] as const;

export const AutomationModal: React.FC<AutomationModalProps> = ({
  isOpen,
  onClose,
  promptContent,
  headless: externalHeadless,
  onToggleHeadless,
  attachedPdfPath,
  attachedPdfName,
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
  const [aiUrl, setAiUrl] = useState<string>(
    localStorage.getItem('yuta_ai_url') || localStorage.getItem('gemini_fixed_link') || 'https://gemini.google.com/app'
  );

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

  useEffect(() => {
    if (aiUrl) {
      localStorage.setItem('yuta_ai_url', aiUrl);
    }
  }, [aiUrl]);

  if (!isOpen) return null;

  const currentAi = AI_PROVIDERS.find((p) => p.id === selectedAi) || AI_PROVIDERS[0];

  const STEPS = [
    { id: 'CONNECTING_CHROME', label: '1. Kết nối Browser' },
    { id: 'OPENING_GEMINI', label: `2. Mở ${currentAi.name}` },
    { id: 'SENDING_PROMPT', label: '3. Gửi Prompt & Giải' },
    { id: 'EXTRACTING_LATEX', label: '4. Bóc tách mã LaTeX' },
    { id: 'OPENING_OVERLEAF', label: '5. Mở Overleaf & Dán' },
    { id: 'RECOMPILING', label: '6. Recompile & PDF' },
    { id: 'DOWNLOADING_PDF', label: '7. Tải PDF về máy' },
  ];

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, `[${time}] ${msg}`]);
  };

  const handleStart = async () => {
    if (!promptContent) {
      alert('Chưa có nội dung Prompt! Vui lòng chọn cấu hình đề và tạo prompt trước.');
      return;
    }

    setIsRunning(true);
    setLogs([]);
    addLog(`Bắt đầu quy trình tự động hóa 1-Click với ${currentAi.fullName}...`);
    if (attachedPdfPath) {
      addLog(`Tài liệu RAG đính kèm: ${attachedPdfName || 'document.pdf'}`);
    }

    await AutomationClient.startPipeline(
      {
        prompt: promptContent,
        browserType: browserType,
        aiUrl: aiUrl || undefined,
        geminiUrl: aiUrl || undefined,
        overleafUrl: overleafUrl || undefined,
        headless: headless,
        attachedPdfPath: attachedPdfPath,
      },
      (update) => {
        setProgress(update);
        addLog(update.message);

        if (update.step === 'COMPLETED' || update.step === 'ERROR') {
          setIsRunning(false);
        }
      }
    );
  };



  const handleStop = async () => {
    addLog('Đang gửi lệnh dừng quy trình...');
    await AutomationClient.stop();
    setIsRunning(false);
  };

  const handleCopyLatex = () => {
    if (progress.latexCode) {
      navigator.clipboard.writeText(progress.latexCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
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
    if (stepIndex < currentIndex) return 'completed';
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
                ⚡ Tự Động Hóa 1-Click: Gemini ➔ Overleaf ➔ Xuất PDF
              </h2>
              <p className="text-[11px] font-bold text-black uppercase">
                Tự động kết nối Chrome • Không cần API key • Trích xuất và xuất bản tự động
              </p>
            </div>
          </div>
          
          <button 
            onClick={onClose}
            disabled={isRunning}
            className="p-1.5 bg-[#ffffff] hover:bg-[#FF5E5B] border-2 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all cursor-pointer disabled:opacity-50"
          >
            <X className="w-5 h-5 text-black stroke-[3]" />
          </button>
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
              <span className="text-sm font-black text-black bg-[#FFED66] px-2 py-0.5 border-2 border-black">
                {progress.progress}%
              </span>
            </div>
            
            {/* Thanh tiến trình */}
            <div className="w-full h-4 bg-white border-2 border-black overflow-hidden">
              <div 
                className={`h-full transition-all duration-300 ${progress.step === 'ERROR' ? 'bg-[#FF5E5B]' : progress.step === 'COMPLETED' ? 'bg-[#A3E635]' : 'bg-[#00CECB]'}`}
                style={{ width: `${progress.progress}%` }}
              />
            </div>

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
                        onClick={() => {
                          setSelectedAi(ai.id);
                          setAiUrl(ai.url);
                          localStorage.setItem('yuta_ai_provider', ai.id);
                          localStorage.setItem('yuta_ai_url', ai.url);
                        }}
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
                      placeholder="https://gemini.google.com/app hoặc https://chatgpt.com..."
                      value={aiUrl}
                      onChange={(e) => {
                        setAiUrl(e.target.value);
                        localStorage.setItem('yuta_ai_url', e.target.value);
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

                {/* 3. Link Overleaf */}
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
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap justify-end">
                  {/* Mở bằng trình đọc PDF hệ thống */}
                  {progress.pdfPath && (
                    <button
                      onClick={handleOpenPdfFile}
                      className="flex items-center gap-1.5 px-4 py-2.5 bg-black text-[#FFED66] border-2 border-black text-xs font-black uppercase shadow-[3px_3px_0_0_rgba(0,0,0,1)] hover:bg-[#27272a] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all cursor-pointer"
                      title="Mở file PDF ngay lập tức bằng ứng dụng đọc PDF mặc định của máy bạn"
                    >
                      <Monitor className="w-4 h-4 stroke-[3]" /> Mở File PDF
                    </button>
                  )}

                  {/* Mở thư mục Downloads */}
                  <button
                    onClick={handleOpenDownloadsFolder}
                    className="flex items-center gap-1.5 px-3 py-2 bg-white text-black border-2 border-black text-xs font-black uppercase shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:bg-[#FFED66] hover:translate-x-[1px] hover:translate-y-[1px] transition-all cursor-pointer"
                    title="Mở thư mục chứa file PDF trên máy tính"
                  >
                    <FolderOpen className="w-4 h-4 stroke-[3]" /> Thư Mục
                  </button>

                  {/* Tải về trực tiếp */}
                  {progress.pdfUrl && (
                    <a
                      href={progress.pdfUrl}
                      download
                      className="flex items-center gap-1.5 px-3 py-2 bg-white text-black border-2 border-black text-xs font-black uppercase shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:bg-[#FFED66] hover:translate-x-[1px] hover:translate-y-[1px] transition-all cursor-pointer"
                    >
                      <Download className="w-4 h-4 stroke-[3]" /> Tải Về
                    </a>
                  )}

                  {/* Copy mã LaTeX */}
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

              {/* Embedded Live PDF Viewer */}
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
