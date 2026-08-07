import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  setItem<T>(key: string, value: T): void {
    try {
      const json = JSON.stringify(value);
      localStorage.setItem(key, json);
    } catch (error) {
      console.error(`[StorageService] Failed to save key "${key}"`, error);
    }
  }

  getItem<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);

      if (item === null) {
        return null;
      }

      return JSON.parse(item) as T;
    } catch (error) {
      console.error(`[StorageService] Failed to read key "${key}"`, error);
      return null;
    }
  }

  removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`[StorageService] Failed to remove key "${key}"`, error);
    }
  }

  clear(): void {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('[StorageService] Failed to clear localStorage', error);
    }
  }

}