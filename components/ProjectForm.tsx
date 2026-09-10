import React, { useState } from 'react';
import { 
  GraduationCap, 
  BookOpen, 
  FolderGit2, 
  School, 
  User, 
  Lightbulb, 
  FileText, 
  Zap, 
  Sparkles, 
  ChevronDown, 
  CheckCircle2, 
  Layers, 
  Calendar, 
  HelpCircle,
  Clock
} from 'lucide-react';
import { ProjectConfig, GenerationStatus, AttachedPdfData } from '../types';
import PdfUploadZone from './PdfUploadZone';

interface ProjectFormProps {
  onSubmit: (data: ProjectConfig) => void;
  onDirectAutomate?: (data: ProjectConfig) => void;
  status: GenerationStatus;
  globalPinnedPdf?: AttachedPdfData | null;
  isGlobalRagActive?: boolean;
  onSetGlobalPin?: (pdf: AttachedPdfData) => void;
}

const SAMPLE_PROJECTS = [
  {
    title: "Xây dựng hệ thống RAG Hỏi đáp thông minh hỗ trợ học tập dựa trên AI",
    desc: "Sử dụng mô hình ngôn ngữ lớn (LLM), vector database (Milvus/Pinecone) và kiến trúc LangChain để tự động truy xuất tài liệu giáo trình và trả lời thắc mắc của sinh viên.",
    major: "Khoa học Máy tính / AI"
  },
  {
    title: "Phát triển ứng dụng Web thương mại điện tử kiến trúc Microservices",
    desc: "Thiết kế hệ thống chịu tải cao, áp dụng Docker, Kubernetes, Redis caching, RabbitMQ và phân tích luồng thanh toán an toàn.",
    major: "Kỹ thuật Phần mềm"
  },
  {
    title: "Hệ thống giám sát môi trường và nông nghiệp thông minh qua mạng cảm biến IoT",
    desc: "Thu thập dữ liệu nhiệt độ, độ ẩm, độ pH đất từ vi điều khiển ESP32, truyền qua MQTT lên Cloud Dashboard và tự động điều khiển van tưới.",
    major: "Hệ thống Nhúng & IoT"
  },
  {
    title: "Dự báo biến động chuỗi thời gian tài chính bằng mô hình Deep Learning",
    desc: "Kết hợp LSTM và Transformer phân tích chuỗi dữ liệu giá cổ phiếu, xử lý nhiễu dữ liệu và xây dựng chiến lược quản lý rủi ro danh mục đầu tư.",
    major: "Khoa học Dữ liệu / Tài chính"
  }
];

