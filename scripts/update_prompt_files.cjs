const fs = require("fs");

// Helper tạo RAG context thông minh cho các file prompt
const smartRagHelper = `
const sanitizeAndExtractRag = (attachedPdf?: { fileName: string; numPages: number; text: string }): string => {
  if (!attachedPdf?.text) return "";
  const rawText = attachedPdf.text.replace(/\\r/g, "");
  // Lọc sạch watermark, số điện thoại rác và số trang lặp
  const cleaned = rawText
    .replace(/(?:Trang\\s+\\d+\\/\\d+|SĐT:?\\s*\\d{8,12}|Hotline:?\\s*\\d{8,12}|Website:?\\s*\\S+)/gi, "")
    .trim();

  let chunk = "";
  if (cleaned.length <= 15000) {
    chunk = cleaned;
  } else {
    // Smart RAG: Lấy 4.000 ký tự đầu (Mục lục, tổng quan) + 11.000 ký tự trọng tâm bài tập ở các trang sau
    const head = cleaned.slice(0, 4000);
    const tail = cleaned.slice(-11000);
    chunk = \`\${head}\\n\\n[... CẮT LƯỢC TRANG GIỮA, NỐI PHẦN BÀI TẬP VÀ ĐÁP ÁN TRỌNG TÂM TRANG SAU ...]\\n\\n\${tail}\`;
  }

  return \`\\n====================================================
TÀI LIỆU PDF ĐÍNH KÈM THAM KHẢO (RAG CONTEXT):
- Tên tài liệu: \${attachedPdf.fileName} (\${attachedPdf.numPages} trang)
- Nội dung trích xuất:
"""
\${chunk}
"""
- CHỈ THỊ RAG (QUAN TRỌNG): BẮT BUỘC chắt lọc các câu hỏi, dữ kiện và cấu trúc bài từ tài liệu PDF đính kèm trên để biên soạn nội dung sát nhất.
====================================================\\n\`;
};
`;

