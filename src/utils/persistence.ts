type Persistence = {
  setItem(key: string, value: string): Promise<void>;
  getItem(key: string): Promise<string | null>;
  removeItem(key: string): Promise<void>;
  clear(): Promise<void>;
};

function getStorage(): PersistentStorage | Storage {
  if (typeof window !== 'undefined' && (window as any).persistentStorage) {
    return (window as any).persistentStorage;
  }
  // Fallback to localStorage for standard browsers / development
  return {
    setItem(key: string, value: string) {
      localStorage.setItem(key, value);
      return Promise.resolve();
    },
    getItem(key: string) {
      return Promise.resolve(localStorage.getItem(key));
    },
    removeItem(key: string) {
      localStorage.removeItem(key);
      return Promise.resolve();
    },
    clear() {
      localStorage.clear();
      return Promise.resolve();
    },
  };
}

export const persistence: Persistence = {
  setItem(key, value) {
    return getStorage().setItem(key, value) as Promise<void>;
  },
  getItem(key) {
    return getStorage().getItem(key) as Promise<string | null>;
  },
  removeItem(key) {
    return getStorage().removeItem(key) as Promise<void>;
  },
  clear() {
    return getStorage().clear() as Promise<void>;
  },
};
