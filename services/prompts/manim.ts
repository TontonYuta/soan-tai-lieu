import { VideoConfig } from "../../types";

export const generateVideoManimPrompt = (config: VideoConfig): string => {
  const isVertical = config.format === 'vertical';
  const qualityFlag = config.renderQuality === '1080p' ? '-pqh' : config.renderQuality === '4k' ? '-pqk' : '-pql';
  const fps = config.fps || 60;
  
  let mathTypeGuide = "";
  if (config.mathType === 'calculus') {
    mathTypeGuide = `
- **CHUYÊN ĐỀ GIẢI TÍCH & ĐỒ THỊ:**
  * Dùng \`Axes(x_range=[...], y_range=[...], axis_config={"include_numbers": True})\`.
  * Vẽ đồ thị hàm số bằng \`axes.plot(lambda x: ..., color=...)\`.
  * Hiệu ứng tiếp tuyến di chuyển: Dùng \`always_redraw(lambda: axes.get_tangent_line(...))\` hoặc \`TangentLine\`.
  * Tô màu diện tích tích phân: Dùng \`axes.get_area(graph, x_range=[a, b], color=...)\` hoặc hình chữ nhật Riemann \`axes.get_riemann_rectangles(...)\`.`;
  } else if (config.mathType === '3d_geometry') {
    mathTypeGuide = `
- **CHUYÊN ĐỀ HÌNH HỌC KHÔNG GIAN 3D:**
  * Kế thừa từ \`ThreeDScene\` thay vì \`Scene\`.
  * Thiết lập camera 3D ban đầu: \`self.set_camera_orientation(phi=75 * DEGREES, theta=30 * DEGREES)\`.
  * Hiệu ứng camera xoay 360 độ: \`self.begin_ambient_camera_rotation(rate=0.2)\` hoặc \`self.move_camera(phi=..., theta=..., run_time=...)\`.
  * Dựng khối 3D: \`ThreeDAxes\`, khối chóp/lăng trụ bằng các đa giác \`Polygon\`, mặt cầu \`Sphere\`, mặt phẳng \`Surface\`.`;
  } else if (config.mathType === 'trigonometry') {
    mathTypeGuide = `
- **CHUYÊN ĐỀ LƯỢNG GIÁC & VÒNG TRÒN ĐƠN VỊ:**
  * Vẽ vòng tròn bán kính 1 bằng \`Circle(radius=...)\` và hệ trục tọa độ.
  * Góc lượng giác quét động: Dùng \`ValueTracker\` cho góc theta $\\theta$, điểm trên đường tròn \`always_redraw(lambda: Dot(point=...))\`.
  * Đoạn thẳng gióng trục sin (trục tung) và cos (trục hoành) đổi màu động.`;
  } else if (config.mathType === 'vector') {
    mathTypeGuide = `
- **CHUYÊN ĐỀ VECTƠ & KHÔNG GIAN TỌA ĐỘ:**
  * Vẽ vectơ bằng \`Arrow(start=..., end=..., buff=0, color=...)\`.
  * Cộng/trừ vectơ theo quy tắc hình bình hành hoặc tam giác có nét đứt gióng nối.
  * Nhãn vectơ dùng \`MathTex(r"\\vec{u}", color=...)\` định vị qua \`.next_to(arrow, ...)\`.`;
  } else {
    mathTypeGuide = `
- **CHUYÊN ĐỀ ĐẠI SỐ & BIẾN ĐỔI TOÁN HỌC:**
  * Sử dụng \`TransformMatchingTex\` hoặc \`ReplacementTransform\` để chuyển đổi từng bước phương trình.
  * Đóng khung kết quả quan trọng bằng \`SurroundingRectangle(..., color=YELLOW, buff=0.15)\`.`;
  }

  const verticalConfig = isVertical ? `
- **CẤU HÌNH ĐẶC BIỆT CHO VIDEO DỌC (9:16 - SHORTS / TIKTOK / REELS):**
  * Tỷ lệ khung hình dọc: 1080 x 1920.
  * KHÔNG GIAN NGANG CỰC HẸP: Tuyệt đối không xếp công thức dài theo chiều ngang.
  * Font chữ bắt buộc: Text <= 28, MathTex <= 36.
  * Vùng an toàn (SAFE ZONE): Chừa 15% mép trên (tránh camera/tiêu đề) và 20% mép dưới (tránh caption/nút Like của TikTok/Shorts).
  * Ưu tiên xếp đối tượng dọc: \`.arrange(DOWN, buff=0.35)\`.` : `
- **CẤU HÌNH CHO VIDEO NGANG (16:9 - YOUTUBE / BÀI GIẢNG):**
  * Tỷ lệ khung hình: 1920 x 1080.
  * Không gian thoáng đãng: Text ~ 32-36, MathTex ~ 48-60.
  * Bố cục 2 cột (Cột trái: Đồ thị/Hình học; Cột phải: Lời giải/Công thức).`;

  return `Đóng vai Chuyên gia Lập trình Diễn hoạt Toán học chuyên nghiệp với Manim CE (Python).
Nhiệm vụ của bạn là viết một file mã nguồn Manim Python (\`scene.py\`) hoàn chỉnh, thẩm mỹ, trực quan và chạy được 100% không lỗi.

I. THÔNG TIN VIDEO:
- Môn học / Chủ đề: ${config.subject} / ${config.topic}
- Loại hình diễn hoạt: ${config.mathType || 'Toán học tổng hợp'}
- Định dạng Khung hình: ${isVertical ? 'DỌC 9:16 (TikTok / YouTube Shorts / Reels)' : 'NGANG 16:9 (YouTube / Bài giảng)'}
- Thời lượng kịch bản: ${config.duration}
- Phong cách: ${config.tone} (Hiện đại, thu hút, trực quan)
- Đối tượng khán giả: ${config.audience}
- Chi tiết bổ sung: ${config.details || "Bám sát kiến thức trọng tâm"}

II. QUY TẮC KỸ THUẬT MANIM BẮT BUỘC (TUÂN THỦ 100% ĐỂ KHÔNG CRASH):
1. **Phiên bản & Import:** Hoàn toàn tương thích Manim Community Edition (\`from manim import *\`).
2. **XỬ LÝ TIẾNG VIỆT & TEXT (TỬ HUYỆT MANIM):**
   - TUYỆT ĐỐI KHÔNG viết tiếng Việt có dấu trực tiếp trong \`MathTex\` hay \`Tex\` để tránh lỗi Unicode LaTeX.
   - Mọi văn bản tiếng Việt BẮT BUỘC dùng \`Text("Tiếng Việt có dấu", font_size=..., font="sans-serif")\`.
   - Muốn ghép chữ và công thức: Nhóm \`VGroup(Text("Đạo hàm: "), MathTex(r"f'(x) = 2x")).arrange(RIGHT)\`.
3. **Màu sắc & Phối màu chuẩn Yuta Studio:**
   - Background: Màu tối thanh lịch \`#0F172A\` (Slate 900) hoặc \`#111827\` (Gray 900).
   - Màu nổi bật: Vàng \`YELLOW\` (#FACC15), Xanh dương \`BLUE\` (#38BDF8), Xanh ngọc \`TEAL\` (#2DD4BF), Đỏ cam \`RED_B\` (#F87171).
   - Biến số nhất quán màu qua \`.set_color()\` hoặc \`MathTex(r"y = ax^2 + bx + c", substrings_to_isolate=["x", "y"])\`.
4. **Dọn dẹp màn hình (Clean Transition):**
   - Sau khi hoàn thành một ý/ví dụ, BẮT BUỘC dùng \`self.play(FadeOut(Group_do))\` hoặc \`self.play(*[FadeOut(mob) for mob in self.mobjects])\` để màn hình luôn thoáng sạch.
5. **Nhịp điệu (Pacing):**
   - Chèn các khoảng \`self.wait(1)\`, \`self.wait(1.5)\` giữa các bước giải để người xem kịp quan sát và khớp âm thanh thuyết minh (Voiceover/TTS).
${verticalConfig}
${mathTypeGuide}

III. BỘ KHUNG CODE PYTHON MẪU (BẮT ĐẦU VÀ KẾT THÚC BẰNG MÃ PYTHON HOÀN CHỈNH):
\`\`\`python
from manim import *

class MainScene(${config.mathType === '3d_geometry' ? 'ThreeDScene' : 'Scene'}):
    def construct(self):
        # 1. Thiết lập màu nền
        self.camera.background_color = "#0F172A"
        
        # 2. Tiêu đề intro
        title = Text("${config.topic}", font_size=${isVertical ? '28' : '36'}, color=YELLOW)
        self.play(Write(title), run_time=1)
        self.wait(1)
        self.play(title.animate.to_edge(UP, buff=0.5))
        
        # 3. Nội dung diễn hoạt toán học chính ở đây...
        
        # 4. Outro kết thúc
        self.wait(2)
\`\`\`

IV. HƯỚNG DẪN RENDER ĐI KÈM:
Cuối câu trả lời, hãy kèm theo lệnh render:
\`manim ${qualityFlag} scene.py MainScene\` (hoặc chất lượng cao: \`manim -pqh scene.py MainScene\`).

Trả về TOÀN BỘ mã Python hoàn chỉnh trong markdown codeblock (\`\`\`python ... \`\`\`).`;
};