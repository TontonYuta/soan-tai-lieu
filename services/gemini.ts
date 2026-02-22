
import { ExamConfig, LearningConfig, RoadmapConfig } from "../types";

const LATEX_TECHNICAL_RULES = `
QUY TẮC KỸ THUẬT LATEX (BẮT BUỘC):
1. KHÔNG SỬ DỤNG MARKDOWN: Tuyệt đối không dùng **, *, #, - (dấu gạch đầu dòng markdown) bên trong mã nguồn LaTeX. Thay vào đó hãy dùng \textbf{}, \textit{}, \section{}, \begin{itemize}.
2. TIẾNG VIỆT: Sử dụng gói lệnh \\usepackage[utf8]{inputenc} và \\usepackage[vietnamese]{babel} hoặc \\usepackage{vietnam}.
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
  return `Đóng vai Chuyên gia soạn thảo tài liệu giáo dục. Hãy soạn mã nguồn LaTeX cho một "Phiếu học tập" (Worksheet) chuẩn A4, tuân thủ tuyệt đối Style Guide sau đây:

1. CẤU HÌNH KỸ THUẬT (BẮT BUỘC):
- Document class: \\documentclass[12pt, a4paper]{article}
- Packages: geometry (margin 2cm), tcolorbox (option [most]), fancyhdr, enumitem, tabularx, math packages (amsmath, amssymb).
- Ngôn ngữ: Tiếng Việt (\\usepackage[utf8]{inputenc}, \\usepackage[vietnamese]{babel}), \\usepackage[table]{xcolor}.

2. ĐỊNH NGHĨA STYLE (COPY Y HỆT):
- Màu sắc:
  \\definecolor{myBlue}{RGB}{0, 51, 102}
  \\definecolor{myRed}{RGB}{204, 0, 0}
  \\definecolor{myGreen}{RGB}{0, 102, 51}
- Lệnh tắt:
  \\newcommand{\\dcham}{\\dotfill} 
  \\newcommand{\\dtrong}[1]{\\vspace{#1}}
- Header/Footer:
  \\pagestyle{fancy} \\fancyhf{}
  \\lhead{\\textbf{LỚP ${config.subject.toUpperCase()} TONTONYUTA}}
  \\rhead{\\textit{${config.topic}}}
  \\cfoot{Trang \\thepage}

3. CẤU TRÚC NỘI DUNG (THEO THỨ TỰ):
- Tiêu đề: Căn giữa, chữ lớn, màu myBlue. Dưới tiêu đề là dòng "Họ và tên học sinh: ... Lớp: ..."
- Phần I - Lý thuyết (Box chuẩn): Dùng tcolorbox [colback=white, colframe=myBlue, title=...]. Nội dung cô đọng.
- Phần II - Ví dụ mẫu (Box ẩn viền): Dùng tcolorbox [enhanced, colback=myBlue!5, frame hidden, title=...]. Bắt buộc phải có các dòng "..." hoặc lệnh \\dcham để học sinh điền vào (dạng Guided Practice).
- Phần III - Bài tập tự luyện: Liệt kê bài tập, chừa khoảng trống bằng lệnh \\dtrong{...cm} hoặc \\dcham.
- Cuối trang: Một box nhỏ màu vàng/cam (Footer) ghi "Mẹo nhớ" hoặc "Lưu ý".

4. YÊU CẦU NỘI DUNG CỤ THỂ CHO LẦN NÀY:
- Môn học: ${config.subject} (Lớp ${config.grade})
- Tên chuyên đề/Phiếu số: ${config.topic}
- Nội dung chi tiết: ${config.goal === 'summary' ? 'Tóm tắt kiến thức trọng tâm' : config.goal === 'detailed' ? 'Chi tiết kiến thức và phương pháp giải' : 'Tập trung vào hệ thống bài tập thực hành'}.
- Ví dụ và bài tập: Soạn thảo dựa trên đối tượng ${config.audience} với phong cách ${config.tone === 'academic' ? 'hàn lâm' : config.tone === 'creative' ? 'sáng tạo' : 'đơn giản'}.

${LATEX_TECHNICAL_RULES}

Hãy xuất bản mã nguồn hoàn chỉnh ngay.`;
};

export const generateRoadmapPrompt = (config: RoadmapConfig): string => {
  const syllabusContext = config.syllabus 
    ? `DỰA TRÊN ĐỀ CƯƠNG CHI TIẾT SAU:
    ${config.syllabus}
    (Yêu cầu: Phải bám sát thứ tự chương/mục và các từ khóa kiến thức có trong đề cương này để lập lộ trình).` 
    : '';

  return `Đóng vai Kiến trúc sư Giáo dục chuyên nghiệp. Hãy soạn mã LaTeX cho một lộ trình học tập khoa học.

I. THÔNG TIN LỘ TRÌNH:
- Môn học: ${config.subject} | Mục tiêu chính: ${config.topic}
- Thời gian: ${config.duration} | Trình độ hiện tại: ${config.currentLevel}
- Đích đến mong muốn: ${config.target}

II. BỐ CỤC LỘ TRÌNH:
${syllabusContext}
1. Phân bổ kiến thức: Chia nhỏ theo từng ngày/tuần một cách hợp lý để người học không bị quá tải.
2. Logic kế thừa: Ngày sau phải sử dụng hoặc nâng cao kiến thức của ngày trước.
3. Tài liệu tham khảo: Gợi ý các nguồn tài liệu (Sách, giáo trình) phù hợp với mục tiêu.

III. YÊU CẦU KỸ THUẬT:
${LATEX_TECHNICAL_RULES}
- Sử dụng tabularx để tạo bảng lộ trình gồm các cột: Thời gian, Chủ đề chính, Nội dung chi tiết, Lưu ý quan trọng.

Hãy xuất bản mã nguồn hoàn chỉnh ngay.`;
};
