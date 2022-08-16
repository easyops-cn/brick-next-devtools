class JsonStorage<U = Record<string, any>> {
  constructor(private storage: Storage) {}

  setItem<T extends string & keyof U>(name: T, value: U[T]): void {
    this.storage.setItem(name, JSON.stringify(value));
  }

  getItem<T extends string & keyof U>(name: T): U[T] {
    const value = this.storage.getItem(name);
    if (value === null) {
      return null;
    }
    try {
      return JSON.parse(value) as U[T];
    } catch (e) {
      return null;
    }
  }

  removeItem<T extends string & keyof U>(name: T): void {
    return this.storage.removeItem(name);
  }

  clear(): void {
    return this.storage.clear();
  }
}

export const Storage = new JsonStorage(sessionStorage);

export const LocalJsonStorage = new JsonStorage(localStorage);
