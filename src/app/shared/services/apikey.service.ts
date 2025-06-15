import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { BaseService } from './base.service';
import { ResponseData } from '../models';
@Injectable({
    providedIn: 'root' // ADDED providedIn root here.
})
export class ApikeyService extends BaseService {
    private httpOptions = new HttpHeaders();

    constructor(private http: HttpClient) {
        super();
        this.httpOptions = this.httpOptions.set('Content-Type', 'application/json');
    }

    processCommand(command, data) {
        return this.http.post<ResponseData>(`/api/apikey/CommandProcess`, {
            Command: command,
            Data: JSON.stringify(data)
        }, { headers: this.httpOptions })
            .pipe(catchError(this.handleError));
    }
}
