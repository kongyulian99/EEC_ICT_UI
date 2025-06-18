/**
 * Interface cho ExamInfo
 */
export interface ExamInfo {
  Id: number;
  Title: string;
  Description: string;
  Duration_Minutes: number;
  Total_Questions: number;
  Created_At: Date;
  Updated_At: Date;
}
