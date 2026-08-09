import { Routes } from '@angular/router';

import { Login } from './login/login';
import { Register } from './register/register';
import { ForgotPassword } from './forgot-password/forgot-password';

export const routes: Routes = [

  // Trang mặc định
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },

  // Login
  {
    path: 'login',
    component: Login
  },

  // Register
  {
    path: 'register',
    component: Register
  },

  // Forgot password
  {
    path: 'forgot-password',
    component: ForgotPassword
  },

  // User List - Lazy Loading
  {
    path: 'user-list',
    loadComponent: () =>
      import('./user-list/user-list')
        .then(m => m.UserList)
  },

  // Không tìm thấy route
  {
    path: '**',
    redirectTo: 'login'
  }

];