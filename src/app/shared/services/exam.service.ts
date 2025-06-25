import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { BaseService } from './base.service';
import { ResponseData } from '../models';
import { environment } from 'src/environments/environment';
import { ExamInfo } from '../interfaces/exam.interface';

@Injectable({
  providedIn: 'root'
})
export class ExamsService extends BaseService {
  private httpOptions = new HttpHeaders();
  private apiUrl = `${environment.apiUrl}/api/Exam`;

  constructor(private http: HttpClient) {
    super();
    this.httpOptions = this.httpOptions.set('Content-Type', 'application/json');
  }

  /**
   * Lấy tất cả chủ đề
   */
  getAllExams() {
    return this.http.get<ResponseData<ExamInfo[]>>(`${this.apiUrl}/GetAll`, { headers: this.httpOptions })
      .pipe(catchError(this.handleError));
  }

  /**
   * Lấy tất cả chủ đề gốc (không có chủ đề cha)
   */
  getRootExams() {
    return this.http.get<ResponseData<ExamInfo[]>>(`${this.apiUrl}/GetRootExams`, { headers: this.httpOptions })
      .pipe(catchError(this.handleError));
  }

  /**
   * Lấy các chủ đề con của một chủ đề
   * @param parentId ID của chủ đề cha
   */
  getChildExams(parentId: number) {
    return this.http.get<ResponseData<ExamInfo[]>>(`${this.apiUrl}/GetChildExams/${parentId}`, { headers: this.httpOptions })
      .pipe(catchError(this.handleError));
  }

  /**
   * Lấy chủ đề theo ID
   * @param id ID của chủ đề
   */
  getExamById(id: number) {
    return this.http.get<ResponseData<ExamInfo>>(`${this.apiUrl}/GetById/${id}`, { headers: this.httpOptions })
      .pipe(catchError(this.handleError));
  }

  /**
   * Tạo chủ đề mới
   * @param Exam Thông tin chủ đề (ExamInfo)
   */
  createExam(Exam: Partial<ExamInfo>) {
    return this.http.post<ResponseData<number>>(`${this.apiUrl}/Create`, Exam, { headers: this.httpOptions })
      .pipe(catchError(this.handleError));
  }

  /**
   * Cập nhật thông tin chủ đề
   * @param Exam Thông tin chủ đề cần cập nhật (ExamInfo)
   */
  updateExam(Exam: ExamInfo) {
    return this.http.put<ResponseData<number>>(`${this.apiUrl}/Update`, Exam, { headers: this.httpOptions })
      .pipe(catchError(this.handleError));
  }

  /**
   * Xóa chủ đề
   * @param id ID của chủ đề cần xóa
   */
  deleteExam(id: number) {
    return this.http.delete<ResponseData<number>>(`${this.apiUrl}/Delete/${id}`, { headers: this.httpOptions })
      .pipe(catchError(this.handleError));
  }

  /**
   * Lấy danh sách top bài thi theo số lượt làm bài
   * @param startDate Ngày bắt đầu
   * @param endDate Ngày kết thúc
   * @param limit Số lượng kết quả tối đa
   */
  getTopExams(startDate: Date, endDate: Date, limit: number = 5) {
    let url = `${this.apiUrl}/TopExams?limit=${limit}`;

    if (startDate) {
      url += `&fromDate=${startDate.toISOString()}`;
    }

    if (endDate) {
      url += `&toDate=${endDate.toISOString()}`;
    }

    return this.http.get<ResponseData<{
      id: number;
      title: string;
      attempts: number;
      avgScore: number;
      passRate: number;
    }[]>>(url, { headers: this.httpOptions }).pipe(catchError(this.handleError));
  }
}
