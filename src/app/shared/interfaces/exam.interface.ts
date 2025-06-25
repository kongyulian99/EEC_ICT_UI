/**
 * Interface cho ExamInfo
 */
export interface ExamInfo {
  Id: number;
  Title: string;
  Description: string;
  Duration_Minutes: number;
  Pass_Score: number;
  Total_Questions: number;
  Created_At: Date;
  Updated_At: Date;
  Create_User_Id: number;
}
