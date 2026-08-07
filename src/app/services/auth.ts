import { Injectable } from '@angular/core'; 
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay, tap } from 'rxjs/operators';
import { StorageService } from './storage';

interface User {
    email: string;
    password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly fakeUsers: User[] = [
    { email: "admin@gmail.com", password: "password123" },
    { email: "shin@vss.com", password: "shin123456" },
    { email: "sqa@vss.com", password: "test2026" }
  ];

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private storageService: StorageService) {
    // Tự động khôi phục trạng thái đăng nhập ngay khi ứng dụng khởi chạy (người dùng F5)
    this.getCurrentUser();
  }
 
  // Chuyển sang Observable để đồng nhất kiến trúc và giả lập gọi API server
login(email: string, password: string): Observable<boolean> {
    // Gọi hàm private thay vì viết logic find() trực tiếp ở đây
    const authenticatedUser = this.findUser(email, password);
    
    // Xử lý logic
    const isSuccess = !!authenticatedUser;
    if (isSuccess) {
      // TypeScript hiểu authenticatedUser lúc này chắc chắn là User
      this.currentUserSubject.next(authenticatedUser);
      this.storageService.setItem('currentUser', authenticatedUser); 
    }
    
    // Trả về luồng bất đồng bộ, trễ 1 giây
    return of(isSuccess).pipe(delay(1000));
  }

  register(userData: any): Observable<boolean> {
    // Giả lập call API đăng ký
    return of(true).pipe(delay(1000));
  }
  
  forgotPassword(email: string): Observable<boolean> {
    // Giả lập call API gửi mail reset
    return of(true).pipe(delay(1000));
  }

  logout() {
    this.currentUserSubject.next(null);
    this.storageService.removeItem('currentUser');
  }

  getCurrentUser(): User | null {
    const user = this.storageService.getItem<User>('currentUser');
    if (user) {
      this.currentUserSubject.next(user);
    }
    return user;
  }
  private findUser(email: string, password: string): User | undefined {
    return this.fakeUsers.find(u => u.email === email && u.password === password);
  }
}