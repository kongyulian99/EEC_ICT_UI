import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserExamAttemptService } from 'src/app/shared/services/user-attempt.service';
import { ScoreExamResponse, DetailedAnswer } from 'src/app/shared/interfaces/user-exam-attempt.interface';
import { QuestionInfo } from 'src/app/shared/interfaces/question.interface';
import { QuestionService } from 'src/app/shared/services/question.service';
import { QuestionType } from 'src/app/shared/enums/enum';
import { NotificationService } from 'src/app/shared';
import { DomSanitizer } from '@angular/platform-browser';

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
  attemptId?: number;
  attemptNumber?: number;
  examResult?: ScoreExamResponse;
  questions: QuestionInfo[] = [];

  // Các hằng số
  questionTypes = {
    MULTIPLE_CHOICE: QuestionType.MULTIPLE_CHOICE,
    TRUE_FALSE: QuestionType.TRUE_FALSE,
    FILL_IN_THE_BLANK: QuestionType.FILL_IN_THE_BLANK
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userExamAttemptService: UserExamAttemptService,
    private questionService: QuestionService,
    private notificationService: NotificationService,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit(): void {
    // Lấy thông tin từ URL
    this.route.params.subscribe(params => {
      this.examId = +params['id'];

      this.route.queryParams.subscribe(queryParams => {
        this.attemptId = queryParams['attemptId'] ? +queryParams['attemptId'] : undefined;
        this.attemptNumber = queryParams['attemptNumber'] ? +queryParams['attemptNumber'] : undefined;

        if (this.examId && (this.attemptId || this.attemptNumber)) {
          this.loadExamResult();
        }
      });
    });
  }

  // Tải dữ liệu kết quả bài thi
  loadExamResult(): void {
    this.isLoading = true;

    // Lấy thông tin chi tiết về lần làm bài
    const userId = JSON.parse(localStorage.getItem('current_user') || '{}').id || 0;

    // Tạo request để lấy thông tin chi tiết bài thi
    const scoreRequest = {
      UserId: userId,
      ExamId: this.examId,
      AttemptId: this.attemptId,
      AttemptNumber: this.attemptNumber
    };

    this.userExamAttemptService.scoreExam(scoreRequest).subscribe({
      next: (response) => {
        if (response.ReturnStatus.Code === 1) {
          this.examResult = response.ReturnData;
          this.loadQuestionDetails();
        } else {
          this.notificationService.showError('Không thể tải thông tin chi tiết bài thi: ' + response.ReturnStatus.Message);
          this.isLoading = false;
        }
      },
      error: (error) => {
        console.error('Lỗi khi tải thông tin chi tiết bài thi:', error);
        this.notificationService.showError('Đã xảy ra lỗi khi tải thông tin chi tiết');
        this.isLoading = false;
      }
    });
  }

  // Tải thông tin chi tiết các câu hỏi
  loadQuestionDetails(): void {
    if (!this.examId) return;

    this.questionService.getQuestionsByExamId(this.examId).subscribe({
      next: (response) => {
        if (response.ReturnStatus.Code === 1) {
          this.questions = response.ReturnData;
          this.isLoading = false;
        } else {
          this.notificationService.showError('Không thể tải câu hỏi: ' + response.ReturnStatus.Message);
          this.isLoading = false;
        }
      },
      error: (error) => {
        console.error('Lỗi khi tải câu hỏi:', error);
        this.notificationService.showError('Đã xảy ra lỗi khi tải câu hỏi');
        this.isLoading = false;
      }
    });
  }

  // Lấy thông tin loại câu hỏi
  getQuestionTypeLabel(questionType: number): string {
    switch (questionType) {
      case this.questionTypes.MULTIPLE_CHOICE:
        return 'Trắc nghiệm';
      case this.questionTypes.TRUE_FALSE:
        return 'Đúng/Sai';
      case this.questionTypes.FILL_IN_THE_BLANK:
        return 'Điền vào chỗ trống';
      default:
        return 'Không xác định';
    }
  }

  // Lấy câu hỏi từ ID
  getQuestionById(questionId: number): QuestionInfo | undefined {
    return this.questions.find(q => q.Id === questionId);
  }

  // Lấy chi tiết câu trả lời từ ID câu hỏi
  getDetailedAnswerByQuestionId(questionId: number): DetailedAnswer | undefined {
    return this.examResult?.DetailedAnswers.find(a => a.Question_Id === questionId);
  }

  // Lấy options cho câu hỏi trắc nghiệm
  getMultipleChoiceOptions(question: QuestionInfo): string[] {
    try {
      const data = JSON.parse(question.Question_Data_Json);
      return data.options || [];
    } catch {
      return [];
    }
  }

  // Lấy đáp án đúng cho câu hỏi trắc nghiệm
  getCorrectMultipleChoiceAnswer(question: QuestionInfo): number {
    try {
      const data = JSON.parse(question.Question_Data_Json);
      return data.correctOption || 0;
    } catch {
      return 0;
    }
  }

  // Lấy đáp án người dùng đã chọn cho câu hỏi trắc nghiệm
  getUserMultipleChoiceAnswer(answer: DetailedAnswer): number {
    try {
      const data = JSON.parse(answer.Answer_Given_Json);
      return data.correctOption;
    } catch {
      return -1;
    }
  }

  // Lấy đáp án đúng cho câu hỏi đúng/sai
  getCorrectTrueFalseAnswer(question: QuestionInfo): boolean {
    try {
      const data = JSON.parse(question.Question_Data_Json);
      return data.correctAnswer || false;
    } catch {
      return false;
    }
  }

  // Lấy đáp án người dùng đã chọn cho câu hỏi đúng/sai
  getUserTrueFalseAnswer(answer: DetailedAnswer): boolean {
    try {
      const data = JSON.parse(answer.Answer_Given_Json);
      return data.correctAnswer || false;
    } catch {
      return false;
    }
  }

  // Lấy các phần text cho câu hỏi điền vào chỗ trống
  getFillInBlankSegments(question: QuestionInfo): string[] {
    try {
      const data = JSON.parse(question.Question_Data_Json);
      return data.segments || [];
    } catch {
      return [];
    }
  }

  // Lấy các đáp án đúng cho câu hỏi điền vào chỗ trống
  getCorrectFillInBlankAnswers(question: QuestionInfo): string[] {
    try {
      const data = JSON.parse(question.Question_Data_Json);
      return data.answers || [];
    } catch {
      return [];
    }
  }

  // Lấy đáp án người dùng đã nhập cho câu hỏi điền vào chỗ trống
  getUserFillInBlankAnswers(answer: DetailedAnswer): string[] {
    try {
      const data = JSON.parse(answer.Answer_Given_Json);
      return data.answers || [];
    } catch {
      return [];
    }
  }

  // Làm sạch HTML để hiển thị an toàn
  sanitizeHtml(html: string) {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  // Định dạng nhãn cho options
  getOptionLabel(index: number): string {
    return String.fromCharCode(65 + index);
  }

  // Quay lại trang danh sách bài thi
  goBack(): void {
    this.router.navigate(['/student/my-exams']);
  }
}
