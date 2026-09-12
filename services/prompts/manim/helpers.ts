import { VideoConfig } from "../../../types";

export interface OptimalPdfVideoPlan {
  durationSec: number;
  durationLabel: string;
  exerciseCount: number;
  roundCount: number;
  detectedQuestionCount: number;
  inferredTopic: string;
  reason: string;
}

/**
 * Tự động phân tích tài liệu PDF để đề xuất thời lượng, số câu hỏi thực chiến,
 * số dạng bài và trích xuất gợi ý chủ đề cho video bài giảng.
 */
export const detectOptimalDurationFromPdf = (
  attachedPdf?: { fileName?: string; numPages?: number; text?: string } | null
): OptimalPdfVideoPlan => {
  if (!attachedPdf?.text && !attachedPdf?.fileName) {
    return {
      durationSec: 110,
      durationLabel: '110 giây (Chuẩn)',
      exerciseCount: 4,
      roundCount: 2,
      detectedQuestionCount: 0,
      inferredTopic: '',
      reason: 'Không có tài liệu đính kèm, sử dụng thời lượng tiêu chuẩn.'
    };
  }

  const text = (attachedPdf.text || '').trim();
  const numPages = attachedPdf.numPages || 1;
  const fileName = attachedPdf.fileName || '';

  // 1. Đếm số lượng câu hỏi/bài tập có trong tài liệu
  const questionMatches = text.match(/(?:\b(?:Câu|CÂU|Bài|BÀI|Ví dụ|VÍ DỤ|Bài tập|BÀI TẬP)\s*\d+[:.]?)/g) || [];
  const uniqueQuestions = new Set(questionMatches.map(q => q.toLowerCase().replace(/[:.]/g, '').trim()));
  const detectedQuestionCount = Math.max(questionMatches.length > 0 ? uniqueQuestions.size : 0, 0);

  // 2. Trích xuất gợi ý chủ đề (inferredTopic)
  let inferredTopic = '';
  const topicMatch = text.match(/(?:chuyên đề|chủ đề|bài học|bài giảng|đề thi|khảo sát)\s*[:\-–]?\s*([^\n\r,;]{4,60})/i);
  if (topicMatch && topicMatch[1]) {
    inferredTopic = topicMatch[1].replace(/[:\-–]/g, '').trim();
  } else if (fileName) {
    const cleanFileName = fileName
      .replace(/\.pdf$/i, '')
      .replace(/^[cCdD]\d+[_-\s]*/i, '')
      .replace(/[_-]+/g, ' ')
      .trim();
    if (cleanFileName.length >= 3) {
      inferredTopic = cleanFileName;
    }
  }

  // 3. Tính toán thời lượng thích ứng:
  // - Tài liệu ngắn (<= 1 trang, < 1500 ký tự hoặc <= 2 câu hỏi): 75s (Shorts, 2 câu, 1 round)
  // - Tài liệu trung bình (2-3 trang, 1500-5500 ký tự hoặc 3-4 câu hỏi): 120s (2 phút, 4 câu, 2 rounds)
  // - Tài liệu dài tổng hợp (4-5 trang hoặc 5-7 câu hỏi): 180s (3 phút, 4-6 câu, 2-3 rounds)
  // - Tài liệu rất dài chuyên sâu (>= 6 trang, >= 10000 ký tự hoặc >= 8 câu): 240s (4 phút, 6 câu, 3 rounds)
  let durationSec = 120;
  let durationLabel = '120 giây (2 Phút - Tự động theo tài liệu)';
  let exerciseCount = 4;
  let roundCount = 2;
  let reason = '';

  const charLen = text.length;

  if (numPages <= 1 && (charLen < 1500 || detectedQuestionCount <= 2)) {
    durationSec = 75;
    durationLabel = '75 giây (Shorts - Tự động theo tài liệu)';
    exerciseCount = 2;
    roundCount = 1;
    reason = `Tài liệu ngắn (${numPages} trang, ${charLen} ký tự, ${detectedQuestionCount} câu). Thích hợp dạng Shorts 75s cô đọng.`;
  } else if (numPages >= 6 || charLen >= 10000 || detectedQuestionCount >= 8) {
    durationSec = 240;
    durationLabel = '240 giây (4 Phút - Chuyên sâu theo tài liệu)';
    exerciseCount = 6;
    roundCount = 3;
    reason = `Tài liệu chuyên đề dài (${numPages} trang, ${charLen} ký tự, ${detectedQuestionCount} câu). Thích hợp bài giảng chuyên sâu 240s với 3 dạng bài thực chiến.`;
  } else if (numPages >= 4 || charLen >= 5000 || detectedQuestionCount >= 5) {
    durationSec = 180;
    durationLabel = '180 giây (3 Phút - Tự động theo tài liệu)';
    exerciseCount = 6;
    roundCount = 3;
    reason = `Tài liệu tổng hợp (${numPages} trang, ${charLen} ký tự, ${detectedQuestionCount} câu). Thích hợp bài giảng 180s với 3 dạng bài thực chiến.`;
  } else {
    durationSec = 120;
    durationLabel = '120 giây (2 Phút - Tự động theo tài liệu)';
    exerciseCount = Math.max(2, Math.min(4, detectedQuestionCount > 0 ? (detectedQuestionCount <= 2 ? 2 : 4) : 4));
    roundCount = Math.ceil(exerciseCount / 2);
    reason = `Tài liệu tiêu chuẩn (${numPages} trang, ${charLen} ký tự, ${detectedQuestionCount} câu). Thích hợp bài giảng chuẩn 120s với ${roundCount} dạng bài.`;
  }

  return {
    durationSec,
    durationLabel,
    exerciseCount,
    roundCount,
    detectedQuestionCount,
    inferredTopic,
    reason
  };
};

