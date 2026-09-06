---
name: manim-font-typography-pro
description: >-
  Quy chuẩn Font chữ, Typography và Phối màu chuẩn đẹp cho Video Manim CE Toán Học
  (Be Vietnam Pro, Inter, MathPazo, Gradient Text).
---

# Quy Chuẩn Font Chữ & Typography Cho Video Manim CE

Kỹ năng này quy định việc sử dụng font chữ, màu sắc và typography trực quan cho video bài giảng toán học chuyên nghiệp.

## 1. Font Chữ & Tiếng Việt Unicode

- **Font Tiêu đề & Văn bản**: Ưu tiên `Be Vietnam Pro` (mặc định), `Inter`, hoặc `Roboto`.
  ```python
  title = Text("Khảo Sát Hàm Số Bậc Hai", font="Be Vietnam Pro", weight=BOLD, font_size=36, color=YELLOW)
  ```
- **Công thức Toán (`MathTex`)**: BẮT BUỘC dùng raw string `r"..."`. Nếu có Tiếng Việt trong MathTex, dùng `\text{...}`:
  ```python
  formula = MathTex(r"f(x) = x^2 - 4x + 3 \quad \text{(với } x \in \mathbb{R}\text{)}", font_size=32)
  ```

## 2. Bảng Màu Chuẩn Giáo Dục & Trending (Color Palette)

- **Hình học / Đồ thị**: `BLUE_C`, `CYAN`, `GOLD`, `TEAL`
- **Điểm nhấn / Chú thích**: `YELLOW_A`, `PINK`, `RED_B`
- **Mền background thẻ (Glassmorphism)**: `#0F172A` với độ đục `opacity=0.85`
- **Chữ Gradient**:
  ```python
  gradient_text = Text("GIAO ĐIỂM TẠI OX", font="Be Vietnam Pro", font_size=28).set_color_by_gradient(YELLOW, ORANGE)
  ```
