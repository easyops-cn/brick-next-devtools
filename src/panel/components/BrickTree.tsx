import React from "react";
import { ITreeNode, Tree, Tag } from "@blueprintjs/core";
import { HOOK_NAME } from "../../shared/constants";
import { useBrickTreeContext } from "../libs/BrickTreeContext";
import { useSelectedBrickContext } from "../libs/SelectedBrickContext";
import { RichBrickData, BrickData } from "../../shared/interfaces";
import { useCollapsedBrickIdsContext } from "../libs/CollapsedBrickIdsContext";
import { BrickLabel } from "./BrickLabel";

export function BrickTree(): React.ReactElement {
  const { tree } = useBrickTreeContext();
  const {
    collapsedBrickIds,
    setCollapsedBrickIds,
  } = useCollapsedBrickIdsContext();
  const { selectedBrick, setSelectedBrick } = useSelectedBrickContext();

  const handleNodeClick = React.useCallback(
    (node: ITreeNode<BrickData>) => {
      setSelectedBrick(node.nodeData);
    },
    [setSelectedBrick]
  );

  /* const handleNodeDoubleClick = React.useCallback((node: ITreeNode<BrickData>) => {
    chrome.devtools.inspectedWindow.eval(
      `inspect(window.${HOOK_NAME}.getBrickByUid(${node.id}));`
    );
  }, []); */

  const handleNodeCollapse = React.useCallback(
    (node: ITreeNode<BrickData>) => {
      setCollapsedBrickIds((prev) => prev.concat(node.id as number));
    },
    [setCollapsedBrickIds]
  );

  const handleNodeExpand = React.useCallback(
    (node: ITreeNode<BrickData>) => {
      setCollapsedBrickIds((prev) => prev.filter((id) => id !== node.id));
    },
    [setCollapsedBrickIds]
  );

  const handleNodeMouseEnter = React.useCallback(
    (node: ITreeNode<BrickData>) => {
      chrome.devtools.inspectedWindow.eval(
        `inspect(window.${HOOK_NAME}.inspectBrick(${node.id}));`
      );
    },
    []
  );

  const handleNodeMouseLeave = React.useCallback(
    (node: ITreeNode<BrickData>) => {
      chrome.devtools.inspectedWindow.eval(
        `inspect(window.${HOOK_NAME}.dismissInspections(${node.id}));`
      );
    },
    []
  );

  const bricksByMountPoint = React.useMemo<
    Record<string, ITreeNode<BrickData>[]>
  >(() => {
    function walk(node: RichBrickData): ITreeNode<BrickData> {
      return {
        id: node.uid,
        hasCaret: node.children.length > 0,
        isExpanded: !collapsedBrickIds.includes(node.uid),
        isSelected: node.uid === selectedBrick?.uid,
        label: <BrickLabel tagName={node.tagName} />,
        nodeData: {
          uid: node.uid,
          tagName: node.tagName,
        },
        childNodes: node.children.map(walk),
      };
    }
    return Object.fromEntries(
      Object.entries(tree || {})
        .filter((entry) => entry[1].length > 0)
        .map((entry) => [entry[0], entry[1].map(walk)])
    );
  }, [tree, collapsedBrickIds, selectedBrick]);

  return (
    <div className="brick-tree source-code">
      <div className="scroll-container">
        {Object.entries(bricksByMountPoint).map(([mountPoint, nodes]) => (
          <div key={mountPoint}>
            <div style={{ padding: 5 }}>
              <Tag minimal>{mountPoint}</Tag>
            </div>
            <Tree
              contents={nodes}
              onNodeClick={handleNodeClick}
              // onNodeDoubleClick={handleNodeDoubleClick}
              onNodeCollapse={handleNodeCollapse}
              onNodeExpand={handleNodeExpand}
              onNodeMouseEnter={handleNodeMouseEnter}
              onNodeMouseLeave={handleNodeMouseLeave}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
