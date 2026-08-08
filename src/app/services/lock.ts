import { Injectable } from '@angular/core';
import { BehaviorSubject, takeWhile, interval, endWith, map } from 'rxjs';
import { StorageService } from './storage';
interface LockState {
  isLocked: boolean;
  remainingSeconds: number;
}

@Injectable({
  providedIn: 'root'
})
export class LockService {
  private failedAttempts = 0;
  private penaltyLevel = 0;
  private lockUntil = 0;

  private readonly MAX_ATTEMPTS = 5;
  private readonly PENALTY_TIERS = [30, 300, 3600, 86400, 999999999];

  private currentLockStateSubject = new BehaviorSubject<LockState>({
    isLocked: false,
    remainingSeconds: 0
  });

  public lockState$ = this.currentLockStateSubject.asObservable();

  constructor(private storageService: StorageService) {
    this.syncLockStatus();
  }

  private syncLockStatus(): void {
    const failedAttemptsStorage = this.storageService.getItem<number>('failedAttempts');
    const penaltyLevelStorage = this.storageService.getItem<number>('penaltyLevel');
    const lockUntilStorage = this.storageService.getItem<number>('lockUntil');

    this.failedAttempts = failedAttemptsStorage ?? 0;
    this.penaltyLevel = penaltyLevelStorage ?? 0;
    this.lockUntil = lockUntilStorage ?? 0;

    if (this.lockUntil > Date.now()) {
      const remainingSeconds = Math.ceil((this.lockUntil - Date.now()) / 1000);
      this.currentLockStateSubject.next({ isLocked: true, remainingSeconds });
      this.startCountdown();
    } else {
      if (this.lockUntil !== 0) {
        this.failedAttempts = 0;
        this.lockUntil = 0;
        this.storageService.setItem('failedAttempts', 0);
        this.storageService.setItem('lockUntil', 0);
      }
      this.currentLockStateSubject.next({ isLocked: false, remainingSeconds: 0 });
    }
  }

  getRemainingAttempts(): number {
    return Math.max(0, this.MAX_ATTEMPTS - this.failedAttempts);
  }

  recordFailedAttempt(): void {
    const currentState = this.currentLockStateSubject.value;
    if (currentState.isLocked) {
      return;
    }

    this.failedAttempts++;
    this.storageService.setItem('failedAttempts', this.failedAttempts);

    if (this.failedAttempts >= this.MAX_ATTEMPTS) {
      const penaltyDuration = this.PENALTY_TIERS[this.penaltyLevel] * 1000;
      this.lockUntil = Date.now() + penaltyDuration;

      this.penaltyLevel = Math.min(
        this.penaltyLevel + 1,
        this.PENALTY_TIERS.length - 1
      );

      this.storageService.setItem('penaltyLevel', this.penaltyLevel);
      this.storageService.setItem('lockUntil', this.lockUntil);

      const remainingSeconds = Math.ceil(penaltyDuration / 1000);
      this.currentLockStateSubject.next({ isLocked: true, remainingSeconds });
      this.startCountdown();
    } else {
      this.currentLockStateSubject.next({ isLocked: false, remainingSeconds: 0 });
    }
  }

  resetAfterSuccessfulLogin(): void {
    this.failedAttempts = 0;
    this.penaltyLevel = 0;
    this.lockUntil = 0;

    this.storageService.setItem('failedAttempts', 0);
    this.storageService.setItem('penaltyLevel', 0);
    this.storageService.setItem('lockUntil', 0);

    this.currentLockStateSubject.next({ isLocked: false, remainingSeconds: 0 });
  }
  private startCountdown(): void {
    interval(1000).pipe(
      map(() => Math.ceil((this.lockUntil - Date.now()) / 1000)),
      takeWhile(remainingSeconds => remainingSeconds > 0),
      endWith(0)
    ).subscribe(remainingSeconds => {
      if (remainingSeconds > 0) {
        this.currentLockStateSubject.next({ isLocked: true, remainingSeconds });
      } else {
        this.failedAttempts = 0;
        this.storageService.setItem('failedAttempts', 0);
        this.currentLockStateSubject.next({ isLocked: false, remainingSeconds: 0 });
        this.lockUntil = 0;
        this.storageService.setItem('lockUntil', 0);
     }
    });
  }
}