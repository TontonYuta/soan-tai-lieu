import { ExamConfig, LearningConfig, RoadmapConfig, WorksheetConfig, VideoConfig } from "../types";

const LATEX_TECHNICAL_RULES = `
QUY TẮC KỸ THUẬT LATEX (BẮT BUỘC):
1. KHÔNG SỬ DỤNG MARKDOWN: Tuyệt đối không dùng **, *, #, - (dấu gạch đầu dòng markdown) bên trong mã nguồn LaTeX. Thay vào đó hãy dùng \\textbf{}, \\textit{}, \\section{}, \\begin{itemize}.
2. TIẾNG VIỆT & TRÌNH BIÊN DỊCH: Bắt buộc thiết kế để biên dịch bằng pdfLaTeX. Sử dụng gói lệnh \\usepackage[utf8]{inputenc} và \\usepackage[T1]{fontenc}, kết hợp \\usepackage{vietnam}. KHÔNG dùng fontspec hay xelatex.
3. TOÁN HỌC: Tất cả công thức phải nằm trong $...$ hoặc \\[ ... \\]. Sử dụng amsmath, amssymb.
4. CẤU TRÚC: Phải bao gồm đầy đủ từ \\documentclass cho đến \\end{document}.
5. TRÁNH LỖI BIÊN DỊCH: Không tự ý dùng ký tự đặc biệt như % (trừ khi comment), &, _, $, {, } mà không escape tương ứng.
6. THIẾT KẾ UI (HỘP & TIÊU ĐỀ): Giảm thiểu tối đa số lượng box. Nếu dùng tcolorbox thì BẮT BUỘC thiết lập viền vuông vức (dùng tùy chọn sharp corners, ví dụ: \\begin{tcolorbox}[sharp corners]), KHÔNG ĐƯỢC bo tròn. Các tiêu đề \\section, \\subsection mặc định phải tô màu xanh dương (kiểu color{myblue} hoặc color{blue}).
`;

