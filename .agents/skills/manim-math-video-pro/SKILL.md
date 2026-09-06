---
name: manim-math-video-pro
description: >-
  Chuẩn sản xuất video hoạt họa toán học Manim CE chất lượng cao (16:9 & 9:16)
  với Dual-Zone layout, MathTex r"...", chống đè chữ, và quy trình sửa lỗi tự động.
---

# Quy Trình Sản Xuất Video Hoạt Họa Toán Học Manim CE

Kỹ năng này hướng dẫn cách viết mã Python Manim CE chuyên nghiệp cho các bài giảng video toán học sinh động, tối ưu hóa cho Antigravity Agent.

## 1. Cấu Trúc Mã Nguồn Chuẩn (scene.py)

```python
from manim import *

class MainScene(Scene):
    def construct(self):
        # 1. Cấu hình tiêu đề
        title = Text("Bài Giảng: Hàm Số Bậc Hai", font="Be Vietnam Pro", weight="BOLD", font_size=36)
        title.to_edge(UP, buff=0.5)
        self.play(Write(title))
        self.wait(1)

        # 2. Tạo hệ trục tọa độ Oxy
        axes = Axes(
            x_range=[-1, 5, 1],
            y_range=[-2, 5, 1],
            x_length=6,
            y_length=5,
            axis_config={"include_numbers": True}
        ).shift(DOWN * 0.5)

        # 3. Vẽ hàm số y = x^2 - 4x + 3
        graph = axes.plot(lambda x: x**2 - 4*x + 3, x_range=[0.5, 3.5], color=BLUE)
        graph_label = MathTex(r"y = x^2 - 4x + 3", color=BLUE).next_to(graph, UR, buff=0.2)

        self.play(Create(axes))
        self.play(Create(graph), Write(graph_label), run_time=2)
        
        # BẮT BUỘC: Giữ màn hình tổng kết cuối cùng 3s, KHÔNG dùng FadeOut toàn bộ màn hình
        self.wait(3)
```

## 2. Các Quy Tắc Vàng Khi Viết Manim CE

1. **Khung Hình**:
   - **Ngang 16:9**: Mặc định 1920x1080.
   - **Dọc 9:16**: Khởi tạo `config.pixel_width=1080`, `config.pixel_height=1920`, `config.frame_width=9.0`, `config.frame_height=16.0`.
2. **Công thức Toán (`MathTex`)**:
   - 100% sử dụng Raw String: `MathTex(r"...")`.
   - Tiếng Việt trong MathTex: `MathTex(r"\text{Đỉnh } I(2; -1)")`.
3. **Bố cục Dual-Zone & Render Đầy Đủ**:
   - Cột trái: Văn bản/Công thức giải thích.
   - Cột phải: Đồ thị/Hình vẽ trực quan.
   - BẮT BUỘC kết thúc hàm `construct(self)` bằng `self.wait(3)` để video không bị cắt ngắt hay kết thúc đột ngột.
4. **Tránh chồng đè chữ**:
   - Sử dụng `.next_to(...)` hoặc `VGroup(...).arrange(DOWN, buff=0.4)` thay vì tọa độ tuyệt đối cố định.

## 3. Quy Trình Sửa Lỗi Tự Động (Auto-Healing)

Nếu render Manim báo lỗi `AttributeError`, `TypeError`, hoặc `LaTeX Error`:
1. Kiểm tra vị trí dòng lỗi trong `scene.py`.
2. Sửa công thức `MathTex` bằng cách đơn giản hóa ký tự lạ.
3. Đảm bảo đóng đủ mọi ngoặc đơn `)` và ngoặc nhọn `}`.
