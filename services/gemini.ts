
import { ExamConfig, LearningConfig, RoadmapConfig } from "../types";

const LATEX_TECHNICAL_RULES = `
QUY TẮC KỸ THUẬT LATEX (BẮT BUỘC):
1. KHÔNG SỬ DỤNG MARKDOWN: Tuyệt đối không dùng **, *, #, - (dấu gạch đầu dòng markdown) bên trong mã nguồn LaTeX. Thay vào đó hãy dùng \textbf{}, \textit{}, \section{}, \begin{itemize}.
2. TIẾNG VIỆT: Sử dụng gói lệnh \\usepackage[utf8]{inputenc} và \\usepackage[vietnam]{babel} hoặc \\usepackage{vietnam}.
3. TOÁN HỌC: Tất cả công thức phải nằm trong $...$ hoặc \\[ ... \\]. Sử dụng amsmath, amssymb.
4. CẤU TRÚC: Phải bao gồm đầy đủ từ \\documentclass{article} cho đến \\end{document}.
5. TRÁNH LỖI BIÊN DỊCH: Không tự chế các lệnh không tồn tại. Nếu dùng tcolorbox, phải khai báo \\usepackage[most]{tcolorbox}.
`;

export const generateExamPrompt = (config: ExamConfig): string => {
  const totalQuestions = config.counts.mc + config.counts.essay;
  const matrixInfo = `NB: ${config.matrix.lv1}, TH: ${config.matrix.lv2}, VD: ${config.matrix.lv3}, VDC: ${config.matrix.lv4}`;

  return `Đóng vai Chuyên gia soạn đề thi Bộ GD&ĐT Việt Nam. Hãy soạn mã LaTeX cho đề thi sau:

I. THÔNG TIN:
- Trường: ${config.school} | Kỳ thi: ${config.examName} | Môn: ${config.subject} (Lớp ${config.grade})
- Chủ đề: ${config.topic} | Thời gian: ${config.time} phút.
- Cấu trúc: ${config.counts.mc} câu trắc nghiệm (4 lựa chọn A,B,C,D), ${config.counts.essay} câu tự luận.
- Ma trận độ khó: ${matrixInfo}.
${config.referenceContent ? `- NGỮ CẢNH: Dựa vào nội dung đã học: ${config.referenceContent}` : ''}

II. YÊU CẦU NỘI DUNG:
- Câu hỏi trắc nghiệm phải rõ ràng, các phương án nhiễu phải hợp lý.
- Bố cục đáp án trắc nghiệm: Nếu phương án ngắn thì chia 4 cột (multicols{4}), phương án dài thì chia 2 hoặc 1 cột.
- Cuối đề phải có BẢNG ĐÁP ÁN trắc nghiệm và HƯỚNG DẪN GIẢI tự luận.

${LATEX_TECHNICAL_RULES}

Hãy xuất bản mã nguồn hoàn chỉnh ngay.`;
};

export const generateLearningPrompt = (config: LearningConfig): string => {
  return `Đóng vai Chuyên gia biên soạn học liệu. Hãy soạn mã LaTeX cho bài học sau:

I. THÔNG TIN BÀI HỌC:
- Môn: ${config.subject} (Lớp ${config.grade}) | Chủ đề: ${config.topic}
- Mục tiêu: ${config.goal} | Đối tượng: ${config.audience}
- Yêu cầu: Kết nối kiến thức cũ, dẫn dắt vào kiến thức mới một cách logic, không trùng lặp.

II. CẤU TRÚC TÀI LIỆU:
1. Lý thuyết: Trình bày trong các tcolorbox có tiêu đề rõ ràng.
2. Ví dụ minh họa: Ít nhất 3 ví dụ từ dễ đến khó, có lời giải chi tiết.
3. Bài tập tự luyện: Phân chia theo cấp độ nhận thức.

${LATEX_TECHNICAL_RULES}

Hãy xuất bản mã nguồn hoàn chỉnh ngay.`;
};

export const generateRoadmapPrompt = (config: RoadmapConfig): string => {
  return `Đóng vai Kiến trúc sư Giáo dục. Hãy soạn mã LaTeX cho lộ trình học tập sau:

I. THÔNG TIN LỘ TRÌNH:
- Môn học: ${config.subject} | Mục tiêu: ${config.topic}
- Thời gian: ${config.duration} | Trình độ: ${config.currentLevel} -> Đích đến: ${config.target}

II. YÊU CẦU CHI TIẾT:
1. Phân bổ kiến thức: Chia nhỏ theo từng ngày/tuần. Ngày sau kế thừa ngày trước.
2. Tuyệt đối không trùng lặp: Mỗi ngày phải có một từ khóa kiến thức mới.
3. Phần "BƯỚC ĐỆM TIẾP THEO": Đề xuất hướng học tập nâng cao sau khi hoàn thành lộ trình này.

${LATEX_TECHNICAL_RULES}
- Sử dụng môi trường tabularx hoặc longtable để làm bảng lộ trình đẹp mắt.

Hãy xuất bản mã nguồn hoàn chỉnh ngay.`;
};
