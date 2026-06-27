import { ExamConfig } from "../../types";
import { LATEX_TECHNICAL_RULES, EXAM_TEMPLATE } from "./latex-rules";

export const generateExamPrompt = (config: ExamConfig): string => {
  const totalQuestions = Number(config.counts.mc) + Number(config.counts.essay);
  const matrixInfo = `NB: ${config.matrix.lv1}, TH: ${config.matrix.lv2}, VD: ${config.matrix.lv3}, VDC: ${config.matrix.lv4}`;

  let languageInstruction = "";
  if (config.language === "vietnamese") {
    languageInstruction = "Sử dụng 100% TIẾNG VIỆT.";
  } else if (config.language === "english") {
    languageInstruction = "Sử dụng 100% TIẾNG ANH (toàn bộ đề bài, chuyên đề, câu hỏi trắc nghiệm, đáp án).";
  } else {
    languageInstruction = "Sử dụng SONG NGỮ (Anh - Việt). Tiếng Anh làm ngôn ngữ chính, kèm trong ngoặc hoặc bên dưới là bản dịch tiếng Việt cho đề bài.";
  }

  return `Đóng vai Chuyên gia Đánh giá khảo thí. Soạn mã LaTeX cho đề thi chính thức.

I. THÔNG TIN BÀI THI:
- Kì thi: ${config.examName} (${config.year})
- Môn học: ${config.subject}
- Lớp: ${config.grade} - Nội dung trọng tâm: ${config.topic}
- Khối lượng: ${String(totalQuestions)} câu (${String(config.counts.mc)} trắc nghiệm, ${String(config.counts.essay)} tự luận)
- Ma trận phân bổ: ${matrixInfo} (TĂNG DẦN THEO ĐỘ KHÓ)
- Thời gian làm bài: ${config.time} phút
- Ngôn ngữ: ${languageInstruction}
- Yêu cầu cấu trúc bổ sung: ${config.details || "Không"}

II. LUẬT NỘI DUNG VÀ VĂN PHONG (BẮT BUỘC):
- **Bám sát thực tế:** Các câu hỏi sinh ra phải ĐÚNG nội dung yêu cầu logic phân hóa học lực, từ Nhận Biết đến Vận Dụng Cao một cách chặt chẽ.
- **KHÔNG NGÔN TỪ HOA MỸ:** Đề bài là nơi đo lường năng lực, tuyệt đối dùng ngôn từ khách quan, chuẩn xác, phổ thông, đời thường, đi vào trọng tâm, không dư thừa, tránh phong cách viết văn sáo rỗng của chatbot/AI.
- **Đáp án chi tiết:** Phần đáp án cuối đề thi phải súc tích, cung cấp lời giải đúng trọng tâm cho câu tự luận.

III. YÊU CẦU KỸ THUẬT VÀ TRÌNH BÀY (BẮT BUỘC TUÂN THEO CÁC RULE SAU):
${LATEX_TECHNICAL_RULES}

IV. BỘ KHUNG CODE MẪU ĐỀ THI:
HÃY sử dụng nguyên bản cấu trúc sau và tự động sinh ra nội dung số lượng câu hỏi đúng barem, thay thế các \`%\` bằng nội dung câu hỏi thực tế:
${EXAM_TEMPLATE}

LƯU Ý QUAN TRỌNG:
- BẮT BUỘC dùng macro \\cauhoi và \\dapan để định dạng câu hỏi trắc nghiệm (dàn 4 cột rõ ràng).
- Nếu tự luận, phải để dòng kẻ theo ước lượng để hs làm bài trực tiếp.



[BƯỚC CHUYÊN SÂU: KIỂM TRA LẠI CHÉO (SELF-CHECK)]
Trước khi xuất ra kết quả cuối cùng, bạn PHẢI tự rà soát và kiểm tra chất lượng bằng cách viết ra một khối \`<self_check> ... </self_check>\`:
- Logic đã chuẩn chưa? Cấu trúc có phân chia nhỏ hợp lý từ dễ đến khó không?
- Lỗi hiển thị: Định dạng (mã LaTeX hoặc Markdown) có dính lỗi cú pháp không (thiếu ngoặc, quên macro, thiếu end, sai tên biến, không escape ký tự đặc biệt như %, &, _, $)? Khắc phục ngay.
- Kiểm tra tính hoàn thiện: Đã bọc mã bằng markdown codeblock chưa? Bắt buộc phải đặt toàn bộ code trong block \`\`\` (vd: \`\`\`latex ... \`\`\`).
Sau khi tự review xong, mới được phép xuất ra đoạn mã/nội dung kết quả chuẩn nhất.`;
};
