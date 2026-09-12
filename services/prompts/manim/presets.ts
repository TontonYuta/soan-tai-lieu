export const getSimulationModeDescription = (mode?: string): string => {
  switch (mode) {
    case 'geometry_3d':
    case '3d_geometry':
      return `[BỘ FORM MÔ PHỎNG HÌNH HỌC KHÔNG GIAN 3D (ThreeDScene)]:
Xây dựng mô hình 3D với ThreeDScene: Vẽ hình chóp (S.ABCD, S.ABC), khối lăng trụ, khối lập phương hoặc mặt cầu.
- BẮT BUỘC: class MainScene(ThreeDScene):
- Góc nhìn máy quay chuẩn: self.set_camera_orientation(phi=70*DEGREES, theta=-35*DEGREES, zoom=0.85)
- Hiệu ứng xoay không gian nhẹ: self.begin_ambient_camera_rotation(rate=0.12)
- Phân biệt rõ ràng các cạnh nét đứt (DashedLine) cho đường khuất bên trong và Line3D / Line nét liền cho các cạnh thấy.
- Thẻ dưới hiển thị phương pháp xác định góc giữa đường thẳng và mặt phẳng, góc nhị diện, khoảng cách hoặc công thức thể tích.`;

    case 'trigonometry':
      return `[BỘ FORM LƯỢNG GIÁC & VÒNG TRÒN ĐƠN VỊ]:
Vẽ đường tròn lượng giác đơn vị tâm O bán kính 1 với hệ trục Oxy. Vector bán kính quay góc alpha qua ValueTracker.
- Trục Cos ngang (màu Cyan), trục Sin đứng (màu Yellow), trục Tan tiếp tuyến (màu Red) tự động gióng nét đứt và cập nhật giá trị theo góc quay real-time.
- Thẻ dưới hiển thị đồ thị hàm số y = sin(x) hoặc y = cos(x) chạy đồng bộ với điểm quay trên đường tròn.`;

    case 'complex_numbers':
      return `[BỘ FORM SỐ PHỨC & MẶT PHẲNG PHỨC ARGAND]:
Hệ trục tọa độ phức Oxy: Trục hoành Re(z) và trục tung Im(z). Điểm biểu diễn M(a, b) và vector v = (a, b) cho số phức z = a + bi.
- Diễn hoạt module |z| bằng độ dài vector và argument phi bằng cung góc quay.
- Biểu diễn trực quan tập hợp điểm quỹ tích đường tròn |z - z0| = R hoặc đường trung trực elip. Thẻ dưới phân tích biến đổi đại số tương ứng.`;

    case 'coordinate_oxyz':
      return `[BỘ FORM HỆ TỌA ĐỘ KHÔNG GIAN OXYZ]:
Vẽ 3 trục Ox, Oy, Oz với ThreeDAxes có nhãn vector đơn vị i, j, k.
- Biểu diễn mặt phẳng (P): Ax + By + Cz + D = 0 dưới dạng hình bình hành tô màu trong suốt, vector pháp tuyến n = (A, B, C) dựng vuông góc với mặt phẳng.
- Vẽ đường thẳng (d) với vector chỉ phương u và hình chiếu vuông góc của điểm H lên mặt phẳng.`;

    case 'image_showcase':
      return `[BỘ FORM PHÂN TÍCH HÌNH ẢNH & SƠ ĐỒ THỰC TẾ (ImageMobject)]:
Tích hợp trực tiếp hình ảnh thực tế / đề bài / sơ đồ SGK qua ImageMobject.
- BẮT BUỘC dùng Group(...) thay vì VGroup(...) để chứa ImageMobject nhằm chống lỗi crash TypeError.
- Co tỷ lệ vừa vặn thẻ, đóng khung viền bo tròn thẩm mỹ SurroundingRectangle(color=TEAL_A, corner_radius=0.15).
- Vẽ các vector, vòng tròn khoanh vùng, mũi tên Arrow và công thức MathTex tương tác trỏ trực tiếp vào các điểm mấu chốt trên ảnh để phân tích bài toán.`;

    case 'geometry':
      return `[BỘ FORM MÔ PHỎNG HÌNH HỌC PHẲNG & VECTOR]: 
Xây dựng mô hình 2D với Axes, Polygon, Circle, Arrow biểu diễn vector, RightAngle đánh dấu góc vuông, và điểm chuyển động Dot. Dùng đường gióng nét đứt và nhãn đỉnh đặt ở hướng an toàn.`;

    case 'dialogue':
      return `[BỘ FORM ĐỐI THOẠI 2 NGƯỜI (THẦY - TRÒ Q&A)]: 
Tạo 2 thẻ đại diện: Thẻ "👨‍🏫 Thầy Yuta" bên Trái/Trên và Thẻ "🙋‍♂️ Học sinh" bên Phải/Dưới. 
Học sinh đưa ra câu hỏi thắc mắc trong khung thẻ -> Thầy Yuta xuất hiện giải đáp trực quan từng bước bằng công thức LaTeX và mô hình minh họa.`;

    case 'calculus':
      return `[BỘ FORM GIẢI TÍCH & KHẢO SÁT HÀM SỐ (CHUẨN c1_HamSo_DonDieu.py & c1_HamSo_CucTri.py)]: 
Tạo hệ trục Axes, đồ thị axes.plot(...), tiếp tuyến di chuyển trượt trên đường cong với ValueTracker, tự động đổi màu theo độ dốc f'(x), thanh trạng thái real-time always_redraw có khả năng bắt điểm cực trị / lân cận điểm uốn (abs(t - x₀) < 0.16), đường gióng nét đứt đến cực trị axes.get_lines_to_point(...), và BẢNG BIẾN THIÊN 3 tầng chuẩn mực SGK Việt Nam (x, y', y). Chú ý bẫy nghiệm bội chẵn và phân biệt 3 khái niệm cực trị (x₀, y₀, M(x₀; y₀)).`;

    case 'fast_tricks':
      return `[BỘ FORM MẸO & THỦ THUẬT GIẢI NHANH 30S]: 
Bố cục 2 thẻ so sánh: 
- Thẻ 1 (❌ Cách tự luận dài - 3 phút): Hiển thị phép tính dài, dùng gạch đỏ cảnh báo tốn thời gian.
- Thẻ 2 (⚡ Mẹo thần tốc 30s): Hiển thị công thức rút gọn, đóng khung SurroundingRectangle(color=GREEN) kèm hiệu ứng Flash.`;

    case 'stem':
    case 'stem_modeling':
    case 'physics':
    case 'physics_stem':
      return `[BỘ FORM MÔ PHỎNG VẬT LÝ & KHOA HỌC STEM]: 
Diễn hoạt quỹ đạo chuyển động con lắc/vật ném, dao động điều hòa axes.plot(lambda t: np.sin(t)), sơ đồ mạch điện (nguồn, điện trở, ampe kế), vector lực kéo/ma sát, hoặc đường sức từ trường. Khung thẻ dưới hiển thị công thức định luật và tính toán số liệu cụ thể.`;

    case 'chemistry':
      return `[BỘ FORM HÓA HỌC & PHẢN ỨNG]: 
Diễn hoạt sơ đồ liên kết phân tử, các hạt nguyên tử chuyển động va chạm phản ứng, phương trình phản ứng hóa học cân bằng có điều kiện nhiệt độ/xúc tác, và bảng biến thiên nồng độ/pH theo thời gian.`;

    case 'biology':
      return `[BỘ FORM SINH HỌC & DI TRUYỀN HỌC]: 
Mô phỏng bảng lai Punnett di truyền Menđen, sơ đồ phân bào nguyên phân/giảm phân, mô hình chuỗi xoắn kép ADN/ARN tách mạch nhân đôi, hoặc sơ đồ lưới thức ăn sinh thái.`;

    case 'english_language':
    case 'languages':
      return `[BỘ FORM TIẾNG ANH & NGOẠI NGỮ]: 
Thẻ trên hiển thị thẻ học từ vựng trực quan (Pill Badge từ loại, phiên âm IPA, câu ví dụ thực tế), thẻ dưới minh họa sơ đồ trục thời gian các thì (Tenses Timeline) hoặc cấu trúc ngữ pháp then chốt.`;

    case 'computer_science':
    case 'algorithms':
      return `[BỘ FORM TIN HỌC & THUẬT TOÁN]: 
Mô phỏng trực quan các thanh mảng chuyển động tráo đổi vị trí trong thuật toán sắp xếp (Bubble/Quick Sort), duyệt cây nhị phân (Binary Tree), hoặc đồ thị trực quan so sánh độ phức tạp O(1) đến O(n^2).`;

    case 'social_sciences':
    case 'history_geography':
      return `[BỘ FORM KHOA HỌC XÃ HỘI (LỊCH SỬ - ĐỊA LÝ)]: 
Trục thời gian tiến trình lịch sử (Chronological Timeline) trượt qua các mốc năm quan trọng, sơ đồ tư duy nguyên nhân - diễn biến - ý nghĩa lịch sử, hoặc biểu đồ trực quan số liệu địa lý/dân số.`;

    default:
      return `[BỘ FORM BÀI GIẢNG ĐA MÔN CHUẨN STUDIO (5 CHƯƠNG KẾ THỪA c1_HamSo_DonDieu.py)]: 
Bố cục Khung Thẻ Chuẩn: Intro -> Lý thuyết (2 thẻ màu độc lập) -> Dual-Zone Mô phỏng động tương tác & Bảng phân tích -> Bài tập thực chiến theo từng dạng bài -> Thẻ Outro Thương Hiệu.`;
  }
};