// 1. UPDATE EXAM.TS
const examCode = `import { ExamConfig } from "../../types";
import { LATEX_TECHNICAL_RULES, EXAM_TEMPLATE_2025, EXAM_TEMPLATE_CLASSIC } from "./latex-rules";

${smartRagHelper}

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
    structureDescription = \`
- CẤU TRÚC ĐỀ THI 3 PHẦN CHUẨN BỘ GD&ĐT 2025--2026 CHO MÔN \${subjectName.toUpperCase()}:
  * PHẦN I: \${p1} câu trắc nghiệm nhiều phương án lựa chọn (A, B, C, D) - Dùng macro \\\\cauhoi{n} và \\\\dapan (ngắn) hoặc \\\\dapanHaiCot / \\\\dapanMotCot (dài).
  * PHẦN II: \${p2} câu trắc nghiệm Đúng / Sai (mỗi câu gồm 4 mệnh đề a, b, c, d) - Dùng macro \\\\cauhoi{n} và \\\\yDungSai{...}{...}{...}{...}.
  * PHẦN III: \${p3} câu trắc nghiệm Trả lời ngắn (điền kết quả/đáp số) - Dùng macro \\\\cauhoi{n} và \\\\traLoiNgan.
  * TỔNG CỘNG: \${totalQuestions} câu hỏi.\`;
  } else {
    const mc = Number(config.counts.mc || config.counts.part1_mc || 25);
    const essay = Number(config.counts.essay || 3);
    totalQuestions = mc + essay;
    structureDescription = \`
- CẤU TRÚC ĐỀ THI TRUYỀN THỐNG MÔN \${subjectName.toUpperCase()}:
  * PHẦN I (Trắc nghiệm): \${mc} câu (A, B, C, D).
  * PHẦN II (Tự luận): \${essay} câu tính toán/phân tích nâng cao.
  * TỔNG CỘNG: \${totalQuestions} câu hỏi.\`;
  }

  const matrixInfo = \`Nhận biết: \${config.matrix.lv1}, Thông hiểu: \${config.matrix.lv2}, Vận dụng: \${config.matrix.lv3}, Vận dụng cao: \${config.matrix.lv4}\`;

  let languageInstruction = "";
  if (config.language === "vietnamese" || !config.language) {
    languageInstruction = "Sử dụng 100% TIẾNG VIỆT.";
  } else if (config.language === "english") {
    languageInstruction = "Sử dụng 100% TIẾNG ANH.";
  } else {
    languageInstruction = "Sử dụng SONG NGỮ (Anh - Việt).";
  }

  const tikzInstruction = config.includeTikZ ? \`
- **YÊU CẦU ĐỒ THỊ, HÌNH HỌC TIKZ & SƠ ĐỒ ĐA MÔN (BẮT BUỘC):**
  * Môn Toán học: Hình học không gian (nét đứt [dashed], nét liền [thick]), Bảng biến thiên, đồ thị hàm số TikZ/pgfplots sạch đẹp.
  * Môn Vật lý / Hóa học / Sinh học: Sơ đồ mạch điện, đường sức từ, đồ thị dao động, sơ đồ lai di truyền hoặc sơ đồ thí nghiệm.
  * Môn Ngôn ngữ / Xã hội: Sơ đồ tư duy, trục thời gian sự kiện, bảng đối chiếu dữ liệu.\` : '';

  const ragSection = sanitizeAndExtractRag(config.attachedPdf);

  return \`Đóng vai Chuyên gia Khảo thí và Biên soạn đề thi \${subjectName} LaTeX chuyên nghiệp (chuẩn format Bộ GD&ĐT 2025--2026).

I. THÔNG TIN KỲ THI:
- Đơn vị / Trường: \${config.school}
- Kỳ thi: \${config.examName} (\${config.year})
- Môn thi: \${subjectName} - Khối / Lớp: \${config.grade}
- Chủ đề trọng tâm: \${config.topic}
- Thời gian làm bài: \${config.time} phút
- Ngôn ngữ: \${languageInstruction}
- Ma trận phân bổ độ khó: \${matrixInfo} (Tăng dần theo logic tư duy)
\${structureDescription}
\${config.referenceContent ? \`- Ngữ cảnh đề cương/tài liệu tham khảo: \${config.referenceContent}\` : ''}
- Yêu cầu bổ sung: \${config.details || "Bám sát cấu trúc đề thi chuẩn"}
\${ragSection}

II. LUẬT NỘI DUNG VÀ VĂN PHONG SƯ PHẠM ĐA MÔN (BẮT BUỘC):
- **Bám sát đặc thù môn học:**
  * Môn Toán & KHTN: Dữ liệu chính xác, số liệu đẹp, có ý nghĩa vật lý/hóa học thực tế.
  * Môn Tiếng Anh / Ngoại ngữ: Chú trọng ngữ pháp, từ vựng theo chủ điểm, ngữ âm, bài đọc hiểu dùng môi trường \\\\doanvan{Reading Passage}{...}.
  * Môn Khoa học Xã hội (Sử, Địa, GDKT&PL): Mốc lịch sử chuẩn xác, dữ liệu địa lý cập nhật, bài tập tình huống thực tế.
- **Phân hóa rõ ràng:** Phần I kiểm tra nhận biết và thông hiểu; Phần II kiểm tra năng lực biện luận 4 mệnh đề đúng/sai; Phần III kiểm tra tư duy giải quyết vấn đề.
- **ĐIỀU PHỐI DUNG LƯỢNG CHỐNG CẮT CỤT TOKEN:** Phần Hướng dẫn giải chi tiết phải tập trung cô đọng vào chìa khóa then chốt và biến đổi chính, TUYỆT ĐỐI KHÔNG viết lan man để đảm bảo 100% tài liệu được tạo trọn vẹn và đóng \\\\end{document}.
\${tikzInstruction}

III. YÊU CẦU KỸ THUẬT VÀ QUY TẮC LATEX:
\${LATEX_TECHNICAL_RULES}

IV. KHUNG CODE MẪU ĐỀ THI ĐƯỢC ÁP DỤNG:
Hãy sử dụng bộ khung sau, thay thế các phần comment \`%\` bằng nội dung câu hỏi thực tế và bảng đáp án + lời giải chi tiết:
\${is2025Format ? EXAM_TEMPLATE_2025 : EXAM_TEMPLATE_CLASSIC}

V. CHỈ THỊ ĐẦU RA BẮT BUỘC:
- BẮT BUỘC CHỈ TRẢ VỀ DUY NHẤT 1 KHỐI MÃ NGUỒN LATEX TRONG KHỐI \`\`\`latex ... \`\`\`.
- TUYỆT ĐỐI KHÔNG xuất bất kỳ câu chào hỏi, lời dẫn, giải thích hay nhận xét nào bên ngoài khối code.
- Đảm bảo mã nguồn biên dịch trực tiếp 100% không lỗi trên Overleaf và pdfLaTeX.\`;
};
`;
fs.writeFileSync("services/prompts/exam.ts", examCode, "utf-8");