export const sanitizeAndExtractRag = (attachedPdf?: { fileName: string; numPages: number; text: string }): string => {
  if (!attachedPdf?.text) return "";
  const rawText = attachedPdf.text.replace(/\r/g, "");
  const cleaned = rawText
    .replace(/(?:Trang\s+\d+\/\d+|SĐT:?\s*\d{8,12}|Hotline:?\s*\d{8,12}|Website:?\s*\S+)/gi, "")
    .trim();

  let chunk = "";
  if (cleaned.length <= 15000) {
    chunk = cleaned;
  } else {
    const head = cleaned.slice(0, 4000);
    const tail = cleaned.slice(-11000);
    chunk = `${head}\n\n[... CẮT LƯỢC PHẦN GIỮA, NỐI PHẦN BÀI TẬP VÀ ĐÁP ÁN TRỌNG TÂM TRANG SAU ...]\n\n${tail}`;
  }

  return `\n[TÀI LIỆU BÀI HỌC & ĐỀ THI GỐC ĐÍNH KÈM]:
Tên file tài liệu: ${attachedPdf.fileName} (${attachedPdf.numPages} trang)
Nội dung tài liệu gốc:
"""
${chunk}
"""
CHỈ THỊ SƯ PHẠM BẮT BUỘC DỰA TRÊN TÀI LIỆU GỐC CHO VIDEO:
1. KHÁI NIỆM & LÝ THUYẾT CHUẨN MỰC: Các khái niệm, định nghĩa, định lý, công thức và ví dụ minh họa BẮT BUỘC phải trích xuất chính xác theo tài liệu PDF đính kèm. Tuyệt đối không tự bịa đặt hay viết chung chung làm lệch kiến thức gốc trong tài liệu.
2. TÊN ĐỀ BÀI & CÂU HỎI (QUY TẮC ƯU TIÊN 1 DÒNG & CHỐNG XUỐNG DÒNG VÔ TỘI VẠ):
   - Mọi câu hỏi, đề bài, dữ kiện và kết luận NGẮN (<= 14-16 từ hoặc <= 65 ký tự) BẮT BUỘC viết trên CÙNG 1 DÒNG DUY NHẤT. Tuyệt đối CẤM xuống dòng \\n vô tội vạ hoặc chia nhỏ một câu ngắn thành nhiều mobject rồi arrange(DOWN) làm rớt dòng cụt lủn.
   - Nếu kết hợp chữ tiếng Việt và công thức MathTex: Nối ngang trên 1 dòng duy nhất bằng arrange(RIGHT, buff=0.12).
   - Chỉ xuống dòng khi đề bài THỰC SỰ DÀI (> 16 từ), và luôn gọi fit_width(group, 7.8) để tự động co tỷ lệ vừa khít khung thẻ.
   - Không viết hoa toàn bộ (ALL CAPS), chỉ dùng Sentence case.
3. TRÍCH XUẤT BÀI TOÁN & THỰC CHIẾN THEO TỪNG DẠNG BÀI (PRACTICE SECTION):
   - BẮT BUỘC trích xuất chính xác bài toán, câu hỏi, định nghĩa, định lý từ tài liệu trên. Bám sát 100% câu từ, số liệu, giả thiết và kết luận trong tài liệu gốc. TUYỆT ĐỐI KHÔNG tự bịa nội dung khác!
   - NGUYÊN TẮC BẢO VỆ ZERO-OVERLAP: Để chữa nhiều câu (từ 2 đến 6+ câu tùy thời lượng), BẮT BUỘC phân chia thành các Dạng bài độc lập (mỗi dạng gồm 2 câu tiêu biểu: Top Card = Câu lẻ, Bottom Card = Câu chẵn). Khi chữa xong mỗi dạng bài, BẮT BUỘC gọi self.play(FadeOut(group), run_time=0.7) dọn sạch bảng trước khi chuyển sang dạng tiếp theo. TUYỆT ĐỐI KHÔNG để nhiều hơn 2 câu trên màn hình cùng lúc!
4. QUY TẮC CỐT TỬ: TRIỆT TIÊU TOÀN BỘ TỪ NGỮ KỸ THUẬT META TRONG VIDEO VÀ LỜI THOẠI:
   - TUYỆT ĐỐI CẤM xuất hiện các từ ngữ mang tính kỹ thuật meta hoặc hậu trường như: "RAG", "Tài liệu RAG", "Dữ liệu RAG", "Trích từ tài liệu", "Theo tài liệu đính kèm", "Theo tài liệu tham khảo", "Dữ liệu nguồn", "Theo file PDF", "Trích từ file" ở BẤT KỲ ĐÂU:
     * CẤM trong chữ hiển thị trên màn hình: Text(...), tiêu đề thẻ, nhãn, đề bài, kết luận.
     * CẤM trong kịch bản thuyết minh VOICEOVER_SCRIPT.
   - BẮT BUỘC dùng ngôn ngữ sư phạm tự nhiên như giáo viên giảng bài thực tế: "Bài toán thực chiến", "Ví dụ 1", "Câu 1", "Câu 2", "Đề bài", "Phương pháp giải", "Luyện tập trọng tâm", "Chữa đề thi THPT", v.v.
   - Trong lời thuyết minh: "Chào các bạn, hôm nay chúng ta cùng chữa câu hỏi sau...", "Bước đầu tiên ta nhận xét...", "Quan sát bảng biến thiên...", thay vì "Theo tài liệu đính kèm...".
5. Trình bày lời giải sư phạm mạch lạc, đúng và đủ ý chính, phân tích bản chất sâu sắc.\n`;
};

