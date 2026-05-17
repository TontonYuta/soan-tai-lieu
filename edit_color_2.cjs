const fs = require('fs');
let content = fs.readFileSync('services/gemini.ts', 'utf8');

content = content.replace(
  '\\\\newcommand{\\\\vidu}[1]{\\\\vspace{5pt}\\\\noindent\\\\textbf{Ví dụ #1.}}',
  '\\\\newcommand{\\\\vidu}[1]{\\\\vspace{5pt}\\\\noindent{\\\\color{myblue}\\\\textbf{Ví dụ #1.}}}'
);

content = content.replace(
  '\\\\newcommand{\\\\baitap}[1]{\\\\vspace{6pt}\\\\noindent\\\\textbf{Bài #1.}}',
  '\\\\newcommand{\\\\baitap}[1]{\\\\vspace{6pt}\\\\noindent{\\\\color{myblue}\\\\textbf{Bài #1.}}}'
);

fs.writeFileSync('services/gemini.ts', content);
