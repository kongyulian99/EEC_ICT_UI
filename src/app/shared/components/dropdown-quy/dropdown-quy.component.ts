import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { SystemConstants } from '../../constants';

@Component({
  selector: 'app-dropdown-quy',
  templateUrl: './dropdown-quy.component.html',
})
export class DropDownQuy implements OnInit {
  @Input() quy = 0;
  @Input() readOnly = false;
  @Input() isValidate = false;
  @Input() stylingMode = 'outlined';
  @Input() label = '';

  user: any = {};
  items: any = [
    {Id: 0, Ten: 'Tất cả'},
    {Id: 1, Ten: 'Quý I'},
    {Id: 2, Ten: 'Quý II'},
    {Id: 3, Ten: 'Quý III'},
    {Id: 4, Ten: 'Quý IV'},
  ];

  @Output() quyChange = new EventEmitter<any>();
  constructor(
  ) {}

  ngOnInit(): void {
    this.user = JSON.parse(
      localStorage.getItem(SystemConstants.CURRENT_USER) as string
    );
  }

  onValueChanged(event) {
    this.quyChange.emit(event.value);
  }
}
