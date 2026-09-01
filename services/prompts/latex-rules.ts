export const LATEX_TECHNICAL_RULES = `
QUY TẮC KỸ THUẬT LATEX TOÁN HỌC (BẮT BUỘC ĐỂ BIÊN DỊCH 100% THÀNH CÔNG VỚI PDFLATEX TRÊN OVERLEAF):
1. QUY TẮC ĐẦU RA (OUTPUT FORMAT - BẮT BUỘC TUYỆT ĐỐI):
   - BẮT BUỘC chỉ xuất ra duy nhất 1 khối mã nguồn LaTeX hoàn chỉnh bắt đầu bằng \`\`\`latex và kết thúc bằng \`\`\`.
   - TUYỆT ĐỐI KHÔNG xuất bất kỳ câu chào hỏi, lời dẫn, chú thích hay thẻ nào bên ngoài khối \`\`\`latex ... \`\`\`.
   - Mã nguồn phải chứa đầy đủ từ \\documentclass đến \\end{document}, sẵn sàng biên dịch trực tiếp không thiếu sót.
2. KHÔNG DÙNG CÚ PHÁP MARKDOWN TRONG CODE: Tuyệt đối không dùng **, *, #, - bên trong mã LaTeX. Dùng \\textbf{}, \\textit{}, \\section{}, \\begin{itemize}, \\begin{enumerate}.
3. TIẾNG VIỆT & TRÌNH BIÊN DỊCH: Bắt buộc tương thích pdfLaTeX. Sử dụng gói lệnh:
   \\usepackage[utf8]{inputenc}
   \\usepackage[T1]{fontenc}
   \\usepackage{vietnam}
   KHÔNG dùng fontspec hay xelatex.
4. TOÁN HỌC & KÝ HIỆU:
   - Mọi biểu thức toán học, biến số, hàm số, phương trình phải nằm trong $...$ hoặc \\[ ... \\].
   - Tên góc, đoạn thẳng, vectơ: dùng $\\widehat{ABC}$, $AB$, $\\vec{u}$ hoặc $\\overrightarrow{AB}$.
   - Tích phân, vi phân, giới hạn: $\\int_{a}^{b} f(x)\\,\\mathrm{d}x$, $\\lim_{x \\to x_0} f(x)$.
   - Đảm bảo đã đóng mở ngoặc $ hoặc \\[ \\] đầy đủ, không thiếu.
5. KÝ TỰ ĐẶC BIỆT & ESCAPE:
   - Bắt buộc escape: \\% (phần trăm), \\& (và), \\_ (gạch dưới), \\$ (đô la), \\{ \\} (ngoặc nhọn khi in chữ).
6. VẼ HÌNH HỌC & ĐỒ THỊ TIKZ:
   - Sử dụng \\usepackage{tikz}, \\usepackage{pgfplots}, \\pgfplotsset{compat=1.18}.
   - Thư viện TikZ cần thiết: \\usetikzlibrary{arrows.meta, positioning, calc, angles, quotes, patterns}.
   - Khi vẽ hình học không gian (khối chóp, lăng trụ, nón, trụ, cầu): nét đứt dùng [dashed], nét liền dùng [thick], góc vuông dùng \\pic [draw, angle radius=2mm] {right angle = ...}.
   - Bảng biến thiên: Dùng cấu trúc bảng chuẩn sạch (tabular/array) hoặc tikzpicture với các hàng $x$, $f'(x)$, $f(x)$ và mũi tên $\\nearrow, \\searrow$ thẳng hàng.
7. THIẾT KẾ UI & KHUNG VIỀN:
   - Nếu dùng tcolorbox, BẮT BUỘC dùng [sharp corners] để viền vuông vức hiện đại, không dùng bo tròn.
   - Tiêu đề dùng màu xanh dương dịu (\\definecolor{myblue}{RGB}{0,102,204}).
`;

