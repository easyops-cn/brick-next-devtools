import {
  BrickElement,
  BrickElementConstructor,
  DehydratedBrickInfo,
  BricksByMountPoint,
  RichBrickData,
  MountPointElement,
  BrickNode,
} from "../shared/interfaces";
import { dehydrate } from "./dehydrate";

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
  const info = dehydrate({ nativeProperties, properties, events }, repo);
  return { info, repo };
}

function getBricksByMountPoint(mountPoint: string): RichBrickData[] {
  const element = document.querySelector(mountPoint) as MountPointElement;
  return (element?.$$rootBricks?.map(walk) ?? []).filter(Boolean);
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
