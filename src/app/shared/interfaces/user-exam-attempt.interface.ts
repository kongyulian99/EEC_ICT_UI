export interface UserExamAttemptInfo {
  Id: number;
  User_Id: number;
  Exam_Id: number;
  Attempt_Number: number;
  Start_Time: Date;
  End_Time?: Date;
  Total_Score: number;
  Passed: boolean;
}

export interface UserAnswer {
  QuestionId: number;
  AnswerGivenJson: string;
  TimeSpentSeconds: number;
}

export interface UserAnswerResult {
  QuestionId: number;
  AnswerId: number;
  IsCorrect: boolean;
  ScoreAchieved: number;
}

export interface ScoreExamRequest {
  UserId: number;
  ExamId: number;
  AttemptId?: number;
  AttemptNumber?: number;
  Answers?: UserAnswer[];
}

/**
 * Interface mô tả yêu cầu lấy lịch sử làm bài của người dùng
 */
export interface UserExamHistoryRequest {
  UserId: number;
  ExamId?: number;
  LimitRecentAttempts?: number;
}

/**
 * Interface mô tả thông tin lịch sử làm bài của người dùng
 */
export interface UserExamHistoryItem {
  AttemptId: number;
  AttemptNumber: number;
  ExamId: number;
  ExamTitle: string;
  TotalQuestions: number;
  Score: number;
  PassScore: number;
  Passed: boolean;
  StartTime: Date;
  EndTime?: Date;
  DurationMinutes: number;
  DurationFormatted: string;
  CompletionStatus: string;
}

/**
 * Interface mô tả phản hồi của API khi chấm điểm bài thi
 */
export interface ScoreExamResponse {
  AttemptId: number;
  AttemptNumber: number;
  UserId: number;
  ExamId: number;
  ExamTitle: string;
  FinalScore: number;
  PassScore: number;
  Passed: boolean;
  TotalQuestions: number;
  CorrectAnswers: number;
  IncorrectAnswers: number;
  UnansweredQuestions: number;
  StartTime: Date;
  EndTime?: Date;
  Duration: string;
  TotalTimeInSeconds: number;
  DetailedAnswers: DetailedAnswer[];
}

/**
 * Interface mô tả chi tiết câu trả lời
 */
export interface DetailedAnswer {
  Id: number;
  Question_Id: number;
  Answer_Given_Json: string;
  Is_Correct: boolean;
  Score_Achieved: number;
  Time_Spent_Seconds: number;
}

/**
 * Interface mô tả yêu cầu lấy tiến độ điểm số
 */
export interface ScoreProgressRequest {
  UserId: number;
  ExamId?: number;
  FromDate?: Date;
  ToDate?: Date;
  GroupByDay?: boolean;
}

/**
 * Interface mô tả yêu cầu lấy phân bố điểm số
 */
export interface ScoreDistributionRequest {
  UserId: number;
  ExamId?: number;
  NumRanges?: number;
  UsePercentage?: boolean;
}

/**
 * Interface mô tả khoảng điểm trong phân bố
 */
export interface ScoreRange {
  RangeStart: number;
  RangeEnd: number;
  RangeLabel: string;
  Count: number;
}

// export interface ScoreCompleteExamResponse {
//   ExamId: number;
//   ExamTitle: string;
//   UserId: number;
//   AttemptNumber: number;
//   FinalScore: number;
//   Passed: boolean;
//   PassScore: number;
//   TotalQuestions: number;
//   CorrectAnswers: number;
//   IncorrectAnswers: number;
//   UnansweredQuestions: number;
//   StartTime: Date;
//   EndTime?: Date;
//   Duration: string;
//   TotalTimeInSeconds: number;
//   DetailedAnswers: any[];
// }
