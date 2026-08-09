import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormGroup,
  FormControl,
  Validators
} from '@angular/forms';
import { RouterLink } from '@angular/router';
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
  loginForm!: FormGroup;
  isPasswordHidden = true;
  isLocked = false;
  remainingSeconds = 0;
  remainingAttempts = 5;
  emailError = '';
  passwordError = '';
  generalError = '';
  private lockSubscription?: Subscription;
  private readonly emailPattern =
    /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  constructor(
    private authService: AuthService,
    private lockService: LockService,
    private cdr: ChangeDetectorRef
  ) {}
  ngOnInit(): void {
    this.loginForm = new FormGroup({

      email: new FormControl('', [
        Validators.required,
        Validators.pattern(this.emailPattern)
      ]),

      password: new FormControl('', [
        Validators.required
      ])

    });
    this.lockSubscription =
      this.lockService.lockState$.subscribe(state => {

        this.isLocked = state.isLocked;
        this.remainingSeconds = state.remainingSeconds;

        // Đồng bộ số lần thử với LockService
        this.remainingAttempts =
          this.lockService.getRemainingAttempts();
        if (state.isLocked) {

          this.generalError =
            `Tài khoản tạm khóa. Vui lòng thử lại sau ${state.remainingSeconds} giây.`;
        }

        else {

          /*
           * Chỉ xóa thông báo "tạm khóa".
           *
           * Không xóa generalError khác,
           * ví dụ:
           * "Tài khoản hoặc mật khẩu không đúng!"
           */

          if (this.generalError.includes('tạm khóa')) {
            this.generalError = '';
          }

        }

        /*
         * Trong project hiện tại, thay đổi từ LockService
         * cần ép Angular cập nhật giao diện ngay lập tức.
         */
        this.cdr.detectChanges();
      });

    // ĐỒNG BỘ TRẠNG THÁI BAN ĐẦU
    this.remainingAttempts =
      this.lockService.getRemainingAttempts();
  }
  // DESTROY

  ngOnDestroy(): void {

    this.lockSubscription?.unsubscribe();

  }
  // TOGGLE PASSWORD
  togglePasswordVisibility(): void {

    this.isPasswordHidden =
      !this.isPasswordHidden;

  }
  // LOGIN

  onLogin(): void {

    console.log('========== LOGIN ==========');
    if (this.isLocked) {

      console.log(
        '[Login] Login blocked because account is locked.'
      );

      return;
    }

    this.emailError = '';
    this.passwordError = '';
    this.generalError = '';
    if (this.loginForm.invalid) {

      console.log('[Login] Form invalid');

      const emailControl =
        this.loginForm.get('email');

      const passwordControl =
        this.loginForm.get('password');
      if (emailControl?.hasError('required')) {

        this.emailError =
          'Vui lòng nhập tài khoản hoặc email!';

      }
      else if (emailControl?.hasError('pattern')) {

        this.emailError =
          'Email không đúng định dạng!';

      }
      if (passwordControl?.hasError('required')) {

        this.passwordError =
          'Vui lòng nhập mật khẩu!';

      }
      this.loginForm.markAllAsTouched();

      /*
       * Ép Angular render lỗi validation
       * ngay lập tức.
       */
      this.cdr.detectChanges();

      return;
    }
    // LẤY DATA TỪ FORM
    const emailVal =
      String(
        this.loginForm.get('email')?.value ?? ''
      ).trim();

    const passVal =
      String(
        this.loginForm.get('password')?.value ?? ''
      ).trim();

    console.log('[Login] Attempt:', emailVal);
    // CALL AUTH SERVICE

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

          alert(
            'Đăng nhập thành công! Đang chuyển hướng...'
          );

          // Reset toàn bộ trạng thái lock
          this.lockService
            .resetAfterSuccessfulLogin();

          /*
           * Sau này có thể chuyển trang:
           *
           * this.router.navigate(['/dashboard']);
           */

          return;
        }

        // ======================================
        // LOGIN FAILED
        // ======================================

        console.log(
          '[Login] Login failed'
        );

        // --------------------------------------
        // 1. GHI NHẬN LẦN ĐĂNG NHẬP SAI
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

          /*
           * LockService đã phát lockState mới.
           * Subscription ở ngOnInit() sẽ tự hiển thị:
           *
           * "Tài khoản tạm khóa..."
           */

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

        /*
         * Đây là detectChanges() quan trọng.
         *
         * Nó đảm bảo thông báo lỗi login
         * được render lên HTML ngay sau khi
         * AuthService trả về false.
         */
        this.cdr.detectChanges();

      });
  }
}