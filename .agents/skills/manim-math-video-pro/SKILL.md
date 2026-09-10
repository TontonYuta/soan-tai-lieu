---
name: manim-math-video-pro
description: >-
  Chuẩn sản xuất video hoạt họa toán học Manim CE chất lượng cao (9:16 Dọc Shorts/TikTok & 16:9 Ngang)
  dựa trên cấu trúc 5 phân cảnh vàng của c1_HamSo_DonDieu.py: Dual-Zone Container Cards, Mô phỏng động
  ValueTracker + always_redraw, Tiếp tuyến đổi màu, Bảng biến thiên 3 tầng, Chữa đề thi RAG thực chiến
  và Thẻ Outro thương hiệu.
---

# Master Guide: Sản Xuất Video Toán Học Manim CE Chuyên Nghiệp

Kỹ năng này chuẩn hóa 100% quy trình thiết kế, lập trình và kiểm soát thẩm mỹ cho video hoạt họa toán học Manim CE (Python), kế thừa kiến trúc đỉnh cao từ \`c1_HamSo_DonDieu.py\`.

---

## 1. Cấu Trúc Khung Hình & Tọa Độ Hình Học

### 1.1 Khung Hình Dọc 9:16 (TikTok, YouTube Shorts, Reels)
- Kích thước pixel: \`config.pixel_width = 1080\`, \`config.pixel_height = 1920\`
- Kích thước tọa độ không gian Manim:
  - Chiều rộng \`config.frame_width = 9.0\` (Biên trái -4.5, biên phải +4.5)
  - Chiều cao \`config.frame_height = 16.0\` (Đỉnh trên +8.0, đáy dưới -8.0)
- Tỷ lệ lấp đầy: Sử dụng tổng chiều cao 14.8 / 16.0 đơn vị (chiếm ~93% màn hình), triệt tiêu khoảng đen thừa.

### 1.2 Hàm Helper Bắt Buộc: \`fit_width\` (Chống tràn viền thẻ)
Mọi khối nội dung bên trong bất kỳ thẻ Card nào đều BẮT BUỘC gọi \`fit_width(mobj, max_width=7.8)\` trước khi \`self.play\`:
\`\`\`python
def fit_width(mob: Mobject, max_width: float = 7.8) -> Mobject:
    """Tự động co tỷ lệ nếu chiều rộng vượt quá ngưỡng quy định để chống tràn mép thẻ."""
    if mob.width > max_width:
        mob.scale_to_fit_width(max_width)
    return mob
\`\`\`

---

## 2. Kiến Trúc 5 Phân Cảnh Vàng (5-Chapter Cinematic Flow)
Toàn bộ video có thời lượng lý tưởng 90 - 120 giây, chia thành đúng 5 chương rõ ràng:

### Chương 1: Mở Đầu Ấn Tượng (Intro, ~7s)
- **Cấu trúc**:
  1. Pill Badge chủ đề: \`RoundedRectangle(width=badge_text.width + 0.65, height=badge_text.height + 0.35, color=TEAL, fill_color="#0F172A", fill_opacity=0.92)\`
  2. Tiêu đề bài học: \`Text("...", font_size=32, weight=BOLD, color=YELLOW)\` bọc trong \`SurroundingRectangle(title, buff=0.28, color=BLUE_C, corner_radius=0.18)\`
  3. Phụ đề dẫn dắt: \`Text("...", font_size=22, color=GRAY_B)\`
  4. Xem trước quy tắc vàng: 2 dòng \`MathTex(r"...", font_size=28)\`
- **Animation**: \`FadeIn\` với hướng trượt nhẹ, \`Write\` tiêu đề, dừng \`self.wait(2.2)\`.
- **Chuyển cảnh**: \`self.play(FadeOut(intro_group))\` dọn sạch 100% màn hình. TUYỆT ĐỐI KHÔNG để biểu tượng co nhỏ trôi nổi ở góc UL làm watermark để tránh va chạm đè chữ tiêu đề ở phân cảnh tiếp theo!

### Chương 2: Lý Thuyết Cốt Lõi - 2 Thẻ Màu Độc Lập (~14s)
- Thay vì dùng thẻ cố định cứng nhắc, hãy sáng tạo 2 thẻ màu chuyên biệt theo bản chất toán học:
  - **Thẻ 1 (Đồng biến / Giá trị lớn nhất / Tính chất khẳng định)**: Viền \`GREEN_D\`, nền \`#064E3B\` (độ đục 0.35), \`height=4.0-4.2\`, \`width=8.4\`.
  - **Thẻ 1 (Đồng biến / Giá trị lớn nhất / Tính chất khẳng định)**: Viền `GREEN_D`, nền `#064E3B` (độ đục 0.35), `height=4.0-4.2`, `width=8.4`.
  - **Thẻ 2 (Nghịch biến / Giá trị nhỏ nhất / Tính chất phủ định)**: Viền `RED_D`, nền `#7F1D1D` (độ đục 0.35), `height=4.0-4.2`, `width=8.4`.
