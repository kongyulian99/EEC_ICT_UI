import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { BaseService } from './base.service';
import { ResponseData } from '../models';
@Injectable({
  providedIn: 'root', // ADDED providedIn root here.
})
export class MappingCommandService extends BaseService {
  url = '/api/dm-khoidonvi/';
  private httpOptions = new HttpHeaders();

  constructor(private http: HttpClient) {
    super();
    this.httpOptions = this.httpOptions.set('Content-Type', 'application/json');
  }


  processCommand(command, data) {
    return this.http.post<ResponseData>(`/api/MappingCommand/CommandProcess`, {
      Command: command,
      Data: JSON.stringify(data)
    }, { headers: this.httpOptions })
      .pipe(catchError(this.handleError));
  }
}
