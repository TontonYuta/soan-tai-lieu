const fs = require('fs');

const examPrompt = `import { ExamConfig } from "../../types";
import { LATEX_TECHNICAL_RULES, EXAM_TEMPLATE } from "./latex-rules";

export const generateExamPrompt = (config: ExamConfig): string => {
  const totalQuestions = config.counts.mc + config.counts.essay;
  const matrixInfo = \`NB: \${config.matrix.lv1}, TH: \${config.matrix.lv2}, VD: \${config.matrix.lv3}, VDC: \${config.matrix.lv4}\`;

  return \`Đóng vai Chuyên gia soạn đề thi Bộ GD&ĐT Việt Nam giàu kinh nghiệm. Hãy soạn mã LaTeX thiết kế đề thi cho kỳ thi sau:

I. THÔNG TIN KỲ THI:
- Môn học: \${config.subject}
- Lớp: \${config.grade}
- Khối lượng: \${totalQuestions} câu (\${config.counts.mc} trắc nghiệm, \${config.counts.essay} tự luận)
- Ma trận phân bổ: \${matrixInfo}
- Thời gian làm bài: \${config.time} phút
- Yêu cầu thêm (nếu có): \${config.details || 'Bám sát chương trình phổ thông mới (SGK mới), sử dụng các ví dụ thực tiễn nếu phù hợp.'}

II. YÊU CẦU KỸ THUẬT VÀ TRÌNH BÀY (BẮT BUỘC):
\${LATEX_TECHNICAL_RULES}

III. BỘ KHUNG CODE MẪU ĐỀ THI:
HÃY sử dụng nguyên bản cấu trúc sau và tự động sinh ra nội dung thật, thay thế các \`%\`:
\\\`\\\`\\\`latex
\${EXAM_TEMPLATE}
\\\`\\\`\\\`

LƯU Ý QUAN TRỌNG:
- Trình bày dạng đề chính thức, mã đề, trang bìa môn học.
- BẮT BUỘC dùng macro \\\\cauhoi và \\\\dapan để định dạng câu hỏi trắc nghiệm, sao cho nó dàn 4 cột đẹp mắt.
- Phần Đáp Án: Chỉ cung cấp kết quả ngắn gọn cho trắc nghiệm (có thể dùng bảng hoặc text đơn giản), và bài giải hướng dẫn từng bước ngắn gọn cho phần tự luận.\`;
};
`;

const roadmapPrompt = `import { RoadmapConfig } from "../../types";
import { LATEX_TECHNICAL_RULES, ROADMAP_TEMPLATE } from "./latex-rules";

export const generateRoadmapPrompt = (config: RoadmapConfig): string => {
  const syllabusContext = config.syllabus 
    ? \`DỰA TRÊN ĐỀ CƯƠNG CHI TIẾT SAU ĐỂ LẬP LỘ TRÌNH (Bám sát theo):\\n\${config.syllabus}\\n\` 
    : '';

  return \`Đóng vai Kiến trúc sư Giáo dục và Cố vấn học tập giàu kinh nghiệm. Hãy LẬP MỘT LỘ TRÌNH HỌC TẬP TỪ CƠ BẢN ĐẾN CHI TIẾT bằng định dạng LATEX.

I. THÔNG TIN LỘ TRÌNH:
- Môn học / Chủ đề: \${config.subject} / \${config.topic}
- Thời gian dự kiến: \${config.duration}
- Trình độ hiện tại: \${config.currentLevel}
- Đích đến mong muốn: \${config.target}
- Yêu cầu thêm (nếu có): \${config.details || 'Thiết kế khoa học, đi từ gốc rễ, chia phase rõ ràng, có ôn tập ngắt quãng.'}

\${syllabusContext}

II. YÊU CẦU KỸ THUẬT LATEX:
\${LATEX_TECHNICAL_RULES}

III. BỘ KHUNG ROADMAP LATEX (BẮT BUỘC):
HÃY dùng khung chuẩn dưới đây và ĐIỀN ĐẦY ĐỦ NỘI DUNG chi tiết cho môn học/kế hoạch ở trên:
\\\`\\\`\\\`latex
\${ROADMAP_TEMPLATE}
\\\`\\\`\\\`

TRẢ VỀ NỘI DUNG MÃ NGUỒN LATEX HOÀN CHỈNH (Từ \\\\documentclass đến \\\\end{document}). Không giải thích dài dòng.\`;
};
`;

