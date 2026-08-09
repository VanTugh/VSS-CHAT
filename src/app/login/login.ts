import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormGroup,
  FormControl,
  Validators
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef
} from '@angular/core';
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

  private lockSubscription?: Subscription;

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
    private lockService: LockService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  // ==========================================
  // INIT
  // ==========================================

  ngOnInit(): void {

    // ------------------------------------------
    // KHỞI TẠO REACTIVE FORM
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

        // Đồng bộ số lần thử
        this.remainingAttempts =
          this.lockService.getRemainingAttempts();

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
          // Không xóa lỗi đăng nhập sai.

          if (this.generalError.includes('tạm khóa')) {
            this.generalError = '';
          }

        }

        // Ép Angular cập nhật giao diện
        this.cdr.detectChanges();

      });

    // ------------------------------------------
    // ĐỒNG BỘ TRẠNG THÁI BAN ĐẦU
    // ------------------------------------------

    this.remainingAttempts =
      this.lockService.getRemainingAttempts();
  }

  // ==========================================
  // DESTROY
  // ==========================================

  ngOnDestroy(): void {

    this.lockSubscription?.unsubscribe();

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

      // Đánh dấu form đã touched

      this.loginForm.markAllAsTouched();

      // Render lỗi ngay lập tức

      this.cdr.detectChanges();

      return;
    }

    // ------------------------------------------
    // LẤY DATA TỪ FORM
    // ------------------------------------------

    const emailVal =
      String(
        this.loginForm.get('email')?.value ?? ''
      ).trim();

    const passVal =
      String(
        this.loginForm.get('password')?.value ?? ''
      ).trim();

    console.log(
      '[Login] Attempt:',
      emailVal
    );

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
        // LOGIN SUCCESS
        // ======================================

        if (isSuccess) {

          console.log(
            '[Login] Login successful'
          );

          // Reset trạng thái lock

          this.lockService
            .resetAfterSuccessfulLogin();

          // Thông báo thành công

          alert(
            'Đăng nhập thành công! Đang chuyển hướng...'
          );

          // --------------------------------------
          // CHUYỂN SANG USER LIST
          // --------------------------------------

          this.router.navigate(['/user-list']);

          return;
        }

        // ======================================
        // LOGIN FAILED
        // ======================================

        console.log(
          '[Login] Login failed'
        );

        // --------------------------------------
        // 1. GHI NHẬN LOGIN SAI
        // --------------------------------------

        this.lockService
          .recordFailedAttempt();

        // --------------------------------------
        // 2. CẬP NHẬT SỐ LẦN THỬ
        // --------------------------------------

        this.remainingAttempts =
          this.lockService.getRemainingAttempts();

        console.log(
          '[Login] Remaining attempts:',
          this.remainingAttempts
        );

        // --------------------------------------
        // 3. KIỂM TRA VỪA BỊ LOCK
        // --------------------------------------

        if (this.isLocked) {

          console.log(
            '[Login] Account is now locked.'
          );

          // LockService sẽ cập nhật
          // generalError thông qua lockState$

          return;
        }

        // --------------------------------------
        // 4. CHƯA BỊ LOCK
        // --------------------------------------

        this.generalError =
          `Tài khoản hoặc mật khẩu không đúng! Bạn còn ${this.remainingAttempts} lần thử.`;

        console.log(
          '[Login] Error message:',
          this.generalError
        );

        // Render lỗi

        this.cdr.detectChanges();

      });

  }

}