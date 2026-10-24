/**
 * LocalStorage privacy helper
 * All cycle and health tracking data remains completely private on the user's device.
 */

const STORAGE_PREFIX = 'luna_health_';

export const storage = {
  get: <T>(key: string, defaultValue: T): T => {
    try {
      const item = window.localStorage.getItem(STORAGE_PREFIX + key);
      return item ? (JSON.parse(item) as T) : defaultValue;
    } catch {
      return defaultValue;
    }
  },

  set: <T>(key: string, value: T): void => {
    try {
      window.localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
    } catch (e) {
      console.error('Local storage write failed:', e);
    }
  },

  remove: (key: string): void => {
    try {
      window.localStorage.removeItem(STORAGE_PREFIX + key);
    } catch (e) {
      console.error('Local storage removal failed:', e);
    }
  },

  clearAll: (): void => {
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        if (key && key.startsWith(STORAGE_PREFIX)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((k) => window.localStorage.removeItem(k));
    } catch (e) {
      console.error('Local storage clear failed:', e);
    }
  },
};
