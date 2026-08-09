import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpHeaders
} from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  UserResponse,
  CreateUserRequest,
  CreateUserResponse,
  UpdateUserRequest
} from '../../models/user';

import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private readonly apiUrl =
    `${environment.reqresApiUrl}/users`;

  constructor(
    private http: HttpClient
  ) {}

  // ==========================================
  // HTTP HEADERS
  // ==========================================

  private getHeaders(): HttpHeaders {

    return new HttpHeaders({
      'x-api-key': environment.reqresApiKey
    });

  }

  // ==========================================
  // GET USERS
  // ==========================================

  getUsers(
    page: number = 1
  ): Observable<UserResponse> {

    return this.http.get<UserResponse>(
      `${this.apiUrl}?page=${page}`,
      {
        headers: this.getHeaders()
      }
    );

  }

  // ==========================================
  // CREATE USER
  // ==========================================

  createUser(
    user: CreateUserRequest
  ): Observable<CreateUserResponse> {

    return this.http.post<CreateUserResponse>(
      this.apiUrl,
      user,
      {
        headers: this.getHeaders()
      }
    );

  }

  // ==========================================
  // UPDATE USER
  // ==========================================

  updateUser(
    id: number,
    user: UpdateUserRequest
  ): Observable<CreateUserResponse> {

    return this.http.put<CreateUserResponse>(
      `${this.apiUrl}/${id}`,
      user,
      {
        headers: this.getHeaders()
      }
    );

  }
  deleteUser(id: number): Observable<void> {

  return this.http.delete<void>(
    `${this.apiUrl}/${id}`,
    {
      headers: this.getHeaders()
    }
  );

}

}