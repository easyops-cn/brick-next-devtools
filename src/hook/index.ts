import { HOOK_NAME } from "../shared/constants";
import { getBricks, getBrickByUid, getBrickInfo } from "./traverse";
import { inspectElement, dismissInspections } from "./inspector";
import { emit } from "./emit";

function injectHook(): void {
  if (Object.prototype.hasOwnProperty.call(window, HOOK_NAME)) {
    return;
  }

  const hook = {
    getBricks,
    getBrickByUid,
    getBrickInfo,
    inspectBrick: (uid: number) => inspectElement(getBrickByUid(uid)),
    dismissInspections,
    emit,
  };

  Object.defineProperty(hook, "pageHasBricks", {
    get: function () {
      return !!(window as any).BRICK_NEXT_VERSIONS;
    },
  });

  Object.defineProperty(window, HOOK_NAME, {
    get: function () {
      return hook;
    },
  });
}

injectHook();
