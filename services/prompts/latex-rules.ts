export const LATEX_TECHNICAL_RULES = `
QUY TẮC KỸ THUẬT & TRÌNH BÀY LATEX ĐA MÔN HỌC (BẮT BUỘC ĐỂ BIÊN DỊCH 100% THÀNH CÔNG VỚI PDFLATEX TRÊN OVERLEAF & MÁY CỤC BỘ):
1. QUY TẮC ĐẦU RA (OUTPUT FORMAT - BẮT BUỘC TUYỆT ĐỐI):
   - BẮT BUỘC chỉ xuất ra duy nhất 1 khối mã nguồn LaTeX hoàn chỉnh bắt đầu bằng \`\`\`latex và kết thúc bằng \`\`\`.
   - TUYỆT ĐỐI KHÔNG xuất bất kỳ câu chào hỏi, lời dẫn, chú thích hay thẻ nào bên ngoài khối \`\`\`latex ... \`\`\`.
   - Mã nguồn phải chứa đầy đủ từ \\documentclass đến \\end{document}, sẵn sàng biên dịch trực tiếp không thiếu sót.
   - ĐIỀU PHỐI DUNG LƯỢNG CHỐNG CẮT CỤT TOKEN (TOKEN SAFETY): Khi biên soạn tài liệu/đề thi dài, phần hướng dẫn giải chi tiết phải cô đọng, đi thẳng vào bước biến đổi/mẹo chốt chặn quan trọng, TUYỆT ĐỐI KHÔNG diễn giải lan man khiến file bị cắt cụt token và mất thẻ \\end{document}.

2. QUY TẮC VIẾT HOA (CAPITALIZATION - BẮT BUỘC TUÂN THỦ):
   - CHỈ VIẾT HOA TOÀN BỘ (ALL CAPS) duy nhất cho TIÊU ĐỀ CHÍNH ĐẦU TRANG của tài liệu (Ví dụ: KỲ THI ĐÁNH GIÁ NĂNG LỰC, ĐÁP ÁN VÀ HƯỚNG DẪN GIẢI CHI TIẾT).
   - TUYỆT ĐỐI KHÔNG VIẾT HOA TOÀN BỘ ở các tiêu đề con, tên bài toán, đề mục bài tập hay nội dung câu hỏi.
     (CẤM: \\section{DẠNG 1. KHẢO SÁT HÀM SỐ BẬC BA}, CẤM: \\textbf{CHO HÀM SỐ Y = F(X)...}, CẤM: \\subsection*{BẢNG ĐÁP ÁN PHẦN I}).
   - Các tiêu đề mục phụ, dạng toán: Dùng Title Case hoặc Sentence case thanh lịch, trang nhã:
     * \\subsection*{Bảng đáp án Phần I} (thay vì Bảng đáp án Phần I).
     * \\subsection*{Bảng đáp án Phần II}, \\subsection*{Bảng đáp án Phần III}.
     * \\subsection*{Lời giải chi tiết từng câu} (thay vì Lời giải chi tiết từng câu).
     * \\section*{Phần I. Câu trắc nghiệm nhiều phương án lựa chọn}.
     * \\dangtoan{Dạng 1. Tìm tập xác định và sự biến thiên của hàm số}.
   - Nội dung câu hỏi và đề bài: Chỉ viết hoa chữ cái đầu câu, sau dấu chấm và danh từ riêng (Việt Nam, Newton, Oxyz...) theo chuẩn ngữ pháp tiếng Việt. Tuyệt đối không viết hoa toàn bộ đề bài!

3. QUY TẮC IN ĐẬM (BOLD FORMATTING - TRÁNH LẠM DỤNG):
   - Chỉ in đậm định danh câu hỏi: \\textbf{Câu 1.}, \\textbf{Bài 1.}.
   - Chỉ in đậm các từ khóa khẳng định/phủ định quan trọng nhằm giúp học sinh tránh bẫy đề thi: \\textbf{đúng}, \\textbf{sai}, \\textbf{không}, \\textbf{nghịch biến}, \\textbf{đồng biến}, \\textbf{giá trị lớn nhất}, \\textbf{giá trị nhỏ nhất}.
   - Chữ cái phương án trắc nghiệm: \\textbf{A.}, \\textbf{B.}, \\textbf{C.}, \\textbf{D.} (phần nội dung phương án KHÔNG in đậm).
   - TUYỆT ĐỐI KHÔNG in đậm nguyên cả đoạn văn bản dài, nguyên câu hỏi hoặc toàn bộ lời giải, tránh gây chói mắt và làm mất cấu trúc phân tầng thị giác.

4. QUY TẮC KÝ HIỆU TOÁN HỌC & KHOA HỌC CHUẨN MỰC:
   - 100% công thức, biến số, hàm số, điểm, đường thẳng, mặt phẳng phải nằm trong $...$ hoặc \\[ ... \\]: điểm $A$, đường thẳng $d$, mặt phẳng $(P)$, đoạn thẳng $AB$, biến $x, y$. Tuyệt đối không viết chữ x, y cộc lốc ngoài môi trường toán.
   - Phân số: Luôn dùng \\dfrac{a}{b} trong dòng công thức hiển thị và câu hỏi để tử và mẫu rõ nét, không bị teo nhỏ như \\frac.
   - Dấu nhân: Dùng \\cdot ($2 \\cdot 3$), TUYỆT ĐỐI KHÔNG dùng dấu * hoặc chữ x làm phép nhân toán học.
   - Tập hợp số: Dùng \\mathbb{R}, \\mathbb{Z}, \\mathbb{N}, \\mathbb{Q}, \\mathbb{C}.
   - Vector: Dùng \\vec{u}, \\vec{v} hoặc \\overrightarrow{AB}.
   - Góc: Dùng \\widehat{ABC} hoặc \\angle ABC.
   - Số đo độ: Dùng 30^\\circ, 45^\\circ (không viết $30o$ hay $30^0$).
   - Dấu ngoặc co giãn: Dùng \\left( ... \\right), \\left[ ... \\right] khi bên trong chứa phân số hoặc biểu thức nhiều tầng.
   - Hệ phương trình & Tuyển: Dùng \\begin{cases} ... \\end{cases} cho hệ ngoặc nhọn, hoặc \\left[ \\begin{aligned} ... \\end{aligned} \\right. cho tuyển nghiệm ngoặc vuông.
   - Vi phân & Tích phân: \\int_{a}^{b} f(x)\\,\\mathrm{d}x, chữ \\mathrm{d}x đứng thẳng và có khoảng cách mỏng \\,.
   - Giới hạn: \\lim_{x \\to x_0} f(x) hoặc \\lim\\limits_{x \\to x_0} f(x).
   - Đơn vị đo (Lý, Hóa, Toán ứng dụng): Bọc trong \\mathrm{...} có dấu cách mỏng: $10\\,\\mathrm{m/s}$, $50\\,\\mathrm{cm}^3$, $100\\,\\mathrm{g}$, $220\\,\\mathrm{V}$.
   - Hóa học: $2\\mathrm{H}_2 + \\mathrm{O}_2 \\rightarrow 2\\mathrm{H}_2\\mathrm{O}$.

5. QUY TẮC CHỐNG RÁC NỘI BỘ & KHÔNG GHI NHÃN RAG (TUYỆT ĐỐI BẮT BUỘC):
   - TUYỆT ĐỐI KHÔNG chèn bất kỳ nhãn nguồn, số trang hay từ khóa nội bộ nào vào đề bài hoặc lời giải.
   - CẤM VIẾT: "Câu 1 (RAG trang 2)", "Câu 1 (RAG)", "[RAG]", "(Nguồn: ...)", "(Tham khảo trang X)".
   - Toàn bộ câu hỏi phải được hiển thị tự nhiên, chuẩn mực: \\cauhoi{1}, \\cauhoi{2}, \\cauhoi{3}... hoặc \\textbf{Câu 1.}, \\textbf{Câu 2.}... như một đề thi chính thức được in ấn từ Sở/Bộ Giáo dục.

6. KHÔNG DÙNG CÚ PHÁP MARKDOWN TRONG CODE:
   - Tuyệt đối không dùng **, *, #, - bên trong mã LaTeX.
   - Dùng \\textbf{}, \\textit{}, \\section{}, \\begin{itemize}, \\begin{enumerate}.

7. TIẾNG VIỆT, UNICODE & TRÌNH BIÊN DỊCH:
   - Bắt buộc tương thích hoàn toàn với pdfLaTeX. Sử dụng gói lệnh:
     \\usepackage[utf8]{inputenc}
     \\usepackage[T1]{fontenc}
     \\usepackage{vietnam}
     \\usepackage{newunicodechar}
   - BẮT BUỘC map các ký tự Unicode thường gặp để tránh lỗi "! Package inputenc Error: Unicode character ... not set up for use with LaTeX":
     \\newunicodechar{↗}{\\ensuremath{\\nearrow}}
     \\newunicodechar{↘}{\\ensuremath{\\searrow}}
     \\newunicodechar{→}{\\ensuremath{\\rightarrow}}
     \\newunicodechar{←}{\\ensuremath{\\leftarrow}}
     \\newunicodechar{↔}{\\ensuremath{\\leftrightarrow}}
     \\newunicodechar{⇒}{\\ensuremath{\\Rightarrow}}
     \\newunicodechar{⇔}{\\ensuremath{\\Leftrightarrow}}
     \\newunicodechar{•}{\\ensuremath{\\bullet}}
     \\newunicodechar{≈}{\\ensuremath{\\approx}}
     \\newunicodechar{≠}{\\ensuremath{\\neq}}
     \\newunicodechar{≤}{\\ensuremath{\\le}}
     \\newunicodechar{≥}{\\ensuremath{\\ge}}
     \\newunicodechar{±}{\\ensuremath{\\pm}}
     \\newunicodechar{×}{\\ensuremath{\\times}}
     \\newunicodechar{÷}{\\ensuremath{\\div}}
     \\newunicodechar{∞}{\\ensuremath{\\infty}}
     \\newunicodechar{°}{\\ensuremath{^\\circ}}
     \\newunicodechar{℃}{\\ensuremath{^\\circ\\mathrm{C}}}

8. MÔN NGÔN NGỮ (TIẾNG ANH / NGOẠI NGỮ / NGỮ VĂN) & KHOA HỌC XÃ HỘI:
   - Đoạn văn đọc hiểu (Reading Comprehension / Tình huống thực tế): Sử dụng môi trường \\doanvan{Tiêu đề đoạn văn}{Nội dung bài đọc...} có khung viền trang nhã.
   - Đáp án trắc nghiệm linh hoạt:
     * Đáp án ngắn (từ đơn, số, ký hiệu): Dùng macro \\dapan{A}{B}{C}{D} (4 cột).
     * Đáp án trung bình (cụm từ, mệnh đề ngắn): Dùng macro \\dapanHaiCot{A}{B}{C}{D} (2 cột).
     * Đáp án dài (nguyên câu văn, lời giải thích): Dùng macro \\dapanMotCot{A}{B}{C}{D} (1 cột).

9. KÝ TỰ ĐẶC BIỆT & ESCAPE:
   - Bắt buộc escape: \\% (phần trăm), \\& (và), \\_ (gạch dưới), \\$ (đô la), \\{ \\} (ngoặc nhọn khi in chữ).

10. VẼ HÌNH HỌC, ĐỒ THỊ TIKZ & SƠ ĐỒ ĐA MÔN:
    - Sử dụng \\usepackage{tikz}, \\usepackage{pgfplots}, \\pgfplotsset{compat=1.18}.
    - Thư viện TikZ: \\usetikzlibrary{arrows.meta, positioning, calc, angles, quotes, patterns}.
    - Môn Toán & Hình học: Nét đứt [dashed] cho cạnh khuất, nét liền [thick] cho cạnh nhìn thấy, góc vuông dùng \\pic [draw, angle radius=2mm] {right angle = ...}.
    - Môn Vật lý & Hóa học & Tin học: Sơ đồ khối, sơ đồ mạch điện, vector lực có mũi tên [-{Latex[length=2.5mm]}]. Luôn bọc trong \\centering và [scale=0.85, baseline=(current bounding box.center)] để hình không tràn lề giấy A4.

11. THIẾT KẾ UI & KHUNG VIỀN:
    - Dùng tcolorbox với [sharp corners] để viền sắc nét, hiện đại chuẩn in ấn đề thi.
    - Màu chủ đạo: Xanh dương dịu (\\definecolor{myblue}{RGB}{0,102,204}), Xanh lá đậm (\\definecolor{darkgreen}{RGB}{0,128,0}).
`;

