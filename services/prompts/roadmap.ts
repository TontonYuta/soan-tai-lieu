import { RoadmapConfig } from "../../types";
import { LATEX_TECHNICAL_RULES, ROADMAP_TEMPLATE } from "./latex-rules";

export const generateRoadmapPrompt = (config: RoadmapConfig): string => {
  let languageInstruction = "";
  if (config.language === "vietnamese" || !config.language) {
    languageInstruction = "Sử dụng 100% TIẾNG VIỆT.";
  } else if (config.language === "english") {
    languageInstruction = "Sử dụng 100% TIẾNG ANH.";
  } else {
    languageInstruction = "Sử dụng SONG NGỮ (Anh - Việt).";
  }

  return `Đóng vai Chuyên gia Cố vấn Học tập Toán học và Master LaTeX.
Nhiệm vụ: Thiết kế lộ trình học tập từ A đến Z cho chủ đề được yêu cầu.

I. THÔNG TIN LỘ TRÌNH:
- Môn học: ${config.subject}
- Chuyên đề: ${config.topic}
- Thời gian dự kiến: ${config.duration}
- Trình độ hiện tại: ${config.currentLevel}
- Mục tiêu đầu ra: ${config.target}
- Ngôn ngữ: ${languageInstruction}
- Yêu cầu nâng cao: ${config.details || "Không"}

II. QUY TẮC KỸ THUẬT VÀ KHUNG LATEX:
${LATEX_TECHNICAL_RULES}

BẮT BUỘC sử dụng khung sau:
${ROADMAP_TEMPLATE}

Trả về toàn bộ mã LaTeX hoàn chỉnh được bọc trong markdown codeblock (\`\`\`latex ... \`\`\`).

[BƯỚC CHUYÊN SÂU: KIỂM TRA LẠI CHÉO (SELF-CHECK)]
Trước khi xuất ra kết quả cuối cùng, bạn PHẢI tự rà soát và kiểm tra chất lượng bằng một khối \`<self_check> ... </self_check>\`:
- Lộ trình có thực tế, khả thi và phân bổ thời gian hợp lý không?
- Cú pháp LaTeX có chuẩn và không dính lỗi biên dịch không?
Sau khi tự review xong, mới được phép xuất ra đoạn mã LaTeX chuẩn nhất.`;
};