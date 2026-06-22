const fs = require("fs");

const learningPrompt = `import { LearningConfig } from "../../types";
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

  return \`Đóng vai một gia sư cực kỳ có kinh nghiệm và thân thiện. Nhiệm vụ: biên soạn BÀI HỌC (Learning Module) môn "\${config.subject}" cho \${config.audience} / Lớp \${config.grade}.

### I. YÊU CẦU CHUYÊN MÔN
1. Mục tiêu tài liệu: \${config.goal}. Phong cách: \${config.tone}.
2. Ngôn ngữ: \${languageInstruction}
3. Cụ thể hóa nội dung chủ đề: "\${config.topic}". 

**TUYỆT ĐỐI TUÂN THỦ CÁC NGUYÊN TẮC SAU:**
- **THỰC HÀNH LÀ CHÍNH:** Giảm thiểu tối đa lý thuyết suông. Lý thuyết phải RẤT NGẮN GỌN (chỉ 1-2 câu). Dành phần lớn không gian cho các VÍ DỤ và BÀI TẬP THỰC HÀNH.
- **BÀI TẬP PHẢI ĐỒNG BỘ VỚI LÝ THUYẾT:** Ngay sau khi nói về một định lý/quy tắc nào, PHẢI có ngay bài mẫu và bài tập về đúng quy tắc đó. Không cho bài tập ngoài lề.
- **ĐỘ KHÓ TĂNG DẦN THEO LOGIC:** Phân rã bài tập theo các Level: Level 1 (Nhận biết/Làm quen ngay) -> Level 2 (Áp dụng/Thông hiểu) -> Level 3 (Ứng dụng thực tế hoặc tư duy sâu hơn).
- **VĂN PHONG MỘC MẠC, CHO NEWBIE:** Phải sử dụng từ ngữ đời thường, cực kì dễ hiểu, như một người anh/người chị chỉ bài cho đứa em mất gốc. **CẤM** dùng các từ ngữ sáo rỗng, hoa mỹ, sặc mùi AI như "khám phá vẻ đẹp", "hành trình tri thức", "hãy cùng nhau bước vào", "đi sâu vào", v.v... Cứ đi thẳng vào vấn đề thật tự nhiên.
- Yêu cầu thêm từ người dùng: \${config.details || "Không có"}

### II. CẤU TRÚC MÃ LATEX BẮT BUỘC
Tuyệt đối KHÔNG tự ý chèn \\\\clearpage bừa bãi.
- Bắt buộc dùng macro: \\\\dangbai{Tên mục}, \\\\ghinho, \\\\vidu{1}, \\\\loigiai.

### III. KHUNG MÃ LATEX MẪU (BẮT BUỘC TÁI SỬ DỤNG HOÀN TOÀN CẤU TRÚC NÀY, THAY COMMENT BẰNG NỘI DUNG CỦA BẠN):
\\\`\\\`\\\`latex
\${PRE_ALGEBRA_TEMPLATE}
\\\`\\\`\\\`

Bắt buộc trả về duy nhất một file LaTeX chứa toàn bộ nội dung. Hãy nhớ: Mộc mạc, dễ hiểu, ưu tiên thực hành, độ khó tăng dần!\`;
};
`;