- Cả 2 thẻ xếp dọc: `theory_stack = VGroup(card1, card2).arrange(DOWN, buff=0.4)`.
- Sau khi học sinh đọc xong lý thuyết: `self.play(FadeOut(theory_all))`.

### Chương 3: Dual-Zone Container Mô Phỏng Động Tương Tác (~38s)
- **Top Header Bar cố định**:
  - `header_card = RoundedRectangle(width=8.4, height=1.1, color=BLUE_D, fill_color="#1E293B", fill_opacity=0.95).to_edge(UP, buff=0.35)`
  - Chứa Pill Badge ("VÍ DỤ MINH HỌA") + Tiêu đề dạng toán kết hợp Text và MathTex(r"y = x^3 - 3x").
- **Top Card (Visual Simulation, height=6.4, width=8.4)**:
  - Tiêu đề thẻ: `top_title.next_to(top_card.get_top(), DOWN, buff=0.18)`
  - Hệ trục: `Axes(x_range=[-2.4, 2.4, 1], y_range=[-2.8, 2.8, 1], x_length=7.2, y_length=4.0)`. (CHÚ Ý: `y_length` không vượt quá 4.0 để tránh đè tiêu đề thẻ và nhãn cực trị).
  - Điểm cực trị: Gióng đường nét đứt về 2 trục bằng `axes.get_lines_to_point(pt).set_color(YELLOW_B)`.
  - **Diễn hoạt tiếp tuyến chuyển động (ValueTracker + always_redraw)**:
```python
t_param = ValueTracker(-2.1)
moving_dot = always_redraw(lambda: Dot(axes.c2p(t_param.get_value(), f_func(t_param.get_value())), color=GOLD, radius=0.09))

def get_tangent():
    t = t_param.get_value()
    y = f_func(t)
    m = 3 * (t**2) - 3  # Đạo hàm f'(t)
    dx = 0.42
    p1 = axes.c2p(t - dx, y - m * dx)
    p2 = axes.c2p(t + dx, y + m * dx)
    col = GREEN_C if m > 0.1 else (RED_C if m < -0.1 else YELLOW)
    return Line(p1, p2, color=col, stroke_width=4.0)
tangent_line = always_redraw(get_tangent)

def get_status_badge():
    t = t_param.get_value()
    m = 3 * (t**2) - 3
    if m > 0.1:
        txt, b_col, bg_col = "y' > 0 ➜ ĐỒNG BIẾN (↗)", GREEN_B, "#064E3B"
    elif m < -0.1:
        txt, b_col, bg_col = "y' < 0 ➜ NGHỊCH BIẾN (↘)", RED_B, "#7F1D1D"
    else:
- **Top Card (height=6.4, width=8.4)**:
  - Hệ trục Oxy (`Axes`) gọn gàng: `x_length=7.2, y_length=4.0` (CẤM vượt quá `4.0` để không đè lên header và tiêu đề thẻ).
  - Đồ thị đường cong toán học: `axes.plot(...)`.
  - Cực trị và đường gióng nét đứt: `DashedLine`.
  - **TIẾP TUYẾN CHUYỂN ĐỘNG VỚI `ValueTracker` + `always_redraw`**:
    - Tiếp tuyến tự động đổi màu theo dấu hệ số góc $k = y'$:
      * $k > 0$: Đổi màu `GREEN` (đồng biến, dốc lên).
      * $k < 0$: Đổi màu `RED` (nghịch biến, dốc xuống).
      * $k = 0$: Đổi màu `YELLOW` (tiếp tuyến nằm ngang tại cực trị).
    - **Thanh trạng thái thời gian thực (`status_badge`)**: Khung bo góc nhỏ hiển thị trực tiếp giá trị $y'$ và trạng thái đơn điệu.
```python
    lbl = Text(txt, font=MAIN_FONT, font_size=22, color=WHITE)
    rect = RoundedRectangle(corner_radius=0.1, width=max(5.2, lbl.width + 0.5), height=0.52, color=b_col, fill_color=bg_col, fill_opacity=0.9, stroke_width=1.8).move_to(lbl)
    return VGroup(rect, lbl).next_to(top_card.get_bottom(), UP, buff=0.16)
