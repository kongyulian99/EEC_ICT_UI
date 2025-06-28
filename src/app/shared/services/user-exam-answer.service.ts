import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { BaseService } from './base.service';
import { ResponseData } from '../models';
import { environment } from 'src/environments/environment';
import { ExamInfo } from '../interfaces/exam.interface';
import {
  ScoreExamRequest,
  ScoreExamResponse,
  UserExamAttemptInfo,
  UserExamHistoryRequest,
  UserExamHistoryItem,
  ScoreProgressRequest,
  ScoreDistributionRequest
} from '../interfaces/user-exam-attempt.interface';

/**
 * Interface cho TopicPerformanceInfo
 */
export interface TopicPerformanceInfo {
  TopicId: number;
  TopicName: string;
  TotalQuestions: number;
  AnsweredQuestions: number;
  AverageScore: number;
  MaxPossibleScore: number;
  TotalAchievedScore: number;
}

@Injectable({
  providedIn: 'root'
})
export class UserExamAnswerService extends BaseService {
  private httpOptions = new HttpHeaders();
  private apiUrl = `${environment.apiUrl}/api/UserExamAnswer`;

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
   * Chấm điểm bài thi và trả về kết quả chi tiết.
   * Hỗ trợ hai phương thức chấm điểm:
   * 1. Chấm điểm theo thông tin lần làm bài có sẵn (sử dụng userId, examId, attemptNumber)
   * 2. Chấm điểm từ danh sách câu trả lời mới gửi lên (sử dụng danh sách answers)
   * @param request Thông tin yêu cầu chấm điểm
   */
  scoreExam(request: ScoreExamRequest) {
    return this.http.post<ResponseData<ScoreExamResponse>>(
      `${this.apiUrl}/Score`,
      request,
      { headers: this.httpOptions }
    ).pipe(catchError(this.handleError));
  }

  /**
   * Lấy lịch sử làm bài của người dùng với thông tin chi tiết
   * @param request Thông tin yêu cầu lịch sử làm bài
   */
  getUserExamHistory(request: UserExamHistoryRequest) {
    let url = `${this.apiUrl}/History?userId=${request.UserId}`;

    if (request.ExamId) {
      url += `&examId=${request.ExamId}`;
    }

    if (request.LimitRecentAttempts) {
      url += `&limitRecentAttempts=${request.LimitRecentAttempts}`;
    }

    return this.http.get<ResponseData<{
      Summary: {
        TotalAttempts: number;
        TotalExams: number;
        TotalPassed: number;
        TotalFailed: number;
        AverageScore: number;
        LastAttemptDate?: Date;
      };
      History: UserExamHistoryItem[];
    }>>(
      url,
      { headers: this.httpOptions }
    ).pipe(catchError(this.handleError));
  }

  /**
   * Lấy thông tin tiến độ điểm số của người dùng theo thời gian
   * @param request Thông tin yêu cầu tiến độ điểm số
   */
  getUserScoreProgress(request: ScoreProgressRequest) {
    let url = `${this.apiUrl}/ScoreProgress?userId=${request.UserId}`;

    if (request.ExamId) {
      url += `&examId=${request.ExamId}`;
    }

    if (request.FromDate) {
      url += `&fromDate=${request.FromDate.toISOString()}`;
    }

    if (request.ToDate) {
      url += `&toDate=${request.ToDate.toISOString()}`;
    }

    if (request.GroupByDay !== undefined) {
      url += `&groupByDay=${request.GroupByDay}`;
    }

    return this.http.get<ResponseData<{
      ProgressData: any[];
      Summary: {
        AttemptCount: number;
        FirstScore: number;
        LastScore: number;
        HighestScore: number;
        LowestScore: number;
        Improvement: number;
        ImprovementPercentage: number;
      };
    }>>(
      url,
      { headers: this.httpOptions }
    ).pipe(catchError(this.handleError));
  }

  /**
   * Lấy thông tin phân bố điểm số của người dùng hoặc tất cả người dùng
   * @param request Thông tin yêu cầu phân bố điểm số
   */
  getScoreDistribution(request: ScoreDistributionRequest) {
    let url = `${this.apiUrl}/ScoreDistribution?userId=${request.UserId}`;

    if (request.ExamId) {
      url += `&examId=${request.ExamId}`;
    }

    if (request.NumRanges) {
      url += `&numRanges=${request.NumRanges}`;
    }

    if (request.UsePercentage !== undefined) {
      url += `&usePercentage=${request.UsePercentage}`;
    }

    return this.http.get<ResponseData<{
      Distribution: any[];
      Summary: {
        TotalAttempts: number;
        AverageScore: number;
        PassedCount: number;
        PassRate: number;
        ExamId?: number;
        UserId?: number;
      };
    }>>(
      url,
      { headers: this.httpOptions }
    ).pipe(catchError(this.handleError));
  }

