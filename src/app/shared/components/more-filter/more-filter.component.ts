import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-more-filter',
  templateUrl: './more-filter.component.html',
  styleUrls: ['./more-filter.component.scss']
})
export class MoreFilterComponent implements OnInit {
  @Output() onOptionChanged = new EventEmitter();
  isMoreFilterOption: any = false;

  constructor(
  ) { }

  ngOnInit(): void {
  }

  toggleShowMoreFilter() {
    this.isMoreFilterOption = !this.isMoreFilterOption;
    this.onOptionChanged.emit(this.isMoreFilterOption);
  }
}
