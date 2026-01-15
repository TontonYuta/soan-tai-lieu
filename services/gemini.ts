
import { ExamConfig, LearningConfig, RoadmapConfig } from "../types";

export const generateExamPrompt = (config: ExamConfig): string => {
  const totalQuestions = config.counts.mc + config.counts.essay;
  const matrixInfo = `Nhận biết: ${config.matrix.lv1}, Thông hiểu: ${config.matrix.lv2}, Vận dụng: ${config.matrix.lv3}, Vận dụng cao: ${config.matrix.lv4}`;

  return `Hãy đóng vai là một Chuyên gia soạn thảo đề thi chuẩn hóa của Bộ Giáo dục và Đào tạo Việt Nam. Nhiệm vụ của bạn là viết mã nguồn LaTeX hoàn chỉnh cho một đề thi.

I. NGỮ CẢNH HỆ THỐNG (QUAN TRỌNG):
- Bạn đang trong một chuỗi học tập khép kín. Đề thi này PHẢI dựa trên nội dung đã được đề ra trong lộ trình và bài học trước đó.
- Chủ đề: ${config.topic}
- Môn học: ${config.subject} (Lớp ${config.grade})

II. CẤU TRÚC & ĐỘ KHÓ:
- Tổng số: ${totalQuestions} câu. (Trắc nghiệm: ${config.counts.mc}, Tự luận: ${config.counts.essay}).
- Ma trận: ${matrixInfo}.
${config.referenceContent ? `- KIẾN THỨC ĐÃ DẠY: ${config.referenceContent}. (Tuyệt đối chỉ ra đề trong phạm vi này, không ra đề vào kiến thức chưa học).` : ''}

III. YÊU CẦU KỸ THUẬT LATEX:
- Sử dụng phông chữ đồng bộ với các tài liệu học tập trước đó.
- Bảng đáp án và hướng dẫn giải chi tiết.

Hãy soạn đề ngay.`;
};

export const generateLearningPrompt = (config: LearningConfig): string => {
  const goalsMap = {
    summary: 'Tóm tắt kiến thức cốt lõi (Cheat sheet)',
    detailed: 'Bài giảng chi tiết (Lý thuyết + Ví dụ)',
    exercises: 'Phiếu bài tập rèn luyện (Có đáp án chi tiết)'
  };

  return `Đóng vai trò là Chuyên gia biên soạn học liệu. Hãy giúp tôi soạn thảo mã nguồn LaTeX cho một bài học nằm trong một lộ trình tổng thể.

I. ĐẢM BẢO TÍNH LIÊN KẾT:
- Bạn phải xem xét bài học này là một mắt xích trong lộ trình học tập ${config.subject}. 
- Nội dung: ${config.topic}
- Mục tiêu: ${goalsMap[config.goal]}
- Yêu cầu: Không lặp lại các ví dụ hoặc định nghĩa đã quá cơ bản nếu đây là bài học nâng cao. Hãy gối đầu kiến thức cũ và mở rộng kiến thức mới.

II. NỘI DUNG & CẤU TRÚC:
1. Kết nối: Nhắc lại nhanh 1 câu về kiến thức liên quan từ bài trước.
2. Nội dung chính: Lý thuyết + 3 Ví dụ thực tế.
3. Bài tập: Củng cố đúng mục tiêu đề ra.

III. YÊU CẦU KỸ THUẬT LATEX:
- Sử dụng tcolorbox đồng bộ. 
- Trả về mã nguồn hoàn chỉnh trong 1 block code.

Hãy soạn thảo bài học ngay.`;
};

export const generateRoadmapPrompt = (config: RoadmapConfig): string => {
  return `Đóng vai trò là Kiến trúc sư Giáo dục. Hãy soạn thảo mã nguồn LaTeX cho một "HỆ THỐNG LỘ TRÌNH HỌC TẬP ĐỒNG BỘ".

I. THÔNG TIN:
- Môn học: ${config.subject}
- Mục tiêu: ${config.topic}
- Thời gian: ${config.duration}

II. YÊU CẦU VỀ TÍNH RÕ RÀNG & LIÊN KẾT (BẮT BUỘC):
1. KHÔNG TRÙNG LẶP: Mỗi ngày phải là một bước tiến mới. Không ghi "Học tiếp bài cũ" chung chung.
2. LIÊN KẾT DÂY CHUYỀN: Ngày hôm sau phải sử dụng công cụ hoặc kiến thức của ngày hôm trước để giải quyết vấn đề khó hơn.
3. CHI TIẾT TỪNG NGÀY:
   - Ngày 1: [Tên cụ thể] - [Công việc cụ thể]
   - Ngày 2: [Tên cụ thể] - [Công việc cụ thể]
   ...
4. BƯỚC ĐỆM TIẾP THEO: Sau lộ trình này, gợi ý 2 hướng đi chuyên sâu tiếp theo để người học không bị ngắt quãng.

III. YÊU CẦU KỸ THUẬT LATEX:
- Sử dụng định dạng bảng hoặc danh sách trang trọng.
- Trả về mã nguồn hoàn chỉnh.

Hãy thiết kế lộ trình ngay.`;
};
