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
  referenceContent?: string; // Nội dung bài học tham khảo để đồng bộ
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

export enum GenerationStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}