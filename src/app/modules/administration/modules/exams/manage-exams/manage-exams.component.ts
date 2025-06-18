import { Component, OnInit, ViewChild } from '@angular/core';
import { DxDataGridComponent } from 'devextreme-angular';
import { confirm } from 'devextreme/ui/dialog';
import { NotificationService } from 'src/app/shared';
import { ExamsService } from 'src/app/shared/services/exam.service';
import { ExamInfo } from 'src/app/shared/interfaces/exam.interface';
import { dxGridConfig } from 'src/app/shared/config/dx-grid.config';
import { dxButtonConfig } from 'src/app/shared/config';
import { Router } from '@angular/router';
@Component({
  selector: 'app-manage-exams',
  templateUrl: './manage-exams.component.html',
  styleUrls: ['./manage-exams.component.scss']
})
export class ManageExamsComponent implements OnInit {
  @ViewChild(DxDataGridComponent, { static: false }) dataGrid: DxDataGridComponent;

  dxButtonConfig = dxButtonConfig;
  // Cấu hình grid
  gridConfig = dxGridConfig;

  // Dữ liệu
  exams: ExamInfo[] = [];
  isLoading: boolean = false;

  // Popup
  popupVisible: boolean = false;
  popupTitle: string = '';
  editingExam: ExamInfo = {} as ExamInfo;
  isNewExam: boolean = false;

  constructor(
    private examsService: ExamsService,
    private notificationService: NotificationService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadExams();
  }

  // Load danh sách đề thi
  loadExams(): void {
    this.isLoading = true;
    this.examsService.getAllExams().subscribe(
      (response: any) => {
        if (response.ReturnStatus.Code === 1) {
          this.exams = response.ReturnData;
        } else {
          this.notificationService.showError(response.ReturnStatus.Message);
        }
        this.isLoading = false;
      },
      (error) => {
        this.notificationService.showError('Không thể tải danh sách đề thi');
        this.isLoading = false;
      }
    );
  }

  // Mở popup thêm mới
  addExam(): void {
    this.router.navigate(['/administration/exams/detail']);
  }

  // Mở popup chỉnh sửa
  editExam(exam: ExamInfo): void {
    this.router.navigate(['/administration/exams/detail', exam.Id]);
  }

  // Lưu đề thi
  saveExam(): void {
    if (!this.validateExam()) {
      return;
    }

    this.isLoading = true;

    if (this.isNewExam) {
      this.examsService.createExam(this.editingExam).subscribe(
        (response: any) => {
          if (response.ReturnStatus.Code === 1) {
            this.notificationService.showSuccess('Thêm mới đề thi thành công');
            this.popupVisible = false;
            this.loadExams();
          } else {
            this.notificationService.showError(response.ReturnStatus.Message);
          }
          this.isLoading = false;
        },
        (error) => {
          this.notificationService.showError('Không thể thêm mới đề thi');
          this.isLoading = false;
        }
      );
    } else {
      this.examsService.updateExam(this.editingExam).subscribe(
        (response: any) => {
          if (response.ReturnStatus.Code === 1) {
            this.notificationService.showSuccess('Cập nhật đề thi thành công');
            this.popupVisible = false;
            this.loadExams();
          } else {
            this.notificationService.showError(response.ReturnStatus.Message);
          }
          this.isLoading = false;
        },
        (error) => {
          this.notificationService.showError('Không thể cập nhật đề thi');
          this.isLoading = false;
        }
      );
    }
  }

  // Xóa đề thi
  deleteExam(exam: ExamInfo): void {
    const result = confirm('Bạn có chắc chắn muốn xóa đề thi này?', 'Xác nhận xóa');
    result.then((dialogResult) => {
      if (dialogResult) {
        this.isLoading = true;
        this.examsService.deleteExam(exam.Id).subscribe(
          (response: any) => {
            if (response.ReturnStatus.Code === 1) {
              this.notificationService.showSuccess('Xóa đề thi thành công');
              this.loadExams();
            } else {
              this.notificationService.showError(response.ReturnStatus.Message);
            }
            this.isLoading = false;
          },
          (error) => {
            this.notificationService.showError('Không thể xóa đề thi');
            this.isLoading = false;
          }
        );
      }
    });
  }

  // Validate dữ liệu đề thi
  validateExam(): boolean {
    if (!this.editingExam.Title || this.editingExam.Title.trim() === '') {
      this.notificationService.showError('Vui lòng nhập tiêu đề đề thi');
      return false;
    }

    if (this.editingExam.Duration_Minutes <= 0) {
      this.notificationService.showError('Thời gian làm bài phải lớn hơn 0');
      return false;
    }

    if (this.editingExam.Total_Questions < 0) {
      this.notificationService.showError('Số câu hỏi không được âm');
      return false;
    }

    return true;
  }

  // Đóng popup
  cancelPopup(): void {
    this.popupVisible = false;
  }
}