export const EXAM_TEMPLATE_2025 = `
% !TEX program = pdflatex
\\documentclass[12pt,a4paper]{article}

\\usepackage[a4paper,top=1.5cm,bottom=1.5cm,left=1.5cm,right=1.5cm]{geometry}
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
\\newcolumntype{C}{>{\\centering\\arraybackslash}X}
\\newcolumntype{R}{>{\\raggedleft\\arraybackslash}X}
\\newcolumntype{L}{>{\\raggedright\\arraybackslash}X}

\\usepackage{tikz}
\\usepackage{pgfplots}
\\pgfplotsset{compat=1.18}
\\usetikzlibrary{arrows.meta, positioning, calc, angles, quotes, patterns}
\\usepackage[table]{xcolor}
\\definecolor{myblue}{RGB}{0,102,204}
\\definecolor{darkgreen}{RGB}{0,128,0}

\\usepackage[most]{tcolorbox}
\\tcbset{sharp corners}

\\setlength{\\parindent}{0pt}
\\setlength{\\parskip}{3pt}
\\renewcommand{\\baselinestretch}{1.12}

\\pagestyle{fancy}
\\fancyhf{}
\\lhead{\\textbf{\\small [TRƯỜNG/SỞ GD\\&ĐT]}}
\\rhead{\\textbf{\\small ĐỀ THI TOÁN HỌC 2025--2026}}
\\cfoot{\\small Trang \\thepage}
\\renewcommand{\\headrulewidth}{0.4pt}

% Macros định dạng câu hỏi
\\newcommand{\\cauhoi}[1]{\\vspace{6pt}\\noindent\\textbf{Câu #1.}}
\\newcommand{\\dapan}[4]{
\\begin{multicols}{4}
    \\begin{enumerate}[label=\\textbf{\\Alph*.}, itemsep=1pt, leftmargin=*]
        \\item #1
        \\item #2
        \\item #3
        \\item #4
    \\end{enumerate}
\\end{multicols}
\\vspace{-4pt}
}

\\newcommand{\\yDungSai}[4]{
\\begin{enumerate}[label=\\textbf{\\alph*)}, itemsep=2pt, leftmargin=1.5cm]
    \\item #1
    \\item #2
    \\item #3
    \\item #4
\\end{enumerate}
}

\\newcommand{\\traLoiNgan}{\\hfill\\fbox{\\textbf{Đáp số:}\\hspace{3cm}}}

\\begin{document}

\\begin{center}
    \\begin{tabularx}{\\linewidth}{X C}
        \\textbf{[TÊN SỞ GD\\&ĐT / TRƯỜNG]} & \\textbf{KỲ THI ĐÁNH GIÁ NĂNG LỰC TOÁN HỌC} \\\\
        \\textbf{ĐỀ CHÍNH THỨC} & \\textbf{NĂM HỌC 2025 -- 2026} \\\\
        \\textit{(Đề thi có XX trang)} & \\textbf{Môn: TOÁN HỌC} \\\\
        & \\textit{Thời gian làm bài: [XX] phút (không kể thời gian phát đề)}
    \\end{tabularx}
\\end{center}
\\vspace{3pt}
\\hrule height 1pt
\\vspace{10pt}

% ----------------------------------------------------
% PHẦN I: TRẮC NGHIỆM NHIỀU LỰA CHỌN
% ----------------------------------------------------
\\noindent\\textbf{\\large\\color{myblue}PHẦN I. Câu trắc nghiệm nhiều phương án lựa chọn.} \\\\
\\textit{Thí sinh trả lời từ câu 1 đến câu [XX]. Mỗi câu hỏi thí sinh chỉ chọn một phương án đúng nhất.}
\\vspace{5pt}

% Chèn các câu hỏi phần 1 dùng \\cauhoi{n} và \\dapan{A}{B}{C}{D}

\\vspace{15pt}
% ----------------------------------------------------
% PHẦN II: TRẮC NGHIỆM ĐÚNG / SAI
% ----------------------------------------------------
\\noindent\\textbf{\\large\\color{myblue}PHẦN II. Câu trắc nghiệm đúng sai.} \\\\
\\textit{Thí sinh trả lời từ câu 1 đến câu [XX]. Trong mỗi ý a), b), c), d) ở mỗi câu, thí sinh chọn đúng hoặc sai.}
\\vspace{5pt}

% Chèn các câu hỏi phần 2 dùng \\cauhoi{n} và \\yDungSai{ý a}{ý b}{ý c}{ý d}

\\vspace{15pt}
% ----------------------------------------------------
% PHẦN III: TRẮC NGHIỆM TRẢ LỜI NGẮN
% ----------------------------------------------------
\\noindent\\textbf{\\large\\color{myblue}PHẦN III. Câu trắc nghiệm trả lời ngắn.} \\\\
\\textit{Thí sinh trả lời từ câu 1 đến câu [XX]. Thí sinh điền kết quả vào ô tương ứng.}
\\vspace{5pt}

% Chèn các câu hỏi phần 3 dùng \\cauhoi{n} và \\traLoiNgan

\\newpage
% ====================================================
% HƯỚNG DẪN GIẢI CHI TIẾT & BẢNG ĐÁP ÁN
% ====================================================
\\begin{center}
    {\\Large\\bfseries\\color{myblue} ĐÁP ÁN VÀ HƯỚNG DẪN GIẢI CHI TIẾT}
\\end{center}
\\vspace{10pt}

\\subsection*{\\color{myblue}BẢNG ĐÁP ÁN PHẦN I}
% Bảng đáp án Phần I dạng ma trận cột

\\subsection*{\\color{myblue}BẢNG ĐÁP ÁN PHẦN II}
% Bảng đáp án Phần II dạng a: Đ/S, b: Đ/S, c: Đ/S, d: Đ/S

\\subsection*{\\color{myblue}BẢNG ĐÁP ÁN PHẦN III}
% Bảng đáp số Phần III dạng số/phân số

\\vspace{10pt}
\\subsection*{\\color{myblue}LỜI GIẢI CHI TIẾT TỪNG CÂU}
% Lời giải chi tiết theo từng câu hỏi

\\end{document}
`;

