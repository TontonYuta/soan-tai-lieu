import { SimilarExerciseConfig } from "../../types";
import { LATEX_TECHNICAL_RULES, PRE_ALGEBRA_TEMPLATE } from "./latex-rules";


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
Nhiệm vụ của bạn: Phát triển bộ bài tập tương tự / đổi số từ bài toán mẫu được cung cấp dưới đây, trình bày trực quan, linh hoạt theo từng dạng bài.

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

III. QUY TẮC SÁNG TẠO & BỐ CỤC TRỰC QUAN (KHÔNG CỨNG NHẮC):
- **BẢO TOÀN PHƯƠNG PHÁP CỐT LÕI:** Các bài tập tạo mới phải giữ đúng dạng tư duy của bài mẫu, thay đổi số liệu/ngữ cảnh hợp lý (số nghiệm đẹp, không vô lý).
- **BỐ CỤC TRỰC QUAN THÍCH ỨNG THEO CHỦ ĐỀ:**
  * Nếu bài toán mẫu có hình vẽ hoặc đồ thị: BẮT BUỘC các bài tập tương tự sinh ra cũng có hình vẽ TikZ hoặc đồ thị tương ứng, trình bày 2 cột song song qua macro \\cauhoicohinh để hình nằm cạnh đề bài.
  * Với bài toán đại số/tính toán: Bố trí không gian làm bài \\dongke[3] hoặc \\khungnhap[3.5cm] cho học sinh làm bài trực tiếp.
  * Header tinh gọn ở đầu trang 1 (Họ tên, Lớp, Ngày, Điểm số), bắt đầu làm bài ngay từ trang 1.
- **CHẤT LƯỢNG DỮ LIỆU:** Đảm bảo mọi bài toán đều có nghiệm thực tế, logic giải chặt chẽ, kiểm tra tính toán cẩn thận.
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
