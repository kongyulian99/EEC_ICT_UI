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
  filteredExams: ExamInfo[] = [];
  isLoading: boolean = false;

  // Popup
  popupVisible: boolean = false;
  popupTitle: string = '';
  editingExam: ExamInfo = {} as ExamInfo;
  isNewExam: boolean = false;

  // Card view properties
  viewMode: string = 'card'; // 'card' or 'list'
  searchText: string = '';
  currentPage: number = 1;
  totalPages: number = 1;
  itemsPerPage: number = 12;
  sortField: string = 'Created_At';
  sortDirection: string = 'desc';

  // Filter properties
  filterCreator: string = '';
  uniqueCreators: string[] = [];

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
          this.extractUniqueCreators();
          this.applyFilters();
          this.calculateTotalPages();
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
    this.router.navigate(['/administration/exams/detail'], { queryParams: { id: exam.Id } });
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
            this.notificationService.showSuccess('Exam added successfully');
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
            this.notificationService.showSuccess('Exam updated successfully');
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
              this.notificationService.showSuccess('Exam deleted successfully');
              this.loadExams();
            } else {
              this.notificationService.showError(response.ReturnStatus.Message);
            }
            this.isLoading = false;
          },
          (error) => {
            this.notificationService.showError('Không thể xóa đề thi, hãy xoá câu hỏi trong đề thi trước');
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

  // Card view methods
  onSearchChange(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  sortBy(field: string): void {
    if (this.sortField === field) {
      // Toggle direction if clicking the same field
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
    this.applyFilters();
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages) {
      return;
    }
    this.currentPage = page;
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxPagesToShow = 5;

    if (this.totalPages <= maxPagesToShow) {
      // Nếu tổng số trang ít hơn hoặc bằng số trang tối đa cần hiển thị
      // thì hiển thị tất cả các trang
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Nếu tổng số trang nhiều hơn số trang tối đa cần hiển thị
      // thì hiển thị một số trang ở giữa
      let startPage = Math.max(1, this.currentPage - Math.floor(maxPagesToShow / 2));
      let endPage = startPage + maxPagesToShow - 1;

      if (endPage > this.totalPages) {
        endPage = this.totalPages;
        startPage = Math.max(1, endPage - maxPagesToShow + 1);
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }

    return pages;
  }

  calculateTotalPages(): void {
    this.totalPages = Math.ceil(this.filteredExams.length / this.itemsPerPage);
    if (this.totalPages === 0) {
      this.totalPages = 1;
    }
  }

  // Filter methods
  applyFilters(): void {
    let filtered = [...this.exams];

    // Apply text search
    if (this.searchText && this.searchText.trim() !== '') {
      const searchLower = this.searchText.toLowerCase().trim();
      filtered = filtered.filter(exam =>
        (exam.Title && exam.Title.toLowerCase().includes(searchLower)) ||
        (exam.Description && exam.Description.toLowerCase().includes(searchLower))
      );
    }

    // Apply creator filter
    if (this.filterCreator) {
      filtered = filtered.filter(exam => exam.Create_User_Name === this.filterCreator);
    }

    // Apply sorting
    filtered = this.sortExams(filtered);

    this.filteredExams = filtered;
    this.calculateTotalPages();
  }

  sortExams(exams: ExamInfo[]): ExamInfo[] {
    return exams.sort((a, b) => {
      let valueA: any = a[this.sortField];
      let valueB: any = b[this.sortField];

      // Handle date comparisons
      if (this.sortField === 'Created_At' || this.sortField === 'Updated_At') {
        valueA = valueA ? new Date(valueA).getTime() : 0;
        valueB = valueB ? new Date(valueB).getTime() : 0;
      }

      // Handle string comparisons
      if (typeof valueA === 'string' && typeof valueB === 'string') {
        valueA = valueA.toLowerCase();
        valueB = valueB.toLowerCase();
      }

      // Handle null/undefined values
      if (valueA === null || valueA === undefined) return 1;
      if (valueB === null || valueB === undefined) return -1;

      // Compare based on sort direction
      if (this.sortDirection === 'asc') {
        return valueA > valueB ? 1 : valueA < valueB ? -1 : 0;
      } else {
        return valueA < valueB ? 1 : valueA > valueB ? -1 : 0;
      }
    });
  }

  extractUniqueCreators(): void {
    const creators = new Set<string>();
    this.exams.forEach(exam => {
      if (exam.Create_User_Name) {
        creators.add(exam.Create_User_Name);
      }
    });
    this.uniqueCreators = Array.from(creators);
  }

  resetFilters(): void {
    this.searchText = '';
    this.filterCreator = '';
    this.sortField = 'Created_At';
    this.sortDirection = 'desc';
    this.currentPage = 1;
    this.applyFilters();
  }

  getSortLabel(): string {
    switch (this.sortField) {
      case 'Title':
        return 'Title ' + (this.sortDirection === 'asc' ? '(A-Z)' : '(Z-A)');
      case 'Created_At':
        return 'Date ' + (this.sortDirection === 'asc' ? '(Oldest)' : '(Newest)');
      case 'Total_Questions':
        return 'Questions ' + (this.sortDirection === 'asc' ? '(Low-High)' : '(High-Low)');
      default:
        return 'Sort By';
    }
  }

  // Thêm phương thức để lấy danh sách exam theo trang hiện tại
  get paginatedExams(): ExamInfo[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredExams.slice(startIndex, endIndex);
  }
}
