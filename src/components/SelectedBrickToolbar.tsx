import React from "react";
import { Button, ButtonGroup } from '@blueprintjs/core';
import { HOOK_NAME } from '../shared';
import { useSelectedBrickContext } from '../libs/SelectedBrickContext';

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
      <ButtonGroup>
        <Button text="Inspect Element" onClick={handleInspectElement} disabled={!selectedBrick} />
        <Button text="Inspect Code" onClick={handleInspectCode} disabled={!selectedBrick} />
      </ButtonGroup>
    </div>
  );
}
