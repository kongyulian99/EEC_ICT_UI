import { Component, OnInit, OnDestroy, AfterViewInit, SecurityContext } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { QuestionService } from 'src/app/shared/services/question.service';
import { ExamsService } from 'src/app/shared';
import { interval, Subscription } from 'rxjs';
import { QuestionType } from 'src/app/shared/enums/enum';
import { DomSanitizer } from '@angular/platform-browser';
import { QuestionInfo } from 'src/app/shared/interfaces/question.interface';
import { UserExamAttemptService } from 'src/app/shared/services/user-attempt.service';
import { ScoreExamRequest, ScoreExamResponse, UserAnswer } from 'src/app/shared/interfaces/user-exam-attempt.interface';
import { NotificationService, SystemConstants, User } from 'src/app/shared';
import { Location } from '@angular/common';

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
  examResult?: ScoreExamResponse;
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
    private sanitizer: DomSanitizer,
    private location: Location
  ) {
    // Lấy ID người dùng từ thông tin đăng nhập và chuyển đổi sang kiểu number
    this.userId = this.currentUser && this.currentUser.Id ? parseInt(this.currentUser.Id.toString(), 10) : 0;
  }

  ngOnInit() {
    this.loadExamData();
  }

  ngAfterViewInit() {
    // Gọi lại processTableInputs sau khi view được khởi tạo
    // setTimeout(() => {
    //   this.processTableInputs();
    // }, 100);
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

    // Lưu thời gian bắt đầu
    this.startTime = new Date();

    // Tạo lần làm bài mới
    this.userExamAttemptService.createUserExamAttempt(this.userId, this.exam.Id).subscribe({
      next: (response) => {
        if (response.ReturnStatus.Code === 1) {
          this.attemptId = response.ReturnData.NewAttemptId;
          this.attemptNumber = response.ReturnData.AttemptNumber;

          this.isStarted = true;
          this.remainingTime = this.exam.Duration_Minutes * 60;
          this.startTimer();
          this.notificationService.showSuccess('Exam started successfully!');
        } else {
          this.notificationService.showError('Unable to start exam: ' + response.ReturnStatus.Message);
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error creating exam attempt:', error);
        this.notificationService.showError('Error starting exam');
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
    // Đảm bảo seconds không âm
    seconds = Math.max(0, seconds);

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    } else {
      return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
  }

  // Lấy câu hỏi hiện tại
  get currentQuestion(): QuestionInfo {
    return this.questions[this.currentQuestionIndex];
  }

  // Điều hướng câu hỏi
  previousQuestion() {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
      setTimeout(() => {
        this.processTableInputs();
      }, 100);
    }
  }

  nextQuestion() {
    if (this.currentQuestionIndex < this.questions.length - 1) {
      this.currentQuestionIndex++;
      setTimeout(() => {
        this.processTableInputs();
      }, 100);
    }
  }

  goToQuestion(index: number) {
    if (index >= 0 && index < this.questions.length) {
      this.currentQuestionIndex = index;
      setTimeout(() => {
        this.processTableInputs();
      }, 100);
    }
  }

  // Xử lý câu trả lời
  setMultipleChoiceAnswer(questionId: number, optionIndex: number) {
    this.userAnswers[questionId] = optionIndex;
  }

  setTrueFalseAnswer(questionId: number, value: boolean) {
    this.userAnswers[questionId] = value;
  }

  updateBlankAnswer(questionId: number, index: number, value: any) {
    if (this.userAnswers[questionId] && this.userAnswers[questionId][index] !== undefined) {
      this.userAnswers[questionId][index] = value;
    }
  }

  // Kiểm tra câu hỏi đã được trả lời chưa
  isQuestionAnswered(questionId: string | number): boolean {
    const id = typeof questionId === 'number' ? questionId : parseInt(questionId);
    if (!this.userAnswers[id]) {
      return false;
    }

    // Kiểm tra câu trả lời dựa trên loại câu hỏi
    const question = this.questions.find(q => q.Id === id);
    if (!question) return false;

    if (question.Question_Type === this.questionTypes.FILL_IN_THE_BLANK) {
      // Với câu điền vào chỗ trống, kiểm tra xem có ít nhất một ô đã được điền
      const answers = this.userAnswers[id] as string[];
      return answers.some(answer => answer && answer.trim() !== '');
    } else if (question.Question_Type === this.questionTypes.MULTIPLE_CHOICE) {
      // Với câu trắc nghiệm, chỉ cần có giá trị là đã trả lời
      return this.userAnswers[id] !== undefined;
    } else if (question.Question_Type === this.questionTypes.TRUE_FALSE) {
      // Với câu đúng/sai, chỉ cần có giá trị là đã trả lời
      return this.userAnswers[id] !== undefined;
    }

    return false;
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
        return 'Multiple Choice';
      case this.questionTypes.TRUE_FALSE:
        return 'True/False';
      case this.questionTypes.FILL_IN_THE_BLANK:
        return 'Fill in the Blank';
      default:
        return 'Unknown';
    }
  }

  // Xử lý nộp bài
  submitExam() {
    this.notificationService.showConfirmation('Are you sure you want to submit this exam?', () => {
      this.confirmSubmit();
    });
  }

  confirmSubmit() {
    this.submitPopupVisible = false;
    this.isLoading = true;
    this.isSubmitting = true;

    // Dừng đồng hồ đếm ngược
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }

    // Tính thời gian hoàn thành
    const endTime = new Date();
    const totalTimeSpentInSeconds = Math.floor((endTime.getTime() - (this.startTime?.getTime() || endTime.getTime())) / 1000);

    // Chuẩn bị dữ liệu câu trả lời
    const answers: UserAnswer[] = this.prepareUserAnswers(totalTimeSpentInSeconds);

    // Tạo yêu cầu chấm điểm
    const scoreRequest: ScoreExamRequest = {
      UserId: this.userId,
      ExamId: this.exam.Id,
      AttemptId: this.attemptId,
      Answers: answers
    };

    // Gửi yêu cầu chấm điểm
    this.userExamAttemptService.scoreExam(scoreRequest).subscribe({
      next: (response) => {
        if (response.ReturnStatus.Code === 1) {
          // Lấy kết quả chi tiết
          this.examResult = response.ReturnData;

          // Đảm bảo thời gian hiển thị không bị âm
          if (this.examResult && this.examResult.Duration) {
            // Kiểm tra nếu thời gian có dấu "-" (âm)
            if (this.examResult.Duration.includes('-')) {
              // Tính thời gian thực tế từ startTime và endTime
              const duration = this.formatDuration(totalTimeSpentInSeconds);
              this.examResult.Duration = duration;
              this.examResult.TotalTimeInSeconds = totalTimeSpentInSeconds;
            }
          }

          this.isCompleted = true;
          this.resultPopupVisible = true;
          this.notificationService.showSuccess('Exam completed successfully!');
        } else {
          this.notificationService.showError('Unable to score exam: ' + response.ReturnStatus.Message);
          this.isLoading = false;
          this.isSubmitting = false;
        }
      },
      error: (error) => {
        console.error('Error scoring exam:', error);
        this.notificationService.showError('Error scoring exam');
        this.isLoading = false;
        this.isSubmitting = false;
      }
    });
  }

  // Chuẩn bị dữ liệu câu trả lời để gửi lên server
  private prepareUserAnswers(totalTimeSpent: number): UserAnswer[] {
    const answers: UserAnswer[] = [];

    // Tính thời gian trung bình cho mỗi câu hỏi
    const avgTimePerQuestion = totalTimeSpent > 0 && this.questions.length > 0
      ? Math.floor(totalTimeSpent / this.questions.length)
      : 0;

    this.questions.forEach(question => {
      const answer = this.userAnswers[question.Id];
      let answerJson = '';

      if (question.Question_Type === this.questionTypes.MULTIPLE_CHOICE) {
        // Đối với câu hỏi trắc nghiệm
        try {
          // Lấy danh sách options từ câu hỏi
          const data = JSON.parse(question.Question_Data_Json);
          const options = data.options || [];

          // Chuẩn bị dữ liệu theo định dạng MultipleChoiceAnswerJsonInfo
          answerJson = JSON.stringify({
            options: options,
            correctOption: answer !== null ? answer : -1
          });
        } catch (error) {
          console.error('Error processing multiple choice data:', error);
          answerJson = JSON.stringify({ correctOption: -1 });
        }
      } else if (question.Question_Type === this.questionTypes.TRUE_FALSE) {
        // Đối với câu hỏi đúng/sai
        // Chuẩn bị dữ liệu theo định dạng TrueFalseAnswerJsonInfo
        answerJson = JSON.stringify({
          correctAnswer: answer === true
        });
      } else if (question.Question_Type === this.questionTypes.FILL_IN_THE_BLANK) {
        // Đối với câu hỏi điền vào chỗ trống
        try {
          // Lấy cấu trúc câu hỏi (segments) từ câu hỏi
          const data = JSON.parse(question.Question_Data_Json);
          const segments = data.segments || [];

          // Chuẩn bị dữ liệu theo định dạng FillInTheBlankAnswerJsonInfo
          answerJson = JSON.stringify({
            answers: answer || [],
            segments: segments
          });
        } catch (error) {
          console.error('Error processing fill-in-the-blank data:', error);
          answerJson = JSON.stringify({ answers: [] });
        }
      }

      // Thêm câu trả lời vào danh sách với thời gian
      answers.push({
        QuestionId: question.Id,
        AnswerGivenJson: answerJson,
        TimeSpentSeconds: this.isQuestionAnswered(question.Id) ? avgTimePerQuestion : 0
      });
    });

    return answers;
  }

  // Format thời gian dưới dạng HH:MM:SS
  private formatDuration(seconds: number): string {
    seconds = Math.max(0, seconds);
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  // Lấy kết quả chi tiết sau khi chấm điểm
  // private getDetailedResult() {
  //   this.userExamAttemptService.scoreCompleteExam(
  //     this.userId,
  //     this.exam.Id,
  //     this.attemptNumber || 1
  //   ).subscribe({
  //     next: (response) => {
  //       if (response.ReturnStatus.Code === 1) {
  //         this.examResult = response.ReturnData;
  //         this.isCompleted = true;
  //         this.resultPopupVisible = true;
  //         this.notificationService.showSuccess('Đã hoàn thành bài kiểm tra!');
  //       } else {
  //         this.notificationService.showError('Không thể lấy kết quả chi tiết: ' + response.ReturnStatus.Message);
  //       }
  //       this.isLoading = false;
  //       this.isSubmitting = false;
  //     },
  //     error: (error) => {
  //       console.error('Lỗi khi lấy kết quả chi tiết:', error);
  //       this.notificationService.showError('Lỗi khi lấy kết quả chi tiết');
  //       this.isLoading = false;
  //       this.isSubmitting = false;
  //     }
  //   });
  // }

  // Chuyển đến trang kết quả
  goToResultPage() {
    this.resultPopupVisible = false;
    this.router.navigate(['/student/score-detail', this.exam.Id, this.attemptId]);
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

  // Thêm phương thức getAnsweredCount để đếm số câu hỏi đã trả lời
  getAnsweredCount(): number {
    let count = 0;
    if (this.questions && this.questions.length > 0) {
      for (const question of this.questions) {
        if (this.isQuestionAnswered(question.Id)) {
          count++;
        }
      }
    }
    return count;
  }

  // Method to navigate back
  goBack() {
    this.location.back();
  }

  // Method to handle result popup closing
  onResultPopupHidden() {
    this.goToResultPage();
  }

  // Xử lý các input trong bảng
  processTableInputs() {
    console.log('processTableInputs');
    if (!this.currentQuestion || this.currentQuestion.Question_Type !== this.questionTypes.FILL_IN_THE_BLANK) {
      return;
    }

    try {
      const data = JSON.parse(this.currentQuestion.Question_Data_Json);

      // Kiểm tra nếu có segment chứa bảng
      const hasTableSegment = data.segments && data.segments.some((segment: string) => segment.includes('<table'));

      if (!hasTableSegment) {
        return;
      }

      // Tìm tất cả các bảng trong câu hỏi
      const tables = document.querySelectorAll('.fill-blank-question table');

      if (!tables || tables.length === 0) {
        return;
      }

      // Xử lý từng bảng
      tables.forEach(table => {
        // Tìm tất cả các hàng trong bảng
        const rows = table.querySelectorAll('tr');

        // Nếu có ít nhất 2 hàng (tiêu đề và dữ liệu)
        if (rows.length >= 2) {
          // Hàng thứ hai chứa ô trống (y)
          const dataRow = rows[1];
          const cells = dataRow.querySelectorAll('td');

          // Nếu có ít nhất 2 ô (y và các ô trống)
          if (cells.length > 1) {
            // Khởi tạo mảng câu trả lời nếu chưa có
            if (!this.userAnswers[this.currentQuestion.Id]) {
              this.userAnswers[this.currentQuestion.Id] = new Array(data.answers.length).fill('');
            }

            // Bắt đầu từ ô thứ hai (sau ô "y")
            for (let i = 1; i < cells.length && (i-1) < data.answers.length; i++) {
              const cell = cells[i];
              const answerIndex = i - 1;

              // Tạo input element
              const input = document.createElement('input');
              input.type = 'text';
              input.className = 'form-control fill-blank-input';
              input.style.width = '100%';
              input.style.minWidth = '60px';

              // Thiết lập giá trị ban đầu
              if (this.userAnswers[this.currentQuestion.Id] &&
                  this.userAnswers[this.currentQuestion.Id][answerIndex] !== undefined) {
                input.value = this.userAnswers[this.currentQuestion.Id][answerIndex];
              }

              // Thêm sự kiện input
              input.addEventListener('input', (event) => {
                this.updateBlankAnswer(
                  this.currentQuestion.Id,
                  answerIndex,
                  (event.target as HTMLInputElement).value
                );
              });

              // Xóa nội dung cũ và thêm input vào ô
              cell.innerHTML = '';
              cell.appendChild(input);
            }
          }
        }
      });
    } catch (error) {
      console.error('Error processing table inputs:', error);
    }
  }
}
