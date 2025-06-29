import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError, retry, timeout } from 'rxjs/operators';
import { NotificationService, SystemConstants, User, ExamsService } from 'src/app/shared';
import { UserExamAttemptService } from 'src/app/shared/services/user-attempt.service';
import {
  UserExamHistoryRequest,
  ScoreProgressRequest,
  ScoreDistributionRequest,
  ScoreRange
} from 'src/app/shared/interfaces/user-exam-attempt.interface';
import { ResponseData } from 'src/app/shared/models';

interface ApiResponse {
  ReturnStatus: {
    Code: number;
    Message: string;
  };
  ReturnData: any;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  // User information
  currentUser: User = JSON.parse(localStorage.getItem(SystemConstants.CURRENT_USER) || '{}');
  userId: number = 0;
  userAvatar: string = '';

  // Dashboard data
  isLoading: boolean = false;
  studentStats: any = {
    totalAttempts: 0,
    passedExams: 0,
    averageScore: 0,
    highestScore: 0
  };

  // Chart data
  scoresByDateData: any[] = [];
  scoreDistributionData: any[] = [];

  // Exam data
  upcomingExams: any[] = [];
  recentResults: any[] = [];
  availableExams: any[] = [];

  constructor(
    private userExamAttemptService: UserExamAttemptService,
    private notificationService: NotificationService,
    private router: Router,
    private examService: ExamsService
  ) {
    // Get user ID from login information
    this.userId = this.currentUser && this.currentUser.Id ? parseInt(this.currentUser.Id.toString(), 10) : 0;

    // Get avatar from user information if available
    this.userAvatar = this.getUserAvatar();
  }

  ngOnInit(): void {
    this.loadStudentDashboard();
  }

  getUserAvatar(): string {
    if (this.currentUser && this.currentUser.Avatar) {
      return this.currentUser.Avatar;
    }
    return 'assets/images/default-avatar.avif';
  }

  // Hàm xử lý API với timeout và retry
  safeApiCall<T>(apiCall: any) {
    return apiCall.pipe(
      timeout(30000), // 30 giây timeout
      retry(2), // Thử lại 2 lần nếu thất bại
      catchError(error => {
        console.error('API call failed:', error);
        return of({ ReturnStatus: { Code: 0, Message: 'API call failed' }, ReturnData: null } as ResponseData<T>);
      })
    );
  }