const ProjectForm: React.FC<ProjectFormProps> = ({
  onSubmit,
  onDirectAutomate,
  status,
  globalPinnedPdf,
  isGlobalRagActive = true,
  onSetGlobalPin
}) => {
  const [config, setConfig] = useState<ProjectConfig>({
    university: 'Trường Đại học Bách Khoa - ĐHQG',
    faculty: 'Khoa Công Nghệ Thông Tin & Kỹ Thuật',
    major: 'Kỹ thuật Phần mềm / Công nghệ Thông tin',
    title: '',
    studentName: 'Sinh viên thực hiện',
    supervisor: 'TS. Giảng viên hướng dẫn',
    projectType: 'capstone_thesis',
    description: '',
    outputScope: 'full_report',
    standardFormat: 'engineering',
    language: 'vietnamese',
    details: ''
  });

  const [showAdvanced, setShowAdvanced] = useState(false);
  const isLoading = status === GenerationStatus.LOADING;
  const effectivePdf = config.attachedPdf || (isGlobalRagActive ? globalPinnedPdf : null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!config.title.trim()) return;
    onSubmit({
      ...config,
      attachedPdf: effectivePdf || undefined
    });
  };

  const handleSelectPreset = (p: typeof SAMPLE_PROJECTS[0]) => {
    setConfig(prev => ({
      ...prev,
      title: p.title,
      description: p.desc,
      major: p.major
    }));
  };

  const handleChange = (field: keyof ProjectConfig, value: any) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const inputClass = "w-full pl-10 pr-4 py-2.5 bg-[#ffffff] rounded-none border-[3px] border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] focus:ring-0 focus:translate-y-1 focus:translate-x-1 focus:shadow-none transition-all text-sm font-bold text-black placeholder:text-gray-400";
  const selectClass = "w-full pl-10 pr-8 py-2.5 bg-[#ffffff] rounded-none border-[3px] border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] focus:ring-0 focus:translate-y-1 focus:translate-x-1 focus:shadow-none transition-all text-sm font-bold text-black uppercase cursor-pointer appearance-none";
  const labelClass = "block text-xs font-black text-black mb-1.5 uppercase tracking-widest";
  const iconClass = "pointer-events-none absolute left-3.5 top-[13px] w-4 h-4 text-black font-black";

  return (
    <div className="bg-[#ffffff] rounded-none shadow-[8px_8px_0_0_rgba(0,0,0,1)] border-4 border-black p-6 lg:p-8 h-fit sticky top-28 overflow-y-auto max-h-[calc(100vh-9rem)] scrollbar-hide">
      
      {/* HEADER CARD */}
      <div className="flex items-center gap-4 mb-6 border-b-4 border-black pb-4">
        <div className="w-12 h-12 bg-[#00CECB] flex items-center justify-center text-black border-4 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] rounded-none">
          <GraduationCap className="w-6 h-6 stroke-[3]" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-black uppercase tracking-widest flex items-center gap-2">
            <span>Đồ Án & Đề Tài</span>
            <span className="px-2 py-0.5 bg-[#FFED66] border-2 border-black text-[9px] font-black uppercase">Đại Học</span>
          </h2>
          <p className="text-xs text-black font-bold uppercase tracking-wider">
            Giải tỏa mơ hồ • Lộ trình bắt đầu từ A-Z • 5 Chương chuẩn mực LaTeX
          </p>
        </div>
      </div>

      {/* QUICK PRESETS CHIPS */}
      <div className="mb-6 p-4 bg-[#FFED66] border-[3px] border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
        <div className="flex items-center gap-1.5 mb-2.5">
          <Sparkles className="w-4 h-4 text-black stroke-[3]" />
          <span className="text-[11px] font-black uppercase tracking-wider text-black">
            Gợi ý đề tài mẫu (Bấm để nạp nhanh 1-Click):
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {SAMPLE_PROJECTS.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelectPreset(item)}
              className="text-left text-[11px] font-bold px-2.5 py-1.5 bg-white border-2 border-black hover:bg-black hover:text-[#FFED66] shadow-[2px_2px_0_0_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer truncate max-w-full"
            >
              💡 {item.title}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* SECTION 1: CỐT LÕI (CHỈ CẦN NHẬP TÊN ĐỀ TÀI & NỘI DUNG) */}
        <div className="p-5 bg-[#ffffff] border-[3px] border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b-4 border-black">
            <div className="w-6 h-6 bg-[#A3E635] border-2 border-black flex items-center justify-center text-black">
              <Lightbulb className="w-3.5 h-3.5 stroke-[3]" />
            </div>
            <h3 className="text-sm font-black text-black uppercase tracking-wider">
              1. Thông Tin Đề Tài (Trọng tâm 1-Click)
            </h3>
          </div>

          <div className="space-y-4">
            {/* TÊN ĐỀ TÀI - BẮT BUỘC */}
            <div className="group relative">
              <label className={labelClass}>
                Tên Chủ Đề / Đề Tài Đồ Án <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <FolderGit2 className={iconClass} />
                <input
                  type="text"
                  className={inputClass}
                  placeholder="Vd: Xây dựng hệ thống nhận diện khuôn mặt điểm danh sinh viên..."
                  value={config.title}
                  onChange={e => handleChange('title', e.target.value)}
                  required
                />
              </div>
            </div>

            {/* MÔ TẢ Ý TƯỞNG / NỘI DUNG CƠ BẢN */}
            <div className="group relative">
              <label className={labelClass}>
                Nội Dung Cơ Bản / Ý Tưởng Đề Tài (Nếu có)
              </label>
              <textarea
                className="w-full p-3 bg-[#ffffff] rounded-none border-[3px] border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] text-sm font-medium text-black placeholder:text-gray-400 min-h-[90px] focus:ring-0"
                placeholder="Mô tả tóm tắt ý tưởng, mục đích, công nghệ mong muốn (vd: React, Python FastAPI, YOLOv8, PostgreSQL...)... Nếu để trống, AI sẽ tự động phân tích và thiết kế kiến trúc tối ưu nhất."
                value={config.description || ''}
                onChange={e => handleChange('description', e.target.value)}
              />
            </div>

            {/* LOẠI ĐỒ ÁN & PHẠM VI XUẤT BẢN */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="group relative">
                <label className={labelClass}>Loại Đồ Án / Đề Tài</label>
                <div className="relative">
                  <GraduationCap className={iconClass} />
                  <select
                    className={selectClass}
                    value={config.projectType}
                    onChange={e => handleChange('projectType', e.target.value)}
                  >
                    <option value="capstone_thesis">Đồ án / Khóa luận tốt nghiệp</option>
                    <option value="subject_project">Đồ án môn học chuyên ngành</option>
                    <option value="student_research">Nghiên cứu khoa học SV (NCKH)</option>
                    <option value="master_thesis">Luận văn Thạc sĩ</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-[15px] w-4 h-4 text-black" />
                </div>
              </div>

              <div className="group relative">
                <label className={labelClass}>Phạm Vi Đầu Ra</label>
                <div className="relative">
                  <Layers className={iconClass} />
                  <select
                    className={selectClass}
                    value={config.outputScope}
                    onChange={e => handleChange('outputScope', e.target.value)}
                  >
                    <option value="full_report">Báo cáo Toàn văn 5 Chương + Lộ trình</option>
                    <option value="proposal_roadmap">Đề cương & Lộ trình WBS chi tiết</option>
                    <option value="defense_prep">Slide Outline & Bộ câu hỏi Hội đồng</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-[15px] w-4 h-4 text-black" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: TÙY CHỌN NÂNG CAO (TRƯỜNG, KHOA, TÀI LIỆU RAG) */}
        <div className="border-[3px] border-black bg-white shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full p-4 flex items-center justify-between text-left font-black text-xs uppercase tracking-wider bg-[#F1F5F9] hover:bg-[#E2E8F0] transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <School className="w-4 h-4 stroke-[3]" />
              <span>2. Thông tin trường, khoa & Định dạng học thuật (Tùy chọn)</span>
            </span>
            <ChevronDown className={`w-4 h-4 transform transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
          </button>

          {showAdvanced && (
            <div className="p-5 space-y-4 border-t-2 border-black">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="group relative">
                  <label className={labelClass}>Tên Trường Đại Học</label>
                  <div className="relative">
                    <School className={iconClass} />
                    <input
                      type="text"
                      className={inputClass}
                      value={config.university}
                      onChange={e => handleChange('university', e.target.value)}
                      placeholder="Trường ĐH Bách Khoa, ĐHQG..."
                    />
                  </div>
                </div>

                <div className="group relative">
                  <label className={labelClass}>Khoa / Viện Đào Tạo</label>
                  <div className="relative">
                    <BookOpen className={iconClass} />
                    <input
                      type="text"
                      className={inputClass}
                      value={config.faculty}
                      onChange={e => handleChange('faculty', e.target.value)}
                      placeholder="Khoa Công Nghệ Thông Tin..."
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="group relative">
                  <label className={labelClass}>Chuyên Ngành</label>
                  <div className="relative">
                    <Layers className={iconClass} />
                    <input
                      type="text"
                      className={inputClass}
                      value={config.major}
                      onChange={e => handleChange('major', e.target.value)}
                      placeholder="Kỹ thuật phần mềm, Cơ điện tử..."
                    />
                  </div>
                </div>

                <div className="group relative">
                  <label className={labelClass}>Tiêu Chuẩn Định Dạng</label>
                  <div className="relative">
                    <FileText className={iconClass} />
                    <select
                      className={selectClass}
                      value={config.standardFormat}
                      onChange={e => handleChange('standardFormat', e.target.value)}
                    >
                      <option value="engineering">Chuẩn ĐH Bách Khoa / Kỹ Thuật</option>
                      <option value="academic_vnu">Chuẩn ĐHQG / Khoa học Tự nhiên</option>
                      <option value="ieee">Chuẩn IEEE Quốc Tế</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-[15px] w-4 h-4 text-black" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="group relative">
                  <label className={labelClass}>Sinh Viên Thực Hiện</label>
                  <div className="relative">
                    <User className={iconClass} />
                    <input
                      type="text"
                      className={inputClass}
                      value={config.studentName}
                      onChange={e => handleChange('studentName', e.target.value)}
                      placeholder="Nguyễn Văn A (MSSV: 2110001)"
                    />
                  </div>
                </div>

                <div className="group relative">
                  <label className={labelClass}>Giảng Viên Hướng Dẫn</label>
                  <div className="relative">
                    <User className={iconClass} />
                    <input
                      type="text"
                      className={inputClass}
                      value={config.supervisor}
                      onChange={e => handleChange('supervisor', e.target.value)}
                      placeholder="TS. Nguyễn Văn B"
                    />
                  </div>
                </div>
              </div>

              <div className="group relative">
                <label className={labelClass}>Yêu Cầu Kỹ Thuật Thêm (Tùy chọn)</label>
                <textarea
                  className="w-full p-3 bg-[#ffffff] rounded-none border-[3px] border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] text-sm font-medium text-black placeholder:text-gray-400 min-h-[60px]"
                  placeholder="Vd: Bắt buộc dùng PostgreSQL, bổ sung mô hình triển khai Microservices, viết bằng gói listings để highlight code Python..."
                  value={config.details || ''}
                  onChange={e => handleChange('details', e.target.value)}
                />
              </div>
            </div>
          )}
        </div>

        {/* SECTION 3: ĐÍNH KÈM TÀI LIỆU PDF (ĐỀ CƯƠNG / SLIDE HƯỚNG DẪN TỪ GVHD) */}
        <PdfUploadZone
          attachedPdf={config.attachedPdf}
          onPdfAttached={(pdf) => setConfig(prev => ({ ...prev, attachedPdf: pdf }))}
          onPdfRemoved={() => setConfig(prev => ({ ...prev, attachedPdf: undefined }))}
          globalPinnedPdf={globalPinnedPdf}
          isGlobalRagActive={isGlobalRagActive}
          onSetGlobalPin={onSetGlobalPin}
        />

        {/* ACTION BUTTONS (2 NÚT 1-CLICK CHUẨN) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            onClick={() => {
              if (!config.title.trim()) return;
              const finalConfig = { ...config, attachedPdf: effectivePdf || undefined };
              if (onDirectAutomate) onDirectAutomate(finalConfig);
              else onSubmit(finalConfig);
            }}
            disabled={isLoading || !config.title.trim()}
            className={`relative flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-none text-black font-black uppercase tracking-wider text-xs sm:text-sm border-4 border-black shadow-[5px_5px_0_0_rgba(0,0,0,1)] transition-all duration-75 active:translate-y-[3px] active:translate-x-[3px] active:shadow-none cursor-pointer
              ${(isLoading || !config.title.trim())
                ? 'bg-[#E2E8F0] cursor-not-allowed text-gray-400 shadow-none border-gray-400' 
                : 'bg-[#00CECB] hover:bg-[#00b2af] text-black'}`}
            title="Kích hoạt tự động hóa 1-Click: Biên dịch báo cáo đồ án trên Overleaf & Xuất PDF"
          >
            <Zap className="w-5 h-5 stroke-[3] fill-black" />
            <span>⚡ Chạy 1-Click (Xuất PDF)</span>
          </button>

          <button
            type="submit"
            disabled={isLoading || !config.title.trim()}
            className={`relative flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-none text-black font-black uppercase tracking-wider text-xs sm:text-sm border-4 border-black shadow-[5px_5px_0_0_rgba(0,0,0,1)] transition-all duration-75 active:translate-y-[3px] active:translate-x-[3px] active:shadow-none cursor-pointer
              ${(isLoading || !config.title.trim())
                ? 'bg-[#E2E8F0] cursor-not-allowed text-gray-400 shadow-none border-gray-400' 
                : 'bg-[#FFED66] hover:bg-[#FFECA1] text-black'}`}
            title="Sinh Prompt LaTeX đồ án và hiển thị bên cột xem trước"
          >
            <FileText className="w-5 h-5 stroke-[3]" />
            <span>📝 Tạo Prompt Báo Cáo</span>
          </button>
        </div>

      </form>
    </div>
  );
};

export default ProjectForm;
