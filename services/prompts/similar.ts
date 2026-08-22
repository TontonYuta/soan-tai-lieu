import { SimilarExerciseConfig } from "../../types";
import { LATEX_TECHNICAL_RULES, PRE_ALGEBRA_TEMPLATE } from "./latex-rules";

export const generateSimilarPrompt = (config: SimilarExerciseConfig): string => {
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

  return `Đóng vai Giáo viên Toán học chuyên luyện thi và biên soạn tài liệu LaTeX chuyên nghiệp.
Nhiệm vụ của bạn: Phát triển bộ bài tập tương tự / đổi số từ bài toán mẫu được cung cấp dưới đây.

I. THÔNG TIN YÊU CẦU:
- Môn học: ${config.subject} ${config.grade ? `(Lớp ${config.grade})` : ''}
- Chủ đề: ${config.topic}
- Số lượng bài tập tương tự cần sinh: ${config.count} bài
- Định hướng độ khó: ${difficultyText}
- Bao gồm lời giải chi tiết: ${config.includeSolution ? 'CÓ (trình bày lời giải chi tiết từng bước)' : 'KHÔNG (chỉ cung cấp đáp số tóm tắt ngắn gọn)'}
- Ngôn ngữ: ${languageInstruction}
- Ghi chú bổ sung: ${config.details || "Không có"}

II. BÀI TẬP MẪU ĐẦU VÀO:
"""
${config.sourceExercises}
"""

III. QUY TẮC SÁNG TẠO & TOÁN HỌC (BẮT BUỘC):
- **BẢO TOÀN PHƯƠNG PHÁP CỐT LÕI:** Các bài tập tạo mới phải giữ đúng dạng tư duy toán học của bài mẫu, thay đổi số liệu hợp lý (số nghiệm đẹp, không vô lý, không bị lỗi mẫu số = 0 hay căn số âm trừ khi đề cố ý).
- **CHẤT LƯỢNG SỐ LIỆU:** Đảm bảo mọi bài toán đều có nghiệm thực tế, logic giải chặt chẽ, kiểm tra tính toán cẩn thận.
- **KHÔNG NGÔN TỪ HOA MỸ:** Văn phong toán học ngắn gọn, trong sáng, chuẩn mực sư phạm.

IV. QUY TẮC KỸ THUẬT LATEX & KHUNG TÀI LIỆU:
${LATEX_TECHNICAL_RULES}

BẮT BUỘC sử dụng khung tài liệu LaTeX sau (thay thế nội dung các bài tập tương tự vào phần tương ứng):
${PRE_ALGEBRA_TEMPLATE}

Trả về toàn bộ mã LaTeX hoàn chỉnh được bọc trong markdown codeblock (\`\`\`latex ... \`\`\`).

[BƯỚC CHUYÊN SÂU: KIỂM TRA LẠI CHÉO (SELF-CHECK)]
Trước khi xuất ra kết quả cuối cùng, bạn PHẢI tự rà soát và kiểm tra chất lượng bằng cách viết ra một khối \`<self_check> ... </self_check>\`:
- Logic toán học: Đã giải thử và nghiệm có đẹp / đúng dạng không?
- Lỗi hiển thị: Mã LaTeX có thiếu ngoặc, quên macro, thiếu $ công thức, không escape % hay _ không?
- Hoàn thiện: Đã bọc mã bằng \`\`\`latex ... \`\`\` chưa?
Sau khi tự review xong, mới được phép xuất ra đoạn mã LaTeX chuẩn nhất.`;
};