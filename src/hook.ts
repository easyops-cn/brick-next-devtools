import { HOOK_NAME, MESSAGE_SOURCE_HOOK } from "./shared";
import {
  RichBrickData,
  BrickNode,
  BrickElement,
  BrickElementConstructor,
  MountPointElement,
  BricksByMountPoint,
} from "./libs/interfaces";

function injectHook(): void {
  if (Object.prototype.hasOwnProperty.call(window, HOOK_NAME)) {
    return;
  }

  let uniqueIdCounter = 0;
  function uniqueId(): number {
    return (uniqueIdCounter += 1);
  }
  let uidToBrick = new Map<number, BrickElement>();
  // let brickToUid = new WeakMap<BrickElement, number>();

  function getBrickByUid(uid: number): BrickElement {
    return uidToBrick.get(uid);
  }

  function walk(node: BrickNode): RichBrickData {
    const element = node.$$brick?.element;
    if (!element) {
      return;
    }

    const uid = uniqueId();
    uidToBrick.set(uid, element);
    // brickToUid.set(element, uid);

    return {
      uid,
      tagName: element.tagName.toLowerCase(),
      children: (node.children?.map(walk) ?? []).filter(Boolean),
    };
  }

  function getMainBricks(): RichBrickData[] {
    uniqueIdCounter = 0;
    uidToBrick = new Map();
    // brickToUid = new WeakMap();
    const mountPoint =
      document.querySelector("#main-mount-point") as MountPointElement;
    return (mountPoint?.$$rootBricks?.map(walk) ?? []).filter(Boolean);
  }

  function getBricks(): BricksByMountPoint {
    uniqueIdCounter = 0;
    uidToBrick = new Map();
    // brickToUid = new WeakMap();
    return {
      main: getBricksByMountPoint("#main-mount-point"),
      bg: getBricksByMountPoint("#bg-mount-point"),
    };
  }

  function getBricksByMountPoint(mountPoint: string): RichBrickData[] {
    const element = document.querySelector(mountPoint) as MountPointElement;
    return (element?.$$rootBricks?.map(walk) ?? []).filter(Boolean);
  }

  function getBrickProperties(uid: number): Record<string, any> {
    let properties: Record<string, any> = {};
    const element = uidToBrick.get(uid);
    if (["brick", "provider", "custom-element"].includes(element?.$$typeof)) {
      const props: string[] = Array.from(
        (element.constructor as BrickElementConstructor)
          ._dev_only_definedProperties || []
      );
      properties = Object.fromEntries(
        props
          .sort()
          .map((propName) => [
            propName,
            element[propName as keyof BrickElement],
          ])
      );
    }
    return properties;
  }

  let inspectBox: HTMLElement;
  let inspectBoxRemoved = false;

  function showInspectBox(uid: number): void {
    hideInspectBox();
    const element = uidToBrick.get(uid);
    if (!inspectBox) {
      inspectBox = document.createElement("div");
      inspectBox.style.position = "absolute";
      inspectBox.style.zIndex = "1000000";
      inspectBox.style.backgroundColor = "rgba(0,0,0,0.2)";
    }
    const box = element.getBoundingClientRect();
    inspectBox.style.top = `${box.top + window.scrollY}px`;
    inspectBox.style.left = `${box.left + window.scrollX}px`;
    inspectBox.style.width = `${box.width}px`;
    inspectBox.style.height = `${box.height}px`;
    document.body.appendChild(inspectBox);
    inspectBoxRemoved = false;
  }

  function hideInspectBox(): void {
    if (inspectBox && !inspectBoxRemoved) {
      inspectBox.remove();
      inspectBoxRemoved = true;
    }
  }

  function emit(payload: any): void {
    window.postMessage(
      {
        source: MESSAGE_SOURCE_HOOK,
        payload,
      },
      "*"
    );
  }

  const hook = {
    getBrickByUid,
    getBricks,
    getMainBricks,
    getBrickProperties,
    showInspectBox,
    hideInspectBox,
    emit,
  };

  Object.defineProperty(hook, "pageHasBricks", {
    get: function () {
      return !!(window as any).BRICK_NEXT_VERSIONS;
      // return Array.isArray((document.querySelector("#main-mount-point") as MountPointElement)?.$$rootBricks);
    },
  });

  Object.defineProperty(window, HOOK_NAME, {
    get: function () {
      return hook;
    },
  });
}

injectHook();
