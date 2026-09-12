import { VideoConfig } from "../../../types";
import { parseDurationToSeconds } from "./helpers";

export interface InspectionIssue {
  id: string;
  category: 'layout' | 'typography' | 'pedagogy' | 'syntax';
  severity: 'error' | 'warning' | 'info';
  title: string;
  message: string;
  fixSuggestion: string;
}

export interface ManimInspectionReport {
  overallScore: number; // 0 - 100
  layoutScore: number;
  typographyScore: number;
  pedagogyScore: number;
  passed: boolean;
  issues: InspectionIssue[];
  metrics: {
    hasVoiceoverScript: boolean;
    wordCount: number;
    targetWords: number;
    hasFitWidth: boolean;
    hasSingleLineIntro: boolean;
    hasSnugBoxes: boolean;
    hasSmartStatusBadge: boolean;
    hasZeroOverlapFadeOut: boolean;
    outroSafe: boolean;
    hasLeanConclusions: boolean;
    hasMinimalBoxes: boolean;
    hasCleanTitleSizes: boolean;
    noMetaJargon: boolean;
    hasNoUnnecessaryLabelBoxes: boolean;
  };
}

/**
 * Bộ kiểm tra tĩnh 0ms (Deterministic Heuristic Linter) cho mã nguồn Manim CE
 * Đối chiếu mã nguồn với 17 Quy Tắc Vàng của Studio.
 */
