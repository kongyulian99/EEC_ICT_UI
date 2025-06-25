import { Component, EventEmitter, Input, OnInit, Output, ChangeDetectorRef } from '@angular/core';
import { QuestionInfo } from 'src/app/shared/interfaces/question.interface';
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

  // Question data by type
  multipleChoiceData: MultipleChoiceData = { options: ['', '', '', ''], correctOption: 0 };
  trueFalseData: TrueFalseData = { correctAnswer: true };
  fillInTheBlankData: FillInTheBlankData = { segments: [''], answers: [''] };

  // Enum
  questionTypes = QuestionType;

  // Difficulty levels
  difficultyLevels = [
    { value: Enum_DifficutyLevel.EASY, text: 'Easy' },
    { value: Enum_DifficutyLevel.MEDIUM, text: 'Medium' },
    { value: Enum_DifficutyLevel.HARD, text: 'Hard' }
  ];

  // Button config
  dxButtonConfig = dxButtonConfig;

  // Number function to use in template
  Number = Number;

  constructor(private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    // Initialize default score value if not set
    if (!this.editingQuestion.Score) {
      this.editingQuestion.Score = 1.0; // Default value is 1 point
    }
    this.initQuestionData();
  }

  ngOnChanges(): void {
    this.initQuestionData();
  }

  // Initialize question data
  initQuestionData(): void {
    if (this.editingQuestion) {
      // Ensure Question_Type is integer
      this.editingQuestion.Question_Type = Number(this.editingQuestion.Question_Type);

      // Parse JSON data by question type
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
              // Wait one tick for content to be parsed
              setTimeout(() => {
                // Check and automatically sync answer count with blank count if needed
                const blankCount = this.getBlankCount();
                if (blankCount > 0 && blankCount !== this.fillInTheBlankData.answers.length) {
                  this.syncAnswersWithBlanks();
                }
              }, 0);
              break;
          }
        } else {
          // Initialize default data if no data exists
          this.resetQuestionData();
        }
      } catch (e) {
        console.error('Error parsing question data:', e);
        // Initialize default data if parse error
        this.resetQuestionData();
      }
    }
  }

  // Reset question data to default
  resetQuestionData(): void {
    this.multipleChoiceData = { options: ['', '', '', ''], correctOption: 0 };
    this.trueFalseData = { correctAnswer: true };
    this.fillInTheBlankData = { segments: [''], answers: [''] };
  }

  // Handle when question type changes
  onQuestionTypeChanged(e: any): void {
    // Ensure Question_Type is integer
    this.editingQuestion.Question_Type = Number(this.editingQuestion.Question_Type);

    // Re-initialize default data for new question type
    this.resetQuestionData();

    // If it's a fill-in-the-blank question, wait for content to load, then check
    if (Number(this.editingQuestion.Question_Type) === this.questionTypes.FILL_IN_THE_BLANK) {
      // Wait for content to be updated
      setTimeout(() => {
        // Check blank count and sync answers if needed
        const blankCount = this.getBlankCount();
        if (blankCount > 0) {
          this.syncAnswersWithBlanks();
        }
      }, 0);
    }
  }

  // Add option for multiple choice question
  addOption(): void {
    // Create new copy of options array
    const newOptions = [...this.multipleChoiceData.options, ''];

    // Update with new copy
    this.multipleChoiceData = {
      ...this.multipleChoiceData,
      options: newOptions
    };
    this.cdr.detectChanges();
  }

  // Remove option for multiple choice question
  removeOption(index: number): void {
    if (this.multipleChoiceData.options.length > 2) {
      // Create new copy of options array
      const newOptions = [...this.multipleChoiceData.options];
      newOptions.splice(index, 1);

      // Adjust correct answer if needed
      let newCorrectOption = this.multipleChoiceData.correctOption;
      if (newCorrectOption >= newOptions.length) {
        newCorrectOption = newOptions.length - 1;
      } else if (index === newCorrectOption) {
        // If deleting correct answer, select first answer as correct
        newCorrectOption = 0;
      }

      // Update with new copy
      this.multipleChoiceData = {
        options: newOptions,
        correctOption: newCorrectOption
      };
      this.cdr.detectChanges();
    }
  }

  // Add answer for fill-in-the-blank question
  addAnswer(): void {
    // Create new copy of answers array
    const newAnswers = [...this.fillInTheBlankData.answers, ''];

    // Update with new copy
    this.fillInTheBlankData = {
      ...this.fillInTheBlankData,
      answers: newAnswers
    };

    // Add a new blank to content if needed
    const blankCount = this.getBlankCount();
    const answerCount = newAnswers.length;

    // If answer count is more than blank count, add blank to end of content
    if (answerCount > blankCount) {
      // Ensure content is not empty
      if (!this.editingQuestion.Content || this.editingQuestion.Content.trim() === '') {
        this.editingQuestion.Content = 'Please fill in the blank: [[...]]';
      } else {
        // Add blank to end of content if not already there
        this.editingQuestion.Content += ' [[...]]';
      }
    }

    this.cdr.detectChanges();
  }

  // Remove answer for fill-in-the-blank question
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

  // Method to handle when selecting correct answer for multiple choice question
  setCorrectOption(index: number): void {
    // Create new copy to ensure change detection works
    this.multipleChoiceData = {
      options: [...this.multipleChoiceData.options],
      correctOption: index
    };
    this.cdr.detectChanges();
  }

  // Update answer for fill-in-the-blank question
  updateAnswer(index: number, value: string): void {
    // Create new copy of answers array
    const newAnswers = [...this.fillInTheBlankData.answers];
    newAnswers[index] = value;

    // Update with new copy of answers
    this.fillInTheBlankData = {
      ...this.fillInTheBlankData,
      answers: newAnswers
    };
    this.cdr.detectChanges();
  }

  // Method to handle when selecting correct/incorrect answer
  setTrueFalseAnswer(event: any): void {
    if (event && event.value !== undefined) {
      this.trueFalseData = {
        correctAnswer: event.value
      };
      this.cdr.detectChanges();
    }
  }

  // Handle when multiple choice answer changes
  onMultipleChoiceAnswerChanged(index: number, event: any): void {
    // Create new copy to avoid reference issues
    const newOptions = [...this.multipleChoiceData.options];
    newOptions[index] = event.value;

    this.multipleChoiceData = {
      ...this.multipleChoiceData,
      options: newOptions
    };
    this.cdr.detectChanges();
  }

  // Handle when fill-in-the-blank answer changes
  onFillBlankAnswerChanged(index: number, event: any): void {
    // Create new copy to avoid reference issues
    const newAnswers = [...this.fillInTheBlankData.answers];
    newAnswers[index] = event.value;

    this.fillInTheBlankData = {
      ...this.fillInTheBlankData,
      answers: newAnswers
    };
    this.cdr.detectChanges();
  }

  // Create preview for fill-in-the-blank question with inline blanks
  previewFillInBlankQuestion(): string {
    if (!this.editingQuestion.Content) {
      return 'Please enter question content with syntax [[answer]] to mark the blank and answer.';
    }

    // Replace [[answer]] placeholders with input field
    let previewContent = this.editingQuestion.Content;
    const blankInputStyle = 'style="display: inline-block; min-width: 100px; border: 1px solid #007bff; border-radius: 4px; padding: 5px 10px; margin: 0 5px; background-color: #f0f8ff; text-align: center; box-shadow: 0 0 4px rgba(0,123,255,0.3);"';

    // Count blank count and replace each blank with numbered input
    let blankIndex = 0;
    previewContent = previewContent.replace(/\[\[([^\]]+)\]\]/g, function(match, answer) {
      const label = String.fromCharCode(65 + blankIndex); // Convert to A, B, C, D...
      blankIndex++;
      return `<span class="blank-placeholder" ${blankInputStyle} title="Answer: ${answer}">[Blank ${label}]</span>`;
    });

    return previewContent;
  }

  // Count blank count in question content
  getBlankCount(): number {
    if (!this.editingQuestion.Content) {
      return 0;
    }

    // Count blank count by counting occurrences of [[answer]]
    const matches = this.editingQuestion.Content.match(/\[\[([^\]]+)\]\]/g);
    return matches ? matches.length : 0;
  }

  // Get answers list from question content
  getAnswers(): string[] {
    // Use new data structure from getPreviewJsonData
    const jsonData = this.getPreviewJsonData();
    return jsonData.answers;
  }

  // Get JSON data for preview
  getPreviewJsonData(): any {
    // Process content to create new JSON data structure
    const content = this.editingQuestion.Content || '';

    // Use DOMParser to parse HTML syntax
    const parser = new DOMParser();
    const doc = parser.parseFromString(`<div id="content-container">${content}</div>`, 'text/html');
    const contentContainer = doc.getElementById('content-container');

    // Find all [[answer]] placeholders in content
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
      // No blanks, return full content
      return {
        segments: [content],
        answers: []
      };
    }

    // Create text segments and answers list
    const segments: string[] = [];
    const answers: string[] = [];

    // Create a copy of content to process
    let processedContent = content;
    let lastEnd = 0;

    // Process each placeholder
    for (let i = 0; i < placeholders.length; i++) {
      const placeholder = placeholders[i];

      // Get text before placeholder
      if (placeholder.start > lastEnd) {
        const segment = processedContent.substring(lastEnd, placeholder.start);
        segments.push(this.ensureValidHtml(segment));
      } else if (i === 0) {
        // First segment is empty if placeholder is at start
        segments.push('');
      }

      // Add answer
      answers.push(placeholder.answer);

      // Update last end position
      lastEnd = placeholder.end;

      // If last placeholder, add remaining content
      if (i === placeholders.length - 1 && lastEnd < processedContent.length) {
        const segment = processedContent.substring(lastEnd);
        segments.push(this.ensureValidHtml(segment));
      } else if (i === placeholders.length - 1 && lastEnd >= processedContent.length) {
        // Add empty segment if placeholder is at end
        segments.push('');
      }
    }

    return {
      segments: segments,
      answers: answers
    };
  }

  // Ensure HTML is valid by fixing broken tags
  private ensureValidHtml(html: string): string {
    if (!html) return '';

    // Use DOMParser to check and fix HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(`<div id="wrapper">${html}</div>`, 'text/html');
    const wrapper = doc.getElementById('wrapper');

    if (wrapper) {
      return wrapper.innerHTML;
    }

    return html;
  }

  // Handle when question content changes
  onQuestionContentChanged(content: string): void {
    // Only process for fill-in-the-blank question
    if (Number(this.editingQuestion.Question_Type) === this.questionTypes.FILL_IN_THE_BLANK) {
      this.editingQuestion.Content = content;

      // Update new JSON data structure
      const jsonData = this.getPreviewJsonData();
      this.fillInTheBlankData = {
        segments: jsonData.segments,
        answers: jsonData.answers.length > 0 ? jsonData.answers : ['']
      };

      this.cdr.detectChanges();
    }
  }

  // Sync answer count with blank count
  syncAnswersWithBlanks(): void {
    // Get new JSON data for answers
    const jsonData = this.getPreviewJsonData();
    const blankCount = jsonData.answers.length;
    const currentAnswerCount = this.fillInTheBlankData.answers.length;

    // No need to sync if counts already match
    if (blankCount === currentAnswerCount && blankCount > 0) {
      return;
    }

    if (blankCount === 0) {
      // If no blanks, keep at least one answer
      this.fillInTheBlankData = {
        segments: jsonData.segments,
        answers: ['']
      };
    } else {
      // Adjust answer count to match blank count
      const currentAnswers = [...this.fillInTheBlankData.answers];
      const newAnswers: string[] = [];

      // Keep existing answers
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

  // Save question
  saveQuestion(): void {
    // If it's a fill-in-the-blank question, update new JSON data structure
    if (Number(this.editingQuestion.Question_Type) === this.questionTypes.FILL_IN_THE_BLANK) {
      const jsonData = this.getPreviewJsonData();
      this.fillInTheBlankData = {
        segments: jsonData.segments,
        answers: jsonData.answers.length > 0 ? jsonData.answers : ['']
      };
    }

    // Create new copy of data to avoid reference issues
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

  // Cancel
  cancelQuestion(): void {
    this.cancel.emit();
  }

  // TrackBy function for multiple choice question
  trackByOption(index: number): number {
    return index;
  }

  // TrackBy function for fill-in-the-blank question
  trackByAnswer(index: number): number {
    return index;
  }

  // Convert number to letter A, B, C, D...
  getOptionLabel(index: number): string {
    return String.fromCharCode(65 + index); // 65 is ASCII code for 'A'
  }

  // Preview segments and blanks in new structure
  previewSegments(): string {
    const jsonData = this.getPreviewJsonData();
    const segments = jsonData.segments;
    const answers = jsonData.answers;

    if (segments.length === 0) {
      return 'No question content.';
    }

    let previewHtml = '';

    for (let i = 0; i < segments.length; i++) {
      // Add segment
      previewHtml += `<span class="segment">${segments[i]}</span>`;

      // Add blank (if any)
      if (i < answers.length) {
        const label = String.fromCharCode(65 + i); // Convert to A, B, C, D...
        const blankInputStyle = 'display: inline-block; min-width: 100px; border: 1px solid #007bff; border-radius: 4px; padding: 5px 10px; margin: 0 5px; background-color: #f0f8ff; text-align: center; box-shadow: 0 0 4px rgba(0,123,255,0.3);';
        previewHtml += `<span class="blank-placeholder" style="${blankInputStyle}" title="Answer: ${answers[i]}">[Blank ${label}]</span>`;
      }
    }

    return previewHtml;
  }
}
