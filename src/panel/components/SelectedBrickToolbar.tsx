import React from "react";
import classNames from "classnames";
import { Button, ButtonGroup, Classes, Tooltip } from "@blueprintjs/core";
import { HOOK_NAME } from "../../shared/constants";
import { useSelectedBrickContext } from "../libs/SelectedBrickContext";
import { useEvalOptions } from "../libs/useEvalOptions";

export function SelectedBrickToolbar(): React.ReactElement {
  const { selectedBrick, setSelectedBrick } = useSelectedBrickContext();
  const evalOptions = useEvalOptions();

  const handleInspectElement = React.useCallback((): void => {
    chrome.devtools.inspectedWindow.eval(
      `inspect(window.${HOOK_NAME}.getBrickByUid(${selectedBrick.uid}));`,
      evalOptions
    );
  }, [evalOptions, selectedBrick]);

  const handleInspectCode = React.useCallback((): void => {
    chrome.devtools.inspectedWindow.eval(
      `inspect(window.${HOOK_NAME}.getBrickByUid(${selectedBrick.uid}).constructor);`,
      evalOptions
    );
  }, [evalOptions, selectedBrick]);

  const handleRefreshBrickInfo = React.useCallback(() => {
    setSelectedBrick({ ...selectedBrick });
  }, [selectedBrick, setSelectedBrick]);

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
            <Tooltip content="Refresh brick info" hoverOpenDelay={300}>
              <Button icon="refresh" minimal onClick={handleRefreshBrickInfo} />
            </Tooltip>
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
