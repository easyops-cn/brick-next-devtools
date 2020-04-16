function setItem(key: string, value: any): void {
  sessionStorage.setItem(key, JSON.stringify(value));
}

function getItem(key: string): any {
  const value = sessionStorage.getItem(key);
  if (value === null) {
    return null;
  }
  try {
    return JSON.parse(value);
  } catch (e) {
    return null;
  }
}

function removeItem(key: string): void {
  sessionStorage.removeItem(key);
}

function clear(): void {
  sessionStorage.clear();
}

export const Storage = {
  setItem,
  getItem,
  removeItem,
  clear,
};
