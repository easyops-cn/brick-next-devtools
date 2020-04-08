import React from "react";
import { Button, ITreeNode, Tree, ButtonGroup } from '@blueprintjs/core';
import { HOOK_NAME } from '../shared';
import { PropTree } from './PropTree';

export function BrickTreeContainer(): React.ReactElement {
  const [tree, setTree] = React.useState<any[]>([]);
  const [selectedId, setSelectedId] = React.useState<number>();
  const [properties, setProperties] = React.useState<Record<string, any>>({});

  const handleRefresh = React.useCallback((): void => {
    chrome.devtools.inspectedWindow.eval(
      `window.${HOOK_NAME}.getMainBricks()`,
      function(result: any, error) {
        if (error) {
          console.error(error);
          // document.querySelector("#log-result").textContent =
          //   (error.isException ? 'exception: ' + error.value : 'error: ' + error.description);
          return;
        }

        setTree(result);
        setProperties({});
      }
    );
  }, []);

  const handleInspectElement = React.useCallback((): void => {
    chrome.devtools.inspectedWindow.eval(
      `inspect(window.${HOOK_NAME}.getBrickByUid(${selectedId})),void 0`
    );
  }, [selectedId]);

  const handleInspectConstructor = React.useCallback((): void => {
    chrome.devtools.inspectedWindow.eval(
      `inspect(window.${HOOK_NAME}.getBrickByUid(${selectedId}).constructor),void 0`
    );
  }, [selectedId]);

  const handleNodeClick = React.useCallback((node: ITreeNode<any>) => {
    setSelectedId(node.id as number);
    console.log(node.nodeData.properties);
    setProperties(node.nodeData.properties);
  }, []);

  const handleNodeDoubleClick = React.useCallback((node: ITreeNode<any>) => {
    chrome.devtools.inspectedWindow.eval(
      `inspect(window.${HOOK_NAME}.getBrickByUid(${node.id})),void 0`
    );
  }, []);

  const handleNodeMouseEnter = React.useCallback((node: ITreeNode<any>) => {
    chrome.devtools.inspectedWindow.eval(
      `inspect(window.${HOOK_NAME}.showBox(${node.id})),void 0`
    );
  }, []);

  const handleNodeMouseLeave = React.useCallback((node: ITreeNode<any>) => {
    chrome.devtools.inspectedWindow.eval(
      `inspect(window.${HOOK_NAME}.hideBox(${node.id})),void 0`
    );
  }, []);

  const nodes = React.useMemo<ITreeNode<any>[]>(() => {
    function walk(node: any): ITreeNode<any> {
      return {
        id: node.uid,
        hasCaret: node.children.length > 0,
        isExpanded: true,
        isSelected: node.uid === selectedId,
        label: node.tagName,
        nodeData: {
          properties: node.properties
        },
        childNodes: node.children.map(walk)
      }
    };
    return tree.map(walk);
  }, [tree, selectedId]);

  return (
    <div>
      <div style={{paddingBottom: 10}}>
        <ButtonGroup>
          <Button text="Refresh" onClick={handleRefresh} />
          <Button text="Inspect Element" onClick={handleInspectElement} disabled={!selectedId} />
          <Button text="Inspect Constructor" onClick={handleInspectConstructor} disabled={!selectedId} />
        </ButtonGroup>
      </div>
      <div style={{display: "flex", justifyContent: "space-between"}}>
        <Tree contents={nodes} onNodeClick={handleNodeClick} onNodeDoubleClick={handleNodeDoubleClick} onNodeMouseEnter={handleNodeMouseEnter} onNodeMouseLeave={handleNodeMouseLeave} />
        <PropTree properties={properties} />
      </div>
    </div>
  );
}
