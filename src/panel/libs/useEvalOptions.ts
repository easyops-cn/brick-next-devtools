import { useMemo } from "react";
import { useSelectedInspectContext } from "./SelectedInspectContext";

const defaultOptions = {};

export function useEvalOptions(): chrome.devtools.inspectedWindow.EvalOptions {
  const { frames, inspectContext } = useSelectedInspectContext();
  return useMemo(
    () =>
      inspectContext === 0
        ? defaultOptions
        : {
            frameURL: frames.find((frame) => frame.frameId === inspectContext)
              .frameURL,
          },
    [inspectContext, frames]
  );
}
