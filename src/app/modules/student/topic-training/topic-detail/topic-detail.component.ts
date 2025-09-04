import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { QuestionService } from 'src/app/shared/services/question.service';
import { QuestionInfo } from 'src/app/shared/interfaces/question.interface';
import { DomSanitizer } from '@angular/platform-browser';
import { QuestionType } from 'src/app/shared/enums/enum';
import { TopicInfo, TopicsService } from 'src/app/shared/services/topics.service';

@Component({
  selector: 'app-topic-detail',
  templateUrl: './topic-detail.component.html',
  styleUrls: ['./topic-detail.component.scss']
})
export class TopicDetailComponent implements OnInit {
  topicId: number = 0;
  isLoading: boolean = false;
  questions: QuestionInfo[] = [];
  errorMessage: string = '';

  // Navigation state
  currentQuestionIndex = 0;

  // Answer state
  userAnswers: { [questionId: number]: any } = {};

  topic: TopicInfo;

  questionTypes = {
    MULTIPLE_CHOICE: QuestionType.MULTIPLE_CHOICE,
    TRUE_FALSE: QuestionType.TRUE_FALSE,
    FILL_IN_THE_BLANK: QuestionType.FILL_IN_THE_BLANK
  };

  constructor(private route: ActivatedRoute, private questionService: QuestionService, private sanitizer: DomSanitizer, private topicsService: TopicsService) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const idFromRoute = params['topicId'];
      const idFromQuery = this.route.snapshot.queryParams['topicId'];
      this.topicId = idFromRoute ? Number(idFromRoute) : (idFromQuery ? Number(idFromQuery) : 0);

      if (this.topicId) {
        this.topicsService.getTopicById(this.topicId).subscribe((res) => {
          if (res.ReturnStatus.Code === 1) {
            this.topic = res.ReturnData;
          }
        });
        this.loadQuestionsByTopic();
      }
    });
  }

  private loadQuestionsByTopic(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.questionService.getQuestionsByTopicId(this.topicId).subscribe({
      next: (response) => {
        if (response && response.ReturnStatus && response.ReturnStatus.Code === 1) {
          this.questions = response.ReturnData || [];
          this.currentQuestionIndex = 0;
          this.initializeUserAnswers();
        } else {
          this.errorMessage = response?.ReturnStatus?.Message || 'Không thể tải danh sách câu hỏi.';
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Lỗi khi tải câu hỏi theo chủ đề:', error);
        this.errorMessage = 'Đã xảy ra lỗi khi tải câu hỏi.';
        this.isLoading = false;
      }
    });
  }

  private initializeUserAnswers(): void {
    this.userAnswers = {};
    this.questions.forEach(q => {
      if (q.Question_Type === this.questionTypes.FILL_IN_THE_BLANK) {
        try {
          const data = JSON.parse(q.Question_Data_Json || '{}');
          const blanksCount = (data.answers && Array.isArray(data.answers)) ? data.answers.length : 0;
          this.userAnswers[q.Id] = new Array(blanksCount).fill('');
        } catch {
          this.userAnswers[q.Id] = [];
        }
      } else if (q.Question_Type === this.questionTypes.MULTIPLE_CHOICE) {
        this.userAnswers[q.Id] = null; // option index
      } else if (q.Question_Type === this.questionTypes.TRUE_FALSE) {
        this.userAnswers[q.Id] = undefined; // boolean
      }
    });
  }

  // Helpers for rendering
  getMultipleChoiceOptions(question: QuestionInfo): string[] {
    try {
      const data = JSON.parse(question.Question_Data_Json);
      return data.options || [];
    } catch {
      return [];
    }
  }

  getFillInBlankSegments(question: QuestionInfo): string[] {
    try {
      const data = JSON.parse(question.Question_Data_Json);
      return data.segments || [];
    } catch {
      return [];
    }
  }

  getFillInBlankAnswers(question: QuestionInfo): string[] {
    try {
      const data = JSON.parse(question.Question_Data_Json);
      return data.answers || [];
    } catch {
      return [];
    }
  }

  sanitizeHtml(html: string): any {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  getOptionLabel(index: number): string {
    return String.fromCharCode(65 + index);
  }

  // Answer handlers
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

  isQuestionAnswered(questionId: number): boolean {
    const answer = this.userAnswers[questionId];
    const q = this.questions.find(x => x.Id === questionId);
    if (!q) { return false; }

    if (q.Question_Type === this.questionTypes.FILL_IN_THE_BLANK) {
      return Array.isArray(answer) && answer.some((v: string) => v && v.trim() !== '');
    }
    if (q.Question_Type === this.questionTypes.MULTIPLE_CHOICE) {
      return answer !== null && answer !== undefined;
    }
    if (q.Question_Type === this.questionTypes.TRUE_FALSE) {
      return answer === true || answer === false;
    }
    return false;
  }

  submitExam() {
    // Placeholder submit: just log answers or integrate submit service as needed
    console.log('Submitted answers:', this.userAnswers);
    alert('Đã lưu câu trả lời luyện tập!');
  }

  // Navigation controls
  get currentQuestion(): QuestionInfo | undefined {
    return this.questions && this.questions.length > 0 ? this.questions[this.currentQuestionIndex] : undefined;
  }

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
}
