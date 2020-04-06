import React from "react";
import { Button, ITreeNode, Tree, Classes, ButtonGroup } from '@blueprintjs/core';

export function BrickTreeContainer(): React.ReactElement {
  const [tree, setTree] = React.useState<any[]>([]);
  const [selectedId, setSelectedId] = React.useState<number>();
  const [props, setProps] = React.useState<Record<string, any>>({});

  const handleRefresh = React.useCallback((): void => {
    chrome.devtools.inspectedWindow.eval(
      "window.__BRICK_NEXT_DEVTOOLS_HOOK__.getMainBricks()",
      function(result: any, error) {
        if (error) {
          console.error(error);
          // document.querySelector("#log-result").textContent =
          //   (error.isException ? 'exception: ' + error.value : 'error: ' + error.description);
          return;
        }

        setTree(result);
        setProps({});
      }
    );
  }, []);

  const handleInspectElement = React.useCallback((): void => {
    chrome.devtools.inspectedWindow.eval(
      `inspect(window.__BRICK_NEXT_DEVTOOLS_HOOK__.getBrickByUid(${selectedId})),void 0`
    );
  }, [selectedId]);

  const handleInspectConstructor = React.useCallback((): void => {
    chrome.devtools.inspectedWindow.eval(
      `inspect(window.__BRICK_NEXT_DEVTOOLS_HOOK__.getBrickByUid(${selectedId}).constructor),void 0`
    );
  }, [selectedId]);

  const handleNodeClick = React.useCallback((node: ITreeNode<any>) => {
    setSelectedId(node.id as number);
    console.log(node.nodeData.properties);
    setProps(node.nodeData.properties);
  }, []);

  const handleNodeDoubleClick = React.useCallback((node: ITreeNode<any>) => {
    chrome.devtools.inspectedWindow.eval(
      `inspect(window.__BRICK_NEXT_DEVTOOLS_HOOK__.getBrickByUid(${node.id})),void 0`
    );
  }, []);

  const handleNodeMouseEnter = React.useCallback((node: ITreeNode<any>) => {
    chrome.devtools.inspectedWindow.eval(
      `inspect(window.__BRICK_NEXT_DEVTOOLS_HOOK__.showBox(${node.id})),void 0`
    );
  }, []);

  const handleNodeMouseLeave = React.useCallback((node: ITreeNode<any>) => {
    chrome.devtools.inspectedWindow.eval(
      `inspect(window.__BRICK_NEXT_DEVTOOLS_HOOK__.hideBox(${node.id})),void 0`
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

  const propNodes = React.useMemo<ITreeNode<any>[]>(() => {
    return Object.entries(props).map(([key, value]) => {
      return {
        id: key,
        label: <span className={Classes.RUNNING_TEXT}><code>{`${key}`}</code>: <code>{`${value}`}</code></span>
      }
    });
  }, [props]);

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
        <Tree contents={propNodes} />
      </div>
    </div>
  );
}
