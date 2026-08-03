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
                README & Cẩm nang vận hành toàn diện
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 bg-[#ffffff] hover:bg-[#FFED66] border-3 border-black flex items-center justify-center text-black font-black shadow-[3px_3px_0_0_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
          >
            <X className="w-6 h-6 stroke-[3]" />
          </button>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="bg-[#FFED66] border-b-4 border-black p-3 flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 border-3 border-black text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
              activeTab === 'overview' 
                ? 'bg-[#ffffff] text-black shadow-[3px_3px_0_0_rgba(0,0,0,1)]' 
                : 'bg-transparent text-black hover:bg-[#ffffff]/60'
            }`}
          >
            <Zap className="w-4 h-4 stroke-[3]" />
            1. Triết Lý & Tổng Quan
          </button>
          
          <button
            onClick={() => setActiveTab('tools')}
            className={`px-4 py-2 border-3 border-black text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
              activeTab === 'tools' 
                ? 'bg-[#ffffff] text-black shadow-[3px_3px_0_0_rgba(0,0,0,1)]' 
                : 'bg-transparent text-black hover:bg-[#ffffff]/60'
            }`}
          >
            <FileCode className="w-4 h-4 stroke-[3]" />
            2. Các Bộ Tool Prompting
          </button>

          <button
            onClick={() => setActiveTab('execution')}
            className={`px-4 py-2 border-3 border-black text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
              activeTab === 'execution' 
                ? 'bg-[#ffffff] text-black shadow-[3px_3px_0_0_rgba(0,0,0,1)]' 
                : 'bg-transparent text-black hover:bg-[#ffffff]/60'
            }`}
          >
            <Terminal className="w-4 h-4 stroke-[3]" />
            3. Biên Dịch & Chạy Code
          </button>

          <button
            onClick={() => setActiveTab('sync')}
            className={`px-4 py-2 border-3 border-black text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
              activeTab === 'sync' 
                ? 'bg-[#ffffff] text-black shadow-[3px_3px_0_0_rgba(0,0,0,1)]' 
                : 'bg-transparent text-black hover:bg-[#ffffff]/60'
            }`}
          >
            <Sparkles className="w-4 h-4 stroke-[3]" />
            4. Kênh Cố Định & Context
          </button>
        </div>

        {/* Modal Content Area */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-8 bg-[#FAFAFA]">
          
          {/* TAB 1: OVERVIEW & RED THREAD */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="bg-[#A3E635] border-4 border-black p-6 shadow-[6px_6px_0_0_rgba(0,0,0,1)]">
                <h3 className="text-xl font-black text-black uppercase tracking-widest mb-2 flex items-center gap-3">
                  <Zap className="w-6 h-6 stroke-[3]" />
                  Chiến Thuật "Sợi Chỉ Đỏ" (Red Thread Strategy)
                </h3>
                <p className="text-sm font-bold text-black leading-relaxed">
                  Yuta!LaTeX Studio không đơn thuần là công cụ sinh code ngẫu nhiên. Hệ thống được xây dựng để kết nối liên tục từ việc lập kế hoạch giảng dạy tới việc tạo công cụ tự động hóa hệ thống.
                </p>
              </div>

              {/* Workflow Pipeline visual */}
              <div className="bg-[#ffffff] border-4 border-black p-6 shadow-[6px_6px_0_0_rgba(0,0,0,1)] space-y-4">
                <h4 className="text-base font-black text-black uppercase tracking-wider border-b-3 border-black pb-2">
                  Luồng Làm Việc 6 Bước Đồng Bộ Khép Kín:
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="p-4 bg-[#FF5E5B]/20 border-3 border-black shadow-[3px_3px_0_0_rgba(0,0,0,1)]">
                    <span className="text-xs font-black bg-[#FF5E5B] text-black px-2 py-0.5 border border-black uppercase">Bước 1</span>
                    <h5 className="font-black text-black text-sm mt-2 uppercase">🗺️ Lộ Trình (Roadmap)</h5>
                    <p className="text-xs font-bold text-gray-800 mt-1">Phân chia chương trình thành các Micro-steps dễ hấp thụ.</p>
                  </div>

                  <div className="p-4 bg-[#00CECB]/20 border-3 border-black shadow-[3px_3px_0_0_rgba(0,0,0,1)]">
                    <span className="text-xs font-black bg-[#00CECB] text-black px-2 py-0.5 border border-black uppercase">Bước 2</span>
                    <h5 className="font-black text-black text-sm mt-2 uppercase">📖 Bài Học (Learning)</h5>
                    <p className="text-xs font-bold text-gray-800 mt-1">Soạn lý thuyết, ví dụ minh họa chuẩn mực LaTeX.</p>
                  </div>

                  <div className="p-4 bg-[#A3E635]/20 border-3 border-black shadow-[3px_3px_0_0_rgba(0,0,0,1)]">
                    <span className="text-xs font-black bg-[#A3E635] text-black px-2 py-0.5 border border-black uppercase">Bước 3</span>
                    <h5 className="font-black text-black text-sm mt-2 uppercase">📝 Bài Tập (Worksheet)</h5>
                    <p className="text-xs font-bold text-gray-800 mt-1">Biên soạn phiếu bài tập rèn luyện có đáp án chi tiết.</p>
                  </div>

                  <div className="p-4 bg-[#FF90E8]/20 border-3 border-black shadow-[3px_3px_0_0_rgba(0,0,0,1)]">
                    <span className="text-xs font-black bg-[#FF90E8] text-black px-2 py-0.5 border border-black uppercase">Bước 4</span>
                    <h5 className="font-black text-black text-sm mt-2 uppercase">🎓 Đề Thi (Exam)</h5>
                    <p className="text-xs font-bold text-gray-800 mt-1">Thiết lập ma trận 4 cấp độ (Nhận biết - Vận dụng cao).</p>
                  </div>

                  <div className="p-4 bg-[#9333EA]/20 border-3 border-black shadow-[3px_3px_0_0_rgba(0,0,0,1)]">
                    <span className="text-xs font-black bg-[#9333EA] text-white px-2 py-0.5 border border-black uppercase">Bước 5</span>
                    <h5 className="font-black text-black text-sm mt-2 uppercase">🎬 Video & Manim</h5>
                    <p className="text-xs font-bold text-gray-800 mt-1">Tạo kịch bản giảng dạy & code hoạt hình Python Manim.</p>
                  </div>

                  <div className="p-4 bg-[#FFED66]/40 border-3 border-black shadow-[3px_3px_0_0_rgba(0,0,0,1)]">
                    <span className="text-xs font-black bg-[#FFED66] text-black px-2 py-0.5 border border-black uppercase">Bước 6</span>
                    <h5 className="font-black text-black text-sm mt-2 uppercase">💻 Windows Script (.bat)</h5>
                    <p className="text-xs font-bold text-gray-800 mt-1">Tự động dọn dẹp file tạm .aux, .log, tự động biên dịch.</p>
                  </div>
                </div>
              </div>

              {/* Highlights */}
              <div className="bg-[#00CECB] border-4 border-black p-6 shadow-[6px_6px_0_0_rgba(0,0,0,1)]">
                <h4 className="text-base font-black text-black uppercase tracking-wider mb-3">
                  Vì sao Yuta!LaTeX tạo ra mã nguồn sạch hơn?
                </h4>
                <ul className="space-y-2 text-xs font-bold text-black">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 stroke-[3] mt-0.5" />
                    <span><b>Loại bỏ lỗi hiển thị Markdown:</b> Prompt ép AI không bọc sai cú pháp làm hỏng trình biên dịch pdfLaTeX hay XeLaTeX.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 stroke-[3] mt-0.5" />
                    <span><b>Escape ký tự đặc biệt:</b> Tự động nhắc nhở AI escape các ký tự nguy hiểm trong LaTeX như %, _, &, $, &#123;, &#125;.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 stroke-[3] mt-0.5" />
                    <span><b>Khối Self-Check độc quyền:</b> AI sẽ tự rà soát lại ma trận câu hỏi và tính hợp lệ trước khi trả kết quả cuối cùng.</span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 2: TOOLS GUIDE */}
          {activeTab === 'tools' && (
            <div className="space-y-6">
              <h3 className="text-xl font-black text-black uppercase tracking-widest mb-4">
                Chi Tiết 6 Bộ Công Cụ Chuyên Sâu
              </h3>

              <div className="space-y-4">
                {/* 1. Roadmap */}
                <div className="bg-[#ffffff] border-3 border-black p-5 shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-[#FF5E5B] border-2 border-black flex items-center justify-center font-black">
                      <Map className="w-4 h-4" />
                    </div>
                    <h4 className="font-black text-black uppercase text-base">1. Lộ Trình Học Tập (Roadmap)</h4>
                  </div>
                  <p className="text-xs font-bold text-gray-800 leading-relaxed">
                    Giúp thiết kế lộ trình cá nhân hóa cho học sinh từ mức Mất gốc đến Thi HSG/Thi ĐH. AI tự động chia nhỏ thành các giai đoạn (Phases) và các bài học nối tiếp nhau sinh động.
                  </p>
                </div>

                {/* 2. Learning */}
                <div className="bg-[#ffffff] border-3 border-black p-5 shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-[#00CECB] border-2 border-black flex items-center justify-center font-black">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <h4 className="font-black text-black uppercase text-base">2. Bài Học & Lý Thuyết (Learning)</h4>
                  </div>
                  <p className="text-xs font-bold text-gray-800 leading-relaxed">
                    Tạo tài liệu học tập đầy đủ cấu trúc: Tóm tắt Cheat Sheet, Bài giảng chi tiết (có ví dụ minh họa và chú thích câu lệnh), chọn được văn phong (Hàn lâm, Sáng tạo, Đơn giản) và Ngôn ngữ (Song ngữ, Thuần Việt, Thuần Anh).
                  </p>
                </div>

                {/* 3. Worksheet */}
                <div className="bg-[#ffffff] border-3 border-black p-5 shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-[#A3E635] border-2 border-black flex items-center justify-center font-black">
                      <FileText className="w-4 h-4" />
                    </div>
                    <h4 className="font-black text-black uppercase text-base">3. Phiếu Bài Tập (Worksheet)</h4>
                  </div>
                  <p className="text-xs font-bold text-gray-800 leading-relaxed">
                    Tạo phiếu bài tập phân dạng có khung tóm tắt lý thuyết, ví dụ mẫu, phần bài tập tự luyện và đáp án chi tiết. Bố cục được tối ưu hóa chuẩn XeLaTeX/pdfLaTeX để in ấn trực tiếp.
                  </p>
                </div>

                {/* 4. Exam */}
                <div className="bg-[#ffffff] border-3 border-black p-5 shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-[#FF90E8] border-2 border-black flex items-center justify-center font-black">
                      <GraduationCap className="w-4 h-4" />
                    </div>
                    <h4 className="font-black text-black uppercase text-base">4. Đề Thi & Ma Trận (Exam)</h4>
                  </div>
                  <p className="text-xs font-bold text-gray-800 leading-relaxed">
                    Cấu hình số câu Trắc nghiệm & Tự luận. Tùy chỉnh chính xác ma trận 4 mức độ: Nhận biết (NB), Thông hiểu (TH), Vận dụng (VD), Vận dụng cao (VDC). Kiểm tra chéo tổng số câu tự động trước khi bấm tạo!
                  </p>
                </div>

                {/* 5. Video */}
                <div className="bg-[#ffffff] border-3 border-black p-5 shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-[#9333EA] text-white border-2 border-black flex items-center justify-center font-black">
                      <Video className="w-4 h-4" />
                    </div>
                    <h4 className="font-black text-black uppercase text-base">5. Kịch Bản Video & Code Manim</h4>
                  </div>
                  <p className="text-xs font-bold text-gray-800 leading-relaxed">
                    Cho phép chọn 2 chế độ:
                    <br />• <b>Kịch bản Video:</b> Tạo lời thoại + gợi ý hình ảnh chi tiết theo dòng thời gian (Khung ngang/dọc).
                    <br />• <b>Code Python Manim:</b> Sinh mã Python thư viện Manim hoạt hình toán học/vật lý hoàn chỉnh.
                  </p>
                </div>

                {/* 6. Bat */}
                <div className="bg-[#ffffff] border-3 border-black p-5 shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-[#FFED66] border-2 border-black flex items-center justify-center font-black">
                      <Terminal className="w-4 h-4" />
                    </div>
                    <h4 className="font-black text-black uppercase text-base">6. Automation Script Windows (.bat)</h4>
                  </div>
                  <p className="text-xs font-bold text-gray-800 leading-relaxed">
                    Tạo script tự động hóa công việc quản lý tài liệu trên Windows (CMD): Dọn dẹp file rác .aux/.log sau khi biên dịch LaTeX, sao lưu tự động bài giảng, hoặc tạo hàng loạt thư mục môn học.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: EXECUTION & COMPILATION */}
          {activeTab === 'execution' && (
            <div className="space-y-6">
              <h3 className="text-xl font-black text-black uppercase tracking-widest mb-4">
                Hướng Dẫn Biên Dịch & Chạy Code Đầu Ra
              </h3>

              {/* 1. LaTeX Overleaf */}
              <div className="bg-[#ffffff] border-4 border-black p-6 shadow-[6px_6px_0_0_rgba(0,0,0,1)] space-y-3">
                <div className="flex items-center justify-between border-b-3 border-black pb-2">
                  <h4 className="font-black text-black uppercase text-base flex items-center gap-2">
                    <FileCode className="w-5 h-5 text-[#00CECB]" />
                    1. Cách Biên Dịch LaTeX (Overleaf / TeXStudio)
                  </h4>
                  <span className="text-[10px] font-black bg-[#00CECB] text-black px-2 py-0.5 border border-black uppercase">
                    pdfLaTeX / XeLaTeX
                  </span>
                </div>
                <ol className="list-decimal list-inside space-y-2 text-xs font-bold text-gray-800 leading-relaxed">
                  <li>Bấm nút <b>Sao chép mã</b> trên giao diện kết quả của Yuta!LaTeX.</li>
                  <li>Mở <b>Overleaf.com</b> ➔ Tạo dự án mới <b>Blank Project</b>.</li>
                  <li>Dán toàn bộ mã vào file <code>main.tex</code>.</li>
                  <li>Chọn Compiler trong Menu Overleaf: <b>pdfLaTeX</b> (mặc định) hoặc <b>XeLaTeX</b> (nếu dùng font hệ thống).</li>
                  <li>Bấm <b>Recompile</b> (Ctrl + S) để xuất ra PDF chuẩn định dạng.</li>
                </ol>
              </div>

              {/* 2. Python Manim */}
              <div className="bg-[#ffffff] border-4 border-black p-6 shadow-[6px_6px_0_0_rgba(0,0,0,1)] space-y-3">
                <div className="flex items-center justify-between border-b-3 border-black pb-2">
                  <h4 className="font-black text-black uppercase text-base flex items-center gap-2">
                    <Video className="w-5 h-5 text-[#9333EA]" />
                    2. Cách Chạy Code Hoạt Hình Python Manim
                  </h4>
                  <span className="text-[10px] font-black bg-[#9333EA] text-white px-2 py-0.5 border border-black uppercase">
                    Python 3.8+
                  </span>
                </div>
                <p className="text-xs font-bold text-gray-800">
                  Cài đặt thư viện Manim qua Terminal/Command Prompt:
                </p>
                <div className="bg-[#1E1E1E] text-green-400 p-3 font-mono text-xs border-2 border-black flex items-center justify-between">
                  <code>pip install manim</code>
                  <button 
                    onClick={() => handleCopySnippet('pip install manim', 'manim-install')}
                    className="text-white hover:text-[#FFED66] p-1"
                  >
                    {copiedCode === 'manim-install' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs font-bold text-gray-800">
                  Lưu đoạn code thành <code>scene.py</code> và chạy lệnh render video chất lượng thường (pql) hoặc 4K (pqh):
                </p>
                <div className="bg-[#1E1E1E] text-green-400 p-3 font-mono text-xs border-2 border-black flex items-center justify-between">
                  <code>manim -pql scene.py MySceneName</code>
                  <button 
                    onClick={() => handleCopySnippet('manim -pql scene.py MySceneName', 'manim-run')}
                    className="text-white hover:text-[#FFED66] p-1"
                  >
                    {copiedCode === 'manim-run' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* 3. Windows Batch Script */}
              <div className="bg-[#ffffff] border-4 border-black p-6 shadow-[6px_6px_0_0_rgba(0,0,0,1)] space-y-3">
                <div className="flex items-center justify-between border-b-3 border-black pb-2">
                  <h4 className="font-black text-black uppercase text-base flex items-center gap-2">
                    <Terminal className="w-5 h-5 text-[#FFED66]" />
                    3. Cách Chạy Script Tự Động Windows (.bat)
                  </h4>
                  <span className="text-[10px] font-black bg-[#FFED66] text-black px-2 py-0.5 border border-black uppercase">
                    CMD / PowerShell
                  </span>
                </div>
                <ol className="list-decimal list-inside space-y-2 text-xs font-bold text-gray-800 leading-relaxed">
                  <li>Sao chép mã script <code>.bat</code> đã sinh ra.</li>
                  <li>Mở <b>Notepad</b> ➔ Dán mã vào ➔ Chọn <b>Save As</b>.</li>
                  <li>Đổi kiểu file thành <b>All Files (*.*)</b> và lưu với đuôi <code>.bat</code> (Ví dụ: <code>cleanup_tex.bat</code>).</li>
                  <li>Nếu script yêu cầu quyền hệ thống: Nhấp chuột phải vào file <code>.bat</code> ➔ Chọn <b>Run as Administrator</b>.</li>
                </ol>
              </div>
            </div>
          )}

          {/* TAB 4: SYNC & FIXED LINK */}
          {activeTab === 'sync' && (
            <div className="space-y-6">
              <div className="bg-[#FFED66] border-4 border-black p-6 shadow-[6px_6px_0_0_rgba(0,0,0,1)]">
                <h3 className="text-xl font-black text-black uppercase tracking-widest mb-2 flex items-center gap-3">
                  <Sparkles className="w-6 h-6 stroke-[3]" />
                  Quản Lý Kênh Gemini Cố Định & Đồng Bộ Ngữ Cảnh
                </h3>
                <p className="text-sm font-bold text-black leading-relaxed">
                  Tránh tình trạng AI quên bài học cũ hoặc sinh lại nội dung trùng lặp bằng cách duy trì 1 cuộc hội thoại duy nhất!
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#ffffff] border-3 border-black p-5 shadow-[4px_4px_0_0_rgba(0,0,0,1)] space-y-3">
                  <h4 className="font-black text-black uppercase text-base border-b-2 border-black pb-2">
                    📌 1. Ô Kênh Gemini Cố Định
                  </h4>
                  <p className="text-xs font-bold text-gray-800 leading-relaxed">
                    Sau khi copy Prompt đầu tiên dán vào Gemini, hãy sao chép đường dẫn (URL) của đoạn chat đó dán vào khung <b>"Kênh Gemini Cố định"</b> ở đầu trang.
                  </p>
                  <p className="text-xs font-bold text-indigo-900 bg-indigo-50 p-2 border border-indigo-200">
                    💡 Mọi lần sau bạn chỉ cần bấm nút <b>"KÊNH CỐ ĐỊNH"</b> để quay lại ngay cuộc hội thoại cũ!
                  </p>
                </div>

                <div className="bg-[#ffffff] border-3 border-black p-5 shadow-[4px_4px_0_0_rgba(0,0,0,1)] space-y-3">
                  <h4 className="font-black text-black uppercase text-base border-b-2 border-black pb-2">
                    ⚡ 2. Chuyển Tiếp Ngữ Cảnh Tự Động
                  </h4>
                  <p className="text-xs font-bold text-gray-800 leading-relaxed">
                    Khi bạn tạo Lộ trình hay Bài học thành công, trên thanh kết quả sẽ có các nút <b>"👉 Chuyển sang Bài tập / Đề thi / Video / Script"</b>.
                  </p>
                  <p className="text-xs font-bold text-emerald-900 bg-emerald-50 p-2 border border-emerald-200">
                    💡 Bấm vào đó, môn học, lớp và chủ đề sẽ tự động điền sang biểu mẫu tiếp theo mà không cần nhập lại!
                  </p>
                </div>
              </div>

              <div className="bg-[#ffffff] border-4 border-black p-6 shadow-[6px_6px_0_0_rgba(0,0,0,1)] text-center">
                <h4 className="font-black text-black uppercase text-base mb-2">
                  🚀 Bạn Đã Sẵn Sàng Sáng Tạo Giáo Án Chuẩn Quốc Tế!
                </h4>
                <p className="text-xs font-bold text-gray-700 mb-4">
                  Bắt đầu ngay bằng cách chọn một công cụ trên thanh menu chính.
                </p>
                <button
                  onClick={onClose}
                  className="px-8 py-3 bg-[#A3E635] text-black font-black uppercase tracking-widest border-3 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
                >
                  ĐÓNG HƯỚNG DẪN & BẮT ĐẦU
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

export default ReadmeModal;
