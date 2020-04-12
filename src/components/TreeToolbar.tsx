import React from "react";
import { Button, ButtonGroup, Tooltip, Switch } from "@blueprintjs/core";
import { HOOK_NAME, MESSAGE_SOURCE_HOOK } from "../shared";
import { useBrickTreeContext } from "../libs/BrickTreeContext";
import { useSelectedBrickContext } from "../libs/SelectedBrickContext";
import { BricksByMountPoint } from "../libs/interfaces";
import { useCollapsedBrickIdsContext } from "../libs/CollapsedBrickIdsContext";
import { useShowFullNameContext } from "../libs/ShowFullNameContext";

export function TreeToolbar(): React.ReactElement {
  const { setTree } = useBrickTreeContext();
  const { showFullName, setShowFullName } = useShowFullNameContext();
  const { setCollapsedBrickIds } = useCollapsedBrickIdsContext();
  const { setSelectedBrick } = useSelectedBrickContext();

  const handleRefresh = React.useCallback((): void => {
    chrome.devtools.inspectedWindow.eval(
      `window.${HOOK_NAME} && window.${HOOK_NAME}.getBricks()`,
      function (result: BricksByMountPoint, error) {
        if (error) {
          console.error("getBricks()", error);
        }

        setTree(result);
        setCollapsedBrickIds([]);
        setSelectedBrick(null);
      }
    );
  }, [setTree, setCollapsedBrickIds, setSelectedBrick]);

  React.useEffect(() => {
    handleRefresh();
  }, []);

  React.useEffect(() => {
    function onMessage(event: MessageEvent): void {
      if (
        event.data?.source === MESSAGE_SOURCE_HOOK &&
        event.data.payload?.type === "rendered"
      ) {
        handleRefresh();
      }
    }
    window.addEventListener("message", onMessage);
    return (): void => window.removeEventListener("message", onMessage);
  }, [handleRefresh]);

  const handleToggleFullName = React.useCallback(
    (event: React.FormEvent<HTMLInputElement>) => {
      setShowFullName((event.target as HTMLInputElement).checked);
    },
    [setShowFullName]
  );

  return (
    <div className="tree-toolbar">
      <ButtonGroup>
        <Tooltip content="Refresh bricks" hoverOpenDelay={300}>
          <Button icon="refresh" minimal onClick={handleRefresh} />
        </Tooltip>
      </ButtonGroup>
      <Switch
        checked={showFullName}
        label="Full Name"
        onChange={handleToggleFullName}
      />
    </div>
  );
}
