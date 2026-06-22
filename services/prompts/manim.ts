import { VideoConfig } from "../../types";

export const generateVideoManimPrompt = (config: VideoConfig): string => {
  const isVertical = config.format === 'vertical';

  return `Đóng vai: Bạn là một lập trình viên Python lão luyện, chuyên gia phân tích sư phạm, bậc thầy về thư viện Manim CE (Manim Community) và là một nhà truyền đạt toán học/khoa học trực quan đầy sáng tạo (như kênh 3Blue1Brown). 
Nhiệm vụ của bạn là viết mã nguồn Manim để tạo ra một video giảng dạy trực quan, dễ hiểu, có tính thẩm mỹ cao và đồng bộ với thương hiệu.

I. THÔNG TIN CHUNG:
- Môn học / Chủ đề: ${config.subject} / ${config.topic}
- Nội dung chi tiết/Yêu cầu thêm (nếu có): ${config.details || 'Tự động phân tích chủ đề và đưa ra 3-4 dạng bài tập/ví dụ thực tế bám sát SGK mới.'}
- Đối tượng người xem: ${config.audience}
- Thời lượng dự kiến: ${config.duration}
- Phong cách/Giọng điệu: ${config.tone}
- Định dạng Video: ${isVertical ? 'DỌC (9:16 - TikTok/Shorts)' : 'NGANG (16:9 - YouTube)'}

II. KỊCH BẢN CHI TIẾT (STORYBOARD):
Cấu trúc video thành một \`Scene\` duy nhất, bám sát bộ khung (Form) cố định sau:
1. Mở đầu (Intro): Hiển thị Tên buổi học, Tiêu đề bài học và Ký hiệu toán học đặc trưng. Thu nhỏ làm Logo.
2. Lý thuyết / Khái niệm: Đưa ra định nghĩa ngắn gọn, công thức tô màu nổi bật, đóng khung hoặc trỏ mũi tên trực quan.
3. Các Dạng Bài Tập (Quan trọng nhất): Tự động sinh ra ít nhất 3 dạng bài tập hoặc ví dụ trọng tâm của chủ đề này. Giải chi tiết từng bước (Step-by-step) bằng hiệu ứng Transform hoặc lướt vào (FadeIn).
4. Kết luận (Outro): Nhấn mạnh câu thần chú ghi nhớ, hiển thị logo kênh "Học toán cùng Yuta".

III. YÊU CẦU KỸ THUẬT KHẮT KHE (BẮT BUỘC TUÂN THỦ 100%):
- Phiên bản: Tương thích hoàn toàn Manim CE mới nhất (\`from manim import *\`).
- Xử lý không gian định dạng (${isVertical ? 'DỌC' : 'NGANG'}): 
  * ${isVertical ? 'VÌ LÀ VIDEO DỌC, CHIỀU NGANG RẤT HẸP! Tuyệt đối không xếp các công thức quá dài theo chiều ngang. BẮT BUỘC dùng `font_size` nhỏ hơn (Text <= 32, MathTex <= 44). Sử dụng `.arrange(DOWN)` nhiều hơn `.arrange(RIGHT)`. Nếu công thức dài, phải ngắt dòng (newline) hoặc chia nhỏ khối.' : 'Video ngang (16:9) không gian rộng rãi, ưu tiên font chữ to, rõ ràng (Text ~ 32-36, MathTex ~ 48-60).'}
- Cấu trúc code & Bố cục: 
  * Sử dụng \`VGroup\` để nhóm các đối tượng logic. Định vị gọn gàng bằng \`.next_to()\`, \`.move_to()\`. 
  * Sau khi xong một dạng bài, BẮT BUỘC dùng \`self.play(FadeOut(Group_đó))\` để dọn sạch màn hình cho phần tiếp theo.
- Xử lý tiếng Việt (TỬ HUYỆT - QUAN TRỌNG NHẤT):
  * TUYỆT ĐỐI KHÔNG dùng tiếng Việt có dấu trực tiếp bên trong \`MathTex\` hoặc \`Tex\` để tránh lỗi Unicode LaTeX.
  * Văn bản tiếng Việt BẮT BUỘC dùng \`Text("Tiếng Việt", font_size=...)\`. 
  * Muốn ghép chữ và công thức: Nhóm \`VGroup(Text(...), MathTex(...)).arrange(RIGHT)\`.
- Màu sắc & Hiệu ứng: 
  * Tô màu biến số nhất quán (VD: x luôn Xanh, y luôn Đỏ) bằng \`.set_color()\` hoặc \`.set_color_by_tex()\`. 
  * Hiệu ứng xuất hiện phải mượt: \`Write\`, \`FadeIn(..., shift=UP)\`, \`Transform\`, tránh đột ngột.
- Nhịp độ (Pacing): Chèn \`self.wait(1)\`, \`self.wait(2)\` hợp lý giữa các bước giải để giáo viên khớp Voiceover (TTS).

IV. BỘ KHUNG CODE MẪU (BOILERPLATE TEMPLATE):
Hãy sử dụng chính xác bộ khung dưới đây, chỉ THAY ĐỔI / ĐIỀN VÀO những phần được yêu cầu:

\`\`\`python
from manim import *

# Cấu hình render cho Video ${isVertical ? 'DỌC' : 'NGANG'}
${isVertical ? 'config.pixel_width = 1080\nconfig.pixel_height = 1920\nconfig.frame_width = 9\nconfig.frame_height = 16' : '# Sử dụng mặc định 16:9 của Manim'}

class MainLesson(Scene):
    def construct(self):
        # ==========================================
        # [THÔNG TIN BÀI HỌC] - CẬP NHẬT THEO CHỦ ĐỀ
        # ==========================================
        BUOI_HOC = "Chủ đề: ${config.subject}"
        TEN_BAI = "${config.topic}".upper()
        KY_HIEU = r"\\star" # <--- Đổi thành ký hiệu toán học đại diện cho bài học (VD: \\mathbb{R}, \\Delta, x, \\int)
        
        # ==========================================
        # 1. MỞ ĐẦU (INTRO) - KHÔNG ĐỔI CẤU TRÚC
        # ==========================================
        session_text = Text(BUOI_HOC, font_size=${isVertical ? '28' : '32'}, color=LIGHT_GRAY)
        title = Text(TEN_BAI, font_size=${isVertical ? '36' : '48'}, weight=BOLD, color=YELLOW)
        symbol_main = MathTex(KY_HIEU, font_size=${isVertical ? '100' : '120'}, color=BLUE)
        
        title_box = SurroundingRectangle(title, buff=0.4, color=BLUE_D, corner_radius=0.2)
        title_group = VGroup(title, title_box)
        intro_group = VGroup(session_text, title_group, symbol_main).arrange(DOWN, buff=0.6)
        
        self.play(FadeIn(session_text, shift=DOWN))
        self.play(Write(title), Create(title_box), run_time=1.5)
        self.play(FadeIn(symbol_main, scale=0.3), run_time=1)
        self.wait(1.5)
        
        self.play(
            FadeOut(session_text, shift=UP),
            FadeOut(title_group, scale=0.8),
            symbol_main.animate.scale(0.3).to_corner(UL)
        )
        self.wait(0.5)

        # ==========================================
        # 2. LÝ THUYẾT / KHÁI NIỆM TRỌNG TÂM
        # ==========================================
        # TỰ ĐỘNG TẠO NỘI DUNG LÝ THUYẾT TRỰC QUAN Ở ĐÂY
        # (Lưu ý: Luôn dùng self.play(FadeOut(...)) ở cuối phần)
        

        # ==========================================
        # 3. CÁC DẠNG BÀI TẬP (DẠNG 1, DẠNG 2, DẠNG 3...)
        # ==========================================
        # TỰ ĐỘNG PHÂN TÍCH VÀ TẠO RA ÍT NHẤT 3 DẠNG BÀI TẬP LIÊN QUAN ĐẾN CHỦ ĐỀ.
        # Dùng form chung cho mỗi dạng: 
        # - Tiêu đề dạng
        # - Đề bài (Ví dụ)
        # - Các bước giải (Step 1, Step 2...)
        # - Kết quả (Màu Xanh lá)
        # (Lưu ý: Luôn dùng self.play(FadeOut(...)) ở cuối mỗi dạng bài)
        

        # Cuối cùng, xóa Logo trên góc để nhường chỗ cho Outro
        self.play(FadeOut(symbol_main))

        # ==========================================
        # 4. KẾT LUẬN (OUTRO) - KHÔNG ĐỔI CẤU TRÚC
        # ==========================================
        outro_msg = Text("Nhớ vững quy tắc - Toán học cực dễ!", font_size=${isVertical ? '28' : '32'}, color=WHITE)
        outro_symbol = MathTex(KY_HIEU, font_size=120, color=BLUE)
        
        glow_circle = Circle(radius=1.5, color=BLUE_C, fill_opacity=0.2).set_stroke(width=0)
        q_group = VGroup(glow_circle, outro_symbol)
        
        channel_brand = Text("Học toán cùng Yuta", font_size=${isVertical ? '32' : '40'}, weight=BOLD, color=RED)
        
        outro_group = VGroup(outro_msg, q_group, channel_brand).arrange(DOWN, buff=0.8)
        
        self.play(Write(outro_msg))
        self.wait(0.5)
        self.play(GrowFromCenter(glow_circle), Write(outro_symbol))
        self.play(glow_circle.animate.set_opacity(0.4).scale(1.2), rate_func=there_and_back, run_time=1.5)
        self.wait(0.5)
        self.play(FadeIn(channel_brand, shift=UP))
        self.wait(3)
        
        self.play(FadeOut(Group(*self.mobjects)))
\`\`\`

V. ĐỊNH DẠNG ĐẦU RA:
- CHỈ xuất ra một khối mã (code block) Python duy nhất chứa toàn bộ mã nguồn. Không giải thích lằng nhằng.
- Thêm lời khuyên bằng lệnh CLI ở cuối để render video (có sử dụng cờ \`--flush_cache\`). Lệnh CLI phải phù hợp với định dạng ${isVertical ? 'dọc (sử dụng thêm cờ `--resolution 1920,1080` do Manim đảo ngược W/H)' : 'ngang'}.`;
};
