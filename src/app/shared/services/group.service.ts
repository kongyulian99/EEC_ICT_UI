import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BaseService } from './base.service';
import { catchError} from 'rxjs/operators';
import { ResponseData } from '../models';

@Injectable({ providedIn: 'root' })
export class GroupService extends BaseService {
    private httpOptions = new HttpHeaders();
    constructor(private http: HttpClient) {
        super();
        this.httpOptions = this.httpOptions.set('Content-Type', 'application/json');
    }
    processCommand(command, data) {
        return this.http.post<ResponseData>(`/api/Group/CommandProcess`, {
            Command: command,
            Data: JSON.stringify(data)
        }, { headers: this.httpOptions })
            .pipe(catchError(this.handleError));
    }
}
