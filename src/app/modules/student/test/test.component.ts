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
          this.exams = response.ReturnData;
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Lỗi khi tải danh sách đề thi:', error);
        this.isLoading = false;
      }
    });
  }

  startExam(exam: any) {
    this.router.navigate(['/student/test-detail'], { queryParams: { id: exam.Id } });
  }
}
