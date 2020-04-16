import { Storage } from "./Storage";

describe("Storage", () => {
  it("should work", () => {
    const key = "quality";
    expect(Storage.getItem(key)).toBe(null);
    Storage.setItem(key, { for: "good" });
    expect(Storage.getItem(key)).toMatchObject({ for: "good" });
    Storage.removeItem(key);
    expect(Storage.getItem(key)).toBe(null);
    Storage.setItem(key, { for: "better" });
    expect(Storage.getItem(key)).toMatchObject({ for: "better" });
    sessionStorage.setItem("yo", "oops");
    expect(Storage.getItem("yo")).toBe(null);
    Storage.clear();
    expect(Storage.getItem(key)).toBe(null);
  });
});
