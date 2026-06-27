export const LATEX_TECHNICAL_RULES = `
QUY TẮC KỸ THUẬT LATEX (BẮT BUỘC ĐỂ KHÔNG BỊ LỖI HIỂN THỊ):
1. KHÔNG SỬ DỤNG MARKDOWN: Tuyệt đối không dùng **, *, #, - (dấu gạch đầu dòng markdown) bên trong mã nguồn LaTeX. Thay vào đó hãy dùng \\textbf{}, \\textit{}, \\section{}, \\begin{itemize}. BẮT BUỘC phải bọc toàn bộ mã nguồn LaTeX cuối cùng trong block markdown \`\`\`latex ... \`\`\` để tiện cho việc copy.
2. TIẾNG VIỆT & TRÌNH BIÊN DỊCH: Bắt buộc thiết kế để biên dịch bằng pdfLaTeX. Sử dụng gói lệnh \\usepackage[utf8]{inputenc} và \\usepackage[T1]{fontenc}, kết hợp \\usepackage{vietnam}. KHÔNG dùng fontspec hay xelatex.
3. TOÁN HỌC & CÔNG THỨC: Tất cả công thức toán học, biến số phải nằm trong $...$ hoặc \\[ ... \\]. Không để công thức toán ở dạng text thường. ĐẢM BẢO đã đóng ngoặc $ hoặc \\] hợp lệ.
4. KÝ TỰ ĐẶC BIỆT & ESCAPE: Bắt buộc escape các ký tự đặc biệt của LaTeX. Muốn viết phần trăm (%) phải viết là \\%. Muốn viết dấu & phải viết là \\&. Các ký tự _, $, {, } cũng phải escape (\\_, \\$, \\{, \\}). Ký tự % là comment, nếu dùng để comment phải xuống dòng ngay sau đó.
5. CẤU TRÚC BỀN VỮNG: Phải bao gồm đầy đủ từ \\documentclass cho đến \\end{document}. Đảm bảo mọi môi trường \\begin{...} đều phải có \\end{...} đóng lại tương ứng, không được thiếu.
6. THIẾT KẾ UI (HỘP & TIÊU ĐỀ): Giảm thiểu tối đa số lượng box. Nếu dùng tcolorbox thì BẮT BUỘC thiết lập viền vuông vức (dùng tùy chọn sharp corners, ví dụ: \\begin{tcolorbox}[sharp corners]), KHÔNG ĐƯỢC bo tròn. Các tiêu đề \\section, \\subsection mặc định phải tô màu xanh dương (kiểu color{myblue} hoặc color{blue}).
`;

export const ROADMAP_TEMPLATE = `
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
\\usetikzlibrary{arrows.meta, positioning}

\\usepackage[most]{tcolorbox}
\\tcbset{sharp corners} % Yeu cau box vuong vuc

\\setlength{\\parindent}{0pt}
\\setlength{\\parskip}{5pt}
\\renewcommand{\\baselinestretch}{1.12}

\\pagestyle{fancy}
\\fancyhf{}
\\lhead{\\small Lộ trình học tập}
\\rhead{\\small Mục tiêu: [MỤC TIÊU]}
\\cfoot{\\small \\thepage}
\\renewcommand{\\headrulewidth}{0.4pt}

\\titleformat{\\section}{\\Large\\bfseries\\color{myblue}}{\\thesection.}{0.5em}{}
\\titleformat{\\subsection}{\\large\\bfseries\\color{myblue}}{}{0pt}{}

\\begin{document}

\\begin{center}
    {\\huge\\bfseries\\color{myblue} LỘ TRÌNH HỌC TẬP TỪ A ĐẾN Z}\\\\[10pt]
    {\\Large Chuyên đề: [TÊN CHUYÊN ĐỀ]}\\\\[5pt]
    \\textit{Thời gian dự kiến: [X] tuần}
\\end{center}
\\vspace{10pt}

\\section{Tổng quan và Định hướng (Mindset)}
% Viết phần Mindset chuẩn bị tinh thần

\\section{Bản đồ Lộ trình Tổng thể}
% Vẽ bảng tóm tắt thời gian và các chặng

\\section{Chi tiết các chặng}
% Chi tiết từng Giai đoạn, các khái niệm, bài tập

\\end{document}
`;

export const PRE_ALGEBRA_TEMPLATE = `
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

export const EXAM_TEMPLATE = `
% !TEX program = pdflatex
\\documentclass[12pt,a4paper]{article}

\\usepackage[a4paper,top=1.8cm,bottom=1.8cm,left=1.5cm,right=1.5cm]{geometry}
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
\\usepackage{tikz}
\\usepackage[table]{xcolor}
\\definecolor{myblue}{RGB}{0,112,192}

\\usepackage[most]{tcolorbox}
\\tcbset{sharp corners} % Yeu cau box vuong vuc

\\setlength{\\parindent}{0pt}
\\setlength{\\parskip}{3pt}
\\renewcommand{\\baselinestretch}{1.1}
\\setlist[itemize]{leftmargin=1.2cm}
\\setlist[enumerate]{leftmargin=1cm,itemsep=4pt}

\\pagestyle{fancy}
\\fancyhf{}
\\lhead{\\textbf{KỲ THI/BÀI KIỂM TRA}}
\\rhead{\\textbf{Môn thi: [TÊN MÔN]}}
\\cfoot{\\small Trang \\thepage}
\\renewcommand{\\headrulewidth}{0.4pt}

\\newcommand{\\cauhoi}[1]{\\vspace{6pt}\\noindent{\\textbf{Câu #1.}}}
\\newcommand{\\dapan}[4]{ 
\\begin{multicols}{4}
    \\begin{enumerate}[label=\\textbf{\\Alph*.}, itemsep=2pt, leftmargin=*]
        \\item #1
        \\item #2
        \\item #3
        \\item #4
    \\end{enumerate}
\\end{multicols}
\\vspace{-4pt}
}

\\begin{document}

\\begin{center}
    {\\Large\\bfseries ĐỀ THI ĐÁNH GIÁ NĂNG LỰC}\\\\[5pt]
    {\\large\\bfseries Môn: [MÔN] - Tên chủ đề/Phạm vi kiến thức}\\\\[5pt]
    \\textit{Thời gian làm bài: [XX] phút}
\\end{center}
\\vspace{5pt}
\\noindent\\rule{\\linewidth}{0.8pt}
\\vspace{10pt}

\\section*{\\color{myblue}I. PHẦN TRẮC NGHIỆM}
% Điền các câu hỏi trắc nghiệm dùng lệnh \\cauhoi và \\dapan

\\section*{\\color{myblue}II. PHẦN TỰ LUẬN}
% Điền các câu hỏi tự luận

\\newpage
\\begin{center}
    {\\Large\\bfseries ĐÁP ÁN VÀ HƯỚNG DẪN GIẢI CHI TIẾT}
\\end{center}
\\vspace{10pt}

\\section*{\\color{myblue}I. PHẦN TRẮC NGHIỆM}
% Bảng đáp án trắc nghiệm nhiều cột

\\section*{\\color{myblue}II. PHẦN TỰ LUẬN}
% Lời giải tự luận phân tích từng bước

\\end{document}
`;