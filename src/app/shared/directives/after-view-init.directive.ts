import { Directive, ElementRef, EventEmitter, OnInit, Output } from '@angular/core';

@Directive({
  selector: '[afterViewInit]'
})
export class AfterViewInitDirective implements OnInit {
  @Output() afterViewInit = new EventEmitter<void>();

  constructor(private el: ElementRef) {}

  ngOnInit() {
    // Sử dụng setTimeout để đảm bảo DOM đã được render
    setTimeout(() => {
      this.afterViewInit.emit();
    });
  }
}