const PRE_ALGEBRA_TEMPLATE = `
% !TEX program = pdflatex
\\documentclass[12pt,a4paper]{article}

\\usepackage[a4paper,top=1.8cm,bottom=1.8cm,left=1.8cm,right=1.8cm]{geometry}
\\usepackage[utf8]{inputenc}
\\usepackage[T1]{fontenc}
\\usepackage{vietnam}
\\usepackage{mathptmx}
\\usepackage{amsmath,amssymb}
\\usepackage{enumitem}
\\usepackage{multicol}
\\usepackage{fancyhdr}
\\usepackage{titlesec}
\\usepackage{tabularx}
\\usepackage{array}
\\usepackage{pgffor}
\\usepackage{tikz}
\\usepackage[table]{xcolor}
\\definecolor{myblue}{RGB}{0,112,192}
\\usetikzlibrary{arrows.meta}

\\usepackage[most]{tcolorbox}
\\tcbset{sharp corners} % Yeu cau box vuong vuc

\\setlength{\\parindent}{0pt}
\\setlength{\\parskip}{5pt}
\\renewcommand{\\baselinestretch}{1.12}
\\setlist[itemize]{leftmargin=1.2cm}
\\setlist[enumerate]{leftmargin=1cm,itemsep=4pt}

\\pagestyle{fancy}
\\fancyhf{}
\\lhead{\\small Tài liệu học tập}
\\rhead{\\small Giáo viên biên soạn}
\\cfoot{\\small \\thepage}
\\renewcommand{\\headrulewidth}{0.4pt}

\\titleformat{\\section}{\\Large\\bfseries\\color{myblue}}{Bài \\thesection.}{0.5em}{}
\\titleformat{\\subsection}{\\large\\bfseries\\color{myblue}}{}{0pt}{}
\\titleformat{\\subsubsection}{\\normalsize\\bfseries\\color{myblue}}{}{0pt}{}
\\addto\\captionsvietnamese{\\renewcommand{\\contentsname}{Mục lục}}

\\newcommand{\\dongke}[1][4]{%
\\par\\vspace{2mm}\\textit{Bài làm.}\\par
\\foreach \\i in {1,...,#1}{\\vspace{5mm}\\noindent\\makebox[\\linewidth]{\\dotfill}\\par}\\vspace{2mm}
}
\\newcommand{\\dangbai}[1]{\\vspace{10pt}\\subsection{#1}\\vspace{-2mm}{\\color{myblue}\\hrule}\\vspace{5mm}}
\\newcommand{\\trangbaitap}{\\vspace{15pt}\\subsubsection{Bài tập tự luyện}\\vspace{-2mm}{\\color{myblue}\\hrule}\\vspace{5mm}}
\\newcommand{\\vidu}[1]{\\vspace{5pt}\\noindent{\\color{myblue}\\textbf{Ví dụ #1.}}}
\\newcommand{\\loigiai}{\\par\\textbf{Lời giải.}}
\\newcommand{\\ghinho}{\\textbf{Ghi nhớ.}}
\\newcommand{\\baitap}[1]{\\vspace{6pt}\\noindent{\\color{myblue}\\textbf{Bài #1.}}}
\\newcolumntype{C}{>{\\centering\\arraybackslash}X}

\\begin{document}

\\begin{titlepage}
\\begin{center}
    \\vspace*{1.2cm}
    {\\Large\\bfseries TÀI LIỆU HỌC TẬP}\\\\[8pt]
    {\\Large\\bfseries CHUYÊN SÂU}\\\\[10pt]
    {\\Large\\bfseries CHỦ ĐỀ: [MỤC TIÊU BÀI HỌC CỤ THỂ]}\\\\[8pt]
    {\\Huge\\bfseries [TÊN CHỦ ĐỀ CHÍNH]}\\\\[10pt]
    {\\Large\\bfseries [PHỤ ĐỀ NẾU CÓ]}\\\\[12pt]
    \\rule{0.75\\linewidth}{0.5pt}\\\\[12pt]
    {\\large\\bfseries Giáo viên: [TÊN GIÁO VIÊN]}\\\\[4pt]
\\end{center}
\\vspace{18pt}
\\begin{tabularx}{\\linewidth}{X X}
Họ và tên: \\dotfill & Lớp: \\dotfill\\\\[8pt]
Ngày học: \\dotfill & Điểm: \\dotfill
\\end{tabularx}
\\vfill
\\begin{center}
\\textit{Tài liệu lưu hành nội bộ.}\\\\
\\textit{Khóa học: [TÊN KHÓA HỌC / LỚP HỌC]}
\\end{center}
\\end{titlepage}

\\vspace{20pt}

\\section{[TÊN BÀI HỌC CHÍNH]}

\\dangbai{Phần 1. Vocabulary Box -- Từ vựng trọng tâm}
% Sinh bảng từ vựng bằng tabularx với các cột C và phần \\ghinho tóm tắt lý thuyết tại đây (Nếu có tùy chọn Song Ngữ, bỏ đi nếu Thuần Việt)

\\dangbai{Phần 2. Lý thuyết nền tảng}
% Sinh nội dung lý thuyết thuần học thuật tại đây, kết hợp vẽ hình minh họa bằng TikZ nếu cần thiết.

\\dangbai{Phần 3. Guided Examples -- Ví dụ có hướng dẫn}
% Sinh tối thiểu 3-5 ví dụ áp dụng cấu trúc \\vidu, \\loigiai, có giải thích.

\\trangbaitap
\\dangbai{Phần 4. Multiple Choice Practice -- Bài tập trắc nghiệm}
% Sinh các câu hỏi trắc nghiệm dùng \\baitap, có ghi chú từ khóa \\textit{Từ khóa:} và \\dongke[2] hoặc \\dongke[3].

\\trangbaitap
\\dangbai{Phần 5. Short Answer Practice -- Bài tập tự luận}
% Sinh câu hỏi tự luận, dịch thuật toán học hoặc tính toán nâng cao sử dụng \\baitap và \\dongke[4].

\\vspace{20pt}
\\section{Answer Key -- Đáp án}
% Sinh ma trận đáp án trắc nghiệm gọn gàng chi tiết theo bảng nhiều cột.
% Tự luận ghi kết quả ngắn gọn.

\\vspace{20pt}
\\section{Vocabulary Review -- Ôn tập từ vựng}
% Nếu song ngữ: hệ thống lại từ vựng bằng tabularx.

\\vfill
\\begin{center}
\\rule{0.65\\linewidth}{0.4pt}\\\\[5pt]
\\textbf{Chúc các em học tốt!}
\\end{center}

\\end{document}
`;