export const EXAM_TEMPLATE_CLASSIC = `
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
\\newcolumntype{C}{>{\\centering\\arraybackslash}X}

\\usepackage{tikz}
\\usepackage{pgfplots}
\\pgfplotsset{compat=1.18}
\\usepackage[table]{xcolor}
\\definecolor{myblue}{RGB}{0,102,204}

\\usepackage[most]{tcolorbox}
\\tcbset{sharp corners}

\\setlength{\\parindent}{0pt}
\\setlength{\\parskip}{3pt}
\\renewcommand{\\baselinestretch}{1.12}

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
    {\\Large\\bfseries ĐỀ THI ĐÁNH GIÁ NĂNG LỰC TOÁN HỌC}\\\\[5pt]
    {\\large\\bfseries Môn: TOÁN HỌC - Chuyên đề: [CHUYÊN ĐỀ]}\\\\[5pt]
    \\textit{Thời gian làm bài: [XX] phút}
\\end{center}
\\vspace{5pt}
\\noindent\\rule{\\linewidth}{0.8pt}
\\vspace{10pt}

\\section*{\\color{myblue}I. PHẦN TRẮC NGHIỆM}
% Điền các câu hỏi trắc nghiệm

\\section*{\\color{myblue}II. PHẦN TỰ LUẬN}
% Điền các câu hỏi tự luận

\\newpage
\\begin{center}
    {\\Large\\bfseries ĐÁP ÁN VÀ HƯỚNG DẪN GIẢI CHI TIẾT}
\\end{center}
\\vspace{10pt}

\\section*{\\color{myblue}I. PHẦN TRẮC NGHIỆM}
% Bảng đáp án trắc nghiệm

\\section*{\\color{myblue}II. PHẦN TỰ LUẬN}
% Lời giải tự luận phân tích từng bước

\\end{document}
`;

