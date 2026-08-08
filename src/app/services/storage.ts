import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  private readonly platformId = inject(PLATFORM_ID);

  private get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }
  setItem<T>(key: string, value: T): void {
    // SSR không có localStorage
    if (!this.isBrowser) {
      return;
    }

    try {
      const json = JSON.stringify(value);
      localStorage.setItem(key, json);
    } catch (error) {
      console.error(
        `[StorageService] Failed to save key "${key}"`,
        error
      );
    }
  }

  /**
   * Đọc dữ liệu từ localStorage.
   */
  getItem<T>(key: string): T | null {
    // SSR không có localStorage
    if (!this.isBrowser) {
      return null;
    }

    try {
      const item = localStorage.getItem(key);

      if (item === null) {
        return null;
      }

      return JSON.parse(item) as T;

    } catch (error) {
      console.error(
        `[StorageService] Failed to read key "${key}"`,
        error
      );

      return null;
    }
  }

  removeItem(key: string): void {
    // SSR không có localStorage
    if (!this.isBrowser) {
      return;
    }

    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(
        `[StorageService] Failed to remove key "${key}"`,
        error
      );
    }
  }

  /**
   * Xóa toàn bộ dữ liệu trong localStorage.
   */
  clear(): void {
    // SSR không có localStorage
    if (!this.isBrowser) {
      return;
    }

    try {
      localStorage.clear();
    } catch (error) {
      console.error(
        '[StorageService] Failed to clear localStorage',
        error
      );
    }
  }
}