import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Search, BookOpen, Layers, CheckSquare, GraduationCap, Video, 
  FileText, Zap, ExternalLink, RefreshCw, Smartphone, X, Command,
  Sparkles, Terminal
} from 'lucide-react';

export interface CommandItem {
  id: string;
  title: string;
  subtitle: string;
  category: 'Tabs' | 'Thao Tác' | 'Hệ Thống';
  shortcut?: string;
  icon: React.ReactNode;
  onSelect: () => void;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab: (tab: 'roadmap' | 'learning' | 'worksheet' | 'similar' | 'exam' | 'video' | 'project') => void;
  onOpenAutomation: (tabMode?: 'auto' | 'rerender') => void;
  onOpenGemini: () => void;
  onClearContext: () => void;
  onOpenMobileModal: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onSelectTab,
  onOpenAutomation,
  onOpenGemini,
  onClearContext,
  onOpenMobileModal,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const commands: CommandItem[] = useMemo(
    () => [
      // Tabs
      {
        id: 'tab-worksheet',
        title: 'Phiếu bài tập Toán',
        subtitle: 'Tạo phiếu bài tập tự luận, trắc nghiệm và khung nháp trực quan',
        category: 'Tabs',
        shortcut: 'Alt+3',
        icon: <CheckSquare className="w-4 h-4 stroke-[2.5]" />,
        onSelect: () => onSelectTab('worksheet'),
      },
      {
        id: 'tab-exam',
        title: 'Đề thi chuẩn 2025',
        subtitle: 'Soạn đề thi 4 phần: Trắc nghiệm nhiều lựa chọn, Đúng/Sai, Trả lời ngắn',
        category: 'Tabs',
        shortcut: 'Alt+5',
        icon: <GraduationCap className="w-4 h-4 stroke-[2.5]" />,
        onSelect: () => onSelectTab('exam'),
      },
      {
        id: 'tab-video',
        title: 'Video Hoạt Họa Manim CE',
        subtitle: 'Kịch bản phân cảnh, đọc thoại TTS và sinh mã hoạt hình Python',
        category: 'Tabs',
        shortcut: 'Alt+6',
        icon: <Video className="w-4 h-4 stroke-[2.5]" />,
        onSelect: () => onSelectTab('video'),
      },
      {
        id: 'tab-learning',
        title: 'Bài học & Lý thuyết chi tiết',
        subtitle: 'Tài liệu bài giảng, định lý, ví dụ mẫu và sơ đồ tư duy',
        category: 'Tabs',
        shortcut: 'Alt+2',
        icon: <BookOpen className="w-4 h-4 stroke-[2.5]" />,
        onSelect: () => onSelectTab('learning'),
      },
      {
        id: 'tab-roadmap',
        title: 'Lộ trình học tập & Chuyên đề',
        subtitle: 'Sơ đồ cây kiến thức và lộ trình ôn luyện theo tuần/tháng',
        category: 'Tabs',
        shortcut: 'Alt+1',
        icon: <Layers className="w-4 h-4 stroke-[2.5]" />,
        onSelect: () => onSelectTab('roadmap'),
      },
      {
        id: 'tab-similar',
        title: 'Bài tập tương tự & Mở rộng',
        subtitle: 'Biến thể bài toán gốc, đổi số liệu và nâng cấp độ khó',
        category: 'Tabs',
        shortcut: 'Alt+4',
        icon: <Sparkles className="w-4 h-4 stroke-[2.5]" />,
        onSelect: () => onSelectTab('similar'),
      },
      {
        id: 'tab-project',
        title: 'Đồ án / Luận văn Tốt nghiệp',
        subtitle: 'Đề cương 5 chương, sơ đồ hệ thống và bộ câu hỏi vấn đáp bảo vệ',
        category: 'Tabs',
        shortcut: 'Alt+7',
        icon: <FileText className="w-4 h-4 stroke-[2.5]" />,
        onSelect: () => onSelectTab('project'),
      },

      // Actions
      {
        id: 'action-auto',
        title: 'Mở Trình Tự Động Hóa 1-Click',
        subtitle: 'Tự động mở Browser, dán prompt, biên dịch và tải file về máy',
        category: 'Thao Tác',
        shortcut: '↵',
        icon: <Zap className="w-4 h-4 stroke-[2.5] fill-current" />,
        onSelect: () => onOpenAutomation('auto'),
      },
      {
        id: 'action-rerender',
        title: 'Rerender Trực Tiếp (pdflatex / Manim)',
        subtitle: 'Biên dịch lại offline từ mã nguồn cục bộ không cần AI',
        category: 'Thao Tác',
        icon: <RefreshCw className="w-4 h-4 stroke-[2.5]" />,
        onSelect: () => onOpenAutomation('rerender'),
      },
      {
        id: 'action-gemini',
        title: 'Mở Kênh Chat Gemini',
        subtitle: 'Truy cập thẳng vào đoạn chat cố định để giữ ngữ cảnh',
        category: 'Thao Tác',
        icon: <ExternalLink className="w-4 h-4 stroke-[2.5]" />,
        onSelect: onOpenGemini,
      },
      {
        id: 'action-clear',
        title: 'Xóa Ngữ Cảnh Nối Tiếp',
        subtitle: 'Reset lại tài liệu và chủ đề đang được lưu trong phiên',
        category: 'Thao Tác',
        icon: <X className="w-4 h-4 stroke-[2.5]" />,
        onSelect: onClearContext,
      },

      // System
      {
        id: 'action-mobile',
        title: 'Truy Cập Điều Khiển Từ Điện Thoại',
        subtitle: 'Xem mã QR và địa chỉ mạng nội bộ / WAN để kết nối di động',
        category: 'Hệ Thống',
        icon: <Smartphone className="w-4 h-4 stroke-[2.5]" />,
        onSelect: onOpenMobileModal,
      },
    ],
    [onSelectTab, onOpenAutomation, onOpenGemini, onClearContext, onOpenMobileModal]
  );

