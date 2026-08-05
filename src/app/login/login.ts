import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class Login implements OnInit, OnDestroy {

  email = '';
  password = '';
  isPasswordHidden = true;
  isLocked = false;

  // Khai báo các biến hiển thị lỗi
  emailError = '';
  passwordError = '';
  generalError = '';

  // --- 2. HẰNG SỐ & DỮ LIỆU MẪU ---
  private readonly MAX_ATTEMPTS = 5;
  private readonly PENALTY_TIERS = [30, 300, 3600, 86400, 999999999]; // 30s, 5m, 1h, 1d, Vĩnh viễn
  private readonly emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  private readonly fakeUsers = [
    { email: "admin@gmail.com", password: "password123" },
    { email: "shin@vss.com", password: "shin123456" },
    { email: "sqa@vss.com", password: "test2026" }
  ];


  failedAttempts = 0;
  lockUntil = 0;
  penaltyLevel = 0;
  countdownInterval: any;


  constructor(private router: Router) {}


  ngOnInit() {
    this.failedAttempts = parseInt(localStorage.getItem('failedAttempts') || '0', 10);
    this.lockUntil = parseInt(localStorage.getItem('lockUntil') || '0', 10);
    this.penaltyLevel = parseInt(localStorage.getItem('penaltyLevel') || '0', 10);

    this.checkLockStatus();
  }


  ngOnDestroy() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }


  togglePasswordVisibility() {
    this.isPasswordHidden = !this.isPasswordHidden;
  }


  onInputChange() {
    if (this.failedAttempts < this.MAX_ATTEMPTS) {
      this.generalError = '';
    }
    this.emailError = '';
    this.passwordError = '';
  }


  checkLockStatus() {
    const now = Date.now();
    if (this.lockUntil > now) {
      this.startCountdown();
    } else if (this.lockUntil !== 0) {

      this.resetPenalty(false);
    }
  }

  formatTimeLeft(seconds: number): string {
    if (seconds > 86400000) return "vĩnh viễn. Vui lòng liên hệ Admin";
    if (seconds >= 86400) return `${Math.ceil(seconds / 86400)} ngày`;
    if (seconds >= 3600) return `${Math.ceil(seconds / 3600)} giờ`;
    if (seconds >= 60) return `${Math.ceil(seconds / 60)} phút`;
    return `${seconds} giây`;
  }

  startCountdown() {
    this.isLocked = true; 
    
    this.countdownInterval = setInterval(() => {
      const now = Date.now();
      const timeLeft = Math.ceil((this.lockUntil - now) / 1000);

      if (timeLeft > 0) {
        this.generalError = `Tài khoản tạm khóa ${this.formatTimeLeft(timeLeft)} vì nhập sai quá nhiều lần.`;
      } else {
        // Hết phạt
        clearInterval(this.countdownInterval);
        this.resetPenalty(false); 
        this.generalError = '';
        this.isLocked = false;
      }
    }, 1000);
  }

  resetPenalty(fullReset: boolean) {
    localStorage.removeItem('failedAttempts');
    localStorage.removeItem('lockUntil');
    this.failedAttempts = 0;
    this.lockUntil = 0;
    
    if (fullReset) {
      localStorage.removeItem('penaltyLevel');
      this.penaltyLevel = 0;
    }
  }


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
      const validUser = this.fakeUsers.find(
        user => user.email === emailVal && user.password === passVal
      );

      if (validUser) {

        this.resetPenalty(true);
        alert('Đăng nhập thành công! Đang chuyển hướng...');
      } else {
        this.failedAttempts++;
        localStorage.setItem('failedAttempts', this.failedAttempts.toString());

        if (this.failedAttempts >= this.MAX_ATTEMPTS) {
          const penaltySeconds = this.PENALTY_TIERS[this.penaltyLevel];
          this.lockUntil = Date.now() + penaltySeconds * 1000;
          localStorage.setItem('lockUntil', this.lockUntil.toString());

          if (this.penaltyLevel < this.PENALTY_TIERS.length - 1) {
            this.penaltyLevel++;
            localStorage.setItem('penaltyLevel', this.penaltyLevel.toString());
          }

          this.startCountdown();
        } else {
          this.generalError = `Sai tài khoản hoặc mật khẩu! Bạn còn ${this.MAX_ATTEMPTS - this.failedAttempts} lần thử.`;
        }
      }
    }
  }
}