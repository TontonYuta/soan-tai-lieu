import { ExamConfig, LearningConfig } from "../types";

// Template cho Đề thi LaTeX
export const generateExamContent = async (config: ExamConfig): Promise<string> => {
  await new Promise(resolve => setTimeout(resolve, 500));

  const totalQuestions = config.counts.mc + config.counts.essay;
  const totalMatrix = config.matrix.lv1 + config.matrix.lv2 + config.matrix.lv3 + config.matrix.lv4;
  
  if (totalMatrix !== totalQuestions) {
      return `LỖI CẤU HÌNH: Tổng số câu trong ma trận (${totalMatrix}) không khớp với tổng số lượng câu hỏi đã khai báo (${totalQuestions}).`;
  }

  const prompt = `Đóng vai trò là giáo viên bộ môn ${config.subject} (Lớp ${config.grade}) có nhiều kinh nghiệm soạn đề thi chuẩn hóa. Hãy giúp tôi soạn thảo mã nguồn LaTeX cho một đề kiểm tra hoàn chỉnh.

I. THÔNG TIN HEADER (TIÊU ĐỀ):
- Đơn vị (Sở/Trường): ${config.school}
- Tên kỳ thi: ${config.examName}
- Năm học: ${config.year}
- Môn thi: ${config.subject}
- Lớp/Trình độ: ${config.grade}
- Thời gian làm bài: ${config.time} phút

II. NỘI DUNG & CẤU TRÚC ĐỀ:
- Chủ đề trọng tâm: ${config.topic}
- Tổng số câu hỏi: ${totalQuestions} câu
- Trắc nghiệm: ${config.counts.mc} câu.
- Tự luận: ${config.counts.essay} câu.

III. MA TRẬN PHÂN BỔ CÂU HỎI (ĐỘ KHÓ):
- Nhận biết: ${config.matrix.lv1} câu
- Thông hiểu: ${config.matrix.lv2} câu
- Vận dụng thấp: ${config.matrix.lv3} câu
- Vận dụng cao: ${config.matrix.lv4} câu

IV. YÊU CẦU VỀ KỸ THUẬT LATEX (BẮT BUỘC):
1. Class & Packages:
   \\documentclass[12pt,a4paper]{article}
   \\usepackage[utf8]{vietnam}
   \\usepackage{amsmath, amssymb, amsthm}
   \\usepackage[top=2cm, bottom=2cm, left=2cm, right=2cm, headheight=20pt]{geometry} 
   \\usepackage{enumitem}
   \\usepackage{multicol}
   \\usepackage{fancyhdr}
   \\usepackage{tikz}

2. Định dạng Header:
   - Header trái: "${config.school}", "ĐỀ ${config.examName.toUpperCase()}".
   - Header phải: "Năm học ${config.year}", "Môn: ${config.subject} - Lớp ${config.grade}".
   - Tiêu đề lớn: "ĐỀ KIỂM TRA MÔN ${config.subject.toUpperCase()}" in đậm.
   - Thêm \\vspace{0.5cm} sau tiêu đề.

3. Định dạng:
   - Trắc nghiệm: 4 cột (multicols{4}).
   - Tự luận: \\section*{PHẦN TỰ LUẬN}.

4. Output:
   - Chỉ trả về code LaTeX trong block code.
   - Kèm bảng đáp án và hướng dẫn chấm.

Hãy bắt đầu soạn thảo ngay bây giờ.`;

  return prompt;
};

