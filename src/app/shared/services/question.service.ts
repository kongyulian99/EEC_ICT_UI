import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { BaseService } from './base.service';
import { ResponseData } from '../models';
import { environment } from 'src/environments/environment';
import { QuestionInfo } from '../interfaces/question.interface';

@Injectable({
  providedIn: 'root'
})
export class QuestionService extends BaseService {
  private httpOptions = new HttpHeaders();
  private apiUrl = `${environment.apiUrl}/api/Question`;

  constructor(private http: HttpClient) {
    super();
    this.httpOptions = this.httpOptions.set('Content-Type', 'application/json');
  }

  /**
   * Lấy tất cả câu hỏi
   */
  getAllQuestions() {
    return this.http.get<ResponseData<QuestionInfo[]>>(`${this.apiUrl}/GetAll`, { headers: this.httpOptions })
      .pipe(catchError(this.handleError));
  }

  /**
   * Lấy câu hỏi theo ID
   * @param id ID của câu hỏi
   */
  getQuestionById(id: number) {
    return this.http.get<ResponseData<QuestionInfo>>(`${this.apiUrl}/GetById/${id}`, { headers: this.httpOptions })
      .pipe(catchError(this.handleError));
  }

  /**
   * Lấy câu hỏi theo đề thi
   * @param examId ID của đề thi
   */
  getQuestionsByExamId(examId: number) {
    return this.http.get<ResponseData<QuestionInfo[]>>(`${this.apiUrl}/GetByExamId/${examId}`, { headers: this.httpOptions })
      .pipe(catchError(this.handleError));
  }

  getQuestionsByTopicId(topicId: number) {
    return this.http.get<ResponseData<QuestionInfo[]>>(`${this.apiUrl}/GetByTopicId/${topicId}`, { headers: this.httpOptions })
      .pipe(catchError(this.handleError));
  }

  /**
   * Tạo câu hỏi mới
   * @param question Thông tin câu hỏi
   */
  createQuestion(question: Partial<QuestionInfo>) {
    // Đảm bảo Question_Type là số nguyên
    if (question.Question_Type !== undefined) {
      question.Question_Type = Number(question.Question_Type);
    }

    // Tạo bản sao để tránh tham chiếu
    const questionData = { ...question };

    // Đảm bảo Question_Data_Json là chuỗi JSON hợp lệ
    if (questionData.Question_Data_Json && typeof questionData.Question_Data_Json !== 'string') {
      questionData.Question_Data_Json = JSON.stringify(questionData.Question_Data_Json);
    }

    console.log('Sending question data:', questionData);

    return this.http.post<ResponseData<number>>(`${this.apiUrl}/Create`, questionData, { headers: this.httpOptions })
      .pipe(catchError(this.handleError));
  }

  /**
   * Cập nhật thông tin câu hỏi
   * @param question Thông tin câu hỏi cần cập nhật
   */
  updateQuestion(question: QuestionInfo) {
    // Đảm bảo Question_Type là số nguyên
    question.Question_Type = Number(question.Question_Type);

    // Tạo bản sao để tránh tham chiếu
    const questionData = { ...question };

    // Đảm bảo Question_Data_Json là chuỗi JSON hợp lệ
    if (questionData.Question_Data_Json && typeof questionData.Question_Data_Json !== 'string') {
      questionData.Question_Data_Json = JSON.stringify(questionData.Question_Data_Json);
    }

    console.log('Updating question data:', questionData);

    return this.http.put<ResponseData<boolean>>(`${this.apiUrl}/Update`, questionData, { headers: this.httpOptions })
      .pipe(catchError(this.handleError));
  }

  /**
   * Xóa câu hỏi
   * @param id ID của câu hỏi cần xóa
   */
  deleteQuestion(id: number) {
    return this.http.delete<ResponseData<boolean>>(`${this.apiUrl}/Delete/${id}`, { headers: this.httpOptions })
      .pipe(catchError(this.handleError));
  }
}