export const EXAM_TEMPLATE_2025 = `
% !TEX program = pdflatex
\\documentclass[12pt,a4paper]{article}

\\usepackage[a4paper,top=1.5cm,bottom=1.5cm,left=1.5cm,right=1.5cm]{geometry}
\\usepackage[utf8]{inputenc}
\\usepackage[T1]{fontenc}
\\usepackage{vietnam}
\\usepackage{newunicodechar}
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

% Khai báo ánh xạ ký tự Unicode an toàn cho pdfLaTeX
\\newunicodechar{↗}{\\ensuremath{\\nearrow}}
\\newunicodechar{↘}{\\ensuremath{\\searrow}}
\\newunicodechar{→}{\\ensuremath{\\rightarrow}}
\\newunicodechar{←}{\\ensuremath{\\leftarrow}}
\\newunicodechar{↔}{\\ensuremath{\\leftrightarrow}}
\\newunicodechar{⇒}{\\ensuremath{\\Rightarrow}}
\\newunicodechar{⇔}{\\ensuremath{\\Leftrightarrow}}
\\newunicodechar{•}{\\ensuremath{\\bullet}}
\\newunicodechar{≈}{\\ensuremath{\\approx}}
\\newunicodechar{≠}{\\ensuremath{\\neq}}
\\newunicodechar{≤}{\\ensuremath{\\le}}
\\newunicodechar{≥}{\\ensuremath{\\ge}}
\\newunicodechar{±}{\\ensuremath{\\pm}}
\\newunicodechar{×}{\\ensuremath{\\times}}
\\newunicodechar{÷}{\\ensuremath{\\div}}
\\newunicodechar{∞}{\\ensuremath{\\infty}}
\\newunicodechar{°}{\\ensuremath{^\\circ}}
\\newunicodechar{℃}{\\ensuremath{^\\circ\\mathrm{C}}}

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
\\rhead{\\textbf{\\small ĐỀ THI [MÔN HỌC] 2025--2026}}
\\cfoot{\\small Trang \\thepage}
\\renewcommand{\\headrulewidth}{0.4pt}

% Macros định dạng câu hỏi & đáp án linh hoạt
\\newcommand{\\cauhoi}[1]{\\vspace{6pt}\\noindent\\textbf{Câu #1.}}

% Đáp án 4 cột (dành cho đáp án ngắn)
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

% Đáp án 2 cột (dành cho phương án dài trung bình)
\\newcommand{\\dapanHaiCot}[4]{
\\begin{multicols}{2}
    \\begin{enumerate}[label=\\textbf{\\Alph*.}, itemsep=2pt, leftmargin=*]
        \\item #1
        \\item #2
        \\item #3
        \\item #4
    \\end{enumerate}
\\end{multicols}
\\vspace{-4pt}
}

% Đáp án 1 cột (dành cho câu văn dài, đọc hiểu)
\\newcommand{\\dapanMotCot}[4]{
\\begin{enumerate}[label=\\textbf{\\Alph*.}, itemsep=3pt, leftmargin=*]
    \\item #1
    \\item #2
    \\item #3
    \\item #4
\\end{enumerate}
\\vspace{-2pt}
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

% Khung đoạn văn đọc hiểu / bài đọc / tình huống thực tế
\\newcommand{\\doanvan}[2]{
\\begin{tcolorbox}[colback=blue!3!white,colframe=myblue!70!black,title=\\textbf{#1},fonttitle=\\bfseries]
#2
\\end{tcolorbox}
}

\\begin{document}

\\begin{center}
    \\begin{tabularx}{\\linewidth}{X C}
        \\textbf{[TÊN SỞ GD\\&ĐT / TRƯỜNG]} & \\textbf{KỲ THI ĐÁNH GIÁ NĂNG LỰC [MÔN HỌC]} \\\\
        \\textbf{ĐỀ CHÍNH THỨC} & \\textbf{NĂM HỌC 2025 -- 2026} \\\\
        \\textit{(Đề thi có XX trang)} & \\textbf{Môn thi: [MÔN HỌC]} \\\\
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

% Chèn các câu hỏi phần 1 dùng \\cauhoi{n} và \\dapan hoặc \\dapanHaiCot / \\dapanMotCot

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

\\subsection*{\\color{myblue}Bảng đáp án Phần II}
% Bảng đáp án Phần II dạng a: Đ/S, b: Đ/S, c: Đ/S, d: Đ/S

\\subsection*{\\color{myblue}Bảng đáp án Phần III}
% Bảng đáp số Phần III dạng số/phân số/kết quả ngắn

\\vspace{10pt}
\\subsection*{\\color{myblue}Lời giải chi tiết từng câu}
% Lời giải cô đọng, súc tích từng câu hỏi, đảm bảo kết thúc bằng \\end{document}

\\end{document}
`;

