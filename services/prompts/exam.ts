import { ExamConfig } from "../../types";
import { LATEX_TECHNICAL_RULES, EXAM_TEMPLATE_2025, EXAM_TEMPLATE_CLASSIC } from "./latex-rules";

export const generateExamPrompt = (config: ExamConfig): string => {
  const is2025Format = config.examFormat === 'standard2025' || !config.examFormat;

  let totalQuestions = 0;
  let structureDescription = "";

  if (is2025Format) {
    const p1 = Number(config.counts.part1_mc || 12);
    const p2 = Number(config.counts.part2_tf || 4);
    const p3 = Number(config.counts.part3_sa || 6);
    totalQuestions = p1 + p2 + p3;
    structureDescription = `
- CẤU TRÚC ĐỀ THI 3 PHẦN CHUẨN BỘ GD&ĐT 2025--2026:
  * PHẦN I: ${p1} câu trắc nghiệm nhiều phương án lựa chọn (A, B, C, D) - Dùng macro \\cauhoi{n} và \\dapan{A}{B}{C}{D}.
  * PHẦN II: ${p2} câu trắc nghiệm Đúng / Sai (mỗi câu gồm 4 mệnh đề a, b, c, d) - Dùng macro \\cauhoi{n} và \\yDungSai{...}{...}{...}{...}.
  * PHẦN III: ${p3} câu trắc nghiệm Trả lời ngắn (điền kết quả/đáp số) - Dùng macro \\cauhoi{n} và \\traLoiNgan.
  * TỔNG CỘNG: ${totalQuestions} câu hỏi.`;
  } else {
    const mc = Number(config.counts.mc || config.counts.part1_mc || 25);
    const essay = Number(config.counts.essay || 3);
    totalQuestions = mc + essay;
    structureDescription = `
- CẤU TRÚC ĐỀ THI TRUYỀN THỐNG:
  * PHẦN I (Trắc nghiệm): ${mc} câu (A, B, C, D).
  * PHẦN II (Tự luận): ${essay} câu tính toán nâng cao kèm dòng chấm.
  * TỔNG CỘNG: ${totalQuestions} câu hỏi.`;
  }

  const matrixInfo = `Nhận biết: ${config.matrix.lv1}, Thông hiểu: ${config.matrix.lv2}, Vận dụng: ${config.matrix.lv3}, Vận dụng cao: ${config.matrix.lv4}`;

  let languageInstruction = "";
  if (config.language === "vietnamese" || !config.language) {
    languageInstruction = "Sử dụng 100% TIẾNG VIỆT.";
  } else if (config.language === "english") {
    languageInstruction = "Sử dụng 100% TIẾNG ANH.";
  } else {
    languageInstruction = "Sử dụng SONG NGỮ (Anh - Việt).";
  }

  const tikzInstruction = config.includeTikZ ? `
- **YÊU CẦU ĐỒ THỊ & HÌNH HỌC TIKZ (BẮT BUỘC):**
  * Đối với các câu hỏi về Hình học không gian (khối chóp, lăng trụ, nón, trụ, cầu, tọa độ Oxyz): BẮT BUỘC vẽ hình trực quan bằng TikZ (nét đứt [dashed] cho cạnh khuất, nét liền [thick] cho cạnh nhìn thấy, ký hiệu góc vuông).
  * Đối với các câu hỏi Khảo sát hàm số: BẮT BUỘC vẽ Bảng biến thiên hoặc Đồ thị hàm số bằng TikZ/pgfplots sạch đẹp.` : '';

  return `Đóng vai Chuyên gia Khảo thí và Biên soạn đề thi Toán học LaTeX chuyên nghiệp (chuẩn format Bộ GD&ĐT 2025--2026).

I. THÔNG TIN KỲ THI:
- Đơn vị / Trường: ${config.school}
- Kỳ thi: ${config.examName} (${config.year})
- Môn học: ${config.subject} - Khối: ${config.grade}
- Chủ đề trọng tâm: ${config.topic}
- Thời gian làm bài: ${config.time} phút
- Ngôn ngữ: ${languageInstruction}
- Ma trận phân bổ độ khó: ${matrixInfo} (Tăng dần theo logic tư duy)
${structureDescription}
${config.referenceContent ? `- Ngữ cảnh đề cương/tài liệu tham khảo: ${config.referenceContent}` : ''}
- Yêu cầu bổ sung: ${config.details || "Bám sát định dạng đề thi mới"}

II. LUẬT NỘI DUNG VÀ VĂN PHONG SƯ PHẠM (BẮT BUỘC):
- **Bám sát thực tế & Chuẩn mực:** Mọi câu hỏi đều phải chuẩn logic toán học, có số liệu đẹp, không vô lý, nghiệm thực tế.
- **Phân hóa rõ ràng:** Phần I kiểm tra kiến thức nền tảng và thông hiểu; Phần II kiểm tra tư duy biện luận logic qua 4 mệnh đề đúng/sai; Phần III kiểm tra năng lực giải quyết vấn đề và tính toán chính xác.
- **KHÔNG NGÔN TỪ HOA MỸ:** Ngôn từ trong sáng, khách quan, chuẩn mực sư phạm.
${tikzInstruction}

III. YÊU CẦU KỸ THUẬT VÀ QUY TẮC LATEX:
${LATEX_TECHNICAL_RULES}

IV. KHUNG CODE MẪU ĐỀ THI ĐƯỢC ÁP DỤNG:
Hãy sử dụng bộ khung sau, thay thế các phần comment \`%\` bằng nội dung câu hỏi thực tế và bảng đáp án + lời giải chi tiết:
${is2025Format ? EXAM_TEMPLATE_2025 : EXAM_TEMPLATE_CLASSIC}

[BƯỚC CHUYÊN SÂU: KIỂM TRA LẠI CHÉO (SELF-CHECK)]
Trước khi xuất ra kết quả cuối cùng, bạn PHẢI tự rà soát và kiểm tra chất lượng bằng khối \`<self_check> ... </self_check>\`:
- Cấu trúc đề: Đã đủ số câu cho từng Phần chưa?
- Lỗi hiển thị: Mã LaTeX có thiếu ngoặc, quên macro, thiếu end, sai tên biến, không escape %, &, _, $ không?
- Hoàn thiện: Bắt buộc bọc toàn bộ code trong block \`\`\`latex ... \`\`\`.
Sau khi tự review xong, mới được phép xuất ra đoạn mã LaTeX hoàn chỉnh.`;
};