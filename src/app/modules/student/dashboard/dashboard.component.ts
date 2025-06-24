import { Component, OnInit } from '@angular/core';
import { UserExamAttemptService } from 'src/app/shared/services/user-attempt.service';
import { UserExamHistoryItem, UserExamHistoryRequest, ScoreProgressRequest, ScoreDistributionRequest, ScoreRange } from 'src/app/shared/interfaces/user-exam-attempt.interface';
import { NotificationService, SystemConstants, User } from 'src/app/shared';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  // Thông tin người dùng
  currentUser: User = JSON.parse(localStorage.getItem(SystemConstants.CURRENT_USER) || '{}');
  userId: number = 0;

  // Dữ liệu lịch sử làm bài
  isLoading: boolean = false;
  examHistory: UserExamHistoryItem[] = [];
  historySummary: any = null;

  // Dữ liệu thống kê
  isLoadingCharts: boolean = false;
  progressData: any[] = [];
  progressSummary: any = null;
  scoreDistribution: ScoreRange[] = [];
  distributionSummary: any = null;

  // Cấu hình biểu đồ tiến độ
  progressTitle: string = 'Tiến độ điểm số theo thời gian';
  progressLegendVisible: boolean = true;
  progressLegendPosition: string = 'bottom';
  progressTooltipEnabled: boolean = true;
  progressExportEnabled: boolean = true;
  progressValueMax: number = 10;
  progressValueMin: number = 0;
  progressValueTickInterval: number = 1;
  progressValueAxisTitle: string = 'Điểm số (thang điểm 10)';

  // Cấu hình biểu đồ phân bố
  distributionTitle: string = 'Phân bố điểm số';
  distributionLegendVisible: boolean = false;
  distributionTooltipEnabled: boolean = true;
  distributionExportEnabled: boolean = true;
  distributionSeriesName: string = 'Số lần làm bài';
  distributionSeriesColor: string = '#20c997';
  distributionArgumentAxisTitle: string = 'Khoảng điểm';
  distributionValueAxisTitle: string = 'Số lần làm bài';

  constructor(
    private userExamAttemptService: UserExamAttemptService,
    private notificationService: NotificationService,
    private router: Router
  ) {
    // Lấy ID người dùng từ thông tin đăng nhập và chuyển đổi sang kiểu number
    this.userId = this.currentUser && this.currentUser.Id ? parseInt(this.currentUser.Id.toString(), 10) : 0;
  }

  ngOnInit(): void {
    this.loadUserExamHistory();
    this.loadChartData();
  }

  // Tải lịch sử làm bài của người dùng
  loadUserExamHistory(): void {
    if (!this.userId) {
      this.notificationService.showError('Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.');
      return;
    }

    this.isLoading = true;

    // Tạo yêu cầu lấy lịch sử làm bài
    const request: UserExamHistoryRequest = {
      UserId: this.userId,
      LimitRecentAttempts: 10 // Giới hạn 10 lần làm bài gần nhất
    };

    // Gọi API lấy lịch sử làm bài
    this.userExamAttemptService.getUserExamHistory(request).subscribe({
      next: (response) => {
        if (response.ReturnStatus.Code === 1) {
          // Lưu kết quả trả về
          this.examHistory = response.ReturnData.History;
          this.historySummary = response.ReturnData.Summary;
        } else {
          this.notificationService.showError('Không thể lấy lịch sử làm bài: ' + response.ReturnStatus.Message);
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Lỗi khi lấy lịch sử làm bài:', error);
        this.notificationService.showError('Lỗi khi lấy lịch sử làm bài');
        this.isLoading = false;
      }
    });
  }

  // Tải dữ liệu biểu đồ
  loadChartData(): void {
    if (!this.userId) {
      return;
    }

    this.isLoadingCharts = true;

    // Tải dữ liệu tiến độ điểm số
    this.loadScoreProgress();

    // Tải dữ liệu phân bố điểm số
    this.loadScoreDistribution();
  }

  // Tải dữ liệu tiến độ điểm số
  loadScoreProgress(): void {
    const progressRequest: ScoreProgressRequest = {
      UserId: this.userId,
      GroupByDay: true,
      // Lấy dữ liệu trong 6 tháng gần đây
      FromDate: new Date(new Date().setMonth(new Date().getMonth() - 6))
    };

    this.userExamAttemptService.getUserScoreProgress(progressRequest).subscribe({
      next: (response) => {
        if (response.ReturnStatus.Code === 1) {
          this.progressData = response.ReturnData.ProgressData;
          this.progressSummary = response.ReturnData.Summary;
        } else {
          console.error('Lỗi khi lấy tiến độ điểm số:', response.ReturnStatus.Message);
        }
        this.isLoadingCharts = false;
      },
      error: (error) => {
        console.error('Lỗi khi lấy tiến độ điểm số:', error);
        this.isLoadingCharts = false;
      }
    });
  }

  // Tải dữ liệu phân bố điểm số
  loadScoreDistribution(): void {
    const distributionRequest: ScoreDistributionRequest = {
      UserId: this.userId,
      NumRanges: 5,
      UsePercentage: false // Sử dụng thang điểm 10 thay vì thang điểm 100
    };

    this.userExamAttemptService.getScoreDistribution(distributionRequest).subscribe({
      next: (response) => {
        if (response.ReturnStatus.Code === 1) {
          this.scoreDistribution = response.ReturnData.Distribution;
          this.distributionSummary = response.ReturnData.Summary;
        } else {
          console.error('Lỗi khi lấy phân bố điểm số:', response.ReturnStatus.Message);
        }
        this.isLoadingCharts = false;
      },
      error: (error) => {
        console.error('Lỗi khi lấy phân bố điểm số:', error);
        this.isLoadingCharts = false;
      }
    });
  }

  // Tạo chuỗi điểm cho đường biểu đồ SVG
  getLineChartPoints(data: any[]): string {
    if (!data || data.length === 0) return '';

    // Tạo chuỗi điểm cho đường polyline
    return data.map((point, index) => {
      const x = (index / (data.length - 1)) * 100;
      const y = 100 - ((point.AverageScore / 10) * 100);
      return `${x},${y}`;
    }).join(' ');
  }

  // Tính chiều cao phần trăm của thanh biểu đồ dựa trên giá trị và dữ liệu
  getBarHeight(count: number, data: any[]): number {
    if (!data || data.length === 0) return 0;

    // Tìm giá trị lớn nhất trong dữ liệu
    const maxCount = Math.max(...data.map(item => item.Count));

    // Tính chiều cao phần trăm
    return maxCount > 0 ? (count / maxCount) * 100 : 0;
  }

  // Hàm xử lý tooltip cho biểu đồ tiến độ
  customizeProgressTooltip(arg: any): any {
    return {
      text: `Ngày: ${arg.argument}<br/>Điểm: ${arg.valueText}<br/>Số lần làm bài: ${arg.point.data.AttemptCount}`
    };
  }

  // Hàm xử lý tooltip cho biểu đồ phân bố
  customizeDistributionTooltip(arg: any): any {
    return {
      text: `Khoảng điểm: ${arg.argument}<br/>Số lần làm bài: ${arg.value}`
    };
  }

  // Hàm định dạng nhãn trục giá trị
  customizeValueLabel(arg: any): string {
    return arg.value.toFixed(1);
  }

  // Xem chi tiết lần làm bài
  viewAttemptDetail(attempt: UserExamHistoryItem): void {
    this.router.navigate(['/student/exam-result', attempt.ExamId], {
      queryParams: {
        attemptId: attempt.AttemptId,
        attemptNumber: attempt.AttemptNumber
      }
    });
  }

  // Bắt đầu bài thi mới
  startNewExam(examId: number): void {
    this.router.navigate(['/student/test'], {
      queryParams: { id: examId }
    });
  }

  // Format thời gian
  formatDate(date: Date): string {
    return new Date(date).toLocaleString('vi-VN');
  }
}
