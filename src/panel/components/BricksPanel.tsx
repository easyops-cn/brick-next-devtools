import React from "react";
import { TreeWrapper } from "./TreeWrapper";
import { SelectedBrickWrapper } from "./SelectedBrickWrapper";
import { BrickTreeContext } from "../libs/BrickTreeContext";
import { BrickData, BricksByMountPoint } from "../../shared/interfaces";
import { SelectedBrickContext } from "../libs/SelectedBrickContext";
import { CollapsedBrickIdsContext } from "../libs/CollapsedBrickIdsContext";
import { ShowFullNameContext } from "../libs/ShowFullNameContext";

export function BricksPanel(): React.ReactElement {
  const [tree, setTree] = React.useState<BricksByMountPoint>();
  const [collapsedBrickIds, setCollapsedBrickIds] = React.useState<number[]>(
    []
  );
  const [expandedInternalIds, setExpandedInternalIds] = React.useState<
    number[]
  >([]);
  const [showFullName, setShowFullName] = React.useState<boolean>(false);
  const [selectedBrick, setSelectedBrick] = React.useState<BrickData>();

  return (
    <div className="panel bricks-panel">
      <SelectedBrickContext.Provider
        value={{
          selectedBrick,
          setSelectedBrick,
        }}
      >
        <BrickTreeContext.Provider
          value={{
            tree,
            setTree,
          }}
        >
          <CollapsedBrickIdsContext.Provider
            value={{
              collapsedBrickIds,
              setCollapsedBrickIds,
              expandedInternalIds,
              setExpandedInternalIds,
            }}
          >
            <ShowFullNameContext.Provider
              value={{ showFullName, setShowFullName }}
            >
              <TreeWrapper />
            </ShowFullNameContext.Provider>
          </CollapsedBrickIdsContext.Provider>
        </BrickTreeContext.Provider>
        <SelectedBrickWrapper />
      </SelectedBrickContext.Provider>
    </div>
  );
}
