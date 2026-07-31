import { Routes } from '@angular/router';
import { Login } from './login/login';
import { Register } from './register/register';
import { UserList } from './user-list/user-list';
import { ForgotPassword } from './forgot-password/forgot-password';
export const routes: Routes = [
    // Nếu đường dẫn trống, tự động chuyển hướng về trang login
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  
  // Khai báo các trang
  { path: 'login', component: Login },
  { path: 'register', component: Register},
  { path: 'forgot-password', component: ForgotPassword },
  { path: 'user-list', component: UserList },
    // Nếu gõ link linh tinh, đẩy về login (hoặc làm trang 404 tùy ý)
  { path: '**', redirectTo: 'login' }

];
