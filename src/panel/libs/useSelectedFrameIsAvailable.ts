import { useSelectedInspectContext } from "./SelectedInspectContext";

export function useSelectedFrameIsAvailable(): boolean {
  const { framesRef, inspectFrameIndex } = useSelectedInspectContext();
  return inspectFrameIndex === 0 || framesRef.current.has(inspectFrameIndex);
}
