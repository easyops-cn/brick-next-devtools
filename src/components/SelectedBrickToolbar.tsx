import React from "react";
import classNames from "classnames";
import { Button, ButtonGroup, Classes } from "@blueprintjs/core";
import { HOOK_NAME } from "../shared";
import { useSelectedBrickContext } from "../libs/SelectedBrickContext";

export function SelectedBrickToolbar(): React.ReactElement {
  const { selectedBrick } = useSelectedBrickContext();

  const handleInspectElement = React.useCallback((): void => {
    chrome.devtools.inspectedWindow.eval(
      `inspect(window.${HOOK_NAME}.getBrickByUid(${selectedBrick.uid}));`
    );
  }, [selectedBrick]);

  const handleInspectCode = React.useCallback((): void => {
    chrome.devtools.inspectedWindow.eval(
      `inspect(window.${HOOK_NAME}.getBrickByUid(${selectedBrick.uid}).constructor);`
    );
  }, [selectedBrick]);

  return (
    <div className="selected-brick-toolbar">
      <span
        className={classNames("brick-title", Classes.TEXT_OVERFLOW_ELLIPSIS)}
      >
        {selectedBrick?.tagName}
      </span>
      <ButtonGroup>
        <Button
          text="Inspect Element"
          onClick={handleInspectElement}
          disabled={!selectedBrick}
        />
        <Button
          text="Source Code"
          onClick={handleInspectCode}
          disabled={!selectedBrick}
        />
      </ButtonGroup>
    </div>
  );
}
