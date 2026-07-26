interface PersistentStorage {
  setItem(key: string, value: string): Promise<void>;
  getItem(key: string): Promise<string | null>;
  removeItem(key: string): Promise<void>;
  clear(): Promise<void>;
}

interface Window {
  /** Optional host-provided storage; falls back to localStorage when absent. */
  persistentStorage?: PersistentStorage;
}
