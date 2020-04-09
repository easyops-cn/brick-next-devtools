import React from "react";
import { Button, ButtonGroup } from '@blueprintjs/core';
import { HOOK_NAME } from '../shared';
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

  return (
    <div className="tree-toolbar">
      <ButtonGroup>
        <Button text="Refresh" onClick={handleRefresh} />
      </ButtonGroup>
    </div>
  );
}
