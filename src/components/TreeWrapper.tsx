import React from "react";
import { TreeToolbar } from './TreeToolbar';
import { BrickTree } from './BrickTree';

export function TreeWrapper(): React.ReactElement {
  return (
    <div className="tree-wrapper">
      <TreeToolbar />
      <BrickTree />
    </div>
  );
}
