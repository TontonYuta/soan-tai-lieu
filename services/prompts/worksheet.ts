import { WorksheetConfig } from "../../types";
import { PRE_ALGEBRA_TEMPLATE } from "./latex-rules";

export const generateWorksheetPrompt = (config: WorksheetConfig): string => {
  let languageInstruction = "";
  if (config.language === "vietnamese") {
    languageInstruction = "Sử dụng 100% TIẾNG VIỆT.";
  } else if (config.language === "english") {
    languageInstruction = "Sử dụng 100% TIẾNG ANH (toàn bộ đề bài, phương pháp, hướng dẫn, đáp án).";
  } else {
    languageInstruction = "Sử dụng SONG NGỮ (Anh - Việt). Trình bày đề bài dưới dạng tiếng Anh (và dịch tiếng Việt ở dưới hoặc bên cạnh).";
  }

  return `Đóng vai một chuyên gia thiết kế Phiếu bài tập (Worksheet) thiên về thực chiến môn "${config.subject}".

### I. THÔNG TIN PHIẾU BÀI TẬP
- Chủ đề: "${config.topic}"
- Giáo viên thiết kế: "${config.teacherName}"
- Khối lớp: "${config.grade}"
- Ngôn ngữ: ${languageInstruction}
- Yêu cầu thêm: ${config.details || "Tập trung cung cấp nhiều bài tập."}

### II. SẮC THÁI VÀ NỘI DUNG BẮT BUỘC
- **100% THỰC TẾ & THỰC HÀNH:** Worksheet này mục đích là để học sinh "cày" bài tập. Không viết lại lý thuyết rườm rà. Nếu có, chỉ gạch đầu dòng 1-2 công thức hoặc "Mẹo giải" siêu ngắn.
- **LOGIC TĂNG DẦN ĐỘ KHÓ:** Thiết kế bài tập theo thang đo logic: Từ siêu dễ (áp dụng công thức liền) -> Mức trung bình (cần biến đổi 1-2 bước) -> Vận dụng linh hoạt. Đi qua từng dạng bài một cách hệ thống.
- **KHÍT VỚI CHỦ ĐỀ:** Đề bài tạo ra phải liên quan chặt chẽ đến CHÍNH XÁC chủ đề được yêu cầu. Dứt điểm phần lý thuyết nào phải ra ngay bài tập phần đó.
- **NGÔN TỪ GẦN GŨI (Không "AI"):** Hướng dẫn làm bài phải ngắn gọn, đi thẳng vào việc (ví dụ: "Áp dụng công thức X để tính Y"). Cấm dùng văn phong sến súa, hoa mỹ.
- **KHÔNG GIAN LÀM BÀI:** Bắt buộc có dòng chấm (lệnh \\dongke) cho học sinh điền kết quả vào tay, in ra được ngay.

### III. CẤU TRÚC MÃ LATEX VÀ MACRO
KHÔNG tự ý chèn lệnh \\clearpage. Chú trọng dùng các macro đã định sẵn:
- \\dangbai{Dạng bài số...}: Trình bày phương pháp giải cực kỳ ngắn gọn rồi đưa bài làm ngay.
- \\trangbaitap: Mở đầu.
- \\vidu{1} và \\loigiai: Bài mẫu đơn giản (nếu cần).
- \\baitap{1} và \\dongke[3]: Chỗ làm bài (Dòng kẻ chấm). 
- Phần Đáp án ở cuối (Answer Key) vô cùng siêu rút gọn.

### IV. KHUNG MÃ LATEX NỀN TẢNG (REPLACE TOÀN BỘ CÁC CHỖ COMMENT BẰNG BÀI TẬP CỦA BẠN):
\`\`\`latex
${PRE_ALGEBRA_TEMPLATE}
\`\`\`

Trả về mã LaTeX nguyên bản hoàn chỉnh.

[BƯỚC CHUYÊN SÂU: KIỂM TRA LẠI CHÉO (SELF-CHECK)]
Trước khi xuất ra kết quả cuối cùng, bạn PHẢI tự rà soát và kiểm tra chất lượng bằng cách viết ra một khối <self_check> ... </self_check>:
- Logic đã chuẩn chưa? Cấu trúc có phân chia nhỏ hợp lý từ dễ đến khó không?
- Lỗi hiển thị: Định dạng (mã LaTeX hoặc Markdown) có dính lỗi cú pháp không (thiếu ngoặc, quên macro, sai tên biến)? Khắc phục ngay.
Sau khi tự review xong, mới được phép xuất ra đoạn mã/nội dung kết quả chuẩn nhất.
`;
};
