import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { BaseService } from './base.service';
import { ResponseData } from '../models';
@Injectable({
    providedIn: 'root' // ADDED providedIn root here.
})
export class TimeService extends BaseService {
    private httpOptions = new HttpHeaders();

    constructor(private http: HttpClient) {
        super();
        this.httpOptions = this.httpOptions.set('Content-Type', 'application/json');
    }

    getCurrentTime() {
        return this.http.get<ResponseData>(`${environment.apiUrl}/api/time/getcurrenttime`, { headers: this.httpOptions })
            .pipe(catchError(this.handleError));
    }
}
