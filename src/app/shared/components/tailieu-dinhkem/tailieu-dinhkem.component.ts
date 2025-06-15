import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FileService, NotificationService } from '../../services';
import { HttpEvent, HttpEventType } from '@angular/common/http';

@Component({
  selector: 'app-tailieu-dinhkem',
  templateUrl: './tailieu-dinhkem.component.html',
  styleUrls: ['./tailieu-dinhkem.component.scss'],
})
export class TailieuDinhkemComponent implements OnInit {
  @Input() dinhKemStr;
  @Input() readOnly;
  @Input() folder = 'KeHoach';
  @Output() dinhKemStrChange = new EventEmitter();

  displayValue = '';
  listDinhKem = [];

  constructor(
    private fileService: FileService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['dinhKemStr'] && this.dinhKemStr) {
      this.listDinhKem = JSON.parse(this.dinhKemStr);
    }
  }

  handleUpdateDisplayValue() {
    this.dinhKemStr = this.listDinhKem.join(',');
    this.dinhKemStrChange.emit(this.dinhKemStr);
  }

  isShowForm = false;
  toggleShowDinhKemForm() {
    this.isShowForm = !this.isShowForm;
  }

  handleUploadFile(event) {
    // this.loading = true;
    this.fileService
      .uploadAbsolutePath([event.target.files[0]], this.folder)
      .subscribe((event: HttpEvent<any>) => {
        if (event.type == HttpEventType.Response) {
          const { ReturnStatus, ReturnData } = event.body;
          if (ReturnStatus.Code === 0) {
            this.listDinhKem.push(ReturnData);
            this.dinhKemStr = JSON.stringify(this.listDinhKem);
            this.dinhKemStrChange.emit(this.dinhKemStr);
          } else {
            this.notificationService.showError(ReturnStatus.Message);
          }
        }
      });
  }

  handleDeleteDinhKem(dinhKem) {
    // this.listDinhKem
    // debugger;
    this.listDinhKem = this.listDinhKem.filter((o) => o !== dinhKem);
    this.dinhKemStr = JSON.stringify(this.listDinhKem);
    this.dinhKemStrChange.emit(this.dinhKemStr);
  }
}