status_badge = always_redraw(get_status_badge)
```
- **Bottom Card (height=6.6, width=8.4)**:
  - Đạo hàm: `MathTex(r"y' = 3x^2 - 3 = 0 \iff x = \pm 1")`.
  - **BẢNG BIẾN THIÊN 3 TẦNG LATEX CHUẨN MỰC**:
```latex
\begin{array}{|c|ccccccc|}
\hline
x & -\infty & & -1 & & 1 & & +\infty \\
\hline
y' & & + & 0 & - & 0 & + & \\
\hline
& & & 2 & & & & +\infty \\
y & & \nearrow & & \searrow & & \nearrow & \\
& -\infty & & & & -2 & & \\
\hline
\end{array}
```
  - Kết luận đóng khung `SurroundingRectangle(conclusions, color=GREEN, buff=0.16, corner_radius=0.12)`.
  - Di chuyển `t_param` với nhịp điệu vừa vặn tại các cực trị:
```python
self.play(t_param.animate.set_value(-1.0), run_time=1.8, rate_func=smooth)
self.wait(0.8)  # Dừng quan sát tiếp tuyến ngang tại cực đại
self.play(t_param.animate.set_value(1.0), run_time=2.0, rate_func=smooth)
self.wait(0.8)  # Dừng quan sát tiếp tuyến ngang tại cực tiểu
self.play(t_param.animate.set_value(2.1), run_time=1.6, rate_func=smooth)
self.wait(1.0)  # Dừng quan sát tổng thể BBT và kết luận
```
- Chuyển cảnh: `self.play(FadeOut(sim_all))` dọn sạch toàn bộ.

### Chương 4: Chữa Đề Thi RAG Thực Chiến (~38s)
- **Quy tắc về khối lượng**: TỐI ĐA 2 CÂU TIÊU BIỂU (Top Card: Câu 1; Bottom Card: Câu 2). TUYỆT ĐỐI KHÔNG nhồi nhét 3-4 câu vào 1 video vì sẽ gây đè chữ và vỡ khung hình.
- **Top Card (Câu 1 - Đọc BBT / Đồ thị, height=6.4, width=8.4)**:
  - Tiêu đề: `Câu 1: Đọc bảng biến thiên`
  - Đề bài ngắn gọn + BBT LaTeX thu gọn (`font_size=22`)
  - Câu hỏi + Hàng 4 đáp án A, B, C, D: `VGroup(optA, optB, optC, optD).arrange(RIGHT, buff=0.35)`
  - Hộp bo xanh đáp án đúng: `SurroundingRectangle(optD, color=GREEN, buff=0.14, corner_radius=0.1, stroke_width=2.5)`
- **Bottom Card (Câu 2 - Xét Dấu Đạo Hàm / Giải Tích, height=6.6, width=8.4)**:
  - Tiêu đề: `Câu 2: Xét dấu đạo hàm`
  - Đề bài viết bằng MathTex chuẩn cho công thức: `VGroup(Text("Cho hàm số", font=MAIN_FONT, font_size=22), MathTex(r"y = x^3 - 3x^2", font_size=24)).arrange(RIGHT, buff=0.15)`
  - Các bước giải ngắn gọn (Bước 1 tính đạo hàm, Bước 2 tìm nghiệm, Bước 3 xét dấu)
  - Kết luận và hộp bo xanh quanh đáp án đúng.
- Chuyển cảnh: `self.play(FadeOut(qz_all))` dọn sạch.

### Chương 5: Tổng Kết & Outro Thương Hiệu (~8s)
- **Outro Card toàn màn hình**: `RoundedRectangle(corner_radius=0.25, width=8.4, height=13.6, color=GOLD_E, fill_color="#0F172A", fill_opacity=0.96).move_to(ORIGIN)`
- Tiêu đề: `Tổng kết bài học [Tên chuyên đề]` (`font_size=30, color=YELLOW, weight=BOLD`)
- 3 gạch đầu dòng cô đọng phương pháp (`font_size=22-24, line_spacing=1.2`)
- Badge thương hiệu kênh:
  * Nền đỏ bo góc: `RoundedRectangle(width=5.6, height=1.0, color=RED, fill_color=RED_E, fill_opacity=0.9)`
  * Chữ chính: `Text("Học toán cùng Yuta", font_size=26, weight=BOLD, color=WHITE)`
  * Kêu gọi hành động: `Text("Bấm Follow để nhận bài giảng mới mỗi ngày!", font_size=22, color=GRAY_B)`
- **QUY TẮC BẤT DI BẤT DỊCH CUỐI VIDEO**:
  * Dùng `self.wait(1.5)` giữ nguyên màn hình Outro.
  * TUYỆT ĐỐI KHÔNG dùng `FadeOut` toàn bộ màn hình ở cuối video!

---

## 3. Quy Chuẩn Typography, Công Thức Toán & Nhịp Độ Pacing

1. **Chỉ số trên / Chỉ số dưới & Công thức Toán Học (Superscript & Subscript)**:
   - 100% công thức chứa số mũ ($x^2, x^3, e^{2x}$), chỉ số dưới ($x_0, x_1, y_0, \Delta_x$) hoặc đạo hàm ($y', f''(x)$) **BẮT BUỘC dùng `MathTex(r"...")`** với raw string `r"..."`.
   - **TUYỆT ĐỐI CẤM** sử dụng ký tự unicode (như $x^2$ viết thành `x²`, $x^3$ thành `x³`, $x_1$ thành `x₁`) trong `Text(...)`. Việc dùng unicode trong `Text` sẽ gây lỗi font, thiếu glyph (missing glyphs), biến dạng ô vuông trên Linux/Windows.
   - Khi viết văn bản tiếng Việt có chứa công thức toán, hãy tách rời và ghép qua `VGroup`:
     `VGroup(Text("Hàm số:", font=MAIN_FONT, font_size=22), MathTex(r"y = x^3 - 3x^2", font_size=24)).arrange(RIGHT, buff=0.15)`
2. **Quy Chuẩn Nhịp Độ Diễn Hoạt (Pacing Vừa Phải, Mượt Mà & Không Để Khoảng Chờ Quá Lâu)**:
   - Nhịp điệu diễn hoạt phải sinh động, dứt khoát và liên tục (Snappy & Engaging), TUYỆT ĐỐI KHÔNG dừng chết video quá lâu (>1.2s - 1.5s) gây cảm giác màn hình bị đơ hoặc kéo dài lê thê:
     * Chuyển cảnh / Xuất hiện nội dung thông thường: `self.wait(0.5)` đến `self.wait(0.8)`.
     * Tại các điểm mấu chốt: tiếp tuyến đạt cực trị $y'=0$ đổi màu, bảng biến thiên 3 tầng xuất hiện: dừng vừa vặn `self.wait(0.8)` đến `self.wait(1.0)`.
     * Đóng khung kết luận / đáp án đúng: dừng `self.wait(1.0)` đến `self.wait(1.2)`.
   - Diễn hoạt `ValueTracker` chuyển động tiếp tuyến: Dùng `rate_func=smooth` với thời gian `run_time=2.0s - 2.5s` để tiếp tuyến lướt mượt mà, không bị chậm chạp lê thê.
3. **Tiêu Đề Pill Badge**:
   - Dùng `"VÍ DỤ MINH HỌA"` hoặc `"VÍ DỤ"`, TUYỆT ĐỐI KHÔNG dùng `"VÍ DỤ GỐC"`.
4. **Font Chữ & Cỡ Chữ (Sans-serif Hiện Đại, Chống Lỗi In Đậm)**:
   - Tiếng Việt: `MAIN_FONT = "Be Vietnam Pro"` (hoặc fallback `Inter`).
   - TUYỆT ĐỐI KHÔNG dùng font có chân Serif (`Times New Roman`, `Liberation Serif`) cho Text tiếng Việt trên video, vì khi in đậm `weight=BOLD` trên Linux/Cairo/Pango nét chữ sẽ bị gai góc, răng cưa thô ráp và méo mó dấu tiếng Việt.
   - Khi in đậm (Bold Typography): Sử dụng `weight=BOLD` cho tiêu đề và `weight=SEMIBOLD` (hoặc BOLD chuẩn) cho các từ khóa then chốt trên nền `Be Vietnam Pro`. Các đường nét bo tròn mượt mà, nét chữ đồng đều, dấu thanh chuẩn tỉ lệ vàng.
   - Cỡ chữ an toàn:
     - Tiêu đề chính / Intro / Outro: `28 - 32` (BOLD, YELLOW)
     - Tiêu đề Card: `22 - 24` (BOLD)
     - Công thức MathTex: `24 - 30`
     - Chữ diễn giải tiếng Việt: `20 - 24`
     - CẤM dùng `font_size < 20` trên video dọc 9:16.
5. **Bảng Màu Sư Phạm Hiện Đại**:
   - Nền chính: `#0B1120` (Midnight Navy)
   - Thẻ Card 1: `#0F172A` (Slate 900)
   - Thẻ Card 2: `#1E293B` (Slate 800)
   - Thẻ Khẳng định / Tăng / Max: `#064E3B` (Emerald 900) + Viền `GREEN_D`
   - Thẻ Phủ định / Giảm / Min: `#7F1D1D` (Ruby 900) + Viền `RED_D`
   - Nhấn mạnh / Đáp số: `YELLOW` hoặc `GOLD`