// Template cho Nội dung Học tập dạng LaTeX
export const generateLearningContent = async (config: LearningConfig): Promise<string> => {
    await new Promise(resolve => setTimeout(resolve, 500));
  
    let documentType = "";
    if (config.goal === 'summary') {
        documentType = "TÓM TẮT LÝ THUYẾT";
    } else if (config.goal === 'detailed') {
        documentType = "BÀI GIẢNG CHI TIẾT";
    } else {
        documentType = "PHIẾU BÀI TẬP TỰ LUYỆN";
    }

    const prompt = `Đóng vai trò là giáo viên bộ môn ${config.subject} (Lớp ${config.grade}) tâm huyết. Hãy giúp tôi soạn thảo TÀI LIỆU HỌC TẬP dạng LaTeX chuẩn chỉnh, chuyên nghiệp.

I. THÔNG TIN HEADER:
- Đơn vị: ${config.school}
- Năm học: ${config.year}
- Môn: ${config.subject}
- Lớp: ${config.grade}
- Tiêu đề chính tài liệu: ${documentType}
- Chủ đề: ${config.topic}

II. YÊU CẦU NỘI DUNG (${config.goal}):
- Mục tiêu: ${config.goal}
- Đối tượng: ${config.audience}
- Phong cách: ${config.tone}
${config.goal === 'summary' ? '- Tóm tắt lý thuyết dạng sơ đồ hoặc bảng biểu. Vẫn cần 1-2 ví dụ điển hình cho công thức khó.' : ''}
${config.goal === 'detailed' ? '- Trình bày cực kỳ chi tiết: Định nghĩa -> Định lý/Công thức -> Hệ quả.' : ''}
${config.goal === 'detailed' ? '- QUAN TRỌNG: Cung cấp NHIỀU ví dụ minh họa (tối thiểu 4-5 ví dụ mỗi dạng bài). Ví dụ phân cấp từ Nhận biết -> Vận dụng cao.' : ''}
${config.goal === 'exercises' ? '- Danh sách bài tập phân loại các dạng toán thường gặp. Mỗi dạng có ít nhất 5 bài tập.' : ''}

III. YÊU CẦU KỸ THUẬT LATEX (BẮT BUỘC):
1. Class & Packages:
   \\documentclass[12pt,a4paper]{article}
   \\usepackage[utf8]{vietnam}
   \\usepackage{amsmath, amssymb, amsthm}
   \\usepackage{graphicx}
   \\usepackage[top=2cm, bottom=2cm, left=2cm, right=2cm]{geometry} 
   \\usepackage{fancyhdr}
   \\usepackage{tcolorbox}
   \\usepackage{enumitem}
   \\usepackage{hyperref}

2. Định dạng Header:
   - Header trái: ${config.school}
   - Header phải: Môn ${config.subject} - Lớp ${config.grade} - Năm học ${config.year}
   - Tiêu đề giữa trang: \\begin{center} \\textbf{\\large ${documentType}}\\\\ \\vspace{0.3cm} \\textbf{\\Large CHỦ ĐỀ: ${config.topic.toUpperCase()}} \\end{center}

3. TRÌNH BÀY VÍ DỤ VÀ LỜI GIẢI (RẤT QUAN TRỌNG):
   - Sử dụng môi trường hoặc định dạng rõ ràng cho Ví dụ. 
   - Cấu trúc: \\textbf{Ví dụ n:} [Nội dung đề bài]
   - Phần Lời giải (\\textit{Lời giải:}):
     + TUYỆT ĐỐI KHÔNG viết lời giải thành một đoạn văn liền tù tì (wall of text).
     + Phải xuống dòng (\\\\ hoặc dòng mới) sau mỗi bước biến đổi toán học hoặc lập luận logic.
     + Các phương trình/công thức chính phải để ở dòng riêng (sử dụng \\[ ... \\] hoặc $$ ... $$).
     + Nếu lời giải có nhiều trường hợp hoặc bước, hãy dùng môi trường itemize hoặc enumerate.
     + Giữa các ví dụ phải có khoảng cách (\\vspace{0.5cm}).

4. Output:
   - CHỈ TRẢ VỀ CODE LATEX hoàn chỉnh trong block code.
   - KHÔNG kèm lời dẫn linh tinh.

Hãy bắt đầu soạn thảo ngay.`;
  
    return prompt;
  };