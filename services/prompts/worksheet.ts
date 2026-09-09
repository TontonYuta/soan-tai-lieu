import { WorksheetConfig } from "../../types";
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


export const generateWorksheetPrompt = (config: WorksheetConfig): string => {
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

  return `Đóng vai Giáo viên ${subjectName} chuyên nghiệp và Master LaTeX.
Nhiệm vụ: Tạo một phiếu bài tập thực hành (Worksheet) bài bản, chuẩn mực cho chủ đề được yêu cầu.

I. THÔNG TIN PHIẾU BÀI TẬP:
- Môn học: ${subjectName} (Khối / Lớp ${config.grade})
- Chủ đề: ${config.topic}
- Giáo viên biên soạn: ${config.teacherName}
- Ngôn ngữ: ${languageInstruction}
- Yêu cầu nâng cao: ${config.details || "Không"}
${ragSection}

II. NGUYÊN TẮC BIÊN SOẠN BÀI TẬP ĐA MÔN:
- **LOGIC TĂNG DẦN ĐỘ KHÓ:** Thiết kế bài tập theo thang đo logic: Từ cơ bản (áp dụng công thức/khái niệm liền) -> Mức trung bình (cần biến đổi 1-2 bước) -> Vận dụng linh hoạt.
- **KHÍT VỚI CHỦ ĐỀ:** Đề bài tạo ra phải liên quan chặt chẽ đến CHÍNH XÁC chủ đề được yêu cầu. Dứt điểm phần lý thuyết nào phải ra ngay bài tập phần đó.
- **KHÔNG GIAN LÀM BÀI:** Bắt buộc có dòng chấm (lệnh \\dongke) cho học sinh điền kết quả vào tay, in ra được ngay.
- **ĐIỀU PHỐI DUNG LƯỢNG:** Đảm bảo mã LaTeX hoàn chỉnh 100% từ đầu đến cuối, luôn luôn đóng \\end{document}.

III. CẤU TRÚC MÃ LATEX VÀ MACRO:
KHÔNG tự ý chèn lệnh \\clearpage. Chú trọng dùng các macro đã định sẵn:
- \\dangbai{Dạng bài số...}: Trình bày phương pháp giải cực kỳ ngắn gọn rồi đưa bài làm ngay.
- \\trangbaitap: Mở đầu bài tập tự luyện.
- \\vidu{1} và \\loigiai: Bài mẫu đơn giản.
- \\baitap{1} và \\dongke[3]: Chỗ làm bài (Dòng kẻ chấm). 
- Phần Đáp án ở cuối (Answer Key) vô cùng siêu rút gọn.

IV. KHUNG MÃ LATEX NỀN TẢNG:
${PRE_ALGEBRA_TEMPLATE}

V. CHỈ THỊ ĐẦU RA BẮT BUỘC:
- BẮT BUỘC CHỈ TRẢ VỀ DUY NHẤT 1 KHỐI MÃ NGUỒN LATEX TRONG KHỐI \`\`\`latex ... \`\`\`.
- TUYỆT ĐỐI KHÔNG xuất bất kỳ câu chào hỏi, lời dẫn, giải thích hay nhận xét nào bên ngoài khối code.
- Đảm bảo mã nguồn biên dịch trực tiếp 100% không lỗi trên Overleaf và pdfLaTeX.`;
};
