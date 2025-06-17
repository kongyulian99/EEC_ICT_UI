import { Component, EventEmitter, Input, OnInit, Output, ChangeDetectorRef } from '@angular/core';
import { QuestionInfo } from 'src/app/shared/services/question.service';
import { TopicInfo } from 'src/app/shared/services/topics.service';
import { Enum_DifficutyLevel, QuestionType } from 'src/app/shared/enums/enum';
import { dxButtonConfig } from 'src/app/shared/config';

interface MultipleChoiceData {
  options: string[];
  correctOption: number;
}

interface TrueFalseData {
  correctAnswer: boolean;
}

interface FillInTheBlankData {
  segments: string[];
  answers: string[];
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
  fillInTheBlankData: FillInTheBlankData = { segments: [''], answers: [''] };

  // Enum
  questionTypes = QuestionType;

  // Các mức độ khó
  difficultyLevels = [
    { value: Enum_DifficutyLevel.EASY, text: 'Dễ' },
    { value: Enum_DifficutyLevel.MEDIUM, text: 'Trung bình' },
    { value: Enum_DifficutyLevel.HARD, text: 'Khó' }
  ];

  // Button config
  dxButtonConfig = dxButtonConfig;

  // Hàm Number để sử dụng trong template
  Number = Number;

  constructor(private cdr: ChangeDetectorRef) { }

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
                segments: questionData.segments || [''],
                answers: questionData.answers || ['']
              };
              // Đợi một tick để content được parse
              setTimeout(() => {
                // Kiểm tra và tự động đồng bộ số lượng đáp án với số chỗ trống nếu cần
                const blankCount = this.getBlankCount();
                if (blankCount > 0 && blankCount !== this.fillInTheBlankData.answers.length) {
                  this.syncAnswersWithBlanks();
                }
              }, 0);
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
    this.fillInTheBlankData = { segments: [''], answers: [''] };
  }

  // Xử lý khi thay đổi loại câu hỏi
  onQuestionTypeChanged(e: any): void {
    // Đảm bảo Question_Type là số nguyên
    this.editingQuestion.Question_Type = Number(this.editingQuestion.Question_Type);

    // Khởi tạo lại dữ liệu mặc định cho loại câu hỏi mới
    this.resetQuestionData();

    // Nếu là câu hỏi điền vào chỗ trống, đợi nội dung được load, sau đó kiểm tra
    if (Number(this.editingQuestion.Question_Type) === this.questionTypes.FILL_IN_THE_BLANK) {
      // Đợi nội dung được cập nhật
      setTimeout(() => {
        // Kiểm tra số lượng chỗ trống và đồng bộ đáp án nếu cần
        const blankCount = this.getBlankCount();
        if (blankCount > 0) {
          this.syncAnswersWithBlanks();
        }
      }, 0);
    }
  }

  // Thêm lựa chọn cho câu hỏi trắc nghiệm
  addOption(): void {
    // Tạo bản sao mới của mảng options
    const newOptions = [...this.multipleChoiceData.options, ''];

    // Cập nhật với bản sao mới
    this.multipleChoiceData = {
      ...this.multipleChoiceData,
      options: newOptions
    };
    this.cdr.detectChanges();
  }

  // Xóa lựa chọn cho câu hỏi trắc nghiệm
  removeOption(index: number): void {
    if (this.multipleChoiceData.options.length > 2) {
      // Tạo bản sao mới của mảng options
      const newOptions = [...this.multipleChoiceData.options];
      newOptions.splice(index, 1);

      // Điều chỉnh lại đáp án đúng nếu cần
      let newCorrectOption = this.multipleChoiceData.correctOption;
      if (newCorrectOption >= newOptions.length) {
        newCorrectOption = newOptions.length - 1;
      } else if (index === newCorrectOption) {
        // Nếu xóa đáp án đúng, chọn đáp án đầu tiên làm đáp án đúng
        newCorrectOption = 0;
      }

      // Cập nhật với bản sao mới
      this.multipleChoiceData = {
        options: newOptions,
        correctOption: newCorrectOption
      };
      this.cdr.detectChanges();
    }
  }

  // Thêm đáp án cho câu hỏi điền vào chỗ trống
  addAnswer(): void {
    // Tạo bản sao mới của mảng đáp án
    const newAnswers = [...this.fillInTheBlankData.answers, ''];

    // Cập nhật với bản sao mới
    this.fillInTheBlankData = {
      ...this.fillInTheBlankData,
      answers: newAnswers
    };

    // Thêm một chỗ trống mới vào nội dung nếu cần
    const blankCount = this.getBlankCount();
    const answerCount = newAnswers.length;

    // Nếu số đáp án nhiều hơn số chỗ trống, thêm chỗ trống vào cuối nội dung
    if (answerCount > blankCount) {
      // Đảm bảo content không rỗng
      if (!this.editingQuestion.Content || this.editingQuestion.Content.trim() === '') {
        this.editingQuestion.Content = 'Hãy điền vào chỗ trống: [[...]]';
      } else {
        // Thêm chỗ trống vào cuối nội dung nếu chưa có
        this.editingQuestion.Content += ' [[...]]';
      }
    }

    this.cdr.detectChanges();
  }

  // Xóa đáp án cho câu hỏi điền vào chỗ trống
  removeAnswer(index: number): void {
    if (this.fillInTheBlankData.answers.length > 1) {
      const newAnswers = [...this.fillInTheBlankData.answers];
      newAnswers.splice(index, 1);

      this.fillInTheBlankData = {
        ...this.fillInTheBlankData,
        answers: newAnswers
      };

      this.cdr.detectChanges();
    }
  }

  // Phương thức xử lý khi chọn đáp án đúng cho câu hỏi trắc nghiệm
  setCorrectOption(index: number): void {
    // Tạo bản sao mới để đảm bảo change detection hoạt động
    this.multipleChoiceData = {
      options: [...this.multipleChoiceData.options],
      correctOption: index
    };
    this.cdr.detectChanges();
  }

  // Cập nhật đáp án cho câu hỏi điền vào chỗ trống
  updateAnswer(index: number, value: string): void {
    // Tạo bản sao mới hoàn toàn của mảng đáp án
    const newAnswers = [...this.fillInTheBlankData.answers];
    newAnswers[index] = value;

    // Cập nhật với bản sao mới hoàn toàn
    this.fillInTheBlankData = {
      ...this.fillInTheBlankData,
      answers: newAnswers
    };
    this.cdr.detectChanges();
  }

  // Phương thức xử lý khi chọn đáp án đúng/sai
  setTrueFalseAnswer(event: any): void {
    if (event && event.value !== undefined) {
      this.trueFalseData = {
        correctAnswer: event.value
      };
      this.cdr.detectChanges();
    }
  }

  // Xử lý khi giá trị đáp án trắc nghiệm thay đổi
  onMultipleChoiceAnswerChanged(index: number, event: any): void {
    // Tạo mảng mới để tránh tham chiếu đến mảng cũ
    const newOptions = [...this.multipleChoiceData.options];
    newOptions[index] = event.value;

    this.multipleChoiceData = {
      ...this.multipleChoiceData,
      options: newOptions
    };
    this.cdr.detectChanges();
  }

  // Xử lý khi giá trị đáp án điền vào chỗ trống thay đổi
  onFillBlankAnswerChanged(index: number, event: any): void {
    // Tạo mảng mới để tránh tham chiếu đến mảng cũ
    const newAnswers = [...this.fillInTheBlankData.answers];
    newAnswers[index] = event.value;

    this.fillInTheBlankData = {
      ...this.fillInTheBlankData,
      answers: newAnswers
    };
    this.cdr.detectChanges();
  }

  // Tạo xem trước câu hỏi điền vào chỗ trống với các chỗ trống inline
  previewFillInBlankQuestion(): string {
    if (!this.editingQuestion.Content) {
      return 'Vui lòng nhập nội dung câu hỏi với cú pháp [[đáp án]] để đánh dấu chỗ trống và đáp án.';
    }

    // Thay thế các placeholder [[đáp án]] bằng input field
    let previewContent = this.editingQuestion.Content;
    const blankInputStyle = 'style="display: inline-block; min-width: 100px; border: 1px solid #007bff; border-radius: 4px; padding: 5px 10px; margin: 0 5px; background-color: #f0f8ff; text-align: center; box-shadow: 0 0 4px rgba(0,123,255,0.3);"';

    // Đếm số lượng chỗ trống và thay thế từng chỗ trống bằng ô input có đánh số
    let blankIndex = 0;
    previewContent = previewContent.replace(/\[\[([^\]]+)\]\]/g, function(match, answer) {
      const label = String.fromCharCode(65 + blankIndex); // Chuyển thành A, B, C, D...
      blankIndex++;
      return `<span class="blank-placeholder" ${blankInputStyle} title="Đáp án: ${answer}">[Chỗ trống ${label}]</span>`;
    });

    return previewContent;
  }

  // Đếm số lượng chỗ trống trong nội dung câu hỏi
  getBlankCount(): number {
    if (!this.editingQuestion.Content) {
      return 0;
    }

    // Đếm số lượng chỗ trống bằng cách đếm số lần xuất hiện của mẫu [[đáp án]]
    const matches = this.editingQuestion.Content.match(/\[\[([^\]]+)\]\]/g);
    return matches ? matches.length : 0;
  }

  // Lấy danh sách các đáp án từ nội dung câu hỏi
  getAnswers(): string[] {
    // Sử dụng cấu trúc dữ liệu mới từ getPreviewJsonData
    const jsonData = this.getPreviewJsonData();
    return jsonData.answers;
  }

  // Lấy dữ liệu JSON cho xem trước
  getPreviewJsonData(): any {
    // Xử lý nội dung để tạo cấu trúc dữ liệu JSON mới
    const content = this.editingQuestion.Content || '';

    // Sử dụng DOMParser để phân tích cú pháp HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(`<div id="content-container">${content}</div>`, 'text/html');
    const contentContainer = doc.getElementById('content-container');

    // Tìm tất cả các vị trí của [[đáp án]] trong nội dung
    const placeholders: { start: number, end: number, answer: string }[] = [];
    const regex = /\[\[([^\]]+)\]\]/g;
    let match;
    const tempContent = content;

    while ((match = regex.exec(tempContent)) !== null) {
      placeholders.push({
        start: match.index,
        end: match.index + match[0].length,
        answer: match[1]
      });
    }

    if (placeholders.length === 0) {
      // Không có chỗ trống, trả về toàn bộ nội dung
      return {
        segments: [content],
        answers: []
      };
    }

    // Tạo các đoạn văn bản và danh sách đáp án
    const segments: string[] = [];
    const answers: string[] = [];

    // Tạo một bản sao của nội dung để xử lý
    let processedContent = content;
    let lastEnd = 0;

    // Xử lý từng placeholder
    for (let i = 0; i < placeholders.length; i++) {
      const placeholder = placeholders[i];

      // Lấy đoạn văn bản trước placeholder
      if (placeholder.start > lastEnd) {
        const segment = processedContent.substring(lastEnd, placeholder.start);
        segments.push(this.ensureValidHtml(segment));
      } else if (i === 0) {
        // Đoạn đầu tiên rỗng nếu placeholder ở đầu
        segments.push('');
      }

      // Thêm đáp án
      answers.push(placeholder.answer);

      // Cập nhật vị trí cuối cùng
      lastEnd = placeholder.end;

      // Nếu là placeholder cuối cùng, thêm đoạn văn bản còn lại
      if (i === placeholders.length - 1 && lastEnd < processedContent.length) {
        const segment = processedContent.substring(lastEnd);
        segments.push(this.ensureValidHtml(segment));
      } else if (i === placeholders.length - 1 && lastEnd >= processedContent.length) {
        // Thêm đoạn rỗng nếu placeholder ở cuối
        segments.push('');
      }
    }

    return {
      segments: segments,
      answers: answers
    };
  }

  // Đảm bảo HTML hợp lệ bằng cách sửa các thẻ bị cắt giữa chừng
  private ensureValidHtml(html: string): string {
    if (!html) return '';

    // Sử dụng DOMParser để kiểm tra và sửa HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(`<div id="wrapper">${html}</div>`, 'text/html');
    const wrapper = doc.getElementById('wrapper');

    if (wrapper) {
      return wrapper.innerHTML;
    }

    return html;
  }

  // Xử lý khi nội dung câu hỏi thay đổi
  onQuestionContentChanged(content: string): void {
    // Chỉ xử lý cho câu hỏi điền vào chỗ trống
    if (Number(this.editingQuestion.Question_Type) === this.questionTypes.FILL_IN_THE_BLANK) {
      this.editingQuestion.Content = content;

      // Cập nhật cấu trúc dữ liệu JSON mới
      const jsonData = this.getPreviewJsonData();
      this.fillInTheBlankData = {
        segments: jsonData.segments,
        answers: jsonData.answers.length > 0 ? jsonData.answers : ['']
      };

      this.cdr.detectChanges();
    }
  }

  // Đồng bộ số lượng đáp án với số lượng chỗ trống
  syncAnswersWithBlanks(): void {
    // Lấy dữ liệu JSON mới để có danh sách đáp án
    const jsonData = this.getPreviewJsonData();
    const blankCount = jsonData.answers.length;
    const currentAnswerCount = this.fillInTheBlankData.answers.length;

    // Không cần đồng bộ nếu số lượng đã khớp
    if (blankCount === currentAnswerCount && blankCount > 0) {
      return;
    }

    if (blankCount === 0) {
      // Nếu không có chỗ trống, giữ ít nhất một đáp án
      this.fillInTheBlankData = {
        segments: jsonData.segments,
        answers: ['']
      };
    } else {
      // Điều chỉnh số lượng đáp án để khớp với số lượng chỗ trống
      const currentAnswers = [...this.fillInTheBlankData.answers];
      const newAnswers: string[] = [];

      // Giữ lại các đáp án hiện có
      for (let i = 0; i < blankCount; i++) {
        newAnswers.push(i < currentAnswers.length ? currentAnswers[i] : jsonData.answers[i] || '');
      }

      this.fillInTheBlankData = {
        segments: jsonData.segments,
        answers: newAnswers
      };
    }

    this.cdr.detectChanges();
  }

  // Lưu câu hỏi
  saveQuestion(): void {
    // Nếu là câu hỏi điền vào chỗ trống, cập nhật cấu trúc dữ liệu mới
    if (Number(this.editingQuestion.Question_Type) === this.questionTypes.FILL_IN_THE_BLANK) {
      const jsonData = this.getPreviewJsonData();
      this.fillInTheBlankData = {
        segments: jsonData.segments,
        answers: jsonData.answers.length > 0 ? jsonData.answers : ['']
      };
    }

    // Tạo bản sao mới của dữ liệu để tránh tham chiếu
    let questionDataJson: any;

    switch (Number(this.editingQuestion.Question_Type)) {
      case QuestionType.MULTIPLE_CHOICE:
        questionDataJson = JSON.stringify({
          options: [...this.multipleChoiceData.options],
          correctOption: this.multipleChoiceData.correctOption
        });
        break;
      case QuestionType.TRUE_FALSE:
        questionDataJson = JSON.stringify({
          correctAnswer: this.trueFalseData.correctAnswer
        });
        break;
      case QuestionType.FILL_IN_THE_BLANK:
        questionDataJson = JSON.stringify({
          segments: [...this.fillInTheBlankData.segments],
          answers: [...this.fillInTheBlankData.answers]
        });
        break;
    }

    this.editingQuestion.Question_Data_Json = questionDataJson;
    this.save.emit({...this.editingQuestion});
  }

  // Hủy
  cancelQuestion(): void {
    this.cancel.emit();
  }

  // Hàm trackBy cho câu hỏi trắc nghiệm
  trackByOption(index: number): number {
    return index;
  }

  // Hàm trackBy cho câu hỏi điền vào chỗ trống
  trackByAnswer(index: number): number {
    return index;
  }

  // Chuyển đổi số thành chữ cái A, B, C, D...
  getOptionLabel(index: number): string {
    return String.fromCharCode(65 + index); // 65 là mã ASCII của 'A'
  }

  // Hiển thị xem trước các đoạn văn bản và chỗ trống theo cấu trúc mới
  previewSegments(): string {
    const jsonData = this.getPreviewJsonData();
    const segments = jsonData.segments;
    const answers = jsonData.answers;

    if (segments.length === 0) {
      return 'Chưa có nội dung câu hỏi.';
    }

    let previewHtml = '';

    for (let i = 0; i < segments.length; i++) {
      // Thêm đoạn văn bản
      previewHtml += `<span class="segment">${segments[i]}</span>`;

      // Thêm chỗ trống (nếu có)
      if (i < answers.length) {
        const label = String.fromCharCode(65 + i); // Chuyển thành A, B, C, D...
        const blankInputStyle = 'display: inline-block; min-width: 100px; border: 1px solid #007bff; border-radius: 4px; padding: 5px 10px; margin: 0 5px; background-color: #f0f8ff; text-align: center; box-shadow: 0 0 4px rgba(0,123,255,0.3);';
        previewHtml += `<span class="blank-placeholder" style="${blankInputStyle}" title="Đáp án: ${answers[i]}">[Chỗ trống ${label}]</span>`;
      }
    }

    return previewHtml;
  }
}