export const getFontDirective = (fontStyle?: string): string => {
  if (fontStyle === 'sans') return 'Be Vietnam Pro';
  return 'Times New Roman'; // Mặc định: Font chữ có chân (Serif)
};

export const extractAttachedImageDirective = (attachedImage?: any): string => {
  if (!attachedImage?.filePath) return "";
  const layoutDesc = attachedImage.layoutMode === 'split_left'
    ? 'Chia đôi màn hình: Nửa trái đặt ảnh ImageMobject, nửa phải đặt công thức MathTex và phân tích.'
    : attachedImage.layoutMode === 'overlay'
    ? 'Vẽ chú thích tương tác: Đặt ảnh ở trung tâm, vẽ các mũi tên Arrow, vòng tròn khoanh vùng và nhãn MathTex trực tiếp lên các điểm quan trọng của ảnh.'
    : 'Bố cục Top Card: Đặt ảnh ImageMobject trọn vẹn trong Top Card, Bottom Card hiển thị lời giải chi tiết và công thức.';

  return `\n[HÌNH ẢNH MINH HỌA ĐÍNH KÈM / SƠ ĐỒ BÀI TOÁN]:
- Tên ảnh: ${attachedImage.fileName}
- Đường dẫn file cục bộ (Dùng nguyên vẹn trong code): r"${attachedImage.filePath}"
- Yêu cầu mô tả của người dùng: "${attachedImage.description || 'Chèn ảnh minh họa vào video và vẽ hoạt họa phân tích'}"
- Kiểu bố cục chỉ định: ${attachedImage.layoutMode || 'top_card'} (${layoutDesc})

QUY TẮC CỐT TỬ KHI SỬ DỤNG ImageMobject TRONG MANIM CE (CHỐNG CRASH 100%):
1. BẮT BUỘC DÙNG Group(...) THAY CHO VGroup(...):
   - ImageMobject kế thừa từ Mobject, KHÔNG PHẢI VMobject. TUYỆT ĐỐI CẤM thêm ImageMobject vào VGroup(...) vì sẽ gây crash TypeError: "Only values of type VMobject can be added as submobjects of VGroup".
   - Do đó, mọi nhóm chứa ảnh PHẢI KHỞI TẠO BẰNG Group(...):
     m_img = ImageMobject(r"${attachedImage.filePath}")
     m_img.scale_to_fit_width(4.5)
     border = SurroundingRectangle(m_img, buff=0.08, color=TEAL_A, stroke_width=2.5, corner_radius=0.15)
     img_group = Group(m_img, border)  # BẮT BUỘC Group, KHÔNG DÙNG VGroup!
2. CO TỶ LỆ VỪA VẶN: Dùng m_img.scale_to_fit_width(4.5) hoặc m_img.scale_to_fit_height(3.8) để ảnh không bao giờ bị to tràn khung hình.
3. HIỆU ỨNG DIỄN HOẠT: self.play(FadeIn(img_group, shift=UP * 0.2), run_time=0.8).
4. TƯƠNG TÁC SƯ PHẠM: Vẽ mũi tên Arrow(start, end, color=YELLOW) hoặc khung nhãn MathTex trỏ vào chi tiết then chốt trên ảnh theo đúng yêu cầu mô tả.\n`;
};

