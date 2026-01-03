export interface ExamConfig {
  school: string;       // Tên Trường / Sở GD&ĐT
  examName: string;     // Tên kỳ thi (VD: Giữa học kỳ I)
  year: string;         // Năm học
  subject: string;
  topic: string;
  grade: string;
  time: number;
  counts: {
    mc: number; // Multiple choice count
    essay: number; // Essay count
  };
  matrix: {
    lv1: number; // Nhận biết (số câu)
    lv2: number; // Thông hiểu (số câu)
    lv3: number; // Vận dụng (số câu)
    lv4: number; // Vận dụng cao (số câu)
  };
}

export interface LearningConfig {
  school: string; // Tên Trường / Sở GD&ĐT
  year: string;   // Năm học
  subject: string;
  grade: string;
  topic: string; // Chủ đề bài học
  goal: 'summary' | 'detailed' | 'exercises'; // Mục tiêu: Tóm tắt, Chi tiết, Bài tập luyện tập
  tone: 'academic' | 'creative' | 'simple'; // Phong cách: Hàn lâm, Sáng tạo, Dễ hiểu
  audience: string; // Đối tượng học sinh (VD: Mất gốc, Khá giỏi)
}

export enum GenerationStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}