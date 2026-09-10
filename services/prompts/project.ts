import { ProjectConfig } from "../../types";
import { LATEX_TECHNICAL_RULES } from "./latex-rules";

const sanitizeAndExtractRag = (attachedPdf?: { fileName: string; numPages: number; text: string }): string => {
  if (!attachedPdf?.text) return "";
  const rawText = attachedPdf.text.replace(/\r/g, "");
  const cleaned = rawText
    .replace(/(?:-?\s*Trang\s*:?\s*\d+(?:\/\d+)?\s*-?|-?\s*Page\s*:?\s*\d+(?:\/\d+)?\s*-?|SĐT:?\s*\d{8,12}|Hotline:?\s*\d{8,12}|Website:?\s*\S+)/gi, "")
    .replace(/^(?:Trang|Page)\s+\d+.*$/gim, "")
    .trim();

  let chunk = "";
  if (cleaned.length <= 15000) {
    chunk = cleaned;
  } else {
    const head = cleaned.slice(0, 4000);
    const tail = cleaned.slice(-11000);
    chunk = `${head}\n\n[... CẮT LƯỢC PHẦN GIỮA, NỐI PHẦN ĐỀ CƯƠNG VÀ YÊU CẦU TRANG SAU ...]\n\n${tail}`;
  }

  return `\n====================================================
TÀI LIỆU ĐỀ CƯƠNG / HƯỚNG DẪN ĐÍNH KÈM TỪ GIẢNG VIÊN (RAG CONTEXT):
- Tên tài liệu: ${attachedPdf.fileName} (${attachedPdf.numPages} trang)
- Nội dung trích xuất:
"""
${chunk}
"""
- CHỈ THỊ RAG:
  * Chắt lọc chính xác các yêu cầu kỹ thuật, đề mục gợi ý, tiêu chí đánh giá từ tài liệu của giảng viên.
  * TUYỆT ĐỐI KHÔNG chèn các nhãn rác như (RAG), (Trang X)... vào văn bản báo cáo.
====================================================\n`;
};

