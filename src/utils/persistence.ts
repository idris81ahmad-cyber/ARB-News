type Persistence = {
  setItem(key: string, value: string): Promise<void>;
  getItem(key: string): Promise<string | null>;
  removeItem(key: string): Promise<void>;
  clear(): Promise<void>;
};

function createLocalStorageAdapter(): Persistence {
  return {
    async setItem(key, value) {
      localStorage.setItem(key, value);
    },
    async getItem(key) {
      return localStorage.getItem(key);
    },
    async removeItem(key) {
      localStorage.removeItem(key);
    },
    async clear() {
      localStorage.clear();
    },
  };
}

function getStorage(): Persistence {
  if (typeof window !== 'undefined' && window.persistentStorage) {
    return window.persistentStorage;
  }
  return createLocalStorageAdapter();
}

export const persistence: Persistence = {
  setItem(key, value) {
    return getStorage().setItem(key, value);
  },
  getItem(key) {
    return getStorage().getItem(key);
  },
  removeItem(key) {
    return getStorage().removeItem(key);
  },
  clear() {
    return getStorage().clear();
  },
};

export function parseJsonSafe<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}
