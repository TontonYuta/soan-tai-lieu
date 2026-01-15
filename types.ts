
export interface ExamConfig {
  school: string;       
  examName: string;     
  year: string;         
  subject: string;
  topic: string;
  grade: string;
  time: number;
  counts: {
    mc: number; 
    essay: number; 
  };
  matrix: {
    lv1: number; 
    lv2: number; 
    lv3: number; 
    lv4: number; 
  };
  referenceContent?: string;
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
}

export interface RoadmapConfig {
  subject: string;
  topic: string;
  duration: string; // Vd: 4 tuần, 3 tháng
  currentLevel: string; // Vd: Mất gốc, Đã có căn bản
  target: string; // Vd: Thi HSG, Đạt điểm 8+
}

export enum GenerationStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}
