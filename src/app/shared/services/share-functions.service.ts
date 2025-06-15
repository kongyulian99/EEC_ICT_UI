import { Injectable } from '@angular/core';
import { NotificationService } from './notifications.service';
import { FileService } from './file.service';

@Injectable({
  providedIn: 'root', // ADDED providedIn root here.
})
export class ShareFunctionsService {
  constructor(
    private notificationService: NotificationService,
    private fileService: FileService
  ) {}

  getMonday(d: Date): Date {
    const date = new Date(d);
    date.setHours(0, 0, 0, 0);
    const day = date.getDay();
    const diff = day === 0 ? - 6 : 1 - day; // Điều chỉnh để về Thứ Hai
    date.setDate(date.getDate() + diff);
    return date;
  }

  getNextSunday(d: Date): Date {
    const date = new Date(d);
    d.setHours(0, 0, 0, 0);
    const day = date.getDay();
    const diff = 7 - day; // Khoảng cách đến Chủ Nhật tiếp theo
    date.setDate(date.getDate() + diff);
    return date;
  }

  getListDate(d: Date) {
    const currentStartDate = new Date(d);
    currentStartDate.setDate(currentStartDate.getDate() -1);
    let listDate = [];
    for(let i=0; i<7; i++) {
      listDate.push(new Date(currentStartDate.setDate(currentStartDate.getDate() + 1)));
    }

    return listDate;
  }

  compareDates(date1: Date, date2: Date) {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    return d1.getFullYear() === d2.getFullYear() &&
          d1.getMonth() === d2.getMonth() &&
          d1.getDate() === d2.getDate();
  }

  getLastDayOfMonth(year: number, month: number): Date {
    // Tạo một đối tượng Date vào ngày 1 của tháng kế tiếp
    const nextMonth = new Date(year, month, 1);

    // Lùi lại 1 ngày để có ngày cuối cùng của tháng hiện tại
    nextMonth.setDate(0);

    return nextMonth;
  }

  isOverlapping(startTime1: Date, endTime1: Date, startTime2: Date, endTime2: Date) {
    return startTime1 < endTime1 && startTime2 < endTime2;
  }

  isEmptyObject(item) {
    return !item || (item && item?.length && Object.keys(JSON.parse(item)).length <= 0);
    // try {
    //   const obj = JSON.parse(item);
    //   return Object.keys(obj).length <= 0;
    //   // return !item || (item?.length > 0 && );
    // } catch {
    //   return true;
    // }
  }

  // getAttributeValueOfJsonString(jsonString, attribute) {
  //   try {
  //     const obj = JSON.parse(jsonString);
  //     if(obj && typeof obj === 'object' && Object.keys(obj).length > 0 && attribute in obj) {
  //       return obj[attribute];
  //     } else return 0;
  //   }
  //   catch {
  //     return 0;
  //   }
  // }

  // tính tổng theo mục (lịch tuần)
  calculateSum(items, attribute) {
    let sum = 0.0;
    for(let i = 0; i< items?.length; i++) {
      sum += items[i][attribute]??0;
    }
    return sum;
  }

  downloadReport(fileUrl: any) {
    this.fileService.downloadReport(fileUrl).subscribe({
      next: (blob: any) => {
        const a = document.createElement('a');
        const objectUrl = URL.createObjectURL(blob);
        a.href = objectUrl;
        a.download = fileUrl;
        a.click();
        URL.revokeObjectURL(objectUrl);
      },
      error: (any) => {
        this.notificationService.showError('Không tìm thấy File');
      },
    });
  }
}