export const generateWorksheetPrompt = (config: WorksheetConfig): string => {
  const languageInstruction = config.language === 'vietnamese' 
    ? 'Học thuần Việt: BỎ hoàn toàn Vocabulary Box, bỏ tiếng Anh, tập trung 100% tiếng Việt.'
    : 'Học Song ngữ Anh - Việt: THÊM phần Vocabulary (từ vựng) Toán học cơ bản liên quan.';

  return `Đóng vai Chuyên gia biên soạn tài liệu giáo dục và Giảng viên toán chuyên sâu. Nhiệm vụ của bạn là biên soạn nội dung học thuật "Phiếu bài tập" dựa trên cấu trúc định hình sẵn.

### YÊU CẦU VỀ NỘI DUNG CHUYÊN MÔN
1. Học thuật: Trình bày logic, không ví von đời thường.
2. Ngôn ngữ: ${languageInstruction}
3. Nội dung biên soạn: Tạo hoàn chỉnh cho Chủ đề: "${config.topic}", Giáo viên: "${config.teacherName}". Môn: "${config.subject}". Lớp: "${config.grade}". Tập trung sâu vào bài tập thực hành.

### CẤU TRÚC MÃ LATEX BẮT BUỘC
Gộp các trang, tuyệt đối KHÔNG tự ý chèn lệnh \\clearpage bừa bãi. Sử dụng cấu trúc:
- \\dangbai{Tên phần}: Phân chia phần.
- \\ghinho: Đặt trước khối itemize.
- \\vidu{Số thứ tự} và \\loigiai: Bài mẫu.
- \\trangbaitap: Mở đầu bài tập luyện tập.
- \\baitap{Số thứ tự} và \\dongke[Số dòng]: Câu hỏi.
- Đáp án: Trình bày vô cùng GỌN GÀNG, tiết kiệm trang.

### KHUNG MÃ LATEX NỀN TẢNG (CHỈ MƯỢN BỘ MACRO, TỰ ĐỘNG THAY THẾ TOÀN BỘ COMMENT BẰNG NỘI DUNG BÀI CỦA BẠN):
\`\`\`latex
${PRE_ALGEBRA_TEMPLATE}
\`\`\`

Bắt buộc trả về đúng 100% nội dung LaTeX đã có nội dung đầy đủ bài tập và đáp án.`;
};

