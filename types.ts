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
  language?: 'bilingual' | 'vietnamese' | 'english';
  details?: string;
}

export interface WorksheetConfig {
  subject: string;
  topic: string;
  grade: string;
  teacherName: string;
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
  language?: 'bilingual' | 'vietnamese' | 'english';
  details?: string;
}

export interface VideoConfig {
  subject: string;
  topic: string;
  duration: string;
  tone: 'academic' | 'creative' | 'simple';
  audience: string;
  format: 'horizontal' | 'vertical';
  mathType?: 'calculus' | '3d_geometry' | 'trigonometry' | 'algebra' | 'vector' | 'custom';
  renderQuality?: '480p' | '1080p' | '4k';
  fps?: 30 | 60;
  safeZoneShorts?: boolean;
  details?: string;
}

export interface BatConfig {
  task: string;
  details?: string;
}

export enum GenerationStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}