import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { BaseService } from './base.service';
import { ReturnBaseInfo } from '../interfaces/user.interface';
import { environment } from 'src/environments/environment';
import { TopExamByPassRate as ExamPassRate } from '../interfaces/exam.interface';

// Interface cho DashboardSummary
export interface DashboardSummary {
  TotalUsers: number;
  TotalExams: number;
  TotalQuestions: number;
  TotalAttempts: number;
  OverallPassRate: number;
  UserGrowth?: number;
  ExamGrowth?: number;
  QuestionGrowth?: number;
  AttemptGrowth?: number;
  PassRateGrowth?: number;
}

// Interface cho ExamAttemptsOverTime
export interface ExamAttemptsOverTime {
  Date: string;
  TotalAttempts: number;
  PassedAttempts: number;
}

// Interface cho ScoreDistribution
export interface ScoreDistribution {
  ScoreRange: string;
  Count: number;
}

// Interface cho TopExamByPassRate
export interface TopExamByPassRate {
  ExamId: number;
  ExamTitle: string;
  TotalAttempts: number;
  PassedAttempts: number;
  PassRate: number;
}

// Interface cho RecentActivity
export interface RecentActivity {
  Id: number;
  ActivityType: string;
  UserId: number;
  UserName: string;
  Description: string;
  Timestamp: string;
  RelatedEntityId?: number;
  RelatedEntityName?: string;
}

// Interface cho StudentStats
export interface StudentStats {
  TotalAttempts: number;
  PassedExams: number;
  AverageScore: number;
  HighestScore: number;
}

// Interface cho StudentScoreOverTime
export interface StudentScoreOverTime {
  Date: string;
  Score: number;
  PassingScore: number;
}

// Interface cho UpcomingExam
export interface UpcomingExam {
  ExamId: number;
  ExamName: string;
  Description: string;
  StartDate: string;
  EndDate: string;
  Duration: number;
  QuestionCount: number;
}

// Interface cho StudentResult
export interface StudentResult {
  AttemptId: number;
  ExamId: number;
  ExamTitle: string;
  Score: number;
  TotalScore: number;
  IsPassed: boolean;
  CompletedDate: string;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService extends BaseService {
  private httpOptions = new HttpHeaders();
  private apiUrl = `${environment.apiUrl}/api/Dashboard`;

  constructor(private http: HttpClient) {
    super();
    this.httpOptions = this.httpOptions.set('Content-Type', 'application/json');
  }

  /**
   * Lấy thông tin tổng quan của hệ thống
   */
  getSystemSummary() {
    return this.http.get<ReturnBaseInfo<DashboardSummary>>(
      `${this.apiUrl}/SystemSummary`,
      { headers: this.httpOptions }
    ).pipe(catchError(this.handleError));
  }

  /**
   * Lấy dữ liệu về số lượng attempts theo thời gian
   * @param fromDate Ngày bắt đầu
   * @param toDate Ngày kết thúc
   */
  getExamAttemptsOverTime(fromDate?: Date, toDate?: Date) {
    let params = new HttpParams();

    if (fromDate) {
      params = params.append('fromDate', fromDate.toISOString());
    }

    if (toDate) {
      params = params.append('toDate', toDate.toISOString());
    }

    return this.http.get<ReturnBaseInfo<ExamAttemptsOverTime[]>>(
      `${this.apiUrl}/ExamAttemptsOverTime`,
      { headers: this.httpOptions, params }
    ).pipe(catchError(this.handleError));
  }

  /**
   * Lấy phân bố điểm của các lần làm bài thi
   * @param examId ID của bài thi (không bắt buộc)
   */
  getScoreDistribution(examId?: number) {
    let params = new HttpParams();

    if (examId) {
      params = params.append('examId', examId.toString());
    }

    return this.http.get<ReturnBaseInfo<ScoreDistribution[]>>(
      `${this.apiUrl}/ScoreDistribution`,
      { headers: this.httpOptions, params }
    ).pipe(catchError(this.handleError));
  }

  /**
   * Lấy danh sách các bài thi có tỷ lệ đậu cao nhất
   * @param limit Số lượng bài thi cần lấy (mặc định: 10)
   */
  getTopExamsByPassRate(limit: number = 10) {
    let params = new HttpParams().append('limit', limit.toString());

    return this.http.get<ReturnBaseInfo<TopExamByPassRate[]>>(
      `${this.apiUrl}/TopExamsByPassRate`,
      { headers: this.httpOptions, params }
    ).pipe(catchError(this.handleError));
  }

  /**
   * Lấy các hoạt động gần đây trong hệ thống
   * @param limit Số lượng hoạt động cần lấy (mặc định: 20)
   */
  getRecentActivities(limit: number = 20) {
    let params = new HttpParams().append('limit', limit.toString());

    return this.http.get<ReturnBaseInfo<RecentActivity[]>>(
      `${this.apiUrl}/RecentActivities`,
      { headers: this.httpOptions, params }
    ).pipe(catchError(this.handleError));
  }

  /**
   * Lấy thông tin tổng quan của học viên
   */
  getStudentStats() {
    return this.http.get<ReturnBaseInfo<StudentStats>>(
      `${this.apiUrl}/StudentStats`,
      { headers: this.httpOptions }
    ).pipe(catchError(this.handleError));
  }

  /**
   * Lấy dữ liệu điểm số của học viên theo thời gian
   * @param fromDate Ngày bắt đầu
   * @param toDate Ngày kết thúc
   */
  getStudentScoresOverTime(fromDate?: Date, toDate?: Date) {
    let params = new HttpParams();

    if (fromDate) {
      params = params.append('fromDate', fromDate.toISOString());
    }

    if (toDate) {
      params = params.append('toDate', toDate.toISOString());
    }

    return this.http.get<ReturnBaseInfo<StudentScoreOverTime[]>>(
      `${this.apiUrl}/StudentScoresOverTime`,
      { headers: this.httpOptions, params }
    ).pipe(catchError(this.handleError));
  }

  /**
   * Lấy phân bố điểm của học viên
   */
  getStudentScoreDistribution() {
    return this.http.get<ReturnBaseInfo<ScoreDistribution[]>>(
      `${this.apiUrl}/StudentScoreDistribution`,
      { headers: this.httpOptions }
    ).pipe(catchError(this.handleError));
  }

  /**
   * Lấy danh sách bài thi sắp tới
   * @param limit Số lượng bài thi cần lấy (mặc định: 5)
   */
  getUpcomingExams(limit: number = 5) {
    let params = new HttpParams().append('limit', limit.toString());

    return this.http.get<ReturnBaseInfo<UpcomingExam[]>>(
      `${this.apiUrl}/UpcomingExams`,
      { headers: this.httpOptions, params }
    ).pipe(catchError(this.handleError));
  }

  /**
   * Lấy kết quả gần đây của học viên
   * @param limit Số lượng kết quả cần lấy (mặc định: 10)
   */
  getStudentRecentResults(limit: number = 10) {
    let params = new HttpParams().append('limit', limit.toString());

    return this.http.get<ReturnBaseInfo<StudentResult[]>>(
      `${this.apiUrl}/StudentRecentResults`,
      { headers: this.httpOptions, params }
    ).pipe(catchError(this.handleError));
  }
}
