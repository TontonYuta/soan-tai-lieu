const fs = require("fs");

const files = [
    "services/prompts/learning.ts", 
    "services/prompts/worksheet.ts", 
    "services/prompts/exam.ts", 
    "services/prompts/roadmap.ts", 
    "services/prompts/script.ts",
    "services/prompts/manim.ts",
    "services/prompts/bat.ts",
    "services/prompts/latex-rules.ts"
];

files.forEach(f => {
    if (!fs.existsSync(f)) return;
    let content = fs.readFileSync(f, "utf8");

    // Replace unescaped backticks that are NOT supposed to terminate the string.
    // In our case, the backticks are ```latex or ```bat. We can just replace all ``` with \`\`\` inside the string.
    // A safe way: split by newlines, if a line has ``` but not inside a literal, fix it.
    // Actually, I can just do a regex replace for ``` that is preceded by something or followed by something, but it's risky.
    // Let's just fix the exact phrases we inserted.
    content = content.replace(/```latex/g, "\\`\\`\\`latex");
    content = content.replace(/```bat/g, "\\`\\`\\`bat");
    content = content.replace(/\(```\)/g, "(\\`\\`\\`)");

    fs.writeFileSync(f, content);
    console.log("Fixed backticks in", f);
});