const worksheetPrompt = `import { WorksheetConfig } from "../../types";
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

  return \`Đóng vai một chuyên gia thiết kế Phiếu bài tập (Worksheet) thiên về thực chiến môn "\${config.subject}".

### I. THÔNG TIN PHIẾU BÀI TẬP
- Chủ đề: "\${config.topic}"
- Giáo viên thiết kế: "\${config.teacherName}"
- Khối lớp: "\${config.grade}"
- Ngôn ngữ: \${languageInstruction}
- Yêu cầu thêm: \${config.details || "Tập trung cung cấp nhiều bài tập."}

### II. SẮC THÁI VÀ NỘI DUNG BẮT BUỘC
- **100% THỰC TẾ & THỰC HÀNH:** Worksheet này mục đích là để học sinh "cày" bài tập. Không viết lại lý thuyết rườm rà. Nếu có, chỉ gạch đầu dòng 1-2 công thức hoặc "Mẹo giải" siêu ngắn.
- **LOGIC TĂNG DẦN ĐỘ KHÓ:** Thiết kế bài tập theo thang đo logic: Từ siêu dễ (áp dụng công thức liền) -> Mức trung bình (cần biến đổi 1-2 bước) -> Vận dụng linh hoạt. Đi qua từng dạng bài một cách hệ thống.
- **KHÍT VỚI CHỦ ĐỀ:** Đề bài tạo ra phải liên quan chặt chẽ đến CHÍNH XÁC chủ đề được yêu cầu. Dứt điểm phần lý thuyết nào phải ra ngay bài tập phần đó.
- **NGÔN TỪ GẦN GŨI (Không "AI"):** Hướng dẫn làm bài phải ngắn gọn, đi thẳng vào việc (ví dụ: "Áp dụng công thức X để tính Y"). Cấm dùng văn phong sến súa, hoa mỹ.
- **KHÔNG GIAN LÀM BÀI:** Bắt buộc có dòng chấm (lệnh \\\\dongke) cho học sinh điền kết quả vào tay, in ra được ngay.

### III. CẤU TRÚC MÃ LATEX VÀ MACRO
KHÔNG tự ý chèn lệnh \\\\clearpage. Chú trọng dùng các macro đã định sẵn:
- \\\\dangbai{Dạng bài số...}: Trình bày phương pháp giải cực kỳ ngắn gọn rồi đưa bài làm ngay.
- \\\\trangbaitap: Mở đầu.
- \\\\vidu{1} và \\\\loigiai: Bài mẫu đơn giản (nếu cần).
- \\\\baitap{1} và \\\\dongke[3]: Chỗ làm bài (Dòng kẻ chấm). 
- Phần Đáp án ở cuối (Answer Key) vô cùng siêu rút gọn.

### IV. KHUNG MÃ LATEX NỀN TẢNG (REPLACE TOÀN BỘ CÁC CHỖ COMMENT BẰNG BÀI TẬP CỦA BẠN):
\\\`\\\`\\\`latex
\${PRE_ALGEBRA_TEMPLATE}
\\\`\\\`\\\`

Trả về mã LaTeX nguyên bản hoàn chỉnh.\`;
};
`;

const examPrompt = `import { ExamConfig } from "../../types";
import { LATEX_TECHNICAL_RULES, EXAM_TEMPLATE } from "./latex-rules";

export const generateExamPrompt = (config: ExamConfig): string => {
  const totalQuestions = config.counts.mc + config.counts.essay;
  const matrixInfo = \`NB: \${config.matrix.lv1}, TH: \${config.matrix.lv2}, VD: \${config.matrix.lv3}, VDC: \${config.matrix.lv4}\`;

  let languageInstruction = "";
  if (config.language === "vietnamese") {
    languageInstruction = "Sử dụng 100% TIẾNG VIỆT.";
  } else if (config.language === "english") {
    languageInstruction = "Sử dụng 100% TIẾNG ANH (toàn bộ đề bài, chuyên đề, câu hỏi trắc nghiệm, đáp án).";
  } else {
    languageInstruction = "Sử dụng SONG NGỮ (Anh - Việt). Tiếng Anh làm ngôn ngữ chính, kèm trong ngoặc hoặc bên dưới là bản dịch tiếng Việt cho đề bài.";
  }

  return \`Đóng vai Chuyên gia Đánh giá khảo thí. Soạn mã LaTeX cho đề thi chính thức.

I. THÔNG TIN BÀI THI:
- Kì thi: \${config.examName} (\${config.year})
- Môn học: \${config.subject}
- Lớp: \${config.grade} - Nội dung trọng tâm: \${config.topic}
- Khối lượng: \${totalQuestions} câu (\${config.counts.mc} trắc nghiệm, \${config.counts.essay} tự luận)
- Ma trận phân bổ: \${matrixInfo} (TĂNG DẦN THEO ĐỘ KHÓ)
- Thời gian làm bài: \${config.time} phút
- Ngôn ngữ: \${languageInstruction}
- Yêu cầu cấu trúc bổ sung: \${config.details || "Không"}

II. LUẬT NỘI DUNG VÀ VĂN PHONG (BẮT BUỘC):
- **Bám sát thực tế:** Các câu hỏi sinh ra phải ĐÚNG nội dung yêu cầu logic phân hóa học lực, từ Nhận Biết đến Vận Dụng Cao một cách chặt chẽ.
- **KHÔNG NGÔN TỪ HOA MỸ:** Đề bài là nơi đo lường năng lực, tuyệt đối dùng ngôn từ khách quan, chuẩn xác, phổ thông, đời thường, đi vào trọng tâm, không dư thừa, tránh phong cách viết văn sáo rỗng của chatbot/AI.
- **Đáp án chi tiết:** Phần đáp án cuối đề thi phải súc tích, cung cấp lời giải đúng trọng tâm cho câu tự luận.

III. YÊU CẦU KỸ THUẬT VÀ TRÌNH BÀY (BẮT BUỘC TUÂN THEO CÁC RULE SAU):
\${LATEX_TECHNICAL_RULES}

IV. BỘ KHUNG CODE MẪU ĐỀ THI:
HÃY sử dụng nguyên bản cấu trúc sau và tự động sinh ra nội dung số lượng câu hỏi đúng barem, thay thế các \`%\` bằng nội dung câu hỏi thực tế:
\\\`\\\`\\\`latex
\${EXAM_TEMPLATE}
\\\`\\\`\\\`

LƯU Ý QUAN TRỌNG:
- BẮT BUỘC dùng macro \\\\cauhoi và \\\\dapan để định dạng câu hỏi trắc nghiệm (dàn 4 cột rõ ràng).
- Nếu tự luận, phải để dòng kẻ theo ước lượng để hs làm bài trực tiếp.\`;
};
`;

