import { CommandAssign } from './../models/commandAssign';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { BaseService } from './base.service';
import { ResponseData } from '../models';
// import { CommandAssign } from '../models/command-assign';
@Injectable({
    providedIn: 'root' // ADDED providedIn root here.
})
export class CommandService extends BaseService {
    private httpOptions = new HttpHeaders();

    constructor(private http: HttpClient) {
        super();
        this.httpOptions = this.httpOptions.set('Content-Type', 'application/json');
    }
    selectAll() {
        return this.http
            .get<ResponseData>(`/api/commands/SelectAll?pageindex=0&pagesize=0&filter=`, { headers: this.httpOptions })
            .pipe(catchError(this.handleError));
    }
    selectByFunctionId(functionId: string) {
        return this.http
            .get<ResponseData>(`/api/commands/SelectByFunctionId/${functionId}?pageindex=0&pagesize=0&filter=`, { headers: this.httpOptions })
            .pipe(catchError(this.handleError));
    }
    addCommandToFunction(functionId: string, commandAssign: CommandAssign) {
        return this.http
            .post<ResponseData>(`/api/commands/addcommandtofunction/${functionId}`, commandAssign, { headers: this.httpOptions })
            .pipe(catchError(this.handleError));
    }
    removeCommandInFunction(functionId: string, ids: number[]) {
        let query = '';
        for (const id of ids) {
            query += 'ids=' + id + '&';
        }
        query = query.slice(0, -1);
        return this.http
            .post<ResponseData>(`/api/commands/removecommandinfunction/${functionId}?${query}`, { headers: this.httpOptions })
            .pipe(catchError(this.handleError));
    }
}