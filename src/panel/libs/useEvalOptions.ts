import { useMemo } from "react";
import { useSelectedInspectContext } from "./SelectedInspectContext";

const defaultOptions = {};

export function useEvalOptions(): chrome.devtools.inspectedWindow.EvalOptions {
  const { framesRef, inspectFrameIndex } = useSelectedInspectContext();
  const frameURL =
    inspectFrameIndex === 0
      ? undefined
      : framesRef.current.get(inspectFrameIndex)?.frameURL;
  return useMemo(() => (frameURL ? { frameURL } : defaultOptions), [frameURL]);
}
