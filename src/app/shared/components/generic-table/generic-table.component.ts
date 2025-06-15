import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-generic-table',
  templateUrl: './generic-table.component.html',
  styleUrls: ['./generic-table.component.scss']
})
export class GenericTableComponent implements OnInit {
  @Input() items;
  @Input() listAttribute;
  @Input() listNhomNhiemVu;
  @Input() minusHeight = 0;
  constructor() { }

  ngOnInit(): void {
  }

}
