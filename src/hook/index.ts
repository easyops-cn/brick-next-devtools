import { HOOK_NAME } from "../shared/constants";
import { getBricks, getBrickByUid, getBrickInfo } from "./traverse";
import { inspectElement, dismissInspections } from "./inspector";
import { emit } from "./emit";
import { overrideProps } from "./overrideProps";

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
    overrideProps: (uid: number, propertyName: string, value: any) =>
      overrideProps(getBrickByUid(uid), propertyName, value),
    supports: (...features: string[]) =>
      Array.isArray((window as any).BRICK_NEXT_FEATURES)
        ? features.every((item) =>
            (window as any).BRICK_NEXT_FEATURES.includes(item)
          )
        : false,
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
