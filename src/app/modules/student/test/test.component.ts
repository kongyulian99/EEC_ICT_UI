import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ExamsService } from 'src/app/shared';

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.scss']
})
export class TestComponent implements OnInit {
  isLoading = false;
  exams: any[] = [];
  filteredExams: any[] = [];
  paginatedExams: any[] = [];

  // Search and Pagination
  searchText: string = '';
  currentPage: number = 1;
  itemsPerPage: number = 6;
  totalPages: number = 1;

  constructor(
    private router: Router,
    private examService: ExamsService
  ) {}

  ngOnInit() {
    this.loadExams();
  }

  private loadExams() {
    this.isLoading = true;
    this.examService.getAllExams().subscribe({
      next: (response) => {
        if (response.ReturnStatus.Code === 1) {
          this.exams = response.ReturnData.sort((a, b) => new Date(b.Created_At).getTime() - new Date(a.Created_At).getTime());
          this.applyFilters();
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Lỗi khi tải danh sách đề thi:', error);
        this.isLoading = false;
      }
    });
  }

  applyFilters() {
    const searchLower = this.searchText.toLowerCase();
    this.filteredExams = this.exams.filter(exam =>
      exam.Title.toLowerCase().includes(searchLower) ||
      (exam.Description && exam.Description.toLowerCase().includes(searchLower))
    );
    this.totalPages = Math.ceil(this.filteredExams.length / this.itemsPerPage);
    this.setPage(1);
  }

  setPage(page: number) {
    if (page < 1 || page > this.totalPages) {
      return;
    }
    this.currentPage = page;
    const startIndex = (page - 1) * this.itemsPerPage;
    const endIndex = Math.min(startIndex + this.itemsPerPage, this.filteredExams.length);
    this.paginatedExams = this.filteredExams.slice(startIndex, endIndex);
  }

  startExam(exam: any) {
    this.router.navigate(['/student/test-detail'], { queryParams: { id: exam.Id } });
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  // Phương thức xác định class cho độ khó của bài thi
  getDifficultyClass(exam: any): string {
    if (!exam || !exam.Difficulty) return 'difficulty-normal';

    const difficulty = exam.Difficulty.toLowerCase();
    if (difficulty.includes('easy')) return 'difficulty-easy';
    if (difficulty.includes('hard') || difficulty.includes('difficult')) return 'difficulty-hard';
    return 'difficulty-normal';
  }
}
