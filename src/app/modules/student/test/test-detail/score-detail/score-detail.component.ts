import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserExamAttemptService } from 'src/app/shared/services/user-attempt.service';
import { NotificationService, SystemConstants } from 'src/app/shared';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Location } from '@angular/common';

// Interface cho kết quả chi tiết bài thi
interface DetailedAttemptResult {
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
  };
  Statistics: {
    TotalQuestions: number;
    CorrectAnswers: number;
    IncorrectAnswers: number;
    CorrectPercentage: number;
  };
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
  }[];
}

@Component({
  selector: 'app-score-detail',
  templateUrl: './score-detail.component.html',
  styleUrls: ['./score-detail.component.scss']
})
export class ScoreDetailComponent implements OnInit {
  // Trạng thái
  isLoading = false;

  // Thông tin đề thi và kết quả
  examId: number = 0;
  attemptId: number = 0;

  // Dữ liệu kết quả chi tiết
  detailedResult?: DetailedAttemptResult;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userExamAttemptService: UserExamAttemptService,
    private notificationService: NotificationService,
    private sanitizer: DomSanitizer,
    private location: Location
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.examId = +params['examId'] || 0;
      this.attemptId = +params['attemptId'] || 0;

      if (this.attemptId) {
        this.loadDetailedResult();
      } else {
        this.notificationService.showError('Attempt information not found');
        this.goBack();
      }
    });
  }

  // Tải kết quả chi tiết của lượt làm bài
  loadDetailedResult(): void {
    this.isLoading = true;

    this.userExamAttemptService.getDetailedAttemptResult(this.attemptId).subscribe({
      next: (response) => {
        if (response.ReturnStatus.Code === 1) {
          this.detailedResult = response.ReturnData;
          this.examId = this.detailedResult.AttemptInfo.ExamId;
          this.isLoading = false;
        } else {
          this.notificationService.showError('Không thể tải kết quả chi tiết: ' + response.ReturnStatus.Message);
          this.isLoading = false;
          this.goBack();
        }
      },
      error: (error) => {
        console.error('Lỗi khi tải kết quả chi tiết:', error);
        this.notificationService.showError('An error occurred while loading detailed results');
        this.isLoading = false;
        this.goBack();
      }
    });
  }

  // Quay lại trang danh sách bài thi
  goBack(): void {
    this.location.back();
  }

  // Tạo giá trị cho biểu đồ tròn tỷ lệ đúng
  getCorrectAnswerCircle(): string {
    if (!this.detailedResult || this.detailedResult.Statistics.TotalQuestions === 0) {
      return '0 502.4'; // 2πr, r = 80
    }
    const correctPercentage = this.detailedResult.Statistics.CorrectPercentage;
    const circumference = 2 * Math.PI * 80; // 2πr, r = 80
    const dashArray = (correctPercentage / 100) * circumference;
    return `${dashArray} ${circumference}`;
  }

  // Tạo giá trị cho biểu đồ donut
  getDonutCircleValue(percentage: number): string {
    if (!percentage) return '0 502.4';

    const radius = 80;
    const circumference = 2 * Math.PI * radius;
    const dashArray = (percentage / 100) * circumference;
    return `${dashArray} ${circumference}`;
  }

  // Định dạng số giây thành hh:mm:ss
  formatSeconds(seconds: number): string {
    if (!seconds) return '00:00';

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    const hoursStr = hours > 0 ? `${hours.toString().padStart(2, '0')}:` : '';
    const minutesStr = minutes.toString().padStart(2, '0');
    const secondsStr = remainingSeconds.toString().padStart(2, '0');

    return `${hoursStr}${minutesStr}:${secondsStr}`;
  }

  // Xử lý HTML an toàn
  sanitizeHtml(html: string): SafeHtml {
    if (!html) return '';
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  // Lấy các phân đoạn từ câu hỏi điền vào chỗ trống
  getFillInBlankSegments(questionData: any): string[] {
    if (!questionData || !questionData.segments) {
      return [];
    }
    return questionData.segments;
  }

  // Lấy các đáp án từ câu hỏi điền vào chỗ trống
  getFillInBlankAnswers(questionData: any): string[] {
    if (!questionData || !questionData.answers) {
      return [];
    }
    return questionData.answers;
  }

  // Lấy nhãn cho các tùy chọn trắc nghiệm (A, B, C, D, ...)
  getOptionLabel(index: number): string {
    return String.fromCharCode(65 + index); // A, B, C, D, ...
  }

  // Kiểm tra xem câu trả lời của người dùng có đúng không
  isBlankAnswerCorrect(question: any, index: number): boolean {
    if (!question || !question.QuestionData || !question.QuestionData.answers) {
      return false;
    }

    const correctAnswer = this.getCorrectBlankAnswer(question, index);
    const userAnswer = this.getUserBlankAnswer(question, index);

    return userAnswer && correctAnswer && userAnswer.toLowerCase() === correctAnswer.toLowerCase();
  }

  // Kiểm tra xem người dùng có câu trả lời không
  hasUserAnswer(question: any, index: number): boolean {
    const userAnswer = this.getUserBlankAnswer(question, index);
    return userAnswer !== null && userAnswer !== undefined && userAnswer !== '';
  }

  // Lấy câu trả lời của người dùng
  getUserBlankAnswer(question: any, index: number): string {
    if (!question) {
      return '';
    }

    // Sử dụng UserAnswer thay vì UserAnswerData
    if (question.UserAnswer) {
      const answers = question.UserAnswer.split(',');
      if (index < answers.length) {
        return answers[index].trim();
      }
    }

    return '';
  }

  // Lấy đáp án đúng
  getCorrectBlankAnswer(question: any, index: number): string {
    if (!question || !question.QuestionData || !question.QuestionData.answers) {
      return '';
    }

    if (index < question.QuestionData.answers.length) {
      return question.QuestionData.answers[index];
    }

    return '';
  }

  // Làm lại đề thi
  retakeExam(): void {
    this.router.navigate(['/student/test-detail'], { queryParams: { id: this.examId } });
  }
}
