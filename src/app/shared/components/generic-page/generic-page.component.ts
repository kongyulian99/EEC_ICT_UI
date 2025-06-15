import { AfterViewInit, Component, ElementRef, EventEmitter, HostListener, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { dxButtonConfig } from '../../config';
import { Location } from '@angular/common';

@Component({
  selector: 'app-generic-page',
  templateUrl: './generic-page.component.html',
  styleUrls: ['./generic-page.component.scss']
})
export class GenericPageComponent implements OnInit, AfterViewInit {
  @ViewChild('extraFilters', { static: false }) extraFilters: ElementRef;
  @ViewChild('buttons', { static: false }) buttons: ElementRef;
  @ViewChild('moreFilterButton', { static: false }) moreFilterButton: ElementRef;
  @Input() pageTitle;
  @Input() titleInfo;
  @Input() loading = false;
  @Input() haveBackButton = false;
  @Input() formOpen = false;
  @Input() haveForm = false;
  @Output() formOpenChange = new EventEmitter<boolean>();
  dxButtonConfig = dxButtonConfig;

  isShowExtraFilter: boolean = false;

  constructor(
    private location: Location
  ) { }

  ngOnInit(): void {
    this.isShowExtraFilter = false;
    // this.viewExtraFilterButton = false;
    // if(this.navbar?.nativeElement.children.length > 0) {
    //   this.navbar.nativeElement.setAttribute('style', 'width: 100px;');
    // } else {
    //   this.navbar.nativeElement.setAttribute('style', 'width: 0px;');
    // }
  }

  // viewExtraFilterButton: boolean;
  ngAfterViewInit(): void {
    if(this.extraFilters.nativeElement.children.length) {
      this.moreFilterButton.nativeElement.style.display = 'block';
    } else {
      this.moreFilterButton.nativeElement.style.display = 'none';
    }

    if(this.buttons.nativeElement.children.length) {
      this.buttons.nativeElement.style.display = 'block';
    } else {
      this.buttons.nativeElement.style.display = 'none';
    }
  }

  showExtraFilters() {
    this.isShowExtraFilter = !this.isShowExtraFilter;
  }

  handleBack() {
    this.location.back();
  }

  // outside click to close
  // @HostListener('document:click', ['$event'])
  // clickout(event) {
  //   if(!this.extraFilters.nativeElement.contains(event.target) && !this.moreFilterButton.nativeElement.contains(event.target)) {
  //     this.isShowExtraFilter = false;
  //   }
  // }

  changeOpenStatus() {
    this.formOpen = !this.formOpen;
    this.formOpenChange.emit(this.formOpen);
  }

  // virtual scroll
  // @Output() onScrollToBottom = new EventEmitter();
  // handleScroll(event: any): void {
  //   const { scrollOffset, component } = event;
  //   const scrollTop = scrollOffset.top;
  //   const scrollHeight = component.scrollHeight();
  //   const clientHeight = component.clientHeight();

  //   // Kiểm tra nếu đã cuộn gần đến cuối để tải thêm dữ liệu
  //   if (scrollTop + clientHeight >= scrollHeight - 100) {
  //     // this.loadMoreItems();
  //     this.onScrollToBottom.emit();
  //   }
  // }

  // loadMoreItems(): void {
  //   if (this.isLoading || this.currentItemIndex >= this.totalItems) return;
  //   this.isLoading = true;

  //   // Giả lập tải dữ liệu với độ trễ
  //   setTimeout(() => {
  //     for (let i = this.currentItemIndex; i < this.currentItemIndex + this.itemsPerLoad && i < this.totalItems; i++) {
  //       this.items.push(`Item ${i + 1}`);
  //     }
  //     this.currentItemIndex += this.itemsPerLoad;
  //     this.isLoading = false;
  //   }, 300); // Giả lập độ trễ 300ms
  // }

  @Output() onScrollToBottom = new EventEmitter();
  handleReachBottom() {

  }
}
