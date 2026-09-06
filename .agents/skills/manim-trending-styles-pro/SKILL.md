---
name: manim-trending-styles-pro
description: >-
  Bộ sưu tập Hiệu ứng Hoạt họa Xu hướng Trending GitHub cho Manim CE
  (Neon Glow, Glassmorphism, Dynamic Tracing, Moving Camera, Step Badges).
---

# Kỹ Thuật Hoạt Họa Trending GitHub Cho Video Toán Học Manim CE

Kỹ năng này cung cấp các đoạn mã mẫu animation thịnh hành (Trending) từ các kho chứa GitHub hàng đầu về Manim toán học.

## 1. Thẻ Glassmorphism & Neon Accent Point

```python
# Tạo thẻ thông số kiểu Glassmorphism hiện đại
card_bg = RoundedRectangle(corner_radius=0.2, height=1.8, width=4.5, color=TEAL, fill_color="#0F172A", fill_opacity=0.85, stroke_width=2)
card_title = Text("ĐỈNH PARABOL", font="Be Vietnam Pro", font_size=20, color=GOLD).move_to(card_bg.get_top() + DOWN * 0.3)
card_val = MathTex(r"I(2;\; -1)", font_size=32, color=WHITE).next_to(card_title, DOWN, buff=0.2)
glass_card = VGroup(card_bg, card_title, card_val)

self.play(FadeIn(glass_card, shift=UP * 0.3))
```

## 2. Dynamic Point Tracing (Quỹ Vệt Vẽ Động)

```python
# Điểm chuyển động vẽ theo đường cong parabol
dot = Dot(color=YELLOW)
dot.move_to(axes.c2p(0, 3))

# Dynamic tracing line
path = TracedPath(dot.get_center, stroke_color=YELLOW, stroke_width=4)
self.add(path)

# Di chuyển điểm chạy dọc đồ thị
self.play(MoveAlongPath(dot, graph), run_time=3, rate_func=linear)
```

## 3. Step-by-Step Badge Callout (Số Bước Nổi Bật)

```python
def make_step_badge(step_num, text_str):
    badge = Circle(radius=0.25, color=BLACK, fill_color=YELLOW, fill_opacity=1.0)
    num_txt = Text(str(step_num), font="Be Vietnam Pro", font_size=18, color=BLACK, weight=BOLD).move_to(badge.get_center())
    label = Text(text_str, font="Be Vietnam Pro", font_size=22, color=WHITE).next_to(badge, RIGHT, buff=0.25)
    return VGroup(VGroup(badge, num_txt), label)
```
