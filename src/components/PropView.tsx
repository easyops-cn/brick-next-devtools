import React from "react";
import { Classes, ITreeNode, Tree, Tag } from "@blueprintjs/core";
import { useSelectedBrickContext } from "../libs/SelectedBrickContext";
import { HOOK_NAME } from "../shared";

interface UniqueContext {
  uniqueId: number;
}

export function PropView(): React.ReactElement {
  const { selectedBrick } = useSelectedBrickContext();
  const [propNodes, setPropNodes] = React.useState<ITreeNode<void>[]>([]);

  React.useEffect(() => {
    if (selectedBrick) {
      chrome.devtools.inspectedWindow.eval(
        `window.${HOOK_NAME}.getBrickProperties(${selectedBrick.uid})`,
        function (result: Record<string, any>, error) {
          if (error) {
            console.error("getBrickProperties()", error);
            return;
          }

          const ctx: UniqueContext = {
            uniqueId: 0,
          };
          setPropNodes(
            Object.entries(result).map(([key, value]) =>
              PropNodeFactory(key, value, ctx)
            )
          );
        }
      );
    }
  }, [selectedBrick]);

  if (!selectedBrick) {
    return null;
  }

  return (
    <div className="prop-view source-code">
      <div className="scroll-container">
        <div style={{ padding: 5 }}>
          <Tag minimal>properties</Tag>
        </div>
        <Tree contents={propNodes} />
      </div>
    </div>
  );
}

function PropNodeFactory(
  key: string | number,
  value: any,
  ctx: UniqueContext
): ITreeNode<void> {
  const childNodes = Array.isArray(value)
    ? value.map((v, i) => PropNodeFactory(i, v, ctx))
    : typeof value === "object" && value !== null
    ? Object.entries(value).map(([k, v]) => PropNodeFactory(k, v, ctx))
    : [];
  return {
    id: ctx.uniqueId += 1,
    label: (
      <span>
        <code>{`${key}`}</code>: <code>{PropValueFactory(value)}</code>
      </span>
    ),
    hasCaret: childNodes.length > 0,
    isExpanded: true,
    childNodes,
  };
}

function PropValueFactory(value: any): string {
  if (Array.isArray(value)) {
    const elements = [];
    for (const item of value.slice(0, 3)) {
      if (Array.isArray(item)) {
        elements.push(`Array(${item.length})`);
      } else if (typeof item === "object" && item !== null) {
        elements.push("{…}");
      } else {
        elements.push(String(item));
      }
    }
    if (value.length > 3) {
      elements.push("…");
    }
    return `[${elements.join(", ")}]`;
  }

  if (typeof value === "object" && value !== null) {
    const elements = [];
    const entries = Object.entries(value);
    for (const [k, v] of entries.slice(0, 3)) {
      const pair = [k];
      if (Array.isArray(v)) {
        pair.push(`Array(${v.length})`);
      } else if (typeof v === "object" && v !== null) {
        pair.push("{…}");
      } else {
        pair.push(String(v));
      }
      elements.push(pair.join(": "));
    }

    if (entries.length > 3) {
      elements.push("…");
    }
    return `{${elements.join(", ")}}`;
  }

  return String(value);
}
