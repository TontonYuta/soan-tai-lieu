import { LearningConfig } from "../../types";
import { LATEX_TECHNICAL_RULES, LEARNING_TEMPLATE } from "./latex-rules";

export const generateLearningPrompt = (config: LearningConfig): string => {
  let languageInstruction = "";
  if (config.language === "vietnamese" || !config.language) {
    languageInstruction = "Sử dụng 100% TIẾNG VIỆT.";
  } else if (config.language === "english") {
    languageInstruction = "Sử dụng 100% TIẾNG ANH.";
  } else {
    languageInstruction = "Sử dụng SONG NGỮ (Anh - Việt).";
  }

  const goalText = 
    config.goal === 'summary' ? 'Tóm tắt lý thuyết trọng tâm và các công thức cần nhớ' :
    config.goal === 'detailed' ? 'Biên soạn bài giảng chi tiết toàn diện từ định nghĩa đến chứng minh' :
    'Lý thuyết kết hợp nhiều ví dụ mẫu và phương pháp giải từng dạng toán';

  const ragSection = config.attachedPdf ? `
====================================================
TÀI LIỆU PDF ĐÍNH KÈM THAM KHẢO (RAG CONTEXT):
- Tên tài liệu: ${config.attachedPdf.fileName} (${config.attachedPdf.numPages} trang)
- Nội dung trích xuất từ tài liệu:
"""
${config.attachedPdf.text.slice(0, 15000)}
"""
- CHỈ THỊ RAG (QUAN TRỌNG): BẮT BUỘC chắt lọc định nghĩa, định lý, ví dụ mẫu từ tài liệu PDF đính kèm để biên soạn bài giảng chi tiết, logic.
====================================================` : '';

  return `Đóng vai Giáo viên Toán học chuyên nghiệp và Master LaTeX.
Nhiệm vụ: Biên soạn một tài liệu bài giảng/bài học chuẩn mực cho chủ đề được yêu cầu.

I. THÔNG TIN BÀI HỌC:
- Môn học: ${config.subject} (Lớp ${config.grade})
- Chủ đề: ${config.topic}
- Đơn vị / Trường: ${config.school} (${config.year})
- Mục tiêu bài giảng: ${goalText}
- Đối tượng người học: ${config.audience}
- Ngôn ngữ: ${languageInstruction}
- Yêu cầu bổ sung: ${config.details || "Không"}
${ragSection}


II. NGUYÊN TẮC SƯ PHẠM:
- Đi từ trực quan đến trừu tượng, có ví dụ minh họa và đồ thị/hình vẽ TikZ nếu cần thiết.
- Trình bày công thức toán học rõ ràng, dùng \\hopkienthuc hoặc \\dinhly, \\vidu, \\loigiai.

III. QUY TẮC LATEX:
${LATEX_TECHNICAL_RULES}

IV. KHUNG TÀI LIỆU NỀN TẢNG:
${LEARNING_TEMPLATE}

V. CHỈ THỊ ĐẦU RA BẮT BUỘC:
- BẮT BUỘC CHỈ TRẢ VỀ DUY NHẤT 1 KHỐI MÃ NGUỒN LATEX TRONG KHỐI \`\`\`latex ... \`\`\`.
- TUYỆT ĐỐI KHÔNG xuất bất kỳ câu chào hỏi, lời dẫn, giải thích hay nhận xét nào bên ngoài khối code.
- Đảm bảo mã nguồn biên dịch trực tiếp 100% không lỗi trên Overleaf và pdfLaTeX.`;
};