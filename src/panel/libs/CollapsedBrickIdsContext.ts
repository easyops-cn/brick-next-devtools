import React from "react";

export interface ContextOfCollapsedBrickIds {
  collapsedBrickIds?: number[];
  setCollapsedBrickIds?: React.Dispatch<React.SetStateAction<number[]>>;
  expandedInternalIds?: number[];
  setExpandedInternalIds?: React.Dispatch<React.SetStateAction<number[]>>;
}

export const CollapsedBrickIdsContext = React.createContext<
  ContextOfCollapsedBrickIds
>({});

// istanbul ignore next
export const useCollapsedBrickIdsContext = (): ContextOfCollapsedBrickIds =>
  React.useContext(CollapsedBrickIdsContext);
