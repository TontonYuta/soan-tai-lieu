import { VideoConfig } from "../../types";

export const generateVideoScriptPrompt = (config: VideoConfig): string => {
  const isVertical = config.format === 'vertical';

  return `Đóng vai Nhà sáng tạo Nội dung Giáo dục Toán học triệu view trên nền tảng ${isVertical ? 'TikTok / Shorts / Reels (Video Dọc)' : 'YouTube / Bài giảng (Video Ngang)'}.

Nhiệm vụ: Viết Kịch bản Lời thoại & Bảng Phân cảnh (Storyboard Script) chi tiết từng giây cho chủ đề toán học dưới đây, ăn khớp hoàn hảo với diễn hoạt Manim.

[THÔNG TIN VIDEO]
- Môn học / Chủ đề: ${config.subject} - ${config.topic}
- Loại hình: ${config.mathType || 'Toán học tổng hợp'}
- Định dạng Khung hình: ${isVertical ? 'DỌC (9:16 - TikTok/Shorts)' : 'NGANG (16:9 - YouTube)'}
- Thời lượng video: ${config.duration}
- Phong cách diễn đạt: ${config.tone}
- Khán giả mục tiêu: ${config.audience}
- Ghi chú: ${config.details || "Đi thẳng vào vấn đề, thực chiến toán học"}

[CÁC NGUYÊN TẮC GIỮ CHÂN NGƯỜI XEM (RETENTION RULES)]
1. **HOOK 3 GIÂY ĐẦU (SINH TỬ):**
   - Không chào hỏi lan man ("Xin chào các bạn...").
   - Vào thẳng câu hỏi hóc búa, nghịch lý toán học hoặc bẫy sai lầm 99% học sinh dính (Ví dụ: "Đừng bao giờ làm tích phân kiểu này nếu không muốn mất 0.2 điểm!").
2. **KẾT HỢP VISUAL & AUDIO:**
   - Mỗi câu thoại đều phải có hình ảnh hoặc hiệu ứng Manim tương ứng (đồ thị chuyển động, biến đổi công thức, phóng to điểm cực trị).
3. **LOGIC TĂNG DẦN ĐỘ KHÓ & TÍNH ỨNG DỤNG:**
   - Từ trực quan hình ảnh -> Công thức giải nhanh -> 1 ví dụ thực chiến -> Đúc kết bí quyết.
4. **VĂN PHONG SÚC TÍCH:**
   - Ngắn gọn, nhịp điệu nhanh, dễ tiếp thu, có điểm nhấn cảm xúc.

[CẤU TRÚC KỊCH BẢN - BẢNG PHÂN CẢNH CHI TIẾT]

# KỊCH BẢN VIDEO: ${config.topic.toUpperCase()}
**Định dạng:** ${isVertical ? 'Video Dọc 9:16 (Shorts/TikTok)' : 'Video Ngang 16:9 (YouTube)'} | **Thời lượng:** ${config.duration}

---

| Thời gian | Hình ảnh diễn hoạt (Manim Visual) | Lời thoại thuyết minh (Audio / Voiceover) | Chữ & Công thức trên màn hình |
| :--- | :--- | :--- | :--- |
| **00:00 - 00:05** *(Hook)* | [Mô tả hình ảnh đồ thị / câu hỏi giật gân] | "[Câu thoại mở đầu trực diện]" | [Tiêu đề / Công thức giật gân] |
| **00:05 - 00:20** *(Bản chất)* | [Mô tả diễn hoạt trực quan hóa khái niệm] | "[Giải thích trực quan, dễ hiểu]" | [Khái niệm / Định lý chính] |
| **00:20 - 00:50** *(Ví dụ)* | [Mô tả từng bước biến đổi Manim] | "[Hướng dẫn mẹo giải và lưu ý bẫy đề thi]" | [Từng bước tính toán] |
| **00:50 - Cuối** *(Call to action)*| [Logo Yuta!LaTeX & Mũi tên đăng ký] | "[Tóm tắt 1 câu thần chú & kêu gọi follow]"| [Thần chú ghi nhớ] |

---

### Gợi ý Tone giọng đọc TTS:
- Tốc độ đọc: 1.1x (cho video ngắn) hoặc 1.0x (cho video bài giảng).
- Cảm xúc: Tự tin, dứt khoát, truyền cảm hứng.`;
};