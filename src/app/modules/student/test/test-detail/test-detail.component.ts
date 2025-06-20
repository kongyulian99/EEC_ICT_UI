import { Component, OnInit, OnDestroy, AfterViewInit, SecurityContext } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { QuestionService } from 'src/app/shared/services/question.service';
import { ExamsService } from 'src/app/shared';
import { interval, Subscription } from 'rxjs';
import { QuestionType } from 'src/app/shared/enums/enum';
import { DomSanitizer } from '@angular/platform-browser';
import { QuestionInfo } from 'src/app/shared/interfaces/question.interface';
import { UserExamAttemptService } from 'src/app/shared/services/user-attempt.service';
import { ScoreExamRequest, ScoreExamResponse, UserAnswer, ScoreCompleteExamResponse } from 'src/app/shared/interfaces/user-exam-attempt.interface';
import { NotificationService, SystemConstants, User } from 'src/app/shared';

@Component({
  selector: 'app-test-detail',
  templateUrl: './test-detail.component.html',
  styleUrls: ['./test-detail.component.scss']
})
export class TestDetailComponent implements OnInit, OnDestroy, AfterViewInit {
  // Trạng thái
  isLoading = false;
  isStarted = false;
  submitPopupVisible = false;
  isSubmitting = false;
  isCompleted = false;

  // Dữ liệu đề thi
  exam: any;
  questions: QuestionInfo[] = [];
  currentQuestionIndex = 0;
  userAnswers: { [key: number]: any } = {};

  // Dữ liệu người dùng
  currentUser: User = JSON.parse(localStorage.getItem(SystemConstants.CURRENT_USER) || '{}');
  userId: number = 0;

  // Dữ liệu lần làm bài
  attemptId?: number;
  attemptNumber?: number;
  startTime?: Date;

  // Dữ liệu kết quả
  examResult?: ScoreCompleteExamResponse;
  resultPopupVisible = false;

  // Đồng hồ đếm ngược
  remainingTime = 0;
  private timerSubscription?: Subscription;

  // Các hằng số
  questionTypes = {
    MULTIPLE_CHOICE: QuestionType.MULTIPLE_CHOICE,
    TRUE_FALSE: QuestionType.TRUE_FALSE,
    FILL_IN_THE_BLANK: QuestionType.FILL_IN_THE_BLANK
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private examService: ExamsService,
    private questionService: QuestionService,
    private userExamAttemptService: UserExamAttemptService,
    private notificationService: NotificationService,
    private sanitizer: DomSanitizer
  ) {
    // Lấy ID người dùng từ thông tin đăng nhập và chuyển đổi sang kiểu number
    this.userId = this.currentUser && this.currentUser.Id ? parseInt(this.currentUser.Id.toString(), 10) : 0;
  }

  ngOnInit() {
    this.loadExamData();
  }

  ngAfterViewInit() {
    // Không cần khởi tạo các input sau khi view được tạo nữa
  }

  ngOnDestroy() {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
  }

  // Lấy dữ liệu đề thi
  private loadExamData() {
    this.isLoading = true;
    const examId = this.route.snapshot.queryParams['id'];

    this.examService.getExamById(examId).subscribe({
      next: (response) => {
        if (response.ReturnStatus.Code === 1) {
          this.exam = response.ReturnData;
          this.loadQuestions(examId);
        }
      },
      error: (error) => {
        console.error('Lỗi khi tải thông tin đề thi:', error);
        this.isLoading = false;
      }
    });
  }

  // Lấy danh sách câu hỏi
  private loadQuestions(examId: number) {
    this.questionService.getQuestionsByExamId(examId).subscribe({
      next: (response) => {
        if (response.ReturnStatus.Code === 1) {
          this.questions = response.ReturnData;
          this.processQuestionsData();
          this.initializeUserAnswers();
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Lỗi khi tải danh sách câu hỏi:', error);
        this.isLoading = false;
      }
    });
  }

  // Xử lý dữ liệu câu hỏi để chuyển đổi định dạng
  private processQuestionsData() {
    this.questions.forEach(question => {
      if (question.Question_Type === this.questionTypes.FILL_IN_THE_BLANK) {
        try {
          // Kiểm tra xem dữ liệu đã ở định dạng mới chưa
          const existingData = JSON.parse(question.Question_Data_Json || '{}');
          if (existingData.segments && existingData.answers) {
            // Đã ở định dạng mới, không cần chuyển đổi
            return;
          }
        } catch {
          // Lỗi khi parse JSON, tiếp tục với quá trình chuyển đổi
        }

        // Chuyển đổi định dạng từ [[đáp án]] sang cấu trúc JSON mới
        const content = question.Content;
        const segments: string[] = [];
        const answers: string[] = [];

        let lastIndex = 0;
        const regex = /\[\[([^\]]+)\]\]/g;
        let match;

        while ((match = regex.exec(content)) !== null) {
          // Thêm đoạn văn bản trước chỗ trống
          if (match.index > lastIndex) {
            segments.push(content.substring(lastIndex, match.index));
          } else if (segments.length === 0) {
            // Nếu chỗ trống ở đầu, thêm một đoạn rỗng
            segments.push('');
          }

          // Thêm đáp án
          answers.push(match[1]);

          lastIndex = match.index + match[0].length;
        }

        // Thêm đoạn văn bản còn lại sau chỗ trống cuối cùng
        if (lastIndex < content.length) {
          segments.push(content.substring(lastIndex));
        } else {
          // Nếu chỗ trống ở cuối, thêm một đoạn rỗng
          segments.push('');
        }

        // Lưu cấu trúc mới vào Question_Data_Json
        const newData = {
          segments: segments,
          answers: answers
        };

        question.Question_Data_Json = JSON.stringify(newData);
      }
    });
  }

