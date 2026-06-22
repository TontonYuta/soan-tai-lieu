const fs = require('fs');

let content = fs.readFileSync('services/gemini.ts', 'utf8');

const updatedPrompt = `export const generateVideoManimPrompt = (config: VideoConfig): string => {
  return \`Đóng vai: Bạn là một lập trình viên Python lão luyện, chuyên gia về thư viện Manim CE (Manim Community) và là một nhà truyền đạt toán học/khoa học trực quan đầy sáng tạo (như kênh 3Blue1Brown). Nhiệm vụ của bạn là viết mã nguồn Manim để tạo ra một video giảng dạy trực quan, dễ hiểu và đẹp mắt.

I. THÔNG TIN CHUNG:
- Môn học / Chủ đề: \${config.subject} / \${config.topic}
- Đối tượng người xem: \${config.audience}
- Thời lượng dự kiến: \${config.duration}
- Phong cách/Giọng điệu: \${config.tone}
- Định dạng Video: \${config.format === 'vertical' ? 'Dọc (9:16 - TikTok/Shorts)' : 'Ngang (16:9 - YouTube)'}

II. KỊCH BẢN CHI TIẾT (STORYBOARD):
Hãy cấu trúc video thành một \\\`Scene\\\` duy nhất, chia làm các phần sau (sử dụng comment trong code để phân chia):
1. Mở đầu (Intro): Hiển thị tiêu đề bài học, thu hút sự chú ý bằng một hình ảnh/chuyển động ấn tượng.
2. Khái niệm/Vấn đề: Đưa ra định nghĩa, hiển thị công thức bằng màu sắc nổi bật.
3. Trực quan hóa (Phần quan trọng nhất): Minh họa trực quan chi tiết, thay đổi liên tục.
4. Kết luận (Outro): Nhấn mạnh lại công thức cuối cùng, hiển thị logo.

III. YÊU CẦU KỸ THUẬT KHẮT KHE (BẮT BUỘC TUÂN THỦ):
- Phiên bản: Code phải tương thích hoàn toàn với Manim CE mới nhất (\\\`from manim import *\\\`).
- Định dạng: \${config.format === 'vertical' ? 'Vì là video DỌC (9:16), HÃY set \\\`config.pixel_width = 1080\\\` và \\\`config.pixel_height = 1920\\\` HOẶC sử dụng cờ CLI \\\`--resolution 1080,1920\\\`. Sắp xếp bố cục UI theo chiều dọc.' : 'Video ngang (16:9) mặc định.'}
- Cấu trúc code: Sử dụng \\\`VGroup\\\` để nhóm các đối tượng logic lại với nhau. Căn chỉnh vị trí gọn gàng bằng \\\`.arrange()\\\`, \\\`.next_to()\\\`, hoặc \\\`.move_to()\\\`.
- Xử lý tiếng Việt (Quan trọng):
  * TUYỆT ĐỐI KHÔNG dùng tiếng Việt có dấu trực tiếp bên trong \\\`MathTex\\\` hoặc \\\`Tex\\\` để tránh lỗi biên dịch LaTeX (Unicode error).
  * Với công thức toán học: Chỉ dùng ký hiệu toán học thuần túy trong \\\`MathTex\\\`.
  * Với văn bản diễn giải tiếng Việt: BẮT BUỘC dùng class \\\`Text("Nội dung tiếng Việt")\\\`. Nếu cần kết hợp chữ và công thức, hãy tạo các đối tượng \\\`Text\\\` và \\\`MathTex\\\` riêng biệt rồi dùng \\\`VGroup\\\` để ghép chúng lại theo chiều ngang.
- Màu sắc & Hiệu ứng: Tô màu các biến số trong công thức (ví dụ: biến $x$ màu Vàng, biến $y$ màu Đỏ) để người xem dễ theo dõi. Sử dụng đa dạng hiệu ứng như \\\`Write\\\`, \\\`Create\\\`, \\\`FadeIn\\\`, \\\`Transform\\\`, \\\`TransformFromCopy\\\` thay vì chỉ cho xuất hiện đột ngột.
- Thời gian: Chèn các khoảng \\\`self.wait(...)\\\` hợp lý để người xem kịp đọc và giáo viên kịp lồng tiếng.

IV. CẤU TRÚC CODE THAM KHẢO (NÊN BÁM SÁT NẾU PHÙ HỢP):
\\\`\\\`\\\`python
from manim import *

class ManimTemplate(Scene):
    def construct(self):
        # ==========================================
        # [CẤU HÌNH BÀI HỌC] - CHỈ CẦN SỬA Ở ĐÂY
        # ==========================================
        BUOI_HOC = "Buổi X - Toán Lớp 7"
        TEN_BAI = "TÊN BÀI HỌC MỚI"
        KY_HIEU = r"\\mathbb{Q}" # Hoặc x, y, Z, N...
        
        # ==========================================
        # 1. MỞ ĐẦU (INTRO) - FORM CỐ ĐỊNH 100%
        # ==========================================
        session_text = Text(BUOI_HOC, font_size=32, color=LIGHT_GRAY)
        title = Text(TEN_BAI, font_size=44, weight=BOLD, color=YELLOW)
        symbol_main = MathTex(KY_HIEU, font_size=120, color=BLUE)
        
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
        # TODO: Sửa tiêu đề lý thuyết
        th_title = Text("Lý thuyết: [Tên Khái Niệm]", font_size=32, color=BLUE).to_edge(UP, buff=0.4)
        th_sub = Text("Mẹo: [Ghi nhớ cốt lõi]", font_size=28, color=RED).next_to(th_title, DOWN, buff=0.3)
        self.play(FadeIn(th_title), FadeIn(th_sub))
        
        # TODO: Sửa nội dung lý thuyết
        t_th_1 = Text("Công thức:", font_size=28)
        m_th_1 = MathTex(r"A = B + C", font_size=40, color=YELLOW)
        g_th_1 = VGroup(t_th_1, m_th_1).arrange(RIGHT, buff=0.5)
        
        th_group = VGroup(g_th_1).arrange(DOWN, buff=0.8).move_to(ORIGIN).shift(DOWN * 0.3)
        
        self.play(FadeIn(g_th_1, shift=UP))
        self.wait(2)
        self.play(FadeOut(th_group), FadeOut(th_title), FadeOut(th_sub))

        # ==========================================
        # 3. DẠNG BÀI 1 (COPY BLOCK NÀY NẾU CÓ NHIỀU DẠNG)
        # ==========================================
        # TODO: Sửa tên dạng bài
        d1_title = Text("Dạng 1: [Tên Dạng Bài]", font_size=32, color=BLUE).to_edge(UP, buff=0.4)
        d1_sub = Text("Phương pháp: [Cách giải]", font_size=28, color=YELLOW).next_to(d1_title, DOWN, buff=0.3)
        self.play(FadeIn(d1_title), FadeIn(d1_sub))
        
        # Dòng 1: Đề bài
        t_d1_1 = Text("Đề bài:", font_size=28)
        m_d1_1 = MathTex(r"1 + 1", font_size=40)
        g_d1_1 = VGroup(t_d1_1, m_d1_1).arrange(RIGHT, buff=0.5)
        
        # Dòng 2: Bước giải
        t_d1_2 = Text("Phân tích:", font_size=28)
        m_d1_2 = MathTex(r"= 2", font_size=40, color=YELLOW)
        g_d1_2 = VGroup(t_d1_2, m_d1_2).arrange(RIGHT, buff=0.5)
        
        # Dòng 3: Kết quả
        t_d1_3 = Text("Kết quả:", font_size=28)
        m_d1_3 = MathTex(r"= 2", font_size=40, color=GREEN)
        g_d1_3 = VGroup(t_d1_3, m_d1_3).arrange(RIGHT, buff=0.5)
        
        d1_group = VGroup(g_d1_1, g_d1_2, g_d1_3).arrange(DOWN, buff=0.8).move_to(ORIGIN).shift(DOWN * 0.5)
        
        self.play(FadeIn(g_d1_1, shift=UP))
        self.wait(1)
        self.play(FadeIn(g_d1_2, shift=UP))
        self.wait(1)
        self.play(FadeIn(g_d1_3, shift=UP))
        self.wait(2.5)
        
        self.play(FadeOut(d1_group), FadeOut(d1_title), FadeOut(d1_sub))

        # Cuối cùng, xóa Logo trên góc
        self.play(FadeOut(symbol_main))

        # ==========================================
        # 4. KẾT LUẬN (OUTRO) - FORM CỐ ĐỊNH 100%
        # ==========================================
        outro_msg = Text("Nhớ vững quy tắc - Toán 7 cực dễ!", font_size=32, color=WHITE)
        outro_symbol = MathTex(KY_HIEU, font_size=120, color=BLUE)
        
        glow_circle = Circle(radius=1.5, color=BLUE_C, fill_opacity=0.2).set_stroke(width=0)
        q_group = VGroup(glow_circle, outro_symbol)
        
        channel_brand = Text("Học toán cùng Yuta", font_size=40, weight=BOLD, color=RED)
        
        outro_group = VGroup(outro_msg, q_group, channel_brand).arrange(DOWN, buff=0.8)
        
        self.play(Write(outro_msg))
        self.wait(0.5)
        self.play(GrowFromCenter(glow_circle), Write(outro_symbol))
        self.play(glow_circle.animate.set_opacity(0.4).scale(1.2), rate_func=there_and_back, run_time=1.5)
        self.wait(0.5)
        self.play(FadeIn(channel_brand, shift=UP))
        self.wait(3)
        
        self.play(FadeOut(Group(*self.mobjects)))
\\\`\\\`\\\`

V. ĐỊNH DẠNG ĐẦU RA:
- Chỉ xuất ra một khối mã (code block) Python duy nhất chứa toàn bộ mã nguồn.
- Chú thích tiếng Việt rõ ràng từng bước trong code.
- Thêm lời khuyên bằng lệnh CLI để render video ở độ phân giải 1080p, 60fps (có sử dụng cờ \\\`--flush_cache\\\`).\`;
};`;

content = content.replace(/export const generateVideoManimPrompt = \(config: VideoConfig\): string => {([\s\S]*?)};/g, updatedPrompt);

fs.writeFileSync('services/gemini.ts', content);
