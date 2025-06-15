import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output,
  ViewEncapsulation,
} from '@angular/core';

import {
  ClassicEditor,
  AccessibilityHelp,
  AutoImage,
  Autosave,
  Base64UploadAdapter,
  Bold,
  Code,
  Essentials,
  FontBackgroundColor,
  FontColor,
  FontFamily,
  FontSize,
  Highlight,
  ImageBlock,
  ImageCaption,
  ImageInsert,
  ImageInsertViaUrl,
  ImageResize,
  ImageStyle,
  ImageTextAlternative,
  ImageToolbar,
  ImageUpload,
  Italic,
  Link,
  List,
  Paragraph,
  RemoveFormat,
  SelectAll,
  SpecialCharacters,
  SpecialCharactersArrows,
  SpecialCharactersCurrency,
  SpecialCharactersEssentials,
  SpecialCharactersLatin,
  SpecialCharactersMathematical,
  SpecialCharactersText,
  SimpleUploadAdapter,
  Strikethrough,
  Subscript,
  Superscript,
  Table,
  TableCaption,
  TableCellProperties,
  TableColumnResize,
  TableProperties,
  TableToolbar,
  TodoList,
  Underline,
  Undo,
  type EditorConfig,
  Alignment,
  InlineEditor,
} from 'ckeditor5';

import translations from './vi.js';

@Component({
  selector: 'app-custom-ckeditor',
  templateUrl: './custom-ckeditor.component.html',
  styleUrls: ['./custom-ckeditor.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class CustomCkEditorComponent {
  @Input() placeholder = 'Nhập thông tin tại đây';
  @Input() isValidate = false;
  @Input() message = '';
  constructor(private changeDetector: ChangeDetectorRef) {}

  public isLayoutReady = false;
  public Editor = ClassicEditor;
  public config: EditorConfig = {}; // CKEditor needs the DOM tree before calculating the configuration.
  public ngAfterViewInit(): void {
    this.config = {
      toolbar: {
        items: [
          'undo',
          'redo',
          '|',
          'alignment',
          'fontSize',
          'fontFamily',
          'fontColor',
          'fontBackgroundColor',
          '|',
          'bold',
          'italic',
          'underline',
          'strikethrough',
          'subscript',
          'superscript',
          'removeFormat',
          '|',
          'specialCharacters',
          'link',
          'insertImage',
          'insertTable',
          'highlight',
          '|',
          'bulletedList',
          'numberedList',
          'todoList',
          '|',
          'accessibilityHelp',
        ],
        shouldNotGroupWhenFull: true,
      },
      plugins: [
        AccessibilityHelp,
        AutoImage,
        Autosave,
        SimpleUploadAdapter,
        Bold,
        Code,
        Essentials,
        FontBackgroundColor,
        FontColor,
        FontFamily,
        FontSize,
        Highlight,
        ImageBlock,
        ImageCaption,
        ImageInsert,
        ImageInsertViaUrl,
        ImageResize,
        ImageStyle,
        ImageTextAlternative,
        ImageToolbar,
        ImageUpload,
        Italic,
        Link,
        List,
        Paragraph,
        RemoveFormat,
        SelectAll,
        SpecialCharacters,
        SpecialCharactersArrows,
        SpecialCharactersCurrency,
        SpecialCharactersEssentials,
        SpecialCharactersLatin,
        SpecialCharactersMathematical,
        SpecialCharactersText,
        Strikethrough,
        Subscript,
        Superscript,
        Table,
        TableCaption,
        TableCellProperties,
        TableColumnResize,
        TableProperties,
        TableToolbar,
        TodoList,
        Underline,
        Undo,
        Alignment
      ],
      fontFamily: {
        supportAllValues: true,
      },
      fontSize: {
        options: [10, 12, 14, 'default', 18, 20, 22],
        supportAllValues: true,
      },
      simpleUpload: {
        // The URL that the images are uploaded to.
        uploadUrl: `/api/File/ckeditor-images`,
      },
      image: {
        toolbar: [
          'toggleImageCaption',
          'imageTextAlternative',
          '|',
          'imageStyle:alignBlockLeft',
          'imageStyle:block',
          'imageStyle:alignBlockRight',
          '|',
          'resizeImage',
        ],
        styles: {
          options: ['alignBlockLeft', 'block', 'alignBlockRight'],
        },
      },
      initialData: '',
      language: 'vi',
      link: {
        addTargetToExternalLinks: true,
        defaultProtocol: 'https://',
        decorators: {
          toggleDownloadable: {
            mode: 'manual',
            label: 'Downloadable',
            attributes: {
              download: 'file',
            },
          },
        },
      },
      placeholder: this.placeholder,
      table: {
        contentToolbar: [
          'tableColumn',
          'tableRow',
          'mergeTableCells',
          'tableProperties',
          'tableCellProperties',
        ],
      },
      translations: [translations],
    };

    this.isLayoutReady = true;
    this.changeDetector.detectChanges();
  }

  // private _Content: string = '';
  // @Input() set Content(value: string) {
  //   this._Content = value;
  //   this.change.emit(value);
  // }
  // get Content() {
  //   return this._Content;
  // }

  @Input() Content: string = '';

  @Output() ContentChange = new EventEmitter<string>();

  onBlur() {
    this.ContentChange.emit(this.Content);
  }
}