  // Khởi tạo mảng câu trả lời
  private initializeUserAnswers() {
    this.questions.forEach(question => {
      if (question.Question_Type === this.questionTypes.FILL_IN_THE_BLANK) {
        try {
          const data = JSON.parse(question.Question_Data_Json);
          const blanksCount = data.answers.length;
          this.userAnswers[question.Id] = new Array(blanksCount).fill('');
        } catch {
          this.userAnswers[question.Id] = [];
        }
      } else {
        this.userAnswers[question.Id] = null;
      }
    });
  }

  // Bắt đầu làm bài
  startExam() {
    this.isLoading = true;

    // Tạo lần làm bài mới
    this.userExamAttemptService.createUserExamAttempt(this.userId, this.exam.Id).subscribe({
      next: (response) => {
        if (response.ReturnStatus.Code === 1) {
          this.attemptId = response.ReturnData.NewAttemptId;
          this.attemptNumber = response.ReturnData.AttemptNumber;
          this.startTime = new Date();

          this.isStarted = true;
          this.remainingTime = this.exam.Duration_Minutes * 60;
          this.startTimer();
          this.notificationService.showSuccess('Bắt đầu làm bài thành công!');
        } else {
          this.notificationService.showError('Không thể bắt đầu làm bài: ' + response.ReturnStatus.Message);
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Lỗi khi tạo lần làm bài:', error);
        this.notificationService.showError('Lỗi khi bắt đầu làm bài');
        this.isLoading = false;
      }
    });
  }

  // Bắt đầu đồng hồ đếm ngược
  private startTimer() {
    this.timerSubscription = interval(1000).subscribe(() => {
      if (this.remainingTime > 0) {
        this.remainingTime--;
      } else {
        this.submitExam();
      }
    });
  }

  // Format thời gian
  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  // Lấy câu hỏi hiện tại
  get currentQuestion(): QuestionInfo {
    return this.questions[this.currentQuestionIndex];
  }

  // Điều hướng câu hỏi
  previousQuestion() {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
    }
  }

  nextQuestion() {
    if (this.currentQuestionIndex < this.questions.length - 1) {
      this.currentQuestionIndex++;
    }
  }

  goToQuestion(index: number) {
    if (index >= 0 && index < this.questions.length) {
      this.currentQuestionIndex = index;
    }
  }

  // Xử lý câu trả lời
  setMultipleChoiceAnswer(questionId: number, optionIndex: number) {
    this.userAnswers[questionId] = optionIndex;
  }

  setTrueFalseAnswer(questionId: number, value: boolean) {
    this.userAnswers[questionId] = value;
  }

  updateBlankAnswer(questionId: number, index: number, value: string) {
    if (this.userAnswers[questionId] && Array.isArray(this.userAnswers[questionId])) {
      this.userAnswers[questionId][index] = value;
    }
  }

  // Kiểm tra câu hỏi đã được trả lời chưa
  isQuestionAnswered(questionId: number): boolean {
    const answer = this.userAnswers[questionId];
    if (answer === null || answer === undefined) {
      return false;
    }

    // Đối với câu hỏi điền vào chỗ trống, kiểm tra nếu có ít nhất 1 đáp án
    if (Array.isArray(answer)) {
      return answer.some(item => item && item.trim() !== '');
    }

    return true;
  }

  getMultipleChoiceOptions(question: QuestionInfo): string[] {
    try {
      const data = JSON.parse(question.Question_Data_Json);
      return data.options || [];
    } catch {
      return [];
    }
  }

  // Lấy danh sách đáp án từ câu hỏi
  getFillInBlankAnswers(question: QuestionInfo): string[] {
    try {
      const data = JSON.parse(question.Question_Data_Json);
      return data.answers || [];
    } catch {
      return [];
    }
  }

  getOptionLabel(index: number): string {
    return String.fromCharCode(65 + index); // A, B, C, D, ...
  }