---

## 4. Bản Đồ Trực Quan Đa Môn Học (Multi-Subject Visual Blueprint)

Cấu trúc Khung Thẻ Dual-Zone linh hoạt thích ứng cho mọi môn học:

1. **Toán học (Giải tích & Hình học)**: Top Card vẽ hệ trục Oxy, đồ thị axes.plot, tiếp tuyến đổi màu; Bottom Card vẽ Bảng biến thiên 3 tầng và kết luận.
2. **Vật lý & STEM**: Top Card mô phỏng quỹ đạo chuyển động con lắc/vật ném, dao động điều hòa, sơ đồ mạch điện; Bottom Card hiển thị công thức định luật và các bước tính toán.
3. **Hóa học**: Top Card diễn hoạt mô hình liên kết phân tử/nguyên tử; Bottom Card hiển thị phương trình phản ứng cân bằng, điều kiện nhiệt độ/xúc tác và bảng nồng độ.
4. **Sinh học**: Top Card vẽ sơ đồ lai Menđen (bảng Punnett), phân bào, hoặc chuỗi xoắn kép ADN; Bottom Card hiển thị tỷ lệ kiểu gen/kiểu hình.
5. **Tiếng Anh & Ngoại ngữ**: Top Card hiển thị thẻ học từ vựng (Pill Badge từ loại, IPA, ví dụ); Bottom Card hiển thị sơ đồ trục thời gian các thì (Tenses Timeline) và công thức ngữ pháp.
6. **Tin học & Thuật toán**: Top Card minh họa thanh mảng hoán đổi vị trí (Sorting bars), duyệt cây nhị phân; Bottom Card hiển thị bảng lần vết biến và đồ thị độ phức tạp $O(n)$.
7. **Lịch sử & Địa lý**: Top Card diễn hoạt trục thời gian (Timeline) trượt qua các mốc năm; Bottom Card hiển thị thẻ so sánh nguyên nhân - diễn biến - ý nghĩa.

