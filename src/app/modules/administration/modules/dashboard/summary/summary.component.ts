import { Component, OnInit } from '@angular/core';
import { DashboardService } from 'src/app/shared/services/dashboard.service';

@Component({
  selector: 'app-summary',
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.scss']
})
export class SummaryComponent implements OnInit {
  summaryData = {
    totalUsers: 0,
    totalExams: 0,
    totalQuestions: 0,
    totalAttempts: 0,
    passRate: 0,
    userGrowth: 0,
    examGrowth: 0,
    questionGrowth: 0,
    attemptGrowth: 0,
    passRateGrowth: 0
  };

  loading = false;

  constructor(private dashboardService: DashboardService) { }

  ngOnInit() {
    this.loadSummaryData();
  }

  loadSummaryData() {
    this.loading = true;
    this.dashboardService.getSystemSummary().subscribe(response => {
      if (response.ReturnStatus.Code === 1 && response.ReturnData) {
        this.summaryData = {
          totalUsers: response.ReturnData.TotalUsers,
          totalExams: response.ReturnData.TotalExams,
          totalQuestions: response.ReturnData.TotalQuestions,
          totalAttempts: response.ReturnData.TotalAttempts,
          passRate: response.ReturnData.OverallPassRate,
          userGrowth: response.ReturnData.UserGrowth || 0,
          examGrowth: response.ReturnData.ExamGrowth || 0,
          questionGrowth: response.ReturnData.QuestionGrowth || 0,
          attemptGrowth: response.ReturnData.AttemptGrowth || 0,
          passRateGrowth: response.ReturnData.PassRateGrowth || 0
        };
      }
      this.loading = false;
    });
  }
}