const learningPrompt = `import { LearningConfig } from "../../types";
import { PRE_ALGEBRA_TEMPLATE } from "./latex-rules";

export const generateLearningPrompt = (config: LearningConfig): string => {
  const languageInstruction = config.language === 'vietnamese' 
    ? 'Học thuần Việt: BỎ hoàn toàn phần Vocabulary Box và bỏ tiếng Anh, đi thẳng vào kiến thức.'
    : 'Học Song ngữ Anh - Việt: Biên soạn đầy đủ Vocabulary Box, các từ khóa trong bài bằng Tiếng Anh (song song Tiếng Việt).';

  return \`Đóng vai Chuyên gia biên soạn Sách giáo khoa chất lượng cao. Nhiệm vụ: biên soạn SÁCH BÀI LÝ THUYẾT (Learning Module) môn "\${config.subject}" cho lớp \${config.grade} (\${config.audience}).

### I. YÊU CẦU CHUYÊN MÔN
1. Định hướng: \${config.goal}. Phong cách: \${config.tone}.
2. Ngôn ngữ: \${languageInstruction}
3. Cụ thế hóa nội dung chủ đề: "\${config.topic}". Tập trung giải thích lý thuyết thật hay, có ví dụ dẫn dắt.
4. Yêu cầu thêm: \${config.details || 'Tự động nghiên cứu nội dung chuyên sâu, cung cấp mẹo ghi nhớ.'}

### II. CẤU TRÚC MÃ LATEX BẮT BUỘC
Tuyệt đối KHÔNG tự ý chèn \\\\clearpage bừa bãi:
- Bắt buộc dùng macro: \\\\dangbai{Tên mục}, \\\\ghinho, \\\\vidu{1}, \\\\loigiai.

### III. KHUNG MÃ LATEX MẪU (BẮT BUỘC TÁI SỬ DỤNG HOÀN TOÀN CẤU TRÚC NÀY, THAY NỘI DUNG CỦA BẠN VÀO):
\\\`\\\`\\\`latex
\${PRE_ALGEBRA_TEMPLATE}
\\\`\\\`\\\`

Bắt buộc trả về một file LaTeX duy nhất có chứa đầy đủ định dạng, lý thuyết giảng dạy, ít nhất 2 ví dụ chi tiết, và bài tập vận dụng (kèm đáp án tối giản ở cuối). Cố gắng không dùng các environment phức tạp ngoài những macro đã có sẵn.\`;
};
`;

const worksheetPrompt = `import { WorksheetConfig } from "../../types";
import { PRE_ALGEBRA_TEMPLATE } from "./latex-rules";

export const generateWorksheetPrompt = (config: WorksheetConfig): string => {
  const languageInstruction = config.language === 'vietnamese' 
    ? 'Học thuần Việt: BỎ hoàn toàn Vocabulary Box, bỏ tiếng Anh, tập trung 100% tiếng Việt.'
    : 'Học Song ngữ Anh - Việt: THÊM phần Vocabulary (từ vựng) cơ bản liên quan.';

  return \`Đóng vai Chuyên gia phát triển Bài tập/Phiếu thực hành môn "\${config.subject}". Nhiệm vụ của bạn là biên soạn nội dung học thuật "Phiếu bài tập" (Worksheet) có mức độ luyện tập cao.

### I. YÊU CẦU VỀ NỘI DUNG CHUYÊN MÔN
1. Thông tin Cốt lõi: Chủ đề: "\${config.topic}", Giáo viên: "\${config.teacherName}". Môn: "\${config.subject}". Lớp: "\${config.grade}".
2. Ngôn ngữ: \${languageInstruction}
3. Yêu cầu thêm: \${config.details || 'Thiết kế 10-15 bài tập phân loại theo độ khó (Dễ > Trung Bình > Khó).'}
4. Nội dung bài tập: Phải thực dụng, không lấy lý thuyết suông. Bắt buộc có dòng chấm trống (lệnh \\\\dongke) cho học sinh viết giải.

### II. CẤU TRÚC MÃ LATEX VÀ MACRO (BẮT BUỘC)
Giữ nguyên toàn bộ cấu hình, KHÔNG tự ý chèn lệnh \\\\clearpage. 
Sử dụng cấu trúc có sẵn:
- \\\\dangbai{Dạng bài số...}: Trình bày phương pháp giải một chút xíu rồi đưa bài tập.
- \\\\trangbaitap: Mở đầu.
- \\\\vidu{1} và \\\\loigiai: Bài tập mẫu.
- \\\\baitap{1} và \\\\dongke[3]: Chỗ làm bài (Dòng kẻ chấm). 
- Phần Đáp án ở cuối (Answer Key) vô cùng siêu rút gọn để in không tốn giấy.

### III. KHUNG MÃ LATEX NỀN TẢNG (REPLACE TOÀN BỘ COMMENT BẰNG BÀI TẬP CỦA BẠN):
\\\`\\\`\\\`latex
\${PRE_ALGEBRA_TEMPLATE}
\\\`\\\`\\\`

Trả về mã LaTeX (Từ \\\\documentclass đến \\\\end{document}) đầy đủ phần bài tập đã được tạo bằng bộ macro trên. Tuyệt đối không sinh lý thuyết lan man.\`;
};
`;

fs.writeFileSync('services/prompts/exam.ts', examPrompt);
fs.writeFileSync('services/prompts/roadmap.ts', roadmapPrompt);
fs.writeFileSync('services/prompts/learning.ts', learningPrompt);
fs.writeFileSync('services/prompts/worksheet.ts', worksheetPrompt);
