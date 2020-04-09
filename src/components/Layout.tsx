import React from "react";
import { TreeWrapper } from './TreeWrapper';
import { SelectedBrickWrapper } from './SelectedBrickWrapper';
import { BrickTreeContext } from '../libs/BrickTreeContext';
import { RichBrickData, BrickData } from '../libs/interfaces';
import { SelectedBrickContext } from '../libs/SelectedBrickContext';

export function Layout(): React.ReactElement {
  const [tree, setTree] = React.useState<RichBrickData[]>([]);
  const [selectedBrick, setSelectedBrick] = React.useState<BrickData>();

  return (
    <div className="layout bp3-dark bp3-focus-disabled">
      <BrickTreeContext.Provider value={{
        tree,
        setTree,
      }}>
        <SelectedBrickContext.Provider value={{
          selectedBrick,
          setSelectedBrick,
        }}>
          <TreeWrapper />
          <SelectedBrickWrapper />
        </SelectedBrickContext.Provider>
      </BrickTreeContext.Provider>
    </div>
  );
}
