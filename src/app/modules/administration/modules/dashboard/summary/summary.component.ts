import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-summary',
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.scss']
})
export class SummaryComponent implements OnInit {
  @Input() title = '';
  @Input() value = 0;
  @Input() content = '';
  @Input() currency = '';
  constructor() { }

  ngOnInit(): void {
  }

}
