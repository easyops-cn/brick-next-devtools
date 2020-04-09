import React from "react";
import { ITreeNode, Tree } from '@blueprintjs/core';
import { HOOK_NAME } from '../shared';
import { useBrickTreeContext } from '../libs/BrickTreeContext';
import { useSelectedBrickContext } from '../libs/SelectedBrickContext';
import { RichBrickData, BrickData } from '../libs/interfaces';

export function BrickTree(): React.ReactElement {
  const { tree } = useBrickTreeContext();
  const { selectedBrick, setSelectedBrick } = useSelectedBrickContext();

  const handleNodeClick = React.useCallback((node: ITreeNode<BrickData>) => {
    setSelectedBrick(node.nodeData);
  }, [setSelectedBrick]);

  const handleNodeDoubleClick = React.useCallback((node: ITreeNode<BrickData>) => {
    chrome.devtools.inspectedWindow.eval(
      `inspect(window.${HOOK_NAME}.getBrickByUid(${node.id})),void 0`
    );
  }, []);

  const handleNodeMouseEnter = React.useCallback((node: ITreeNode<BrickData>) => {
    chrome.devtools.inspectedWindow.eval(
      `inspect(window.${HOOK_NAME}.showBox(${node.id})),void 0`
    );
  }, []);

  const handleNodeMouseLeave = React.useCallback((node: ITreeNode<BrickData>) => {
    chrome.devtools.inspectedWindow.eval(
      `inspect(window.${HOOK_NAME}.hideBox(${node.id})),void 0`
    );
  }, []);

  const nodes = React.useMemo<ITreeNode<BrickData>[]>(() => {
    function walk(node: RichBrickData): ITreeNode<BrickData> {
      return {
        id: node.uid,
        hasCaret: node.children.length > 0,
        isExpanded: true,
        isSelected: node.uid === selectedBrick?.uid,
        label: node.tagName,
        nodeData: {
          uid: node.uid,
          tagName: node.tagName,
          properties: node.properties,
        },
        childNodes: node.children.map(walk)
      }
    };
    return tree.map(walk);
  }, [tree, selectedBrick]);

  return (
    <div className="brick-tree">
      <Tree contents={nodes} onNodeClick={handleNodeClick} onNodeDoubleClick={handleNodeDoubleClick} onNodeMouseEnter={handleNodeMouseEnter} onNodeMouseLeave={handleNodeMouseLeave} />
    </div>
  );
}