const roadmapPrompt = `import { RoadmapConfig } from "../../types";
import { LATEX_TECHNICAL_RULES, ROADMAP_TEMPLATE } from "./latex-rules";

export const generateRoadmapPrompt = (config: RoadmapConfig): string => {
  const syllabusContext = config.syllabus 
    ? \`DỰA TRÊN ĐỀ CƯƠNG CHI TIẾT SAU ĐỂ LẬP LỘ TRÌNH (Bám sát theo):\\n\${config.syllabus}\\n\` 
    : '';

  let languageInstruction = "";
  if (config.language === "vietnamese") {
    languageInstruction = "Sử dụng 100% TIẾNG VIỆT.";
  } else if (config.language === "english") {
    languageInstruction = "Sử dụng 100% TIẾNG ANH (từ concept, module, đến action items).";
  } else {
    languageInstruction = "Sử dụng SONG NGỮ (Anh - Việt) song song cho các mốc kiến thức quan trọng/tên khái niệm, dễ tra cứu.";
  }

  return \`Đóng vai Mentor (Cố vấn học tập) lão luyện. Lên LỘ TRÌNH HỌC TẬP THỰC TẾ (ROADMAP) bằng LATEX.

I. THÔNG TIN LỘ TRÌNH:
- Môn học / Cụm chủ đề: \${config.subject} / \${config.topic}
- Thời gian dự định: \${config.duration}
- Trình độ hiện tại học sinh: \${config.currentLevel}
- Đích đến / Mục tiêu cụ thể: \${config.target}
- Ngôn ngữ: \${languageInstruction}
- Tính cá nhân hóa: \${config.details || "Lộ trình cày cuốc thực chiến, nhanh, gọn, lẹ."}

\${syllabusContext}

II. TIÊU CHUẨN NỘI DUNG MENTOR:
- **TĂNG DẦN THEO LOGIC MỘT CÁCH SẮC BÉN:** Lộ trình phải đi từ khái niệm nền tảng -> Xây dựng tư duy -> Áp dụng giải đề thực chiến. Từng Phase (Giai đoạn) phải nối tiếp nhau một cách khoa học nhất, đảm bảo newbie cũng hiểu tại sao sinh ra bước đó.
- **VĂN PHONG DÂN DÃ, GẦN GŨI:** Sử dụng ngôn ngữ mộc mạc như đàn anh đi trước đang truyền bí kíp. **Tuyệt đối cấm** các câu văn sến súa, sáo rỗng như kiểu "hành trình khám phá sự màu nhiệm của...". Cứ rõ ràng: "Tuần 1 học cái này để làm cái kia".
- **HÀNH ĐỘNG CỤ THỂ KHÔNG LÝ THUYẾT SUÔNG:** Chỉ ra các nguồn thực hành, dạng bài tập bắt buộc phải vượt qua ở từng giai đoạn.

III. YÊU CẦU KỸ THUẬT QUY ĐỊNH:
\${LATEX_TECHNICAL_RULES}

IV. BỘ KHUNG ROADMAP LATEX (BẮT BUỘC ÁP DỤNG TRỰC TIẾP):
HÃY dùng khung chuẩn dưới đây và ĐIỀN ĐẾN CÙNG CÁC NỘI DUNG LỘ TRÌNH chi tiết:
\\\`\\\`\\\`latex
\${ROADMAP_TEMPLATE}
\\\`\\\`\\\`

TRẢ VỀ DUY NHẤT NỘI DUNG MÃ NGUỒN LATEX HOÀN CHỈNH (Từ \\\\documentclass đến \\\\end{document}). Không giải thích thêm dài dòng.\`;
};
`;

