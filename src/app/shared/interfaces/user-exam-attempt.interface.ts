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
  Answers: UserAnswer[];
}

export interface ScoreExamResponse {
  AttemptId: number;
  AttemptNumber: number;
  UserId: number;
  ExamId: number;
  ExamTitle: string;
  TotalScore: number;
  PassScore: number;
  Passed: boolean;
  TotalQuestions: number;
  CorrectAnswers: number;
  IncorrectAnswers: number;
  AnswerResults: UserAnswerResult[];
}

export interface ScoreCompleteExamResponse {
  ExamId: number;
  ExamTitle: string;
  UserId: number;
  AttemptNumber: number;
  FinalScore: number;
  Passed: boolean;
  PassScore: number;
  TotalQuestions: number;
  CorrectAnswers: number;
  IncorrectAnswers: number;
  UnansweredQuestions: number;
  StartTime: Date;
  EndTime?: Date;
  Duration: string;
  TotalTimeInSeconds: number;
  DetailedAnswers: any[];
}