import React from "react";
import { Button, ButtonGroup } from '@blueprintjs/core';
import { HOOK_NAME, MESSAGE_SOURCE_HOOK, MESSAGE_SOURCE_DEVTOOLS } from '../shared';
import { useBrickTreeContext } from '../libs/BrickTreeContext';
import { useSelectedBrickContext } from '../libs/SelectedBrickContext';
import { RichBrickData } from '../libs/interfaces';

export function TreeToolbar(): React.ReactElement {
  const { setTree } = useBrickTreeContext();
  const { setSelectedBrick } = useSelectedBrickContext();

  const handleRefresh = React.useCallback((): void => {
    chrome.devtools.inspectedWindow.eval(
      `window.${HOOK_NAME}.getMainBricks()`,
      function(result: RichBrickData[], error) {
        if (error) {
          console.error(error);
          // document.querySelector("#log-result").textContent =
          //   (error.isException ? 'exception: ' + error.value : 'error: ' + error.description);
          return;
        }

        setTree(result);
        setSelectedBrick(null);
      }
    );
  }, [setTree, setSelectedBrick]);

  React.useEffect(() => {
    handleRefresh();
  }, []);

  React.useEffect(() => {
    function onMessage(event: MessageEvent): void {
      if (event.data?.source === MESSAGE_SOURCE_DEVTOOLS && event.data.payload?.type === "port") {
        const message = event.data.payload.message;
        if (message?.source === MESSAGE_SOURCE_HOOK && message.payload?.type === "rendered") {
          handleRefresh();
        }
      }
    }
    window.addEventListener("message", onMessage);
    return (): void => window.removeEventListener("message", onMessage);
  }, [handleRefresh]);

  return (
    <div className="tree-toolbar">
      <ButtonGroup>
        <Button text="Refresh" onClick={handleRefresh} />
      </ButtonGroup>
    </div>
  );
}
