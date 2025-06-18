import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NotificationService } from 'src/app/shared';
import { ExamsService } from 'src/app/shared/services/exam.service';
import { QuestionService } from 'src/app/shared/services/question.service';
import { TopicInfo, TopicsService } from 'src/app/shared/services/topics.service';
import { confirm } from 'devextreme/ui/dialog';
import { dxButtonConfig } from 'src/app/shared/config';
import { QuestionType } from 'src/app/shared/enums/enum';
import { FillInTheBlankData, MultipleChoiceData, QuestionInfo, TrueFalseData } from 'src/app/shared/interfaces/question.interface';
import { ExamInfo } from 'src/app/shared/interfaces/exam.interface';

@Component({
  selector: 'app-exam-detail',
  templateUrl: './exam-detail.component.html',
  styleUrls: ['./exam-detail.component.scss']
})
export class ExamDetailComponent implements OnInit {
  dxButtonConfig = dxButtonConfig;

  // Thông tin đề thi
  examId: number;
  exam: ExamInfo = {} as ExamInfo;
  isNewExam: boolean = true;
  isLoading: boolean = false;

  // Danh sách câu hỏi
  questions: QuestionInfo[] = [];

  // Danh sách chủ đề
  topics: TopicInfo[] = [];

  // Popup câu hỏi
  questionPopupVisible: boolean = false;
  editingQuestion: QuestionInfo = {} as QuestionInfo;
  isNewQuestion: boolean = true;
  questionPopupTitle: string = '';

  // Dữ liệu câu hỏi theo loại
  multipleChoiceData: MultipleChoiceData = { options: ['', '', '', ''], correctOption: 0 };
  trueFalseData: TrueFalseData = { correctAnswer: true };
  fillInTheBlankData: FillInTheBlankData = { correctAnswers: [''] };

  // Enum
  questionTypes = QuestionType;

  // Các mức độ khó
  difficultyLevels = [
    { value: 1, text: 'Dễ' },
    { value: 2, text: 'Trung bình' },
    { value: 3, text: 'Khó' }
  ];