  /**
   * Lấy danh sách các topic có điểm trung bình thấp nhất dựa trên kết quả trả lời của người dùng
   * @param userId ID của người dùng (tùy chọn)
   * @param limit Số lượng topic cần lấy (mặc định: 10)
   */
  getLowestPerformingTopics(userId?: number, limit: number = 10) {
    let params = new HttpParams();

    if (userId) {
      params = params.set('userId', userId.toString());
    }

    params = params.set('limit', limit.toString());

    return this.http.get<ResponseData<TopicPerformanceInfo[]>>(
      `${this.apiUrl}/GetLowestPerformingTopics`,
      { params: params, headers: this.httpOptions }
    ).pipe(catchError(this.handleError));
  }

  /**
   * Lấy tổng quan dữ liệu cho dashboard
   * @param startDate Ngày bắt đầu
   * @param endDate Ngày kết thúc
   */
  getDashboardSummary(startDate: Date, endDate: Date) {
    let url = `${this.apiUrl}/DashboardSummary`;

    if (startDate) {
      url += `?fromDate=${startDate.toISOString()}`;
    }

    if (endDate) {
      url += startDate ? `&toDate=${endDate.toISOString()}` : `?toDate=${endDate.toISOString()}`;
    }

    return this.http.get<ResponseData<{
      TotalAttempts: number;
      TotalPassed: number;
      TotalFailed: number;
      PassRate: number;
      AverageScore: number;
    }>>(url, { headers: this.httpOptions }).pipe(catchError(this.handleError));
  }

  /**
   * Lấy dữ liệu số lần làm bài theo ngày
   * @param startDate Ngày bắt đầu
   * @param endDate Ngày kết thúc
   */
  getAttemptsByDate(startDate: Date, endDate: Date) {
    let url = `${this.apiUrl}/AttemptsByDate`;

    if (startDate) {
      url += `?fromDate=${startDate.toISOString()}`;
    }

    if (endDate) {
      url += startDate ? `&toDate=${endDate.toISOString()}` : `?toDate=${endDate.toISOString()}`;
    }

    return this.http.get<ResponseData<{
      date: Date;
      attempts: number;
      passed: number;
      failed: number;
    }[]>>(url, { headers: this.httpOptions }).pipe(catchError(this.handleError));
  }

  /**
   * Lấy danh sách hoạt động gần đây
   * @param startDate Ngày bắt đầu
   * @param endDate Ngày kết thúc
   * @param limit Số lượng kết quả tối đa
   */
  getRecentActivities(startDate: Date, endDate: Date, limit: number = 10) {
    let url = `${this.apiUrl}/RecentActivities?limit=${limit}`;

    if (startDate) {
      url += `&fromDate=${startDate.toISOString()}`;
    }

    if (endDate) {
      url += `&toDate=${endDate.toISOString()}`;
    }

    return this.http.get<ResponseData<{
      timestamp: Date;
      user: string;
      activity: string;
      details: string;
    }[]>>(url, { headers: this.httpOptions }).pipe(catchError(this.handleError));
  }

  /**
   * Lấy kết quả chi tiết của một lần làm bài thi
   * @param attemptId ID của lần làm bài thi
   */
  getDetailedAttemptResult(attemptId: number) {
    return this.http.get<ResponseData<{
      AttemptInfo: {
        AttemptId: number;
        AttemptNumber: number;
        UserId: number;
        ExamId: number;
        ExamTitle: string;
        TotalScore: number;
        PassScore: number;
        Passed: boolean;
        ScorePercentage: number;
        StartTime: Date;
        EndTime: Date;
        Duration: string;
        TotalTimeInSeconds: number;
      },
      Statistics: {
        TotalQuestions: number;
        CorrectAnswers: number;
        IncorrectAnswers: number;
        CorrectPercentage: number;
      },
      Questions: {
        QuestionId: number;
        QuestionText: string;
        QuestionType: string;
        MaxScore: number;
        UserScore: number;
        IsCorrect: boolean;
        UserAnswer: string;
        CorrectAnswer: string;
        Explanation: string;
        TimeSpent: number;
        QuestionData: any;
        UserAnswerData: any;
      }[]
    }>>(
      `${this.apiUrl}/DetailedResult/${attemptId}`,
      { headers: this.httpOptions }
    ).pipe(catchError(this.handleError));
  }
}
