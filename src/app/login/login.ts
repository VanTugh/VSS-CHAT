import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { Component } from '@angular/core';
import { AuthService } from '../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class Login  {
    email = '';
    password = '';
    isPasswordHidden = true;
    isLocked = false;

    emailError = '';
    passwordError = '';
    generalError = '';

     private readonly emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
     constructor(
  private authService: AuthService
) {}

  onLogin() { 
    if (this.isLocked) return;

    this.emailError = '';
    this.passwordError = '';
    this.generalError = '';
    let isValid = true;

    const emailVal = this.email.trim();
    const passVal = this.password.trim();

    if (!emailVal) {
      this.emailError = 'Vui lòng nhập tài khoản hoặc email!';
      isValid = false;
    } else if (!this.emailPattern.test(emailVal)) {
      this.emailError = 'Email không đúng định dạng!';
      isValid = false;
    }

    if (!passVal) {
      this.passwordError = 'Vui lòng nhập mật khẩu!';
      isValid = false;
    }

    if (isValid) {
      this.authService.login(emailVal, passVal).subscribe((isSuccess) => {
        if (isSuccess) {
          alert('Đăng nhập thành công! Đang chuyển hướng...');
          // Tương lai: Gọi LockService để xóa án phạt (nếu có)
          // Tương lai: Dùng Router để chuyển trang
        } else {
          this.generalError = 'Tài khoản hoặc mật khẩu không đúng!';
          // Tương lai: Gọi LockService để tăng số lần nhập sai
        }
      });
    }
  }
}