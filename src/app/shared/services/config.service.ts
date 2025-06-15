// src/app/config.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  constructor(private http: HttpClient) {}

  // Method to load the JSON file
  loadConfig(): Observable<any> {
    return this.http.get('/assets/config/config.json');
  }
}