// 2. UPDATE WORKSHEET.TS
const worksheetCode = `import { WorksheetConfig } from "../../types";
import { LATEX_TECHNICAL_RULES, PRE_ALGEBRA_TEMPLATE } from "./latex-rules";

${smartRagHelper}

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

  return \`Đóng vai Giáo viên \${subjectName} chuyên nghiệp và Master LaTeX.
Nhiệm vụ: Tạo một phiếu bài tập thực hành (Worksheet) bài bản, chuẩn mực cho chủ đề được yêu cầu.

I. THÔNG TIN PHIẾU BÀI TẬP:
- Môn học: \${subjectName} (Khối / Lớp \${config.grade})
- Chủ đề: \${config.topic}
- Giáo viên biên soạn: \${config.teacherName}
- Ngôn ngữ: \${languageInstruction}
- Yêu cầu nâng cao: \${config.details || "Không"}
\${ragSection}

II. NGUYÊN TẮC BIÊN SOẠN BÀI TẬP ĐA MÔN:
- **LOGIC TĂNG DẦN ĐỘ KHÓ:** Thiết kế bài tập theo thang đo logic: Từ cơ bản (áp dụng công thức/khái niệm liền) -> Mức trung bình (cần biến đổi 1-2 bước) -> Vận dụng linh hoạt.
- **KHÍT VỚI CHỦ ĐỀ:** Đề bài tạo ra phải liên quan chặt chẽ đến CHÍNH XÁC chủ đề được yêu cầu. Dứt điểm phần lý thuyết nào phải ra ngay bài tập phần đó.
- **KHÔNG GIAN LÀM BÀI:** Bắt buộc có dòng chấm (lệnh \\\\dongke) cho học sinh điền kết quả vào tay, in ra được ngay.
- **ĐIỀU PHỐI DUNG LƯỢNG:** Đảm bảo mã LaTeX hoàn chỉnh 100% từ đầu đến cuối, luôn luôn đóng \\\\end{document}.

III. CẤU TRÚC MÃ LATEX VÀ MACRO:
KHÔNG tự ý chèn lệnh \\\\clearpage. Chú trọng dùng các macro đã định sẵn:
- \\\\dangbai{Dạng bài số...}: Trình bày phương pháp giải cực kỳ ngắn gọn rồi đưa bài làm ngay.
- \\\\trangbaitap: Mở đầu bài tập tự luyện.
- \\\\vidu{1} và \\\\loigiai: Bài mẫu đơn giản.
- \\\\baitap{1} và \\\\dongke[3]: Chỗ làm bài (Dòng kẻ chấm). 
- Phần Đáp án ở cuối (Answer Key) vô cùng siêu rút gọn.

IV. KHUNG MÃ LATEX NỀN TẢNG:
\${PRE_ALGEBRA_TEMPLATE}

V. CHỈ THỊ ĐẦU RA BẮT BUỘC:
- BẮT BUỘC CHỈ TRẢ VỀ DUY NHẤT 1 KHỐI MÃ NGUỒN LATEX TRONG KHỐI \`\`\`latex ... \`\`\`.
- TUYỆT ĐỐI KHÔNG xuất bất kỳ câu chào hỏi, lời dẫn, giải thích hay nhận xét nào bên ngoài khối code.
- Đảm bảo mã nguồn biên dịch trực tiếp 100% không lỗi trên Overleaf và pdfLaTeX.\`;
};
`;
fs.writeFileSync("services/prompts/worksheet.ts", worksheetCode, "utf-8");

