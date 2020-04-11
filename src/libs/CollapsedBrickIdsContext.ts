import React from "react";

export interface ContextOfCollapsedBrickIds {
  collapsedBrickIds?: number[];
  setCollapsedBrickIds?: React.Dispatch<number[]>;
}

export const CollapsedBrickIdsContext = React.createContext<
  ContextOfCollapsedBrickIds
>({});

export const useCollapsedBrickIdsContext = (): ContextOfCollapsedBrickIds =>
  React.useContext(CollapsedBrickIdsContext);
