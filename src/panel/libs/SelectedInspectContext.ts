import React from "react";
import { FrameData } from "../../shared/interfaces";

export interface ContextOfSelectedInspectContext {
  framesRef?: React.RefObject<Map<number, FrameData>>;
  inspectFrameIndex?: number;
  setInspectFrameIndex?: React.Dispatch<React.SetStateAction<number>>;
}

export const SelectedInspectContext = React.createContext<
  ContextOfSelectedInspectContext
>({
  inspectFrameIndex: 0,
});

// istanbul ignore next
export const useSelectedInspectContext = (): ContextOfSelectedInspectContext =>
  React.useContext(SelectedInspectContext);
