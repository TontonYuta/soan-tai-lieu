import { WorksheetConfig } from "../../types";
import { LATEX_TECHNICAL_RULES, PRE_ALGEBRA_TEMPLATE } from "./latex-rules";

export const generateWorksheetPrompt = (config: WorksheetConfig): string => {
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
- CHỈ THỊ RAG (QUAN TRỌNG): BẮT BUỘC đọc hiểu và bám sát các dạng bài tập, công thức toán học, cấu trúc bài trong tài liệu PDF đính kèm trên để biên soạn phiếu bài tập.
====================================================` : '';

  return `Đóng vai Giáo viên Toán học chuyên nghiệp và Master LaTeX.
Nhiệm vụ: Tạo một phiếu bài tập toán học (Worksheet) bài bản, chuẩn mực cho chủ đề được yêu cầu.

I. THÔNG TIN PHIẾU BÀI TẬP:
- Môn học: ${config.subject} (Khối ${config.grade})
- Chủ đề: ${config.topic}
- Giáo viên biên soạn: ${config.teacherName}
- Ngôn ngữ: ${languageInstruction}
- Yêu cầu nâng cao: ${config.details || "Không"}
${ragSection}

II. NGUYÊN TẮC BIÊN SOẠN BÀI TẬP:
- **LOGIC TĂNG DẦN ĐỘ KHÓ:** Thiết kế bài tập theo thang đo logic: Từ cơ bản (áp dụng công thức liền) -> Mức trung bình (cần biến đổi 1-2 bước) -> Vận dụng linh hoạt. Đi qua từng dạng bài một cách hệ thống.
- **KHÍT VỚI CHỦ ĐỀ:** Đề bài tạo ra phải liên quan chặt chẽ đến CHÍNH XÁC chủ đề được yêu cầu. Dứt điểm phần lý thuyết nào phải ra ngay bài tập phần đó.
- **NGÔN TỪ GẦN GŨI:** Hướng dẫn làm bài phải ngắn gọn, đi thẳng vào trọng tâm toán học.
- **KHÔNG GIAN LÀM BÀI:** Bắt buộc có dòng chấm (lệnh \\dongke) cho học sinh điền kết quả vào tay, in ra được ngay.

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