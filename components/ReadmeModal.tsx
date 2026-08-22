import React, { useState } from 'react';
import { 
  BookOpen, FileCode, Terminal, Video, Map, GraduationCap, 
  Sparkles, ExternalLink, Copy, Check, X, ShieldCheck, Zap, 
  Info, ArrowRight, HelpCircle, FileText, CheckCircle2, ChevronRight
} from 'lucide-react';

interface ReadmeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ReadmeModal: React.FC<ReadmeModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'tools' | 'execution' | 'sync'>('overview');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopySnippet = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#ffffff] w-full max-w-5xl max-h-[90vh] border-4 border-black shadow-[12px_12px_0_0_rgba(0,0,0,1)] flex flex-col overflow-hidden relative">
        
        {/* Modal Header */}
        <div className="bg-[#FF5E5B] border-b-4 border-black p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#ffffff] border-3 border-black flex items-center justify-center text-black font-black shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
              <HelpCircle className="w-6 h-6 stroke-[3]" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-black uppercase tracking-widest">
                Yuta!LaTeX Studio — Hướng Dẫn Chi Tiết
              </h2>
              <p className="text-xs font-bold text-black uppercase tracking-wider">
                Cẩm nang vận hành soạn thảo Toán học & Diễn hoạt Manim
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-[#ffffff] hover:bg-[#FFECA1] border-3 border-black flex items-center justify-center text-black font-black shadow-[3px_3px_0_0_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all cursor-pointer"
          >
            <X className="w-6 h-6 stroke-[3]" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b-4 border-black bg-[#FFED66] overflow-x-auto">
          {[
            { id: 'overview', label: '1. Tổng Quan & Triết Lý', icon: BookOpen },
            { id: 'tools', label: '2. Bộ Công Cụ (7 Tab)', icon: Sparkles },
            { id: 'execution', label: '3. Cách Biên Dịch & Chạy', icon: Terminal },
            { id: 'sync', label: '4. Chuỗi Ngữ Cảnh Tự Động', icon: Zap }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-5 py-3.5 border-r-3 border-black text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer
                  ${isActive 
                    ? 'bg-[#ffffff] text-black shadow-inner border-b-0 -mb-1' 
                    : 'bg-transparent text-black hover:bg-[#FFECA1]'}`}
              >
                <Icon className="w-4 h-4 stroke-[3]" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 text-black bg-[#ffffff]">
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="border-4 border-black p-5 bg-[#00CECB]/20 shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
                <h3 className="text-lg font-black uppercase tracking-wider mb-2 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 stroke-[3]" /> Mục Tiêu Dự Án
                </h3>
                <p className="text-sm font-medium leading-relaxed">
                  <strong>Yuta!LaTeX Studio</strong> là hệ thống tạo Prompt chuyên nghiệp cho Gemini AI, được tối ưu hóa 100% để sinh ra mã nguồn <strong>LaTeX Toán học sạch</strong> (biên dịch pdfLaTeX không lỗi), <strong>mã nguồn Python Manim</strong> (làm video diễn hoạt toán học trực quan) và <strong>file tự động hóa Windows Batch (.bat)</strong>.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border-3 border-black p-4 bg-[#FFED66]/30 shadow-[3px_3px_0_0_rgba(0,0,0,1)]">
                  <h4 className="font-black text-xs uppercase mb-1">Chuẩn pdfLaTeX</h4>
                  <p className="text-xs text-gray-700 font-medium">Bảo đảm biên dịch 1 phát ăn ngay trên Overleaf hoặc máy tính cá nhân.</p>
                </div>
                <div className="border-3 border-black p-4 bg-[#A3E635]/30 shadow-[3px_3px_0_0_rgba(0,0,0,1)]">
                  <h4 className="font-black text-xs uppercase mb-1">Toán Học & Diễn Hoạt</h4>
                  <p className="text-xs text-gray-700 font-medium">Hỗ trợ đầy đủ từ Ma trận Đề thi, Phiếu bài tập, Đổi số bài toán đến Script Manim Shorts/YouTube.</p>
                </div>
                <div className="border-3 border-black p-4 bg-[#FF90E8]/30 shadow-[3px_3px_0_0_rgba(0,0,0,1)]">
                  <h4 className="font-black text-xs uppercase mb-1">Kênh Nhớ Ngữ Cảnh</h4>
                  <p className="text-xs text-gray-700 font-medium">Lưu link chat Gemini cố định để AI nhớ lịch sử bài học, tránh trùng lặp chuyên đề.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tools' && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <h3 className="text-base font-black uppercase border-b-3 border-black pb-2">Danh Sách 7 Công Cụ Chính:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border-3 border-black p-4 bg-[#ffffff] shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
                  <span className="px-2 py-0.5 bg-[#FF5E5B] text-black font-black text-[10px] uppercase border border-black">1. Lộ trình học (Roadmap)</span>
                  <p className="text-xs font-medium mt-2">Vẽ kế hoạch bài bản từ mất gốc lên điểm 8+, 9+ với thời gian và các chặng rõ ràng.</p>
                </div>
                <div className="border-3 border-black p-4 bg-[#ffffff] shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
                  <span className="px-2 py-0.5 bg-[#00CECB] text-black font-black text-[10px] uppercase border border-black">2. Bài học lý thuyết (Learning)</span>
                  <p className="text-xs font-medium mt-2">Bài giảng sư phạm chuyên sâu, định nghĩa, chứng minh và ví dụ mẫu.</p>
                </div>
                <div className="border-3 border-black p-4 bg-[#ffffff] shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
                  <span className="px-2 py-0.5 bg-[#A3E635] text-black font-black text-[10px] uppercase border border-black">3. Phiếu bài tập (Worksheet)</span>
                  <p className="text-xs font-medium mt-2">Tạo tài liệu học tập in ấn có dòng kẻ chấm (\dongke) cho học sinh làm trực tiếp.</p>
                </div>
                <div className="border-3 border-black p-4 bg-[#ffffff] shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
                  <span className="px-2 py-0.5 bg-[#FB7185] text-black font-black text-[10px] uppercase border border-black">4. Bài tập tương tự (Similar)</span>
                  <p className="text-xs font-medium mt-2">Dán 1 bài toán gốc → AI tự sinh 3-5 bài cùng dạng hoặc đổi số, kèm lời giải chi tiết.</p>
                </div>
                <div className="border-3 border-black p-4 bg-[#ffffff] shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
                  <span className="px-2 py-0.5 bg-[#FF90E8] text-black font-black text-[10px] uppercase border border-black">5. Đề thi chuẩn hóa (Exam)</span>
                  <p className="text-xs font-medium mt-2">Ma trận 4 mức độ: Nhận biết, Thông hiểu, Vận dụng, VDC với trắc nghiệm và tự luận.</p>
                </div>
                <div className="border-3 border-black p-4 bg-[#ffffff] shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
                  <span className="px-2 py-0.5 bg-[#9333EA] text-white font-black text-[10px] uppercase border border-black">6. Video & Manim (Animation)</span>
                  <p className="text-xs font-medium mt-2">Kịch bản lời thoại và code Python Manim chuẩn cho Shorts (9:16) & YouTube (16:9).</p>
                </div>
                <div className="border-3 border-black p-4 bg-[#ffffff] shadow-[4px_4px_0_0_rgba(0,0,0,1)] col-span-1 md:col-span-2">
                  <span className="px-2 py-0.5 bg-[#FFED66] text-black font-black text-[10px] uppercase border border-black">7. Automation Script (.BAT)</span>
                  <p className="text-xs font-medium mt-2">Tự động dọn dẹp file rác LaTeX (.aux, .log), render video Manim tự động chỉ với 1 click.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'execution' && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <h3 className="text-base font-black uppercase border-b-3 border-black pb-2">Hướng Dẫn Sử Dụng & Biên Dịch:</h3>
              <ol className="space-y-3 text-xs font-medium list-decimal pl-5">
                <li><strong>Bước 1:</strong> Chọn công cụ muốn tạo (ví dụ: Đề thi, Worksheet hoặc Bài tập tương tự) và bấm nút tạo prompt.</li>
                <li><strong>Bước 2:</strong> Bấm <strong>"Sao Chép Mã"</strong> hoặc <strong>"Vào Đoạn Chat"</strong> để mở Gemini. Dán prompt vào và gửi.</li>
                <li><strong>Bước 3:</strong> Sao chép đoạn code \`\`\`latex\`\`\` mà Gemini trả về:
                  <ul className="list-disc pl-5 mt-1 text-gray-700">
                    <li>Dán vào <strong>Overleaf</strong> (trình biên dịch mặc định là pdfLaTeX) để xuất file PDF ngay.</li>
                    <li>Hoặc lưu thành file \`tailieu.tex\` trên máy tính rồi biên dịch bằng TeXLive / MikTeX.</li>
                  </ul>
                </li>
                <li><strong>Bước 4 đối với Manim Video:</strong> Lưu code vào file \`scene.py\` và chạy lệnh: <code className="bg-gray-100 px-1 py-0.5 border border-black font-mono">manim -pql scene.py MainScene</code>.</li>
              </ol>
            </div>
          )}

          {activeTab === 'sync' && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="border-3 border-black p-4 bg-[#FFED66]/40 shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
                <h3 className="text-sm font-black uppercase mb-2 flex items-center gap-2">
                  <Zap className="w-4 h-4 stroke-[3]" /> Thanh Đồng Bộ Ngữ Cảnh (Forward Context)
                </h3>
                <p className="text-xs font-medium leading-relaxed">
                  Khi bạn tạo xong một chuyên đề (ví dụ: Lộ trình hàm số), phía dưới khung kết quả sẽ có thanh <strong>"Đồng bộ ngữ cảnh"</strong>. Bạn chỉ cần bấm <em>"Sang Bài Học"</em>, <em>"Sang Bài Tập"</em>, <em>"Sang Bài Tương Tự"</em> hoặc <em>"Sang Đề Thi"</em>, toàn bộ tên chủ đề, khối lớp, môn học sẽ tự động được điền sang form tiếp theo mà bạn không cần gõ lại!
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-[#ffffff] border-t-4 border-black p-4 flex justify-between items-center">
          <span className="text-xs font-black uppercase tracking-wider text-black">
            Yuta Education System
          </span>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-[#FFED66] hover:bg-[#FFECA1] border-3 border-black text-xs font-black uppercase tracking-widest shadow-[3px_3px_0_0_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all cursor-pointer"
          >
            Đóng Hướng Dẫn
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReadmeModal;