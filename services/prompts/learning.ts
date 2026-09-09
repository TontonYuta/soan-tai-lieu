import { LearningConfig } from "../../types";
import { LATEX_TECHNICAL_RULES, LEARNING_TEMPLATE } from "./latex-rules";


const sanitizeAndExtractRag = (attachedPdf?: { fileName: string; numPages: number; text: string }): string => {
  if (!attachedPdf?.text) return "";
  const rawText = attachedPdf.text.replace(/\r/g, "");
  // Lọc sạch watermark, số điện thoại rác và số trang lặp
  const cleaned = rawText
    .replace(/(?:Trang\s+\d+\/\d+|SĐT:?\s*\d{8,12}|Hotline:?\s*\d{8,12}|Website:?\s*\S+)/gi, "")
    .trim();

  let chunk = "";
  if (cleaned.length <= 15000) {
    chunk = cleaned;
  } else {
    // Smart RAG: Lấy 4.000 ký tự đầu (Mục lục, tổng quan) + 11.000 ký tự trọng tâm bài tập ở các trang sau
    const head = cleaned.slice(0, 4000);
    const tail = cleaned.slice(-11000);
    chunk = `${head}\n\n[... CẮT LƯỢC TRANG GIỮA, NỐI PHẦN BÀI TẬP VÀ ĐÁP ÁN TRỌNG TÂM TRANG SAU ...]\n\n${tail}`;
  }

  return `\n====================================================
TÀI LIỆU PDF ĐÍNH KÈM THAM KHẢO (RAG CONTEXT):
- Tên tài liệu: ${attachedPdf.fileName} (${attachedPdf.numPages} trang)
- Nội dung trích xuất:
"""
${chunk}
"""
- CHỈ THỊ RAG (QUAN TRỌNG): BẮT BUỘC chắt lọc các câu hỏi, dữ kiện và cấu trúc bài từ tài liệu PDF đính kèm trên để biên soạn nội dung sát nhất.
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
Nhiệm vụ: Biên soạn một tài liệu bài giảng/bài học chuẩn mực cho chủ đề được yêu cầu.

I. THÔNG TIN BÀI HỌC:
- Môn học: ${subjectName} (Lớp / Khối ${config.grade})
- Chủ đề: ${config.topic}
- Đơn vị / Trường: ${config.school} (${config.year})
- Mục tiêu bài giảng: ${goalText}
- Đối tượng người học: ${config.audience}
- Ngôn ngữ: ${languageInstruction}
- Yêu cầu bổ sung: ${config.details || "Không"}
${ragSection}

II. NGUYÊN TẮC SƯ PHẠM ĐA MÔN:
- Đi từ trực quan đến trừu tượng, có ví dụ minh họa và sơ đồ/hình vẽ TikZ nếu cần thiết.
- Trình bày kiến thức rõ ràng, dùng \\hopkienthuc hoặc \\dinhly, \\vidu, \\loigiai, \\doanvan.
- Đảm bảo toàn bộ mã LaTeX hoàn chỉnh, đóng \\end{document} đầy đủ.

III. QUY TẮC LATEX:
${LATEX_TECHNICAL_RULES}

IV. KHUNG TÀI LIỆU NỀN TẢNG:
${LEARNING_TEMPLATE}

V. CHỈ THỊ ĐẦU RA BẮT BUỘC:
- BẮT BUỘC CHỈ TRẢ VỀ DUY NHẤT 1 KHỐI MÃ NGUỒN LATEX TRONG KHỐI \`\`\`latex ... \`\`\`.
- TUYỆT ĐỐI KHÔNG xuất bất kỳ câu chào hỏi, lời dẫn, giải thích hay nhận xét nào bên ngoài khối code.
- Đảm bảo mã nguồn biên dịch trực tiếp 100% không lỗi trên Overleaf và pdfLaTeX.`;
};
