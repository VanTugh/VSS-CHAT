import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormGroup,
  FormControl,
  Validators
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

import { AuthService } from '../services/auth';
import { LockService } from '../services/lock';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class Login implements OnInit, OnDestroy {

  // ==========================================
  // REACTIVE FORM
  // ==========================================

  loginForm!: FormGroup;

  // ==========================================
  // PASSWORD
  // ==========================================

  isPasswordHidden = true;

  // ==========================================
  // LOCK STATE
  // ==========================================

  isLocked = false;
  remainingSeconds = 0;
  remainingAttempts = 5;

  // ==========================================
  // ERROR
  // ==========================================

  emailError = '';
  passwordError = '';
  generalError = '';

  // ==========================================
  // SUBSCRIPTION
  // ==========================================

  private lockSubscription!: Subscription;

  // ==========================================
  // EMAIL REGEX
  // ==========================================

  private readonly emailPattern =
    /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;

  // ==========================================
  // CONSTRUCTOR
  // ==========================================

  constructor(
    private authService: AuthService,
    private lockService: LockService
  ) {}

  // ==========================================
  // INIT
  // ==========================================

  ngOnInit(): void {

    // ------------------------------------------
    // KHỞI TẠO FORM
    // ------------------------------------------

    this.loginForm = new FormGroup({

      email: new FormControl('', [
        Validators.required,
        Validators.pattern(this.emailPattern)
      ]),

      password: new FormControl('', [
        Validators.required
      ])

    });

    // ------------------------------------------
    // LẮNG NGHE LOCK SERVICE
    // ------------------------------------------

    this.lockSubscription =
      this.lockService.lockState$.subscribe(state => {

        this.isLocked = state.isLocked;
        this.remainingSeconds = state.remainingSeconds;

        // --------------------------------------
        // ĐANG BỊ KHÓA
        // --------------------------------------

        if (state.isLocked) {

          this.generalError =
            `Tài khoản tạm khóa. Vui lòng thử lại sau ${state.remainingSeconds} giây.`;

        }

        // --------------------------------------
        // HẾT KHÓA
        // --------------------------------------

        else {

          // Chỉ xóa thông báo khóa.
          // Không đụng vào lỗi "sai tài khoản/mật khẩu".

          if (this.generalError.includes('tạm khóa')) {
            this.generalError = '';
          }

        }

      });

    // ------------------------------------------
    // ĐỒNG BỘ SỐ LẦN THỬ
    // ------------------------------------------

    this.remainingAttempts =
      this.lockService.getRemainingAttempts();
  }

  // ==========================================
  // DESTROY
  // ==========================================

  ngOnDestroy(): void {

    if (this.lockSubscription) {
      this.lockSubscription.unsubscribe();
    }

  }

  // ==========================================
  // TOGGLE PASSWORD
  // ==========================================

  togglePasswordVisibility(): void {

    this.isPasswordHidden =
      !this.isPasswordHidden;

  }

  // ==========================================
  // LOGIN
  // ==========================================

  onLogin(): void {

    console.log('========== LOGIN ==========');

    // ------------------------------------------
    // KIỂM TRA LOCK
    // ------------------------------------------

    if (this.isLocked) {

      console.log(
        '[Login] Login blocked because account is locked.'
      );

      return;
    }

    // ------------------------------------------
    // XÓA LỖI CŨ
    // ------------------------------------------

    this.emailError = '';
    this.passwordError = '';
    this.generalError = '';

    // ------------------------------------------
    // VALIDATE FORM
    // ------------------------------------------

    if (this.loginForm.invalid) {

      console.log('[Login] Form invalid');

      const emailControl =
        this.loginForm.get('email');

      const passwordControl =
        this.loginForm.get('password');

      // EMAIL

      if (emailControl?.hasError('required')) {

        this.emailError =
          'Vui lòng nhập tài khoản hoặc email!';

      }
      else if (emailControl?.hasError('pattern')) {

        this.emailError =
          'Email không đúng định dạng!';

      }

      // PASSWORD

      if (passwordControl?.hasError('required')) {

        this.passwordError =
          'Vui lòng nhập mật khẩu!';

      }

      this.loginForm.markAllAsTouched();

      return;
    }

    // ------------------------------------------
    // LẤY DATA
    // ------------------------------------------

    const emailVal =
      this.loginForm.get('email')?.value?.trim();

    const passVal =
      this.loginForm.get('password')?.value?.trim();

    console.log('[Login] Attempt:', emailVal);

    // ------------------------------------------
    // CALL AUTH SERVICE
    // ------------------------------------------

    this.authService
      .login(emailVal, passVal)
      .subscribe(isSuccess => {

        console.log(
          '[Login] Auth result:',
          isSuccess
        );

        // ======================================
        // SUCCESS
        // ======================================

        if (isSuccess) {

          console.log('[Login] Login successful');

          alert(
            'Đăng nhập thành công! Đang chuyển hướng...'
          );

          this.lockService
            .resetAfterSuccessfulLogin();

          return;
        }

        // ======================================
        // LOGIN FAILED
        // ======================================

        console.log('[Login] Login failed');

        // --------------------------------------
        // TĂNG FAILED ATTEMPT
        // --------------------------------------

        this.lockService.recordFailedAttempt();

        // --------------------------------------
        // CẬP NHẬT REMAINING ATTEMPTS
        // --------------------------------------

        this.remainingAttempts =
          this.lockService.getRemainingAttempts();

        console.log(
          '[Login] Remaining attempts:',
          this.remainingAttempts
        );

        // --------------------------------------
        // NẾU VỪA BỊ LOCK
        // --------------------------------------

        if (this.isLocked) {

          console.log(
            '[Login] Account is now locked.'
          );

          // LockService subscription sẽ tự tạo
          // thông báo:
          //
          // Tài khoản tạm khóa...
          //
          // Không ghi đè generalError ở đây.

          return;
        }

        // --------------------------------------
        // CHƯA BỊ LOCK
        // --------------------------------------

        this.generalError =
          `Tài khoản hoặc mật khẩu không đúng! Bạn còn ${this.remainingAttempts} lần thử.`;

        console.log(
          '[Login] Error message:',
          this.generalError
        );

      });

  }

}