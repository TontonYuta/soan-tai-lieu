const fs = require('fs');

const content = `import { ExamConfig, LearningConfig, RoadmapConfig, WorksheetConfig } from "../types";

const LATEX_TECHNICAL_RULES = \\\`
QUY TẮC KỸ THUẬT LATEX (BẮT BUỘC):
1. KHÔNG SỬ DỤNG MARKDOWN: Tuyệt đối không dùng **, *, #, - (dấu gạch đầu dòng markdown) bên trong mã nguồn LaTeX. Thay vào đó hãy dùng \\\\textbf{}, \\\\textit{}, \\\\section{}, \\\\begin{itemize}.
2. TIẾNG VIỆT: Sử dụng gói lệnh \\\\usepackage[utf8]{inputenc} và \\\\usepackage[vietnamese]{babel} hoặc \\\\usepackage{vietnam}. Nếu lỗi font, có thể linh hoạt dùng font khác hỗ trợ tiếng Việt.
3. TOÁN HỌC: Tất cả công thức phải nằm trong $...$ hoặc \\\\[ ... \\\\]. Sử dụng amsmath, amssymb.
4. CẤU TRÚC: Phải bao gồm đầy đủ từ \\\\documentclass cho đến \\\\end{document}.
5. TRÁNH LỖI BIÊN DỊCH: Không tự ý dùng ký tự đặc biệt như % (trừ khi comment), &, _, $, {, } mà không escape tương ứng.
6. HỖ TRỢ ĐỒ HỌA: Tích cực sử dụng môi trường tcolorbox, tikz, tabularx để trình bày đẹp mắt, chuyên nghiệp.
\\\`;

const PRE_ALGEBRA_TEMPLATE = \\\`
% !TEX program = xelatex
\\\\documentclass[12pt,a4paper]{article}

\\\\usepackage[a4paper,top=1.8cm,bottom=1.8cm,left=1.8cm,right=1.8cm]{geometry}
\\\\usepackage{fontspec}
\\\\usepackage[vietnamese]{babel}
\\\\usepackage{amsmath,amssymb}
\\\\usepackage{enumitem}
\\\\usepackage{multicol}
\\\\usepackage{fancyhdr}
\\\\usepackage{titlesec}
\\\\usepackage{tabularx}
\\\\usepackage{array}
\\\\usepackage{pgffor}
\\\\usepackage{tikz}
\\\\usetikzlibrary{arrows.meta}

\\\\setmainfont{TeX Gyre Termes}
\\\\setsansfont{TeX Gyre Heros}

\\\\setlength{\\\\parindent}{0pt}
\\\\setlength{\\\\parskip}{5pt}
\\\\renewcommand{\\\\baselinestretch}{1.12}
\\\\setlist[itemize]{leftmargin=1.2cm}
\\\\setlist[enumerate]{leftmargin=1cm,itemsep=4pt}

\\\\pagestyle{fancy}
\\\\fancyhf{}
\\\\lhead{\\\\small Tập 2. Pre-Algebra in English}
\\\\rhead{\\\\small Thầy Trần Huy Hoàng}
\\\\cfoot{\\\\small \\\\thepage}
\\\\renewcommand{\\\\headrulewidth}{0.4pt}

\\\\titleformat{\\\\section}{\\\\Large\\\\bfseries}{Bài \\\\thesection.}{0.5em}{}
\\\\titleformat{\\\\subsection}{\\\\large\\\\bfseries}{}{0pt}{}
\\\\titleformat{\\\\subsubsection}{\\\\normalsize\\\\bfseries}{}{0pt}{}
\\\\addto\\\\captionsvietnamese{\\\\renewcommand{\\\\contentsname}{Mục lục}}

\\\\newcommand{\\\\dongke}[1][4]{%
\\\\par\\\\vspace{2mm}\\\\textit{Bài làm.}\\\\par
\\\\foreach \\\\i in {1,...,#1}{\\\\vspace{5mm}\\\\noindent\\\\makebox[\\\\linewidth]{\\\\dotfill}\\\\par}\\\\vspace{2mm}
}
\\\\newcommand{\\\\dangbai}[1]{\\\\clearpage\\\\subsection{#1}\\\\vspace{-2mm}\\\\hrule\\\\vspace{5mm}}
\\\\newcommand{\\\\trangbaitap}{\\\\clearpage\\\\subsubsection{Bài tập tự luyện}\\\\vspace{-2mm}\\\\hrule\\\\vspace{5mm}}
\\\\newcommand{\\\\vidu}[1]{\\\\vspace{5pt}\\\\noindent\\\\textbf{Ví dụ #1.}}
\\\\newcommand{\\\\loigiai}{\\\\par\\\\textbf{Lời giải.}}
\\\\newcommand{\\\\ghinho}{\\\\textbf{Ghi nhớ.}}
\\\\newcommand{\\\\baitap}[1]{\\\\vspace{6pt}\\\\noindent\\\\textbf{Bài #1.}}
\\\\newcolumntype{C}{>{\\\\centering\\\\arraybackslash}X}

\\\\begin{document}

\\\\begin{titlepage}
\\\\begin{center}
    \\\\vspace*{1.2cm}
    {\\\\Large\\\\bfseries PRE-ALGEBRA IN ENGLISH}\\\\\\\\[8pt]
    {\\\\Large\\\\bfseries TẬP 2}\\\\\\\\[10pt]
    {\\\\Large\\\\bfseries CHƯƠNG [GHI SỐ LÀ VÍ DỤ 1]}\\\\\\\\[8pt]
    {\\\\Huge\\\\bfseries [TÊN CHƯƠNG BẰNG TIẾNG ANH]}\\\\\\\\[10pt]
    {\\\\Large\\\\bfseries [TÊN CHƯƠNG BẰNG TIẾNG VIỆT]}\\\\\\\\[12pt]
    \\\\rule{0.75\\\\linewidth}{0.5pt}\\\\\\\\[12pt]
    {\\\\large\\\\bfseries Thầy giáo: Trần Huy Hoàng}\\\\\\\\[4pt]
    {\\\\large\\\\bfseries SĐT: 0963278149}
\\\\end{center}
\\\\vspace{18pt}
\\\\begin{tabularx}{\\\\linewidth}{X X}
Họ và tên: \\\\dotfill & Lớp: \\\\dotfill\\\\\\\\[8pt]
Ngày học: \\\\dotfill & Điểm: \\\\dotfill
\\\\end{tabularx}
\\\\vfill
\\\\begin{center}
\\\\textit{Tài liệu dành cho học sinh bắt đầu học Pre-Algebra bằng tiếng Anh.}\\\\\\\\
\\\\textit{Mục tiêu: [MỤC TIÊU BÀI HỌC CỤ THỂ]}
\\\\end{center}
\\\\end{titlepage}

\\\\clearpage
\\\\tableofcontents
\\\\clearpage

\\\\section{[TÊN BÀI HỌC CHÍNH]}

\\\\dangbai{Phần 1. Vocabulary Box -- Từ vựng trọng tâm}
% Sinh bảng từ vựng bằng tabularx với các cột C và phần \\\\ghinho tóm tắt lý thuyết tại đây

\\\\dangbai{Phần 2. Lý thuyết và Cơ bản}
% Sinh nội dung lý thuyết thuần học thuật tại đây, kết hợp vẽ hình minh họa bằng TikZ nếu cần thiết.

\\\\dangbai{Phần 3. Guided Examples -- Ví dụ có hướng dẫn}
% Sinh tối thiểu 3-5 ví dụ áp dụng cấu trúc \\\\vidu, \\\\loigiai, có giải nghĩa từ khóa tiếng Anh và đóng khung kết quả.

\\\\trangbaitap
\\\\dangbai{Phần 4. Multiple Choice Practice -- Bài tập trắc nghiệm}
% Sinh các câu hỏi trắc nghiệm dùng \\\\baitap, có ghi chú từ khóa \\\\textit{Từ khóa:} và \\\\dongke[2] hoặc \\\\dongke[3].

\\\\trangbaitap
\\\\dangbai{Phần 5. Short Answer Practice -- Bài tự nhập đáp án / Tự luận}
% Sinh câu hỏi tự luận, dịch thuật toán học hoặc tính toán nâng cao sử dụng \\\\baitap và \\\\dongke[4].

\\\\clearpage
\\\\section{Answer Key -- Đáp án}
% Sinh ma trận đáp án trắc nghiệm bằng môi trường array hoặc hệ thống enumerate ngắn gọn cho phần tự luận.

\\\\clearpage
\\\\section{Vocabulary Review -- Ôn tập từ vựng}
% Hệ thống lại toàn bộ từ vựng đã xuất hiện trong bài bằng bảng tabularx 2 cột C: English | Tiếng Việt.

\\\\vfill
\\\\begin{center}
\\\\rule{0.65\\\\linewidth}{0.4pt}\\\\\\\\[5pt]
\\\\textbf{Chúc các em học tốt!}\\\\\\\\
\\\\textbf{Thầy giáo Trần Huy Hoàng -- SĐT: 0963278149}
\\\\end{center}

\\\\end{document}
\\\`;

export const generateWorksheetPrompt = (config: WorksheetConfig): string => {
  return \\\`Đóng vai Chuyên gia biên soạn tài liệu giáo dục và Giảng viên toán chuyên sâu. Nhiệm vụ của bạn là biên soạn nội dung học thuật "Phiếu bài tập" dựa trên cấu trúc hệ thống đã định hình sẵn.

### YÊU CẦU VỀ NỘI DUNG CHUYÊN MÔN
1. Học thuật và Khoa học: Trình bày định nghĩa, phương pháp giải toán logic, chính xác, tính học thuật cao. TUYỆT ĐỐI KHÔNG ví von đời thường.
2. Song ngữ Anh - Việt: Biên soạn đầy đủ phần "Vocabulary Box", từ khóa (Keywords) bằng tiếng Anh.
3. Nội dung biên soạn: Tạo nội dung hoàn chỉnh cho Chủ đề: "\${config.topic}". Tập trung sâu vào phần bài tập.

### CẤU TRÚC MÃ LATEX BẮT BUỘC
Bạn phải xuất ra TOÀN BỘ CODE LATEX thay vì để lại comment. Phải tuân thủ nghiêm ngặt hệ thống macro:
- \\\\dangbai{Tên phần}: Phân chia các phần.
- \\\\ghinho: Đặt trước khối itemize.
- \\\\vidu{Số thứ tự} và \\\\loigiai: Bài mẫu hướng dẫn.
- \\\\trangbaitap: Mở đầu trang bài tập.
- \\\\baitap{Số thứ tự} và \\\\dongke[Số dòng]: Câu hỏi bài tập và dòng kẻ chấm.
- Cấu trúc bảng từ vựng: Dùng tabularx với định dạng cột C.

### KHUNG MÃ LATEX NỀN TẢNG (HIỆU CHỈNH THEO CHỦ ĐỀ)
\\\\\\\`\\\\\\\`\\\\\\\`latex
\${PRE_ALGEBRA_TEMPLATE}
\\\\\\\`\\\\\\\`\\\\\\\`

LƯU Ý QUAN TRỌNG: BẠN PHẢI TỰ ĐỘNG THÊM NỘI DUNG CHI TIẾT (BÀI TẬP HIỆU QUẢ) VÀO MÃ LATEX ĐẦY ĐỦ THAY VÌ CHỈ COPY LẠI COMMENT CỦA FORM. Tuyệt đối không dùng Markdown bên ngoài. Trả về đúng nội dung LaTeX hoàn thiện nhằm in ấn trực tiếp hoặc xem PDF chất lượng cao.\\\`;
};

export const generateLearningPrompt = (config: LearningConfig): string => {
  return \\\`Đóng vai Chuyên gia biên soạn tài liệu giáo dục và Giảng viên toán chuyên sâu. Nhiệm vụ của bạn là biên soạn nội dung học thuật cho chuỗi bài học/handout chuyên sâu dựa trên cấu trúc hệ thống định hình.

### YÊU CẦU VỀ NỘI DUNG CHUYÊN MÔN
1. Học thuật và Khoa học: Trình bày định nghĩa, định lý, tính chất một cách logic, chính xác, tính học thuật cao.
2. Song ngữ Anh - Việt: Biên soạn đầy đủ "Vocabulary Box", từ khóa để học sinh quen thuật ngữ tiếng Anh.
3. Nội dung biên soạn: Tạo nội dung hoàn chỉnh cho Chủ đề: "\${config.topic}". Tập trung chi tiết giải thích lý thuyết và ví dụ dẫn dắt.

### CẤU TRÚC MÃ LATEX BẮT BUỘC
Bạn phải xuất ra TOÀN BỘ CODE LATEX thay vì comment. Tuân thủ nghiêm ngặt hệ thống macro:
- \\\\dangbai{Tên phần}: Phân chia phần bài học.
- \\\\ghinho: Nhấn mạnh lý thuyết cốt lõi.
- \\\\vidu{Số thứ tự} và \\\\loigiai: Ví dụ có hướng dẫn.
- \\\\trangbaitap: Mở đầu bài tập luyện tập nhanh.
- \\\\baitap{Số thứ tự} và \\\\dongke[Số dòng]: Câu hỏi.
- Bảng từ vựng: Môi trường tabularx với cột C.

### KHUNG MÃ LATEX NỀN TẢNG (HIỆU CHỈNH THEO CHỦ ĐỀ)
\\\\\\\`\\\\\\\`\\\\\\\`latex
\${PRE_ALGEBRA_TEMPLATE}
\\\\\\\`\\\\\\\`\\\\\\\`

LƯU Ý QUAN TRỌNG : BẠN PHẢI TỰ ĐỘNG THÊM NỘI DUNG LÝ THUYẾT VÀ BÀI TẬP VÀO MÃ LATEX ĐẦY ĐỦ THAY VÌ CHỈ LẠI COMMENT. Trả về toàn bộ nội dung LaTeX hoàn hảo.\\\`;
};

export const generateExamPrompt = (config: ExamConfig): string => {
  const totalQuestions = config.counts.mc + config.counts.essay;
  const matrixInfo = \\\`NB: \${config.matrix.lv1}, TH: \${config.matrix.lv2}, VD: \${config.matrix.lv3}, VDC: \${config.matrix.lv4}\\\`;
  const structInfo = config.structure === '2025' ? 'Cấu trúc năm 2025 (Trắc nghiệm nhiều lựa chọn, Đúng/Sai, Trả lời ngắn)' : 'Cấu trúc truyền thống';

  return \\\`Đóng vai Chuyên gia soạn đề thi Bộ GD&ĐT Việt Nam giàu kinh nghiệm. Hãy soạn mã LaTeX thiết kế đề thi và đáp án cho kỳ thi sau:

I. THÔNG TIN:
- Môn học: \${config.subject}
- Lớp: \${config.grade}
- Khối lượng: \${totalQuestions} câu (\${config.counts.mc} trắc nghiệm, \${config.counts.essay} tự luận)
- Ma trận: \${matrixInfo}
- Thời gian làm bài: \${config.time} phút
- Cấu trúc đặc biệt: \${structInfo}

II. YÊU CẦU KỸ THUẬT:
\${LATEX_TECHNICAL_RULES}
- Trình bày dạng đề chính thức chuyên nghiệp, tiêu đề, mã đề, trang bìa môn học.
- Dùng multicols hoặc enumerate phân chia cột hợp lý để tiết kiệm giấy.
- PHẦN ĐÁP ÁN: Tạo bảng đáp án trắc nghiệm ở cuối, kèm lời giải chi tiết cho các câu mức độ VD và VDC.

Hãy xuất bản mã nguồn LaTeX hoàn chỉnh và xịn sò ngay lập tức.\\\`;
};

export const generateRoadmapPrompt = (config: RoadmapConfig): string => {
  const syllabusContext = config.syllabus 
    ? \\\`DỰA TRÊN ĐỀ CƯƠNG CHI TIẾT SAU:
    \${config.syllabus}
    (Yêu cầu: Phải bám sát thứ tự chương/mục và các từ khóa kiến thức có trong đề cương này để lập lộ trình).\\n\\\` 
    : '';

  return \\\`Đóng vai Kiến trúc sư Giáo dục chuyên nghiệp. Hãy LẬP MỘT LỘ TRÌNH HỌC TẬP khoa học và thiết thực (VIẾT BẰNG ĐỊNH DẠNG MARKDOWN CHUẨN ĐỂ ĐỌC TRỰC TIẾP TRONG CHAT).

I. THÔNG TIN LỘ TRÌNH:
- Môn học: \${config.subject} | Mục tiêu chính: \${config.topic}
- Thời gian: \${config.duration} | Trình độ hiện tại: \${config.currentLevel}
- Đích đến mong muốn: \${config.target}

II. BỐ CỤC LỘ TRÌNH:
\${syllabusContext}
1. Giới thiệu tổng quan định hướng.
2. Phân bổ kiến thức: Chia nhỏ theo từng Phase/Giai đoạn hoặc Ngày/Tuần một cách hợp lý. Sử dụng danh sách, bảng biểu markdown để làm nổi bật.
3. Cụ thế từng chặng:
   - Thời gian
   - Chủ đề trọng tâm
   - Nội dung chi tiết cần học
   - Phương pháp thực nghiệm / Bài tập
   - Cột mốc hoàn thành
4. Tài liệu tham khảo và lời khuyên: Gợi ý các nguồn tài liệu và tips tránh sai lầm.

III. YÊU CẦU KẾT QUẢ:
- Trình bày ĐẸP bằng Markdown, có sử dụng in đậm, in nghiêng, trích dẫn, hoặc bảng Markdown.
- Lộ trình phải sinh động, cụ thể và khả thi.

TRẢ VỀ NỘI DUNG MARKDOWN HOÀN CHỈNH NGAY LẬP TỨC.\\\`;
};
`

fs.writeFileSync('services/gemini.ts', content);