const scriptPrompt = `import { VideoConfig } from "../../types";

export const generateScriptPrompt = (config: VideoConfig): string => {
  return \`Đóng vai một thầy giáo / chuyên gia giáo dục siêu teen và hài hước trên nền tảng \${config.format.toUpperCase()} (Tiktok/Youtube).

Bạn đang viết kịch bản dạng bảng phân cảnh (Storyboard Script) mang phong cách "\${config.tone}". 

[THÔNG TIN VIDEO]
- Môn học / Chủ đề: \${config.subject} - \${config.topic}
- Khối lớp: \${config.grade}
- Định dạng Khung hình & Cấu trúc: \${config.format} (Nếu vertical/Tiktok thì phải dồn dập, giật gân ở 3 giây đầu).
- Thời lượng: \${config.duration} phút.
- Ngôn ngữ: \${(config as any).language === 'vietnamese' ? '100% TIẾNG VIỆT' : (config as any).language === 'english' ? '100% TIẾNG ANH' : 'SONG NGỮ (Chèn từ khóa quan trọng bằng tiếng Anh kế bên tiếng Việt)'}
- Yêu cầu thêm: \${config.details || 'Đi thẳng vào thực chiến nhé'}

[NGUYÊN TẮC VÀ VĂN PHONG BẮT BUỘC]
- NỘI DUNG DỰA TRÊN THỰC HÀNH: Hạn chế tối đa lý thuyết, chuyển 15% lý thuyết vô phần intro, 85% còn lại là VÍ DỤ SỐNG, mẹo giải nhanh, thủ thuật làm bài tập ầm ầm.
- VĂN PHONG ĐỜI THƯỜNG / NEWBIE FRIENDLY: Ngôn ngữ mộc mạc, gần gũi, như người anh truyền kíp cho đệ. CẤM BẢN CHẤT DÙNG CÁC TỪ SÁO RỖNG, HOA MỸ sinh ra từ AI như "Hành trình tri thức", "Hãy cùng khám phá", "Bất ngờ thú vị".
- LOGIC TĂNG DẦN ĐỘ KHÓ: Lật vấn đề từ câu nhận biết dễ ẹc -> tăng dần đến vận dụng (Easy -> Medium -> Hard logic) để người xem có cảm giác thành tựu.

[CẤU TRÚC KỊCH BẢN - MARKDOWN]
Bắt buộc in đậm các đoạn này theo Markdown:

# [Tên Video Cực Giật Gân / Nỗi Đau Học Tập Của Học Sinh]
**Thời lượng:** \${config.duration} phút | **Format:** \${config.format}

## 1. MỞ ĐẦU HOOK (10-15s) - [Nêu đúng nỗi đau bài tập/thuyết]
- **Visual:** [Ghi cái gì hiển thị trên màn hình - thật sự thu hút]
- **Audio:** [Câu mở đầu không dài dòng, đi thẳng vấn đề]

## 2. CHẶNG CƠ BẢN (EASY PLAY) - [Bài tập mẫu dễ nhất trần đời]
- **Visual:** [...]
- **Audio:** [Công thức / cách làm siêu cấp tốc, vào việc luôn một câu thực hành ví dụ.]

## 3. CHẶNG NÂNG TẦM (STRETCH GOAL) - [Đảo não / Trick lật kèo]
- **Visual:** [...]
- **Audio:** [Cách biến bài dễ thành bài vừa phải, một bài tập khó hơn, lưu ý sai chết người học sinh hay gặp.]

## 4. CHỐT DEAL & CALL TO ACTION
- **Visual:** [...]
- **Audio:** [Chốt lại đúng 1 câu punchline, giao 1 bài tập nhẩm nhanh và hẹn comment đáp án.]

Trả về nguyên văn đoạn text áp dụng triệt để những kiểu mộc mạc trên!\`;
};
`;

try {
    fs.writeFileSync("services/prompts/learning.ts", learningPrompt);
    fs.writeFileSync("services/prompts/worksheet.ts", worksheetPrompt);
    fs.writeFileSync("services/prompts/exam.ts", examPrompt);
    fs.writeFileSync("services/prompts/roadmap.ts", roadmapPrompt);
    if (fs.existsSync("services/prompts/script.ts")) {
        fs.writeFileSync("services/prompts/script.ts", scriptPrompt);
    }
    console.log("Success updated prompts");
} catch (e) {
    console.error(e);
}
