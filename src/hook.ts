import { HOOK_NAME, MESSAGE_SOURCE_HOOK } from "./shared";
import { RichBrickData } from './libs/interfaces';

function injectHook(): void {
  if (Object.prototype.hasOwnProperty.call(window, HOOK_NAME)) {
    return;
  }

  let uniqueIdCounter = 0;
  function uniqueId(): number {
    return uniqueIdCounter += 1;
  }
  let uidToBrick = new Map<number, HTMLElement>();
  let brickToUid = new WeakMap<HTMLElement, number>();

  function getBrickByUid(uid: number): HTMLElement {
    return uidToBrick.get(uid);
  }

  function walk(node: any): RichBrickData {
    const brick = node.currentElement;
    const element = brick.element;
    const tagName = element.tagName.toLowerCase();

    const uid = uniqueId();
    uidToBrick.set(uid, element);
    brickToUid.set(element, uid);

    return {
      uid,
      tagName,
      children: node.children.map(walk)
    };
  }

  function getMainBricks(): RichBrickData[] {
    uniqueIdCounter = 0;
    uidToBrick = new Map();
    brickToUid = new WeakMap();
    const mountPoint = document.querySelector("#main-mount-point") as any;
    return mountPoint.$$rootBricks.map(walk);
  }

  function getBrickProperties(uid: number): Record<string, any> {
    let properties: Record<string, any> = {};
    const element = uidToBrick.get(uid) as any;
    if (element?.$$typeof === "brick") {
      const props: string[] = Array.from(element.constructor._dev_only_definedProperties || []);
      properties = Object.fromEntries(props.map((propName) => [
        propName,
        element[propName]
      ]))
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
    window.postMessage({
      source: MESSAGE_SOURCE_HOOK,
      payload
    }, "*");
  }

  const hook = {
    getBrickByUid,
    getMainBricks,
    getBrickProperties,
    showInspectBox,
    hideInspectBox,
    emit
  };

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
