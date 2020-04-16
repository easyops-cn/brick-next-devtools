import React from "react";

export interface ContextOfSelectedPanel {
  selectedPanel?: string;
  setSelectedPanel?: React.Dispatch<React.SetStateAction<string>>;
}

export const SelectedPanelContext = React.createContext<ContextOfSelectedPanel>(
  {}
);

// istanbul ignore next
export const useSelectedPanelContext = (): ContextOfSelectedPanel =>
  React.useContext(SelectedPanelContext);
