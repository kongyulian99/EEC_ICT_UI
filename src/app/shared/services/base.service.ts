import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Subject, throwError } from 'rxjs';
import { SystemConstants } from '../constants/systems.constant';
import { Injectable } from '@angular/core';

export const signal = new Subject();

@Injectable({
  providedIn: 'root',
})
export abstract class BaseService {

    constructor() {
        signal.subscribe(() => {
            this.currentUser = null;
        });
    }
    public currentUser: any;
    get User() {
        this.currentUser = JSON.parse(localStorage.getItem(SystemConstants.CURRENT_USER) as string);
        if (this.currentUser) {
            return this.currentUser;
        } else {
            return null;
        }
    }
    protected handleError(error: HttpErrorResponse) {
        let errorMessage = 'Đã xảy ra lỗi!';

        if (error.error instanceof ErrorEvent) {
            // Client-side error
            errorMessage = error.error.message;
        } else {
            // Server-side error
            if (error.error instanceof Blob) {
                // Handle blob error (e.g., when downloading files)
                return throwError(() => new Error('Lỗi khi tải file'));
            }
            errorMessage = `Mã lỗi: ${error.status}\nThông báo: ${error.message}`;
        }

        return throwError(() => new Error(errorMessage));
    }
}
