import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { BaseService } from './base.service';
import { ResponseData } from '../models';
import { environment } from 'src/environments/environment';
import { ExamInfo } from '../interfaces/exam.interface';
import { ScoreCompleteExamResponse, ScoreExamRequest, ScoreExamResponse, UserExamAttemptInfo } from '../interfaces/user-exam-attempt.interface';

@Injectable({
  providedIn: 'root'
})
export class UserExamAttemptService extends BaseService {
  private httpOptions = new HttpHeaders();
  private apiUrl = `${environment.apiUrl}/api/UserExamAttempt`;

  constructor(private http: HttpClient) {
    super();
    this.httpOptions = this.httpOptions.set('Content-Type', 'application/json');
  }

  /**
   * Tạo lần làm bài thi mới cho người dùng
   * @param userId ID của người dùng
   * @param examId ID của bài thi
   */
  createUserExamAttempt(userId: number, examId: number) {
    const model: Partial<UserExamAttemptInfo> = {
      User_Id: userId,
      Exam_Id: examId
    };
    return this.http.post<ResponseData<{NewAttemptId: number, AttemptNumber: number}>>(
      `${this.apiUrl}/Create`,
      model,
      { headers: this.httpOptions }
    ).pipe(catchError(this.handleError));
  }

  /**
   * Lấy thông tin lần làm bài thi theo ID
   * @param id ID của lần làm bài thi
   */
  getUserExamAttemptById(id: number) {
    return this.http.get<ResponseData<UserExamAttemptInfo>>(
      `${this.apiUrl}/GetById/${id}`,
      { headers: this.httpOptions }
    ).pipe(catchError(this.handleError));
  }

  /**
   * Lấy danh sách các lần làm bài thi của người dùng cho một bài thi cụ thể
   * @param userId ID của người dùng
   * @param examId ID của bài thi
   */
  getUserExamAttemptsByUserIdAndExamId(userId: number, examId: number) {
    return this.http.get<ResponseData<UserExamAttemptInfo[]>>(
      `${this.apiUrl}/GetByUserAndExam/${userId}/${examId}`,
      { headers: this.httpOptions }
    ).pipe(catchError(this.handleError));
  }

  /**
   * Cập nhật thông tin lần làm bài thi
   * @param attempt Thông tin lần làm bài thi cần cập nhật
   */
  updateUserExamAttempt(attempt: UserExamAttemptInfo) {
    return this.http.put<ResponseData<boolean>>(
      `${this.apiUrl}/Update`,
      attempt,
      { headers: this.httpOptions }
    ).pipe(catchError(this.handleError));
  }

  /**
   * Xóa lần làm bài thi
   * @param id ID của lần làm bài thi cần xóa
   */
  deleteUserExamAttempt(id: number) {
    return this.http.delete<ResponseData<boolean>>(
      `${this.apiUrl}/Delete/${id}`,
      { headers: this.httpOptions }
    ).pipe(catchError(this.handleError));
  }

  /**
   * Chấm điểm cho một lần làm bài thi
   * @param userId ID của người dùng
   * @param examId ID của bài thi
   * @param attemptNumber Số thứ tự lần làm bài
   */
  scoreUserExamAttempt(userId: number, examId: number, attemptNumber: number) {
    const model: Partial<UserExamAttemptInfo> = {
      User_Id: userId,
      Exam_Id: examId,
      Attempt_Number: attemptNumber
    };
    return this.http.post<ResponseData<{FinalScore: number, Passed: boolean}>>(
      `${this.apiUrl}/Score`,
      model,
      { headers: this.httpOptions }
    ).pipe(catchError(this.handleError));
  }

  /**
   * Chấm điểm tổng thể cho bài kiểm tra và trả về kết quả chi tiết
   * @param userId ID của người dùng
   * @param examId ID của bài thi
   * @param attemptNumber Số thứ tự lần làm bài
   */
  scoreCompleteExam(userId: number, examId: number, attemptNumber: number) {
    return this.http.get<ResponseData<ScoreCompleteExamResponse>>(
      `${this.apiUrl}/ScoreExam/${userId}/${examId}/${attemptNumber}`,
      { headers: this.httpOptions }
    ).pipe(catchError(this.handleError));
  }

  /**
   * Chấm điểm bài thi dựa trên danh sách câu trả lời của người dùng
   * @param request Thông tin yêu cầu chấm điểm
   */
  scoreExamWithAnswers(request: ScoreExamRequest) {
    return this.http.post<ResponseData<ScoreExamResponse>>(
      `${this.apiUrl}/ScoreWithAnswers`,
      request,
      { headers: this.httpOptions }
    ).pipe(catchError(this.handleError));
  }
}
