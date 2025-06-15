import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { BaseService } from './base.service';
import { ResponseData } from '../models';
import { environment } from 'src/environments/environment';
// import { Role } from '../models/role';
@Injectable({
    providedIn: 'root' // ADDED providedIn root here.
})
export class RoleService extends BaseService {
    private httpOptions = new HttpHeaders();

    constructor(private http: HttpClient) {
        super();
        this.httpOptions = this.httpOptions.set('Content-Type', 'application/json');
    }

    processCommand(command, data) {
        return this.http.post<ResponseData>(`${environment.apiUrl}/api/Role/CommandProcess`, {
            Command: command,
            Data: JSON.stringify(data)
        }, { headers: this.httpOptions })
            .pipe(catchError(this.handleError));
    }
    insert(entity: any) {
        return this.http.post<ResponseData>(`${environment.apiUrl}/api/roles/insert`, entity, { headers: this.httpOptions })
            .pipe(catchError(this.handleError));
    }
    update(entity: any) {
        return this.http.post<ResponseData>(`${environment.apiUrl}/api/roles/update`, entity, { headers: this.httpOptions })
            .pipe(catchError(this.handleError));
    }
    checkName(body: any) {
        return this.http.post<ResponseData>(`${environment.apiUrl}/api/roles/checkname`,body, { headers: this.httpOptions })
            .pipe(catchError(this.handleError));
    }
    selectAll(pageindex: number, pagesize: number, keyword: string) {
        // tslint:disable-next-line:max-line-length
        return this.http.get<ResponseData>(`${environment.apiUrl}/api/roles/selectAll?pageindex=${pageindex}&pagesize=${pagesize}&filter=${keyword}`, { headers: this.httpOptions })
        .pipe(catchError(this.handleError));
    }
    selectAllByPermission(id: string,pageindex: number, pagesize: number, keyword: string) {
        return this.http.get<ResponseData>(`${environment.apiUrl}/api/roles/selectallbypermission/${id}?pageindex=${pageindex}&pagesize=${pagesize}&filter=${keyword}`, { headers: this.httpOptions })
            .pipe(catchError(this.handleError));
    }
    selectOne(id: string) {
        return this.http.get<ResponseData>(`${environment.apiUrl}/api/roles/selectOne/${id}`, { headers: this.httpOptions })
        .pipe(catchError(this.handleError));
    }
    delete(ids: number[]) {
        let query = '';
        for (const id of ids) {
            query += 'ids=' + id + '&';
        }
        query = query.slice(0, -1);
        return this.http.post<ResponseData>(`${environment.apiUrl}/api/roles/delete?${query}`, { headers: this.httpOptions })
        .pipe(catchError(this.handleError));
     }
}
