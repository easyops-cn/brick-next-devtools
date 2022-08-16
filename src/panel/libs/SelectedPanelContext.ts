import React from "react";
import { PanelType } from "../../shared/interfaces";

export interface ContextOfSelectedPanel {
  selectedPanel?: PanelType;
  setSelectedPanel?: React.Dispatch<React.SetStateAction<PanelType>>;
}

export const SelectedPanelContext = React.createContext<ContextOfSelectedPanel>(
  {}
);

// istanbul ignore next
export const useSelectedPanelContext = (): ContextOfSelectedPanel =>
  React.useContext(SelectedPanelContext);
