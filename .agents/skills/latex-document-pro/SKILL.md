---
name: latex-document-pro
description: >-
  Chuẩn biên soạn tài liệu đa môn học LaTeX tiếng Việt chuyên nghiệp (Toán, Lý, Hóa, Sinh,
  Tiếng Anh, Lịch sử, Địa lý) cho đề thi, phiếu bài tập, lời giải chi tiết và giáo án tự động với pdflatex và TikZ.
---

# Quy Trình Biên Soạn Tài Liệu LaTeX Tiếng Việt Chuẩn Cao Cấp Đa Môn

Kỹ năng này chuẩn hóa cấu trúc và quy chuẩn biên soạn tài liệu sư phạm mọi môn học bằng LaTeX hỗ trợ 100% tiếng Việt Unicode, font chữ đồng bộ, chống lỗi biên dịch và trình bày chuyên nghiệp chuẩn format Bộ GD&ĐT 2025--2026.

## 1. Preamble Mẫu Chuẩn Cho Tiếng Việt (pdflatex) & Unicode An Toàn

BẮT BUỘC sử dụng gói `newunicodechar` cùng bảng ánh xạ ký tự Unicode để triệt tiêu hoàn toàn lỗi `! Package inputenc Error: Unicode character ... not set up for use with LaTeX`:

```latex
\documentclass[12pt,a4paper]{article}
\usepackage[utf8]{inputenc}
\usepackage[vietnamese]{babel}
\usepackage{amsmath,amssymb,amsfonts,amsthm}
\usepackage{tabularx}
\usepackage{tcolorbox}
\usepackage{geometry}
\geometry{top=2cm,bottom=2cm,left=2cm,right=2cm}
\usepackage{graphicx}
\usepackage{tikz}
\usepackage{pgfplots}
\pgfplotsset{compat=1.18}
\usepackage{xcolor}
\usepackage{array}
\usepackage{enumitem}
\usepackage{hyperref}

% BẢNG ÁNH XẠ KÝ TỰ UNICODE AN TOÀN TUYỆT ĐỐI
\usepackage{newunicodechar}
\newunicodechar{↗}{\ensuremath{\nearrow}}
\newunicodechar{↘}{\ensuremath{\searrow}}
\newunicodechar{→}{\ensuremath{\rightarrow}}
\newunicodechar{←}{\ensuremath{\leftarrow}}
\newunicodechar{•}{\textbullet}
\newunicodechar{≤}{\ensuremath{\le}}
\newunicodechar{≥}{\ensuremath{\ge}}
\newunicodechar{≠}{\ensuremath{\ne}}
\newunicodechar{≈}{\ensuremath{\approx}}
\newunicodechar{±}{\ensuremath{\pm}}
\newunicodechar{×}{\ensuremath{\times}}
\newunicodechar{÷}{\ensuremath{\div}}
\newunicodechar{∞}{\ensuremath{\infty}}
\newunicodechar{°}{\ensuremath{^\circ}}
\newunicodechar{℃}{\ensuremath{^\circ\text{C}}}

% BỘ MACRO ĐÁP ÁN LINH HOẠT CHỐNG TRÀN DÒNG
\newcommand{\dapan}[4]{
  \begin{tabularx}{\linewidth}{XXXX}
    \textbf{A.} #1 & \textbf{B.} #2 & \textbf{C.} #3 & \textbf{D.} #4
  \end{tabularx}
}
\newcommand{\dapanHaiCot}[4]{
  \begin{tabularx}{\linewidth}{XX}
    \textbf{A.} #1 & \textbf{B.} #2 \\
    \textbf{C.} #3 & \textbf{D.} #4
  \end{tabularx}
}
\newcommand{\dapanMotCot}[4]{
  \begin{tabularx}{\linewidth}{X}
    \textbf{A.} #1 \\
    \textbf{B.} #2 \\
    \textbf{C.} #3 \\
    \textbf{D.} #4
  \end{tabularx}
}

% MACRO ĐOẠN VĂN ĐA MÔN (BÀI ĐỌC TIẾNG ANH, TÌNH HUỐNG LỊCH SỬ / ĐỊA LÝ)
\newcommand{\doanvan}[2]{
  \begin{tcolorbox}[colback=gray!5!white,colframe=gray!50!black,title={\textbf{#1}},arc=2mm]
    \small\textit{#2}
  \end{tcolorbox}
}

\begin{document}
% Nội dung tài liệu ở đây
\end{document}
```

## 2. Quy Tắc Biên Soạn Đa Môn Học

1. **Toán học & Khoa học Tự nhiên**:
   - Mọi công thức bọc trong `$ ... $` (inline) hoặc `\[ ... \]` (display).
   - Đồ thị và hình không gian dùng `tikzpicture` với nét gióng `[dashed]` và nét nhìn thấy `[thick]`.
2. **Tiếng Anh & Ngoại ngữ**:
   - Các bài đọc hiểu bọc trong `\doanvan{Reading Passage}{...}`.
   - Đáp án dài (câu, mệnh đề) linh hoạt chuyển sang `\dapanHaiCot` hoặc `\dapanMotCot` để không tràn biên.
3. **Khoa học Xã hội (Lịch sử, Địa lý, GDCD)**:
   - Các trích dẫn nguồn tư liệu hoặc tình huống thực tế bọc trong `tcolorbox`.
   - Bảng số liệu đối chiếu dùng môi trường `tabular` hoặc `tabularx` có viền `\hline` rõ ràng.

## 3. Điều Phối Dung Lượng & Chống Cắt Cụt Token

- Hướng dẫn giải chi tiết phải tập trung vào bước ngoặt logic then chốt và đáp số cuối cùng, tránh giải thích dài dòng.
- Đảm bảo tài liệu được đóng `\end{document}` hoàn chỉnh 100%.

## 4. Lệnh Biên Dịch Local Fast Render

```bash
pdflatex -interaction=nonstopmode -output-directory=~/Downloads tailieu.tex
```
Chạy 2 lượt để hoàn thiện tham chiếu chéo và số trang.
