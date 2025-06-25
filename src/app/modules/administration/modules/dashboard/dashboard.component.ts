import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NotificationService, SystemConstants } from 'src/app/shared';
import { ResponseData } from 'src/app/shared/models';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  loading = false;

  // Bộ lọc ngày tháng
  startDate: Date;
  endDate: Date;

  // Dữ liệu tổng quan
  summaryData: {
    totalUsers: number;
    totalExams: number;
    totalAttempts: number;
    passRate: number;
    avgScore: number;
  } = {
    totalUsers: 0,
    totalExams: 0,
    totalAttempts: 0,
    passRate: 0,
    avgScore: 0
  };

  // Dữ liệu biểu đồ
  attemptsByDateData: any[] = [];
  scoreDistributionData: any[] = [];

  // Dữ liệu bảng
  topExamsData: any[] = [];
  recentActivitiesData: any[] = [];

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private notificationService: NotificationService
  ) {
    // Khởi tạo ngày bắt đầu (30 ngày trước) và ngày kết thúc (hiện tại)
    this.endDate = new Date();
    this.startDate = new Date();
    this.startDate.setDate(this.startDate.getDate() - 30);
  }

  ngOnInit(): void {
    this.loadMockData();
  }

  onStartDateChanged(e: any) {
    this.startDate = e.value;
  }

  onEndDateChanged(e: any) {
    this.endDate = e.value;
  }

  refreshDashboard() {
    this.loadMockData();
  }

  loadMockData() {
    this.loading = true;

    // Giả lập thời gian tải dữ liệu
    setTimeout(() => {
      this.loadMockSummaryData();
      this.loadMockChartData();
      this.loadMockTableData();
      this.loading = false;
    }, 1000);
  }

  loadMockSummaryData() {
    // Mock dữ liệu tổng quan
    this.summaryData = {
      totalUsers: 256,
      totalExams: 45,
      totalAttempts: 1872,
      passRate: 78.5,
      avgScore: 72.3
    };
  }

  loadMockChartData() {
    // Mock dữ liệu biểu đồ số lần làm bài theo ngày
    this.attemptsByDateData = [];
    const currentDate = new Date();

    // Tạo dữ liệu cho 10 ngày gần nhất
    for (let i = 9; i >= 0; i--) {
      const date = new Date();
      date.setDate(currentDate.getDate() - i);

      const attempts = Math.floor(Math.random() * 30) + 10; // 10-40 lần làm bài
      const passed = Math.floor(attempts * (Math.random() * 0.3 + 0.6)); // 60-90% pass rate

      this.attemptsByDateData.push({
        date: date,
        attempts: attempts,
        passed: passed,
        failed: attempts - passed
      });
    }

    // Mock dữ liệu phân bố điểm số
    this.scoreDistributionData = [
      { rangeStart: 0, rangeEnd: 20, rangeLabel: '0-20', count: 45 },
      { rangeStart: 21, rangeEnd: 40, rangeLabel: '21-40', count: 98 },
      { rangeStart: 41, rangeEnd: 60, rangeLabel: '41-60', count: 264 },
      { rangeStart: 61, rangeEnd: 80, rangeLabel: '61-80', count: 735 },
      { rangeStart: 81, rangeEnd: 100, rangeLabel: '81-100', count: 730 }
    ];
  }

  loadMockTableData() {
    // Mock dữ liệu top bài thi
    this.topExamsData = [
      { id: 1, title: 'Bài thi cuối kỳ Lập trình Web', attempts: 245, avgScore: 76.8, passRate: 0.82 },
      { id: 2, title: 'Bài thi giữa kỳ Cơ sở dữ liệu', attempts: 198, avgScore: 68.5, passRate: 0.75 },
      { id: 3, title: 'Bài kiểm tra Cấu trúc dữ liệu', attempts: 187, avgScore: 72.3, passRate: 0.79 },
      { id: 4, title: 'Bài thi cuối kỳ Lập trình Java', attempts: 156, avgScore: 65.7, passRate: 0.71 },
      { id: 5, title: 'Bài thi Mạng máy tính', attempts: 143, avgScore: 78.9, passRate: 0.84 }
    ];

    // Mock dữ liệu hoạt động gần đây
    const users = ['Nguyễn Văn A', 'Trần Thị B', 'Lê Văn C', 'Phạm Thị D', 'Hoàng Văn E'];
    const activities = ['Hoàn thành bài thi', 'Bắt đầu làm bài thi', 'Đăng nhập hệ thống', 'Đăng xuất hệ thống', 'Xem lại kết quả'];
    const exams = ['Bài thi cuối kỳ Lập trình Web', 'Bài thi giữa kỳ Cơ sở dữ liệu', 'Bài kiểm tra Cấu trúc dữ liệu', 'Bài thi cuối kỳ Lập trình Java'];

    this.recentActivitiesData = [];

    // Tạo 10 hoạt động gần đây
    for (let i = 0; i < 10; i++) {
      const timestamp = new Date();
      timestamp.setMinutes(timestamp.getMinutes() - i * 30); // Mỗi 30 phút một hoạt động

      const user = users[Math.floor(Math.random() * users.length)];
      const activity = activities[Math.floor(Math.random() * activities.length)];
      let details = '';

      if (activity === 'Hoàn thành bài thi') {
        const exam = exams[Math.floor(Math.random() * exams.length)];
        const score = Math.floor(Math.random() * 40) + 60; // 60-100 điểm
        details = `${exam} - Điểm: ${score}/100`;
      } else if (activity === 'Bắt đầu làm bài thi') {
        const exam = exams[Math.floor(Math.random() * exams.length)];
        details = exam;
      } else if (activity === 'Xem lại kết quả') {
        const exam = exams[Math.floor(Math.random() * exams.length)];
        details = exam;
      }

      this.recentActivitiesData.push({
        timestamp: timestamp,
        user: user,
        activity: activity,
        details: details
      });
    }
  }

  // Hàm tùy chỉnh tooltip cho biểu đồ cột
  customizeTooltip = (arg: any) => {
    return {
      text: `${arg.seriesName}: ${arg.valueText}`
    };
  }

  // Hàm tùy chỉnh nhãn cho biểu đồ tròn
  customizeLabel = (arg: any) => {
    return `${arg.argumentText}: ${arg.valueText} (${arg.percentText})`;
  }

  // Hàm tùy chỉnh tooltip cho biểu đồ tròn
  customizePieTooltip = (arg: any) => {
    return {
      text: `${arg.argumentText}: ${arg.valueText} (${arg.percentText})`
    };
  }
}