---

## 5. Quy Chuẩn Đồng Bộ Âm Thanh TTS & Animation (TTS-Animation Sync)

1. **Tốc độ đọc giọng AI**: ~2.8 - 3.0 từ/giây (160 - 180 từ/phút).
2. **Dung lượng kịch bản `VOICEOVER_SCRIPT`**:
   - `Số từ ≈ Thời lượng (giây) × 2.85`.
   - Video 60s: ~170 từ.
   - Video 90s: ~255 từ.
   - Video 110-120s: ~300-330 từ.
3. **Khớp nối thời gian theo phân cảnh**:
   - Cảnh 1 (Intro): 7s -> ~20 từ.
   - Cảnh 2 (Lý thuyết): 14s -> ~40 từ.
   - Cảnh 3 (Mô phỏng động): 38s -> ~105 từ.
   - Cảnh 4 (Chữa bài thực chiến): 38s -> ~105 từ.
   - Cảnh 5 (Outro): 8s -> ~25 từ.
4. **Khớp nối trong mã Manim**:
   - Tổng `run_time` của các lệnh `self.play(...)` cộng với `self.wait(...)` trong mỗi phân cảnh BẮT BUỘC phải xấp xỉ bằng thời gian đọc đoạn thuyết minh tương ứng trong `VOICEOVER_SCRIPT` ($\pm 1.5$s) để video kết thúc cùng lúc với giọng nói, không bị cụt âm thanh hoặc khoảng lặng đen.