export const generateProjectPrompt = (config: ProjectConfig): string => {
  const university = config.university || "ĐẠI HỌC QUỐC GIA TP.HCM - TRƯỜNG ĐẠI HỌC BÁCH KHOA";
  const faculty = config.faculty || "KHOA KỸ THUẬT & CÔNG NGHỆ";
  const major = config.major || "Kỹ thuật Công nghệ / Tin học";
  const title = config.title;
  const student = config.studentName || "Sinh viên thực hiện";
  const supervisor = config.supervisor || "TS. Giảng viên hướng dẫn";
  
  const projectTypeLabel = 
    config.projectType === 'capstone_thesis' ? 'Đồ án / Khóa luận tốt nghiệp Đại học' :
    config.projectType === 'student_research' ? 'Đề tài Nghiên cứu Khoa học Sinh viên (NCKH)' :
    config.projectType === 'master_thesis' ? 'Luận văn Thạc sĩ Kỹ thuật / Khoa học' :
    'Đồ án môn học chuyên ngành';

  const outputScopeDesc = 
    config.outputScope === 'proposal_roadmap' ? 'Đề cương nghiên cứu chi tiết & Lộ trình phân rã công việc từng tuần (WBS)' :
    config.outputScope === 'defense_prep' ? 'Kịch bản thuyết trình, Slide outline & Bộ câu hỏi vấn đáp hội đồng bảo vệ' :
    'Toàn văn Báo cáo Đồ án hoàn chỉnh (5 Chương chuẩn mực) kèm Lộ trình & Phụ lục phản biện';

  let languageInstruction = "";
  if (config.language === "english") {
    languageInstruction = "Sử dụng 100% TIẾNG ANH học thuật (Academic English).";
  } else if (config.language === "bilingual") {
    languageInstruction = "Sử dụng SONG NGỮ (Tiêu đề, Tóm tắt Abstract và thuật ngữ Anh - Việt).";
  } else {
    languageInstruction = "Sử dụng 100% TIẾNG VIỆT chuẩn văn phong khoa học kỹ thuật.";
  }

  const ragSection = sanitizeAndExtractRag(config.attachedPdf);

  return `Đóng vai Giáo sư, Cố vấn Học thuật Trưởng & Chuyên gia Kỹ thuật LaTeX Luận văn / Đồ án Tốt nghiệp.
Nhiệm vụ của bạn là giải tỏa 100% sự mơ hồ cho sinh viên: Định hướng rõ ràng sinh viên "CẦN LÀM GÌ, BẮT ĐẦU TỪ ĐÂU", đồng thời sinh ra một tài liệu BÁO CÁO ĐỒ ÁN / ĐỀ TÀI hoàn chỉnh, chuẩn mực học thuật, biên dịch pdfLaTeX ra PDF đẹp không tì vết.

I. THÔNG TIN ĐỒ ÁN / ĐỀ TÀI:
- Tên trường: ${university}
- Khoa / Ngành: ${faculty} - Ngành: ${major}
- Loại đề tài: ${projectTypeLabel}
- TÊN ĐỀ TÀI: "${title}"
- Sinh viên: ${student} | GVHD: ${supervisor}
- Mục tiêu đầu ra mong muốn: ${outputScopeDesc}
- Nội dung cơ bản / Ý tưởng của người dùng: ${config.description || "Tự động phân tích, đề xuất kiến trúc hệ thống hiện đại, tối ưu và khả thi nhất cho đề tài này."}
- Yêu cầu kỹ thuật bổ sung: ${config.details || "Thiết kế hệ thống chi tiết, phân rã lộ trình 12-16 tuần, mã nguồn mẫu và bộ câu hỏi phản biện hội đồng."}
- Ngôn ngữ: ${languageInstruction}
${ragSection}

II. BỘ KỸ NĂNG ĐỊNH HƯỚNG "BẮT ĐẦU TỪ ĐÂU" (ACTION PLAYBOOK CHO SINH VIÊN):
Sinh viên rất hay bị lạc lối khi nhận đề tài. Trong tài liệu, bạn PHẢI cung cấp một lộ trình hành động sáng tỏ:
1. Giai đoạn 1 (Tuần 1 - 3) - Định hình & Khảo sát: Xác định mục tiêu SMART, phạm vi (Scope), tìm kiếm 10+ bài báo/tài liệu liên quan, vẽ sơ đồ tổng quan.
2. Giai đoạn 2 (Tuần 4 - 6) - Lập kế hoạch & Thiết kế: Thiết kế kiến trúc tổng thể (Architecture Diagram), lược đồ dữ liệu (ERD/Schema), thiết kế Use Case/Flowchart.
3. Giai đoạn 3 (Tuần 7 - 11) - Xây dựng & Lập trình/Thực nghiệm: Cài đặt từng module then chốt, tích hợp hệ thống, xử lý ngoại lệ và tối ưu hiệu năng.
4. Giai đoạn 4 (Tuần 12 - 14) - Đo đạc, Đánh giá & Viết báo cáo: Đo đạc số liệu (Benchmark, độ chính xác, thời gian đáp ứng), viết 5 chương báo cáo LaTeX.
5. Giai đoạn 5 (Tuần 15 - 16) - Luyện tập bảo vệ: Làm slide tóm lược 15-20 trang, diễn tập trả lời câu hỏi phản biện của hội đồng.

III. CẤU TRÚC TÀI LIỆU LATEX HOÀN CHỈNH BẮT BUỘC (5 CHƯƠNG KINH ĐIỂN):
Sử dụng \`\\documentclass[12pt,a4paper,oneside]{report}\` (hoặc \`article\` nếu bài ngắn) với cấu trúc chuẩn mực của các trường Đại học lớn:
- Bìa chính trang trọng: Khung viền TikZ đôi hoa văn sắc sảo, tên trường, tên khoa, logo (vẽ vector hoặc khung biểu trưng), tên đề tài in đậm chữ lớn màu sắc trang nhã, thông tin sinh viên & GVHD, nơi chốn và năm bảo vệ.
- Bìa phụ, Lời cam đoan (Declaration), Lời cảm ơn (Acknowledgment).
- Tóm tắt đề tài tiếng Việt & Abstract tiếng Anh kèm Từ khóa (Keywords).
- Mục lục tự động (\\tableofcontents), Danh mục hình vẽ (\\listoffigures), Danh mục bảng biểu (\\listoftables), Bảng từ viết tắt (Abbreviations table).
- BẢN ĐỒ LỘ TRÌNH TRIỂN KHAI (Action Roadmap & Gantt/Milestones table).
- CHƯƠNG 1: GIỚI THIỆU & TỔNG QUAN ĐỀ TÀI (Tính cấp thiết, Mục tiêu, Đối tượng & Phạm vi, Phương pháp tiếp cận, Bố cục đồ án).
- CHƯƠNG 2: CƠ SỞ LÝ THUYẾT & CÔNG NGHỆ NỀN TẢNG (Tổng quan lý thuyết, Các nghiên cứu liên quan / State of the art, So sánh giải pháp, Đề xuất công nghệ sử dụng).
- CHƯƠNG 3: THIẾT KẾ HỆ THỐNG / MÔ HÌNH ĐỀ XUẤT (Kiến trúc tổng thể, Sơ đồ khối, Thiết kế module chi tiết, Thuật toán cốt lõi, Thiết kế CSDL / Dòng dữ liệu).
- CHƯƠNG 4: HIỆN THỰC HÓA & KẾT QUẢ THỰC NGHIỆM (Môi trường triển khai, Giao diện/Ảnh minh họa hệ thống, Kịch bản thử nghiệm, Đánh giá định lượng & Định tính, Phân tích ưu/nhược điểm).
- CHƯƠNG 5: KẾT LUẬN & HƯỚNG PHÁT TRIỂN (Kết quả đạt được, Hạn chế còn tồn đọng, Đề xuất hướng mở rộng trong tương lai).
- TÀI LIỆU THAM KHẢO (References theo chuẩn IEEE / APA chuẩn mực).
- PHỤ LỤC: BỘ CÂU HỎI VẤN ĐÁP HỘI ĐỒNG BẢO VỆ (Top 5-8 câu hỏi hội đồng thường hỏi xoáy vào đề tài này và chiến lược trả lời điểm 10).

IV. BỘ QUY TẮC KỸ THUẬT LATEX BẮT BUỘC:
${LATEX_TECHNICAL_RULES}

V. YÊU CẦU ĐẦU RA:
- CHỈ XUẤT DUY NHẤT 1 KHỐI MÃ NGUỒN LATEX trong \`\`\`latex ... \`\`\`.
- Mã nguồn phải đầy đủ từ \\documentclass đến \\end{document}, tự định nghĩa mọi macro cần thiết, KHÔNG có placeholder dạng "Viết tiếp ở đây..." hay tóm tắt sơ sài.`;
};
