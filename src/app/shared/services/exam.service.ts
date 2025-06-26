import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { BaseService } from './base.service';
import { ResponseData } from '../models';
import { environment } from 'src/environments/environment';
import { ExamInfo } from '../interfaces/exam.interface';
import { SystemConstants } from '../constants';

@Injectable({
  providedIn: 'root'
})
export class ExamsService extends BaseService {
  private httpOptions = new HttpHeaders();
  private apiUrl = `${environment.apiUrl}/api/Exam`;
  user = JSON.parse(
    localStorage.getItem(SystemConstants.CURRENT_USER) as string
  );
  constructor(private http: HttpClient) {
    super();
    this.httpOptions = this.httpOptions.set('Content-Type', 'application/json');
  }

  /**
   * Get all topics
   */
  getAllExams() {
    return this.http.get<ResponseData<ExamInfo[]>>(`${this.apiUrl}/GetAll`, { headers: this.httpOptions })
      .pipe(catchError(this.handleError));
  }

  /**
   * Get all root topics (no parent topic)
   */
  getRootExams() {
    return this.http.get<ResponseData<ExamInfo[]>>(`${this.apiUrl}/GetRootExams`, { headers: this.httpOptions })
      .pipe(catchError(this.handleError));
  }

  /**
   * Get child topics of a topic
   * @param parentId ID of parent topic
   */
  getChildExams(parentId: number) {
    return this.http.get<ResponseData<ExamInfo[]>>(`${this.apiUrl}/GetChildExams/${parentId}`, { headers: this.httpOptions })
      .pipe(catchError(this.handleError));
  }

  /**
   * Get topic by ID
   * @param id Topic ID
   */
  getExamById(id: number) {
    return this.http.get<ResponseData<ExamInfo>>(`${this.apiUrl}/GetById/${id}`, { headers: this.httpOptions })
      .pipe(catchError(this.handleError));
  }

  /**
   * Create new topic
   * @param Exam Topic information (ExamInfo)
   */
  createExam(Exam: Partial<ExamInfo>) {
    return this.http.post<ResponseData<number>>(`${this.apiUrl}/Create`, Exam, { headers: this.httpOptions })
      .pipe(catchError(this.handleError));
  }

  /**
   * Update topic information
   */
  updateExam(Exam: ExamInfo) {
    return this.http.put<ResponseData<number>>(`${this.apiUrl}/Update`, Exam, { headers: this.httpOptions })
      .pipe(catchError(this.handleError));
  }

  /**
   * Delete topic
   * @param id ID of topic to delete
   */
  deleteExam(id: number) {
    return this.http.delete<ResponseData<number>>(`${this.apiUrl}/Delete/${id}`, { headers: this.httpOptions })
      .pipe(catchError(this.handleError));
  }

  /**
   * Get top exams by attempt count
   * @param startDate Start date
   * @param endDate End date
   * @param limit Maximum number of results
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