export const EXAM_TEMPLATE_CLASSIC = `
% !TEX program = pdflatex
\\documentclass[12pt,a4paper]{article}

\\usepackage[a4paper,top=1.8cm,bottom=1.8cm,left=1.5cm,right=1.5cm]{geometry}
\\usepackage[utf8]{inputenc}
\\usepackage[T1]{fontenc}
\\usepackage{vietnam}
\\usepackage{newunicodechar}
\\usepackage{mathptmx}
\\usepackage{amsmath,amssymb}
\\usepackage{enumitem}
\\usepackage{multicol}
\\usepackage{fancyhdr}
\\usepackage{titlesec}
\\usepackage{tabularx}
\\usepackage{array}
\\newcolumntype{C}{>{\\centering\\arraybackslash}X}

\\newunicodechar{↗}{\\ensuremath{\\nearrow}}
\\newunicodechar{↘}{\\ensuremath{\\searrow}}
\\newunicodechar{→}{\\ensuremath{\\rightarrow}}
\\newunicodechar{←}{\\ensuremath{\\leftarrow}}
\\newunicodechar{↔}{\\ensuremath{\\leftrightarrow}}
\\newunicodechar{⇒}{\\ensuremath{\\Rightarrow}}
\\newunicodechar{⇔}{\\ensuremath{\\Leftrightarrow}}
\\newunicodechar{•}{\\ensuremath{\\bullet}}
\\newunicodechar{≈}{\\ensuremath{\\approx}}
\\newunicodechar{≠}{\\ensuremath{\\neq}}
\\newunicodechar{≤}{\\ensuremath{\\le}}
\\newunicodechar{≥}{\\ensuremath{\\ge}}
\\newunicodechar{±}{\\ensuremath{\\pm}}
\\newunicodechar{×}{\\ensuremath{\\times}}
\\newunicodechar{÷}{\\ensuremath{\\div}}
\\newunicodechar{∞}{\\ensuremath{\\infty}}
\\newunicodechar{°}{\\ensuremath{^\\circ}}
\\newunicodechar{℃}{\\ensuremath{^\\circ\\mathrm{C}}}

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
\\rhead{\\textbf{Môn thi: [TÊN MÔN HỌC]}}
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
\\newcommand{\\dapanHaiCot}[4]{
\\begin{multicols}{2}
    \\begin{enumerate}[label=\\textbf{\\Alph*.}, itemsep=2pt, leftmargin=*]
        \\item #1
        \\item #2
        \\item #3
        \\item #4
    \\end{enumerate}
\\end{multicols}
\\vspace{-4pt}
}
\\newcommand{\\dapanMotCot}[4]{
\\begin{enumerate}[label=\\textbf{\\Alph*.}, itemsep=3pt, leftmargin=*]
    \\item #1
    \\item #2
    \\item #3
    \\item #4
\\end{enumerate}
\\vspace{-2pt}
}

\\begin{document}

\\begin{center}
    {\\Large\\bfseries ĐỀ THI ĐÁNH GIÁ NĂNG LỰC [MÔN HỌC]}\\\[5pt]
    {\\large\\bfseries Môn: [TÊN MÔN HỌC] --- Chuyên đề: [CHUYÊN ĐỀ]}\\\[5pt]
    \\textit{Thời gian làm bài: [XX] phút}
\\end{center}
\\vspace{5pt}
\\noindent\\rule{\\linewidth}{0.8pt}
\\vspace{10pt}

\\section*{\\color{myblue}Phần I. Trắc nghiệm}
% Điền các câu hỏi trắc nghiệm

\\section*{\\color{myblue}Phần II. Tự luận}
% Điền các câu hỏi tự luận

\\newpage
\\begin{center}
    {\\Large\\bfseries ĐÁP ÁN VÀ HƯỚNG DẪN GIẢI CHI TIẾT}
\\end{center}
\\vspace{10pt}

\\section*{\\color{myblue}Phần I. Bảng đáp án trắc nghiệm}
% Bảng đáp án trắc nghiệm

\\section*{\\color{myblue}Phần II. Lời giải chi tiết}
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
\\usepackage{newunicodechar}
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

\\newunicodechar{↗}{\\ensuremath{\\nearrow}}
\\newunicodechar{↘}{\\ensuremath{\\searrow}}
\\newunicodechar{→}{\\ensuremath{\\rightarrow}}
\\newunicodechar{←}{\\ensuremath{\\leftarrow}}
\\newunicodechar{↔}{\\ensuremath{\\leftrightarrow}}
\\newunicodechar{⇒}{\\ensuremath{\\Rightarrow}}
\\newunicodechar{⇔}{\\ensuremath{\\Leftrightarrow}}
\\newunicodechar{•}{\\ensuremath{\\bullet}}
\\newunicodechar{≈}{\\ensuremath{\\approx}}
\\newunicodechar{≠}{\\ensuremath{\\neq}}
\\newunicodechar{≤}{\\ensuremath{\\le}}
\\newunicodechar{≥}{\\ensuremath{\\ge}}
\\newunicodechar{±}{\\ensuremath{\\pm}}
\\newunicodechar{×}{\\ensuremath{\\times}}
\\newunicodechar{÷}{\\ensuremath{\\div}}
\\newunicodechar{∞}{\\ensuremath{\\infty}}
\\newunicodechar{°}{\\ensuremath{^\\circ}}
\\newunicodechar{℃}{\\ensuremath{^\\circ\\mathrm{C}}}

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
\\lhead{\\small\\textbf{Tài Liệu Học Tập: [MÔN HỌC]}}
\\rhead{\\small\\textbf{Chuyên đề: [CHUYÊN ĐỀ]}}
\\cfoot{\\small Trang \\thepage}
\\renewcommand{\\headrulewidth}{0.4pt}

\\newcommand{\\hopkienthuc}[2]{
\\begin{tcolorbox}[colback=blue!5!white,colframe=myblue,title=\\textbf{#1},fonttitle=\\bfseries]
#2
\\end{tcolorbox}
}
\\newcommand{\\dinhly}[2]{
\\begin{tcolorbox}[colback=green!5!white,colframe=darkgreen,title=\\textbf{Định lý / Quy tắc: #1},fonttitle=\\bfseries]
#2
\\end{tcolorbox}
}
\\newcommand{\\doanvan}[2]{
\\begin{tcolorbox}[colback=blue!3!white,colframe=myblue!70!black,title=\\textbf{#1},fonttitle=\\bfseries]
#2
\\end{tcolorbox}
}
\\newcommand{\\vidu}[1]{\\vspace{6pt}\\noindent\\textbf{\\color{myblue}Ví dụ #1.}}
\\newcommand{\\loigiai}{\\par\\textbf{Lời giải / Phân tích.}}
\\newcommand{\\ghinho}{\\textbf{\\color{red}Ghi nhớ: }}
\\newcommand{\\dangtoan}[1]{\\vspace{10pt}\\subsection*{\\color{myblue}#1}}

\\begin{document}

\\begin{center}
    {\\huge\\bfseries\\color{myblue} [TÊN BÀI HỌC / CHUYÊN ĐỀ]}\\\[8pt]
    {\\large\\bfseries Môn: [MÔN HỌC] --- Khối / Lớp: [LỚP]}\\\[4pt]
    \\textit{[TRƯỜNG / ĐƠN VỊ ĐÀO TẠO]}
\\end{center}
\\vspace{5pt}
\\noindent\\rule{\\linewidth}{0.8pt}
\\vspace{10pt}

\\section*{\\color{myblue}Phần I. Tóm tắt lý thuyết trọng tâm}
% Trình bày lý thuyết dùng \\hopkienthuc hoặc \\dinhly

\\section*{\\color{myblue}Phần II. Các dạng bài tập và phương pháp giải}
% Trình bày các dạng bài dùng \\dangtoan, \\vidu, \\loigiai

\\section*{\\color{myblue}Phần III. Bài tập tự luyện}
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
\\usepackage{newunicodechar}
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

\\newunicodechar{↗}{\\ensuremath{\\nearrow}}
\\newunicodechar{↘}{\\ensuremath{\\searrow}}
\\newunicodechar{→}{\\ensuremath{\\rightarrow}}
\\newunicodechar{←}{\\ensuremath{\\leftarrow}}
\\newunicodechar{•}{\\ensuremath{\\bullet}}
\\newunicodechar{≈}{\\ensuremath{\\approx}}
\\newunicodechar{≠}{\\ensuremath{\\neq}}
\\newunicodechar{≤}{\\ensuremath{\\le}}
\\newunicodechar{≥}{\\ensuremath{\\ge}}
\\newunicodechar{±}{\\ensuremath{\\pm}}
\\newunicodechar{×}{\\ensuremath{\\times}}
\\newunicodechar{÷}{\\ensuremath{\\div}}
\\newunicodechar{∞}{\\ensuremath{\\infty}}

\\usepackage[most]{tcolorbox}
\\tcbset{sharp corners}

\\setlength{\\parindent}{0pt}
\\setlength{\\parskip}{5pt}
\\renewcommand{\\baselinestretch}{1.12}

\\pagestyle{fancy}
\\fancyhf{}
\\lhead{\\small\\textbf{Lộ trình học tập [MÔN HỌC]}}
\\rhead{\\small\\textbf{Mục tiêu: [MỤC TIÊU]}}
\\cfoot{\\small Trang \\thepage}
\\renewcommand{\\headrulewidth}{0.4pt}

\\newcommand{\\giaidoan}[2]{
\\begin{tcolorbox}[colback=blue!5!white,colframe=myblue,title=\\textbf{Giai đoạn #1: #2},fonttitle=\\bfseries]
}
\\newcommand{\\endgiaidoan}{\\end{tcolorbox}}

\\begin{document}

\\begin{center}
    {\\huge\\bfseries\\color{myblue} LỘ TRÌNH HỌC TẬP TỪ A ĐẾN Z}\\\[10pt]
    {\\Large Môn: [MÔN HỌC] --- Chuyên đề: [TÊN CHUYÊN ĐỀ]}\\\[5pt]
    \\textit{Thời gian dự kiến: [X] tuần --- Mục tiêu: [MỤC TIÊU]}
\\end{center}
\\vspace{5pt}
\\noindent\\rule{\\linewidth}{0.8pt}
\\vspace{10pt}

\\section*{\\color{myblue}Phần I. Tổng quan và định hướng tư duy}
% Mindset và phương pháp học

\\section*{\\color{myblue}Phần II. Chi tiết các giai đoạn học tập}
% Dùng \\giaidoan{1}{Tên giai đoạn} ... \\endgiaidoan

\\section*{\\color{myblue}Phần III. Tiêu chí đánh giá và các mốc kiểm tra}
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
\\usepackage{newunicodechar}
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

\\newunicodechar{↗}{\\ensuremath{\\nearrow}}
\\newunicodechar{↘}{\\ensuremath{\\searrow}}
\\newunicodechar{→}{\\ensuremath{\\rightarrow}}
\\newunicodechar{←}{\\ensuremath{\\leftarrow}}
\\newunicodechar{•}{\\ensuremath{\\bullet}}
\\newunicodechar{≈}{\\ensuremath{\\approx}}
\\newunicodechar{≠}{\\ensuremath{\\neq}}
\\newunicodechar{≤}{\\ensuremath{\\le}}
\\newunicodechar{≥}{\\ensuremath{\\ge}}
\\newunicodechar{±}{\\ensuremath{\\pm}}
\\newunicodechar{×}{\\ensuremath{\\times}}
\\newunicodechar{÷}{\\ensuremath{\\div}}
\\newunicodechar{∞}{\\ensuremath{\\infty}}
\\newunicodechar{°}{\\ensuremath{^\\circ}}

\\usepackage[most]{tcolorbox}
\\tcbset{sharp corners}

\\setlength{\\parindent}{0pt}
\\setlength{\\parskip}{5pt}
\\renewcommand{\\baselinestretch}{1.12}
\\setlist[itemize]{leftmargin=1.2cm}
\\setlist[enumerate]{leftmargin=1cm,itemsep=4pt}

\\pagestyle{fancy}
\\fancyhf{}
\\lhead{\\small Tài liệu học tập [MÔN HỌC]}
\\rhead{\\small Giáo viên biên soạn}
\\cfoot{\\small \\thepage}
\\renewcommand{\\headrulewidth}{0.4pt}

\\titleformat{\\section}{\\Large\\bfseries\\color{myblue}}{Bài \\thesection.}{0.5em}{}
\\titleformat{\\subsection}{\\large\\bfseries\\color{myblue}}{}{0pt}{}
\\titleformat{\\subsubsection}{\\normalsize\\bfseries\\color{myblue}}{}{0pt}{}
\\renewcommand{\\contentsname}{Mục lục}

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
    {\\Large\\bfseries TÀI LIỆU HỌC TẬP [MÔN HỌC]}\\\\[8pt]
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
