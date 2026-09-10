import { generateExamPrompt } from "./prompts/exam";
import { generateLearningPrompt } from "./prompts/learning";
import { generateRoadmapPrompt } from "./prompts/roadmap";
import { generateWorksheetPrompt } from "./prompts/worksheet";
import { generateSimilarPrompt } from "./prompts/similar";
import { 
  generateManimStoryboardPrompt, 
  generateManimCodePrompt, 
  generateVideoManimPrompt,
  generateManimRevisionPrompt,
  extractAttachedImageDirective
} from "./prompts/manim";
import { generateVideoScriptPrompt } from "./prompts/script";
import { generateBatPrompt } from "./prompts/bat";
import { generateProjectPrompt } from "./prompts/project";

export {
  generateExamPrompt,
  generateLearningPrompt,
  generateRoadmapPrompt,
  generateWorksheetPrompt,
  generateSimilarPrompt,
  generateManimStoryboardPrompt,
  generateManimCodePrompt,
  generateVideoManimPrompt,
  generateManimRevisionPrompt,
  generateVideoScriptPrompt,
  generateBatPrompt,
  generateProjectPrompt,
  extractAttachedImageDirective
};