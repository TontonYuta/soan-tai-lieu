import { SimilarExerciseConfig } from "../../types";
import { LATEX_TECHNICAL_RULES, PRE_ALGEBRA_TEMPLATE } from "./latex-rules";

export const generateSimilarPrompt = (config: SimilarExerciseConfig): string => {
  const difficultyText = 
    config.difficulty === 'easier' ? 'Dễ hơn bài mẫu (giảm bớt bước biến đổi, số liệu tròn trịa)' :
    config.difficulty === 'harder' ? 'Khó hơn bài mẫu (tăng độ biến ảo, phối hợp thêm kiến thức liên quan)' :
    'Giữ nguyên độ khó tương đương bài mẫu (thay đổi tham số/số liệu và bối cảnh)';

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
- CHỈ THỊ RAG (QUAN TRỌNG): BẮT BUỘC nhận diện các bài toán mẫu có trong tài liệu PDF đính kèm để sinh các bài toán tương tự / đổi số chuẩn mực.
====================================================` : '';

  return `Đóng vai Giáo viên Toán học chuyên luyện thi và biên soạn tài liệu LaTeX chuyên nghiệp.
Nhiệm vụ của bạn: Phát triển bộ bài tập tương tự / đổi số từ bài toán mẫu được cung cấp dưới đây.

I. THÔNG TIN YÊU CẦU:
- Môn học: ${config.subject} ${config.grade ? `(Lớp ${config.grade})` : ''}
- Chủ đề: ${config.topic}
- Số lượng bài tập tương tự cần sinh: ${config.count} bài
- Định hướng độ khó: ${difficultyText}
- Bao gồm lời giải chi tiết: ${config.includeSolution ? 'CÓ (trình bày lời giải chi tiết từng bước)' : 'KHÔNG (chỉ cung cấp đáp số tóm tắt ngắn gọn)'}
- Ngôn ngữ: ${languageInstruction}
- Ghi chú bổ sung: ${config.details || "Không có"}
${ragSection}

II. BÀI TẬP MẪU ĐẦU VÀO:
"""
${config.sourceExercises || (config.attachedPdf ? 'Tham khảo bài toán mẫu trong tài liệu PDF đính kèm ở trên' : '')}
"""


III. QUY TẮC SÁNG TẠO & TOÁN HỌC (BẮT BUỘC):
- **BẢO TOÀN PHƯƠNG PHÁP CỐT LÕI:** Các bài tập tạo mới phải giữ đúng dạng tư duy toán học của bài mẫu, thay đổi số liệu hợp lý (số nghiệm đẹp, không vô lý, không bị lỗi mẫu số = 0 hay căn số âm trừ khi đề cố ý).
- **CHẤT LƯỢNG SỐ LIỆU:** Đảm bảo mọi bài toán đều có nghiệm thực tế, logic giải chặt chẽ, kiểm tra tính toán cẩn thận.
- **KHÔNG NGÔN TỪ HOA MỸ:** Văn phong toán học ngắn gọn, trong sáng, chuẩn mực sư phạm.

IV. QUY TẮC KỸ THUẬT LATEX & KHUNG TÀI LIỆU:
${LATEX_TECHNICAL_RULES}

BẮT BUỘC sử dụng khung tài liệu LaTeX sau (thay thế nội dung các bài tập tương tự vào phần tương ứng):
${PRE_ALGEBRA_TEMPLATE}

V. CHỈ THỊ ĐẦU RA BẮT BUỘC:
- BẮT BUỘC CHỈ TRẢ VỀ DUY NHẤT 1 KHỐI MÃ NGUỒN LATEX TRONG KHỐI \`\`\`latex ... \`\`\`.
- TUYỆT ĐỐI KHÔNG xuất bất kỳ câu chào hỏi, lời dẫn, giải thích hay nhận xét nào bên ngoài khối code.
- Đảm bảo mã nguồn biên dịch trực tiếp 100% không lỗi trên Overleaf và pdfLaTeX.`;
};