  // Hàm Number để sử dụng trong template
  Number = Number;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private examsService: ExamsService,
    private questionService: QuestionService,
    private topicsService: TopicsService,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    this.loadTopics();
    this.route.queryParams.subscribe(params => {
      if (params['id']) {
        this.examId = +params['id'];
        this.isNewExam = false;
        this.loadExamDetails();
        this.loadQuestions();
      } else {
        this.isNewExam = true;
        this.exam = {
          Id: 0,
          Title: '',
          Description: '',
          Duration_Minutes: 60,
          Total_Questions: 0,
          Created_At: new Date(),
          Updated_At: new Date()
        } as ExamInfo;
      }
    });
  }

  // Tải thông tin chi tiết đề thi
  loadExamDetails(): void {
    this.isLoading = true;
    this.examsService.getExamById(this.examId).subscribe(
      (response: any) => {
        if (response.ReturnStatus.Code === 1) {
          this.exam = response.ReturnData;
        } else {
          this.notificationService.showError(response.ReturnStatus.Message);
        }
        this.isLoading = false;
      },
      (error) => {
        this.notificationService.showError('Không thể tải thông tin đề thi');
        this.isLoading = false;
      }
    );
  }

  // Tải danh sách câu hỏi của đề thi
  loadQuestions(): void {
    this.isLoading = true;
    this.questionService.getQuestionsByExamId(this.examId).subscribe(
      (response: any) => {
        if (response.ReturnStatus.Code === 1) {
          this.questions = response.ReturnData;
        } else {
          this.notificationService.showError(response.ReturnStatus.Message);
        }
        this.isLoading = false;
      },
      (error) => {
        this.notificationService.showError('Không thể tải danh sách câu hỏi');
        this.isLoading = false;
      }
    );
  }

  // Tải danh sách chủ đề
  loadTopics(): void {
    this.isLoading = true;
    this.topicsService.getAllTopics().subscribe(
      (response: any) => {
        if (response.ReturnStatus.Code === 1) {
          this.topics = response.ReturnData;
        } else {
          this.notificationService.showError(response.ReturnStatus.Message);
        }
        this.isLoading = false;
      },
      (error) => {
        this.notificationService.showError('Không thể tải danh sách chủ đề');
        this.isLoading = false;
      }
    );
  }

  // Lưu thông tin đề thi
  saveExam(): void {
    if (!this.validateExam()) {
      return;
    }

    this.isLoading = true;

    if (this.isNewExam) {
      this.examsService.createExam(this.exam).subscribe(
        (response: any) => {
          if (response.ReturnStatus.Code === 1) {
            this.notificationService.showSuccess('Thêm mới đề thi thành công');
            this.examId = response.ReturnData;
            this.isNewExam = false;
            this.router.navigate(['/administration/exams/detail'], { queryParams: { id: this.examId } });
          } else {
            this.notificationService.showError(response.ReturnStatus.Message);
          }
          this.isLoading = false;
        },
        (error) => {
          this.notificationService.showError('Không thể thêm mới đề thi');
          this.isLoading = false;
        }
      );
    } else {
      this.examsService.updateExam(this.exam).subscribe(
        (response: any) => {
          if (response.ReturnStatus.Code === 1) {
            this.notificationService.showSuccess('Cập nhật đề thi thành công');
          } else {
            this.notificationService.showError(response.ReturnStatus.Message);
          }
          this.isLoading = false;
        },
        (error) => {
          this.notificationService.showError('Không thể cập nhật đề thi');
          this.isLoading = false;
        }
      );
    }
  }

  // Validate dữ liệu đề thi
  validateExam(): boolean {
    if (!this.exam.Title || this.exam.Title.trim() === '') {
      this.notificationService.showError('Vui lòng nhập tiêu đề đề thi');
      return false;
    }

    if (this.exam.Duration_Minutes <= 0) {
      this.notificationService.showError('Thời gian làm bài phải lớn hơn 0');
      return false;
    }

    return true;
  }

  // Thêm câu hỏi mới
  addQuestion(): void {
    this.isNewQuestion = true;
    this.questionPopupTitle = 'Thêm mới câu hỏi';
    this.editingQuestion = {
      Id: 0,
      Exam_Id: this.examId,
      Topic_Id: 0,
      Question_Type: QuestionType.MULTIPLE_CHOICE,
      Content: '',
      Question_Data_Json: '',
      Explanation: '',
      Difficulty_Level: 1,
      Created_At: new Date(),
      Updated_At: new Date()
    } as QuestionInfo;

    // Đảm bảo Question_Type là số nguyên
    this.editingQuestion.Question_Type = Number(this.editingQuestion.Question_Type);

    this.questionPopupVisible = true;
  }

  // Chỉnh sửa câu hỏi
  editQuestion(question: QuestionInfo): void {
    this.isNewQuestion = false;
    this.questionPopupTitle = 'Chỉnh sửa câu hỏi';
    this.editingQuestion = { ...question };

    // Đảm bảo Question_Type là số nguyên
    this.editingQuestion.Question_Type = Number(this.editingQuestion.Question_Type);

    this.questionPopupVisible = true;
  }

  // Lưu câu hỏi
  saveQuestion(questionToSave: QuestionInfo = null): void {
    if (questionToSave === null) {
      // Nếu không có tham số, sử dụng editingQuestion
      questionToSave = { ...this.editingQuestion };
    }

    console.log('Saving question:', {
      ...questionToSave,
      Question_Type: Number(questionToSave.Question_Type),
      Question_Data_Json: questionToSave.Question_Data_Json
    });

    this.isLoading = true;

    if (this.isNewQuestion) {
      this.questionService.createQuestion({...questionToSave, Question_Type: Number(questionToSave.Question_Type)}).subscribe(
        (response: any) => {
          if (response.ReturnStatus.Code === 1) {
            this.notificationService.showSuccess('Thêm mới câu hỏi thành công');
            this.questionPopupVisible = false;
            this.loadQuestions();
            // Cập nhật tổng số câu hỏi
            this.exam.Total_Questions = this.questions.length + 1;
            // this.saveExam();
          } else {
            this.notificationService.showError(response.ReturnStatus.Message);
          }
          this.isLoading = false;
        },
        (error) => {
          console.error('Lỗi khi tạo câu hỏi:', error);
          this.notificationService.showError('Không thể thêm mới câu hỏi');
          this.isLoading = false;
        }
      );
    } else {
      this.questionService.updateQuestion(questionToSave).subscribe(
        (response: any) => {
          if (response.ReturnStatus.Code === 1) {
            this.notificationService.showSuccess('Cập nhật câu hỏi thành công');
            this.questionPopupVisible = false;
            this.loadQuestions();
          } else {
            this.notificationService.showError(response.ReturnStatus.Message);
          }
          this.isLoading = false;
        },
        (error) => {
          console.error('Lỗi khi cập nhật câu hỏi:', error);
          this.notificationService.showError('Không thể cập nhật câu hỏi');
          this.isLoading = false;
        }
      );
    }
  }

  // Xóa câu hỏi
  deleteQuestion(question: QuestionInfo): void {
    const result = confirm('Bạn có chắc chắn muốn xóa câu hỏi này?', 'Xác nhận xóa');
    result.then((dialogResult) => {
      if (dialogResult) {
        this.isLoading = true;
        this.questionService.deleteQuestion(question.Id).subscribe(
          (response: any) => {
            if (response.ReturnStatus.Code === 1) {
              this.notificationService.showSuccess('Xóa câu hỏi thành công');
              this.loadQuestions();
              // Cập nhật tổng số câu hỏi
              this.exam.Total_Questions = this.questions.length - 1;
              this.saveExam();
            } else {
              this.notificationService.showError(response.ReturnStatus.Message);
            }
            this.isLoading = false;
          },
          (error) => {
            this.notificationService.showError('Không thể xóa câu hỏi');
            this.isLoading = false;
          }
        );
      }
    });
  }

  // Validate câu hỏi
  validateQuestion(): boolean {
    if (!this.editingQuestion.Content || this.editingQuestion.Content.trim() === '' || this.editingQuestion.Content === '<p>&nbsp;</p>') {
      this.notificationService.showError('Vui lòng nhập nội dung câu hỏi');
      return false;
    }

    if (!this.editingQuestion.Topic_Id) {
      this.notificationService.showError('Vui lòng chọn chủ đề');
      return false;
    }

    // Đảm bảo Question_Type là số nguyên
    this.editingQuestion.Question_Type = Number(this.editingQuestion.Question_Type);

    // Validate theo loại câu hỏi
    switch (Number(this.editingQuestion.Question_Type)) {
      case QuestionType.MULTIPLE_CHOICE:
        // Kiểm tra các lựa chọn không được để trống
        const emptyOptions = this.multipleChoiceData.options.filter(opt => !opt.trim()).length;
        if (emptyOptions > 0) {
          this.notificationService.showError('Vui lòng nhập đầy đủ các lựa chọn');
          return false;
        }
        break;
      case QuestionType.FILL_IN_THE_BLANK:
        // Kiểm tra ít nhất một đáp án
        if (this.fillInTheBlankData.correctAnswers.length === 0 ||
            !this.fillInTheBlankData.correctAnswers[0].trim()) {
          this.notificationService.showError('Vui lòng nhập ít nhất một đáp án đúng');
          return false;
        }
        break;
    }

    return true;
  }

  // Thêm lựa chọn cho câu hỏi trắc nghiệm
  addOption(): void {
    this.multipleChoiceData.options.push('');
  }

  // Xóa lựa chọn cho câu hỏi trắc nghiệm
  removeOption(index: number): void {
    if (this.multipleChoiceData.options.length > 2) {
      this.multipleChoiceData.options.splice(index, 1);
      // Điều chỉnh lại đáp án đúng nếu cần
      if (this.multipleChoiceData.correctOption >= this.multipleChoiceData.options.length) {
        this.multipleChoiceData.correctOption = this.multipleChoiceData.options.length - 1;
      }
    } else {
      this.notificationService.showError('Câu hỏi trắc nghiệm phải có ít nhất 2 lựa chọn');
    }
  }

  // Thêm đáp án cho câu hỏi điền vào chỗ trống
  addAnswer(): void {
    this.fillInTheBlankData.correctAnswers.push('');
  }

  // Xóa đáp án cho câu hỏi điền vào chỗ trống
  removeAnswer(index: number): void {
    if (this.fillInTheBlankData.correctAnswers.length > 1) {
      this.fillInTheBlankData.correctAnswers.splice(index, 1);
    } else {
      this.notificationService.showError('Phải có ít nhất một đáp án đúng');
    }
  }

  // Đóng popup câu hỏi
  cancelQuestionPopup(): void {
    this.questionPopupVisible = false;
  }

  // Quay lại trang danh sách
  // goBack(): void {
  //   this.router.navigate(['/administration/exams/manage']);
  // }

  // Lấy tên loại câu hỏi
  getQuestionTypeName(type: number): string {
    switch (type) {
      case QuestionType.MULTIPLE_CHOICE:
        return 'Trắc nghiệm';
      case QuestionType.FILL_IN_THE_BLANK:
        return 'Điền vào chỗ trống';
      case QuestionType.TRUE_FALSE:
        return 'Đúng/Sai';
      default:
        return 'Không xác định';
    }
  }

  // Lấy tên mức độ khó
  getDifficultyLevelName(level: number): string {
    switch (level) {
      case 1:
        return 'Dễ';
      case 2:
        return 'Trung bình';
      case 3:
        return 'Khó';
      default:
        return 'Không xác định';
    }
  }

  // Xử lý khi thay đổi loại câu hỏi
  onQuestionTypeChanged(e: any): void {
    // Đảm bảo Question_Type là số nguyên
    this.editingQuestion.Question_Type = Number(this.editingQuestion.Question_Type);

    // Khởi tạo lại dữ liệu mặc định cho loại câu hỏi mới
    switch (Number(this.editingQuestion.Question_Type)) {
      case QuestionType.MULTIPLE_CHOICE:
        this.multipleChoiceData = { options: ['', '', '', ''], correctOption: 0 };
        break;
      case QuestionType.TRUE_FALSE:
        this.trueFalseData = { correctAnswer: true };
        break;
      case QuestionType.FILL_IN_THE_BLANK:
        this.fillInTheBlankData = { correctAnswers: [''] };
        break;
    }
  }
}
