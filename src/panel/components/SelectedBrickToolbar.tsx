import React from "react";
import classNames from "classnames";
import { Button, ButtonGroup, Classes, Tooltip } from "@blueprintjs/core";
import { HOOK_NAME } from "../../shared/constants";
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
      {selectedBrick && (
        <>
          <span
            className={classNames(
              "brick-title",
              Classes.TEXT_OVERFLOW_ELLIPSIS
            )}
          >
            {selectedBrick.tagName}
          </span>
          <ButtonGroup>
            <Tooltip content="Inspect the brick element" hoverOpenDelay={300}>
              <Button icon="eye-open" minimal onClick={handleInspectElement} />
            </Tooltip>
            <Tooltip content="View the brick source code" hoverOpenDelay={300}>
              <Button icon="code" minimal onClick={handleInspectCode} />
            </Tooltip>
          </ButtonGroup>
        </>
      )}
    </div>
  );
}
