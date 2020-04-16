import React from "react";
import { Tag } from "@blueprintjs/core";
import { useSelectedBrickContext } from "../libs/SelectedBrickContext";
import { HOOK_NAME } from "../../shared/constants";
import { BrickInfo, DehydratedBrickInfo } from "../../shared/interfaces";
import { hydrate } from "../libs/hydrate";
import { PropList } from "./PropList";

export function PropView(): React.ReactElement {
  const { selectedBrick } = useSelectedBrickContext();
  const [brickInfo, setBrickInfo] = React.useState<BrickInfo>({});

  React.useEffect(() => {
    if (selectedBrick) {
      chrome.devtools.inspectedWindow.eval(
        `window.${HOOK_NAME}.getBrickInfo(${selectedBrick.uid})`,
        function (result: DehydratedBrickInfo, error) {
          // istanbul ignore if
          if (error) {
            console.error("getBrickInfo()", error, result);
          }

          setBrickInfo(hydrate(result.info, result.repo));
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
          <PropList list={brickInfo?.properties || {}} />
        </div>
        <div style={{ padding: 5 }}>
          <Tag minimal>events</Tag>
        </div>
        <div className="expanded">
          <PropList list={brickInfo?.events || []} />
        </div>
      </div>
    </div>
  );
}