// 3. UPDATE LEARNING.TS
const learningCode = `import { LearningConfig } from "../../types";
import { LATEX_TECHNICAL_RULES, LEARNING_TEMPLATE } from "./latex-rules";

${smartRagHelper}

export const generateLearningPrompt = (config: LearningConfig): string => {
  const subjectName = config.subject || 'Toán học';
  let languageInstruction = "";
  if (config.language === "vietnamese" || !config.language) {
    languageInstruction = "Sử dụng 100% TIẾNG VIỆT.";
  } else if (config.language === "english") {
    languageInstruction = "Sử dụng 100% TIẾNG ANH.";
  } else {
    languageInstruction = "Sử dụng SONG NGỮ (Anh - Việt).";
  }

  const goalText = 
    config.goal === 'summary' ? 'Tóm tắt lý thuyết trọng tâm và các công thức/quy tắc cần nhớ' :
    config.goal === 'detailed' ? 'Biên soạn bài giảng chi tiết toàn diện từ định nghĩa, khái niệm đến chứng minh/phân tích' :
    'Lý thuyết kết hợp nhiều ví dụ mẫu và phương pháp giải từng dạng bài';

  const ragSection = sanitizeAndExtractRag(config.attachedPdf);

  return \`Đóng vai Giáo viên \${subjectName} chuyên nghiệp và Master LaTeX.
Nhiệm vụ: Biên soạn một tài liệu bài giảng/bài học chuẩn mực cho chủ đề được yêu cầu.

I. THÔNG TIN BÀI HỌC:
- Môn học: \${subjectName} (Lớp / Khối \${config.grade})
- Chủ đề: \${config.topic}
- Đơn vị / Trường: \${config.school} (\${config.year})
- Mục tiêu bài giảng: \${goalText}
- Đối tượng người học: \${config.audience}
- Ngôn ngữ: \${languageInstruction}
- Yêu cầu bổ sung: \${config.details || "Không"}
\${ragSection}

II. NGUYÊN TẮC SƯ PHẠM ĐA MÔN:
- Đi từ trực quan đến trừu tượng, có ví dụ minh họa và sơ đồ/hình vẽ TikZ nếu cần thiết.
- Trình bày kiến thức rõ ràng, dùng \\\\hopkienthuc hoặc \\\\dinhly, \\\\vidu, \\\\loigiai, \\\\doanvan.
- Đảm bảo toàn bộ mã LaTeX hoàn chỉnh, đóng \\\\end{document} đầy đủ.

III. QUY TẮC LATEX:
\${LATEX_TECHNICAL_RULES}

IV. KHUNG TÀI LIỆU NỀN TẢNG:
\${LEARNING_TEMPLATE}

V. CHỈ THỊ ĐẦU RA BẮT BUỘC:
- BẮT BUỘC CHỈ TRẢ VỀ DUY NHẤT 1 KHỐI MÃ NGUỒN LATEX TRONG KHỐI \`\`\`latex ... \`\`\`.
- TUYỆT ĐỐI KHÔNG xuất bất kỳ câu chào hỏi, lời dẫn, giải thích hay nhận xét nào bên ngoài khối code.
- Đảm bảo mã nguồn biên dịch trực tiếp 100% không lỗi trên Overleaf và pdfLaTeX.\`;
};
`;
fs.writeFileSync("services/prompts/learning.ts", learningCode, "utf-8");

// 4. UPDATE ROADMAP.TS
const roadmapCode = `import { RoadmapConfig } from "../../types";
import { LATEX_TECHNICAL_RULES, ROADMAP_TEMPLATE } from "./latex-rules";

${smartRagHelper}

export const generateRoadmapPrompt = (config: RoadmapConfig): string => {
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

  return \`Đóng vai Chuyên gia Cố vấn Học tập \${subjectName} và Master LaTeX.
Nhiệm vụ: Thiết kế lộ trình học tập từ A đến Z cho chủ đề được yêu cầu.

I. THÔNG TIN LỘ TRÌNH:
- Môn học: \${subjectName}
- Chuyên đề: \${config.topic}
- Thời gian dự kiến: \${config.duration}
- Trình độ hiện tại: \${config.currentLevel}
- Mục tiêu đầu ra: \${config.target}
- Ngôn ngữ: \${languageInstruction}
- Yêu cầu nâng cao: \${config.details || "Không"}
\${ragSection}

II. QUY TẮC KỸ THUẬT VÀ KHUNG LATEX:
\${LATEX_TECHNICAL_RULES}

BẮT BUỘC sử dụng khung sau:
\${ROADMAP_TEMPLATE}

III. CHỈ THỊ ĐẦU RA BẮT BUỘC:
- BẮT BUỘC CHỈ TRẢ VỀ DUY NHẤT 1 KHỐI MÃ NGUỒN LATEX TRONG KHỐI \`\`\`latex ... \`\`\`.
- TUYỆT ĐỐI KHÔNG xuất bất kỳ câu chào hỏi, lời dẫn, giải thích hay nhận xét nào bên ngoài khối code.
- Đảm bảo mã nguồn biên dịch trực tiếp 100% không lỗi trên Overleaf và pdfLaTeX.\`;
};
`;
fs.writeFileSync("services/prompts/roadmap.ts", roadmapCode, "utf-8");

