import React, { useState, useEffect } from 'react';
import { 
  Video as VideoIcon, Clock, Users, Layout, Wand2, Info, 
  Code, ChevronDown, BookOpen, Film, Smartphone, 
  Monitor, Sparkles, Sliders, Layers, Zap, ListVideo, Cpu, Mic
} from "lucide-react";
import { VideoConfig, GenerationStatus } from '../types';
import { AI_PROVIDERS, getProviderUrl } from './AutomationModal';

interface VideoFormProps {
  onSubmitScript?: (data: VideoConfig) => void;
  onSubmitManim: (data: VideoConfig) => void;
  onDirectAutomateScript?: (data: VideoConfig) => void;
  onDirectAutomateManim?: (data: VideoConfig) => void;
  status: GenerationStatus;
  contextTopic?: string;
  contextSubject?: string;
}

const VideoForm: React.FC<VideoFormProps> = ({ 
  onSubmitScript, 
  onSubmitManim, 
  onDirectAutomateScript, 
  onDirectAutomateManim, 
  status, 
  contextTopic, 
  contextSubject 
}) => {
  const [config, setConfig] = useState<VideoConfig>({
    subject: contextSubject || 'Toán học',
    topic: contextTopic || 'Ý nghĩa hình học của Tích phân & Đạo hàm',
    duration: '60 giây (Shorts)',
    tone: 'simple',
    audience: 'Học sinh & Người tự học',
    format: 'vertical',
    renderQuality: '1080p',
    fps: 60,
    safeZoneShorts: true,
    details: '',
    hookType: 'visual_intuition',
    simulationMode: 'general',
    fontStyle: 'serif',
    isSeries: false,
    seriesCount: 3,
    seriesOutline: '',
    enableVoice: true,
    voiceName: 'vi-VN-HoaiMyNeural',
    voiceSpeed: '+0%'
  });

  useEffect(() => {
    if (contextTopic || contextSubject) {
      setConfig(prev => ({
        ...prev,
        topic: contextTopic || prev.topic,
        subject: contextSubject || prev.subject
      }));
    }
  }, [contextTopic, contextSubject]);

  const isLoading = status === GenerationStatus.LOADING;
  const isVertical = config.format === 'vertical';
  const isSeries = Boolean(config.isSeries);

  const [selectedAi, setSelectedAi] = useState<string>(
    () => localStorage.getItem('yuta_ai_provider') || 'antigravity'
  );
  const currentAi = AI_PROVIDERS.find(p => p.id === selectedAi) || AI_PROVIDERS[0];
  const [selectedModel, setSelectedModel] = useState<string>(() => {
    const saved = localStorage.getItem(`yuta_ai_model_${selectedAi}`);
    if (saved && currentAi.models.some(m => m.id === saved)) return saved;
    return currentAi.models[0]?.id || '';
  });

  const handleAiChange = (newAi: string) => {
    setSelectedAi(newAi);
    localStorage.setItem('yuta_ai_provider', newAi);
    const prov = AI_PROVIDERS.find(p => p.id === newAi) || AI_PROVIDERS[0];
    const savedMod = localStorage.getItem(`yuta_ai_model_${newAi}`) || prov.models[0]?.id || '';
    setSelectedModel(savedMod);
    const targetUrl = getProviderUrl(newAi, savedMod);
    localStorage.setItem('yuta_ai_url', targetUrl);
    localStorage.setItem(`yuta_ai_url_${newAi}`, targetUrl);
  };

  const handleModelChange = (newModel: string) => {
    setSelectedModel(newModel);
    localStorage.setItem(`yuta_ai_model_${selectedAi}`, newModel);
    const targetUrl = getProviderUrl(selectedAi, newModel);
    localStorage.setItem('yuta_ai_url', targetUrl);
    localStorage.setItem(`yuta_ai_url_${selectedAi}`, targetUrl);
  };

  useEffect(() => {
    const saved = localStorage.getItem(`yuta_ai_model_${selectedAi}`);
    if (!saved || !currentAi.models.some(m => m.id === saved)) {
      const defaultId = currentAi.models[0]?.id || '';
      setSelectedModel(defaultId);
      localStorage.setItem(`yuta_ai_model_${selectedAi}`, defaultId);
    }
  }, [selectedAi]);

  const handleChange = (field: keyof VideoConfig, value: any) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const inputClass = "w-full pl-10 pr-4 py-2.5 bg-[#ffffff] rounded-none border-[3px] border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] focus:ring-0 focus:translate-y-1 focus:translate-x-1 focus:shadow-none transition-all text-sm font-bold text-black placeholder:text-gray-500 uppercase";
  const selectClass = "w-full pl-10 pr-8 py-2.5 bg-[#ffffff] rounded-none border-[3px] border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] focus:ring-0 focus:translate-y-1 focus:translate-x-1 focus:shadow-none transition-all text-sm font-bold text-black uppercase cursor-pointer appearance-none";
  const labelClass = "block text-xs font-black text-black mb-1.5 uppercase tracking-widest";
  const iconClass = "pointer-events-none absolute left-3.5 top-[13px] w-4 h-4 text-black font-black";

  return (
    <div className="bg-[#ffffff] rounded-none shadow-[8px_8px_0_0_rgba(0,0,0,1)] border-4 border-black p-6 lg:p-8 h-fit sticky top-28 overflow-y-auto max-h-[calc(100vh-9rem)] scrollbar-hide">
      
      {/* Header */}
      <div className="flex items-center gap-4 mb-6 border-b-4 border-black pb-4">
        <div className="w-12 h-12 bg-[#9333EA] flex items-center justify-center text-white border-4 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] rounded-none">
          <Film className="w-6 h-6 stroke-[3]" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-black uppercase tracking-widest">Video & Manim Studio</h2>
          <p className="text-xs text-black font-bold uppercase tracking-wider">Diễn Hoạt Khoa Học & Tri Thức Trực Quan (1-Click AI)</p>
        </div>
      </div>

      {/* Mode Switcher: Video Đơn vs Chuỗi Playlist */}
      <div className="mb-6 p-1.5 bg-[#FFED66] border-[3px] border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => handleChange('isSeries', false)}
            className={`py-2.5 px-3 text-center border-2 border-black text-xs font-black uppercase transition-all cursor-pointer flex items-center justify-center gap-2
              ${!isSeries
                ? 'bg-black text-white shadow-none translate-x-[2px] translate-y-[2px]' 
                : 'bg-white text-black hover:bg-white/80 shadow-[2px_2px_0_0_rgba(0,0,0,1)]'}`}
          >
            <Film className="w-4 h-4 stroke-[3]" />
            <span>🎬 Video Đơn (1 Tập)</span>
          </button>

          <button
            type="button"
            onClick={() => handleChange('isSeries', true)}
            className={`py-2.5 px-3 text-center border-2 border-black text-xs font-black uppercase transition-all cursor-pointer flex items-center justify-center gap-2
              ${isSeries 
                ? 'bg-[#9333EA] text-white shadow-none translate-x-[2px] translate-y-[2px]' 
                : 'bg-white text-black hover:bg-white/80 shadow-[2px_2px_0_0_rgba(0,0,0,1)]'}`}
          >
            <ListVideo className="w-4 h-4 stroke-[3]" />
            <span>📚 Chuỗi Playlist ({config.seriesCount || 3} Tập)</span>
          </button>
        </div>
      </div>

      <div className="space-y-6">
        
        {/* SECTION: CONFIG */}
        <div className="p-5 bg-[#ffffff] border-[3px] border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] space-y-4">
          <div className="flex items-center gap-2 mb-2 pb-3 border-b-4 border-black">
            <div className="w-6 h-6 bg-[#A3E635] border-2 border-black flex items-center justify-center text-black">
              <Info className="w-3.5 h-3.5 stroke-[3]" />
            </div>
            <h3 className="text-sm font-black text-black uppercase tracking-wider">
              {isSeries ? 'Cấu hình Chuỗi Playlist' : 'Cấu hình Video & Định dạng'}
            </h3>
          </div>

          <div className="space-y-4">
            {/* Format Selection Cards */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  handleChange('format', 'vertical');
                  if (!isSeries) handleChange('duration', '60 giây (Shorts)');
                }}
                className={`p-3 border-2 border-black flex flex-col items-center gap-2 transition-all cursor-pointer text-center
                  ${isVertical 
                    ? 'bg-[#9333EA] text-white shadow-[4px_4px_0_0_rgba(0,0,0,1)]' 
                    : 'bg-[#ffffff] text-black hover:bg-[#FFECA1] shadow-[2px_2px_0_0_rgba(0,0,0,1)]'}`}
              >
                <Smartphone className="w-6 h-6 stroke-[3]" />
                <span className="text-xs font-black uppercase">Dọc 9:16 (Shorts/TikTok)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  handleChange('format', 'horizontal');
                  if (!isSeries) handleChange('duration', '3 - 5 phút');
                }}
                className={`p-3 border-2 border-black flex flex-col items-center gap-2 transition-all cursor-pointer text-center
                  ${!isVertical 
                    ? 'bg-[#9333EA] text-white shadow-[4px_4px_0_0_rgba(0,0,0,1)]' 
                    : 'bg-[#ffffff] text-black hover:bg-[#FFECA1] shadow-[2px_2px_0_0_rgba(0,0,0,1)]'}`}
              >
                <Monitor className="w-6 h-6 stroke-[3]" />
                <span className="text-xs font-black uppercase">Ngang 16:9 (YouTube)</span>
              </button>
            </div>

            {/* Môn học & Thời lượng */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="group relative">
                <label className={labelClass}>Môn học / Lĩnh vực</label>
                <div className="relative">
                  <BookOpen className={iconClass} />
                  <input
                    type="text"
                    className={inputClass}
                    placeholder="Toán học, Vật lý, Tin học, Hóa học..."
                    value={config.subject}
                    onChange={e => handleChange('subject', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="group relative">
                <label className={labelClass}>{isSeries ? 'Thời lượng mỗi tập' : 'Thời lượng'}</label>
                <div className="relative">
                  <Clock className={iconClass} />
                  <input
                    type="text"
                    className={inputClass}
                    placeholder="60 giây, 2 - 3 phút..."
                    value={config.duration}
                    onChange={e => handleChange('duration', e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Tên chủ đề */}
            <div className="group relative">
              <label className={labelClass}>
                {isSeries ? 'Tên Chuyên Đề / Khóa Học Cần Sản Xuất' : 'Chủ đề kiến thức cần diễn hoạt'}
              </label>
              <div className="relative">
                <Layout className={iconClass} />
                <input
                  type="text"
                  className={inputClass}
                  placeholder={isSeries ? "Vd: Khóa học 5 tập về Hình học Không gian Oxyz, Chuỗi 3 tập về Machine Learning..." : "Vd: Quỹ đạo ném xiên, Ý nghĩa hình học Đạo hàm, Mạng nơ-ron..."}
                  value={config.topic}
                  onChange={e => handleChange('topic', e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Series count selector when in Playlist mode */}
            {isSeries && (
              <div className="p-4 bg-[#FFED66]/40 border-2 border-black space-y-3">
                <label className={labelClass}>Số lượng tập trong Playlist</label>
                <div className="flex items-center gap-2 flex-wrap">
                  {[2, 3, 4, 5, 6, 8, 10].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => handleChange('seriesCount', num)}
                      className={`px-3 py-1.5 border-2 border-black text-xs font-black uppercase transition-all cursor-pointer
                        ${(config.seriesCount || 3) === num 
                          ? 'bg-black text-white shadow-none translate-x-[1px] translate-y-[1px]' 
                          : 'bg-white text-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:bg-[#FFECA1]'}`}
                    >
                      {num} Tập
                    </button>
                  ))}
                </div>

                <div className="mt-2">
                  <label className="block text-[11px] font-black text-black mb-1 uppercase">
                    Đề cương chi tiết từng tập (Tùy chọn - Để trống để AI tự động phân bổ):
                  </label>
                  <textarea
                    className="w-full p-2.5 bg-white border-2 border-black text-xs font-medium text-black placeholder:text-gray-500 min-h-[75px]"
                    placeholder="Tập 1: Giới thiệu trực quan & khái niệm cơ bản&#10;Tập 2: Công thức và quy tắc then chốt&#10;Tập 3: Bài toán thực tế và ứng dụng nâng cao..."
                    value={config.seriesOutline || ''}
                    onChange={e => handleChange('seriesOutline', e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Hook Strategy Selector for Single Video */}
            {!isSeries && (
              <div className="group relative">
                <label className={labelClass}>Chiến lược Mở đầu (Hook 3s giữ chân người xem)</label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {[
                    { id: 'visual_intuition', label: '💡 Trực quan hóa', desc: 'Bản chất trực giác' },
                    { id: 'trap', label: '⚠️ Bẫy & Nghịch lý', desc: 'Cảnh báo sai lầm' },
                    { id: 'fast_trick', label: '⚡ Mẹo nhớ 30s', desc: 'Ứng dụng tức thì' },
                    { id: 'real_world', label: '🌍 Ứng dụng thực tế', desc: 'Hiện tượng đời sống' }
                  ].map(h => (
                    <button
                      key={h.id}
                      type="button"
                      onClick={() => handleChange('hookType', h.id)}
                      className={`p-2 border-2 border-black text-left transition-all cursor-pointer ${
                        (config.hookType || 'visual_intuition') === h.id
                          ? 'bg-[#FFED66] text-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] translate-x-[1px] translate-y-[1px]'
                          : 'bg-white text-black hover:bg-slate-100'
                      }`}
                    >
                      <div className="text-[11px] font-black uppercase">{h.label}</div>
                      <div className="text-[9px] font-bold text-gray-600">{h.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Bộ Form Mô Phỏng Chuyên Môn */}
            <div className="group relative">
              <label className={labelClass}>🎭 Bộ Form Mô Phỏng Chuyên Môn (Mẫu Diễn Hoạt)</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { id: 'geometry', label: '📐 Hình học & Vector', desc: 'Tọa độ, khối 3D, mặt phẳng' },
                  { id: 'dialogue', label: '🎙️ Đối thoại 2 Người', desc: 'Thầy & Trò Q&A sư phạm' },
                  { id: 'calculus', label: '📊 Giải tích & Hàm số', desc: 'Đồ thị, tiếp tuyến, tích phân' },
                  { id: 'fast_tricks', label: '⚡ Mẹo & Giải nhanh', desc: 'So sánh 2 cột: Bẫy vs Mẹo 30s' },
                  { id: 'stem', label: '🧪 STEM & Vật lý - Hóa', desc: 'Quỹ đạo, mô hình phân tử' },
                  { id: 'general', label: '🎓 Bài giảng Tổng hợp', desc: 'Bố cục Dual-Zone chuẩn' }
                ].map(m => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => handleChange('simulationMode', m.id)}
                    className={`p-2.5 border-2 border-black text-left transition-all cursor-pointer ${
                      (config.simulationMode || 'general') === m.id
                        ? 'bg-[#00CECB] text-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] translate-x-[1px] translate-y-[1px]'
                        : 'bg-white text-black hover:bg-slate-100'
                    }`}
                  >
                    <div className="text-[11px] font-black uppercase">{m.label}</div>
                    <div className="text-[9px] font-bold text-gray-700 leading-tight">{m.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Kiểu Font Chữ & Căn Chỉnh Khoảng Cách */}
            <div className="group relative">
              <label className={labelClass}>🔤 Kiểu Font Chữ & Căn Chỉnh Khoảng Cách</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleChange('fontStyle', 'serif')}
                  className={`p-2.5 border-2 border-black text-left transition-all cursor-pointer ${
                    (config.fontStyle || 'serif') === 'serif'
                      ? 'bg-[#FF90E8] text-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] translate-x-[1px] translate-y-[1px]'
                      : 'bg-white text-black hover:bg-slate-100'
                  }`}
                >
                  <div className="text-[11px] font-black uppercase">✒️ Font Có Chân (Serif)</div>
                  <div className="text-[9px] font-bold text-gray-700">Times New Roman / Liberation Serif</div>
                </button>
                <button
                  type="button"
                  onClick={() => handleChange('fontStyle', 'sans')}
                  className={`p-2.5 border-2 border-black text-left transition-all cursor-pointer ${
                    config.fontStyle === 'sans'
                      ? 'bg-[#A3E635] text-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] translate-x-[1px] translate-y-[1px]'
                      : 'bg-white text-black hover:bg-slate-100'
                  }`}
                >
                  <div className="text-[11px] font-black uppercase">🔠 Font Không Chân (Sans-Serif)</div>
                  <div className="text-[9px] font-bold text-gray-700">Be Vietnam Pro / Inter (Hiện đại)</div>
                </button>
              </div>
              <p className="text-[10px] text-gray-600 font-bold mt-1">
                ✨ *Tự động ngắt dòng line_spacing=1.2, căn chỉnh khoảng cách chữ chuẩn xác, chống đè lấp 100%.*
              </p>
            </div>

            {/* Render Quality & FPS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="group relative md:col-span-2">
                <label className={labelClass}>Chất lượng Render</label>
                <div className="relative">
                  <Sliders className={iconClass} />
                  <select
                    className={selectClass}
                    value={config.renderQuality || '1080p'}
                    onChange={e => handleChange('renderQuality', e.target.value)}
                  >
                    <option value="1080p">Full HD 1080p (-pqh)</option>
                    <option value="480p">Xem trước nhanh 480p (-pql)</option>
                    <option value="4k">Chất lượng siêu nét 4K (-pqk)</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black pointer-events-none stroke-[3]" />
                </div>
              </div>

              <div className="group relative">
                <label className={labelClass}>Khung hình (FPS)</label>
                <div className="relative">
                  <Film className={iconClass} />
                  <select
                    className={selectClass}
                    value={config.fps || 60}
                    onChange={e => handleChange('fps', Number(e.target.value))}
                  >
                    <option value={60}>60 FPS (Mượt mà)</option>
                    <option value={30}>30 FPS (Tiết kiệm)</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black pointer-events-none stroke-[3]" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="group relative">
                <label className={labelClass}>Phong cách Diễn Hoạt</label>
                <div className="relative">
                  <Wand2 className={iconClass} />
                  <select
                    className={selectClass}
                    value={config.tone}
                    onChange={e => handleChange('tone', e.target.value)}
                  >
                    <option value="simple">Trực quan, dễ hiểu, sinh động</option>
                    <option value="creative">Hiện đại, bắt trend, cuốn hút</option>
                    <option value="academic">Sư phạm, chuẩn chỉ, học thuật</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black pointer-events-none stroke-[3]" />
                </div>
              </div>

              <div className="group relative">
                <label className={labelClass}>Đối tượng khán giả</label>
                <div className="relative">
                  <Users className={iconClass} />
                  <input
                    type="text"
                    className={inputClass}
                    placeholder="Học sinh, Sinh viên, Người tự học..."
                    value={config.audience}
                    onChange={e => handleChange('audience', e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Safe zone toggle for 9:16 */}
            {isVertical && (
              <div className="p-3 bg-[#00CECB]/20 border-2 border-black">
                <span className="text-[11px] font-black text-black uppercase block">
                  🛡️ Đã kích hoạt Vùng An Toàn (Safe Zone) 9:16
                </span>
                <span className="text-[10px] text-gray-700 font-medium">
                  Tự động căn chỉnh khoảng trống 15% trên và 20% dưới để không bị che bởi giao diện TikTok/Shorts.
                </span>
              </div>
            )}

            {/* Lồng tiếng AI (Voiceover & Narration) */}
            <div className="p-4 bg-[#FF90E8]/20 border-[3px] border-black shadow-[3px_3px_0_0_rgba(0,0,0,1)] space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={config.enableVoice !== false}
                    onChange={(e) => handleChange('enableVoice', e.target.checked)}
                    className="w-4 h-4 accent-black rounded-none cursor-pointer"
                  />
                  <span className="text-xs font-black uppercase text-black flex items-center gap-1.5">
                    <Mic className="w-4 h-4 stroke-[3] text-black" />
                    🎙️ Lồng Tiếng AI (Tự động đọc lời bình & đồng bộ Audio)
                  </span>
                </label>
                <span className={`text-[10px] font-black uppercase px-2 py-0.5 border border-black font-mono ${config.enableVoice !== false ? 'bg-[#A3E635] text-black' : 'bg-gray-200 text-gray-700'}`}>
                  {config.enableVoice !== false ? 'Đang bật' : 'Tắt'}
                </span>
              </div>

              {config.enableVoice !== false && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-black text-black mb-1 uppercase">
                      Giọng đọc AI (Tiếng Việt):
                    </label>
                    <div className="relative">
                      <select
                        className="w-full bg-white border-2 border-black p-2 text-xs font-bold text-black appearance-none cursor-pointer pr-8"
                        value={config.voiceName || 'vi-VN-HoaiMyNeural'}
                        onChange={(e) => handleChange('voiceName', e.target.value)}
                      >
                        <option value="vi-VN-HoaiMyNeural">👩 Hoài My (Nữ - Truyền cảm, bài giảng)</option>
                        <option value="vi-VN-NamMinhNeural">👨 Nam Minh (Nam - Trầm ấm, dõng dạc)</option>
                      </select>
                      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-black pointer-events-none stroke-[3]" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-black text-black mb-1 uppercase">
                      Tốc độ đọc:
                    </label>
                    <div className="relative">
                      <select
                        className="w-full bg-white border-2 border-black p-2 text-xs font-bold text-black appearance-none cursor-pointer pr-8"
                        value={config.voiceSpeed || '+0%'}
                        onChange={(e) => handleChange('voiceSpeed', e.target.value)}
                      >
                        <option value="+0%">Bình thường (Chuẩn 100%)</option>
                        <option value="+15%">Nhanh vừa +15% (Shorts/TikTok)</option>
                        <option value="-10%">Chậm rãi -10% (Bài giảng chi tiết)</option>
                      </select>
                      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-black pointer-events-none stroke-[3]" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Chi tiết yêu cầu bài toán / Dàn ý */}
            <div className="group relative mt-2">
              <label className={labelClass}>
                {isSeries ? 'Mô tả nội dung trọng tâm cho toàn bộ Playlist (Tùy chọn)' : 'Dàn ý chi tiết / Bài toán / Yêu cầu Animation (Tùy chọn)'}
              </label>
              <textarea
                className="w-full p-3 bg-[#ffffff] rounded-none border-[3px] border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] text-sm font-medium text-black placeholder:text-gray-500 min-h-[85px]"
                placeholder={isSeries ? "Vd: Lộ trình từ cơ bản đến nâng cao, bám sát các dạng bài thi THPT và ứng dụng thực tiễn..." : "Vd: Vẽ đồ thị hàm bậc 3, tiếp tuyến di chuyển trượt theo đồ thị, tô màu diện tích giới hạn..."}
                value={config.details || ''}
                onChange={e => handleChange('details', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Quick AI & Model Selector Bar */}
        <div className="p-3 bg-[#FFED66] border-[3px] border-black shadow-[3px_3px_0_0_rgba(0,0,0,1)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-black stroke-[3]" />
            <span className="text-xs font-black uppercase text-black tracking-wider">AI & Model:</span>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
            <select
              value={selectedAi}
              onChange={(e) => handleAiChange(e.target.value)}
              className="bg-white border-2 border-black px-2.5 py-1 text-xs font-black uppercase cursor-pointer shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:bg-[#00CECB] transition-all"
            >
              {AI_PROVIDERS.map((p) => (
                <option key={p.id} value={p.id}>{p.icon} {p.name}</option>
              ))}
            </select>
            <select
              value={selectedModel}
              onChange={(e) => handleModelChange(e.target.value)}
              className="bg-white border-2 border-black px-2.5 py-1 text-xs font-black uppercase cursor-pointer flex-1 sm:flex-initial shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:bg-[#A3E635] transition-all"
            >
              {currentAi.models.map((m) => (
                <option key={m.id} value={m.id}>{m.name} {m.badge ? `(${m.badge})` : ''}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Action Buttons: Đúng 2 nút theo chuẩn 1-Click */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          {/* Nút 1: Tạo Video (1-Click) hoặc Tạo Playlist (1-Click) */}
          <button
            type="button"
            onClick={() => onDirectAutomateManim ? onDirectAutomateManim(config) : onSubmitManim(config)}
            disabled={isLoading || !config.subject || !config.topic}
            className={`relative flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-none text-black font-black uppercase tracking-wider text-xs sm:text-sm border-4 border-black shadow-[5px_5px_0_0_rgba(0,0,0,1)] transition-all duration-75 active:translate-y-[3px] active:translate-x-[3px] active:shadow-none cursor-pointer
              ${(isLoading || !config.subject || !config.topic)
                ? 'bg-[#E2E8F0] cursor-not-allowed text-gray-500 shadow-none border-gray-400' 
                : isSeries ? 'bg-[#C084FC] hover:bg-[#A855F7] text-black' : 'bg-[#A3E635] hover:bg-[#86EFAC]'}`}
            title={isSeries ? `Tự động sản xuất trọn bộ ${config.seriesCount || 3} video playlist 1-Click` : "Tự động tạo mã Python, biên dịch Manim ra video MP4 và phát trực tiếp"}
          >
            <Zap className="w-5 h-5 stroke-[3] fill-black" />
            <span>{isSeries ? `⚡ Tạo Playlist ${config.seriesCount || 3} Tập (1-Click)` : '⚡ Tạo Video (1-Click)'}</span>
          </button>

          {/* Nút 2: Code Manim */}
          <button
            type="button"
            onClick={() => onSubmitManim(config)}
            disabled={isLoading || !config.subject || !config.topic}
            className={`relative flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-none text-black font-black uppercase tracking-wider text-xs sm:text-sm border-4 border-black shadow-[5px_5px_0_0_rgba(0,0,0,1)] transition-all duration-75 active:translate-y-[3px] active:translate-x-[3px] active:shadow-none cursor-pointer
              ${(isLoading || !config.subject || !config.topic)
                ? 'bg-[#E2E8F0] cursor-not-allowed text-gray-500 shadow-none border-gray-400' 
                : 'bg-white hover:bg-[#FFED66]'}`}
            title={isSeries ? "Sinh dàn ý phân cảnh và code Manim Tập 1" : "Sinh mã nguồn Python Manim CE để xem trước và tinh chỉnh"}
          >
            <Code className="w-5 h-5 stroke-[3] text-black" />
            <span>{isSeries ? 'Code Dàn Ý & Tập 1' : 'Code Manim'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoForm;