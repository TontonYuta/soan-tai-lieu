const fs = require('fs');

const replacement = `export const EXAM_TEMPLATE = \`
% !TEX program = pdflatex
\\\\documentclass[12pt,a4paper]{article}

\\\\usepackage[a4paper,top=1.8cm,bottom=1.8cm,left=1.5cm,right=1.5cm]{geometry}
\\\\usepackage[utf8]{inputenc}
\\\\usepackage[T1]{fontenc}
\\\\usepackage{vietnam}
\\\\usepackage{mathptmx}
\\\\usepackage{amsmath,amssymb}
\\\\usepackage{enumitem}
\\\\usepackage{multicol}
\\\\usepackage{fancyhdr}
\\\\usepackage{titlesec}
\\\\usepackage{tabularx}
\\\\usepackage{array}
\\\\usepackage{tikz}
\\\\usepackage[table]{xcolor}
\\\\definecolor{myblue}{RGB}{0,112,192}

\\\\usepackage[most]{tcolorbox}
\\\\tcbset{sharp corners} % Yeu cau box vuong vuc

\\\\setlength{\\\\parindent}{0pt}
\\\\setlength{\\\\parskip}{3pt}
\\\\renewcommand{\\\\baselinestretch}{1.1}
\\\\setlist[itemize]{leftmargin=1.2cm}
\\\\setlist[enumerate]{leftmargin=1cm,itemsep=4pt}

\\\\pagestyle{fancy}
\\\\fancyhf{}
\\\\lhead{\\\\textbf{KỲ THI/BÀI KIỂM TRA}}
\\\\rhead{\\\\textbf{Môn thi: [TÊN MÔN]}}
\\\\cfoot{\\\\small Trang \\\\thepage}
\\\\renewcommand{\\\\headrulewidth}{0.4pt}

\\\\newcommand{\\\\cauhoi}[1]{\\\\vspace{6pt}\\\\noindent{\\\\textbf{Câu #1.}}}
\\\\newcommand{\\\\dapan}[4]{ 
\\\\begin{multicols}{4}
    \\\\begin{enumerate}[label=\\\\textbf{\\\\Alph*.}, itemsep=2pt, leftmargin=*]
        \\\\item #1
        \\\\item #2
        \\\\item #3
        \\\\item #4
    \\\\end{enumerate}
\\\\end{multicols}
\\\\vspace{-4pt}
}

\\\\begin{document}

\\\\begin{center}
    {\\\\Large\\\\bfseries ĐỀ THI ĐÁNH GIÁ NĂNG LỰC}\\\\\\\\[5pt]
    {\\\\large\\\\bfseries Môn: [MÔN] - Tên chủ đề/Phạm vi kiến thức}\\\\\\\\[5pt]
    \\\\textit{Thời gian làm bài: [XX] phút}
\\\\end{center}
\\\\vspace{5pt}
\\\\noindent\\\\rule{\\\\linewidth}{0.8pt}
\\\\vspace{10pt}

\\\\section*{\\\\color{myblue}I. PHẦN TRẮC NGHIỆM}
% Điền các câu hỏi trắc nghiệm dùng lệnh \\\\cauhoi và \\\\dapan

\\\\section*{\\\\color{myblue}II. PHẦN TỰ LUẬN}
% Điền các câu hỏi tự luận

\\\\newpage
\\\\begin{center}
    {\\\\Large\\\\bfseries ĐÁP ÁN VÀ HƯỚNG DẪN GIẢI CHI TIẾT}
\\\\end{center}
\\\\vspace{10pt}

\\\\section*{\\\\color{myblue}I. PHẦN TRẮC NGHIỆM}
% Bảng đáp án trắc nghiệm nhiều cột

\\\\section*{\\\\color{myblue}II. PHẦN TỰ LUẬN}
% Lời giải tự luận phân tích từng bước

\\\\end{document}
\`;`;

let content = fs.readFileSync('services/prompts/latex-rules.ts', 'utf8');
fs.writeFileSync('services/prompts/latex-rules.ts', content + replacement);
