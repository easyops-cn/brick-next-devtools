import React from "react";
import { Tag } from "@blueprintjs/core";
import { useSelectedBrickContext } from "../libs/SelectedBrickContext";
import { HOOK_NAME } from "../shared";
import { PropTree } from "./PropTree";
import { BrickInfo } from "../libs/interfaces";

// `Function`s can't be passed through `chrome.devtools.inspectedWindow.eval`.
// Use a noop function to mock the event listener.
// istanbul ignore next
function noop(): void {
  // noop
}

export function PropView(): React.ReactElement {
  const { selectedBrick } = useSelectedBrickContext();
  const [brickInfo, setBrickInfo] = React.useState<BrickInfo>({});

  React.useEffect(() => {
    if (selectedBrick) {
      chrome.devtools.inspectedWindow.eval(
        `window.${HOOK_NAME}.getBrickInfo(${selectedBrick.uid})`,
        function (result: BrickInfo, error) {
          // istanbul ignore if
          if (error) {
            console.error("getBrickInfo()", error);
          }

          setBrickInfo(result);
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
        <div className="expanded">
          <PropTree properties={brickInfo?.properties || {}} />
        </div>
        <div style={{ padding: 5 }}>
          <Tag minimal>events</Tag>
        </div>
        <div className="expanded">
          <PropTree
            properties={(brickInfo?.events || []).map((item) => [item, noop])}
          />
        </div>
      </div>
    </div>
  );
}
