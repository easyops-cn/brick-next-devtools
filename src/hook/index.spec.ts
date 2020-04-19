import "./index";
import { HOOK_NAME } from "../shared/constants";
import { getBrickByUid } from "./traverse";
import { inspectElement } from "./inspector";

jest.mock("./traverse");
jest.mock("./inspector");

(getBrickByUid as jest.Mock).mockImplementation((uid) => ({ uid }));

describe("hook", () => {
  it("should inject hook", () => {
    const hook = (window as any)[HOOK_NAME];
    hook.inspectBrick(1);
    expect(inspectElement).toBeCalledWith({ uid: 1 });

    expect(hook.pageHasBricks).toBe(false);
    (window as any).BRICK_NEXT_VERSIONS = {};
    expect(hook.pageHasBricks).toBe(true);
  });
});
