export interface UserExamAnswerInfo {
    Id: number;
    User_Id: number;
    Exam_Id: number;
    Question_Id: number;
    Attempt_Number: number;
    Answer_Given_Json: string;
    Is_Correct: boolean;
    Score_Achieved: number;
    Time_Spent_Seconds: number;
    Created_At: Date;
    Updated_At: Date;
}