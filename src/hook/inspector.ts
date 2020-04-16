const inspector: Record<string, HTMLElement> = {};
let inspectBoxRemoved = false;

export function inspectElement(element: HTMLElement): void {
  dismissInspections();
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
  document.body.addEventListener("mouseenter", dismissInspections);
  inspectBoxRemoved = false;
}

export function dismissInspections(): void {
  if (inspector.node && !inspectBoxRemoved) {
    inspector.node.remove();
    document.body.removeEventListener("mouseenter", dismissInspections);
    inspectBoxRemoved = true;
  }
}

function getElementDimensions(domElement: HTMLElement): Record<string, number> {
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