export const parseDurationToSeconds = (
  durationStr?: string,
  defaultSec: number = 110,
  attachedPdf?: { fileName?: string; numPages?: number; text?: string } | null
): number => {
  if (!durationStr || /tự\s*động|auto/i.test(durationStr)) {
    if (attachedPdf?.text || attachedPdf?.fileName) {
      return detectOptimalDurationFromPdf(attachedPdf).durationSec;
    }
    return defaultSec;
  }
  const str = durationStr.toLowerCase().trim();

  // Pattern like "100 - 120 giây", "3 - 5 phút", "100-120s"
  const rangeMatch = str.match(/(\d+(?:\.\d+)?)\s*(?:-|đến|to)\s*(\d+(?:\.\d+)?)/);
  if (rangeMatch) {
    const min = parseFloat(rangeMatch[1]);
    const max = parseFloat(rangeMatch[2]);
    if (!isNaN(min) && !isNaN(max)) {
      const avg = (min + max) / 2;
      if (str.includes('phút') || str.includes('phut') || str.includes('min') || str.includes('m')) {
        return Math.round(avg * 60);
      }
      return Math.round(avg);
    }
  }

  // Pattern like "300s", "300 giây", "300 giay", "300 sec"
  const secMatch = str.match(/(\d+)\s*(?:giây|giay|sec|s\b)/);
  if (secMatch) {
    const secs = parseInt(secMatch[1], 10);
    if (!isNaN(secs) && secs > 0) return secs;
  }

  // Pattern like "5 phút", "5 phut", "5 mins", "5m"
  const minMatch = str.match(/(\d+(?:\.\d+)?)\s*(?:phút|phut|min|m\b)/);
  if (minMatch) {
    const mins = parseFloat(minMatch[1]);
    if (!isNaN(mins) && mins > 0) return Math.round(mins * 60);
  }

  // Just number like "300"
  const numOnlyMatch = str.match(/^(\d+)$/);
  if (numOnlyMatch) {
    const n = parseInt(numOnlyMatch[1], 10);
    if (!isNaN(n) && n > 0) return n;
  }

  return defaultSec;
};

export const getExerciseAndRoundPlan = (
  durationSec: number,
  requestedExerciseCount?: number,
  attachedPdf?: { fileName?: string; numPages?: number; text?: string } | null
) => {
  let exerciseCount = requestedExerciseCount && requestedExerciseCount > 0 ? requestedExerciseCount : 0;
  if (!exerciseCount) {
    if (attachedPdf?.text || attachedPdf?.fileName) {
      const autoPlan = detectOptimalDurationFromPdf(attachedPdf);
      if (Math.abs(durationSec - autoPlan.durationSec) <= 15) {
        exerciseCount = autoPlan.exerciseCount;
      }
    }
    if (!exerciseCount) {
      if (durationSec <= 90) {
        exerciseCount = 2;
      } else if (durationSec <= 170) {
        exerciseCount = 4;
      } else if (durationSec <= 260) {
        exerciseCount = 6;
      } else {
        exerciseCount = 6;
      }
    }
  }
  const roundCount = Math.max(1, Math.ceil(exerciseCount / 2));
  return { exerciseCount, roundCount };
};
