import React from "react";
import classNames from "classnames";
import { BrowserThemeContext } from "../libs/BrowserThemeContext";
import { BricksPanel } from "./BricksPanel";
import { SelectedPanelContext } from "../libs/SelectedPanelContext";
import { EvaluationsPanel } from "./EvaluationsPanel";
import { TransformationsPanel } from "./TransformationsPanel";
import {
  LazyEvaluation,
  Transformation,
  DehydratedPayload,
  FrameData,
  PanelType,
} from "../../shared/interfaces";
import { EvaluationsContext } from "../libs/EvaluationsContext";
import {
  FRAME_ACTIVE_CHANGE,
  HOOK_NAME,
  MESSAGE_SOURCE_BACKGROUND,
  MESSAGE_SOURCE_HOOK,
  MESSAGE_SOURCE_PANEL,
  PANEL_CHANGE,
} from "../../shared/constants";
import { TransformationsContext } from "../libs/TransformationsContext";
import { Storage } from "../libs/Storage";
import { hydrate } from "../libs/hydrate";
import { SelectedInspectContext } from "../libs/SelectedInspectContext";
import { postMessage, onMessage, offMessage } from "../../hook/postMessage";

let uniqueIdCounter = 0;
function getUniqueId(): number {
  return (uniqueIdCounter += 1);
}

