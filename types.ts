export interface AttachedPdfData {
  fileName: string;
  tempPath?: string;
  numPages: number;
  fileSize?: string;
  text: string;
}

export interface ExamConfig {
  school: string;       
  examName: string;     
  year: string;         
  subject: string;
  topic: string;
  grade: string;
  time: number;
  examFormat: 'standard2025' | 'classic'; // Chuẩn 3 phần 2025 hoặc Cổ điển
  counts: {
    part1_mc: number;  // Phần I: Trắc nghiệm 4 lựa chọn
    part2_tf: number;  // Phần II: Trắc nghiệm Đúng / Sai (4 ý a,b,c,d)
    part3_sa: number;  // Phần III: Trắc nghiệm Trả lời ngắn
    essay?: number;    // Tự luận (dành cho đề classic)
    mc?: number;       // Trắc nghiệm classic
  };
  matrix: {
    lv1: number; // Nhận biết
    lv2: number; // Thông hiểu
    lv3: number; // Vận dụng
    lv4: number; // Vận dụng cao
  };
  includeTikZ?: boolean; // Tự động vẽ hình học / đồ thị / BBT TikZ
  referenceContent?: string;
  attachedPdf?: AttachedPdfData;
  language?: 'bilingual' | 'vietnamese' | 'english';
  details?: string;
}

export interface LearningConfig {
  school: string; 
  year: string;   
  subject: string;
  grade: string;
  topic: string; 
  goal: 'summary' | 'detailed' | 'exercises'; 
  tone: 'academic' | 'creative' | 'simple'; 
  audience: string;
  attachedPdf?: AttachedPdfData;
  language?: 'bilingual' | 'vietnamese' | 'english';
  details?: string;
}

export interface RoadmapConfig {
  subject: string;
  topic: string;
  duration: string; // Vd: 4 tuần, 3 tháng
  currentLevel: string; // Vd: Mất gốc, Đã có căn bản
  target: string; // Vd: Thi HSG, Đạt điểm 8+
  syllabus?: string; // Đề cương có sẵn (Tùy chọn)
  attachedPdf?: AttachedPdfData;
  language?: 'bilingual' | 'vietnamese' | 'english';
  details?: string;
}

export interface WorksheetConfig {
  subject: string;
  topic: string;
  grade: string;
  teacherName: string;
  attachedPdf?: AttachedPdfData;
  language?: 'bilingual' | 'vietnamese' | 'english';
  details?: string;
}

export interface SimilarExerciseConfig {
  subject: string;
  topic: string;
  grade?: string;
  sourceExercises: string;
  count: number;
  difficulty: 'keep' | 'easier' | 'harder';
  includeSolution: boolean;
  attachedPdf?: AttachedPdfData;
  language?: 'bilingual' | 'vietnamese' | 'english';
  details?: string;
}

export interface PlaylistItem {
  episode: number;
  title: string;
  description?: string;
  videoUrl?: string;
  videoPath?: string;
  audioUrl?: string;
  audioPath?: string;
  duration?: string;
  manimCode?: string;
}

export interface VideoConfig {
  subject: string;
  topic: string;
  duration: string;
  tone: 'academic' | 'creative' | 'simple';
  audience: string;
  format: 'horizontal' | 'vertical';
  category?: 'math' | 'physics' | 'chemistry' | 'computer_science' | 'biology' | 'economics' | 'general' | string;
  mathType?: string;
  hookType?: 'trap' | 'visual_intuition' | 'fast_trick' | 'real_world';
  renderQuality?: '480p' | '1080p' | '4k';
  fps?: 30 | 60;
  safeZoneShorts?: boolean;
  attachedPdf?: AttachedPdfData;
  language?: 'bilingual' | 'vietnamese' | 'english';
  details?: string;
  // Giọng đọc AI (TTS Voiceover)
  enableVoice?: boolean;
  voiceName?: 'vi-VN-HoaiMyNeural' | 'vi-VN-NamMinhNeural' | string;
  voiceSpeed?: string;
  // Chế độ Series / Playlist
  isSeries?: boolean;
  seriesCount?: number;
  seriesOutline?: string;
  currentEpisodeIndex?: number;
  playlistVideos?: PlaylistItem[];
}

export interface BatConfig {
  task: string;
  details?: string;
}

export interface TTSConfig {
  subject: string;
  topic: string;
  content: string;
  style: 'normal' | 'expressive' | 'fast';
  emphasize: boolean;
  keepTerms: boolean;
}

export enum GenerationStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}