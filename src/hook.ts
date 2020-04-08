import { HOOK_NAME } from "./shared";

function injectHook(): void {
  if (Object.prototype.hasOwnProperty.call(window, HOOK_NAME)) {
    return;
  }

  let uniqueIdCounter = 0;
  function uniqueId(): number {
    return uniqueIdCounter += 1;
  }
  // const uidListByMountPoint = new Map<string, number[]>();
  const uidToBrick = new Map<number, HTMLElement>();
  const brickToUid = new WeakMap();

  function inject(brick: HTMLElement, mountPoint: string): void {
    const uid = uniqueId();
    // if (uidListByMountPoint.has(mountPoint)) {
    //   uidListByMountPoint.get(mountPoint).push(uid);
    // } else {
    //   uidListByMountPoint.set(mountPoint, [uid]);
    // }
    uidToBrick.set(uid, brick);
    brickToUid.set(brick, uid);
  }

  function getBrickByUid(uid: number): HTMLElement {
    return uidToBrick.get(uid);
  }

  // function getBricksByMountPoint(mountPoint: string): string[] {
  //   return uidListByMountPoint.has(mountPoint) ?
  //   uidListByMountPoint.get(mountPoint).map(uid =>
  //     uidToBrick.get(uid).tagName.toLowerCase()
  //   ) : [];
  // }

  function walk(node: any): any {
    const brick = node.currentElement;
    const element = brick.element;
    const tagName = element.tagName.toLowerCase();
    inject(element, "main");

    let properties: Record<string, any> = {};
    if (element.$$typeof === "brick") {
      const props: string[] = Array.from(element.constructor._dev_only_definedProperties || []);
      properties = Object.fromEntries(props.map((propName) => [
        propName,
        element[propName]
      ]))
    }

    return {
      uid: brickToUid.get(element),
      tagName,
      properties,
      children: node.children.map(walk)
    };
  }

  function getMainBricks(): any {
    const mountPoint = document.querySelector("#main-mount-point") as any;
    return mountPoint.$$rootBricks.map(walk);
  }

  const uidToBox = new Map();

  function showBox(uid: number): void {
    // Array.from(uidToBox.values()).forEach(element => {
    //   element.remove()
    // });
    const element = uidToBrick.get(uid);
    const div = document.createElement("div");
    div.style.position = "absolute";
    div.style.zIndex = "1000000";
    div.style.backgroundColor = "rgba(0,0,0,0.2)";
    const box = element.getBoundingClientRect();
    div.style.top = `${box.top}px`;
    div.style.left = `${box.left}px`;
    div.style.width = `${box.width}px`;
    div.style.height = `${box.height}px`;
    document.body.appendChild(div);
    uidToBox.set(uid, div);
  }

  function hideBox(uid: number): void {
    if (uidToBox.has(uid)) {
      uidToBox.get(uid).remove();
    }
  }

  const hook = {
    // uidListByMountPoint,
    // uidToBrick,
    // brickToUid,
    // inject,
    getBrickByUid,
    // getBricksByMountPoint,
    getMainBricks,
    showBox,
    hideBox
  };

  // let pageHasBricks: boolean;

  Object.defineProperty(hook, "pageHasBricks", {
    get: function() {
      // if (pageHasBricks == undefined) {
      //   pageHasBricks = Array.isArray((document.querySelector("#main-mount-point") as any)?.$$rootBricks);
      // }
      // return pageHasBricks;
      return Array.isArray((document.querySelector("#main-mount-point") as any)?.$$rootBricks);
    }
  });

  Object.defineProperty(window, HOOK_NAME, {
    get: function(){
      return hook;
    }
  });
}

injectHook();