  const filteredCommands = useMemo(() => {
    if (!query.trim()) return commands;
    const lower = query.toLowerCase().trim();
    return commands.filter(
      (c) =>
        c.title.toLowerCase().includes(lower) ||
        c.subtitle.toLowerCase().includes(lower) ||
        c.category.toLowerCase().includes(lower)
    );
  }, [commands, query]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredCommands]);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredCommands.length));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % Math.max(1, filteredCommands.length));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const selected = filteredCommands[selectedIndex];
        if (selected) {
          selected.onSelect();
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex, onClose]);

  // Scroll active item into view
  useEffect(() => {
    if (listRef.current) {
      const activeEl = listRef.current.children[selectedIndex] as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-start justify-center pt-20 px-4 sm:px-6">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />

      {/* Palette Container */}
      <div className="relative w-full max-w-xl bg-white border-4 border-black shadow-[10px_10px_0_0_rgba(0,0,0,1)] flex flex-col max-h-[75vh] overflow-hidden animate-in fade-in zoom-in-95 duration-100">
        
        {/* Search Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b-4 border-black bg-[#FFED66]">
          <Search className="w-5 h-5 text-black stroke-[3] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm kiếm tác vụ, chuyển tab hoặc kích hoạt 1-Click (Gõ để tìm)..."
            className="flex-1 bg-transparent text-black text-sm font-black placeholder:text-black/60 focus:outline-none uppercase tracking-wide"
          />
          <div className="flex items-center gap-1">
            <span className="text-[10px] font-black uppercase bg-black text-white px-2 py-0.5 border border-black font-mono">
              ESC
            </span>
          </div>
        </div>

        {/* Results List */}
        <div ref={listRef} className="flex-1 overflow-y-auto p-2 divide-y-2 divide-black/10">
          {filteredCommands.length === 0 ? (
            <div className="p-8 text-center text-black font-bold text-xs uppercase tracking-wider">
              Không tìm thấy lệnh hoặc công cụ nào phù hợp với &quot;{query}&quot;
            </div>
          ) : (
            filteredCommands.map((cmd, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={cmd.id}
                  type="button"
                  onClick={() => {
                    cmd.onSelect();
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full text-left p-3 flex items-center justify-between gap-3 transition-colors cursor-pointer border-2 ${
                    isSelected
                      ? 'bg-[#A3E635] border-black shadow-[3px_3px_0_0_rgba(0,0,0,1)]'
                      : 'bg-white border-transparent hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`p-2 border-2 border-black shrink-0 ${
                        isSelected ? 'bg-black text-[#A3E635]' : 'bg-slate-100 text-black'
                      }`}
                    >
                      {cmd.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black uppercase text-black tracking-wider truncate">
                          {cmd.title}
                        </span>
                        <span className="text-[9px] font-black uppercase px-1.5 py-0.2 bg-black text-white border border-black">
                          {cmd.category}
                        </span>
                      </div>
                      <p className="text-[11px] font-medium text-slate-700 truncate mt-0.5">
                        {cmd.subtitle}
                      </p>
                    </div>
                  </div>

                  {cmd.shortcut && (
                    <span
                      className={`text-[10px] font-mono font-black uppercase px-2 py-0.5 border-2 border-black shrink-0 ${
                        isSelected ? 'bg-white text-black' : 'bg-slate-200 text-black'
                      }`}
                    >
                      {cmd.shortcut}
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Footer Quick Keys */}
        <div className="p-2.5 bg-slate-100 border-t-4 border-black flex items-center justify-between text-[11px] font-bold text-black flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white border border-black text-[10px] font-mono">↑↓</kbd> Di chuyển
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white border border-black text-[10px] font-mono">↵</kbd> Chọn
            </span>
          </div>
          <div className="flex items-center gap-1 text-[10px] uppercase font-black">
            <span>Yuta Command Palette</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
