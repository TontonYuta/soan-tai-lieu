import { RoadmapConfig } from "../../types";
import { LATEX_TECHNICAL_RULES, ROADMAP_TEMPLATE } from "./latex-rules";

export const generateRoadmapPrompt = (config: RoadmapConfig): string => {
  let languageInstruction = "";
  if (config.language === "vietnamese" || !config.language) {
    languageInstruction = "Sử dụng 100% TIẾNG VIỆT.";
  } else if (config.language === "english") {
    languageInstruction = "Sử dụng 100% TIẾNG ANH.";
  } else {
    languageInstruction = "Sử dụng SONG NGỮ (Anh - Việt).";
  }

  const ragSection = config.attachedPdf ? `
====================================================
TÀI LIỆU PDF ĐÍNH KÈM THAM KHẢO (RAG CONTEXT):
- Tên tài liệu: ${config.attachedPdf.fileName} (${config.attachedPdf.numPages} trang)
- Nội dung trích xuất từ tài liệu:
"""
${config.attachedPdf.text.slice(0, 15000)}
"""
- CHỈ THỊ RAG (QUAN TRỌNG): BẮT BUỘC bám sát cấu trúc phân phối chương trình và đề cương trong tài liệu PDF đính kèm để phân kỳ lộ trình học tập.
====================================================` : '';

  return `Đóng vai Chuyên gia Cố vấn Học tập Toán học và Master LaTeX.
Nhiệm vụ: Thiết kế lộ trình học tập từ A đến Z cho chủ đề được yêu cầu.

I. THÔNG TIN LỘ TRÌNH:
- Môn học: ${config.subject}
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