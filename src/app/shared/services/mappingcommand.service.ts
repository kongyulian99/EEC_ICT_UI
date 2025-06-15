import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { BaseService } from './base.service';
import { ResponseData } from '../models';
import { environment } from 'src/environments/environment';
@Injectable({
  providedIn: 'root', // ADDED providedIn root here.
})
export class MappingCommandService extends BaseService {
    url = `${environment.apiUrl}/api/MappingCommand/`;
  private httpOptions = new HttpHeaders();

  constructor(private http: HttpClient) {
    super();
    this.httpOptions = this.httpOptions.set('Content-Type', 'application/json');
  }


  processCommand(command, data) {
    return this.http.post<ResponseData>(`${this.url}/CommandProcess`, {
      Command: command,
      Data: JSON.stringify(data)
    }, { headers: this.httpOptions })
      .pipe(catchError(this.handleError));
  }
}
