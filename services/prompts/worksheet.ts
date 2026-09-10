import { WorksheetConfig } from "../../types";
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
Nhiệm vụ: Tạo một phiếu bài tập thực hành (Worksheet) bài bản, chuẩn mực, trực quan và linh hoạt cho chủ đề được yêu cầu.

I. THÔNG TIN PHIẾU BÀI TẬP:
- Môn học: ${subjectName} (Khối / Lớp ${config.grade})
- Chủ đề: ${config.topic}
- Giáo viên biên soạn: ${config.teacherName}
- Ngôn ngữ: ${languageInstruction}
- Yêu cầu nâng cao: ${config.details || "Không"}
${ragSection}

II. NGUYÊN TẮC BỐ CỤC TRỰC QUAN & SƯ PHẠM ĐA MÔN (KHÔNG CỨNG NHẮC):
- **BỐ CỤC THÍCH ỨNG THEO CHỦ ĐỀ (ADAPTIVE LAYOUT):**
  * Chủ đề có Hình học / Đồ thị / Sơ đồ: Bắt buộc dùng bố cục 2 cột song song (\\cauhoicohinh{Bài}{Đề bài & Đáp án}{Hình vẽ TikZ}) để hình vẽ nằm cạnh đề bài, tối ưu thị giác. Chừa không gian vẽ hình bằng \\khungnhap[3.5cm].
  * Chủ đề Đại số / Phương trình / Tính toán: Bố trí ví dụ mẫu có phân tích, bài tập tự luyện có dòng kẻ chấm (\\dongke[3] hoặc \\dongke[4]) để học sinh làm bài ngay vào phiếu.
  * Chủ đề Lý thuyết / Khái niệm: Dùng hộp màu trực quan phân tầng (\\hopkienthuc, \\phuongphap, \\luuy, \\meonhanh).
- **HEADER TINH GỌN (COMPACT HEADER):** Sử dụng khung thông tin gọn gàng ở đầu trang 1 (Họ tên, Lớp, Ngày, Điểm số) để học sinh bắt đầu làm bài ngay từ trang 1, TUYỆT ĐỐI KHÔNG làm trang bìa riêng gây lãng phí giấy in.
- **LOGIC TĂNG DẦN ĐỘ KHÓ:** Thiết kế bài tập theo thang đo logic: Từ cơ bản (áp dụng công thức/khái niệm liền) -> Mức trung bình (cần biến đổi 1-2 bước) -> Vận dụng linh hoạt.
- **KHÍT VỚI CHỦ ĐỀ:** Đề bài tạo ra phải liên quan chặt chẽ đến CHÍNH XÁC chủ đề được yêu cầu. Dứt điểm phần lý thuyết nào phải ra ngay bài tập phần đó.
- **ĐIỀU PHỐI DUNG LƯỢNG:** Đảm bảo mã LaTeX hoàn chỉnh 100% từ đầu đến cuối, luôn luôn đóng \\end{document}.

III. CẤU TRÚC MÃ LATEX VÀ MACRO TIỆN ÍCH:
KHÔNG tự ý chèn lệnh \\clearpage. Chú trọng dùng các macro đã định sẵn:
- \\dangbai{Dạng bài số...}: Tiêu đề phân dạng thanh lịch.
- \\hopkienthuc{...}{...}, \\phuongphap{...}{...}, \\luuy{...}{...}: Các khung thẻ trực quan.
- \\vidu{1} và \\loigiai: Bài mẫu đơn giản, dễ hiểu.
- \\cauhoicohinh{1}{Đề bài & Lựa chọn}{Hình TikZ}: Bài toán kèm hình vẽ 2 cột song song.
- \\baitap{1} và \\dongke[3]: Bài tập kèm dòng chấm làm bài đại số/tự luận.
- \\khungnhap[3.5cm]: Khung chữ nhật viền nét đứt cho bài hình học/vẽ đồ thị.
- \\dapan{...}{...}{...}{...}, \\dapanHaiCot{...}{...}{...}{...}: Phương án trắc nghiệm linh hoạt.
- Phần Đáp án ở cuối (Answer Key) siêu rút gọn, súc tích.

IV. QUY TẮC KỸ THUẬT & TRÌNH BÀY LATEX:
${LATEX_TECHNICAL_RULES}

V. KHUNG MÃ LATEX NỀN TẢNG:
${PRE_ALGEBRA_TEMPLATE}

VI. CHỈ THỊ ĐẦU RA BẮT BUỘC:
- BẮT BUỘC CHỈ TRẢ VỀ DUY NHẤT 1 KHỐI MÃ NGUỒN LATEX TRONG KHỐI \`\`\`latex ... \`\`\`.
- TUYỆT ĐỐI KHÔNG xuất bất kỳ câu chào hỏi, lời dẫn, giải thích hay nhận xét nào bên ngoài khối code.
- Đảm bảo mã nguồn biên dịch trực tiếp 100% không lỗi trên Overleaf và pdfLaTeX.`;
};
