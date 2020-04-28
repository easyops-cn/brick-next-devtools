import React from "react";
import { Tag } from "@blueprintjs/core";
import { useSelectedBrickContext } from "../libs/SelectedBrickContext";
import { HOOK_NAME } from "../../shared/constants";
import { BrickInfo, DehydratedBrickInfo } from "../../shared/interfaces";
import { hydrate } from "../libs/hydrate";
import { PropList } from "./PropList";

function isNotEmpty(object: any[] | Record<string, any>): boolean {
  return object
    ? (Array.isArray(object) ? object : Object.keys(object)).length > 0
    : false;
}

const tagsToDisplay: [keyof BrickInfo, string][] = [
  ["nativeProperties", "native properties"],
  ["properties", "properties"],
  ["events", "events"],
];

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

  if (!selectedBrick || !brickInfo) {
    return null;
  }

  return (
    <div className="prop-view source-code">
      <div className="scroll-container">
        {tagsToDisplay
          .filter((entry) => isNotEmpty(brickInfo[entry[0]]))
          .map(([key, tag]) => (
            <React.Fragment key={tag}>
              <div style={{ padding: 5 }}>
                <Tag minimal>{tag}</Tag>
              </div>
              <div className="expanded">
                <PropList list={brickInfo[key]} />
              </div>
            </React.Fragment>
          ))}
      </div>
    </div>
  );
}
