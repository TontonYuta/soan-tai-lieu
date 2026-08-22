import { LearningConfig } from "../../types";
import { LATEX_TECHNICAL_RULES, ROADMAP_TEMPLATE } from "./latex-rules";

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

II. NGUYÊN TẮC SƯ PHẠM:
- Đi từ trực quan đến trừu tượng, có ví dụ minh họa và đồ thị/hình vẽ TikZ nếu cần thiết.
- Trình bày công thức toán học rõ ràng, có đóng khung công thức quan trọng bằng tcolorbox sharp corners.

III. QUY TẮC LATEX:
${LATEX_TECHNICAL_RULES}

Trả về toàn bộ mã LaTeX hoàn chỉnh được bọc trong markdown codeblock (\`\`\`latex ... \`\`\`).

[BƯỚC CHUYÊN SÂU: KIỂM TRA LẠI CHÉO (SELF-CHECK)]
Trước khi xuất ra kết quả cuối cùng, bạn PHẢI tự rà soát và kiểm tra chất lượng bằng cách viết ra một khối \`<self_check> ... </self_check>\`:
- Logic toán học: Đã chuẩn xác chưa?
- Lỗi hiển thị: Mã LaTeX có thiếu ngoặc, quên macro, thiếu $ công thức, không escape % hay _ không?
- Hoàn thiện: Đã bọc mã bằng \`\`\`latex ... \`\`\` chưa?
Sau khi tự review xong, mới được phép xuất ra đoạn mã LaTeX chuẩn nhất.`;
};