export function Layout(): React.ReactElement {
  const [selectedPanel, setSelectedPanel] = React.useState<PanelType>(
    () => Storage.getItem("selectedPanel") ?? "Bricks"
  );
  const [evaluationsMap, setEvaluationsMap] = React.useState<
    Record<number, LazyEvaluation[]>
  >({ 0: [] });
  const [transformationsMap, setTransformationsMap] = React.useState<
    Record<number, Transformation[]>
  >({ 0: [] });
  const [preserveLogs, savePreserveLogs] = React.useState(false);
  const [inspectFrameIndex, setInspectFrameIndex] = React.useState<number>(
    () => Storage.getItem("inspectFrameIndex") ?? 0
  );
  const previewerToggled = React.useRef(false);
  const framesRef = React.useRef(new Map<number, FrameData>());

  const getFrameIdByFrameIndex = React.useCallback(
    (frameIndex: number): number => {
      if (frameIndex > 0) {
        const frameData = framesRef.current.get(frameIndex);
        return frameData ? frameData.frameId : -1;
      }
      return 0;
    },
    []
  );

  const setEvaluationsByFrameId = React.useCallback(
    (frameId: number, value: React.SetStateAction<LazyEvaluation[]>) => {
      setEvaluationsMap((prevMap) => ({
        ...prevMap,
        [frameId]:
          typeof value === "function" ? value(prevMap[frameId] ?? []) : value,
      }));
    },
    []
  );

  const setEvaluationsByFrameIndex = React.useCallback(
    (frameIndex: number, value: React.SetStateAction<LazyEvaluation[]>) => {
      const frameId = getFrameIdByFrameIndex(frameIndex);
      if (frameId === -1) {
        return;
      }
      setEvaluationsByFrameId(frameId, value);
    },
    [getFrameIdByFrameIndex, setEvaluationsByFrameId]
  );

  const setTransformationsByFrameId = React.useCallback(
    (frameId: number, value: React.SetStateAction<Transformation[]>) => {
      setTransformationsMap((prevMap) => ({
        ...prevMap,
        [frameId]:
          typeof value === "function" ? value(prevMap[frameId] ?? []) : value,
      }));
    },
    []
  );

  const setTransformationsByFrameIndex = React.useCallback(
    (frameIndex: number, value: React.SetStateAction<Transformation[]>) => {
      const frameId = getFrameIdByFrameIndex(frameIndex);
      if (frameId === -1) {
        return;
      }
      setTransformationsByFrameId(frameId, value);
    },
    [getFrameIdByFrameIndex, setTransformationsByFrameId]
  );

  React.useEffect(() => {
    function listener(eventData: any): void {
      if (eventData?.source !== MESSAGE_SOURCE_BACKGROUND) {
        return;
      }
      const data: FrameData & {
        type: "frame-connected" | "frame-disconnected";
      } = eventData.payload;
      switch (data?.type) {
        case "frame-connected": {
          const { frameId, frameURL } = data;
          // istanbul ignore else
          if (frameId > 0) {
            setEvaluationsByFrameId(frameId, []);
            setTransformationsByFrameId(frameId, []);
            chrome.devtools.inspectedWindow.eval(
              `!!(window.${HOOK_NAME} && window.${HOOK_NAME}.pageHasBricks)`,
              { frameURL },
              (pageHasBricks) => {
                // istanbul ignore else
                if (pageHasBricks) {
                  let i = 1;
                  // eslint-disable-next-line no-constant-condition
                  while (true) {
                    if (framesRef.current.has(i)) {
                      i++;
                    } else {
                      framesRef.current.set(i, { frameId, frameURL });
                      break;
                    }
                  }
                  if (!previewerToggled.current) {
                    previewerToggled.current = true;
                    setInspectFrameIndex(i);
                    Storage.setItem("inspectFrameIndex", i);
                    for (const frame of [{ frameId: 0 }].concat({ frameId })) {
                      postMessage(
                        {
                          source: MESSAGE_SOURCE_PANEL,
                          payload: {
                            type: FRAME_ACTIVE_CHANGE,
                            active: frame.frameId === frameId,
                          },
                          frameId: frame.frameId,
                        },
                      );
                    }
                  } else {
                    console.log("inspect frame", inspectFrameIndex, i);
                    postMessage(
                      {
                        source: MESSAGE_SOURCE_PANEL,
                        payload: {
                          type: FRAME_ACTIVE_CHANGE,
                          active: inspectFrameIndex === i,
                        },
                        frameId: frameId,
                      }
                    );
                  }
                  postMessage(
                    {
                      source: MESSAGE_SOURCE_PANEL,
                      payload: {
                        type: PANEL_CHANGE,
                        panel: selectedPanel,
                      },
                    }
                  );
                } else {
                  console.warn("page has no bricks!");
                }
              }
            );
          } else {
            postMessage(
              {
                source: MESSAGE_SOURCE_PANEL,
                payload: {
                  type: PANEL_CHANGE,
                  panel: selectedPanel,
                },
              }
            );
          }
          break;
        }
        case "frame-disconnected": {
          const { frameId } = data;
          setEvaluationsByFrameId(frameId, []);
          setTransformationsByFrameId(frameId, []);
          if (frameId > 0) {
            for (const [frameIndex, frameData] of framesRef.current.entries()) {
              if (frameData.frameId === frameId) {
                framesRef.current.delete(frameIndex);
                break;
              }
            }
          }
          break;
        }
      }
    }
    onMessage(listener);
    return (): void => offMessage(listener);
  }, [
    inspectFrameIndex,
    selectedPanel,
    setEvaluationsByFrameId,
    setTransformationsByFrameId,
  ]);

  const spliceListLimit = (list: Array<any>, n: number): Array<any> =>  {
    const spliceNumber = list.length - n;
    if (list.length > 100) {
      list.splice(0, spliceNumber);
    }
    return list;
  }

  React.useEffect(() => {
    function listener(eventData: any): void {
      let data: DehydratedPayload;
      if (
        eventData?.source === MESSAGE_SOURCE_HOOK &&
        // eventData.frameId === inspectFrameIndex &&
        ((data = eventData.payload), data?.type === "evaluation")
      ) {
        setEvaluationsByFrameId(eventData.frameId, (prev) =>
          {
            const list = (prev ?? []).concat({
              hydrated: false,
              payload: data.payload,
              repo: data.repo,
              lowerRaw: data.payload.raw.toLowerCase(),
              id: getUniqueId(),
            });
            return spliceListLimit(list, 100);
          }
        );
      }

      if (
        eventData?.source === MESSAGE_SOURCE_HOOK &&
        // eventData.frameId === inspectFrameIndex &&
        ((data = eventData.payload), data?.type === "re-evaluation")
      ) {
        const value = hydrate(data.payload, data.repo);
        setEvaluationsByFrameId(eventData.frameId, (prev) => {
          const selected = prev.find((item) => item.id === value.id);
          if (selected) {
            selected.lowerRaw = value.detail.raw.toLowerCase();
            selected.detail = value.detail;
            selected.error = value.error;
            return spliceListLimit([...prev], 100);
          }
          return spliceListLimit(prev, 100);
        });
      }
    }
    onMessage(listener);
    return (): void => offMessage(listener);
  }, [setEvaluationsByFrameId]);

  React.useEffect(() => {
    function listener(eventData: any): void {
      let data: DehydratedPayload;
      if (
        eventData?.source === MESSAGE_SOURCE_HOOK &&
        ((data = eventData.payload), data?.type === "transformation")
      ) {
        setTransformationsByFrameId(eventData.frameId, (prev) =>
          (prev ?? []).concat({
            detail: hydrate(data.payload, data.repo),
            id: getUniqueId(),
          })
        );
      }

      if (
        eventData?.source === MESSAGE_SOURCE_HOOK &&
        ((data = eventData.payload), data?.type === "re-transformation")
      ) {
        const value = hydrate(data.payload, data.repo);
        setTransformationsByFrameId(eventData.frameId, (prev) => {
          const selected = prev.find((item) => item.id === value.id);
          if (selected) {
            selected.detail = value.detail;
            selected.error = value.error;
            return [...prev];
          }
          return prev;
        });
      }
    }
    onMessage(listener)
    return (): void => window.removeEventListener("message", listener);
  }, [setTransformationsByFrameId]);

  React.useEffect(() => {
    function listener(eventData: any): void {
      if (
        !preserveLogs &&
        eventData?.source === MESSAGE_SOURCE_HOOK &&
        eventData.payload?.type === "locationChange"
      ) {
        const { frameId } = eventData;
        setEvaluationsByFrameId(frameId, []);
        setTransformationsByFrameId(frameId, []);
      }
    }
    onMessage(listener);
    return (): void => offMessage(listener);
  }, [preserveLogs, setEvaluationsByFrameId, setTransformationsByFrameId]);

  React.useEffect(() => {
    Storage.setItem("selectedPanel", selectedPanel);
  }, [selectedPanel]);

  const theme = chrome.devtools.panels.themeName === "dark" ? "dark" : "light";

  React.useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const inspectContextCtx = React.useMemo(
    () => ({
      framesRef,
      inspectFrameIndex,
      setInspectFrameIndex,
    }),
    [inspectFrameIndex]
  );

  const selectedPanelCtx = React.useMemo(
    () => ({
      selectedPanel,
      setSelectedPanel,
    }),
    [selectedPanel]
  );

  const setEvaluations = React.useCallback(
    (value: React.SetStateAction<LazyEvaluation[]>) => {
      setEvaluationsByFrameIndex(inspectFrameIndex, value);
    },
    [inspectFrameIndex, setEvaluationsByFrameIndex]
  );

  const evaluationsCtx = React.useMemo(() => {
    const inspectFrameId = getFrameIdByFrameIndex(inspectFrameIndex);
    return {
      preserveLogs,
      savePreserveLogs,
      evaluations: evaluationsMap[inspectFrameId] ?? [],
      setEvaluations,
    };
  }, [
    evaluationsMap,
    getFrameIdByFrameIndex,
    inspectFrameIndex,
    preserveLogs,
    setEvaluations,
  ]);

  const setTransformations = React.useCallback(
    (value: React.SetStateAction<Transformation[]>) => {
      setTransformationsByFrameIndex(inspectFrameIndex, value);
    },
    [inspectFrameIndex, setTransformationsByFrameIndex]
  );

  const transformationsCtx = React.useMemo(() => {
    const inspectFrameId = getFrameIdByFrameIndex(inspectFrameIndex);
    return {
      preserveLogs,
      savePreserveLogs,
      transformations: transformationsMap[inspectFrameId] ?? [],
      setTransformations,
    };
  }, [
    getFrameIdByFrameIndex,
    inspectFrameIndex,
    preserveLogs,
    transformationsMap,
    setTransformations,
  ]);

  React.useEffect(() => {
    const inspectFrameId = getFrameIdByFrameIndex(inspectFrameIndex);
    for (const frame of [{ frameId: 0 }].concat([
      ...framesRef.current.values(),
    ])) {
      postMessage(
        {
          source: MESSAGE_SOURCE_PANEL,
          payload: {
            type: FRAME_ACTIVE_CHANGE,
            active: frame.frameId === inspectFrameId,
          },
          frameId: frame.frameId,
        },
      );
    }
  }, [getFrameIdByFrameIndex, inspectFrameIndex]);

  React.useEffect(() => {
    postMessage(
      {
        source: MESSAGE_SOURCE_PANEL,
        payload: {
          type: PANEL_CHANGE,
          panel: selectedPanel,
        },
      },
    );
  }, [selectedPanel]);

  return (
    <div
      className={classNames("layout bp3-focus-disabled", {
        "bp3-dark": theme === "dark",
      })}
    >
      <BrowserThemeContext.Provider value={theme}>
        <SelectedInspectContext.Provider value={inspectContextCtx}>
          <SelectedPanelContext.Provider value={selectedPanelCtx}>
            {selectedPanel === "Evaluations" ? (
              <EvaluationsContext.Provider value={evaluationsCtx}>
                <EvaluationsPanel />
              </EvaluationsContext.Provider>
            ) : selectedPanel === "Transformations" ? (
              <TransformationsContext.Provider value={transformationsCtx}>
                <TransformationsPanel />
              </TransformationsContext.Provider>
            ) : (
              <BricksPanel />
            )}
          </SelectedPanelContext.Provider>
        </SelectedInspectContext.Provider>
      </BrowserThemeContext.Provider>
    </div>
  );
}
