import { HOOK_NAME, MESSAGE_SOURCE_HOOK } from "./shared";
import {
  RichBrickData,
  BrickNode,
  BrickElement,
  BrickElementConstructor,
  MountPointElement,
  BricksByMountPoint,
  BrickInfo,
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

  function getBrickInfo(uid: number): BrickInfo {
    let properties: Record<string, any> = {};
    let events: string[];
    const element = uidToBrick.get(uid);
    if (["brick", "provider", "custom-element"].includes(element?.$$typeof)) {
      const props: string[] =
        (element.constructor as BrickElementConstructor)
          ._dev_only_definedProperties || [];
      properties = Object.fromEntries(
        props
          .sort()
          .map((propName) => [
            propName,
            element[propName as keyof BrickElement],
          ])
      );
      events = Array.isArray(element.$$eventListeners)
        ? element.$$eventListeners.map((item) => item[0])
        : [];
    }
    return { properties, events };
  }

  const inspector: Record<string, HTMLElement> = {};
  let inspectBoxRemoved = false;

  function showInspectBox(uid: number): void {
    hideInspectBox();
    const element = uidToBrick.get(uid);
    if (!inspector.node) {
      inspector.node = document.createElement("div");
      inspector.border = document.createElement("div");
      inspector.padding = document.createElement("div");
      inspector.content = document.createElement("div");

      Object.assign(inspector.node.style, {
        position: "absolute",
        zIndex: "1000000",
        pointerEvents: "none",
        borderColor: "rgba(255, 155, 0, 0.3)",
      });

      inspector.border.style.borderColor = "rgba(255, 200, 50, 0.3)";
      inspector.padding.style.borderColor = "rgba(77, 200, 0, 0.3)";
      inspector.content.style.backgroundColor = "rgba(120, 170, 210, 0.7)";

      inspector.node.appendChild(inspector.border);
      inspector.border.appendChild(inspector.padding);
      inspector.padding.appendChild(inspector.content);
    }
    const box = element.getBoundingClientRect();
    const dims = getElementDimensions(element);

    boxWrap(inspector.node, dims, "margin");
    boxWrap(inspector.border, dims, "border");
    boxWrap(inspector.padding, dims, "padding");

    Object.assign(inspector.content.style, {
      width: `${
        box.width -
        dims.borderLeft -
        dims.borderRight -
        dims.paddingLeft -
        dims.paddingRight
      }px`,
      height: `${
        box.height -
        dims.borderTop -
        dims.borderBottom -
        dims.paddingTop -
        dims.paddingBottom
      }px`,
    });

    Object.assign(inspector.node.style, {
      top: `${box.top - dims.marginTop + window.scrollY}px`,
      left: `${box.left - dims.marginLeft + window.scrollX}px`,
    });

    document.body.appendChild(inspector.node);
    document.body.addEventListener("mouseenter", hideInspectBox);
    inspectBoxRemoved = false;
  }

  function hideInspectBox(): void {
    if (inspector.node && !inspectBoxRemoved) {
      inspector.node.remove();
      document.body.removeEventListener("mouseenter", hideInspectBox);
      inspectBoxRemoved = true;
    }
  }

  function getElementDimensions(
    domElement: HTMLElement
  ): Record<string, number> {
    const calculatedStyle = window.getComputedStyle(domElement);
    return {
      borderLeft: parseInt(calculatedStyle.borderLeftWidth, 10),
      borderRight: parseInt(calculatedStyle.borderRightWidth, 10),
      borderTop: parseInt(calculatedStyle.borderTopWidth, 10),
      borderBottom: parseInt(calculatedStyle.borderBottomWidth, 10),
      marginLeft: parseInt(calculatedStyle.marginLeft, 10),
      marginRight: parseInt(calculatedStyle.marginRight, 10),
      marginTop: parseInt(calculatedStyle.marginTop, 10),
      marginBottom: parseInt(calculatedStyle.marginBottom, 10),
      paddingLeft: parseInt(calculatedStyle.paddingLeft, 10),
      paddingRight: parseInt(calculatedStyle.paddingRight, 10),
      paddingTop: parseInt(calculatedStyle.paddingTop, 10),
      paddingBottom: parseInt(calculatedStyle.paddingBottom, 10),
    };
  }

  function boxWrap(
    element: HTMLElement,
    dims: Record<string, number>,
    what: string
  ): void {
    Object.assign(element.style, {
      borderTopWidth: dims[what + "Top"] + "px",
      borderLeftWidth: dims[what + "Left"] + "px",
      borderRightWidth: dims[what + "Right"] + "px",
      borderBottomWidth: dims[what + "Bottom"] + "px",
      borderStyle: "solid",
    });
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
    getBrickInfo,
    showInspectBox,
    hideInspectBox,
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
