const fs = require('fs');
let content = fs.readFileSync('services/gemini.ts', 'utf8');

// Add xcolor
content = content.replace(
  '\\\\usepackage{tikz}',
  '\\\\usepackage{tikz}\n\\\\usepackage[table]{xcolor}\n\\\\definecolor{myblue}{RGB}{0,112,192}'
);

// Update titleformat
content = content.replace(
  '\\\\titleformat{\\\\section}{\\\\Large\\\\bfseries}{Bài \\\\thesection.}{0.5em}{}',
  '\\\\titleformat{\\\\section}{\\\\Large\\\\bfseries\\\\color{myblue}}{Bài \\\\thesection.}{0.5em}{}'
);

content = content.replace(
  '\\\\titleformat{\\\\subsection}{\\\\large\\\\bfseries}{}{0pt}{}',
  '\\\\titleformat{\\\\subsection}{\\\\large\\\\bfseries\\\\color{myblue}}{}{0pt}{}'
);

content = content.replace(
  '\\\\titleformat{\\\\subsubsection}{\\\\normalsize\\\\bfseries}{}{0pt}{}',
  '\\\\titleformat{\\\\subsubsection}{\\\\normalsize\\\\bfseries\\\\color{myblue}}{}{0pt}{}'
);

// Update dangbai and trangbaitap
content = content.replace(
  '\\\\newcommand{\\\\dangbai}[1]{\\\\vspace{10pt}\\\\subsection{#1}\\\\vspace{-2mm}\\\\hrule\\\\vspace{5mm}}',
  '\\\\newcommand{\\\\dangbai}[1]{\\\\vspace{10pt}\\\\subsection{#1}\\\\vspace{-2mm}{\\\\color{myblue}\\\\hrule}\\\\vspace{5mm}}'
);

content = content.replace(
  '\\\\newcommand{\\\\trangbaitap}{\\\\vspace{15pt}\\\\subsubsection{Bài tập tự luyện}\\\\vspace{-2mm}\\\\hrule\\\\vspace{5mm}}',
  '\\\\newcommand{\\\\trangbaitap}{\\\\vspace{15pt}\\\\subsubsection{Bài tập tự luyện}\\\\vspace{-2mm}{\\\\color{myblue}\\\\hrule}\\\\vspace{5mm}}'
);

fs.writeFileSync('services/gemini.ts', content);
