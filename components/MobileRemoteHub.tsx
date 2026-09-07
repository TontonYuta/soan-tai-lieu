import React, { useState, useEffect } from 'react';
import { 
  Smartphone, 
  Play, 
  Square, 
  RefreshCw, 
  FileText, 
  Video, 
  CheckCircle2, 
  AlertCircle, 
  Download, 
  Copy, 
  Check, 
  ExternalLink,
  Sparkles,
  Layers,
  Terminal,
  Clock,
  Wifi,
  ChevronRight,
  Monitor,
  Globe,
  Lock,
  Unlock,
  KeyRound,
  ShieldAlert,
  Eye,
  Maximize2,
  Film
} from 'lucide-react';
import { AutomationClient, AutomationProgress, SharedAutomationState, NetworkInfo } from '../services/automationClient';
import { generateExamPrompt, generateWorksheetPrompt, generateVideoManimPrompt } from '../services/gemini';
import { AI_PROVIDERS, getProviderUrl } from '../services/aiProviders';

interface MobileRemoteHubProps {
  onSwitchToDesktop?: () => void;
}

export const MobileRemoteHub: React.FC<MobileRemoteHubProps> = ({ onSwitchToDesktop }) => {
  const [activeSubTab, setActiveSubTab] = useState<'create' | 'status' | 'results'>('create');
  
  // Form states
  const [workflowType, setWorkflowType] = useState<'worksheet' | 'exam' | 'video'>('worksheet');
  const [topic, setTopic] = useState('');
  const [subject, setSubject] = useState('Toán Học');
  const [grade, setGrade] = useState('Lớp 12');
  const [headless, setHeadless] = useState<boolean>(() => {
    return localStorage.getItem('yuta_headless') !== 'false';
  });

  const handleHeadlessToggle = (val: boolean) => {
    setHeadless(val);
    localStorage.setItem('yuta_headless', String(val));
  };

  // AI Provider & Model states
  const [selectedAi, setSelectedAi] = useState<string>(() => {
    return localStorage.getItem('yuta_ai_provider') || 'antigravity';
  });
  const currentAi = AI_PROVIDERS.find(p => p.id === selectedAi) || AI_PROVIDERS[0];

  const [selectedModel, setSelectedModel] = useState<string>(() => {
    const saved = localStorage.getItem(`yuta_ai_model_${selectedAi}`);
    if (saved && currentAi.models.some(m => m.id === saved)) return saved;
    return currentAi.models[0]?.id || '';
  });

  const currentModel = currentAi.models.find(m => m.id === selectedModel) || currentAi.models[0];

  // Sync & Progress states
  const [sharedState, setSharedState] = useState<SharedAutomationState | null>(null);
  const [currentProgress, setCurrentProgress] = useState<AutomationProgress | null>(null);
  const [copiedText, setCopiedText] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [netInfo, setNetInfo] = useState<NetworkInfo | null>(null);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [previewModal, setPreviewModal] = useState<{ type: 'pdf' | 'video'; url: string; title: string } | null>(null);

  // Render Mode (local vs overleaf)
  const [renderMode, setRenderMode] = useState<'local' | 'overleaf'>(() => {
    return (localStorage.getItem('yuta_render_mode') as 'local' | 'overleaf') || 'local';
  });

  const handleRenderModeToggle = (mode: 'local' | 'overleaf') => {
    setRenderMode(mode);
    localStorage.setItem('yuta_render_mode', mode);
  };

  // Quick Preset Topics
  const presetTopics = [
    'Hình học không gian - Khoảng cách & Góc (Lớp 11)',
    'Khảo sát hàm số & Cực trị (Lớp 12)',
    'Đề thi thử THPT Quốc Gia môn Toán (50 câu)',
    'Hoạt họa Manim: Định lý Pytago & Đồ thị Hàm số',
    'Tích phân & Ứng dụng tính Diện tích hình phẳng',
  ];

  // Poll state & heartbeat ping to desktop server
  useEffect(() => {
    const fetchState = async () => {
      await AutomationClient.pingMobile();
      const state = await AutomationClient.getCurrentState();
      if (state) {
        setSharedState(state);
        if (state.progress && state.progress.step) {
          setCurrentProgress(state.progress);
        }
      }
      const info = await AutomationClient.getNetworkInfo();
      if (info) {
        setNetInfo(info);
        if (info.hasPin && !isPinModalOpen) {
          const storedPin = localStorage.getItem('yuta_wan_pin') || '';
          if (storedPin) {
            AutomationClient.setSecurityPin(storedPin);
          }
        }
      }
    };

    fetchState();
    const interval = setInterval(fetchState, 2500);
    return () => clearInterval(interval);
  }, []);

  const handleVerifyPin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!pinInput.trim()) {
      setPinError('Vui lòng nhập PIN 4 số');
      return;
    }
    const success = await AutomationClient.verifyPin(pinInput.trim());
    if (success) {
      AutomationClient.setSecurityPin(pinInput.trim());
      localStorage.setItem('yuta_wan_pin', pinInput.trim());
      setIsPinModalOpen(false);
      setPinError('');
    } else {
      setPinError('Mã PIN không chính xác. Vui lòng thử lại!');
    }
  };

  const handleStartWorkflow = async () => {
    if (!topic.trim()) {
      alert('Vui lòng nhập chủ đề hoặc yêu cầu!');
      return;
    }

    setIsSubmitting(true);
    setActiveSubTab('status');

    let promptText = '';
    if (workflowType === 'worksheet') {
      promptText = generateWorksheetPrompt({
        subject,
        topic,
        grade,
        teacherName: 'Tonton Yuta',
        details: 'Tạo phiếu bài tập tự luận & trắc nghiệm đầy đủ mã LaTeX'
      });
    } else if (workflowType === 'exam') {
      promptText = generateExamPrompt({
        school: 'THPT Chuyên',
        examName: 'Đề Thi Thử Quốc Gia',
        year: '2025-2026',
        subject,
        topic,
        grade,
        time: 90,
        examFormat: 'standard2025',
        counts: { part1_mc: 12, part2_tf: 4, part3_sa: 6 },
        matrix: { lv1: 30, lv2: 40, lv3: 20, lv4: 10 },
        details: 'Kèm bảng đáp án và lời giải chi tiết theo chuẩn Bộ Giáo Dục'
      });
    } else {
      promptText = generateVideoManimPrompt({
        subject,
        topic,
        duration: '60s',
        tone: 'creative',
        audience: grade,
        format: 'vertical',
        simulationMode: 'geometry',
        details: 'Kịch bản và mã Python Manim CE 16:9 / 9:16 chuẩn animation'
      });
    }

    try {
      await AutomationClient.startPipeline(
        {
          prompt: promptText,
          topic,
          subject,
          headless,
          browserType: 'chrome',
          aiProvider: selectedAi,
          provider: selectedAi,
          model: selectedModel,
          modelName: currentModel?.name || selectedModel,
          aiUrl: getProviderUrl(selectedAi, selectedModel),
          renderMode,
        },
        (update) => {
          setCurrentProgress(update);
          if (update.step === 'COMPLETED') {
            setActiveSubTab('results');
          }
        }
      );
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStopWorkflow = async () => {
    if (confirm('Bạn có chắc chắn muốn dừng quy trình ngầm trên máy tính?')) {
      await AutomationClient.stop();
    }
  };

  const handleCopyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const isRunning = currentProgress?.step && currentProgress.step !== 'COMPLETED' && currentProgress.step !== 'ERROR' && currentProgress.step !== 'INIT';

  return (
    <div className="min-h-screen bg-[#F4F4F0] text-black pb-24 font-sans select-none">
      {/* Mobile Top Header */}
      <header className="sticky top-0 z-40 bg-white border-b-4 border-black p-4 shadow-[0_4px_0_0_rgba(0,0,0,1)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-[#FFED66] border-2 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
              <Smartphone className="w-5 h-5 text-black stroke-[3]" />
            </div>
            <div>
              <h1 className="text-base font-black uppercase tracking-wider text-black leading-none">
                Yuta<span className="text-[#00CECB]">!</span> Remote
              </h1>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="w-2 h-2 rounded-full bg-[#A3E635] animate-ping" />
                <span className="text-[10px] font-black text-gray-800 uppercase tracking-tight">
                  Máy tính chạy ngầm OK
                </span>
              </div>
            </div>
          </div>

          {onSwitchToDesktop && (
            <button
              onClick={onSwitchToDesktop}
              className="px-2.5 py-1 bg-[#00CECB] border-2 border-black text-[10px] font-black uppercase shadow-[2px_2px_0_0_rgba(0,0,0,1)] flex items-center gap-1 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
            >
              <Monitor className="w-3.5 h-3.5 stroke-[3]" />
              <span>Giao Diện PC</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main className="p-4 max-w-lg mx-auto space-y-4">
        {/* Connection & System Status Pill */}
        {(() => {
          const isCurrentWan = typeof window !== 'undefined' && 
            !['localhost', '127.0.0.1'].includes(window.location.hostname) &&
            !window.location.hostname.startsWith('192.168.') &&
            !window.location.hostname.startsWith('10.') &&
            !window.location.hostname.startsWith('172.');

          return (
            <div className="p-3 bg-white border-3 border-black shadow-[3px_3px_0_0_rgba(0,0,0,1)] flex items-center justify-between text-xs font-black">
              {isCurrentWan ? (
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-purple-600 stroke-[3] animate-pulse" />
                  <span>Kết Nối WAN 4G/5G: <span className="font-mono bg-[#FF90E8] text-black px-1 border border-black">Cloud Tunnel</span></span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Wifi className="w-4 h-4 text-emerald-600 stroke-[3]" />
                  <span>Mạng Wi-Fi LAN: <span className="font-mono bg-[#FFED66] text-black px-1 border border-black">Trực Tiếp (Không Qua Tunnel)</span></span>
                </div>
              )}

              {netInfo?.hasPin && (
                <button
                  onClick={() => setIsPinModalOpen(true)}
                  className="flex items-center gap-1 text-[10px] font-mono font-black uppercase bg-[#00CECB] px-2 py-0.5 border border-black shadow-[1px_1px_0_0_rgba(0,0,0,1)] cursor-pointer"
                >
                  <KeyRound className="w-3 h-3 stroke-[3]" />
                  <span>PIN Passcode</span>
                </button>
              )}
            </div>
          );
        })()}

        {/* Security PIN Passcode Entry Modal */}
        {isPinModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white border-4 border-black p-5 max-w-sm w-full shadow-[8px_8px_0_0_rgba(0,0,0,1)] space-y-4">
              <div className="flex items-center justify-between border-b-2 border-black pb-2">
                <div className="flex items-center gap-2">
                  <Lock className="w-5 h-5 text-red-600 stroke-[3]" />
                  <h3 className="text-sm font-black uppercase tracking-wider text-black">Bảo Mật PIN WAN Passcode</h3>
                </div>
                <button 
                  onClick={() => setIsPinModalOpen(false)}
                  className="px-2 py-0.5 border border-black text-xs font-black bg-gray-200 hover:bg-gray-300"
                >
                  ✕
                </button>
              </div>

              <p className="text-xs font-bold text-gray-700">
                Máy tính PC của bạn đã bật bảo vệ PIN cho điều khiển từ xa Internet. Vui lòng nhập PIN 4 chữ số để xác thực:
              </p>

              <form onSubmit={handleVerifyPin} className="space-y-3">
                <div>
                  <input
                    type="password"
                    maxLength={6}
                    value={pinInput}
                    onChange={(e) => {
                      setPinInput(e.target.value);
                      setPinError('');
                    }}
                    placeholder="Mã PIN (Ví dụ: 1234)"
                    className="w-full text-center text-xl font-mono font-black letter-spacing-2 p-3 bg-white border-3 border-black shadow-[3px_3px_0_0_rgba(0,0,0,1)] focus:outline-none placeholder:text-gray-400 placeholder:text-sm"
                    autoFocus
                  />
                  {pinError && (
                    <p className="text-[11px] font-black text-red-600 mt-1 flex items-center gap-1">
                      <ShieldAlert className="w-3.5 h-3.5 stroke-[3]" />
                      <span>{pinError}</span>
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    className="w-full py-3 bg-[#A3E635] text-black border-2 border-black font-black uppercase text-xs tracking-wider shadow-[3px_3px_0_0_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                  >
                    Xác Nhận PIN Passcode
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="grid grid-cols-3 gap-2 p-1.5 bg-black border-3 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
          <button
            onClick={() => setActiveSubTab('create')}
            className={`py-2.5 text-xs font-black uppercase tracking-wider transition-all flex flex-col items-center gap-1 ${
              activeSubTab === 'create'
                ? 'bg-[#FFED66] text-black border-2 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)]'
                : 'text-white hover:text-[#FFED66]'
            }`}
          >
            <Sparkles className="w-4 h-4 stroke-[3]" />
            <span>1. Khởi Tạo</span>
          </button>

          <button
            onClick={() => setActiveSubTab('status')}
            className={`py-2.5 text-xs font-black uppercase tracking-wider transition-all relative flex flex-col items-center gap-1 ${
              activeSubTab === 'status'
                ? 'bg-[#00CECB] text-black border-2 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)]'
                : 'text-white hover:text-[#00CECB]'
            }`}
          >
            <RefreshCw className={`w-4 h-4 stroke-[3] ${isRunning ? 'animate-spin' : ''}`} />
            <span>2. Tiến Trình</span>
            {isRunning && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#FF5E5B] rounded-full border border-black animate-ping" />
            )}
          </button>

          <button
            onClick={() => setActiveSubTab('results')}
            className={`py-2.5 text-xs font-black uppercase tracking-wider transition-all flex flex-col items-center gap-1 ${
              activeSubTab === 'results'
                ? 'bg-[#A3E635] text-black border-2 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)]'
                : 'text-white hover:text-[#A3E635]'
            }`}
          >
            <Download className="w-4 h-4 stroke-[3]" />
            <span>3. Kết Quả</span>
          </button>
        </div>

        {/* TAB 1: CREATE WORKFLOW */}
        {activeSubTab === 'create' && (
          <div className="bg-white border-3 border-black p-5 shadow-[5px_5px_0_0_rgba(0,0,0,1)] space-y-4">
            <div className="border-b-2 border-black pb-2">
              <h2 className="text-sm font-black uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#FF5E5B] stroke-[3]" />
                Chọn Loại Workflow Muốn Máy Tính Chạy Ngầm
              </h2>
            </div>

            {/* AI Provider & Model Selector Card */}
            <div className="p-3 bg-[#FFED66]/20 border-2 border-black space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase text-black flex items-center gap-1">
                  🤖 Chọn Động Cơ AI Xử Lý:
                </span>
                <span className={`px-2 py-0.5 text-[10px] font-black uppercase border border-black ${currentAi.bg} text-black`}>
                  {currentAi.icon} {currentAi.name}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-1.5">
                {AI_PROVIDERS.map((provider) => (
                  <button
                    key={provider.id}
                    type="button"
                    onClick={() => {
                      setSelectedAi(provider.id);
                      localStorage.setItem('yuta_ai_provider', provider.id);
                      const firstM = provider.models[0]?.id || '';
                      setSelectedModel(firstM);
                      localStorage.setItem(`yuta_ai_model_${provider.id}`, firstM);
                    }}
                    className={`p-2 border-2 border-black text-center text-xs font-black transition-all ${
                      selectedAi === provider.id
                        ? 'bg-black text-white shadow-[2px_2px_0_0_rgba(0,0,0,1)]'
                        : 'bg-white text-black hover:bg-gray-100'
                    }`}
                  >
                    <span className="mr-1">{provider.icon}</span>
                    <span>{provider.name}</span>
                  </button>
                ))}
              </div>

              {/* Model Selector Dropdown */}
              <div>
                <label className="text-[10px] font-black uppercase text-gray-800 block mb-1">
                  Mô hình suy luận (Model):
                </label>
                <select
                  value={selectedModel}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSelectedModel(val);
                    localStorage.setItem(`yuta_ai_model_${selectedAi}`, val);
                  }}
                  className="w-full p-2 bg-white border-2 border-black text-xs font-bold text-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] focus:outline-none"
                >
                  {currentAi.models.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} {m.badge ? `(${m.badge})` : ''}
                    </option>
                  ))}
                </select>
                {currentModel?.desc && (
                  <p className="text-[10px] font-medium text-gray-700 italic mt-1">
                    💡 {currentModel.desc}
                  </p>
                )}
              </div>
            </div>

            {/* Render Mode Card (Local Fast vs Overleaf Cloud) */}
            <div className="p-3 bg-[#00CECB]/20 border-2 border-black space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase text-black flex items-center gap-1">
                  ⚙️ Chọn Chế Độ Biên Dịch LaTeX:
                </span>
                <span className="text-[10px] font-mono font-bold bg-[#A3E635] text-black px-1.5 py-0.5 border border-black uppercase">
                  {renderMode === 'local' ? '⚡ Local Fast Render' : '☁️ Overleaf Cloud'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => handleRenderModeToggle('local')}
                  className={`p-2.5 border-2 border-black text-center text-xs font-black transition-all cursor-pointer ${
                    renderMode === 'local'
                      ? 'bg-[#A3E635] text-black shadow-[2px_2px_0_0_rgba(0,0,0,1)]'
                      : 'bg-white text-black hover:bg-gray-100'
                  }`}
                >
                  <span className="block text-xs mb-0.5">⚡ Local Máy Tính</span>
                  <span className="text-[9px] font-bold text-gray-700 block">Siêu Tốc (1-3s) • Ổn định 100%</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleRenderModeToggle('overleaf')}
                  className={`p-2.5 border-2 border-black text-center text-xs font-black transition-all cursor-pointer ${
                    renderMode === 'overleaf'
                      ? 'bg-[#00CECB] text-black shadow-[2px_2px_0_0_rgba(0,0,0,1)]'
                      : 'bg-white text-black hover:bg-gray-100'
                  }`}
                >
                  <span className="block text-xs mb-0.5">☁️ Overleaf Cloud</span>
                  <span className="text-[9px] font-bold text-gray-700 block">Đồng bộ link mây</span>
                </button>
              </div>
            </div>

            {/* Prominent Headless Mode Toggle Card */}
            <div className={`p-3 border-2 border-black transition-all flex items-center justify-between shadow-[3px_3px_0_0_rgba(0,0,0,1)] ${
              headless ? 'bg-[#A3E635]/20 border-black' : 'bg-[#FF90E8]/20 border-black'
            }`}>
              <div className="flex items-center gap-2.5">
                <div className={`p-2 border border-black shadow-[1px_1px_0_0_rgba(0,0,0,1)] ${headless ? 'bg-[#A3E635]' : 'bg-[#FF90E8]'}`}>
                  {headless ? <span className="text-base">👻</span> : <span className="text-base">👁️</span>}
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase text-black flex items-center gap-1.5">
                    <span>{headless ? '⚡ Chạy Hoàn Toàn Ẩn Ngầm (Headless)' : '🖥️ Hiện Màn Hình Trình Duyệt'}</span>
                  </h4>
                  <p className="text-[10px] font-bold text-gray-700 mt-0.5">
                    {headless ? 'Máy tính mở web ẩn trong nền, tự động tương tác không phiền bạn' : 'Trình duyệt Playwright sẽ hiện lên màn hình máy tính'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleHeadlessToggle(!headless)}
                className={`px-3 py-1.5 border-2 border-black text-xs font-black uppercase shadow-[2px_2px_0_0_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer ${
                  headless ? 'bg-[#A3E635] text-black' : 'bg-white text-black'
                }`}
              >
                {headless ? 'BẬT ẨN' : 'TẮT ẨN'}
              </button>
            </div>

            {/* Workflow Types */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setWorkflowType('worksheet')}
                className={`p-3 border-2 border-black text-center transition-all ${
                  workflowType === 'worksheet'
                    ? 'bg-[#FFED66] font-black shadow-[3px_3px_0_0_rgba(0,0,0,1)] -translate-y-0.5'
                    : 'bg-gray-50 font-bold hover:bg-gray-100'
                }`}
              >
                <FileText className="w-5 h-5 mx-auto mb-1 stroke-[2.5]" />
                <span className="text-[11px] uppercase block">Phiếu Bài Tập</span>
              </button>

              <button
                type="button"
                onClick={() => setWorkflowType('exam')}
                className={`p-3 border-2 border-black text-center transition-all ${
                  workflowType === 'exam'
                    ? 'bg-[#00CECB] font-black shadow-[3px_3px_0_0_rgba(0,0,0,1)] -translate-y-0.5'
                    : 'bg-gray-50 font-bold hover:bg-gray-100'
                }`}
              >
                <Layers className="w-5 h-5 mx-auto mb-1 stroke-[2.5]" />
                <span className="text-[11px] uppercase block">Đề Thi Chuẩn</span>
              </button>

              <button
                type="button"
                onClick={() => setWorkflowType('video')}
                className={`p-3 border-2 border-black text-center transition-all ${
                  workflowType === 'video'
                    ? 'bg-[#A3E635] font-black shadow-[3px_3px_0_0_rgba(0,0,0,1)] -translate-y-0.5'
                    : 'bg-gray-50 font-bold hover:bg-gray-100'
                }`}
              >
                <Video className="w-5 h-5 mx-auto mb-1 stroke-[2.5]" />
                <span className="text-[11px] uppercase block">Video Manim</span>
              </button>
            </div>

            {/* Input Subject & Grade */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-black uppercase block mb-1">Môn Học</label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full p-2.5 bg-white border-2 border-black font-bold text-xs shadow-[2px_2px_0_0_rgba(0,0,0,1)] focus:outline-none"
                >
                  <option value="Toán Học">Toán Học</option>
                  <option value="Vật Lý">Vật Lý</option>
                  <option value="Hóa Học">Hóa Học</option>
                  <option value="Tiếng Anh">Tiếng Anh</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-black uppercase block mb-1">Khối Lớp</label>
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="w-full p-2.5 bg-white border-2 border-black font-bold text-xs shadow-[2px_2px_0_0_rgba(0,0,0,1)] focus:outline-none"
                >
                  <option value="Lớp 12">Lớp 12</option>
                  <option value="Lớp 11">Lớp 11</option>
                  <option value="Lớp 10">Lớp 10</option>
                  <option value="Ôn Thi ĐH">Ôn Thi ĐH</option>
                </select>
              </div>
            </div>

            {/* Topic Input */}
            <div>
              <label className="text-[11px] font-black uppercase block mb-1">
                Chủ Đề Hoặc Yêu Cầu Chi Tiết:
              </label>
              <textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Ví dụ: Khảo sát hàm số bậc 3, 10 bài tập phân loại vận dụng cao kèm lời giải LaTeX chi tiết..."
                rows={4}
                className="w-full p-3 bg-white border-2 border-black text-xs font-bold shadow-[3px_3px_0_0_rgba(0,0,0,1)] focus:outline-none placeholder:text-gray-400 resize-none"
              />
            </div>

            {/* Presets */}
            <div>
              <label className="text-[10px] font-black uppercase text-gray-700 block mb-1.5">
                ⚡ Gợi ý chủ đề nhanh:
              </label>
              <div className="space-y-1.5">
                {presetTopics.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setTopic(p)}
                    className="w-full text-left p-2 bg-[#00CECB]/10 border border-black hover:bg-[#00CECB]/30 text-[11px] font-bold transition-all flex items-center justify-between"
                  >
                    <span className="truncate">{p}</span>
                    <ChevronRight className="w-3.5 h-3.5 shrink-0 stroke-[3]" />
                  </button>
                ))}
              </div>
            </div>

            {/* Headless Option */}
            <div className="p-3 bg-gray-100 border-2 border-black flex items-center justify-between">
              <div>
                <span className="text-xs font-black uppercase block">Chế độ máy tính:</span>
                <span className="text-[10px] font-bold text-gray-600">
                  {headless ? '👻 Chạy hoàn toàn ẩn ngầm trên máy tính' : '👁️ Hiển thị màn hình trình duyệt'}
                </span>
              </div>
              <input
                type="checkbox"
                checked={headless}
                onChange={(e) => setHeadless(e.target.checked)}
                className="w-5 h-5 accent-black border-2 border-black rounded-none cursor-pointer"
              />
            </div>

            {/* Trigger Button */}
            <button
              onClick={handleStartWorkflow}
              disabled={isSubmitting || isRunning}
              className={`w-full py-4 border-3 border-black font-black uppercase text-sm tracking-wider flex items-center justify-center gap-2 shadow-[4px_4px_0_0_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all cursor-pointer ${
                isRunning
                  ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                  : 'bg-[#FF5E5B] hover:bg-[#FF3333] text-white'
              }`}
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin stroke-[3]" />
                  <span>Đang Đẩy Lệnh Tới Máy Tính...</span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 fill-current stroke-[3]" />
                  <span>🚀 Kích Hoạt Workflow Ngầm Trên Máy Tính</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* TAB 2: LIVE PROGRESS */}
        {activeSubTab === 'status' && (
          <div className="bg-white border-3 border-black p-5 shadow-[5px_5px_0_0_rgba(0,0,0,1)] space-y-4">
            <div className="border-b-2 border-black pb-2 flex items-center justify-between">
              <h2 className="text-sm font-black uppercase tracking-wider flex items-center gap-2">
                <RefreshCw className={`w-4 h-4 text-emerald-600 stroke-[3] ${isRunning ? 'animate-spin' : ''}`} />
                Tiến Trình Đang Chạy Ngầm Trên PC
              </h2>
              {isRunning && (
                <span className="px-2 py-0.5 bg-[#FF5E5B] text-white text-[10px] font-black uppercase animate-pulse">
                  Live Streaming
                </span>
              )}
            </div>

            {/* Step & Progress Bar */}
            <div className="p-4 bg-gray-50 border-2 border-black space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-black">Trạng Thái:</span>
                <span className="text-xs font-mono font-black text-blue-700 bg-blue-100 px-2 py-0.5 border border-black">
                  {currentProgress?.step || 'CHỜ KÍCH HOẠT'}
                </span>
              </div>

              {/* Progress percentage bar */}
              <div className="w-full bg-gray-200 border-2 border-black h-5 relative overflow-hidden">
                <div
                  className="bg-[#A3E635] h-full transition-all duration-500 border-r-2 border-black"
                  style={{ width: `${currentProgress?.progress || 0}%` }}
                />
                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black font-mono">
                  {currentProgress?.progress || 0}%
                </span>
              </div>

              <div className="p-2.5 bg-white border border-black text-xs font-bold text-gray-800">
                💬 {currentProgress?.message || 'Sẵn sàng nhận lệnh từ điện thoại...'}
              </div>
            </div>

            {/* Live Terminal Logs */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-black uppercase">
                <span className="flex items-center gap-1">
                  <Terminal className="w-4 h-4 stroke-[3]" />
                  Log Thời Gian Thực Từ PC:
                </span>
                <span className="text-[10px] font-mono text-gray-500">
                  {sharedState?.logs?.length || 0} dòng log
                </span>
              </div>

              <div className="p-3 bg-black text-emerald-400 font-mono text-[11px] h-48 overflow-y-auto border-2 border-black space-y-1 select-text">
                {sharedState?.logs && sharedState.logs.length > 0 ? (
                  sharedState.logs.map((log, index) => (
                    <div key={index} className="leading-relaxed whitespace-pre-wrap border-b border-gray-900 pb-0.5">
                      {log}
                    </div>
                  ))
                ) : (
                  <div className="text-gray-500 italic py-4 text-center">
                    [Chưa có log hệ thống. Nhấn Kích Hoạt để bắt đầu chạy quy trình.]
                  </div>
                )}
              </div>
            </div>

            {/* Action buttons */}
            {isRunning && (
              <button
                onClick={handleStopWorkflow}
                className="w-full py-3 bg-[#FF5E5B] hover:bg-[#FF3333] text-white border-2 border-black font-black uppercase text-xs tracking-wider flex items-center justify-center gap-2 shadow-[3px_3px_0_0_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none cursor-pointer"
              >
                <Square className="w-4 h-4 fill-current stroke-[3]" />
                <span>Dừng Quy Trình Trên Máy Tính</span>
              </button>
            )}
          </div>
        )}

        {/* TAB 3: RESULTS & DOWNLOADS */}
        {activeSubTab === 'results' && (
          <div className="bg-white border-3 border-black p-5 shadow-[5px_5px_0_0_rgba(0,0,0,1)] space-y-4">
            <div className="border-b-2 border-black pb-2 flex items-center justify-between">
              <h2 className="text-sm font-black uppercase tracking-wider flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 stroke-[3]" />
                Kết Quả & Review Sản Phẩm
              </h2>
              <span className="text-[10px] font-mono font-bold bg-[#A3E635] text-black px-2 py-0.5 border border-black uppercase">
                Ready Live
              </span>
            </div>

            {/* Results Review Section */}
            <div className="space-y-4">
              {/* 1. PDF REVIEW SECTION */}
              {currentProgress?.pdfUrl || currentProgress?.pdfPreviewUrl || (currentProgress?.pdfPath && currentProgress.pdfPath.endsWith('.pdf')) ? (
                (() => {
                  const pdfTargetUrl = currentProgress.pdfUrl || (currentProgress.pdfPath ? `/api/view-pdf?path=${encodeURIComponent(currentProgress.pdfPath)}` : '#');
                  return (
                    <div className="p-3 bg-[#A3E635]/20 border-3 border-black space-y-3 shadow-[3px_3px_0_0_rgba(0,0,0,1)]">
                      <div className="flex items-center justify-between text-xs font-black">
                        <span className="flex items-center gap-1.5 text-black">
                          <FileText className="w-4 h-4 text-emerald-700 stroke-[3]" />
                          PDF Review (Tài Liệu LaTeX):
                        </span>
                        <button
                          onClick={() => setPreviewModal({ 
                            type: 'pdf', 
                            url: currentProgress.pdfPreviewUrl || pdfTargetUrl, 
                            title: 'Review Tài Liệu PDF LaTeX' 
                          })}
                          className="px-2 py-1 bg-white border border-black text-[10px] font-black uppercase flex items-center gap-1 shadow-[1px_1px_0_0_rgba(0,0,0,1)] hover:bg-gray-100 cursor-pointer"
                        >
                          <Maximize2 className="w-3 h-3 stroke-[3]" />
                          <span>Phóng To</span>
                        </button>
                      </div>

                      {/* Embedded PDF / Image Live Viewer */}
                      <div className="border-2 border-black bg-white overflow-hidden relative shadow-[2px_2px_0_0_rgba(0,0,0,1)] flex items-center justify-center min-h-[200px]">
                        {currentProgress.pdfPreviewUrl ? (
                          <div 
                            className="w-full cursor-pointer p-1 bg-white flex flex-col items-center"
                            onClick={() => setPreviewModal({ type: 'pdf', url: currentProgress.pdfPreviewUrl || pdfTargetUrl, title: 'Review Tài Liệu PDF' })}
                          >
                            <img
                              src={currentProgress.pdfPreviewUrl}
                              alt="PDF Preview Trang 1"
                              className="w-full h-auto max-h-[380px] object-contain border border-gray-300 shadow-sm"
                            />
                            <span className="text-[10px] font-bold text-gray-500 mt-1">
                              🔍 Nhấn vào ảnh để xem phóng to chi tiết
                            </span>
                          </div>
                        ) : (
                          <iframe
                            src={`${pdfTargetUrl}#toolbar=0&navpanes=0`}
                            className="w-full h-80 border-none bg-white"
                            title="PDF Review"
                          />
                        )}
                      </div>

                      {/* Actions Bar for PDF */}
                      <div className="grid grid-cols-2 gap-2">
                        <a
                          href={pdfTargetUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="py-2.5 bg-white text-black border-2 border-black font-black uppercase text-[11px] flex items-center justify-center gap-1 shadow-[2px_2px_0_0_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                        >
                          <ExternalLink className="w-3.5 h-3.5 stroke-[3]" />
                          <span>Mở File PDF</span>
                        </a>

                        <a
                          href={pdfTargetUrl}
                          target="_blank"
                          rel="noreferrer"
                          download
                          className="py-2.5 bg-[#A3E635] text-black border-2 border-black font-black uppercase text-[11px] flex items-center justify-center gap-1 shadow-[2px_2px_0_0_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                        >
                          <Download className="w-3.5 h-3.5 stroke-[3]" />
                          <span>Tải PDF Về Máy</span>
                        </a>
                      </div>
                    </div>
                  );
                })()
              ) : null}

              {/* 2. VIDEO REVIEW SECTION */}
              {currentProgress?.videoUrl ? (
                <div className="p-3 bg-[#00CECB]/20 border-3 border-black space-y-3 shadow-[3px_3px_0_0_rgba(0,0,0,1)]">
                  <div className="flex items-center justify-between text-xs font-black">
                    <span className="flex items-center gap-1.5 text-black">
                      <Film className="w-4 h-4 text-blue-700 stroke-[3]" />
                      Video Review (Manim CE Animation):
                    </span>
                    <button
                      onClick={() => setPreviewModal({ type: 'video', url: currentProgress.videoUrl!, title: 'Review Video Animation Manim MP4' })}
                      className="px-2 py-1 bg-white border border-black text-[10px] font-black uppercase flex items-center gap-1 shadow-[1px_1px_0_0_rgba(0,0,0,1)] hover:bg-gray-100 cursor-pointer"
                    >
                      <Maximize2 className="w-3 h-3 stroke-[3]" />
                      <span>Phóng To</span>
                    </button>
                  </div>

                  {/* Interactive Video Player */}
                  <div className="border-2 border-black bg-black overflow-hidden shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
                    <video
                      src={currentProgress.videoUrl}
                      controls
                      playsInline
                      className="w-full max-h-72 object-contain bg-black"
                    />
                  </div>

                  {/* Actions Bar for Video */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setPreviewModal({ type: 'video', url: currentProgress.videoUrl!, title: 'Review Video Animation Manim MP4' })}
                      className="py-2.5 bg-white text-black border-2 border-black font-black uppercase text-[11px] flex items-center justify-center gap-1 shadow-[2px_2px_0_0_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                    >
                      <Play className="w-3.5 h-3.5 fill-current stroke-[3]" />
                      <span>Xem Fullscreen</span>
                    </button>

                    <a
                      href={currentProgress.videoUrl}
                      target="_blank"
                      rel="noreferrer"
                      download
                      className="py-2.5 bg-[#00CECB] text-black border-2 border-black font-black uppercase text-[11px] flex items-center justify-center gap-1 shadow-[2px_2px_0_0_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                    >
                      <Download className="w-3.5 h-3.5 stroke-[3]" />
                      <span>Tải MP4 Về Máy</span>
                    </a>
                  </div>
                </div>
              ) : null}

              {!currentProgress?.pdfUrl && !currentProgress?.videoUrl && (
                <div className="p-5 bg-yellow-50 border-3 border-black text-xs font-bold text-gray-800 text-center space-y-2 shadow-[3px_3px_0_0_rgba(0,0,0,1)]">
                  <div className="text-2xl">📑🎬</div>
                  <p className="font-black text-sm uppercase">Chưa Có Sản Phẩm Review</p>
                  <p className="text-[11px] text-gray-600">
                    Sau khi máy tính chạy xong quy trình ngầm, cả **PDF Review** và **Video Review** xuất ra sẽ tự động hiển thị tại đây để bạn xem trực tiếp & tải về điện thoại!
                  </p>
                </div>
              )}
            </div>

            {/* LaTeX or Manim Source Code Preview & Copy */}
            {(currentProgress?.latexCode || currentProgress?.manimCode) && (
              <div className="space-y-2 pt-3 border-t-2 border-black">
                <div className="flex items-center justify-between text-xs font-black uppercase">
                  <span>Mã Nguồn ({currentProgress.latexCode ? 'LaTeX' : 'Manim Python'})</span>
                  <button
                    onClick={() => handleCopyCode(currentProgress.latexCode || currentProgress.manimCode || '')}
                    className="px-2.5 py-1 bg-[#FFED66] border border-black text-[10px] font-black uppercase flex items-center gap-1 shadow-[1px_1px_0_0_rgba(0,0,0,1)] cursor-pointer"
                  >
                    {copiedText ? <Check className="w-3 h-3 stroke-[3]" /> : <Copy className="w-3 h-3 stroke-[3]" />}
                    <span>{copiedText ? 'Đã Copy' : 'Copy Mã'}</span>
                  </button>
                </div>
                <pre className="p-3 bg-gray-900 text-gray-100 font-mono text-[10px] max-h-48 overflow-y-auto border-2 border-black whitespace-pre-wrap select-text">
                  {currentProgress.latexCode || currentProgress.manimCode}
                </pre>
              </div>
            )}
          </div>
        )}

        {/* Fullscreen Review Modal for PDF & Video */}
        {previewModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col p-2 md:p-6 animate-fadeIn select-text">
            <div className="bg-white border-4 border-black flex-1 flex flex-col shadow-[8px_8px_0_0_rgba(0,0,0,1)] overflow-hidden">
              {/* Modal Header */}
              <div className="p-3 bg-[#FFED66] border-b-3 border-black flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {previewModal.type === 'pdf' ? (
                    <FileText className="w-5 h-5 text-black stroke-[3]" />
                  ) : (
                    <Film className="w-5 h-5 text-black stroke-[3]" />
                  )}
                  <h3 className="text-xs font-black uppercase tracking-wider text-black truncate">
                    {previewModal.title}
                  </h3>
                </div>
                <button
                  onClick={() => setPreviewModal(null)}
                  className="px-3 py-1 bg-black text-white border-2 border-black text-xs font-black uppercase active:scale-95 cursor-pointer"
                >
                  Đóng ✕
                </button>
              </div>

              {/* Modal Content View */}
              <div className="flex-1 bg-gray-100 flex items-center justify-center p-2 overflow-auto relative">
                {previewModal.type === 'pdf' ? (
                  previewModal.url.endsWith('.png') || currentProgress?.pdfPreviewUrl ? (
                    <div className="w-full h-full overflow-auto flex justify-center items-start p-2">
                      <img
                        src={previewModal.url.endsWith('.png') ? previewModal.url : (currentProgress?.pdfPreviewUrl || previewModal.url)}
                        alt="PDF Preview Zoom"
                        className="max-w-none w-auto h-auto min-w-[320px] max-h-[90vh] object-contain border-2 border-black bg-white shadow-md"
                      />
                    </div>
                  ) : (
                    <iframe
                      src={`${previewModal.url}#toolbar=1`}
                      className="w-full h-full border-none bg-white"
                      title="Fullscreen PDF Review"
                    />
                  )
                ) : (
                  <video
                    src={previewModal.url}
                    controls
                    autoPlay
                    playsInline
                    className="w-full h-full object-contain bg-black"
                  />
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-3 bg-white border-t-3 border-black flex items-center justify-between gap-2">
                <span className="text-[10px] font-mono font-bold text-gray-600 truncate">
                  {previewModal.url}
                </span>
                <a
                  href={previewModal.url}
                  target="_blank"
                  rel="noreferrer"
                  download
                  className="px-4 py-2 bg-[#A3E635] text-black border-2 border-black font-black uppercase text-xs shadow-[2px_2px_0_0_rgba(0,0,0,1)] flex items-center gap-1.5 shrink-0"
                >
                  <Download className="w-4 h-4 stroke-[3]" />
                  <span>Tải Về</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Sticky Action Quick Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t-4 border-black p-3 shadow-[0_-4px_0_0_rgba(0,0,0,1)]">
        <div className="max-w-lg mx-auto flex items-center justify-between gap-2">
          <div className="text-[10px] font-black uppercase text-gray-700">
            <div>Server PC: <span className="text-emerald-700">Online</span></div>
            <div>Remote Mode Active</div>
          </div>
          <button
            onClick={() => setActiveSubTab('create')}
            className="px-4 py-2 bg-[#FFED66] border-2 border-black font-black uppercase text-xs shadow-[2px_2px_0_0_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none flex items-center gap-1"
          >
            <Sparkles className="w-4 h-4 stroke-[3]" />
            <span>Tạo Mới</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileRemoteHub;
