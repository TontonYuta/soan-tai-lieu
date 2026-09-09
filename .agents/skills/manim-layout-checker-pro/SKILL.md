---
name: manim-layout-checker-pro
description: >-
  Quy chuẩn Kiểm tra Bố cục, Dual-Zone Grid, Chống Đè Chữ và An Toàn Hình Học 9:16 & 16:9 trong Manim CE.
---

# Quy Chuẩn Bố Cục & An Toàn Hình Học Trong Manim CE

Kỹ năng này cung cấp các ngân sách tọa độ và nguyên tắc chống đè chữ tuyệt đối cho video dọc 9:16 và ngang 16:9.

---

## 1. Ngân Sách Tọa Độ Video Dọc 9:16 (1080x1920, Frame 9.0 x 16.0)

Màn hình dọc có Y từ -8.0 đến +8.0, X từ -4.5 đến +4.5. Phân bổ ngân sách chiều cao chuẩn:
- **Top Header Bar**: \`y ~ 7.05\`, \`height = 1.1 - 1.3\`, \`width = 8.4 - 8.5\`. Đặt tại \`to_edge(UP, buff=0.35)\`.
- **Top Card (Visual Zone)**: \`y ~ 3.15\`, \`height = 6.4\`, \`width = 8.4\`. Đặt tại \`next_to(header_card, DOWN, buff=0.2)\`.
  - **Giới hạn Hệ trục Axes**: Chiều rộng \`x_length <= 7.2\`, chiều cao \`y_length <= 4.0\`. CẤM đặt \`y_length > 4.2\` vì sẽ đè lên tiêu đề thẻ hoặc nhãn cực trị!
- **Bottom Card (LaTeX Zone)**: \`y ~ -3.75\`, \`height = 6.6\`, \`width = 8.4\`. Đặt tại \`next_to(top_card, DOWN, buff=0.2)\`.
  - **Giới hạn Bảng biến thiên**: Mảng LaTeX \`\begin{array}\` font_size từ 22 đến 26, tối đa 4 dòng.
- **Outro Card**: \`y = 0.0\`, \`height = 13.6 - 13.8\`, \`width = 8.4\`. Căn giữa màn hình \`move_to(ORIGIN)\`.

---

## 2. Nguyên Tắc fit_width Cho Mọi Nhóm Mobject
Mỗi khi tạo xong một VGroup chứa chữ hoặc công thức trong thẻ, BẮT BUỘC gọi:
\`\`\`python
fit_width(group, 7.8)
\`\`\`
Điều này đảm bảo dù đề bài có chứa phân số dài, căn thức hay biểu thức phức tạp, nhóm đối tượng sẽ tự động co lại vừa vặn trong lòng thẻ 8.4 mà không bao giờ bị cắt mép màn hình.

---

## 3. Quy Luật Zero-Overlap (Không Đè Chữ Giữa Các Cảnh)
1. **Dọn sạch cảnh cũ**: Mỗi khi kết thúc một phân cảnh (Intro -> Theory -> Simulation -> RAG), BẮT BUỘC gọi \`self.play(FadeOut(all_mobjects_of_scene))\` trước khi tạo các thẻ mới.
2. **Ngoại lệ Outro**: Riêng Thẻ Outro ở cuối video TUYỆT ĐỐI KHÔNG FadeOut! Dùng \`self.wait(3.0)\` để giữ khung hình cuối cùng.
3. **Cấm Watermark trôi nổi**: Không di chuyển logo hay biểu tượng lên góc UL làm watermark vì sẽ va chạm với chữ đầu dòng của tiêu đề.
