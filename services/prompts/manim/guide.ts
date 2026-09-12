export const MANIM_SKILLS_GUIDE = `
★★★ BỘ NGUYÊN TẮC MANIM CE TOÁN HỌC & VISUAL ENGINEERING CHUẨN STUDIO ★★★
(Kế thừa Cấu trúc 5 Phân Cảnh Chuẩn Mực từ c1_HamSo_DonDieu.py & c1_HamSo_CucTri.py, Hệ Thống Khung Thẻ Container Dual-Zone,
 Mô Phỏng Động ValueTracker + Tiếp Tuyến Đổi Màu, Bắt Điểm Cực Trị Real-time, Bảng Biến Thiên 3 Tầng & Chống Đè Chữ Tuyệt Đối)

1. CẤU TRÚC PHÂN CẢNH CHUẨN MỰC (ADAPTIVE CINEMATIC FLOW, TỪ 60S ĐẾN 300S):
   - Mọi video bài giảng toán học chuẩn studio BẮT BUỘC chia thành 5 chương mạch lạc, co giãn linh hoạt theo thời lượng mục tiêu:
     * CHƯƠNG 1 - MỞ ĐẦU ẤN TƯỢNG (Intro, 7s - 20s):
       Pill Badge tên chuyên đề + Khung bao tiêu đề SurroundingRectangle + Phụ đề + Xem trước các công thức cốt lõi (intro_core_rule).
        NGUYÊN TẮC CÔNG THỨC INTRO (SINGLE-LINE FORMULA - CHỐNG VỠ 2 DÒNG TUYỆT ĐỐI):
        Mỗi định lý / công thức cốt lõi BẮT BUỘC nằm trọn vẹn trên ĐÚNG 1 DÒNG ĐƠN trong 1 MathTex duy nhất:
        - GTLN & GTNN (Max / Min):
          MathTex(r"M = \\max_{[a; b]} f(x) \\iff f(x) \\le M \\quad \\text{và} \\quad \\exists x_0 \\in [a; b]: f(x_0) = M", font_size=23, color=GREEN_B),
          MathTex(r"m = \\min_{[a; b]} f(x) \\iff f(x) \\ge m \\quad \\text{và} \\quad \\exists x_0 \\in [a; b]: f(x_0) = m", font_size=23, color=RED_B)
        - Đơn điệu:
          MathTex(r"y' > 0 \\;\\Longrightarrow\\; \\text{Đồng biến } (\\nearrow)", font_size=26, color=GREEN_B),
          MathTex(r"y' < 0 \\;\\Longrightarrow\\; \\text{Nghịch biến } (\\searrow)", font_size=26, color=RED_B)
        - Cực trị:
          MathTex(r"x_0 \\quad : \\text{Điểm cực trị của hàm số}", font_size=25, color=TEAL_B),
          MathTex(r"y_0 = f(x_0) \\quad : \\text{Giá trị cực trị (Cực trị)}", font_size=25, color=YELLOW_B),
          MathTex(r"M(x_0; y_0) \\quad : \\text{Điểm cực trị của ĐỒ THỊ}", font_size=25, color=GREEN_B)
        TUYỆT ĐỐI CẤM:
        1. CẤM ngắt dòng bằng "\\\\" bên trong MathTex khiến chữ bị tách rời thành 2 tầng / 2x2.
        2. CẤM tách một định nghĩa thành 2 MathTex riêng biệt (như 1 MathTex cho f(x)<=M rồi MathTex thứ 2 cho "và tồn tại x0" làm rớt dòng cụt lủn dù chỗ trống còn nhiều).
        Luôn gọi fit_width(intro_core_rule, 7.6) sau arrange(DOWN, buff=0.22).
       Chuyển cảnh: FadeOut toàn bộ Intro để tránh đè chữ. TUYỆT ĐỐI KHÔNG đưa biểu tượng lên góc UL làm watermark!
     * CHƯƠNG 2 - LÝ THUYẾT CỐT LÕI VỚI CẶP THẺ MÀU TƯƠNG PHẢN (Theory Cards, 14s - 50s):
       Header đỉnh + Các Thẻ màu độc lập xếp dọc (Card 1 Xanh Emerald #064E3B cho tính chất khẳng định/đồng biến/cực đại;
       Card 2 Đỏ Ruby #7F1D1D cho tính chất phủ định/nghịch biến/cực tiểu, height=4.0-4.2 mỗi thẻ, width=8.4).
       Với video dài (>=180s - 300s), bổ sung thêm thẻ Vàng/Tím làm rõ các trường hợp đặc biệt và lưu ý bẫy đề thi. FadeOut toàn bộ.
     * CHƯƠNG 3 - DUAL-ZONE CONTAINER MÔ PHỎNG ĐỘNG TƯƠNG TÁC (Visual Simulation, 35s - 75s):
       - Header Bar cố định (height=1.1-1.3, width=8.4) với Text trơn trực tiếp ("Ví dụ minh họa: ...", TUYỆT ĐỐI KHÔNG CẦN BOX bọc chữ để chống tràn viền).
       - Top Card (height=6.4, width=8.4): Đồ thị Axes (x_length=7.2, y_length=4.0), đường cong axes.plot, cực trị gióng nét đứt có màu phân biệt (axes.get_lines_to_point(pt).set_color(...)).
         TIẾP TUYẾN CHUYỂN ĐỘNG CHUẨN HÓA ĐỘ DÀI VỚI ValueTracker + always_redraw: Tiếp tuyến tự động đổi màu theo hệ số góc (GREEN khi dốc lên, RED khi dốc xuống, YELLOW khi đi ngang), độ dài cố định trên màn hình L=0.85 (tổng chiều dài 1.7 unit), TUYỆT ĐỐI KHÔNG cắt ra ngoài viền thẻ!
         + THANH TRẠNG THÁI REAL-TIME THÔNG MINH (status_badge = always_redraw(...)): Tự động "bắt" điểm cực trị khi lân cận x_0 (abs(t - x_cđ) < 0.16 ➜ "x = ... ➜ CỰC ĐẠI: y = ...", nền xanh #064E3B; abs(t - x_ct) < 0.16 ➜ "x = ... ➜ CỰC TIỂU: y = ...", nền đỏ #7F1D1D); ngoài vùng cực trị hiển thị chiều biến thiên y' > 0 / y' < 0!
       - Bottom Card (height=6.6, width=8.4): Đạo hàm + BẢNG BIẾN THIÊN 3 TẦNG LATEX CHUẨN SGK (\\begin{array}{|c|ccccccc|})
         + Kết luận phân biệt rõ ràng (khoảng đơn điệu hoặc 3 khái niệm cực trị: điểm cực trị x, giá trị cực trị y, điểm cực trị đồ thị M) đóng khung xanh SurroundingRectangle.
       - Cho ValueTracker trượt mượt mà qua các khoảng để học sinh quan sát đồ thị và BBT đồng thời. FadeOut toàn bộ.
     * CHƯƠNG 4 - BÀI TẬP VẬN DỤNG & CHỮA ĐỀ THỰC CHIẾN (Practice Section, 38s - 160s+):
       - Header Bar với Text trơn trực tiếp ("⚡ Thực chiến: Chữa đề thi THPT", TUYỆT ĐỐI KHÔNG CẦN BOX bọc chữ để chống tràn viền).
       - QUY TẮC BẢO VỆ ZERO-OVERLAP TUYỆT ĐỐI (HỖ TRỢ TỪ 2 ĐẾN 6+ CÂU HỎI):
         + Video ngắn (<= 90s): 1 Dạng bài (2 câu tiêu biểu: Top Card = Câu 1 Đọc BBT có Mini BBT; Bottom Card = Câu 2 Đại số / Bẫy nghiệm bội chẵn).
         + Video chuẩn (100s - 180s): 2 Dạng bài (3 - 4 câu tiêu biểu):
           • Dạng 1: Top Card = Câu 1, Bottom Card = Câu 2 -> self.play(FadeOut(part1_group)) dọn sạch màn hình!
           • Dạng 2: Top Card = Câu 3, Bottom Card = Câu 4 -> self.play(FadeOut(part2_group)) dọn sạch màn hình!
         + Video dài chuyên sâu (200s - 300s+): 3 Dạng bài (5 - 6 câu tiêu biểu):
           • Dạng 1 (Nhận biết & Thông hiểu): Câu 1 & Câu 2 -> FadeOut dọn sạch màn hình!
           • Dạng 2 (Vận dụng & Phân tích bẫy đề thi): Câu 3 & Câu 4 -> FadeOut dọn sạch màn hình!
           • Dạng 3 (Vận dụng cao & Phương pháp giải nhanh): Câu 5 & Câu 6 -> FadeOut dọn sạch màn hình!
       - NGUYÊN TẮC BẤT DI BẤT DỊCH: Mỗi màn hình chỉ hiển thị ĐÚNG 2 CÂU trên 2 thẻ (Top Card = Câu lẻ, Bottom Card = Câu chẵn). Khi giải xong mỗi dạng, BẮT BUỘC FadeOut toàn bộ để giải phóng 100% không gian trước khi chuyển sang dạng tiếp theo. Tuyệt đối không bao giờ để nhiều hơn 2 câu trên màn hình cùng một lúc!
     * CHƯƠNG 5 - TỔNG KẾT & OUTRO THƯƠNG HIỆU (Outro Card, 8s - 22s):
       - Thẻ Outro toàn màn hình (height=13.6, width=8.4) với 3 bí kíp đúc kết bài học.
       - Diễn hoạt xuất hiện 3 bí kíp tuần tự mượt mà bằng LaggedStart(FadeIn(b_p1, shift=LEFT*0.2), FadeIn(b_p2, shift=LEFT*0.2), FadeIn(b_p3, shift=LEFT*0.2), lag_ratio=0.3).
       - Badge thương hiệu đỏ rực rỡ "Học toán cùng Yuta" + Kêu gọi follow xuất hiện nhẹ nhàng với FadeIn(brand_group, scale=0.85).
       - KẾT THÚC BẰNG self.wait(2.5 - 3.0) ĐỂ GIỮ NGUYÊN MÀN HÌNH OUTRO. TUYỆT ĐỐI KHÔNG FadeOut làm đen màn hình!

2. SỰ SÁNG TẠO & PHÓNG KHOÁNG BỐ CỤC TRONG GIỚI HẠN HÌNH HỌC AN TOÀN:
   - Được quyền sáng tạo phong phú về phối màu: Nền chính tối (#0B1120), Thẻ Slate (#0F172A, #1E293B),
     Thẻ Xanh Emerald (#064E3B), Thẻ Đỏ Ruby (#7F1D1D), Thẻ Hổ Phách (#78350F), Điểm nhấn Vàng (#EAB308).
   - Được quyền sử dụng đa dạng các dạng thẻ: Thẻ đơn toàn màn hình, 2 thẻ xếp dọc (Stacked Cards),
     2 vùng song song (Dual-Zone), Huy hiệu bo tròn (Pill Badges), Hộp chỉ dẫn (Callout Boxes).
   - NGUYÊN TẮC BẢO VỆ BẤT DI BẤT DỊCH: BẮT BUỘC dùng hàm fit_width(group, 7.8) cho mọi khối nội dung bên trong thẻ để chống tràn viền.

3. NGUYÊN TẮC ZERO-OVERLAP & NGÂN SÁCH TỌA ĐỘ 9:16 (1080x1920):
   - Màn hình dọc cao 16.0 đơn vị (Y từ -8.0 đến +8.0), rộng 9.0 đơn vị (X từ -4.5 đến +4.5).
   - Header Bar: to_edge(UP, buff=0.35), height=1.1-1.3, width=8.4-8.5.
   - Top Card: next_to(header_card, DOWN, buff=0.2), height=6.4, width=8.4.
     * Giới hạn Axes: x_length=7.0-7.2, y_length=3.8-4.0. KHÔNG vượt quá 4.0 vì sẽ đè lên tiêu đề thẻ hoặc nhãn cực trị!
   - Bottom Card: next_to(top_card, DOWN, buff=0.2), height=6.6, width=8.4.
   - Khi chuyển giữa các chương: BẮT BUỘC FadeOut toàn bộ các đối tượng cũ trước khi tạo chương mới.

4. QUY CHUẨN TYPOGRAPHY & PHÂN CẤP KÍCH THƯỚC CHỮ (GOLDEN SIZE HIERARCHY):
   - Font chữ Tiếng Việt: MẶC ĐỊNH sử dụng font chữ có chân (Serif) trang trọng, chuẩn mực sách giáo khoa và các tạp chí toán học: "Times New Roman" (hoặc "Liberation Serif").
   - Nếu người dùng chỉ định font không chân (Sans-Serif): Sử dụng "Be Vietnam Pro" (hoặc "Inter").
   - PHÂN CẤP KÍCH THƯỚC CHỮ CHUẨN MỰC (CẤM DÙNG font_size DƯỚI 22, CẤM TIÊU ĐỀ THẺ VƯỢT QUÁ 22):
     * Tiêu đề chính Intro / Outro: font_size=28 đến 32 (weight=BOLD, Sentence case, màu YELLOW). CẤM vượt quá 32!
     * Tiêu đề Header Bar: font_size=22 đến 24 (weight=BOLD, màu YELLOW).
     * Tiêu đề Thẻ Card (top_title, bot_title, c1_title, c2_title): font_size=20 đến 22 (weight=BOLD, TEAL_A hoặc YELLOW). CẤM TUYỆT ĐỐI font_size > 22 cho tiêu đề thẻ bên trong card!
     * Công thức MathTex chính: font_size=24 đến 28 (Công thức toán BẮT BUỘC to rõ, nổi bật, dễ đọc trên điện thoại).
     * Văn bản tiếng Việt diễn giải / đề bài: font_size=22 (chuẩn mực, không to không nhỏ). CẤM font_size < 22!
     * Bảng biến thiên LaTeX: font_size=22 đến 24 (arraystretch=1.25 - 1.3).
     * Nhãn trục tọa độ Oxy (x, y) & nhãn cực trị: font_size=22 đến 24.
     * Dòng kết luận bài toán: Text font_size=22, nhãn khoanh đáp án font_size=24. CẤM font_size > 24 cho kết luận!
   - Mọi Text nhiều dòng BẮT BUỘC set line_spacing=1.2.

5. BẢNG BIẾN THIÊN CHUẨN MỰC SGK VIỆT NAM (LATEX ARRAY 3 TẦNG):
   - BẮT BUỘC dùng mảng LaTeX array chuẩn mực:
     MathTex(r"""\\renewcommand{\\arraystretch}{1.35}
     \\begin{array}{|c|ccccccc|}
     \\hline
     x & -\\infty & & -1 & & 1 & & +\\infty \\\\
     \\hline
     y' & & + & 0 & - & 0 & + & \\\\
     \\hline
     & & & 2 & & & & +\\infty \\\\
     y & & \\nearrow & & \\searrow & & \\nearrow & \\\\
     & -\\infty & & & & -2 & & \\\\
     \\hline
     \\end{array}""", font_size=24)

6. 100% CÔNG THỨC LATEX & CHỈ SỐ TRÊN/DƯỚI CHUẨN XÁC (SUPERSCRIPT & SUBSCRIPT):
   - 100% chỉ số trên (số mũ x^2, x^3, e^{2x}) và chỉ số dưới (x_0, x_1, y_0, \\Delta_x) hoặc đạo hàm (y', f''(x)) BẮT BUỘC dùng MathTex(r"...") với raw string r"...".
   - TUYỆT ĐỐI CẤM sử dụng ký tự unicode (như x², x³, x₁, x₀, y') bên trong Text("..."). Pango/Cairo trên Linux/Windows sẽ bị lỗi font, vỡ glyph ô vuông hoặc lệch dòng.
   - Khi kết hợp tiếng Việt và công thức toán: BẮT BUỘC tách thành Text và MathTex rồi ghép bằng VGroup:
     VGroup(Text("Hàm số:", font=MAIN_FONT, font_size=22), MathTex(r"y = x^3 - 3x^2", font_size=24)).arrange(RIGHT, buff=0.15)
   - Đóng khung nổi bật đáp số / kết luận: SurroundingRectangle(conclusion, color=GREEN, buff=0.16, corner_radius=0.12, stroke_width=2.5).

7. QUY TẮC NHỊP ĐỘ DIỄN HOẠT (PACING VỪA PHẢI, MƯỢT MÀ, KHÔNG ĐỂ KHOẢNG CHỜ QUÁ LÂU):
   - Nhịp điệu diễn hoạt phải sinh động, dứt khoát và liên tục (Snappy & Engaging), TUYỆT ĐỐI KHÔNG dừng chết video quá lâu (>1.2s - 1.5s) gây cảm giác màn hình bị đơ hoặc kéo dài lê thê:
     * Chuyển cảnh / Xuất hiện nội dung thông thường: Dừng nhẹ self.wait(0.5) đến self.wait(0.8).
     * Khi tiếp tuyến chuyển động chạm cực trị (y' = 0 đổi màu vàng / đi ngang): Dừng vừa vặn self.wait(0.8) đến self.wait(1.0) để người xem kịp nhận biết.
     * Khi bảng biến thiên 3 tầng xuất hiện: Dừng self.wait(0.8) đến self.wait(1.0).
     * Khi đóng khung hộp kết luận hoặc đáp án đúng: Dừng self.wait(1.0) đến self.wait(1.2).
   - Diễn hoạt ValueTracker tiếp tuyến: Dùng rate_func=smooth với thời lượng run_time=2.0s đến 2.5s để tiếp tuyến lướt mượt mà, không bị chậm chạp lê thê.

8. BẢN ĐỒ CHIẾN LƯỢC TRỰC QUAN ĐA MÔN (MULTI-SUBJECT VISUAL BLUEPRINT):
   - Toán học: Đồ thị hàm số, tiếp tuyến trượt đổi màu ValueTracker, Bảng biến thiên 3 tầng, Hình học không gian gióng nét đứt.
   - Vật lý: Quỹ đạo chuyển động, dao động điều hòa axes.plot(lambda t: np.sin(t)), sơ đồ mạch điện, vector lực, đường sức từ trường. Khung thẻ dưới hiển thị công thức định luật và các bước thay số.
   - Hóa học: Mô hình nguyên tử/phân tử, phương trình phản ứng hóa học cân bằng có mũi tên trạng thái/nhiệt độ, bảng biến thiên nồng độ/pH theo thời gian.
   - Sinh học: Sơ đồ lai Menđen (bảng Punnett), sơ đồ phân bào nguyên phân/giảm phân, chuỗi xoắn kép ADN/ARN tách mạch, lưới thức ăn sinh thái.
   - Tiếng Anh / Ngoại ngữ: Thẻ từ vựng trực quan (Pill Badge từ loại, phiên âm IPA, câu ví dụ), sơ đồ trục thời gian các thì (Tenses Timeline), cấu trúc ngữ pháp then chốt.
   - Tin học / Thuật toán: Trực quan hóa mảng (Array bars đổi màu), duyệt cây nhị phân (Binary Tree), các bước thuật toán sắp xếp/tìm kiếm, đồ thị độ phức tạp thời gian O(1) đến O(n^2).
   - Lịch sử / Địa lý / GDCD: Trục thời gian tiến trình sự kiện (Chronological Timeline), sơ đồ tư duy nguyên nhân - hệ quả, biểu đồ cột/tròn đối chiếu số liệu.

9. QUY TẮC VĂN PHONG SƯ PHẠM (LOẠI BỎ TỪ NGỮ AI HÓA):
   - Tuyệt đối KHÔNG sử dụng các từ ngữ giật gân, sáo rỗng hay cường điệu phong cách AI. Sử dụng các thuật ngữ sư phạm chuẩn mực, trong sáng: "định lý cốt lõi", "quy tắc trọng tâm", "phương pháp giải", "lưu ý quan trọng", "kết luận ghi nhớ".
   - Mọi khái niệm, lý thuyết, công thức phải được đối chiếu và bám sát chính xác tài liệu PDF đính kèm (RAG).

10. QUY TẮC ĐỒNG BỘ THỜI GIAN ÂM THANH (TTS) & HOẠT HỌA MANIM (TTS-ANIMATION SYNC, TỪ 60S ĐẾN 300S):
    - Tốc độ đọc tự nhiên của giọng đọc AI: ~2.8 - 3.0 từ/giây (160 - 180 từ/phút).
    - Dung lượng kịch bản VOICEOVER_SCRIPT phải tương ứng: Số từ ≈ Thời lượng (giây) × 2.85.
      * Video 60s: ~170 từ.
      * Video 90s: ~255 từ.
      * Video 120s: ~340 từ.
      * Video 180s: ~510 từ.
      * Video 300s (5 Phút Chuyên Sâu): ~855 từ (Đầy đủ mở bài, phân tích lý thuyết, mô phỏng chuyên sâu và các dạng bài thực chiến giải 6+ bài tập).
    - Khớp nối phân cảnh chuẩn mực (Animation Duration ≈ Voiceover Duration):
      * Cảnh 1 (Intro): ~7s - 15s.
      * Cảnh 2 (Lý thuyết): ~14s - 45s.
      * Cảnh 3 (Mô phỏng động / Dual-Zone): ~35s - 75s.
      * Cảnh 4 (Bài tập thực chiến theo từng dạng bài): ~38s - 150s+ (Mỗi dạng 2 câu chiếm ~40s - 50s).
      * Cảnh 5 (Outro): ~8s - 20s.
    - Trong code Manim, tổng run_time của self.play(...) cộng với self.wait(...) ở mỗi phân cảnh phải khớp với thời gian đọc của phân cảnh đó để video kết thúc cùng lúc với giọng đọc.

11. QUY TẮC TUYỆT ĐỐI KHÔNG IN HOA (NO ALL CAPS - CHUẨN CHÍNH TẢ TIẾNG VIỆT):
    - TUYỆT ĐỐI KHÔNG viết hoa toàn bộ (ALL CAPS) ở tiêu đề chính, tên bài học, tên phân cảnh, pill badges, tiêu đề thẻ hay đề bài câu hỏi.
    - BẮT BUỘC dùng chữ thường chuẩn ngữ pháp Tiếng Việt (Sentence case: chỉ viết hoa chữ cái đầu câu và danh từ riêng/tên viết tắt như Oxy, THPT, SGK).
    - Ví dụ chuẩn đẹp:
      * Đúng: "Khảo sát sự biến thiên của hàm số", "Ví dụ minh họa", "Thực chiến", "Câu 1: Đọc bảng biến thiên", "Bảng biến thiên & kết luận", "Tổng kết bí kíp".
      * Sai (CẤM): "KHẢO SÁT SỰ BIẾN THIÊN", "VÍ DỤ MINH HỌA", "THỰC CHIẾN", "CÂU 1: ĐỌC BẢNG BIẾN THIÊN", "BẢNG BIẾN THIÊN & KẾT LUẬN".

12. QUY TẮC TỐI GIẢN KHUNG VIỀN & QUY TẮC BOX BỌC TEXT CHỨA VỪA KHÍT NỘI DUNG (ZERO REDUNDANT BOXES & SNUG FIT):
    - Khắc phục triệt để lỗi "Box Inception" (nhồi nhét quá nhiều khung viền không cần thiết: bọc box quanh tiêu đề thẻ, bọc box quanh đề bài, bọc box quanh từng bước giải, bọc box quanh kết luận). Hậu quả là màn hình bị chật ních khung viền thừa thãi, diện tích hiển thị bị bóp nghẹt khiến toàn bộ nội dung giáo dục phải co rúm lại.
    - NGUYÊN TẮC BẤT DI BẤT DỊCH (CHUẨN TỪ c1_HamSo_CucTri.py & c1_HamSo_DonDieu.py):
      * Mỗi vùng chỉ có ĐÚNG 1 khung thẻ nền ngoài (top_card, bottom_card hoặc outro_card dạng RoundedRectangle, width=8.4).
      * BÊN TRONG CARD: TUYỆT ĐỐI CẤM tạo các hộp bọc lồng nhau (NO NESTED BOXES):
        - CẤM bọc box quanh tiêu đề thẻ (top_title, c1_title chỉ là Text trơn đặt tại .next_to(card.get_top(), DOWN, buff=0.18)).
        - CẤM bọc box quanh câu hỏi / đề bài.
        - CẤM bọc box quanh các bước giải (Bước 1, Bước 2, Bước 3).
        - CẤM bọc box quanh bảng biến thiên.
      * CHỈ DUY NHẤT 2 LOẠI BOX ĐƯỢC PHÉP XUẤT HIỆN BÊN TRONG CARD:
        1) Hộp khoanh đáp án đúng: SurroundingRectangle(opt_correct, color=GREEN, buff=0.12-0.14, corner_radius=0.08-0.1, stroke_width=2.5) ôm quanh ĐÚNG phương án đúng (chữ A/B/C/D) trong hàng đáp án.
        2) Ở thẻ mô phỏng lý thuyết: 1 hộp duy nhất SurroundingRectangle(conclusions, color=GREEN, buff=0.14-0.16, corner_radius=0.12, stroke_width=2.5) bọc cụm 2-3 dòng kết luận tóm tắt.
        3) Ở thẻ đồ thị: Thanh trạng thái động status_badge (chiều cao 0.52, bo góc 0.1) ở sát đáy thẻ.
      * Với huy hiệu Pill Badge ở Header Bar: Tính chiều rộng động:
        rect = RoundedRectangle(corner_radius=0.12, width=max(2.2, text.width + 0.5), height=text.height + 0.28, ...)
      * Luôn gọi fit_width(group, 7.8) cho mọi khối nội dung trong thẻ trước khi đóng khung viền.

13. QUY TẮC BỐ CỤC 4 ĐÁP ÁN TRẮC NGHIỆM LIỀN KHỐI (CHỐNG LỖI CHỮ A. ĐỨNG RIÊNG 1 DÒNG):
    - QUY TẮC LIỀN KHỐI BẮT BUỘC (ATOMIC OPTION ITEM):
      * MỖI ĐÁP ÁN A, B, C, D BẮT BUỘC PHẢI LÀ MỘT KHỐI NGUYÊN VẸN NẰM TRÊN CÙNG 1 HÀNG.
      * Dạng công thức/khoảng nghiệm/số: BẮT BUỘC viết chung nhãn và giá trị trong 1 MathTex duy nhất:
        optA = MathTex(r"\\mathbf{A.}\\; (-1; 0)", font_size=22)
        optB = MathTex(r"\\mathbf{B.}\\; (0; 1)", font_size=22)
        optC = MathTex(r"\\mathbf{C.}\\; (1; 2)", font_size=22)
        optD = MathTex(r"\\mathbf{D.}\\; (-1; 1)", font_size=22)
      * Dạng câu chữ tiếng Việt: BẮT BUỘC ghép nhãn và câu bằng arrange(RIGHT, buff=0.12, aligned_edge=DOWN):
        optA = VGroup(Text("A.", font=MAIN_FONT, font_size=22, weight=BOLD), Text("Đồng biến trên (0; 2)", font=MAIN_FONT, font_size=22)).arrange(RIGHT, buff=0.12, aligned_edge=DOWN)
      * TUYỆT ĐỐI CẤM:
        - CẤM arrange(DOWN) giữa chữ cái nhãn A/B/C/D và nội dung đáp án!
        - CẤM chèn dấu xuống dòng \\n sau chữ cái nhãn (như Text("A.\\n...")) làm chữ cái đứng cô độc 1 dòng rồi nội dung mới rớt xuống dòng dưới!
    - BỐ CỤC 4 ĐÁP ÁN THÍCH ỨNG THEO ĐỘ RỘNG:
      * DẠNG 4x1 (1 hàng ngang gồm 4 đáp án): Áp dụng khi 4 đáp án đều NGẮN (<= 8 ký tự, ví dụ: A. 1; B. 2; C. 3; D. 4):
        opts_group = VGroup(optA, optB, optC, optD).arrange(RIGHT, buff=0.4)
      * DẠNG 2x2 (2 hàng x 2 cột - KHÓA 2 CỘT THẲNG TẮP, TUYỆT ĐỐI KHÔNG LỆCH CỘT): Áp dụng khi đáp án có độ dài trung bình (khoảng nghiệm, tọa độ điểm).
        BẮT BUỘC nhóm theo 2 cột dọc để A thẳng hàng trên C, B thẳng hàng trên D:
        col1 = VGroup(optA, optC).arrange(DOWN, aligned_edge=LEFT, buff=0.18)
        col2 = VGroup(optB, optD).arrange(DOWN, aligned_edge=LEFT, buff=0.18)
        opts_group = VGroup(col1, col2).arrange(RIGHT, buff=0.8, aligned_edge=UP)
      * DẠNG 1x4 (4 hàng dọc): Áp dụng khi các đáp án DÀI (chứa câu chữ định lý nhiều từ):
        opts_group = VGroup(optA, optB, optC, optD).arrange(DOWN, aligned_edge=LEFT, buff=0.14)
    - Hộp khoanh đáp án đúng: ans_box = SurroundingRectangle(opt_correct, color=GREEN, buff=0.12, corner_radius=0.08, stroke_width=2.5) ôm vừa khít đáp án đúng! Khoảng cách giữa các đáp án luôn >= 0.35 để viền xanh không bao giờ chạm vào chữ của đáp án bên cạnh.

14. QUY TẮC TIẾP TUYẾN ĐỒ THỊ CHUẨN MỰC & THANH TRẠNG THÁI BẮT ĐIỂM CỰC TRỊ (THEO c1_HamSo_DonDieu.py & c1_HamSo_CucTri.py):
    - Khi vẽ tiếp tuyến trượt trên đồ thị (ValueTracker + always_redraw), sử dụng công thức tiếp tuyến đơn giản, trực quan và chạy ổn định 100%:
      def get_tangent():
          t = t_param.get_value()
          y = f_func(t)
          m = 3 * (t**2) - 3  # Đạo hàm f'(t)
          dx = 0.38
          p1 = axes.c2p(t - dx, y - m * dx)
          p2 = axes.c2p(t + dx, y + m * dx)
          col = GREEN_C if m > 0.1 else (RED_C if m < -0.1 else YELLOW)
          return Line(p1, p2, color=col, stroke_width=4.0)
    - THANH TRẠNG THÁI BẮT ĐIỂM CỰC TRỊ / ĐẶC BIỆT (SNAP-TO-CRITICAL STATUS BADGE):
      Kế thừa từ c1_HamSo_CucTri.py, khi tiếp tuyến lướt qua lân cận cực trị (abs(t - x_0) < 0.16), thanh trạng thái lập tức "bắt" điểm và hiển thị giá trị cực trị cụ thể:
      def get_status_badge():
          t = t_param.get_value()
          m = 3 * (t**2) - 3
          if abs(t - (-1.0)) < 0.16:
              txt, b_col, bg_col = "x = -1 ➜ CỰC ĐẠI: y_{CĐ} = 2", GREEN_B, "#064E3B"
          elif abs(t - 1.0) < 0.16:
              txt, b_col, bg_col = "x = 1 ➜ CỰC TIỂU: y_{CT} = -2", RED_B, "#7F1D1D"
          elif m > 0.1:
              txt, b_col, bg_col = "y' > 0 ➜ ĐỒNG BIẾN (↗)", TEAL_B, "#0F172A"
          else:
              txt, b_col, bg_col = "y' < 0 ➜ NGHỊCH BIẾN (↘)", ORANGE, "#78350F"
          lbl = Text(txt, font=MAIN_FONT, font_size=22, weight=BOLD, color=WHITE)
          rect = RoundedRectangle(corner_radius=0.1, width=max(6.0, lbl.width + 0.5), height=0.52, color=b_col, fill_color=bg_col, fill_opacity=0.9, stroke_width=1.8).move_to(lbl)
          return VGroup(rect, lbl).next_to(top_card.get_bottom(), UP, buff=0.16)
    - ĐƯỜNG GIÓNG TRỤC CỰC TRỊ: Sử dụng axes.get_lines_to_point(pt).set_color(...) kèm Dot và MathTex nhãn tọa độ để đánh dấu đỉnh/đáy đồ thị.

15. QUY TẮC ƯU TIÊN 1 DÒNG (SINGLE-LINE FIRST) & CHỐNG XUỐNG DÒNG VÔ TỘI VẠ:
    - MỌI NỘI DUNG NGẮN (<= 14-16 từ hoặc <= 65 ký tự) BẮT BUỘC TRÌNH BÀY TRÊN CÙNG 1 DÒNG DUY NHẤT (kế thừa chuẩn mực từ c1_HamSo_DonDieu.py):
      * Đề bài câu hỏi ngắn:
        c2_quest = Text("Cho hàm số y = x³ - 3x². Mệnh đề nào dưới đây đúng?", font=MAIN_FONT, font_size=22, color=WHITE)
        (Nếu kết hợp MathTex: VGroup(Text("Cho hàm số"), MathTex(r"y = x^3 - 3x^2."), Text("Mệnh đề nào dưới đây đúng?")).arrange(RIGHT, buff=0.12))
      * Câu hỏi đọc hình/bảng:
        c1_ask = Text("Hỏi: Hàm số đã cho đồng biến trên khoảng nào?", font=MAIN_FONT, font_size=22, color=YELLOW)
      * Từng bước giải đại số / xét dấu:
        step1 = MathTex(r"\\text{Bước 1: } y' = 3x^2 - 6x = 3x(x - 2)", font_size=24, color=LIGHT_GRAY)
        step2 = MathTex(r"\\text{Bước 2: } y' = 0 \\iff x = 0 \\quad\\text{hoặc}\\quad x = 2", font_size=24, color=LIGHT_GRAY)
      * Bước giải có nhãn tiếng Việt + MathTex: Nối ngang arrange(RIGHT, buff=0.15) trên 1 dòng:
        step3 = VGroup(Text("Bước 3 (Trong trái ngoài cùng, a = 3 > 0):", font_size=22), MathTex(r"y' < 0 \\iff x \\in (0; 2)", font_size=24)).arrange(RIGHT, buff=0.15)
      * Kết luận và khoanh đáp án:
        c2_concl = VGroup(Text("➜ Hàm số nghịch biến trên (0; 2). Chọn", font_size=22), MathTex(r"\\mathbf{B}", font_size=24)).arrange(RIGHT, buff=0.15)
      * Từng dòng lý thuyết thẻ màu:
        Text("➜ Đồ thị đi LÊN từ trái sang phải (↗)", font_size=22)
    - TUYỆT ĐỐI CẤM (ANTI-PATTERNS):
      * CẤM ngắt dòng \\n sau các cụm từ ngắn (như "Cho hàm số\\n", "Hỏi:\\n", "Tính đạo hàm\\n", "Mệnh đề nào\\ndưới đây đúng?").
      * CẤM dùng arrange(DOWN) để chia nhỏ một câu ngắn thành nhiều dòng xếp chồng lên nhau làm lãng phí chiều cao thẻ.
      * CẤM tách riêng nhãn và nội dung kết luận (như để "Đồng biến trên:" ở dòng 1, rồi khoảng nghiệm rớt xuống dòng 2).
    - NGUYÊN TẮC BẢO VỆ: Chỉ ngắt xuống dòng khi câu thực sự dài (> 16 từ), và luôn gọi fit_width(group, 7.8) để tự động co tỷ lệ vừa khít khung thẻ!

16. QUY TẮC CỐT TỬ CHỐNG ẢO GIÁC CÚ PHÁP MANIM CE (ZERO-HALLUCINATION SYNTAX GUARD):
    - CẤM dùng thuộc tính không tồn tại trong Manim CE:
      * Không dùng font_color trong Text (dùng color=...).
      * Không dùng background_stroke (dùng stroke_width, stroke_color).
      * Không dùng ArcBetweenPoints với tham số sai (dùng Arc hoặc CurvedArrow).
    - CẤM dùng Transform(mobA, mobB) trên các MathTex có số lượng ký tự khác nhau gây méo mó chữ. BẮT BUỘC dùng ReplacementTransform(mobA, mobB) hoặc FadeTransform(mobA, mobB).
    - CẤM ngắt dòng bằng \\\\ bên trong 1 MathTex duy nhất làm vỡ bố cục 2x2. Thay vào đó, dùng \\quad \\text{và} \\quad để dàn ngang 1 dòng đơn hoặc tách thành 2 MathTex độc lập rồi arrange(DOWN).
    - Với ThreeDScene: Khởi tạo self.set_camera_orientation(phi=70*DEGREES, theta=-35*DEGREES), dùng ambient rotation self.begin_ambient_camera_rotation(rate=0.12).

17. QUY TẮC PHÂN BIỆT THUẬT NGỮ TOÁN HỌC & BẪY NGHIỆM BỘI CHẴN / BỘI LẺ (CHUẨN TỪ c1_HamSo_CucTri.py):
    - PHÂN BIỆT CHÍNH XÁC 3 KHÁI NIỆM CỰC TRỊ (TRÁNH BẪY ĐỀ THI):
      * "Điểm cực trị của hàm số": là hoành độ x_0 (thuộc tập xác định D).
      * "Giá trị cực trị" (hoặc "Cực trị"): là tung độ y_0 = f(x_0) (ký hiệu y_{CĐ}, y_{CT}).
      * "Điểm cực trị của đồ thị hàm số": là điểm tọa độ M(x_0; y_0) trên mặt phẳng Oxy.
    - BẪY NGHIỆM BỘI CHẴN TRONG ĐẠO HÀM (CÂU 2 THỰC CHIẾN):
      * Để x_0 là điểm cực trị thì đạo hàm f'(x) BẮT BUỘC phải ĐỔI DẤU khi qua x_0 theo chiều tăng của x.
      * Nghiệm bội chẵn (mũ chẵn như (x - x_0)^2, (x - x_0)^4): f'(x) KHÔNG đổi dấu khi qua x_0 ➜ TUYỆT ĐỐI KHÔNG là điểm cực trị!
      * Chỉ các nghiệm đơn hoặc nghiệm bội lẻ mới làm f'(x) đổi dấu ➜ mới là điểm cực trị.
    - BẢNG BIẾN THIÊN THU NHỎ TRONG THẺ BÀI TẬP (MINI BBT CARD):
      * Khi câu hỏi thực chiến yêu cầu "Đọc bảng biến thiên", bảng biến thiên đề bài thu nhỏ với font_size=22, arraystretch=1.25, đặt gọn gàng trong Top Card mà không bao giờ chèn ép các đáp án.

18. QUY TẮC PHÂN CẤP TIÊU ĐỀ CHUẨN MỰC (CHỐNG TIÊU ĐỀ PHÌNH TO - TITLE SCALE GUARD):
    - Khắc phục triệt để lỗi tiêu đề thẻ bị đặt font_size quá lớn (30-40) hoặc bọc khung viền to tướng, chiếm tới 30-40% chiều cao của thẻ khiến nội dung giáo dục bị chèn ép.
    - BẢNG PHÂN CẤP TIÊU ĐỀ BẮT BUỘC (THEO c1_HamSo_CucTri.py & c1_HamSo_DonDieu.py):
      * Tiêu đề chính mở đầu (Intro Title): font_size=28 đến 32 (weight=BOLD, Sentence case, YELLOW).
      * Tiêu đề Header Bar (title_txt): font_size=22 đến 24 (weight=BOLD, YELLOW).
      * TIÊU ĐỀ THẺ CON BÊN TRONG CARD (top_title, bot_title, c1_title, c2_title): BẮT BUỘC font_size=20 đến 22 (weight=BOLD, màu TEAL_A hoặc YELLOW). CẤM font_size > 22!
      * Tiêu đề tổng kết (Outro Title): font_size=28 đến 30 (weight=BOLD, YELLOW).
    - CÁCH ĐẶT TIÊU ĐỀ THẺ CHUẨN MỰC:
      * Tiêu đề thẻ là Text trơn (kèm emoji nhận diện):
        top_title = Text("📈 ĐỒ THỊ & TIẾP TUYẾN CHUYỂN ĐỘNG", font=MAIN_FONT, font_size=22, weight=BOLD, color=TEAL_A)
        top_title.next_to(top_card.get_top(), DOWN, buff=0.18)
      * TUYỆT ĐỐI CẤM bọc thêm SurroundingRectangle hoặc RoundedRectangle quanh tiêu đề thẻ bên trong card!

19. QUY TẮC KẾT LUẬN BÀI TOÁN TINH GỌN (CHỐNG KẾT LUẬN QUÁ KHỔ - LEAN CONCLUSION GUARD):
    - Khắc phục triệt để lỗi tạo thẻ con to tướng hoặc dòng kết luận phình to (font_size 28-32) chiếm nửa màn hình chỉ để ghi đáp án.
    - CẤU TRÚC KẾT LUẬN BÀI TẬP CHUẨN 1 DÒNG DUY NHẤT (THEO c1_HamSo_CucTri.py):
      c1_sol = VGroup(
          Text("➜ Điểm cực tiểu x = 2; Giá trị cực tiểu là y = -4. Chọn", font=MAIN_FONT, font_size=22, color=GREEN_B, weight=BOLD),
          MathTex(r"\mathbf{D}", font_size=24, color=GREEN)
      ).arrange(RIGHT, buff=0.15)
      ans_c1_box = SurroundingRectangle(optD, color=GREEN, buff=0.14, corner_radius=0.1, stroke_width=2.5)
    - NGUYÊN TẮC BẢO VỆ:
      * Kết luận luôn là 1 dòng đơn cô đọng (Sentence case, font_size=22 cho chữ thuyết minh, font_size=24 cho chữ cái đáp án). CẤM font_size > 24!
      * Hộp xanh khoanh đáp án đúng (ans_c1_box) BẮT BUỘC chỉ ôm trọn quanh phương án đúng (optD) trong hàng 4 đáp án. TUYỆT ĐỐI CẤM bọc thêm box to đùng quanh cả dòng c1_sol!
      * CẤM tạo thẻ con RoundedRectangle riêng cho kết luận trong thẻ bài tập.

20. QUY TẮC CHỐNG THU NHỎ NỘI DUNG & BẢO TỒN ĐỘ RÕ NÉT (ANTI-SHRINK & LEGIBILITY PRESERVATION):
    - Khắc phục triệt để lỗi nội dung bài toán (công thức, đề bài, BBT) bị co rúm li ti (shrunk down), khó đọc trên thiết bị di động.
    - CƠ CHẾ GÂY LỖI & CÁCH TRIỆT TIÊU:
      1) Lỗi dòng text quá dài (> 55-60 ký tự): Khi một dòng text quá dài, chiều rộng cả nhóm vượt quá 7.8 đơn vị. Hàm fit_width(group, 7.8) sẽ co kéo tỷ lệ toàn bộ cả nhóm (cả trục ngang lẫn trục dọc), biến font_size 24 thành 14-16 li ti!
         ➜ GIẢI PHÁP: Mọi dòng Text / MathTex KHÔNG ĐƯỢC dài quá 50-55 ký tự. Nếu đề bài dài hơn, chủ động tách thành 2 dòng ngắn:
            c1_quest1 = Text("Cho hàm số f(x) có đạo hàm liên tục trên ℝ", font=MAIN_FONT, font_size=22, color=WHITE)
            c1_quest2 = Text("và đồ thị hàm số như hình vẽ bên dưới:", font=MAIN_FONT, font_size=22, color=WHITE)
            c1_quest = VGroup(c1_quest1, c1_quest2).arrange(DOWN, aligned_edge=LEFT, buff=0.1)
            Nhờ đó, chiều rộng tự nhiên luôn <= 6.8 đơn vị, hàm fit_width(group, 7.8) KHÔNG PHẢI CO KÉO TỶ LỆ, nội dung giữ nguyên 100% độ sắc nét!
      2) Lỗi quá nhiều khung viền và khoảng cách dọc quá rộng: Dẫn đến việc nội dung bị tràn đáy và lập trình viên phải gọi .scale(0.6) hoặc .scale(0.55).
         ➜ GIẢI PHÁP: Bỏ toàn bộ box thừa thãi, dùng khoảng cách dọc buff=0.14-0.18 khi arrange(DOWN).
      3) Giữ vững cỡ chữ vùng vàng (Golden Legibility Sizes):
         - Công thức toán MathTex: font_size=24 đến 28 (to rõ, sắc sảo).
         - Chữ diễn giải / đề bài: font_size=22 (CẤM font_size < 22).
         - Bảng biến thiên: font_size=22 đến 24 (arraystretch=1.25 - 1.3).
      4) CẤM TUYỆT ĐỐI dùng .scale(< 0.85) trên các khối nội dung thẻ (c1_content, c2_content, bot_content).
 
21. QUY TẮC NGÔN NGỮ SƯ PHẠM TỰ NHIÊN & TRIỆT TIÊU THUẬT NGỮ META (ANTI-META JARGON & NATURAL PEDAGOGY):
    - Video giáo dục sản xuất cho học sinh và người học BẮT BUỘC phải mang văn phong sư phạm chân thực, tự nhiên và chuyên nghiệp như một bài giảng chuẩn mực của thầy cô giáo thực tế.
    - TUYỆT ĐỐI CẤM các từ ngữ mang tính chất "kỹ thuật hậu trường" hoặc "meta-AI":
      * CẤM "RAG", "Tài liệu RAG", "Dữ liệu RAG", "Trích từ RAG".
      * CẤM "Trích từ tài liệu", "Theo tài liệu đính kèm", "Dựa trên tài liệu tham khảo", "Theo file PDF", "Dữ liệu nguồn", "Từ file đính kèm".
    - PHẠM VI ÁP DỤNG CẤM: Cả các mobject hiển thị trên màn hình (Text, Title, Mobject) VÀ trong kịch bản thuyết minh (VOICEOVER_SCRIPT).
    - CÁCH THỂ HIỆN SƯ PHẠM TỰ NHIÊN CHUẨN MỰC:
      * Tiêu đề phân cảnh: Text("Chữa đề thi THPT Quốc gia"), Text("Bài tập thực chiến"), Text("Luyện tập trọng tâm").
      * Tiêu đề câu hỏi: Text("Câu 1: Đọc bảng biến thiên"), Text("Câu 2: Tìm m để hàm số đạt cực đại").
      * Trong kịch bản lời thoại: "Chào các bạn, hôm nay chúng ta cùng chữa câu hỏi trắc nghiệm sau...", "Bước đầu tiên ta nhận xét...", "Quan sát bảng biến thiên ta thấy...".

22. QUY TẮC TRIỆT TIÊU BOX NHÃN PHÂN LOẠI & PILL BADGES THỪA THÃI ("Ví dụ minh họa", "Dạng 1", "Dạng 2" - ANTI-LABEL-BOX OVERFLOW GUARD):
    - Khắc phục triệt để lỗi tạo box/pill (RoundedRectangle/SurroundingRectangle) bao quanh các nhãn như "Ví dụ minh họa", "Dạng 1", "Dạng 2", "Thực chiến" khiến tiêu đề bị phình to chiều rộng, tràn ra ngoài viền Header Bar/Card hoặc kích hoạt fit_width co rúm toàn bộ chữ.
    - NGUYÊN TẮC BẤT DI BẤT DỊCH: TUYỆT ĐỐI KHÔNG CẦN BOX NẾU KHÔNG CẦN THIẾT!
      * CẤM bọc box quanh "Ví dụ minh họa", "Ví dụ", "Bài mẫu" -> BẮT BUỘC dùng Text trơn trực tiếp (font_size=20-22 BOLD, màu TEAL_A hoặc YELLOW)!
      * CẤM bọc box quanh "Dạng 1", "Dạng 2", "Dạng 3" -> BẮT BUỘC dùng Text trơn trực tiếp hoặc viết gộp vào tiêu đề câu: Text("Câu 1 (Dạng 1): Đọc bảng biến thiên", font_size=22, weight=BOLD, color=TEAL_A)!
      * CẤM bọc box quanh "Thực chiến", "Luyện tập" trong Header Bar -> BẮT BUỘC dùng Text trơn: Text("⚡ Thực chiến: Chữa đề thi THPT Quốc gia", font_size=22, weight=BOLD, color=YELLOW)!
    - Chỉ duy nhất 2 loại box được phép có bên trong Card:
      1) Khung khoanh đáp án đúng: SurroundingRectangle(opt_correct, color=GREEN, buff=0.12-0.14) ôm quanh đúng phương án đúng (A/B/C/D).
      2) Khung tóm tắt lý thuyết: SurroundingRectangle(conclusions, color=GREEN, buff=0.14-0.16) bọc cụm 2-3 dòng kết luận ở thẻ lý thuyết.
`;

