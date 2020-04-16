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
  let properties: Record<string, any> = {};
  let events: [string, any][] = [];
  const element = uidToBrick.get(uid);
  if (["brick", "provider", "custom-template"].includes(element?.$$typeof)) {
    const props: string[] =
      (element.constructor as BrickElementConstructor)
        ?._dev_only_definedProperties || [];
    properties = Object.fromEntries(
      props
        .sort()
        .map((propName) => [propName, element[propName as keyof BrickElement]])
    );
    events = Array.isArray(element.$$eventListeners)
      ? element.$$eventListeners.map((item) => [item[0], item[2]])
      : [];
  }
  const repo: any[] = [];
  const info = dehydrate({ properties, events }, repo);
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

  return {
    uid,
    tagName: element.tagName.toLowerCase(),
    children: (node.children?.map(walk) ?? []).filter(Boolean),
  };
}