export const inspectManimCode = (code: string, config?: Partial<VideoConfig>): ManimInspectionReport => {
  const issues: InspectionIssue[] = [];
  const approxSeconds = parseDurationToSeconds(config?.duration, config?.format === 'vertical' ? 110 : 120);
  const targetWords = Math.round(approxSeconds * 2.85);

  let layoutDeduction = 0;
  let typographyDeduction = 0;
  let pedagogyDeduction = 0;

  // 1. KIỂM TRA BỐ CỤC (LAYOUT & SAFE-ZONE)
  // 1.1. fit_width an toàn cho khung hình
  const hasFitWidth = code.includes('fit_width(');
  if (!hasFitWidth) {
    layoutDeduction += 20;
    issues.push({
      id: 'missing_fit_width',
      category: 'layout',
      severity: 'error',
      title: 'Thiếu hàm fit_width bảo vệ tràn viền',
      message: 'Mã nguồn chưa định nghĩa hoặc không gọi fit_width cho các khối nội dung thẻ.',
      fixSuggestion: 'Bổ sung hàm def fit_width(mob, max_width=7.8) và gọi cho mọi VGroup trước khi self.play.'
    });
  }

  // 1.2. Công thức Intro đơn dòng (Anti-2x2)
  let hasSingleLineIntro = true;
  if (code.includes('intro_core_rule')) {
    const introMatch = code.match(/intro_core_rule\s*=\s*VGroup\([\s\S]*?\)\.arrange\([^\)]*\)/);
    if (introMatch) {
      const introBody = introMatch[0];
      if (/\\{2,}/.test(introBody)) {
        hasSingleLineIntro = false;
        layoutDeduction += 15;
        issues.push({
          id: 'intro_formula_line_break',
          category: 'layout',
          severity: 'error',
          title: 'Công thức Intro bị ngắt dòng \\\\',
          message: 'Dấu ngắt dòng \\\\ trong MathTex khiến công thức Intro bị tách rời thành 2 hàng dọc (2x2) dù chỗ trống còn nhiều.',
          fixSuggestion: 'Thay thế \\\\ bằng \\quad \\text{và} \\quad trên cùng 1 dòng đơn duy nhất.'
        });
      }
      // Kiểm tra có bị tách thành > 3 MathTex độc lập khi là chủ đề Max/Min không
      const mathTexCount = (introBody.match(/MathTex\(/g) || []).length;
      if (mathTexCount >= 4 && (introBody.includes('\\max') || introBody.includes('\\min'))) {
        hasSingleLineIntro = false;
        layoutDeduction += 15;
        issues.push({
          id: 'intro_formula_split_items',
          category: 'layout',
          severity: 'error',
          title: 'Định nghĩa Intro bị phân mảnh thành nhiều MathTex',
          message: 'Định nghĩa GTLN/GTNN bị chia thành 4 MathTex riêng biệt khiến dòng "và tồn tại x0" rớt xuống dòng dưới.',
          fixSuggestion: 'Gộp vế f(x) <= M và \\exists x_0 thành 1 MathTex duy nhất cho Max, và 1 MathTex cho Min.'
        });
      }
    }
  }

  // 1.3. Giới hạn chiều cao trục Axes (chống đè tiêu đề Top Card)
  if (code.includes('Axes(')) {
    const yLenMatch = code.match(/y_length\s*=\s*([0-9\.]+)/);
    if (yLenMatch && parseFloat(yLenMatch[1]) > 4.2) {
      layoutDeduction += 10;
      issues.push({
        id: 'axes_y_length_too_large',
        category: 'layout',
        severity: 'warning',
        title: 'Hệ trục Axes vượt chiều cao an toàn',
        message: `y_length = ${yLenMatch[1]} > 4.2, có nguy cơ đè lên tiêu đề Top Card hoặc nhãn cực trị.`,
        fixSuggestion: 'Giảm y_length xuống 3.8 - 4.0 để đảm bảo khoảng cách an toàn.'
      });
    }
  }

  // 1.4. Zero-Overlap: FadeOut giữa các cảnh và An toàn Outro
  const hasZeroOverlapFadeOut = code.includes('FadeOut(');
  if (!hasZeroOverlapFadeOut) {
    layoutDeduction += 15;
    issues.push({
      id: 'missing_fadeout_transition',
      category: 'layout',
      severity: 'error',
      title: 'Thiếu FadeOut dọn dẹp giữa các cảnh',
      message: 'Không tìm thấy lệnh FadeOut dọn màn hình, nội dung cảnh sau sẽ bị đè chồng lên cảnh trước.',
      fixSuggestion: 'Bổ sung self.play(FadeOut(scene_group)) khi kết thúc mỗi phân cảnh.'
    });
  }

  // Outro không được FadeOut làm đen màn hình cuối
  const outroSafe = !/self\.play\(FadeOut\(outro[^\)]*\)\)/i.test(code) && !/self\.play\(FadeOut\([^\)]*\)\)\s*self\.wait/i.test(code.slice(-200));
  if (!outroSafe) {
    layoutDeduction += 15;
    issues.push({
      id: 'outro_blackout_hazard',
      category: 'layout',
      severity: 'error',
      title: 'Outro bị FadeOut làm đen màn hình',
      message: 'Màn hình kết thúc bị FadeOut làm đen ngòm thay vì giữ nguyên thẻ thương hiệu.',
      fixSuggestion: 'Xóa lệnh FadeOut ở cuối video và thay bằng self.wait(3.0).'
    });
  }

  // 1.5. Tiêu đề thẻ Card quá cỡ hoặc bọc box thừa (Oversized Card Title)
  const cardTitleMatch = code.match(/(?:top_title|bot_title|c1_title|c2_title|card_title)\s*=\s*Text\([^)]*font_size\s*=\s*([2-9][5-9]|[3-9][0-9])\b/);
  const bigTitleMatch = code.match(/Text\([^)]*font_size\s*=\s*([3-9][3-9]|[4-9][0-9])\b/);
  const boxedCardTitleMatch = code.match(/SurroundingRectangle\(\s*(?:top_title|bot_title|c1_title|c2_title|card_title)\b/);
  if (cardTitleMatch || bigTitleMatch || boxedCardTitleMatch) {
    layoutDeduction += 15;
    issues.push({
      id: 'oversized_card_title',
      category: 'layout',
      severity: 'error',
      title: 'Tiêu đề thẻ quá cỡ hoặc bị bọc box thừa thãi',
      message: cardTitleMatch ? `Phát hiện tiêu đề thẻ đặt font_size = ${cardTitleMatch[1]} > 22 quá khổ.` : boxedCardTitleMatch ? 'Tiêu đề thẻ bị bọc SurroundingRectangle thừa thãi chiếm diện tích thẻ.' : 'Phát hiện tiêu đề font_size > 32 quá khổ.',
      fixSuggestion: 'Đặt font_size=20-22 (weight=BOLD) cho tiêu đề thẻ, dùng Text trơn và định vị tại .next_to(card.get_top(), DOWN, buff=0.18). Không bọc thêm box.'
    });
  }

  // 1.6. Nhiều box không cần thiết (Redundant Boxes Hazard / Box Inception)
  const innerRedundantBox = code.match(/SurroundingRectangle\(\s*(?:c1_quest|c2_quest|step1|step2|step3|c1_content|c2_content|bot_content|axes|graph)\b/);
  const nestedCard = code.match(/(?:c1_box|c2_box|quest_box|step_box|sol_card|concl_card)\s*=\s*RoundedRectangle/);
  if (innerRedundantBox || nestedCard) {
    layoutDeduction += 15;
    issues.push({
      id: 'redundant_boxes_hazard',
      category: 'layout',
      severity: 'error',
      title: 'Nhiều khung viền thừa thãi (Box Inception)',
      message: 'Phát hiện khung viền bọc quanh đề bài/bước giải hoặc lồng thẻ con bên trong thẻ Card, gây chật chội và bóp nghẹt diện tích bài toán.',
      fixSuggestion: 'Bỏ toàn bộ các box bọc quanh đề bài, bước giải. Chỉ giữ 1 khung nền ngoài cho Card và 1 SurroundingRectangle quanh chữ cái đáp án đúng (opt_correct).'
    });
  }

  // 1.7. Kết luận bài toán quá khổ (Oversized Conclusion)
  const oversizedConcl = code.match(/(?:c1_sol|c2_concl|sol_text|concl_text|conclusion)\s*=\s*VGroup\([^)]*font_size\s*=\s*([2-9][5-9]|[3-9][0-9])/);
  const conclCard = code.match(/(?:c1_concl_box|c2_concl_box|concl_card|ans_card)\s*=\s*RoundedRectangle/);
  if (oversizedConcl || conclCard) {
    layoutDeduction += 15;
    issues.push({
      id: 'oversized_conclusion',
      category: 'layout',
      severity: 'warning',
      title: 'Kết luận bài toán quá khổ hoặc tạo card riêng',
      message: 'Kết luận bài tập bị phóng to (font_size > 24) hoặc tạo khung viền riêng khổng lồ chiếm diện tích.',
      fixSuggestion: 'Trình bày kết luận trên 1 dòng đơn cô đọng: VGroup(Text("➜ ... Chọn", font_size=22), MathTex(r"\\mathbf{...}", font_size=24)).arrange(RIGHT, buff=0.15).'
    });
  }

  // 1.8. Box nhãn phân loại thừa thãi ("Ví dụ minh họa", "Dạng 1", "Dạng 2", "Thực chiến")
  const unnecessaryLabelBoxMatch = code.match(/(?:pill|qz_pill|vd_box|vd_pill|dang_box|dang\d?_box|dang_pill|dang\d?_pill|label_box)\s*=\s*(?:RoundedRectangle|SurroundingRectangle)/)
    || code.match(/SurroundingRectangle\(\s*(?:pill_txt|qz_pill_txt|vd_txt|vd_lbl|dang\d?_txt|dang\d?_lbl|type_txt|type_lbl|label_txt)\b/);
  const hasNoUnnecessaryLabelBoxes = !Boolean(unnecessaryLabelBoxMatch);
  if (!hasNoUnnecessaryLabelBoxes) {
    layoutDeduction += 15;
    issues.push({
      id: 'unnecessary_label_box',
      category: 'layout',
      severity: 'error',
      title: 'Khung viền nhãn phân loại thừa thãi ("Ví dụ minh họa", "Dạng 1", "Dạng 2")',
      message: 'Phát hiện khung viền (RoundedRectangle / SurroundingRectangle) bọc quanh nhãn phân loại như "Ví dụ minh họa", "Dạng 1", "Dạng 2", "Thực chiến". Các box này chiếm bề ngang, dễ gây tràn viền và lỗi bố cục.',
      fixSuggestion: 'Bỏ hoàn toàn khung viền bao quanh nhãn. Chỉ dùng Text trơn (font_size=20-22, weight=BOLD, color=TEAL_A hoặc YELLOW) kết hợp trực tiếp với tiêu đề.'
    });
  }

  // 2. KIỂM TRA TYPOGRAPHY & FONT CHỮ
  // 2.1. Cấm ALL CAPS ở tiêu đề
  const allCapsMatch = code.match(/Text\(\s*["']([A-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠƯẠ-Ỵ\s]{6,})["']/);
  if (allCapsMatch && !allCapsMatch[1].includes('TOÁN') && !allCapsMatch[1].includes('THPT')) {
    typographyDeduction += 15;
    issues.push({
      id: 'all_caps_title_violation',
      category: 'typography',
      severity: 'warning',
      title: 'Tiêu đề viết hoa toàn bộ (ALL CAPS)',
      message: `Phát hiện tiêu đề viết hoa toàn bộ: "${allCapsMatch[1].trim()}" vi phạm quy tắc chính tả tiếng Việt.`,
      fixSuggestion: 'Chuyển sang Sentence case (chỉ viết hoa chữ cái đầu và tên riêng).'
    });
  }

  // 2.2. Ký tự unicode mũ / chỉ số trong Text(...)
  const unicodeSuperscript = code.match(/Text\([^)]*([²³¹⁰⁴⁵⁶⁷⁸⁹₀₁₂₃₄₅₆₇₈₉])\s*[,)]/);
  if (unicodeSuperscript) {
    typographyDeduction += 20;
    issues.push({
      id: 'unicode_superscript_in_text',
      category: 'typography',
      severity: 'error',
      title: 'Dùng ký tự mũ unicode trong Text(...)',
      message: `Ký tự "${unicodeSuperscript[1]}" trong Text(...) gây lỗi vỡ font / thiếu glyph trên Linux/Windows.`,
      fixSuggestion: 'Chuyển sang MathTex(r"...") cho mọi số mũ (x^2, x^3) và chỉ số dưới.'
    });
  }

  // 2.3. Cỡ chữ li ti (font_size < 20)
  const smallFontMatch = code.match(/font_size\s*=\s*(1[0-9]|[1-9])\b/);
  if (smallFontMatch) {
    typographyDeduction += 10;
    issues.push({
      id: 'font_size_too_small',
      category: 'typography',
      severity: 'warning',
      title: 'Cỡ chữ quá nhỏ (< 20)',
      message: `Phát hiện font_size = ${smallFontMatch[1]} < 20, gây khó đọc trên điện thoại.`,
      fixSuggestion: 'Tăng font_size lên tối thiểu 20 (tiêu đề 28-32, thẻ 22-24, MathTex 24-28).'
    });
  }

  // 2.4. Nội dung bị thu nhỏ quá mức hoặc dòng text quá dài (Shrunk Content Hazard)
  const extremeScaleMatch = code.match(/(?:c1_content|c2_content|bot_content|conclusions|theory_stack)\.scale\(\s*(0\.[0-7][0-9]*|0\.80\b)/);
  const longLineMatch = code.match(/Text\(\s*["']([^"'\n]{65,})["']/);
  if (extremeScaleMatch || longLineMatch) {
    typographyDeduction += 15;
    issues.push({
      id: 'shrunk_content_hazard',
      category: 'typography',
      severity: 'warning',
      title: 'Nội dung bị thu nhỏ quá mức hoặc dòng text quá dài',
      message: extremeScaleMatch ? 'Phát hiện lệnh .scale(< 0.85) làm nội dung thẻ bị co rúm li ti, khó đọc trên điện thoại.' : `Dòng text dài ${longLineMatch![1].length} ký tự (> 65), kích hoạt fit_width co nhỏ toàn bộ chữ trong thẻ.`,
      fixSuggestion: 'Chủ động ngắt câu dài thành 2 dòng ngắn (<= 50 ký tự), bỏ lệnh .scale ép nhỏ, giữ font_size=22 cho Text và 24-28 cho MathTex.'
    });
  }

  // 3. KIỂM TRA NỘI DUNG & SƯ PHẠM (PEDAGOGY & TTS SYNC)
  // 3.1. Kịch bản thuyết minh VOICEOVER_SCRIPT
  const voiceMatch = code.match(/VOICEOVER_SCRIPT\s*=\s*"""([\s\S]*?)"""/);
  const hasVoiceoverScript = Boolean(voiceMatch);
  let wordCount = 0;
  if (voiceMatch) {
    wordCount = voiceMatch[1].trim().split(/\s+/).filter(Boolean).length;
    if (Math.abs(wordCount - targetWords) > targetWords * 0.35) {
      pedagogyDeduction += 10;
      issues.push({
        id: 'voiceover_word_count_mismatch',
        category: 'pedagogy',
        severity: 'warning',
        title: 'Độ dài kịch bản lệch thời lượng mục tiêu',
        message: `Kịch bản có ${wordCount} từ (chuẩn cho ${approxSeconds}s là ~${targetWords} từ, độ lệch > 35%).`,
        fixSuggestion: `Điều chỉnh kịch bản đạt xấp xỉ ${targetWords} từ để tốc độ đọc đạt chuẩn tự nhiên ~2.85 từ/giây.`
      });
    }
  } else {
    pedagogyDeduction += 20;
    issues.push({
      id: 'missing_voiceover_script',
      category: 'pedagogy',
      severity: 'warning',
      title: 'Thiếu kịch bản thuyết minh VOICEOVER_SCRIPT',
      message: 'Mã nguồn không khai báo biến VOICEOVER_SCRIPT để đồng bộ giọng đọc AI.',
      fixSuggestion: 'Khai báo VOICEOVER_SCRIPT = """...""" khớp với 5 phân cảnh bài học.'
    });
  }

  // 3.2. Thanh trạng thái bắt điểm cực trị (Smart Snap Status Badge)
  const hasSmartStatusBadge = code.includes('status_badge') && (/abs\(\s*(?:t\b|t_tracker|tracker|\w+\.get_value\(\))\s*-/i.test(code) || code.includes('abs(t -') || code.includes('abs(t-'));
  if (code.includes('Axes(') && code.includes('always_redraw') && !hasSmartStatusBadge) {
    pedagogyDeduction += 5;
    issues.push({
      id: 'status_badge_missing_snap',
      category: 'pedagogy',
      severity: 'info',
      title: 'Nên nâng cấp thanh trạng thái bắt điểm cực trị',
      message: 'Thanh trạng thái hiện tại chỉ kiểm tra dấu thông thường, chưa có tính năng bắt điểm cực trị real-time khi tiếp tuyến lướt qua x₀.',
      fixSuggestion: 'Thêm điều kiện abs(t - x₀) < 0.16 để đổi màu thẻ xanh/đỏ và báo giá trị cực trị cụ thể.'
    });
  }

  // 3.3. Kiểm tra từ ngữ kỹ thuật Meta rác trong video hoặc kịch bản (Meta Jargon Hazard)
  const metaJargonRegex = /(?:\b(?:RAG|tài liệu RAG)\b|trích từ tài liệu|trích từ file|theo tài liệu|dựa trên tài liệu|dữ liệu nguồn|theo file pdf)/i;
  const scriptText = voiceMatch ? voiceMatch[1] : '';
  const onScreenTexts = (code.match(/(?:Text|MathTex)\(\s*(?:r?["']|f["'])([^"'\n]+)["']/g) || []).join(' ');

  const hasMetaInScript = metaJargonRegex.test(scriptText);
  const hasMetaOnScreen = metaJargonRegex.test(onScreenTexts);

  if (hasMetaInScript || hasMetaOnScreen) {
    pedagogyDeduction += 20;
    const where = hasMetaOnScreen && hasMetaInScript ? 'trên màn hình (Text) và trong kịch bản' : hasMetaOnScreen ? 'trên màn hình (Text)' : 'trong kịch bản thuyết minh (VOICEOVER_SCRIPT)';
    issues.push({
      id: 'meta_jargon_in_video',
      category: 'pedagogy',
      severity: 'error',
      title: 'Xuất hiện từ ngữ kỹ thuật Meta ("RAG", "Trích từ tài liệu")',
      message: `Phát hiện từ ngữ meta (${where}). Video giáo dục phải sử dụng ngôn ngữ sư phạm tự nhiên, không để lộ thuật ngữ kỹ thuật hậu trường.`,
      fixSuggestion: 'Thay các cụm "RAG", "Trích từ tài liệu" bằng cách xưng hô sư phạm tự nhiên: "Câu 1", "Bài tập thực chiến", "Ví dụ minh họa", "Đề bài".'
    });
  }

  // 4. KIỂM TRA CÚ PHÁP LỖI THƯỜNG GẶP (ZERO-HALLUCINATION GUARD)
  if (code.includes('font_color=')) {
    issues.push({
      id: 'syntax_invalid_font_color',
      category: 'syntax',
      severity: 'error',
      title: 'Thuộc tính ma quỷ: font_color',
      message: 'Manim CE không có thuộc tính font_color trong Text.',
      fixSuggestion: 'Đổi thành color=...'
    });
  }
  if (/Group\([^)]*ImageMobject/i.test(code) && code.includes('VGroup(') && /VGroup\([^)]*ImageMobject/i.test(code)) {
    issues.push({
      id: 'imagemobject_in_vgroup',
      category: 'syntax',
      severity: 'error',
      title: 'ImageMobject nằm trong VGroup (Gây Crash TypeError)',
      message: 'ImageMobject không phải là VMobject nên không thể chứa trong VGroup.',
      fixSuggestion: 'Sử dụng Group(...) thay vì VGroup(...) để chứa ImageMobject.'
    });
  }

  const layoutScore = Math.max(0, 100 - layoutDeduction);
  const typographyScore = Math.max(0, 100 - typographyDeduction);
  const pedagogyScore = Math.max(0, 100 - pedagogyDeduction);
  const overallScore = Math.round((layoutScore * 0.45) + (typographyScore * 0.25) + (pedagogyScore * 0.30));

  return {
    overallScore,
    layoutScore,
    typographyScore,
    pedagogyScore,
    passed: overallScore >= 80 && !issues.some(i => i.severity === 'error'),
    issues,
    metrics: {
      hasVoiceoverScript,
      wordCount,
      targetWords,
      hasFitWidth,
      hasSingleLineIntro,
      hasSnugBoxes: code.includes('SurroundingRectangle('),
      hasSmartStatusBadge,
      hasZeroOverlapFadeOut,
      outroSafe,
      hasLeanConclusions: !Boolean(oversizedConcl || conclCard),
      hasMinimalBoxes: !Boolean(innerRedundantBox || nestedCard),
      hasCleanTitleSizes: !Boolean(cardTitleMatch || bigTitleMatch || boxedCardTitleMatch),
      noMetaJargon: !hasMetaInScript && !hasMetaOnScreen,
      hasNoUnnecessaryLabelBoxes,
    }
  };
};

/**
 * Tạo Prompt Double-Check cho AI: Đóng vai Giám Định Viên Bố Cục & Sư Phạm
 * Soi chiếu toàn bộ mã nguồn vào kết quả linter và 17 Quy Tắc Vàng, tự động xuất mã sửa hoàn hảo.
 */
export const generateManimDoubleCheckPrompt = (
  code: string,
  config?: Partial<VideoConfig>,
  report?: ManimInspectionReport
): string => {
  const currentReport = report || inspectManimCode(code, config);
  const issuesList = currentReport.issues.map((iss, idx) => 
    `  ${idx + 1}. [${iss.category.toUpperCase()} - ${iss.severity.toUpperCase()}] (${iss.id}) ${iss.title}: ${iss.message}\n     ➜ Khắc phục: ${iss.fixSuggestion}`
  ).join('\n');

  return `Đóng vai Chuyên gia Giám định Kỹ thuật Hoạt họa Manim CE & Sư phạm Studio (Yuta Academy QA Inspector).
Nhiệm vụ của bạn là THẨM ĐỊNH KÉP (DOUBLE-CHECK) VÀ TỰ ĐỘNG CHỮA LỖI HOÀN THIỆN 100% cho file mã nguồn Manim Python dưới đây.

I. BÁO CÁO THẨM ĐỊNH TỰ ĐỘNG BAN ĐẦU (LINTER AUDIT REPORT):
- Điểm tổng thể: ${currentReport.overallScore}/100 (Bố cục: ${currentReport.layoutScore}/100, Typography: ${currentReport.typographyScore}/100, Sư phạm: ${currentReport.pedagogyScore}/100)
- Trạng thái kiểm duyệt: ${currentReport.passed ? '✅ ĐẠT TIÊU CHUẨN' : '⚠️ CẦN TINH CHỈNH'}
${currentReport.issues.length > 0 ? `DANH SÁCH CÁC ĐIỂM CẦN KHẮC PHỤC NGAY LẬP TỨC:\n${issuesList}` : 'Không phát hiện lỗi tĩnh cơ bản, hãy tiến hành rà soát chuyên sâu.'}

II. BỘ QUY TẮC BẮT BUỘC SO CHIẾU (17 QUY TẮC VÀNG STUDIO):
1. BỐ CỤC KHUNG THẺ CHUẨN (DUAL-ZONE 9:16):
   - Header Bar trên cùng, Top Card (đồ thị Axes, y_length <= 4.0), Bottom Card (BBT 3 tầng, đạo hàm), Outro Card toàn màn hình.
   - BẮT BUỘC gọi fit_width(group, 7.8) cho mọi khối nội dung trong thẻ.
2. PHÂN CẤP TIÊU ĐỀ CHUẨN MỰC (TITLE HIERARCHY):
   - Tiêu đề chính Intro: font_size=28-32 BOLD, Sentence case (CẤM > 32).
   - Tiêu đề Header Bar: font_size=22-24 BOLD.
   - TIÊU ĐỀ THẺ CARD (top_title, bot_title, c1_title, c2_title): BẮT BUỘC font_size=20-22 BOLD (CẤM TUYỆT ĐỐI font_size > 22!). Đặt tại .next_to(card.get_top(), DOWN, buff=0.18). TUYỆT ĐỐI CẤM bọc thêm viền box quanh tiêu đề thẻ!
3. TỐI GIẢN KHUNG VIỀN - TRIỆT TIÊU LỒNG HỘP RÁC & BOX NHÃN (ZERO REDUNDANT BOXES):
   - Mỗi vùng chỉ có ĐÚNG 1 khung nền ngoài (top_card, bottom_card).
   - CẤM TUYỆT ĐỐI bọc box / pill / khung viền quanh nhãn phân loại như "Ví dụ minh họa", "Ví dụ", "Dạng 1", "Dạng 2", "Thực chiến"! Chỉ dùng Text trơn (font_size=20-22, weight=BOLD, color=TEAL_A hoặc YELLOW) gắn kèm tiêu đề.
   - CẤM bọc box quanh: tiêu đề thẻ, câu hỏi/đề bài, các bước giải, bảng biến thiên!
   - CHỈ DUY NHẤT 1 hộp khoanh đáp án đúng: SurroundingRectangle(opt_correct, color=GREEN, buff=0.12-0.14, corner_radius=0.08, stroke_width=2.5) ôm quanh chữ cái đáp án đúng (A/B/C/D) trong hàng đáp án.
4. KẾT LUẬN BÀI TẬP TINH GỌN (LEAN 1-LINE CONCLUSION):
   - Kết luận bài tập là 1 dòng đơn cô đọng: VGroup(Text("➜ [Khẳng định ngắn gọn]. Chọn", font_size=22, color=GREEN_B, weight=BOLD), MathTex(r"\mathbf{[ĐÁP ÁN]}", font_size=24, color=GREEN)).arrange(RIGHT, buff=0.15).
   - CẤM font_size > 24 cho kết luận, CẤM tạo thẻ con RoundedRectangle riêng cho kết luận!
5. CHỐNG THU NHỎ NỘI DUNG & BẢO VỆ ĐỘ SẮC NÉT (ANTI-SHRINK LEGIBILITY):
   - Công thức toán MathTex: font_size=24 đến 28 (to rõ, sắc sảo).
   - Văn bản tiếng Việt diễn giải / đề bài: font_size=22 (CẤM font_size < 22).
   - Bảng biến thiên BBT: font_size=22 đến 24 (arraystretch=1.25 - 1.3).
   - Mọi dòng Text / MathTex KHÔNG ĐƯỢC dài quá 50-55 ký tự (nếu dài hơn phải ngắt thành 2 dòng ngắn) để không kích hoạt fit_width co nhỏ chữ li ti!
   - Dùng buff=0.14-0.18 khi arrange(DOWN). CẤM TUYỆT ĐỐI dùng .scale(< 0.85) trên các khối nội dung thẻ!
6. CÔNG THỨC INTRO ĐÚNG 1 DÒNG ĐƠN (ANTI-2X2):
   - Mỗi định nghĩa/công thức cốt lõi nằm trọn vẹn trên ĐÚNG 1 DÒNG ĐƠN trong 1 MathTex duy nhất.
   - TUYỆT ĐỐI KHÔNG ngắt dòng bằng \\\\ bên trong MathTex và TUYỆT ĐỐI KHÔNG tách thành 2 MathTex rời rạc làm rớt dòng cụt lủn.
   - Luôn gọi fit_width(intro_core_rule, 7.6).
7. 4 ĐÁP ÁN LIỀN KHỐI (ATOMIC OPTIONS):
   - Nhãn A, B, C, D nằm cùng hàng với nội dung, khóa cột 2x2 hoặc 4x1, không bao giờ để chữ nhãn cô độc một dòng.
8. TYPOGRAPHY & CHÍNH TẢ:
   - Dùng Sentence case, TUYỆT ĐỐI KHÔNG viết hoa toàn bộ (ALL CAPS).
   - 100% số mũ/chỉ số dưới dùng MathTex(r"..."). Không dùng ký tự unicode mũ trong Text(...).
9. SƯ PHẠM & THANH TRẠNG THÁI:
   - Thanh trạng thái real-time có tính năng bắt điểm cực trị khi tiếp tuyến lướt qua x₀ (abs(t - x₀) < 0.16).
   - Phân biệt rõ 3 khái niệm cực trị (x₀, y₀, M) và bẫy nghiệm bội chẵn.
10. ZERO-OVERLAP & AN TOÀN OUTRO:
   - Dọn sạch cảnh cũ bằng FadeOut giữa các phân cảnh.
   - Riêng thẻ Outro cuối video: GIỮ NGUYÊN self.wait(3.0), TUYỆT ĐỐI KHÔNG FadeOut làm đen màn hình!
11. TRIỆT TIÊU TỪ NGỮ KỸ THUẬT META:
   - TUYỆT ĐỐI CẤM các từ: "RAG", "Trích từ tài liệu", "Theo tài liệu đính kèm", "Dữ liệu nguồn", "Theo file PDF" trong Text(...) và VOICEOVER_SCRIPT.
   - Sử dụng 100% ngôn ngữ giảng dạy tự nhiên ("Câu 1", "Bài tập thực chiến", "Ví dụ minh họa", "Đề bài").

III. MÃ NGUỒN CẦN THẨM ĐỊNH & TINH CHỈNH:
\`\`\`python
${code}
\`\`\`

IV. YÊU CẦU ĐẦU RA:
1. Trả về đúng 1 bảng tóm tắt ngắn gọn các điểm đã sửa.
2. Xuất toàn bộ file mã nguồn Manim Python (\`scene.py\`) HOÀN THIỆN 100%, ĐÃ ĐƯỢC CHỮA HẾT MỌI LỖI BỐ CỤC VÀ ĐẢM BẢO CHẠY THÀNH CÔNG KHÔNG LỖI trong duy nhất 1 khối mã \`\`\`python ... \`\`\`.`;
};