export const generateLearningPrompt = (config: LearningConfig): string => {
  const languageInstruction = config.language === 'vietnamese' 
    ? 'Học thuần Việt: BỎ hoàn toàn phần Vocabulary Box và bỏ tiếng Anh, đi thẳng vào kiến thức Toán.'
    : 'Học Song ngữ Anh - Việt: Biên soạn đầy đủ Vocabulary Box, các từ khóa trong bài bằng Tiếng Anh.';

  return `Đóng vai Chuyên gia biên soạn. Nhiệm vụ: biên soạn tài liệu môn "${config.subject}" cho lớp ${config.grade} (${config.audience}).

### YÊU CẦU CHUYÊN MÔN
1. Định hướng: ${config.goal}. Phong cách: ${config.tone}.
2. Ngôn ngữ: ${languageInstruction}
3. Cụ thế hóa nội dung chủ đề: "${config.topic}". Tập trung giải thích lý thuyết, có ví dụ dẫn dắt.

### CẤU TRÚC MÃ LATEX BẮT BUỘC
Tuyệt đối KHÔNG tự ý chèn \\clearpage bừa bãi:
- \\dangbai{Tên phần}: Phân chia mục.
- \\ghinho: Nhấn mạnh lý thuyết.
- \\vidu{Số thứ tự} và \\loigiai: Giải tuần tự.
- \\baitap{Số thứ tự} và \\dongke[Dòng]: Bài tập áp dụng.
- Lời giải cuối bài cực kì GỌN GÀNG.

### KHUNG MÃ LATEX MẪU (BẠN PHẢI SINH RA BÀI Y HỆT THEO FORMAT NHƯ THẾ NÀY, ĐIỀN ĐẦY ĐỦ NỘI DUNG LÝ THUYẾT, BÀI TẬP VÀO):
\`\`\`latex
${PRE_ALGEBRA_TEMPLATE}
\`\`\`

Bắt buộc trả về một file LaTeX duy nhất có chứa đầy đủ cả định dạng, lý thuyết giảng dạy, ví dụ, bài tập và đáp án.`;
};

export const generateExamPrompt = (config: ExamConfig): string => {
  const totalQuestions = config.counts.mc + config.counts.essay;
  const matrixInfo = `NB: ${config.matrix.lv1}, TH: ${config.matrix.lv2}, VD: ${config.matrix.lv3}, VDC: ${config.matrix.lv4}`;

  return `Đóng vai Chuyên gia soạn đề thi Bộ GD&ĐT Việt Nam giàu kinh nghiệm. Hãy soạn mã LaTeX thiết kế đề thi cho kỳ thi sau:

I. THÔNG TIN:
- Môn học: ${config.subject}
- Lớp: ${config.grade}
- Khối lượng: ${totalQuestions} câu (${config.counts.mc} trắc nghiệm, ${config.counts.essay} tự luận)
- Ma trận: ${matrixInfo}
- Thời gian: ${config.time} phút

II. YÊU CẦU KỸ THUẬT:
${LATEX_TECHNICAL_RULES}
- Trình bày dạng đề chính thức, mã đề, trang bìa môn học nếu cần.
- Dùng multicols phân chia cột hợp lý siêu tiết kiệm giấy, không tự ý chèn \\clearpage bừa bãi.
- PHẦN ĐÁP ÁN: Tạo bảng đáp án trắc nghiệm siêu tiết kiệm giấy cuối bài, cực tối giản (chia multicols hoặc array nhiều cột). Lời giải VD VDC vắn tắt.

Hãy trả về mã latex hoàn chỉnh nội dung.`;
};

