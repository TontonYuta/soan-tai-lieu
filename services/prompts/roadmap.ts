import { RoadmapConfig } from "../../types";
import { LATEX_TECHNICAL_RULES, ROADMAP_TEMPLATE } from "./latex-rules";


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


export const generateRoadmapPrompt = (config: RoadmapConfig): string => {
  const subjectName = config.subject || 'Toán học';
  let languageInstruction = "";
  if (config.language === "vietnamese" || !config.language) {
    languageInstruction = "Sử dụng 100% TIẾNG VIỆT.";
  } else if (config.language === "english") {
    languageInstruction = "Sử dụng 100% TIẾNG ANH.";
  } else {
    languageInstruction = "Sử dụng SONG NGỮ (Anh - Việt).";
  }

  const ragSection = sanitizeAndExtractRag(config.attachedPdf);

  return `Đóng vai Chuyên gia Cố vấn Học tập ${subjectName} và Master LaTeX.
Nhiệm vụ: Thiết kế lộ trình học tập từ A đến Z cho chủ đề được yêu cầu.

I. THÔNG TIN LỘ TRÌNH:
- Môn học: ${subjectName}
- Chuyên đề: ${config.topic}
- Thời gian dự kiến: ${config.duration}
- Trình độ hiện tại: ${config.currentLevel}
- Mục tiêu đầu ra: ${config.target}
- Ngôn ngữ: ${languageInstruction}
- Yêu cầu nâng cao: ${config.details || "Không"}
${ragSection}

II. QUY TẮC KỸ THUẬT VÀ KHUNG LATEX:
${LATEX_TECHNICAL_RULES}

BẮT BUỘC sử dụng khung sau:
${ROADMAP_TEMPLATE}

III. CHỈ THỊ ĐẦU RA BẮT BUỘC:
- BẮT BUỘC CHỈ TRẢ VỀ DUY NHẤT 1 KHỐI MÃ NGUỒN LATEX TRONG KHỐI \`\`\`latex ... \`\`\`.
- TUYỆT ĐỐI KHÔNG xuất bất kỳ câu chào hỏi, lời dẫn, giải thích hay nhận xét nào bên ngoài khối code.
- Đảm bảo mã nguồn biên dịch trực tiếp 100% không lỗi trên Overleaf và pdfLaTeX.`;
};
