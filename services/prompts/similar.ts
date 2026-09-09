import { SimilarExerciseConfig } from "../../types";
import { LATEX_TECHNICAL_RULES, PRE_ALGEBRA_TEMPLATE } from "./latex-rules";


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


export const generateSimilarPrompt = (config: SimilarExerciseConfig): string => {
  const subjectName = config.subject || 'Toán học';
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

  const ragSection = sanitizeAndExtractRag(config.attachedPdf);

  return `Đóng vai Giáo viên ${subjectName} chuyên luyện thi và biên soạn tài liệu LaTeX chuyên nghiệp.
Nhiệm vụ của bạn: Phát triển bộ bài tập tương tự / đổi số từ bài toán mẫu được cung cấp dưới đây.

I. THÔNG TIN YÊU CẦU:
- Môn học: ${subjectName} ${config.grade ? `(Lớp ${config.grade})` : ''}
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

III. QUY TẮC SÁNG TẠO & KHOA HỌC (BẮT BUỘC):
- **BẢO TOÀN PHƯƠNG PHÁP CỐT LÕI:** Các bài tập tạo mới phải giữ đúng dạng tư duy của bài mẫu, thay đổi số liệu/ngữ cảnh hợp lý (số nghiệm đẹp, không vô lý).
- **CHẤT LƯỢNG DỮ LIỆU:** Đảm bảo mọi bài toán/bài tập đều có nghiệm thực tế, logic giải chặt chẽ, kiểm tra tính toán cẩn thận.
- **KHÔNG NGÔN TỪ HOA MỸ:** Văn phong ngắn gọn, trong sáng, chuẩn mực sư phạm.
- **ĐIỀU PHỐI DUNG LƯỢNG:** Luôn đảm bảo hoàn tất toàn bộ file LaTeX và đóng \\end{document}.

IV. QUY TẮC KỸ THUẬT LATEX & KHUNG TÀI LIỆU:
${LATEX_TECHNICAL_RULES}

BẮT BUỘC sử dụng khung tài liệu LaTeX sau (thay thế nội dung các bài tập tương tự vào phần tương ứng):
${PRE_ALGEBRA_TEMPLATE}

V. CHỈ THỊ ĐẦU RA BẮT BUỘC:
- BẮT BUỘC CHỈ TRẢ VỀ DUY NHẤT 1 KHỐI MÃ NGUỒN LATEX TRONG KHỐI \`\`\`latex ... \`\`\`.
- TUYỆT ĐỐI KHÔNG xuất bất kỳ câu chào hỏi, lời dẫn, giải thích hay nhận xét nào bên ngoài khối code.
- Đảm bảo mã nguồn biên dịch trực tiếp 100% không lỗi trên Overleaf và pdfLaTeX.`;
};
