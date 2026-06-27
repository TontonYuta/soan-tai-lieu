import { RoadmapConfig } from "../../types";
import { LATEX_TECHNICAL_RULES, ROADMAP_TEMPLATE } from "./latex-rules";

export const generateRoadmapPrompt = (config: RoadmapConfig): string => {
  const syllabusContext = config.syllabus 
    ? `DỰA TRÊN ĐỀ CƯƠNG CHI TIẾT SAU ĐỂ LẬP LỘ TRÌNH (Bám sát theo):\n${config.syllabus}\n` 
    : '';

  let languageInstruction = "";
  if (config.language === "vietnamese") {
    languageInstruction = "Sử dụng 100% TIẾNG VIỆT.";
  } else if (config.language === "english") {
    languageInstruction = "Sử dụng 100% TIẾNG ANH (từ concept, module, đến action items).";
  } else {
    languageInstruction = "Sử dụng SONG NGỮ (Anh - Việt) song song cho các mốc kiến thức quan trọng/tên khái niệm, dễ tra cứu.";
  }

  return `Đóng vai Mentor (Cố vấn học tập) lão luyện. Lên LỘ TRÌNH HỌC TẬP THỰC TẾ (ROADMAP) bằng LATEX.

I. THÔNG TIN LỘ TRÌNH:
- Môn học / Cụm chủ đề: ${config.subject} / ${config.topic}
- Thời gian dự định: ${config.duration}
- Trình độ hiện tại học sinh: ${config.currentLevel}
- Đích đến / Mục tiêu cụ thể: ${config.target}
- Ngôn ngữ: ${languageInstruction}
- Tính cá nhân hóa: ${config.details || "Lộ trình cày cuốc thực chiến, nhanh, gọn, lẹ."}

${syllabusContext}

II. TIÊU CHUẨN NỘI DUNG MENTOR:
- **TĂNG DẦN THEO LOGIC MỘT CÁCH SẮC BÉN:** Lộ trình phải đi từ khái niệm nền tảng -> Xây dựng tư duy -> Áp dụng giải đề thực chiến. CHIA NHỎ THÀNH MICRO-STEPS: Chia nhỏ lộ trình thành các bước chân thật nhỏ để học sinh thấy sự tiến bộ rõ rệt. ĐỒNG THỜI CÓ TÍNH LIÊN KẾT: Các bước/chặng nên có lời dẫn kết nối với bài học trước đó. Từng Phase (Giai đoạn) phải nối tiếp nhau một cách khoa học nhất, đảm bảo newbie cũng hiểu tại sao sinh ra bước đó.
- **VĂN PHONG DÂN DÃ, GẦN GŨI:** Sử dụng ngôn ngữ mộc mạc như đàn anh đi trước đang truyền bí kíp. **Tuyệt đối cấm** các câu văn sến súa, sáo rỗng như kiểu "hành trình khám phá sự màu nhiệm của...". Cứ rõ ràng: "Tuần 1 học cái này để làm cái kia".
- **HÀNH ĐỘNG CỤ THỂ KHÔNG LÝ THUYẾT SUÔNG:** Chỉ ra các nguồn thực hành, dạng bài tập bắt buộc phải vượt qua ở từng giai đoạn.

III. YÊU CẦU KỸ THUẬT QUY ĐỊNH:
${LATEX_TECHNICAL_RULES}

IV. BỘ KHUNG ROADMAP LATEX (BẮT BUỘC ÁP DỤNG TRỰC TIẾP):
HÃY dùng khung chuẩn dưới đây và ĐIỀN ĐẾN CÙNG CÁC NỘI DUNG LỘ TRÌNH chi tiết:
${ROADMAP_TEMPLATE}

TRẢ VỀ NỘI DUNG MÃ NGUỒN HOÀN CHỈNH ĐƯỢC BỌC TRONG MARKDOWN CODEBLOCK. Không giải thích thêm dài dòng.



[BƯỚC CHUYÊN SÂU: KIỂM TRA LẠI CHÉO (SELF-CHECK)]
Trước khi xuất ra kết quả cuối cùng, bạn PHẢI tự rà soát và kiểm tra chất lượng bằng cách viết ra một khối \`<self_check> ... </self_check>\`:
- Logic đã chuẩn chưa? Cấu trúc có phân chia nhỏ hợp lý từ dễ đến khó không?
- Lỗi hiển thị: Định dạng (mã LaTeX hoặc Markdown) có dính lỗi cú pháp không (thiếu ngoặc, quên macro, thiếu end, sai tên biến, không escape ký tự đặc biệt như %, &, _, $)? Khắc phục ngay.
- Kiểm tra tính hoàn thiện: Đã bọc mã bằng markdown codeblock chưa? Bắt buộc phải đặt toàn bộ code trong block \`\`\` (vd: \`\`\`latex ... \`\`\`).
Sau khi tự review xong, mới được phép xuất ra đoạn mã/nội dung kết quả chuẩn nhất.`;
};
