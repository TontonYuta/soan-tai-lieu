const fs = require("fs");

const files = [
    "services/prompts/learning.ts", 
    "services/prompts/worksheet.ts", 
    "services/prompts/exam.ts", 
    "services/prompts/roadmap.ts", 
    "services/prompts/script.ts",
    "services/prompts/manim.ts",
    "services/prompts/bat.ts"
];

files.forEach(f => {
    if (!fs.existsSync(f)) return;
    let content = fs.readFileSync(f, "utf8");

    // Replace the plain text enforcement with markdown enforcement
    content = content.replace(
        "Đã bỏ bọc markdown \\`\\`\\`latex chưa? Bắt buộc chỉ xuất mã thuần túy.",
        "Đã bọc mã bằng markdown codeblock chưa? Bắt buộc phải đặt toàn bộ code trong block \\`\\`\\` (vd: \\`\\`\\`latex ... \\`\\`\\`)."
    );
    
    content = content.replace(
        "Bắt buộc trả về duy nhất mã LaTeX thuần túy chứa toàn bộ nội dung (KHÔNG bọc trong markdown codeblock). Hãy nhớ: Mộc mạc, dễ hiểu, ưu tiên thực hành, độ khó tăng dần!",
        "Bắt buộc trả về duy nhất một markdown codeblock (```latex) chứa toàn bộ nội dung mã LaTeX. Hãy nhớ: Mộc mạc, dễ hiểu, ưu tiên thực hành, độ khó tăng dần!"
    );

    content = content.replace(
        "Trả về mã LaTeX nguyên bản thuần túy hoàn chỉnh (KHÔNG bọc trong markdown codeblock).",
        "Trả về mã LaTeX nguyên bản hoàn chỉnh được bọc gọn gàng trong markdown codeblock (```latex)."
    );
    
    content = content.replace(
        "TRẢ VỀ DUY NHẤT MÃ NGUỒN LATEX THUẦN TÚY HOÀN CHỈNH (KHÔNG bọc trong markdown). Không giải thích thêm dài dòng.",
        "TRẢ VỀ NỘI DUNG MÃ NGUỒN HOÀN CHỈNH ĐƯỢC BỌC TRONG MARKDOWN CODEBLOCK. Không giải thích thêm dài dòng."
    );

    content = content.replace(
        "TRẢ VỀ DUY NHẤT MÃ NGUỒN SCRIPT .BAT THUẦN TÚY HOÀN CHỈNH (KHÔNG bọc trong markdown codeblock). Không giải thích thêm dài dòng.",
        "TRẢ VỀ MÃ NGUỒN SCRIPT .BAT HOÀN CHỈNH ĐƯỢC BỌC TRONG MARKDOWN CODEBLOCK (```bat). Không giải thích thêm dài dòng."
    );

    fs.writeFileSync(f, content);
    console.log("Updated", f);
});

let latexRules = fs.readFileSync("services/prompts/latex-rules.ts", "utf8");
latexRules = latexRules.replace(
    "TUYỆT ĐỐI không bọc kết quả LaTeX trong block markdown \\`\\`\\`latex ... \\`\\`\\`, mà hãy TRẢ VỀ TEXT THUẦN TÚY (plain text).",
    "BẮT BUỘC phải bọc toàn bộ mã nguồn LaTeX cuối cùng trong block markdown \\`\\`\\`latex ... \\`\\`\\` để tiện cho việc copy."
);
fs.writeFileSync("services/prompts/latex-rules.ts", latexRules);
console.log("Updated latex-rules.ts");

