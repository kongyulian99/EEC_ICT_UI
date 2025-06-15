import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { BaseService } from './base.service';
import { ResponseData } from '../models';
import { environment } from 'src/environments/environment';

/**
 * Interface cho TopicInfo
 */
export interface TopicInfo {
  Id: number;
  Name: string;
  Description: string;
  Parent_Id: number | null;
  Created_At: Date;
  Updated_At: Date;
}

@Injectable({
  providedIn: 'root'
})
export class TopicsService extends BaseService {
  private httpOptions = new HttpHeaders();
  private apiUrl = `${environment.apiUrl}/api/Topic`;

  constructor(private http: HttpClient) {
    super();
    this.httpOptions = this.httpOptions.set('Content-Type', 'application/json');
  }

  /**
   * Lấy tất cả chủ đề
   */
  getAllTopics() {
    return this.http.get<ResponseData<TopicInfo[]>>(`${this.apiUrl}/GetAll`, { headers: this.httpOptions })
      .pipe(catchError(this.handleError));
  }

  /**
   * Lấy tất cả chủ đề gốc (không có chủ đề cha)
   */
  getRootTopics() {
    return this.http.get<ResponseData<TopicInfo[]>>(`${this.apiUrl}/GetRootTopics`, { headers: this.httpOptions })
      .pipe(catchError(this.handleError));
  }

  /**
   * Lấy các chủ đề con của một chủ đề
   * @param parentId ID của chủ đề cha
   */
  getChildTopics(parentId: number) {
    return this.http.get<ResponseData<TopicInfo[]>>(`${this.apiUrl}/GetChildTopics/${parentId}`, { headers: this.httpOptions })
      .pipe(catchError(this.handleError));
  }

  /**
   * Lấy chủ đề theo ID
   * @param id ID của chủ đề
   */
  getTopicById(id: number) {
    return this.http.get<ResponseData<TopicInfo>>(`${this.apiUrl}/GetById/${id}`, { headers: this.httpOptions })
      .pipe(catchError(this.handleError));
  }

  /**
   * Tạo chủ đề mới
   * @param topic Thông tin chủ đề (TopicInfo)
   */
  createTopic(topic: Partial<TopicInfo>) {
    return this.http.post<ResponseData<number>>(`${this.apiUrl}/Create`, topic, { headers: this.httpOptions })
      .pipe(catchError(this.handleError));
  }

  /**
   * Cập nhật thông tin chủ đề
   * @param topic Thông tin chủ đề cần cập nhật (TopicInfo)
   */
  updateTopic(topic: TopicInfo) {
    return this.http.put<ResponseData<number>>(`${this.apiUrl}/Update`, topic, { headers: this.httpOptions })
      .pipe(catchError(this.handleError));
  }

  /**
   * Xóa chủ đề
   * @param id ID của chủ đề cần xóa
   */
  deleteTopic(id: number) {
    return this.http.delete<ResponseData<number>>(`${this.apiUrl}/Delete/${id}`, { headers: this.httpOptions })
      .pipe(catchError(this.handleError));
  }
}