  getQuestionTypeLabel(type: number): string {
    switch (type) {
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

  // Xử lý nộp bài
  submitExam() {
    // this.submitPopupVisible = true;
    this.notificationService.showConfirmation('Bạn có chắc chắn muốn nộp bài kiểm tra này?', () => {
      this.confirmSubmit();
    });
  }

  confirmSubmit() {
    this.submitPopupVisible = false;
    this.isLoading = true;
    this.isSubmitting = true;

    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }

    // Chuẩn bị dữ liệu câu trả lời
    const answers: UserAnswer[] = this.prepareUserAnswers();

    // Tạo yêu cầu chấm điểm
    const scoreRequest: ScoreExamRequest = {
      UserId: this.userId,
      ExamId: this.exam.Id,
      AttemptId: this.attemptId,
      Answers: answers
    };

    // Gửi yêu cầu chấm điểm
    this.userExamAttemptService.scoreExamWithAnswers(scoreRequest).subscribe({
      next: (response) => {
        if (response.ReturnStatus.Code === 1) {
          // Lấy kết quả chi tiết
          this.getDetailedResult();
        } else {
          this.notificationService.showError('Không thể chấm điểm bài làm: ' + response.ReturnStatus.Message);
          this.isLoading = false;
          this.isSubmitting = false;
        }
      },
      error: (error) => {
        console.error('Lỗi khi chấm điểm bài làm:', error);
        this.notificationService.showError('Lỗi khi chấm điểm bài làm');
        this.isLoading = false;
        this.isSubmitting = false;
      }
    });
  }

  // Chuẩn bị dữ liệu câu trả lời để gửi lên server
  private prepareUserAnswers(): UserAnswer[] {
    const answers: UserAnswer[] = [];

    this.questions.forEach(question => {
      const answer = this.userAnswers[question.Id];
      let answerJson = '';

      if (question.Question_Type === this.questionTypes.MULTIPLE_CHOICE) {
        // Đối với câu hỏi trắc nghiệm
        answerJson = JSON.stringify({ selected_option_id: answer !== null ? answer : -1 });
      } else if (question.Question_Type === this.questionTypes.TRUE_FALSE) {
        // Đối với câu hỏi đúng/sai
        answerJson = JSON.stringify({ is_true: answer === true });
      } else if (question.Question_Type === this.questionTypes.FILL_IN_THE_BLANK) {
        // Đối với câu hỏi điền vào chỗ trống
        answerJson = JSON.stringify({ answers: answer || [] });
      }

      answers.push({
        QuestionId: question.Id,
        AnswerGivenJson: answerJson,
        TimeSpentSeconds: 0 // Có thể tính toán thời gian làm từng câu nếu cần
      });
    });

    return answers;
  }

  // Lấy kết quả chi tiết sau khi chấm điểm
  private getDetailedResult() {
    this.userExamAttemptService.scoreCompleteExam(
      this.userId,
      this.exam.Id,
      this.attemptNumber || 1
    ).subscribe({
      next: (response) => {
        if (response.ReturnStatus.Code === 1) {
          this.examResult = response.ReturnData;
          this.isCompleted = true;
          this.resultPopupVisible = true;
          this.notificationService.showSuccess('Đã hoàn thành bài kiểm tra!');
        } else {
          this.notificationService.showError('Không thể lấy kết quả chi tiết: ' + response.ReturnStatus.Message);
        }
        this.isLoading = false;
        this.isSubmitting = false;
      },
      error: (error) => {
        console.error('Lỗi khi lấy kết quả chi tiết:', error);
        this.notificationService.showError('Lỗi khi lấy kết quả chi tiết');
        this.isLoading = false;
        this.isSubmitting = false;
      }
    });
  }

  // Chuyển đến trang kết quả
  goToResultPage() {
    this.resultPopupVisible = false;
    this.router.navigate(['/student/exam-result', this.exam.Id], {
      queryParams: {
        attemptId: this.attemptId,
        attemptNumber: this.attemptNumber
      }
    });
  }

  // Lấy danh sách các đoạn văn bản từ câu hỏi
  getFillInBlankSegments(question: QuestionInfo): string[] {
    try {
      const data = JSON.parse(question.Question_Data_Json);
      return data.segments || [];
    } catch {
      return [];
    }
  }

  // Xử lý HTML an toàn
  sanitizeHtml(html: string): any {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  // Kiểm tra xem đáp án người dùng nhập vào có đúng không
  isCorrectAnswer(questionId: number, index: number): boolean {
    // Trong môi trường làm bài kiểm tra thực tế, chúng ta không nên hiển thị đáp án đúng
    // Phương thức này chỉ để minh họa, có thể sử dụng trong chế độ xem lại bài làm
    return false;
  }

  // Kiểm tra xem người dùng đã nhập đáp án cho ô nhập liệu này chưa
  hasAnswered(questionId: number, index: number): boolean {
    if (this.userAnswers[questionId] && Array.isArray(this.userAnswers[questionId])) {
      return !!this.userAnswers[questionId][index];
    }
    return false;
  }
}
