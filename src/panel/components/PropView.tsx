import React from "react";
import { Tag, Button, Tooltip } from "@blueprintjs/core";
import { useSelectedBrickContext } from "../libs/SelectedBrickContext";
import { HOOK_NAME } from "../../shared/constants";
import { BrickInfo, DehydratedBrickInfo } from "../../shared/interfaces";
import { hydrate } from "../libs/hydrate";
import { PropList } from "./PropList";
import { useEvalOptions } from "../libs/useEvalOptions";

const copyToClipboard = (text: string): void => {
  // istanbul ignore next
  const listener = (e: ClipboardEvent): void => {
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
  ["tplState", "template state"],
];

export function PropView(): React.ReactElement {
  const { selectedBrick } = useSelectedBrickContext();
  const [brickInfo, setBrickInfo] = React.useState<BrickInfo>({});
  const evalOptions = useEvalOptions();

  const handleBrickInfoChange = React.useCallback(() => {
    chrome.devtools.inspectedWindow.eval(
      `window.${HOOK_NAME}.getBrickInfo(${selectedBrick.uid})`,
      evalOptions,
      function (result: DehydratedBrickInfo, error) {
        // istanbul ignore if
        if (error) {
          console.error("getBrickInfo()", error, result);
        }
        const newBrickInfo = hydrate(result.info, result.repo);
        const eventsMap = new Map();
        if (newBrickInfo && Array.isArray(newBrickInfo.events)) {
          for (const [eventType, eventHandler] of newBrickInfo.events) {
            const existedHandler = eventsMap.get(eventType);
            if (existedHandler === undefined) {
              eventsMap.set(eventType, eventHandler);
            } else if (Array.isArray(existedHandler)) {
              existedHandler.push(eventHandler);
            } else {
              eventsMap.set(eventType, [existedHandler, eventHandler]);
            }
          }
        }
        newBrickInfo.events = Object.fromEntries(eventsMap.entries());
        setBrickInfo(newBrickInfo);
      }
    );
  }, [evalOptions, selectedBrick]);

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
        chrome.devtools.inspectedWindow.eval(evalParams, evalOptions);
        handleBrickInfoChange();
      }
    },
    [evalOptions, selectedBrick, handleBrickInfoChange]
  );

  if (!selectedBrick || !brickInfo) {
    return null;
  }

  const handleCopyFactory = (key: "properties" | "events") => (): void => {
    try {
      const propsText = JSON.stringify(brickInfo[key], null, 2);
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
                {(key === "properties" || key === "events") && (
                  <Tooltip content="Copy to clipboard" hoverOpenDelay={300}>
                    <Button
                      icon="duplicate"
                      minimal
                      onClick={handleCopyFactory(key)}
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
