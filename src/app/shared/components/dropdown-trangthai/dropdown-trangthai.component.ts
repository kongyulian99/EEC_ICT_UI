import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { SystemConstants } from '../../constants';

@Component({
  selector: 'app-dropdown-trangthai',
  templateUrl: './dropdown-trangthai.component.html',
})
export class DropDownTrangthai implements OnInit {
  @Input() trangthai;
  @Input() readOnly = false;
  @Input() isValidate = false;
  @Input() stylingMode = 'outlined';
  @Input() label = '';
  @Input() showAll = true;

  items: any = [
    {Value: -1, Ten: 'Toàn bộ'},
    {Value: 0, Ten: 'Chưa thực hiện'},
    {Value: 1, Ten: 'Đang thực hiện'},
    {Value: 2, Ten: 'Thực hiện xong, chờ xác nhận'},
  ];

  @Output() trangthaiChange = new EventEmitter<any>();
  constructor(
  ) {}

  ngOnInit(): void {
    if(!this.showAll) this.items = this.items.filter(o => o.Value >= 0);
  }

  onValueChanged(event) {
    this.trangthaiChange.emit(event.value);
  }
}