  loadStudentDashboard() {
    this.isLoading = true;

    // Chuẩn bị các request
    const historyRequest: UserExamHistoryRequest = {
      UserId: this.userId,
      LimitRecentAttempts: 10
    };

    const progressRequest: ScoreProgressRequest = {
      UserId: this.userId,
      GroupByDay: true
    };

    const distributionRequest: ScoreDistributionRequest = {
      UserId: this.userId,
      NumRanges: 5,
      UsePercentage: true
    };

    // Thực hiện các API call song song với xử lý lỗi và timeout
    forkJoin({
      history: this.safeApiCall<any>(this.userExamAttemptService.getUserExamHistory(historyRequest)),
      progress: this.safeApiCall<any>(this.userExamAttemptService.getUserScoreProgress(progressRequest)),
      distribution: this.safeApiCall<any>(this.userExamAttemptService.getScoreDistribution(distributionRequest)),
      upcomingExams: this.safeApiCall<any>(this.examService.getUpcomingExams()),
      availableExams: this.safeApiCall<any>(this.examService.getAvailableExams(this.userId))
    }).subscribe(
      (results: {
        history: ApiResponse;
        progress: ApiResponse;
        distribution: ApiResponse;
        upcomingExams: ApiResponse;
        availableExams: ApiResponse;
      }) => {
        // Xử lý dữ liệu lịch sử làm bài và thống kê
        if (results.history && results.history.ReturnStatus && results.history.ReturnStatus.Code === 1 && results.history.ReturnData) {
          const historyData = results.history.ReturnData;

          // Cập nhật thông tin thống kê
          this.studentStats = {
            totalAttempts: historyData.Summary?.TotalAttempts || 0,
            passedExams: historyData.Summary?.TotalPassed || 0,
            averageScore: historyData.Summary?.AverageScore || 0,
            highestScore: historyData.History?.length > 0 ?
              Math.max(...historyData.History.map(item => item.Score)) : 0
          };

          // Lấy kết quả gần đây
          if (historyData.History && historyData.History.length > 0) {
            this.recentResults = historyData.History.slice(0, 5).map(item => ({
              examTitle: item.ExamTitle,
              score: item.Score,
              totalScore: 100, // Giả sử thang điểm 100
              scorePercent: item.Score,
              isPassed: item.Passed,
              completedDate: item.EndTime || item.StartTime
            }));
          }
        } else {
          console.log('Không có dữ liệu lịch sử làm bài hoặc API lỗi');
        }

        // Xử lý dữ liệu tiến độ điểm số
        if (results.progress && results.progress.ReturnStatus && results.progress.ReturnStatus.Code === 1 && results.progress.ReturnData) {
          const progressData = results.progress.ReturnData;

          if (progressData.ProgressData && progressData.ProgressData.length > 0) {
            this.scoresByDateData = progressData.ProgressData.map((item: any) => {
              // Kiểm tra cấu trúc dữ liệu để xác định cách xử lý
              if (item.Date) {
                // Dữ liệu đã được nhóm theo ngày
                return {
                  date: new Date(item.Date),
                  score: item.AverageScore,
                  passingScore: 70, // Giả sử điểm đậu là 70%
                  examName: `Điểm trung bình (${item.AttemptCount} lần làm bài)`
                };
              } else {
                // Dữ liệu chi tiết từng lần làm bài
                return {
                  date: new Date(item.Date || item.Time),
                  score: item.Score,
                  passingScore: item.PassScore,
                  examName: item.ExamTitle
                };
              }
            });
          } else {
            console.log('Không có dữ liệu tiến độ điểm số');
          }
        }

        // Xử lý dữ liệu phân bố điểm số
        if (results.distribution && results.distribution.ReturnStatus && results.distribution.ReturnStatus.Code === 1 && results.distribution.ReturnData) {
          const distributionData = results.distribution.ReturnData;

          // Tạo mảng màu sắc cho biểu đồ
          const colors = ['#5B9BD5', '#ED7D31', '#A5A5A5', '#FFC000', '#70AD47'];

          if (distributionData.Distribution && distributionData.Distribution.length > 0) {
            this.scoreDistributionData = distributionData.Distribution.map((item: any, index: number) => ({
              rangeLabel: item.RangeLabel,
              count: item.Count,
              color: colors[index % colors.length]
            }));
          } else {
            console.log('Không có dữ liệu phân bố điểm số');
            // Tạo dữ liệu mẫu nếu không có dữ liệu thật
            this.scoreDistributionData = [
              { rangeLabel: '0-20', count: 0, color: colors[0] },
              { rangeLabel: '21-40', count: 0, color: colors[1] },
              { rangeLabel: '41-60', count: 0, color: colors[2] },
              { rangeLabel: '61-80', count: 0, color: colors[3] },
              { rangeLabel: '81-100', count: 0, color: colors[4] }
            ];
          }
        }

        // Xử lý dữ liệu bài thi sắp tới
        if (results.upcomingExams && results.upcomingExams.ReturnStatus && results.upcomingExams.ReturnStatus.Code === 1 && results.upcomingExams.ReturnData) {
          this.upcomingExams = results.upcomingExams.ReturnData.map((exam: any) => ({
            id: exam.ExamId,
            title: exam.ExamName,
            description: exam.Description,
            startDate: new Date(exam.StartDate),
            duration: exam.Duration,
            questionCount: exam.QuestionCount
          }));
        } else {
          console.log('Không có dữ liệu bài thi sắp tới hoặc API lỗi');
        }

        // Xử lý dữ liệu bài thi khả dụng
        if (results.availableExams && results.availableExams.ReturnStatus && results.availableExams.ReturnStatus.Code === 1 && results.availableExams.ReturnData) {
          this.availableExams = results.availableExams.ReturnData;
        } else {
          console.log('Không có dữ liệu bài thi khả dụng hoặc API lỗi');
        }

        this.isLoading = false;
      },
      (error) => {
        console.error('Error loading dashboard data', error);
        this.notificationService.showError('Không thể tải dữ liệu bảng điều khiển');
        this.isLoading = false;
      }
    );
  }

  /**
   * Tính toán độ rộng của thanh phân bố điểm
   * @param item Mục dữ liệu phân bố điểm
   * @returns Chuỗi CSS biểu thị độ rộng của thanh
   */
  getDistributionWidth(item: any): string {
    // Tìm mục có số lượng lớn nhất
    const maxCount = Math.max(...this.scoreDistributionData.map(d => d.count));

    // Nếu không có dữ liệu hoặc maxCount = 0, trả về độ rộng tối thiểu
    if (maxCount === 0) return '10%';

    // Tính toán độ rộng tương đối (tối thiểu 10%, tối đa 100%)
    const percentage = Math.max(10, Math.round((item.count / maxCount) * 100));
    return `${percentage}%`;
  }

  customizeScoreTooltip = (arg: any) => {
    const item = arg.point.data;
    if (arg.seriesName === 'Điểm số') {
      return {
        text: `<b>${item.examName}</b><br>Điểm: ${item.score}%<br>Ngày: ${new Date(item.date).toLocaleDateString('vi-VN')}`
      };
    } else {
      return {
        text: `Điểm đậu: ${item.passingScore}%`
      };
    }
  }

  customizePieLabel = (arg: any) => {
    return `${arg.argumentText}: ${arg.valueText}`;
  }

  customizePieTooltip = (arg: any) => {
    return {
      text: `${arg.argumentText}: ${arg.valueText} lần (${arg.percent.toFixed(1)}%)`
    };
  }

  startExam(examId: number) {
    this.router.navigate(['/student/test', examId]);
  }
}
