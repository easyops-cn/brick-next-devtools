import React from "react";
import { FrameData, InspectContext } from "../../shared/interfaces";

export interface ContextOfSelectedInspectContext {
  frames?: FrameData[];
  inspectContext?: InspectContext;
  setInspectContext?: React.Dispatch<React.SetStateAction<InspectContext>>;
}

export const SelectedInspectContext = React.createContext<
  ContextOfSelectedInspectContext
>({
  frames: [],
  inspectContext: 0,
});

// istanbul ignore next
export const useSelectedInspectContext = (): ContextOfSelectedInspectContext =>
  React.useContext(SelectedInspectContext);
