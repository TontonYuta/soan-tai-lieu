import { LearningConfig } from "../../types";
import { PRE_ALGEBRA_TEMPLATE } from "./latex-rules";

export const generateLearningPrompt = (config: LearningConfig): string => {
  let languageInstruction = "";
  if (config.language === "vietnamese") {
    languageInstruction = "Sử dụng 100% TIẾNG VIỆT, BỎ hoàn toàn tiếng Anh/Vocabulary Box.";
  } else if (config.language === "english") {
    languageInstruction = "Sử dụng 100% TIẾNG ANH (từ tiêu đề, giải thích lý thuyết, cho đến đề bài, ví dụ, bài tập). Tuyệt đối không dùng tiếng Việt.";
  } else {
    languageInstruction = "Sử dụng TAY TRONG TAY SONG NGỮ (Anh - Việt). Các định nghĩa quan trọng, đề bài tập, ví dụ cũng cần có phần dịch song ngữ hoặc sử dụng xen kẽ tự nhiên để người học quen thuộc.";
  }

  return `Đóng vai một gia sư cực kỳ có kinh nghiệm và thân thiện. Nhiệm vụ: biên soạn BÀI HỌC (Learning Module) môn "${config.subject}" cho ${config.audience} / Lớp ${config.grade}.

### I. YÊU CẦU CHUYÊN MÔN
1. Mục tiêu tài liệu: ${config.goal}. Phong cách: ${config.tone}.
2. Ngôn ngữ: ${languageInstruction}
3. Cụ thể hóa nội dung chủ đề: "${config.topic}". 

**TUYỆT ĐỐI TUÂN THỦ CÁC NGUYÊN TẮC SAU:**
- **THỰC HÀNH LÀ CHÍNH:** Giảm thiểu tối đa lý thuyết suông. Lý thuyết phải RẤT NGẮN GỌN (chỉ 1-2 câu). Dành phần lớn không gian cho các VÍ DỤ và BÀI TẬP THỰC HÀNH.
- **BÀI TẬP PHẢI ĐỒNG BỘ VỚI LÝ THUYẾT:** Ngay sau khi nói về một định lý/quy tắc nào, PHẢI có ngay bài mẫu và bài tập về đúng quy tắc đó. Không cho bài tập ngoài lề.
- **ĐỘ KHÓ TĂNG DẦN THEO LOGIC:** Phân rã bài tập theo các Level: Level 1 (Nhận biết/Làm quen ngay) -> Level 2 (Áp dụng/Thông hiểu) -> Level 3 (Ứng dụng thực tế hoặc tư duy sâu hơn).
- **VĂN PHONG MỘC MẠC, CHO NEWBIE:** Phải sử dụng từ ngữ đời thường, cực kì dễ hiểu, như một người anh/người chị chỉ bài cho đứa em mất gốc. **CẤM** dùng các từ ngữ sáo rỗng, hoa mỹ, sặc mùi AI như "khám phá vẻ đẹp", "hành trình tri thức", "hãy cùng nhau bước vào", "đi sâu vào", v.v... Cứ đi thẳng vào vấn đề thật tự nhiên.
- Yêu cầu thêm từ người dùng: ${config.details || "Không có"}

### II. CẤU TRÚC MÃ LATEX BẮT BUỘC
Tuyệt đối KHÔNG tự ý chèn \\clearpage bừa bãi.
- Bắt buộc dùng macro: \\dangbai{Tên mục}, \\ghinho, \\vidu{1}, \\loigiai.

### III. KHUNG MÃ LATEX MẪU (BẮT BUỘC TÁI SỬ DỤNG HOÀN TOÀN CẤU TRÚC NÀY, THAY COMMENT BẰNG NỘI DUNG CỦA BẠN):
\`\`\`latex
${PRE_ALGEBRA_TEMPLATE}
\`\`\`

Bắt buộc trả về duy nhất một file LaTeX chứa toàn bộ nội dung. Hãy nhớ: Mộc mạc, dễ hiểu, ưu tiên thực hành, độ khó tăng dần!

[BƯỚC CHUYÊN SÂU: KIỂM TRA LẠI CHÉO (SELF-CHECK)]
Trước khi xuất ra kết quả cuối cùng, bạn PHẢI tự rà soát và kiểm tra chất lượng bằng cách viết ra một khối <self_check> ... </self_check>:
- Logic đã chuẩn chưa? Cấu trúc có phân chia nhỏ hợp lý từ dễ đến khó không?
- Lỗi hiển thị: Định dạng (mã LaTeX hoặc Markdown) có dính lỗi cú pháp không (thiếu ngoặc, quên macro, sai tên biến)? Khắc phục ngay.
Sau khi tự review xong, mới được phép xuất ra đoạn mã/nội dung kết quả chuẩn nhất.
`;
};
