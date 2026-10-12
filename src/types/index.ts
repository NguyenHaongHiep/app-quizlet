/**
 * Định nghĩa kiểu dữ liệu cho hệ thống UniFlash & Quiz
 */

export type QuestionType = 'multiple_choice' | 'fill_blank' | 'matching' | 'ordering';

export interface MatchingPair {
  id: string;
  left: string;   // Khái niệm / Thuật ngữ
  right: string;  // Định nghĩa / Ý nghĩa
}

export interface Question {
  id: string;
  type: QuestionType;
  prompt: string;                      // Nội dung câu hỏi / đề bài
  options?: string[];                  // 4 lựa chọn cho trắc nghiệm [A, B, C, D]
  correctAnswer: string;               // Đáp án đúng (hoặc danh sách nối / thứ tự dạng JSON string)
  matchingPairs?: MatchingPair[];      // Dành cho dạng nối khái niệm
  orderingItems?: string[];            // Dành cho dạng sắp xếp thứ tự đúng
  
  // Phản hồi chi tiết
  explanation: string;                 // Lý do & giải thích tại sao đúng
  example?: string;                    // Ví dụ minh họa thực tế
  memoryTip?: string;                  // Mẹo ghi nhớ / Mnemonic độc đáo
  
  // Trạng thái học tập của người dùng
  starred?: boolean;                   // Đánh dấu câu khó / cần ôn
  mastered?: boolean;                  // Đã thuộc / thành thạo
  lastAnsweredCorrect?: boolean;
}

export interface StudySet {
  id: string;
  courseId: string;                    // Thuộc học phần nào
  title: string;                       // Tiêu đề bộ thẻ
  description: string;                 // Mô tả tóm tắt
  color?: string;                      // Màu sắc chủ đạo bộ thẻ
  icon?: string;                       // Biểu tượng
  questions: Question[];               // Danh sách câu hỏi
  createdAt: string;
  updatedAt: string;
}

export interface Course {
  id: string;
  code: string;                        // Mã học phần (VD: ENG201, PHI101, MAT102)
  name: string;                        // Tên học phần (VD: Tiếng Anh Chuyên Ngành, Triết học Mác-Lênin)
  description: string;
  icon: string;
  color: string;                       // Mã màu đại diện
  semester?: string;                   // Kỳ học (VD: Học kỳ 1 - 2026)
  createdAt: string;
}

export type StudyMode = 'flashcard' | 'quiz' | 'match' | 'write';

export interface UserStats {
  streakDays: number;
  totalCardsStudied: number;
  quizzesCompleted: number;
  accuracyRate: number;
}
