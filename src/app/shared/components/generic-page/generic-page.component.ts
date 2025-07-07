import { AfterViewInit, Component, ElementRef, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { dxButtonConfig } from '../../config';
import { Location } from '@angular/common';

@Component({
  selector: 'app-generic-page',
  templateUrl: './generic-page.component.html',
  styleUrls: ['./generic-page.component.scss']
})
export class GenericPageComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('extraFilters', { static: false }) extraFilters: ElementRef;
  @ViewChild('buttons', { static: false }) buttons: ElementRef;
  @ViewChild('moreFilterButton', { static: false }) moreFilterButton: ElementRef;
  @Input() pageTitle: string;
  @Input() titleInfo: string;
  @Input() loading = false;
  @Input() haveBackButton = false;
  @Input() formOpen = false;
  @Input() haveForm = false;
  @Output() formOpenChange = new EventEmitter<boolean>();
  @Output() onScrollToBottom = new EventEmitter();
  dxButtonConfig = dxButtonConfig;
  isShowExtraFilter: boolean = false;

  constructor(private location: Location) { }

  ngOnInit(): void {
    this.isShowExtraFilter = false;
    document.addEventListener('click', this.handleDocumentClick.bind(this));
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.updateFilterButtonVisibility();
      this.updateButtonsVisibility();
    }, 0);
  }

  ngOnDestroy(): void {
    document.removeEventListener('click', this.handleDocumentClick.bind(this));
  }

  private updateFilterButtonVisibility(): void {
    if (this.extraFilters && this.moreFilterButton) {
      const hasChildren = this.extraFilters.nativeElement.children.length > 0;
      this.moreFilterButton.nativeElement.style.display = hasChildren ? 'flex' : 'none';
    }
  }

  private updateButtonsVisibility(): void {
    if (this.buttons) {
      const hasChildren = this.buttons.nativeElement.children.length > 0;
      this.buttons.nativeElement.style.display = hasChildren ? 'flex' : 'none';
    }
  }

  private handleDocumentClick(event: MouseEvent): void {
    if (this.isShowExtraFilter && this.extraFilters && this.moreFilterButton) {
      const filterElement = this.extraFilters.nativeElement;
      const buttonElement = this.moreFilterButton.nativeElement;

      if (!filterElement.contains(event.target) && !buttonElement.contains(event.target)) {
        this.isShowExtraFilter = false;
      }
    }
  }

  showExtraFilters(): void {
    this.isShowExtraFilter = !this.isShowExtraFilter;
  }

  handleBack(): void {
    this.location.back();
  }

  changeOpenStatus(): void {
    this.formOpen = !this.formOpen;
    this.formOpenChange.emit(this.formOpen);
  }

  handleReachBottom(): void {
    this.onScrollToBottom.emit();
  }
}
