import {
  BrickElement,
  BrickElementConstructor,
  DehydratedBrickInfo,
  BricksByMountPoint,
  RichBrickData,
  MountPointElement,
  BrickNode,
  BrickInfo,
} from "../shared/interfaces";
import { dehydrate } from "./dehydrate";

function isV3OrAbove(): boolean {
  const { "brick-container": version } = window.BRICK_NEXT_VERSIONS ?? {};
  return Number(version?.split(".")[0] ?? 2) >= 3;
}

let uniqueIdCounter = 0;
function uniqueId(): number {
  return (uniqueIdCounter += 1);
}
let uidToBrick = new Map<number, BrickElement>();
// let brickToUid = new WeakMap<BrickElement, number>();

export function getBrickByUid(uid: number): BrickElement {
  return uidToBrick.get(uid);
}

export function getBricks(): BricksByMountPoint {
  uniqueIdCounter = 0;
  uidToBrick = new Map();
  // brickToUid = new WeakMap();
  return {
    main: getBricksByMountPoint("#main-mount-point"),
    portal: getBricksByMountPoint("#portal-mount-point"),
    bg: getBricksByMountPoint("#bg-mount-point"),
  };
}

export function getBrickInfo(uid: number): DehydratedBrickInfo {
  const nativeProperties: Record<string, any> = {};
  let properties: Record<string, any> = {};
  let events: [string, any][] = [];
  let tplState: Record<string, unknown> | undefined;
  const element = uidToBrick.get(uid);
  if (element) {
    if (element.id) {
      nativeProperties.id = element.id;
    }
    if (element.hidden) {
      nativeProperties.hidden = element.hidden;
    }
    if (element.slot) {
      nativeProperties.slot = element.slot;
    }
    if (element.tagName.includes(".TPL-")) {
      const tplContextId =
        element.dataset[isV3OrAbove() ? "tplStateStoreId" : "tplContextId"];
      if (tplContextId) {
        tplState = getContext(tplContextId);
      }
    }
    if (isBrickElement(element)) {
      const props: string[] =
        (element.constructor as BrickElementConstructor)
          ?._dev_only_definedProperties || [];
      properties = Object.fromEntries(
        props
          .sort()
          .map((propName) => [
            propName,
            element[propName as keyof BrickElement],
          ])
      );
      events = Array.isArray(element.$$eventListeners)
        ? element.$$eventListeners.map((item) => [item[0], item[2]])
        : [];
    }
  }
  const repo: any[] = [];
  const originalInfo: BrickInfo = { nativeProperties, properties, events };
  if (tplState) {
    originalInfo.tplState = tplState;
  }
  const info = dehydrate(originalInfo, repo);
  return { info, repo };
}

function getBricksByMountPoint(mountPoint: string): RichBrickData[] {
  const element = document.querySelector(mountPoint);
  if (isV3OrAbove()) {
    return element ? [...element.children].map(traverseV3).filter(Boolean) : [];
  }
  return ((element as MountPointElement)?.$$rootBricks?.map(walk) ?? []).filter(
    Boolean
  );
}

function traverseV3(element: Element): RichBrickData {
  if (!element || !(element as HTMLElement).dataset?.iid) {
    return;
  }

  const uid = uniqueId();
  uidToBrick.set(uid, element as BrickElement);
  // brickToUid.set(element, uid);
  const tagName = element.tagName.toLowerCase();

  return {
    uid,
    tagName,
    invalid: tagName.includes("-") && !customElements.get(tagName),
    children: [...element.children].map(traverseV3).filter(Boolean),
  };
}

function walk(node: BrickNode): RichBrickData {
  const element = node.$$brick?.element;
  if (!element) {
    return;
  }

  const uid = uniqueId();
  uidToBrick.set(uid, element);
  // brickToUid.set(element, uid);
  const tagName = element.tagName.toLowerCase();

  return {
    uid,
    tagName,
    invalid: tagName.includes("-") && !customElements.get(tagName),
    children:
      isBrickElement(element) && !node.children?.length
        ? findUsedBricks(element, [])
        : (node.children?.map(walk) ?? []).filter(Boolean),
  };
}

function isBrickElement(element: Element): element is BrickElement {
  if (isV3OrAbove()) {
    const tagName = element.tagName.toLowerCase();
    return !!customElements.get(tagName);
  }
  return ["brick", "provider", "custom-template"].includes(
    (element as BrickElement).$$typeof
  );
}

function isUsedBrick(element: Element): element is BrickElement {
  return ["brick", "provider", "custom-template", "native", "invalid"].includes(
    (element as BrickElement).$$typeof
  );
}

function findUsedBricks(
  element: Element,
  bricks: RichBrickData[]
): RichBrickData[] {
  for (const child of element.children) {
    if (isUsedBrick(child)) {
      const uid = uniqueId();
      uidToBrick.set(uid, child as BrickElement);
      const brick = {
        uid,
        tagName: child.tagName.toLocaleLowerCase(),
        invalid: child.$$typeof === "invalid",
        children: findUsedBricks(child, []),
      };
      bricks.push(brick);
    } else {
      findUsedBricks(child, bricks);
    }
  }
  if (bricks.length > 0) {
    return [
      {
        uid: uniqueId(),
        includesInternalBricks: true,
        children: bricks,
      },
    ];
  }
  return [];
}

export function getContext(
  tplContextId?: string
): Record<string, unknown> | null {
  if (
    isV3OrAbove() &&
    typeof window.__dev_only_getAllContextValues === "function"
  ) {
    return window.__dev_only_getAllContextValues({
      tplStateStoreId: tplContextId,
    });
  }

  const { dll } = window;
  if (typeof dll === "function") {
    return Object.fromEntries(
      [...dll("tYg3").developHelper.getAllContextValues({ tplContextId })]
        .map(([key, { value }]) => [key, value])
        .sort(([k1], [k2]) => (k1 > k2 ? 1 : -1))
    );
  }

  return null;
}
