import { ExamConfig } from "../../types";
import { LATEX_TECHNICAL_RULES, EXAM_TEMPLATE_2025, EXAM_TEMPLATE_CLASSIC } from "./latex-rules";


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


export const generateExamPrompt = (config: ExamConfig): string => {
  const is2025Format = config.examFormat === 'standard2025' || !config.examFormat;
  const subjectName = config.subject || 'Toán học';

  let totalQuestions = 0;
  let structureDescription = "";

  if (is2025Format) {
    const p1 = Number(config.counts.part1_mc || 12);
    const p2 = Number(config.counts.part2_tf || 4);
    const p3 = Number(config.counts.part3_sa || 6);
    totalQuestions = p1 + p2 + p3;
    structureDescription = `
- Cấu trúc đề thi 3 phần chuẩn Bộ GD&ĐT 2025--2026 môn ${subjectName}:
  * PHẦN I: ${p1} câu trắc nghiệm nhiều phương án lựa chọn (A, B, C, D) - Dùng macro \\cauhoi{n} và \\dapan (ngắn) hoặc \\dapanHaiCot / \\dapanMotCot (dài).
  * PHẦN II: ${p2} câu trắc nghiệm Đúng / Sai (mỗi câu gồm 4 mệnh đề a, b, c, d) - Dùng macro \\cauhoi{n} và \\yDungSai{...}{...}{...}{...}.
  * PHẦN III: ${p3} câu trắc nghiệm Trả lời ngắn (điền kết quả/đáp số) - Dùng macro \\cauhoi{n} và \\traLoiNgan.
  * TỔNG CỘNG: ${totalQuestions} câu hỏi.`;
  } else {
    const mc = Number(config.counts.mc || config.counts.part1_mc || 25);
    const essay = Number(config.counts.essay || 3);
    totalQuestions = mc + essay;
    structureDescription = `
- Cấu trúc đề thi truyền thống môn ${subjectName}:
  * PHẦN I (Trắc nghiệm): ${mc} câu (A, B, C, D).
  * PHẦN II (Tự luận): ${essay} câu tính toán/phân tích nâng cao.
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
- **YÊU CẦU ĐỒ THỊ, HÌNH HỌC TIKZ & SƠ ĐỒ ĐA MÔN (BẮT BUỘC):**
  * Môn Toán học: Hình học không gian (nét đứt [dashed], nét liền [thick]), Bảng biến thiên, đồ thị hàm số TikZ/pgfplots sạch đẹp.
  * Môn Vật lý / Hóa học / Sinh học: Sơ đồ mạch điện, đường sức từ, đồ thị dao động, sơ đồ lai di truyền hoặc sơ đồ thí nghiệm.
  * Môn Ngôn ngữ / Xã hội: Sơ đồ tư duy, trục thời gian sự kiện, bảng đối chiếu dữ liệu.` : '';

  const ragSection = sanitizeAndExtractRag(config.attachedPdf);

  return `Đóng vai Chuyên gia Khảo thí và Biên soạn đề thi ${subjectName} LaTeX chuyên nghiệp (chuẩn format Bộ GD&ĐT 2025--2026).

I. THÔNG TIN KỲ THI:
- Đơn vị / Trường: ${config.school}
- Kỳ thi: ${config.examName} (${config.year})
- Môn thi: ${subjectName} - Khối / Lớp: ${config.grade}
- Chủ đề trọng tâm: ${config.topic}
- Thời gian làm bài: ${config.time} phút
- Ngôn ngữ: ${languageInstruction}
- Ma trận phân bổ độ khó: ${matrixInfo} (Tăng dần theo logic tư duy)
${structureDescription}
${config.referenceContent ? "- Ngữ cảnh đề cương/tài liệu tham khảo: " + config.referenceContent : ""}
- Yêu cầu bổ sung: ${config.details || "Bám sát cấu trúc đề thi chuẩn"}
${ragSection}

II. LUẬT NỘI DUNG VÀ VĂN PHONG SƯ PHẠM ĐA MÔN (BẮT BUỘC):
- **Bám sát đặc thù môn học:**
  * Môn Toán & KHTN: Dữ liệu chính xác, số liệu đẹp, có ý nghĩa vật lý/hóa học thực tế.
  * Môn Tiếng Anh / Ngoại ngữ: Chú trọng ngữ pháp, từ vựng theo chủ điểm, ngữ âm, bài đọc hiểu dùng môi trường \\doanvan{Reading Passage}{...}.
  * Môn Khoa học Xã hội (Sử, Địa, GDKT&PL): Mốc lịch sử chuẩn xác, dữ liệu địa lý cập nhật, bài tập tình huống thực tế.
- **Phân hóa rõ ràng:** Phần I kiểm tra nhận biết và thông hiểu; Phần II kiểm tra năng lực biện luận 4 mệnh đề đúng/sai; Phần III kiểm tra tư duy giải quyết vấn đề.
- **ĐIỀU PHỐI DUNG LƯỢNG CHỐNG CẮT CỤT TOKEN:** Phần Hướng dẫn giải chi tiết phải tập trung cô đọng vào chìa khóa then chốt và biến đổi chính, TUYỆT ĐỐI KHÔNG viết lan man để đảm bảo 100% tài liệu được tạo trọn vẹn và đóng \\end{document}.
${tikzInstruction}

III. YÊU CẦU KỸ THUẬT VÀ QUY TẮC LATEX:
${LATEX_TECHNICAL_RULES}

IV. KHUNG CODE MẪU ĐỀ THI ĐƯỢC ÁP DỤNG:
Hãy sử dụng bộ khung sau, thay thế các phần comment "%" bằng nội dung câu hỏi thực tế và bảng đáp án + lời giải chi tiết:
${is2025Format ? EXAM_TEMPLATE_2025 : EXAM_TEMPLATE_CLASSIC}

V. CHỈ THỊ ĐẦU RA BẮT BUỘC:
- BẮT BUỘC CHỈ TRẢ VỀ DUY NHẤT 1 KHỐI MÃ NGUỒN LATEX TRONG KHỐI \`\`\`latex ... \`\`\`.
- TUYỆT ĐỐI KHÔNG xuất bất kỳ câu chào hỏi, lời dẫn, giải thích hay nhận xét nào bên ngoài khối code.
- Đảm bảo mã nguồn biên dịch trực tiếp 100% không lỗi trên Overleaf và pdfLaTeX.`;
};
