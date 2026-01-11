
import { ExamConfig, LearningConfig, RoadmapConfig } from "../types";

export const generateExamPrompt = (config: ExamConfig): string => {
  const totalQuestions = config.counts.mc + config.counts.essay;
  const matrixInfo = `Nhận biết: ${config.matrix.lv1}, Thông hiểu: ${config.matrix.lv2}, Vận dụng: ${config.matrix.lv3}, Vận dụng cao: ${config.matrix.lv4}`;

  return `Hãy đóng vai là một Chuyên gia soạn thảo đề thi chuẩn hóa của Bộ Giáo dục và Đào tạo Việt Nam. Nhiệm vụ của bạn là viết mã nguồn LaTeX hoàn chỉnh cho một đề thi chuyên nghiệp.

I. THÔNG TIN ĐỊNH DANH (HEADER):
- Đơn vị: ${config.school || '[Tên Trường/Sở]'}
- Kỳ thi: ${config.examName}
- Năm học: ${config.year}
- Môn học: ${config.subject} (Lớp ${config.grade})
- Thời gian: ${config.time} phút
- Chủ đề trọng tâm: ${config.topic}

II. CẤU TRÚC & ĐỘ KHÓ:
- Tổng số: ${totalQuestions} câu.
- Trắc nghiệm: ${config.counts.mc} câu (4 lựa chọn A, B, C, D).
- Tự luận: ${config.counts.essay} câu.
- Ma trận: ${matrixInfo}.
${config.referenceContent ? `- NỘI DUNG THAM KHẢO (Ưu tiên kiến thức từ đây): ${config.referenceContent}` : ''}

III. YÊU CẦU KỸ THUẬT LATEX (BẮT BUỘC):
1. Định dạng Header chuẩn THPT Quốc gia: Sử dụng tabularx để chia 2 cột (Trái: Trường/Đề chính thức; Phải: Tên kỳ thi/Mã đề).
2. Thông tin thí sinh: Có dòng chấm lửng cho "Họ tên" và "SBD".
3. Gói lệnh: fontenc[T5], inputenc[utf8], vietnam, amsmath, amssymb, geometry (lề 1.5cm-2cm), fancyhdr, multicol (cho đáp án trắc nghiệm).
4. Listings (Nếu có code): Chú thích (comments) phải viết TIẾNG VIỆT KHÔNG DẤU.

IV. OUTPUT YÊU CẦU:
- Toàn bộ mã nguồn nằm trong 1 block code duy nhất.
- Kèm theo bảng đáp án trắc nghiệm ở cuối.
- Hướng dẫn giải chi tiết cho phần Tự luận.

Hãy bắt đầu soạn đề ngay.`;
};

export const generateLearningPrompt = (config: LearningConfig): string => {
  const goalsMap = {
    summary: 'Tóm tắt kiến thức cốt lõi (Cheat sheet)',
    detailed: 'Bài giảng chi tiết (Lý thuyết + Ví dụ)',
    exercises: 'Phiếu bài tập rèn luyện (Có đáp án chi tiết)'
  };

  return `Đóng vai trò là Chuyên gia biên soạn học liệu bộ môn ${config.subject}. Hãy giúp tôi soạn thảo mã nguồn LaTeX cho một tài liệu học tập chuyên nghiệp.

I. THÔNG TIN ĐỊNH DANH (HEADER):
- Đơn vị: ${config.school || '[Tên Trường/Sở]'}
- Loại tài liệu: ${goalsMap[config.goal]}
- Năm học: ${config.year}
- Môn học: ${config.subject} (Lớp ${config.grade})
- Chủ đề: ${config.topic}
- Đối tượng: ${config.audience}

II. NỘI DUNG & CẤU TRÚC:
1. Mục tiêu: Nêu rõ các kiến thức cần đạt sau bài học.
2. Lý thuyết trọng tâm: Trình bày khoa học, sử dụng tcolorbox cho định nghĩa và công thức.
3. Ví dụ: Ít nhất 3 ví dụ minh họa có lời giải từng bước.
4. Bài tập: Hệ thống câu hỏi củng cố (Trắc nghiệm hoặc Tự luận tùy theo chủ đề).

III. YÊU CẦU KỸ THUẬT LATEX (BẮT BUỘC):
1. Định dạng Header chuyên nghiệp: Sử dụng tabularx hoặc minipage chia 2 cột ở đầu trang tương tự định dạng đề thi chuẩn của Bộ GD&ĐT.
2. Gói lệnh: fontenc[T5], inputenc[utf8], vietnam, amsmath, amssymb, geometry (top=2cm, bottom=2cm, left=2cm, right=2cm), tcolorbox, fancyhdr.
3. Phông chữ: Times New Roman (Sử dụng mathptmx).
4. Listings (Nếu có code): Chú thích (comments) viết TIẾNG VIỆT KHÔNG DẤU.

IV. OUTPUT YÊU CẦU:
- Trả về mã nguồn LaTeX hoàn chỉnh trong một block code duy nhất.
- Đảm bảo biên dịch thành công trên các trình biên dịch PDFLaTeX.

Hãy soạn thảo tài liệu ngay.`;
};

export const generateRoadmapPrompt = (config: RoadmapConfig): string => {
  return `Đóng vai trò là Chuyên gia tư vấn giáo dục và thiết kế lộ trình học tập chuyên sâu. Hãy soạn thảo mã nguồn LaTeX cho một "LỘ TRÌNH HỌC TẬP CHI TIẾT TỪNG NGÀY".

I. THÔNG TIN ĐỊNH DANH (HEADER):
- Môn học: ${config.subject}
- Mục tiêu đề ra: ${config.topic}
- Trình độ hiện tại: ${config.currentLevel}
- Kết quả mong muốn: ${config.target}
- Tổng thời gian: ${config.duration}

II. NỘI DUNG & CẤU TRÚC (QUAN TRỌNG):
1. Đánh giá tổng quan: Phân tích nhanh những gì cần học.
2. LỘ TRÌNH CHI TIẾT THEO NGÀY: Liệt kê chính xác các đầu việc theo mẫu:
   - Ngày 1: [Tên bài học] - Nội dung cụ thể.
   - Ngày 2: [Tên bài học] - Nội dung cụ thể.
   - ... (Lần lượt cho đến ngày cuối).
3. BƯỚC ĐỆM TIẾP THEO (NEXT STEPS): Sau khi học xong lộ trình này, tôi nên học gì tiếp theo? Hãy đề xuất 2-3 chủ đề nâng cao hoặc các ứng dụng thực tế của kiến thức này để duy trì đà tiến bộ.
4. Tài liệu tham khảo: Gợi ý các nguồn tài liệu bổ trợ.

III. YÊU CẦU KỸ THUẬT LATEX (BẮT BUỘC):
1. Định dạng Header: Bảng trang trọng 2 cột.
2. Trình bày: Dùng tcolorbox cho mục "BƯỚC ĐỆM TIẾP THEO" để làm nổi bật định hướng tương lai.
3. Gói lệnh: fontenc[T5], inputenc[utf8], vietnam, amsmath, geometry (top=2cm, bottom=2cm), tcolorbox.

IV. OUTPUT YÊU CẦU:
- Trả về mã nguồn LaTeX hoàn chỉnh trong một block code duy nhất.
- Đảm bảo tính liên tục của việc học bằng cách gợi ý hướng đi mới sau khi kết thúc lộ trình.

Hãy thiết kế lộ trình ngay.`;
};