export const LEARNING_TEMPLATE = `
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
\\newcolumntype{C}{>{\\centering\\arraybackslash}X}
\\newcolumntype{L}{>{\\raggedright\\arraybackslash}X}
\\newcolumntype{R}{>{\\raggedleft\\arraybackslash}X}

\\usepackage{tikz}
\\usepackage{pgfplots}
\\pgfplotsset{compat=1.18}
\\usetikzlibrary{arrows.meta, positioning, calc, angles, quotes, patterns}
\\usepackage[table]{xcolor}
\\definecolor{myblue}{RGB}{0,102,204}
\\definecolor{darkgreen}{RGB}{0,128,0}

\\usepackage[most]{tcolorbox}
\\tcbset{sharp corners}

\\setlength{\\parindent}{0pt}
\\setlength{\\parskip}{5pt}
\\renewcommand{\\baselinestretch}{1.12}

\\pagestyle{fancy}
\\fancyhf{}
\\lhead{\\small\\textbf{Tài Liệu Bài Học Toán Học}}
\\rhead{\\small\\textbf{Chuyên đề: [TÊN CHUYÊN ĐỀ]}}
\\cfoot{\\small Trang \\thepage}
\\renewcommand{\\headrulewidth}{0.4pt}

\\newcommand{\\hopkienthuc}[2]{
\\begin{tcolorbox}[colback=blue!5!white,colframe=myblue,title=\\textbf{#1},fonttitle=\\bfseries]
#2
\\end{tcolorbox}
}
\\newcommand{\\dinhly}[2]{
\\begin{tcolorbox}[colback=green!5!white,colframe=darkgreen,title=\\textbf{Định lý: #1},fonttitle=\\bfseries]
#2
\\end{tcolorbox}
}
\\newcommand{\\vidu}[1]{\\vspace{6pt}\\noindent\\textbf{\\color{myblue}Ví dụ #1.}}
\\newcommand{\\loigiai}{\\par\\textbf{Lời giải.}}
\\newcommand{\\ghinho}{\\textbf{\\color{red}Ghi nhớ: }}
\\newcommand{\\dangtoan}[1]{\\vspace{10pt}\\subsection*{\\color{myblue}#1}}

\\begin{document}

\\begin{center}
    {\\huge\\bfseries\\color{myblue} [TÊN BÀI HỌC]}\\\\[8pt]
    {\\large\\bfseries Môn: TOÁN HỌC --- Lớp: [LỚP]}\\\\[4pt]
    \\textit{[TRƯỜNG / SỞ GD\\&ĐT]}
\\end{center}
\\vspace{5pt}
\\noindent\\rule{\\linewidth}{0.8pt}
\\vspace{10pt}

\\section*{\\color{myblue}I. TÓM TẮT LÝ THUYẾT TRỌNG TÂM}
% Trình bày lý thuyết dùng \\hopkienthuc hoặc \\dinhly

\\section*{\\color{myblue}II. CÁC DẠNG TOÁN VÀ PHƯƠNG PHÁP GIẢI}
% Trình bày các dạng toán dùng \\dangtoan, \\vidu, \\loigiai

\\section*{\\color{myblue}III. BÀI TẬP TỰ LUYỆN}
% Trình bày bài tập tự luyện

\\end{document}
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
\\newcolumntype{C}{>{\\centering\\arraybackslash}X}
\\newcolumntype{L}{>{\\raggedright\\arraybackslash}X}
\\newcolumntype{R}{>{\\raggedleft\\arraybackslash}X}
\\usepackage{pgffor}
\\usepackage{tikz}
\\usepackage[table]{xcolor}
\\definecolor{myblue}{RGB}{0,102,204}
\\definecolor{darkgreen}{RGB}{0,128,0}
\\usetikzlibrary{arrows.meta, positioning}

\\usepackage[most]{tcolorbox}
\\tcbset{sharp corners}

\\setlength{\\parindent}{0pt}
\\setlength{\\parskip}{5pt}
\\renewcommand{\\baselinestretch}{1.12}

\\pagestyle{fancy}
\\fancyhf{}
\\lhead{\\small\\textbf{Lộ trình học tập}}
\\rhead{\\small\\textbf{Mục tiêu: [MỤC TIÊU]}}
\\cfoot{\\small Trang \\thepage}
\\renewcommand{\\headrulewidth}{0.4pt}

\\newcommand{\\giaidoan}[2]{
\\begin{tcolorbox}[colback=blue!5!white,colframe=myblue,title=\\textbf{Giai đoạn #1: #2},fonttitle=\\bfseries]
}
\\newcommand{\\endgiaidoan}{\\end{tcolorbox}}

\\begin{document}

\\begin{center}
    {\\huge\\bfseries\\color{myblue} LỘ TRÌNH HỌC TẬP TỪ A ĐẾN Z}\\\\[10pt]
    {\\Large Chuyên đề: [TÊN CHUYÊN ĐỀ]}\\\\[5pt]
    \\textit{Thời gian dự kiến: [X] tuần --- Mục tiêu: [MỤC TIÊU]}
\\end{center}
\\vspace{5pt}
\\noindent\\rule{\\linewidth}{0.8pt}
\\vspace{10pt}

\\section*{\\color{myblue}I. TỔNG QUAN VÀ ĐỊNH HƯỚNG TƯ DUY}
% Mindset và phương pháp học

\\section*{\\color{myblue}II. CHI TIẾT CÁC GIAI ĐOẠN HỌC TẬP}
% Dùng \\giaidoan{1}{Tên giai đoạn} ... \\endgiaidoan

\\section*{\\color{myblue}III. TIÊU CHÍ ĐÁNH GIÁ VÀ CHECKPOINT}
% Bảng tiêu chí và bài test đánh giá

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
\\newcolumntype{C}{>{\\centering\\arraybackslash}X}
\\usepackage{pgffor}
\\usepackage{tikz}
\\usepackage{pgfplots}
\\pgfplotsset{compat=1.18}
\\usepackage[table]{xcolor}
\\definecolor{myblue}{RGB}{0,102,204}
\\usetikzlibrary{arrows.meta, calc, positioning}

\\usepackage[most]{tcolorbox}
\\tcbset{sharp corners}

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

\\begin{document}

\\begin{titlepage}
\\begin{center}
    \\vspace*{1.2cm}
    {\\Large\\bfseries TÀI LIỆU HỌC TẬP TOÁN HỌC}\\\\[8pt]
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

\\dangbai{Phần 1. Lý thuyết trọng tâm}

\\dangbai{Phần 2. Ví dụ mẫu & Phương pháp giải}

\\trangbaitap
\\dangbai{Phần 3. Bài tập trắc nghiệm}

\\trangbaitap
\\dangbai{Phần 4. Bài tập tự luận & Dòng kẻ chấm}

\\vspace{20pt}
\\section{Đáp án & Hướng dẫn giải ngắn gọn}

\\vfill
\\begin{center}
\\rule{0.65\\linewidth}{0.4pt}\\\\[5pt]
\\textbf{Chúc các em học tốt!}
\\end{center}

\\end{document}
`;