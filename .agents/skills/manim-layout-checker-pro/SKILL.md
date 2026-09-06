---
name: manim-layout-checker-pro
description: >-
  Quy chuẩn Kiểm tra Bố cục, Dual-Zone Grid, Chống Đè Chữ và Tự Động Scale Khung Hình Video Toán Manim CE.
---

# Quy Chuẩn Bố Cục & Chống Đè Chữ Trong Manim CE

Kỹ năng này đảm bảo tất cả phần tử đồ họa (Text, MathTex, Graph, Axes, Card) luôn nằm vừa vặn trong khung hình 16:9 hoặc 9:16 và không bao giờ bị đè lên nhau.

## 1. Dual-Zone Layout (Khung Hình Ngang 16:9)

- **Cột Trái (Giảng giải / Công thức)**: $X \in [-6.5, -0.5]$, $Y \in [-3.0, 2.5]$
- **Cột Phải (Hình vẽ / Đồ thị Oxy)**: $X \in [0.5, 6.5]$, $Y \in [-3.0, 2.5]$
- **Tiêu đề Top Banner**: $Y = 3.2$, `buff=0.4`

```python
# Tạo bố cục Dual-Zone chuẩn
left_zone = VGroup(step1, step2, step3).arrange(DOWN, buff=0.35, aligned_edge=LEFT).to_edge(LEFT, buff=0.5)
right_zone = VGroup(axes, graph).to_edge(RIGHT, buff=0.5)
```

## 2. Helper Chống Đè Chữ & Tự Động Scale (Visual Safety)

Sử dụng các helper function có sẵn trong Yuta Manim Engine:
```python
# Tự động co giãn nhóm phần tử để vừa khung hình
fit_group(left_zone, max_width=5.5, max_height=5.0)

# Thêm thẻ nền tối chống mờ chữ khi đè lên đường kẻ đồ thị
add_backdrop(label_text, color="#0F172A", opacity=0.9, buff=0.15)
```
