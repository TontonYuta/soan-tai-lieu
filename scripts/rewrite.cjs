const fs = require('fs');

const content = `import { generateExamPrompt } from "./prompts/exam";
import { generateLearningPrompt } from "./prompts/learning";
import { generateRoadmapPrompt } from "./prompts/roadmap";
import { generateWorksheetPrompt } from "./prompts/worksheet";
import { generateVideoManimPrompt } from "./prompts/manim";
import { generateVideoScriptPrompt } from "./prompts/script";

export {
  generateExamPrompt,
  generateLearningPrompt,
  generateRoadmapPrompt,
  generateWorksheetPrompt,
  generateVideoManimPrompt,
  generateVideoScriptPrompt
};`;

fs.writeFileSync('services/gemini.ts', content);
