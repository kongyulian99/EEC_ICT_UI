import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { BaseService } from './base.service';
import { ResponseData } from '../models';

@Injectable({
    providedIn: 'root'
})
export class UserService extends BaseService {
    private httpOptions = new HttpHeaders();

    constructor(private http: HttpClient) {
        super();
        this.httpOptions = this.httpOptions.set('Content-Type', 'application/json');
    }

    // Đăng xuất người dùng
    logout() {
        return this.http.post<ResponseData>(`${environment.apiUrl}/api/User/Logout`, {}, { headers: this.httpOptions })
            .pipe(catchError(this.handleError));
    }

    // Lấy danh sách tất cả người dùng
    getAllUsers() {
        return this.http.get<ResponseData>(`${environment.apiUrl}/api/User/GetAll`, { headers: this.httpOptions })
            .pipe(catchError(this.handleError));
    }

    // Lấy thông tin người dùng theo ID
    getUserById(id: number) {
        return this.http.get<ResponseData>(`${environment.apiUrl}/api/User/GetById/${id}`, { headers: this.httpOptions })
            .pipe(catchError(this.handleError));
    }

    // Lấy thông tin người dùng theo username
    getUserByUsername(username: string) {
        return this.http.get<ResponseData>(`${environment.apiUrl}/api/User/GetByUsername/${username}`, { headers: this.httpOptions })
            .pipe(catchError(this.handleError));
    }

    // Tạo người dùng mới
    createUser(user: any) {
        return this.http.post<ResponseData>(`${environment.apiUrl}/api/User/Create`, user, { headers: this.httpOptions })
            .pipe(catchError(this.handleError));
    }

    // Cập nhật thông tin người dùng
    updateUser(user: any) {
        return this.http.put<ResponseData>(`${environment.apiUrl}/api/User/Update`, user, { headers: this.httpOptions })
            .pipe(catchError(this.handleError));
    }

    // Xóa người dùng
    deleteUser(id: number) {
        return this.http.delete<ResponseData>(`${environment.apiUrl}/api/User/Delete/${id}`, { headers: this.httpOptions })
            .pipe(catchError(this.handleError));
    }

    // Cập nhật mật khẩu người dùng
    updatePassword(userId: number, newPasswordHash: string) {
        return this.http.put<ResponseData>(`${environment.apiUrl}/api/User/UpdatePassword`, {
            UserId: userId,
            NewPasswordHash: newPasswordHash
        }, { headers: this.httpOptions })
            .pipe(catchError(this.handleError));
    }

    // Giữ lại phương thức processCommand nếu vẫn cần thiết
    processCommand(command, data) {
        return this.http.post<ResponseData>(`${environment.apiUrl}/api/User/CommandProcess`, {
            Command: command,
            Data: JSON.stringify(data)
        }, { headers: this.httpOptions })
            .pipe(catchError(this.handleError));
    }
}
