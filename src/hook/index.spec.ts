import "./index";
import { HOOK_NAME } from "../shared/constants";
import { getBrickByUid } from "./traverse";
import { inspectElement } from "./inspector";
import { overrideProps } from "./overrideProps";

jest.mock("./traverse");
jest.mock("./inspector");
jest.mock("./overrideProps");

(getBrickByUid as jest.Mock).mockImplementation((uid) => ({ uid }));

describe("hook", () => {
  it("should inject hook", () => {
    const hook = (window as any)[HOOK_NAME];
    hook.inspectBrick(1);
    expect(inspectElement).toBeCalledWith({ uid: 1 });

    hook.overrideProps(1, "propName", "propValue");
    expect(overrideProps).toBeCalledWith({ uid: 1 }, "propName", "propValue");

    expect(hook.pageHasBricks).toBe(false);
    (window as any).BRICK_NEXT_VERSIONS = {};
    expect(hook.pageHasBricks).toBe(true);
    expect(hook.supports("good")).toBe(false);
    (window as any).BRICK_NEXT_FEATURES = ["good", "better"];
    expect(hook.supports("good")).toBe(true);
    expect(hook.supports("good", "better")).toBe(true);
    expect(hook.supports("good", "bad")).toBe(false);
    expect(hook.supports("bad")).toBe(false);
  });
});
