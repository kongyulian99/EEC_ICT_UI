import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { SystemConstants } from '../../constants';

@Component({
  selector: 'app-dropdown-thang',
  templateUrl: './dropdown-thang.component.html',
})
export class DropDownThang implements OnInit, OnChanges {
  @Input() thang = 0;
  @Input() quy = 0;
  @Input() readOnly = false;
  @Input() isValidate = false;
  @Input() stylingMode = 'outlined';
  @Input() label = '';
  @Input() isShowAll = true;

  user: any = {};
  base_items: any = [
    {Id: 0, Ten: 'Tất cả'},
    {Id: 1, Ten: '1'},
    {Id: 2, Ten: '2'},
    {Id: 3, Ten: '3'},
    {Id: 4, Ten: '4'},
    {Id: 5, Ten: '5'},
    {Id: 6, Ten: '6'},
    {Id: 7, Ten: '7'},
    {Id: 8, Ten: '8'},
    {Id: 9, Ten: '9'},
    {Id: 10, Ten: '10'},
    {Id: 11, Ten: '11'},
    {Id: 12, Ten: '12'},
  ];

  items = this.base_items;

  @Output() thangChange = new EventEmitter<any>();
  constructor(
  ) {}

  ngOnInit(): void {
    this.user = JSON.parse(
      localStorage.getItem(SystemConstants.CURRENT_USER) as string
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes['quy']) {
      if(this.quy == 1) {
        this.items = this.base_items.filter(o => o.Id >= 1 && o.Id <= 3 || o.Id == 0);
      } else if(this.quy == 2) {
        this.items = this.base_items.filter(o => o.Id >= 4 && o.Id <= 6 || o.Id == 0);
      } else if(this.quy == 3) {
        this.items = this.base_items.filter(o => o.Id >= 7 && o.Id <= 9 || o.Id == 0);
      } else if(this.quy == 4) {
        this.items = this.base_items.filter(o => o.Id >= 10 && o.Id <= 12 || o.Id == 0);
      } else {
        this.items = this.base_items;
      }
    }
    if(changes['isShowAll']) {
      if(this.isShowAll == false) {
        this.items = this.base_items.filter(o => o.Id > 0);
      } else {
        this.items = this.base_items;
      }
    }
  }

  onValueChanged(event) {
    this.thangChange.emit(event.value);
  }
}
