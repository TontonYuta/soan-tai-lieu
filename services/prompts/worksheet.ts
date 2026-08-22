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

  return `Đóng vai Giáo viên Toán học chuyên nghiệp và Master LaTeX.
Nhiệm vụ: Tạo một phiếu bài tập toán học (Worksheet) bài bản, chuẩn mực cho chủ đề được yêu cầu.

I. THÔNG TIN PHIẾU BÀI TẬP:
- Môn học: ${config.subject} (Khối ${config.grade})
- Chủ đề: ${config.topic}
- Giáo viên biên soạn: ${config.teacherName}
- Ngôn ngữ: ${languageInstruction}
- Yêu cầu nâng cao: ${config.details || "Không"}

II. NGUYÊN TẮC BIÊN SOẠN BÀI TẬP:
- **LOGIC TĂNG DẦN ĐỘ KHÓ:** Thiết kế bài tập theo thang đo logic: Từ cơ bản (áp dụng công thức liền) -> Mức trung bình (cần biến đổi 1-2 bước) -> Vận dụng linh hoạt. Đi qua từng dạng bài một cách hệ thống.
- **KHÍT VỚI CHỦ ĐỀ:** Đề bài tạo ra phải liên quan chặt chẽ đến CHÍNH XÁC chủ đề được yêu cầu. Dứt điểm phần lý thuyết nào phải ra ngay bài tập phần đó.
- **NGÔN TỪ GẦN GŨI:** Hướng dẫn làm bài phải ngắn gọn, đi thẳng vào trọng tâm toán học.
- **KHÔNG GIAN LÀM BÀI:** Bắt buộc có dòng chấm (lệnh \\dongke) cho học sinh điền kết quả vào tay, in ra được ngay.

III. CẤU TRÚC Mã LATEX VÀ MACRO:
KHÔNG tự ý chèn lệnh \\clearpage. Chú trọng dùng các macro đã định sẵn:
- \\dangbai{Dạng bài số...}: Trình bày phương pháp giải cực kỳ ngắn gọn rồi đưa bài làm ngay.
- \\trangbaitap: Mở đầu bài tập tự luyện.
- \\vidu{1} và \\loigiai: Bài mẫu đơn giản.
- \\baitap{1} và \\dongke[3]: Chỗ làm bài (Dòng kẻ chấm). 
- Phần Đáp án ở cuối (Answer Key) vô cùng siêu rút gọn.

IV. KHUNG Mã LATEX NỀN TẢNG:
${PRE_ALGEBRA_TEMPLATE}

Trả về mã LaTeX nguyên bản hoàn chỉnh được bọc gọn gàng trong markdown codeblock (\`\`\`latex ... \`\`\`).

[BƯỚC CHUYÊN SÂU: KIỂM TRA LẠI CHÉO (SELF-CHECK)]
Trước khi xuất ra kết quả cuối cùng, bạn PHẢI tự rà soát và kiểm tra chất lượng bằng cách viết ra một khối \`<self_check> ... </self_check>\`:
- Logic toán học đã chuẩn chưa? Cấu trúc có phân chia nhỏ hợp lý từ dễ đến khó không?
- Lỗi hiển thị: Mã LaTeX có thiếu ngoặc, quên macro, thiếu end, sai tên biến, không escape ký tự đặc biệt như %, &, _, $ không?
- Kiểm tra tính hoàn thiện: Bắt buộc phải đặt toàn bộ code trong block \`\`\`latex ... \`\`\`.
Sau khi tự review xong, mới được phép xuất ra đoạn mã LaTeX chuẩn nhất.`;
};