export const generateRoadmapPrompt = (config: RoadmapConfig): string => {
  const syllabusContext = config.syllabus 
    ? `DỰA TRÊN ĐỀ CƯƠNG CHI TIẾT SAU:
    ${config.syllabus}
    (Yêu cầu: Phải bám sát thứ tự chương/mục và các từ khóa kiến thức có trong đề cương này để lập lộ trình).\n` 
    : '';

  return `Đóng vai Kiến trúc sư Giáo dục và Cố vấn học tập giàu kinh nghiệm. Hãy LẬP MỘT LỘ TRÌNH HỌC TẬP TỪ CƠ BẢN ĐẾN CHI TIẾT VÀ TÂM LÝ bằng định dạng LATEX (sử dụng trình biên dịch pdfLaTeX). Mọi thiết kế UI phải hạn chế dùng box, nếu có dùng thì phải là box vuông vức (sharp corners), các tiêu đề (section) màu xanh dương.

I. THÔNG TIN LỘ TRÌNH:
- Môn học: ${config.subject} | Mục tiêu chính: ${config.topic}
- Thời gian: ${config.duration} | Hiện tại: ${config.currentLevel}
- Đích đến mong muốn: ${config.target}

II. YÊU CẦU HỢP LÝ BIÊN SỌAN (ĐẶC BIỆT THIẾT KẾ CHO NGƯỜI MỚI BẮT ĐẦU):
- Phải chia nhỏ khối lượng kiến thức một cách hợp lý, đi từ gốc rễ lên.
- Giảm tải áp lực giai đoạn đầu, tạo hứng thú và động lực cho người học.
- Đưa ra thời gian biểu khả thi, ôn tập ngắt quãng (Spaced repetition), không nhồi nhét.

III. BỐ CỤC LỘ TRÌNH BẾN BỮNG:
${syllabusContext}
1. Tổng quan và Định hướng (Mindset): Lời khuyên chuẩn bị cho người mới.
2. Bản đồ Lộ trình Tổng thể: Bảng phân bổ tuần/tháng (Phase) ngắn gọn.
3. Chi tiết từng chặng (Phá vỡ kiến thức thành các mảnh nhỏ): Giai đoạn, Trọng tâm, Nội dung học, Phương pháp & Bài tập luyện tập, Dấu hiệu chuyển tiếp.
4. Tài nguyên & Lời khuyên thực chiến.

${LATEX_TECHNICAL_RULES}

TRẢ VỀ NỘI DUNG MÃ NGUỒN LATEX HOÀN CHỈNH (Từ \\documentclass đến \\end{document}).`;
};


export const generateVideoManimPrompt = (config: VideoConfig): string => {
  return `Đóng vai: Bạn là một lập trình viên Python lão luyện, chuyên gia về thư viện Manim CE (Manim Community) và là một nhà truyền đạt toán học/khoa học trực quan đầy sáng tạo (như kênh 3Blue1Brown). Nhiệm vụ của bạn là viết mã nguồn Manim để tạo ra một video giảng dạy trực quan, dễ hiểu và đẹp mắt.

I. THÔNG TIN CHUNG:
- Môn học / Chủ đề: ${config.subject} / ${config.topic}
- Đối tượng người xem: ${config.audience}
- Thời lượng dự kiến: ${config.duration}
- Phong cách/Giọng điệu: ${config.tone}
- Định dạng Video: ${config.format === 'vertical' ? 'Dọc (9:16 - TikTok/Shorts)' : 'Ngang (16:9 - YouTube)'}

II. KỊCH BẢN CHI TIẾT (STORYBOARD):
Hãy cấu trúc video thành một \`Scene\` duy nhất, chia làm các phần sau (sử dụng comment trong code để phân chia):
1. Mở đầu (Intro): Hiển thị tiêu đề bài học, thu hút sự chú ý bằng một hình ảnh/chuyển động ấn tượng.
2. Khái niệm/Vấn đề: Đưa ra định nghĩa, hiển thị công thức bằng màu sắc nổi bật.
3. Trực quan hóa (Phần quan trọng nhất): Minh họa trực quan chi tiết, thay đổi liên tục.
4. Kết luận (Outro): Nhấn mạnh lại công thức cuối cùng, hiển thị logo.

III. YÊU CẦU KỸ THUẬT KHẮT KHE (BẮT BUỘC TUÂN THỦ):
- Phiên bản: Code phải tương thích hoàn toàn với Manim CE mới nhất (\`from manim import *\`).
- Định dạng: ${config.format === 'vertical' ? 'Vì là video DỌC (9:16), HÃY set `config.pixel_width = 1080` và `config.pixel_height = 1920` HOẶC sử dụng cờ CLI `--resolution 1080,1920`. Sắp xếp bố cục UI theo chiều dọc.' : 'Video ngang (16:9) mặc định.'}
- Cấu trúc code: Sử dụng \`VGroup\` để nhóm các đối tượng logic lại với nhau. Căn chỉnh vị trí gọn gàng bằng \`.arrange()\`, \`.next_to()\`, hoặc \`.move_to()\`.
- Xử lý tiếng Việt (Quan trọng):
  * TUYỆT ĐỐI KHÔNG dùng tiếng Việt có dấu trực tiếp bên trong \`MathTex\` hoặc \`Tex\` để tránh lỗi biên dịch LaTeX (Unicode error).
  * Với công thức toán học: Chỉ dùng ký hiệu toán học thuần túy trong \`MathTex\`.
  * Với văn bản diễn giải tiếng Việt: BẮT BUỘC dùng class \`Text("Nội dung tiếng Việt")\`. Nếu cần kết hợp chữ và công thức, hãy tạo các đối tượng \`Text\` và \`MathTex\` riêng biệt rồi dùng \`VGroup\` để ghép chúng lại theo chiều ngang.
- Màu sắc & Hiệu ứng: Tô màu các biến số trong công thức (ví dụ: biến $x$ màu Vàng, biến $y$ màu Đỏ) để người xem dễ theo dõi. Sử dụng đa dạng hiệu ứng như \`Write\`, \`Create\`, \`FadeIn\`, \`Transform\`, \`TransformFromCopy\` thay vì chỉ cho xuất hiện đột ngột.
- Thời gian: Chèn các khoảng \`self.wait(...)\` hợp lý để người xem kịp đọc và giáo viên kịp lồng tiếng.

IV. ĐỊNH DẠNG ĐẦU RA:
- Chỉ xuất ra một khối mã (code block) Python duy nhất chứa toàn bộ mã nguồn.
- Chú thích tiếng Việt rõ ràng từng bước trong code.
- Thêm lời khuyên bằng lệnh CLI để render video ở độ phân giải 1080p, 60fps (có sử dụng cờ \`--flush_cache\`).`;
};

