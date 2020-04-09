import { HOOK_NAME } from "./shared";
import { RichBrickData } from './libs/interfaces';

function injectHook(): void {
  if (Object.prototype.hasOwnProperty.call(window, HOOK_NAME)) {
    return;
  }

  let uniqueIdCounter = 0;
  function uniqueId(): number {
    return uniqueIdCounter += 1;
  }
  const uidToBrick = new Map<number, HTMLElement>();
  const brickToUid = new WeakMap();

  function inject(brick: HTMLElement, mountPoint: string): void {
    const uid = uniqueId();
    uidToBrick.set(uid, brick);
    brickToUid.set(brick, uid);
  }

  function getBrickByUid(uid: number): HTMLElement {
    return uidToBrick.get(uid);
  }

  function walk(node: any): RichBrickData {
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

  function getMainBricks(): RichBrickData[] {
    uniqueIdCounter = 0;
    const mountPoint = document.querySelector("#main-mount-point") as any;
    return mountPoint.$$rootBricks.map(walk);
  }

  let lastBox: HTMLElement;

  function showBox(uid: number): void {
    hideBox();
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
    lastBox = div;
  }

  function hideBox(): void {
    if (lastBox) {
      lastBox.remove();
      lastBox = undefined;
    }
  }

  const hook = {
    getBrickByUid,
    getMainBricks,
    showBox,
    hideBox
  };

  // let pageHasBricks: boolean;

  Object.defineProperty(hook, "pageHasBricks", {
    get: function() {
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