// 5. UPDATE SIMILAR.TS
const similarCode = `import { SimilarExerciseConfig } from "../../types";
import { LATEX_TECHNICAL_RULES, PRE_ALGEBRA_TEMPLATE } from "./latex-rules";

${smartRagHelper}

export const generateSimilarPrompt = (config: SimilarExerciseConfig): string => {
  const subjectName = config.subject || 'Toán học';
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

  const ragSection = sanitizeAndExtractRag(config.attachedPdf);

  return \`Đóng vai Giáo viên \${subjectName} chuyên luyện thi và biên soạn tài liệu LaTeX chuyên nghiệp.
Nhiệm vụ của bạn: Phát triển bộ bài tập tương tự / đổi số từ bài toán mẫu được cung cấp dưới đây.

I. THÔNG TIN YÊU CẦU:
- Môn học: \${subjectName} \${config.grade ? \`(Lớp \${config.grade})\` : ''}
- Chủ đề: \${config.topic}
- Số lượng bài tập tương tự cần sinh: \${config.count} bài
- Định hướng độ khó: \${difficultyText}
- Bao gồm lời giải chi tiết: \${config.includeSolution ? 'CÓ (trình bày lời giải chi tiết từng bước)' : 'KHÔNG (chỉ cung cấp đáp số tóm tắt ngắn gọn)'}
- Ngôn ngữ: \${languageInstruction}
- Ghi chú bổ sung: \${config.details || "Không có"}
\${ragSection}

II. BÀI TẬP MẪU ĐẦU VÀO:
"""
\${config.sourceExercises || (config.attachedPdf ? 'Tham khảo bài toán mẫu trong tài liệu PDF đính kèm ở trên' : '')}
"""

III. QUY TẮC SÁNG TẠO & KHOA HỌC (BẮT BUỘC):
- **BẢO TOÀN PHƯƠNG PHÁP CỐT LÕI:** Các bài tập tạo mới phải giữ đúng dạng tư duy của bài mẫu, thay đổi số liệu/ngữ cảnh hợp lý (số nghiệm đẹp, không vô lý).
- **CHẤT LƯỢNG DỮ LIỆU:** Đảm bảo mọi bài toán/bài tập đều có nghiệm thực tế, logic giải chặt chẽ, kiểm tra tính toán cẩn thận.
- **KHÔNG NGÔN TỪ HOA MỸ:** Văn phong ngắn gọn, trong sáng, chuẩn mực sư phạm.
- **ĐIỀU PHỐI DUNG LƯỢNG:** Luôn đảm bảo hoàn tất toàn bộ file LaTeX và đóng \\\\end{document}.

IV. QUY TẮC KỸ THUẬT LATEX & KHUNG TÀI LIỆU:
\${LATEX_TECHNICAL_RULES}

BẮT BUỘC sử dụng khung tài liệu LaTeX sau (thay thế nội dung các bài tập tương tự vào phần tương ứng):
\${PRE_ALGEBRA_TEMPLATE}

V. CHỈ THỊ ĐẦU RA BẮT BUỘC:
- BẮT BUỘC CHỈ TRẢ VỀ DUY NHẤT 1 KHỐI MÃ NGUỒN LATEX TRONG KHỐI \`\`\`latex ... \`\`\`.
- TUYỆT ĐỐI KHÔNG xuất bất kỳ câu chào hỏi, lời dẫn, giải thích hay nhận xét nào bên ngoài khối code.
- Đảm bảo mã nguồn biên dịch trực tiếp 100% không lỗi trên Overleaf và pdfLaTeX.\`;
};
`;
fs.writeFileSync("services/prompts/similar.ts", similarCode, "utf-8");

console.log("✓ Successfully upgraded exam.ts, worksheet.ts, learning.ts, roadmap.ts, similar.ts with multi-subject & Smart RAG!");
