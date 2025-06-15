import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { QuestionInfo } from 'src/app/shared/services/question.service';
import { TopicInfo } from 'src/app/shared/services/topics.service';
import { QuestionType } from 'src/app/shared/enums/enum';
import { dxButtonConfig } from 'src/app/shared/config';

interface MultipleChoiceData {
  options: string[];
  correctOption: number;
}

interface TrueFalseData {
  correctAnswer: boolean;
}

interface FillInTheBlankData {
  correctAnswers: string[];
}

@Component({
  selector: 'app-question-detail',
  templateUrl: './question-detail.component.html',
  styleUrls: ['./question-detail.component.scss']
})
export class QuestionDetailComponent implements OnInit {
  @Input() editingQuestion: QuestionInfo;
  @Input() topics: TopicInfo[] = [];
  @Input() isLoading: boolean = false;

  @Output() save = new EventEmitter<QuestionInfo>();
  @Output() cancel = new EventEmitter<void>();

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

  // Button config
  dxButtonConfig = dxButtonConfig;

  // Hàm Number để sử dụng trong template
  Number = Number;

  constructor() { }

  ngOnInit(): void {
    this.initQuestionData();
  }

  ngOnChanges(): void {
    this.initQuestionData();
  }

  // Khởi tạo dữ liệu câu hỏi
  initQuestionData(): void {
    if (this.editingQuestion) {
      // Đảm bảo Question_Type là số nguyên
      this.editingQuestion.Question_Type = Number(this.editingQuestion.Question_Type);

      // Parse dữ liệu JSON theo loại câu hỏi
      try {
        if (this.editingQuestion.Question_Data_Json) {
          const questionData = JSON.parse(this.editingQuestion.Question_Data_Json);

          switch (Number(this.editingQuestion.Question_Type)) {
            case QuestionType.MULTIPLE_CHOICE:
              this.multipleChoiceData = {
                options: questionData.options || ['', '', '', ''],
                correctOption: questionData.correctOption || 0
              };
              break;
            case QuestionType.TRUE_FALSE:
              this.trueFalseData = {
                correctAnswer: questionData.correctAnswer || true
              };
              break;
            case QuestionType.FILL_IN_THE_BLANK:
              this.fillInTheBlankData = {
                correctAnswers: questionData.correctAnswers || ['']
              };
              break;
          }
        } else {
          // Khởi tạo dữ liệu mặc định nếu không có dữ liệu
          this.resetQuestionData();
        }
      } catch (e) {
        console.error('Lỗi khi parse dữ liệu câu hỏi:', e);
        // Khởi tạo dữ liệu mặc định nếu parse lỗi
        this.resetQuestionData();
      }
    }
  }

  // Reset dữ liệu câu hỏi về mặc định
  resetQuestionData(): void {
    this.multipleChoiceData = { options: ['', '', '', ''], correctOption: 0 };
    this.trueFalseData = { correctAnswer: true };
    this.fillInTheBlankData = { correctAnswers: [''] };
  }

  // Xử lý khi thay đổi loại câu hỏi
  onQuestionTypeChanged(e: any): void {
    // Đảm bảo Question_Type là số nguyên
    this.editingQuestion.Question_Type = Number(this.editingQuestion.Question_Type);

    // Khởi tạo lại dữ liệu mặc định cho loại câu hỏi mới
    this.resetQuestionData();
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
    }
  }

  // Lưu câu hỏi
  saveQuestion(): void {
    // Cập nhật dữ liệu JSON theo loại câu hỏi
    switch (Number(this.editingQuestion.Question_Type)) {
      case QuestionType.MULTIPLE_CHOICE:
        this.editingQuestion.Question_Data_Json = JSON.stringify(this.multipleChoiceData);
        break;
      case QuestionType.TRUE_FALSE:
        this.editingQuestion.Question_Data_Json = JSON.stringify(this.trueFalseData);
        break;
      case QuestionType.FILL_IN_THE_BLANK:
        this.editingQuestion.Question_Data_Json = JSON.stringify(this.fillInTheBlankData);
        break;
    }

    // Kiểm tra xem Question_Data_Json đã được chuyển đổi thành chuỗi chưa
    if (this.editingQuestion.Question_Data_Json && typeof this.editingQuestion.Question_Data_Json !== 'string') {
      this.editingQuestion.Question_Data_Json = JSON.stringify(this.editingQuestion.Question_Data_Json);
    }

    this.save.emit(this.editingQuestion);
  }

  // Hủy
  cancelQuestion(): void {
    this.cancel.emit();
  }
}
