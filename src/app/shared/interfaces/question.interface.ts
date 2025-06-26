/**
 * Interface cho QuestionInfo
 */
export interface QuestionInfo {
  Id: number;
  Topic_Id: number;
  Exam_Id: number;
  Question_Type: number;
  Content: string;
  Question_Data_Json: string;
  Explanation: string;
  Difficulty_Level: number;
  Score: number;
  Created_At: Date;
  Updated_At: Date;
  Create_User_Id?: number;
}

export interface MultipleChoiceData {
  options: string[];
  correctOption: number;
}

export interface TrueFalseData {
  correctAnswer: boolean;
}

export interface FillInTheBlankData {
  correctAnswers: string[];
}
