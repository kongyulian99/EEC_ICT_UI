import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { BaseService } from './base.service';
import { ResponseData } from '../models';
@Injectable({
    providedIn: 'root' // ADDED providedIn root here.
})
export class FunctionService extends BaseService {
    private httpOptions = new HttpHeaders();

    constructor(private http: HttpClient) {
        super();
        this.httpOptions = this.httpOptions.set('Content-Type', 'application/json');
    }
    // getFunctionByUserId(id: string) {
    //     return this.http.get<any>(`/api/functions/selectbyuserid/${id}`, { headers: this.httpOptions })
    //         .pipe(map(response => {
    //             return this.utilityService.UnflatteringForMenu(response.Data);
    //         }
    //         ), catchError(this.handleError));

    // }
    getFunctionWithCommandsAndPermission(roleId: number) {
        return this.http.get<ResponseData>(`/api/functions/GetFunctionWithCommandsAndPermission?roleId=${roleId}`, { headers: this.httpOptions })
            .pipe(catchError(this.handleError));
    }
    insert(entity: any) {
        return this.http.post<ResponseData>(`/api/functions/insert`, entity, { headers: this.httpOptions })
            .pipe(catchError(this.handleError));
    }
    update(entity: any) {
        return this.http.post<ResponseData>(`/api/functions/update`, entity, { headers: this.httpOptions })
            .pipe(catchError(this.handleError));
    }
    selectAll() {
        // tslint:disable-next-line:max-line-length
        return this.http.get<ResponseData>(`/api/functions/selectAll?pageindex=0&pagesize=0&filter=`, { headers: this.httpOptions })
            .pipe(catchError(this.handleError));
    }
    selectOne(id: string) {
        return this.http.get<ResponseData>(`/api/functions/selectOne/${id}`, { headers: this.httpOptions })
            .pipe(catchError(this.handleError));
    }
    checkFunctionId(body: any) {
        return this.http.post<ResponseData>(`/api/functions/checkfunctionid`,body, { headers: this.httpOptions })
            .pipe(catchError(this.handleError));
    }
    delete(ids: string[]) {
        let query = '';
        for (const functionId of ids) {
            query += 'ids=' + functionId + '&';
        }
        query = query.slice(0, -1);
        return this.http.post<ResponseData>(`/api/functions/delete?${query}`, { headers: this.httpOptions })
            .pipe(catchError(this.handleError));
    }
    selectByParentId(id: string) {
        if (id === null) { id = ''; }
        return this.http
            // tslint:disable-next-line:max-line-length
            .get<ResponseData>(`/api/functions/SelectByParentId?parenId=${id}`, { headers: this.httpOptions })
            .pipe(catchError(this.handleError));
    }
}
