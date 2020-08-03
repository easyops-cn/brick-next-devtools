import React from "react";
import { Tag, Button, Tooltip } from "@blueprintjs/core";
import { useSelectedBrickContext } from "../libs/SelectedBrickContext";
import { HOOK_NAME } from "../../shared/constants";
import { BrickInfo, DehydratedBrickInfo } from "../../shared/interfaces";
import { hydrate } from "../libs/hydrate";
import { PropList } from "./PropList";

const copyToClipboard = (text: string): void => {
  // istanbul ignore next
  const listener = (e: ClipboardEvent) => {
    e.stopPropagation();
    const clipboard = e.clipboardData;
    clipboard.clearData();
    clipboard.setData("text", text);
    e.preventDefault();
  };
  document.addEventListener("copy", listener);
  document.execCommand("copy");
  document.removeEventListener("copy", listener);
};

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

  const handleBrickInfoChange = React.useCallback(() => {
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
  }, [selectedBrick]);

  React.useEffect(() => {
    if (selectedBrick) {
      handleBrickInfoChange();
    }
  }, [selectedBrick, handleBrickInfoChange]);

  const overrideProps = React.useCallback(
    (propName: string, propValue: string) => {
      // istanbul ignore else
      if (selectedBrick) {
        const evalParams = `window.${HOOK_NAME}.overrideProps(${selectedBrick.uid},"${propName}",${propValue})`;
        chrome.devtools.inspectedWindow.eval(evalParams);
        handleBrickInfoChange();
      }
    },
    [selectedBrick, handleBrickInfoChange]
  );

  if (!selectedBrick || !brickInfo) {
    return null;
  }

  const handleCopyProps = () => {
    try {
      const propsText = JSON.stringify(brickInfo.properties, null, 2);
      copyToClipboard(propsText);
    } catch (error) {
      // do nothing
    }
  };

  return (
    <div className="prop-view source-code">
      <div className="scroll-container">
        {tagsToDisplay
          .filter((entry) => isNotEmpty(brickInfo[entry[0]]))
          .map(([key, tag]) => (
            <React.Fragment key={tag}>
              <div style={{ padding: 5 }}>
                <Tag minimal>{tag}</Tag>
                {key === "properties" && (
                  <Tooltip content="Copy to clipboard" hoverOpenDelay={300}>
                    <Button
                      icon="duplicate"
                      minimal
                      onClick={handleCopyProps}
                      style={{ marginLeft: "10px" }}
                      small
                    />
                  </Tooltip>
                )}
              </div>
              <div className="expanded">
                <PropList
                  list={brickInfo[key]}
                  overrideProps={overrideProps}
                  editable={key !== "events"}
                />
              </div>
            </React.Fragment>
          ))}
      </div>
    </div>
  );
}
