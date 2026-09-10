import { LearningConfig } from "../../types";
import { LATEX_TECHNICAL_RULES, LEARNING_TEMPLATE } from "./latex-rules";


const sanitizeAndExtractRag = (attachedPdf?: { fileName: string; numPages: number; text: string }): string => {
  if (!attachedPdf?.text) return "";
  const rawText = attachedPdf.text.replace(/\r/g, "");
  // Lọc sạch watermark, số điện thoại rác, link web và số trang lặp
  const cleaned = rawText
    .replace(/(?:-?\s*Trang\s*:?\s*\d+(?:\/\d+)?\s*-?|-?\s*Page\s*:?\s*\d+(?:\/\d+)?\s*-?|SĐT:?\s*\d{8,12}|Hotline:?\s*\d{8,12}|Website:?\s*\S+)/gi, "")
    .replace(/^(?:Trang|Page)\s+\d+.*$/gim, "")
    .trim();

  let chunk = "";
  if (cleaned.length <= 15000) {
    chunk = cleaned;
  } else {
    // Smart RAG: Lấy 4.000 ký tự đầu (Mục lục, tổng quan) + 11.000 ký tự trọng tâm bài tập ở các trang sau
    const head = cleaned.slice(0, 4000);
    const tail = cleaned.slice(-11000);
    chunk = `${head}\n\n[... CẮT LƯỢC PHẦN GIỮA, NỐI PHẦN BÀI TẬP VÀ ĐÁP ÁN TRỌNG TÂM TRANG SAU ...]\n\n${tail}`;
  }

  return `\n====================================================
TÀI LIỆU PDF ĐÍNH KÈM THAM KHẢO (RAG CONTEXT):
- Tên tài liệu: ${attachedPdf.fileName} (${attachedPdf.numPages} trang)
- Nội dung trích xuất:
"""
${chunk}
"""
- CHỈ THỊ RAG (BẮT BUỘC TUÂN THỦ TUYỆT ĐỐI):
  * Chắt lọc các câu hỏi, dữ kiện, hàm số, cấu trúc bài toán và phong cách sư phạm từ tài liệu trên để biên soạn nội dung sát nhất.
  * TUYỆT ĐỐI KHÔNG chèn bất kỳ nhãn trích dẫn nguồn, số trang hay từ khóa nội bộ nào vào đề bài hay lời giải (VÍ DỤ CẤM VIẾT: 'Câu 1 (RAG trang 2)', 'Câu 1 (RAG)', '[RAG]', '(Nguồn: ...)', '(Tham khảo trang X)').
  * Toàn bộ câu hỏi phải được hiển thị tự nhiên, chuẩn mực: \\cauhoi{1}, \\cauhoi{2}... hoặc \\textbf{Câu 1.}, \\textbf{Câu 2.}... như một đề thi chính thức chuẩn quốc gia.
====================================================\n`;
};


export const generateLearningPrompt = (config: LearningConfig): string => {
  const subjectName = config.subject || 'Toán học';
  let languageInstruction = "";
  if (config.language === "vietnamese" || !config.language) {
    languageInstruction = "Sử dụng 100% TIẾNG VIỆT.";
  } else if (config.language === "english") {
    languageInstruction = "Sử dụng 100% TIẾNG ANH.";
  } else {
    languageInstruction = "Sử dụng SONG NGỮ (Anh - Việt).";
  }

  const goalText = 
    config.goal === 'summary' ? 'Tóm tắt lý thuyết trọng tâm và các công thức/quy tắc cần nhớ' :
    config.goal === 'detailed' ? 'Biên soạn bài giảng chi tiết toàn diện từ định nghĩa, khái niệm đến chứng minh/phân tích' :
    'Lý thuyết kết hợp nhiều ví dụ mẫu và phương pháp giải từng dạng bài';

  const ragSection = sanitizeAndExtractRag(config.attachedPdf);

  return `Đóng vai Giáo viên ${subjectName} chuyên nghiệp và Master LaTeX.
Nhiệm vụ: Biên soạn một tài liệu bài giảng/bài học chuẩn mực, trực quan, sinh động và thích ứng linh hoạt theo từng bài học/chủ đề.

I. THÔNG TIN BÀI HỌC:
- Môn học: ${subjectName} (Lớp / Khối ${config.grade})
- Chủ đề: ${config.topic}
- Đơn vị / Trường: ${config.school} (${config.year})
- Mục tiêu bài giảng: ${goalText}
- Đối tượng người học: ${config.audience}
- Ngôn ngữ: ${languageInstruction}
- Yêu cầu bổ sung: ${config.details || "Không"}
${ragSection}

II. NGUYÊN TẮC BỐ CỤC TRỰC QUAN & SƯ PHẠM ĐA MÔN (KHÔNG CỨNG NHẮC):
- **BỐ CỤC TRỰC QUAN THÍCH ỨNG (ADAPTIVE VISUAL HIERARCHY):**
  * Không dập khuôn một kiểu văn bản đơn điệu. Cấu trúc bài giảng phải uyển chuyển theo bản chất từng chủ đề:
    • Chủ đề Hình học / Đồ thị / Thí nghiệm: Bố cục 2 cột song song (\\cauhoicohinh) để hình vẽ TikZ, đồ thị hoặc sơ đồ nằm liền kề với lời giải thích/ví dụ mẫu.
    • Chủ đề Phân loại / Đối chiếu 2 trạng thái (Đồng biến vs Nghịch biến, Cực đại vs Cực tiểu, Phản ứng tỏa nhiệt vs Thu nhiệt): Dùng bảng 2 cột so sánh trực quan hoặc 2 thẻ màu đối chiếu.
    • Phân tầng thị giác bằng hệ thống thẻ màu chuyên dụng:
      - \\hopkienthuc{Kiến thức trọng tâm}{...}: Định nghĩa, khái niệm cốt lõi (Khung xanh dương).
      - \\phuongphap{Phương pháp giải}{...}: Thuật toán và các bước tư duy chuẩn (Khung xanh lục).
      - \\luuy{Bẫy sai lầm & Lưu ý}{...}: Cảnh báo ngộ nhận phòng thi (Khung hổ phách/cam).
      - \\meonhanh{Bí quyết & Thủ thuật}{...}: Mẹo giải nhanh, cách bấm máy tính (Khung tím).
- **ĐAN XEN LÝ THUYẾT VÀ VÍ DỤ MINH HỌA:**
  * Cứ sau mỗi đơn vị kiến thức nhỏ, đưa ngay 1-2 ví dụ minh họa kèm phân tích logic (\\vidu, \\loigiai) để học sinh nắm chắc ngay.
- **ĐIỀU PHỐI DUNG LƯỢNG:** Đảm bảo mã LaTeX hoàn chỉnh 100%, đóng \\end{document} đầy đủ.

III. QUY TẮC LATEX:
${LATEX_TECHNICAL_RULES}

IV. KHUNG TÀI LIỆU NỀN TẢNG:
${LEARNING_TEMPLATE}

V. CHỈ THỊ ĐẦU RA BẮT BUỘC:
- BẮT BUỘC CHỈ TRẢ VỀ DUY NHẤT 1 KHỐI MÃ NGUỒN LATEX TRONG KHỐI \`\`\`latex ... \`\`\`.
- TUYỆT ĐỐI KHÔNG xuất bất kỳ câu chào hỏi, lời dẫn, giải thích hay nhận xét nào bên ngoài khối code.
- Đảm bảo mã nguồn biên dịch trực tiếp 100% không lỗi trên Overleaf và pdfLaTeX.`;
};
