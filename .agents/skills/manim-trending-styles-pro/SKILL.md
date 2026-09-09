---
name: manim-trending-styles-pro
description: >-
  Hiệu ứng Hoạt họa Xu Hướng Trending Đỉnh Cao cho Manim CE Toán Học: Tiếp tuyến đổi màu,
  Thanh trạng thái thời gian thực always_redraw, ValueTracker, Thẻ màu đa sắc, Bảng biến thiên 3 tầng.
---

# Kỹ Thuật Hoạt Họa Trending Cho Video Toán Học Manim CE

Kế thừa các kỹ thuật hoạt họa ấn tượng nhất từ \`c1_HamSo_DonDieu.py\` giúp video thu hút học sinh ngay từ giây đầu tiên.

---

## 1. Tiếp Tuyến Trượt Đổi Màu Động Theo Độ Dốc (Dynamic Tangent)
\`\`\`python
t_param = ValueTracker(-2.1)
moving_dot = always_redraw(lambda: Dot(axes.c2p(t_param.get_value(), f_func(t_param.get_value())), color=GOLD, radius=0.09))

def get_tangent():
    t = t_param.get_value()
    y = f_func(t)
    m = derivative_func(t)
    dx = 0.42
    p1 = axes.c2p(t - dx, y - m * dx)
    p2 = axes.c2p(t + dx, y + m * dx)
    # Xanh lá khi đồng biến (m > 0), Đỏ khi nghịch biến (m < 0), Vàng khi tiếp tuyến ngang (m = 0)
    col = GREEN_C if m > 0.1 else (RED_C if m < -0.1 else YELLOW)
    return Line(p1, p2, color=col, stroke_width=4.0)

tangent_line = always_redraw(get_tangent)
\`\`\`

---

## 2. Thanh Trạng Thái Real-Time Pill Badge
\`\`\`python
def get_status_badge():
    t = t_param.get_value()
    m = derivative_func(t)
    if m > 0.1:
        txt, b_col, bg_col = "y' > 0 ➜ ĐỒNG BIẾN (↗)", GREEN_B, "#064E3B"
    elif m < -0.1:
        txt, b_col, bg_col = "y' < 0 ➜ NGHỊCH BIẾN (↘)", RED_B, "#7F1D1D"
    else:
        txt, b_col, bg_col = "y' = 0 ➜ TIẾP TUYẾN NGANG", YELLOW, "#78350F"
    lbl = Text(txt, font=MAIN_FONT, font_size=22, weight=BOLD, color=WHITE)
    rect = RoundedRectangle(corner_radius=0.1, width=max(5.2, lbl.width + 0.5), height=0.52, color=b_col, fill_color=bg_col, fill_opacity=0.9, stroke_width=1.8).move_to(lbl)
    return VGroup(rect, lbl).next_to(top_card.get_bottom(), UP, buff=0.16)

status_badge = always_redraw(get_status_badge)
\`\`\`

---

## 3. Hộp Phát Sáng Đáp Án Đúng (Answer Callout Glow)
\`\`\`python
ans_box = SurroundingRectangle(correct_option, color=GREEN, buff=0.14, corner_radius=0.1, stroke_width=2.8)
self.play(Create(ans_box), run_time=0.8)
\`\`\`
