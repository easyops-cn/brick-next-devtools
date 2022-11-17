import React from "react";
import { Button, ButtonGroup, Tooltip, Switch } from "@blueprintjs/core";
import { HOOK_NAME, MESSAGE_SOURCE_HOOK } from "../../shared/constants";
import { useBrickTreeContext } from "../libs/BrickTreeContext";
import { useSelectedBrickContext } from "../libs/SelectedBrickContext";
import { BricksByMountPoint } from "../../shared/interfaces";
import { useCollapsedBrickIdsContext } from "../libs/CollapsedBrickIdsContext";
import { useShowFullNameContext } from "../libs/ShowFullNameContext";
import { PanelSelector } from "./PanelSelector";
import { InspectContextSelector } from "./InspectContextSelector";
import { useEvalOptions } from "../libs/useEvalOptions";
import { useSelectedFrameIsAvailable } from "../libs/useSelectedFrameIsAvailable";
import { onMessage } from "../../hook/postMessage";

export function TreeToolbar(): React.ReactElement {
  const { setTree } = useBrickTreeContext();
  const { showFullName, setShowFullName } = useShowFullNameContext();
  const {
    setCollapsedBrickIds,
    setExpandedInternalIds,
  } = useCollapsedBrickIdsContext();
  const { setSelectedBrick } = useSelectedBrickContext();
  const evalOptions = useEvalOptions();
  const frameIsAvailable = useSelectedFrameIsAvailable();

  const handleRefresh = React.useCallback((): void => {
    const refresh = (result: BricksByMountPoint): void => {
      setTree(result);
      setCollapsedBrickIds([]);
      setExpandedInternalIds([]);
      setSelectedBrick(null);
    };
    if (!frameIsAvailable) {
      refresh(null);
      return;
    }
    chrome.devtools.inspectedWindow.eval(
      `window.${HOOK_NAME} && window.${HOOK_NAME}.getBricks()`,
      evalOptions,
      function (result: BricksByMountPoint, error) {
        // istanbul ignore if
        if (error) {
          console.error("getBricks()", error);
        }
        refresh(result);
      }
    );
  }, [
    frameIsAvailable,
    evalOptions,
    setTree,
    setCollapsedBrickIds,
    setExpandedInternalIds,
    setSelectedBrick,
  ]);

  React.useEffect(() => {
    handleRefresh();
  }, [handleRefresh]);

  React.useEffect(() => {
    function listener(eventData: any): void {
      if (
        eventData.source === MESSAGE_SOURCE_HOOK &&
        eventData.payload?.type === "rendered"
      ) {
        handleRefresh();
      }
    }
    onMessage(listener);
    return (): void => window.removeEventListener("message", listener);
  }, [handleRefresh]);

  const handleToggleFullName = React.useCallback(
    (event: React.FormEvent<HTMLInputElement>) => {
      setShowFullName((event.target as HTMLInputElement).checked);
    },
    [setShowFullName]
  );

  return (
    <div className="tree-toolbar">
      <div className="toolbar-group">
        <InspectContextSelector />
        <PanelSelector />
      </div>
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
