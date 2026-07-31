import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true, // Angular bản mới mặc định là true
  imports: [CommonModule, FormsModule, RouterLink], // Phải có FormsModule để dùng ngModel
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class Login {
  // 1. Khai báo các biến trói buộc (Data Binding)
  email = '';
  password = '';
  isPasswordHidden = true;
  isLocked = false;

  // Khai báo các biến hiển thị lỗi
  emailError = '';
  passwordError = '';
  generalError = '';

  // 2. Hàm ẩn hiện con mắt mật khẩu
  togglePasswordVisibility() {
    this.isPasswordHidden = !this.isPasswordHidden;
  }

  // 3. Hàm xử lý khi bấm nút Đăng nhập
  onLogin() {
    // Tạm thời reset lỗi trước khi check
    this.emailError = '';
    this.passwordError = '';
    this.generalError = '';

    // Test thử logic đơn giản
    if (!this.email) {
      this.emailError = 'Vui lòng nhập email!';
    }
    if (!this.password) {
      this.passwordError = 'Vui lòng nhập mật khẩu!';
    }

    if (this.email && this.password) {
      console.log('Đang đăng nhập với:', this.email, this.password);
      // Chỗ này lát nữa sẽ ghép logic Fake Data và Exponential Backoff vào
    }
  }
}