---
name: latex-document-pro
description: >-
  Chuẩn biên soạn tài liệu toán học LaTeX tiếng Việt chuyên nghiệp cho đề thi,
  phiếu bài tập, lời giải chi tiết và giáo án tự động với pdflatex và TikZ.
---

# Qúa Trình Biên Soạn Tài Liệu LaTeX Tiếng Việt Chuẩn Cao Cấp

Kỹ năng này hướng dẫn cấu trúc và chuẩn mực biên soạn tài liệu toán học bằng LaTeX hỗ trợ đầy đủ tiếng Việt Unicode, font chữ đẹp, trình bày chuyên nghiệp cho đề thi, phiếu bài tập và giáo án.

## 1. Preamble Mẫu Chuẩn Cho Tiếng Việt (pdflatex)

```latex
\documentclass[12pt,a4paper]{article}
\usepackage[utf8]{vietnam}
\usepackage{amsmath,amssymb,amsfonts,amsthm}
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

\hypersetup{
    colorlinks=true,
    linkcolor=blue,
    urlcolor=cyan,
}

\begin{document}

% Nội dung tài liệu ở đây

\end{document}
```

## 2. Quy Tắc Trình Bày Công Thức Toán & Đề Thi

1. **Số thứ tự câu hỏi**: Sử dụng định dạng `\textbf{Câu 1.}` hoặc môi trường `\begin{enumerate}`.
2. **Hình vẽ TikZ**: Luôn bọc trong môi trường `\begin{center}\begin{tikzpicture} ... \end{tikzpicture}\end{center}`.
3. **Bảng đáp án**: Sử dụng môi trường `\begin{tabular}` hoặc `\begin{tasks}` cho 4 đáp án trắc nghiệm A, B, C, D trên 1 hoặc 2 dòng.
4. **Bảng biến thiên**: Khuyến khích dùng gói `tkz-tab` hoặc TikZ thiết lập bảng phẳng khoa học.

## 3. Lệnh Biên Dịch Không Tương Tác

```bash
pdflatex -interaction=nonstopmode -output-directory=~/Downloads tailieu.tex
```
Chạy 2 lượt để cập nhật số trang, mục lục và tham chiếu chéo.
