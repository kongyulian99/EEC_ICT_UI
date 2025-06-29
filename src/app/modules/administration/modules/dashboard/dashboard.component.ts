import { Component, OnInit } from '@angular/core';
import { DashboardService } from 'src/app/shared/services/dashboard.service';
import { TopExamByPassRate } from 'src/app/shared/interfaces/exam.interface';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  // Biến điều khiển loading
  loading = false;

  // Biến điều khiển filter ngày tháng
  startDate: Date;
  endDate: Date;

  // Dữ liệu biểu đồ số lượng làm bài theo thời gian
  attemptsByDateData: any[] = [];

  // Dữ liệu phân bố điểm số
  scoreDistributionData: any[] = [];

  // Dữ liệu bài thi có tỷ lệ đậu cao nhất
  topExamsData: any[] = [];

  // Dữ liệu hoạt động gần đây
  recentActivitiesData: any[] = [];
  displayedActivities: any[] = [];
  activitiesPerPage = 5;
  currentActivityPage = 1;
  totalActivityPages = 1;

  constructor(private dashboardService: DashboardService) {
    // Khởi tạo ngày bắt đầu (30 ngày trước) và ngày kết thúc (hiện tại)
    this.endDate = new Date();
    this.startDate = new Date();
    this.startDate.setDate(this.startDate.getDate() - 30);
  }

  ngOnInit() {
    this.loadDashboardData();
  }

  onStartDateChanged(e: any) {
    this.startDate = e.value;
  }

  onEndDateChanged(e: any) {
    this.endDate = e.value;
  }

  refreshDashboard() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.loading = true;

    // Lấy dữ liệu số lượng làm bài theo thời gian
    this.dashboardService.getExamAttemptsOverTime(this.startDate, this.endDate).subscribe(response => {
      if (response.ReturnStatus.Code === 1 && response.ReturnData) {
        this.processAttemptsData(response.ReturnData);
      }
      this.loading = false;
    });

    // Lấy dữ liệu phân bố điểm số
    this.dashboardService.getScoreDistribution().subscribe(response => {
      if (response.ReturnStatus.Code === 1 && response.ReturnData) {
        this.processScoreDistribution(response.ReturnData);
      }
    });

    // Lấy dữ liệu bài thi có tỷ lệ đậu cao nhất
    this.dashboardService.getTopExamsByPassRate(5).subscribe(response => {
      if (response.ReturnStatus.Code === 1 && response.ReturnData) {
        this.processTopExams(response.ReturnData);
      }
    });

    // Lấy dữ liệu hoạt động gần đây
    this.dashboardService.getRecentActivities(10).subscribe(response => {
      if (response.ReturnStatus.Code === 1 && response.ReturnData) {
        this.processRecentActivities(response.ReturnData);
      }
    });
  }

  processAttemptsData(data: any[]) {
    this.attemptsByDateData = data.map(item => ({
      date: new Date(item.Date),
      attempts: item.TotalAttempts,
      passed: item.PassedAttempts,
      failed: item.TotalAttempts - item.PassedAttempts
    }));
  }

  processScoreDistribution(data: any[]) {
    this.scoreDistributionData = data.map(item => ({
      rangeLabel: item.ScoreRange,
      count: item.Count
    }));
  }

  processTopExams(data: TopExamByPassRate[]) {
    this.topExamsData = data.map(item => ({
      id: item.ExamId,
      title: item.ExamTitle,
      attempts: item.TotalAttempts,
      passed: item.PassedAttempts,
      failed: item.TotalAttempts - item.PassedAttempts,
      passRate: item.PassRate / 100, // Chuyển đổi từ phần trăm sang tỷ lệ
      passRatePercent: item.PassRate
    }));
  }

  processRecentActivities(data: any[]) {
    this.recentActivitiesData = data.map(item => ({
      id: item.Id,
      timestamp: new Date(item.Timestamp),
      user: item.UserName,
      activityType: item.ActivityType,
      activityIcon: this.getActivityIcon(item.ActivityType),
      activityLabel: this.getActivityLabel(item.ActivityType),
      details: item.Description,
      relatedEntity: item.RelatedEntityName,
      isPassed: item.Description.includes('đạt điểm đậu')
    }));

    // Tính toán số trang
    this.totalActivityPages = Math.ceil(this.recentActivitiesData.length / this.activitiesPerPage);
    this.currentActivityPage = 1;
    this.updateDisplayedActivities();
  }

  // Cập nhật danh sách hoạt động hiển thị theo trang hiện tại
  updateDisplayedActivities() {
    const startIndex = (this.currentActivityPage - 1) * this.activitiesPerPage;
    const endIndex = Math.min(startIndex + this.activitiesPerPage, this.recentActivitiesData.length);
    this.displayedActivities = this.recentActivitiesData.slice(startIndex, endIndex);
  }

  // Chuyển đến trang trước
  prevActivityPage() {
    if (this.currentActivityPage > 1) {
      this.currentActivityPage--;
      this.updateDisplayedActivities();
    }
  }

  // Chuyển đến trang sau
  nextActivityPage() {
    if (this.currentActivityPage < this.totalActivityPages) {
      this.currentActivityPage++;
      this.updateDisplayedActivities();
    }
  }

  // Hàm lấy icon cho loại hoạt động
  getActivityIcon(activityType: string): string {
    switch (activityType) {
      case 'exam_attempt':
        return 'dx-icon dx-icon-event';
      case 'user_login':
        return 'dx-icon dx-icon-user';
      case 'exam_created':
        return 'dx-icon dx-icon-file';
      case 'user_registered':
        return 'dx-icon dx-icon-user';
      default:
        return 'dx-icon dx-icon-info';
    }
  }

  // Hàm lấy nhãn cho loại hoạt động
  getActivityLabel(activityType: string): string {
    switch (activityType) {
      case 'exam_attempt':
        return 'Làm bài thi';
      case 'user_login':
        return 'Đăng nhập';
      case 'exam_created':
        return 'Tạo bài thi';
      case 'user_registered':
        return 'Đăng ký';
      default:
        return 'Hoạt động khác';
    }
  }

  // Hàm tùy chỉnh tooltip cho biểu đồ attempts
  customizeAttemptsTooltip = (arg: any) => {
    const date = new Date(arg.argument).toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Lấy tất cả dữ liệu của ngày này
    const pointData = this.attemptsByDateData.find(item =>
      item.date.getDate() === new Date(arg.argument).getDate() &&
      item.date.getMonth() === new Date(arg.argument).getMonth() &&
      item.date.getFullYear() === new Date(arg.argument).getFullYear()
    );

    if (!pointData) {
      return { text: `${date}: Không có dữ liệu` };
    }

    const passRate = pointData.attempts > 0
      ? Math.round((pointData.passed / pointData.attempts) * 100)
      : 0;

    let color = '#5B9BD5';
    if (arg.seriesName === 'Đậu') {
      color = '#70AD47';
    }

    return {
      html: `<div style="font-weight: bold; margin-bottom: 5px;">${date}</div>
             <div style="margin-bottom: 3px;">
               <span style="color: ${color};">●</span> ${arg.seriesName}: <strong>${arg.valueText}</strong>
             </div>
             <div style="margin-top: 5px;">
               <span>Tỷ lệ đậu: <strong>${passRate}%</strong></span>
             </div>`
    };
  }

  // Hàm tùy chỉnh label cho biểu đồ tròn
  customizeLabel = (arg: any) => {
    return `${arg.argumentText}: ${arg.valueText}`;
  }

  // Hàm tùy chỉnh label cho biểu đồ tròn (bên ngoài)
  customizePieLabel = (arg: any) => {
    return `${arg.argumentText}: ${arg.valueText}`;
  }

  // Hàm tùy chỉnh tooltip cho biểu đồ tròn
  customizePieTooltip = (arg: any) => {
    return {
      text: `${arg.argumentText}: ${arg.valueText} (${arg.percentText})`
    };
  }

  // Hàm lấy màu dựa trên tỷ lệ đậu
  getPassRateColor(passRate: number): string {
    if (passRate >= 80) {
      return '#4CAF50'; // Xanh lá - Rất tốt
    } else if (passRate >= 60) {
      return '#8BC34A'; // Xanh lá nhạt - Tốt
    } else if (passRate >= 40) {
      return '#FFC107'; // Vàng - Trung bình
    } else if (passRate >= 20) {
      return '#FF9800'; // Cam - Kém
    } else {
      return '#F44336'; // Đỏ - Rất kém
    }
  }

  // Hàm lấy màu gradient cho tỷ lệ đậu
  getPassRateGradient(passRate: number): string {
    if (passRate >= 80) {
      return 'linear-gradient(135deg, #4CAF50, #81C784)'; // Xanh lá - Rất tốt
    } else if (passRate >= 60) {
      return 'linear-gradient(135deg, #8BC34A, #AED581)'; // Xanh lá nhạt - Tốt
    } else if (passRate >= 40) {
      return 'linear-gradient(135deg, #FFC107, #FFE082)'; // Vàng - Trung bình
    } else if (passRate >= 20) {
      return 'linear-gradient(135deg, #FF9800, #FFB74D)'; // Cam - Kém
    } else {
      return 'linear-gradient(135deg, #F44336, #E57373)'; // Đỏ - Rất kém
    }
  }

  // Hàm lấy màu RGB cho tỷ lệ đậu
  getPassRateColorRGB(passRate: number): string {
    if (passRate >= 80) {
      return '76, 175, 80'; // Xanh lá - Rất tốt (RGB của #4CAF50)
    } else if (passRate >= 60) {
      return '139, 195, 74'; // Xanh lá nhạt - Tốt (RGB của #8BC34A)
    } else if (passRate >= 40) {
      return '255, 193, 7'; // Vàng - Trung bình (RGB của #FFC107)
    } else if (passRate >= 20) {
      return '255, 152, 0'; // Cam - Kém (RGB của #FF9800)
    } else {
      return '244, 67, 54'; // Đỏ - Rất kém (RGB của #F44336)
    }
  }
}