export const generateVideoScriptPrompt = (config: VideoConfig): string => {
  return `Đóng vai là một chuyên gia giáo dục thiết kế kịch bản video giảng dạy (Edutainment Script Writer) và một đạo diễn trực quan (như kênh 3Blue1Brown).
Nhiệm vụ của bạn là thiết kế một kịch bản chi tiết cho video học tập của môn học này.

I. THÔNG TIN CHUNG:
- Môn học / Chủ đề: ${config.subject} / ${config.topic}
- Đối tượng người xem: ${config.audience}
- Thời lượng dự kiến: ${config.duration}
- Phong cách/Giọng điệu: ${config.tone}
- Định dạng Video: ${config.format === 'vertical' ? 'Dọc (9:16 - TikTok/Shorts)' : 'Ngang (16:9 - YouTube)'}

II. CẤU TRÚC KỊCH BẢN (STORYBOARD):
Kịch bản cần chia làm 4 phần:
1. Mở đầu (Intro): Đặt vấn đề, thu hút sự chú ý.
2. Khái niệm/Vấn đề: Đưa ra định nghĩa cốt lõi.
3. Trực quan hóa (Phần quan trọng nhất): Giải thích chi tiết bằng animation.
4. Kết luận (Outro): Tóm tắt nội dung.

III. YÊU CẦU KỊCH BẢN:
- Viết kịch bản dưới dạng BẢNG (Table - dùng Markdown) gồm 3 cột:
  * Cột 1: Thời lượng (VD: 0:00 - 0:15) / Phần (Intro, ...)
  * Cột 2: Visual (Hình ảnh / Animation Manim) - Mô tả thật chi tiết màu sắc, chuyển động. Chú ý tối ưu bố cục cho định dạng ${config.format === 'vertical' ? 'DỌC (9:16)' : 'NGANG (16:9)'}.
  * Cột 3: Audio (Voiceover) - Lời dẫn của giáo viên dễ hiểu, truyền cảm.

Trả về định dạng Markdown hoàn chỉnh, chuyên nghiệp.`;
};
