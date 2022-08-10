import React, { useEffect } from "react";
import classNames from "classnames";
import { BrowserThemeContext } from "../libs/BrowserThemeContext";
import { BricksPanel } from "./BricksPanel";
import { SelectedPanelContext } from "../libs/SelectedPanelContext";
import { EvaluationsPanel } from "./EvaluationsPanel";
import { TransformationsPanel } from "./TransformationsPanel";
import {
  Evaluation,
  Transformation,
  DehydratedPayload,
  InspectContext,
  FrameData,
} from "../../shared/interfaces";
import { EvaluationsContext } from "../libs/EvaluationsContext";
import {
  HOOK_NAME,
  MESSAGE_SOURCE_BACKGROUND,
  MESSAGE_SOURCE_HOOK,
} from "../../shared/constants";
import { TransformationsContext } from "../libs/TransformationsContext";
import { Storage } from "../libs/Storage";
import { hydrate } from "../libs/hydrate";
import { SelectedInspectContext } from "../libs/SelectedInspectContext";

let uniqueIdCounter = 0;
function getUniqueId(): number {
  return (uniqueIdCounter += 1);
}

export function Layout(): React.ReactElement {
  const [selectedPanel, setSelectedPanel] = React.useState(
    Storage.getItem("selectedPanel") ?? "Bricks"
  );
  const [evaluationsMap, setEvaluationsMap] = React.useState<
    Record<number, Evaluation[]>
  >({ 0: [] });
  const [transformationsMap, setTransformationsMap] = React.useState<
    Record<number, Transformation[]>
  >({ 0: [] });
  const [preserveLogs, savePreserveLogs] = React.useState(false);
  const [frames, setFrameUrls] = React.useState<FrameData[]>([]);
  const [inspectContext, setInspectContext] = React.useState<InspectContext>(0);

  const setEvaluationsByFrameId = React.useCallback(
    (frameId: number, value: React.SetStateAction<Evaluation[]>) => {
      setEvaluationsMap((prevMap) => ({
        ...prevMap,
        [frameId]:
          typeof value === "function" ? value(prevMap[frameId]) : value,
      }));
    },
    []
  );

  const setTransformationsByFrameId = React.useCallback(
    (frameId: number, value: React.SetStateAction<Transformation[]>) => {
      setTransformationsMap((prevMap) => ({
        ...prevMap,
        [frameId]:
          typeof value === "function" ? value(prevMap[frameId]) : value,
      }));
    },
    []
  );

  React.useEffect(() => {
    function onMessage(event: MessageEvent): void {
      let data: FrameData & {
        type: "set-frame";
      };
      if (
        event.data?.source === MESSAGE_SOURCE_BACKGROUND &&
        ((data = event.data.payload), data?.type === "set-frame")
      ) {
        const { frameId, frameURL } = data;
        // istanbul ignore else
        if (frameId > 0) {
          chrome.devtools.inspectedWindow.eval(
            `!!(window.${HOOK_NAME} && window.${HOOK_NAME}.pageHasBricks)`,
            { frameURL },
            (pageHasBricks) => {
              // istanbul ignore else
              if (pageHasBricks) {
                setFrameUrls((prev) =>
                  prev.some((item) => item.frameId === frameId)
                    ? prev
                    : prev.concat({ frameId, frameURL })
                );
                setEvaluationsByFrameId(frameId, []);
                setTransformationsByFrameId(frameId, []);
              }
            }
          );
        }
      }
    }
    window.addEventListener("message", onMessage);
    return (): void => window.removeEventListener("message", onMessage);
  }, [setEvaluationsByFrameId, setTransformationsByFrameId]);

  const previewerToggled = React.useRef(false);
  useEffect(() => {
    if (!previewerToggled.current && frames.length) {
      setInspectContext(frames[0].frameId);
      previewerToggled.current = true;
    }
  }, [frames]);

  React.useEffect(() => {
    function onMessage(event: MessageEvent): void {
      let data: DehydratedPayload;
      if (
        event.data?.source === MESSAGE_SOURCE_HOOK &&
        ((data = event.data.payload), data?.type === "evaluation")
      ) {
        setEvaluationsByFrameId(event.data.frameId, (prev) =>
          (prev ?? []).concat({
            detail: hydrate(data.payload, data.repo),
            id: getUniqueId(),
          })
        );
      }

      if (
        event.data?.source === MESSAGE_SOURCE_HOOK &&
        ((data = event.data.payload), data?.type === "re-evaluation")
      ) {
        const value = hydrate(data.payload, data.repo);
        setEvaluationsByFrameId(event.data.frameId, (prev) => {
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
    window.addEventListener("message", onMessage);
    return (): void => window.removeEventListener("message", onMessage);
  }, [setEvaluationsByFrameId]);

  React.useEffect(() => {
    function onMessage(event: MessageEvent): void {
      let data: DehydratedPayload;
      if (
        event.data?.source === MESSAGE_SOURCE_HOOK &&
        ((data = event.data.payload), data?.type === "transformation")
      ) {
        setTransformationsByFrameId(event.data.frameId, (prev) =>
          (prev ?? []).concat({
            detail: hydrate(data.payload, data.repo),
            id: getUniqueId(),
          })
        );
      }

      if (
        event.data?.source === MESSAGE_SOURCE_HOOK &&
        ((data = event.data.payload), data?.type === "re-transformation")
      ) {
        const value = hydrate(data.payload, data.repo);
        setTransformationsByFrameId(event.data.frameId, (prev) => {
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
    window.addEventListener("message", onMessage);
    return (): void => window.removeEventListener("message", onMessage);
  }, [setTransformationsByFrameId]);

  React.useEffect(() => {
    function onMessage(event: MessageEvent): void {
      if (
        !preserveLogs &&
        event.data?.source === MESSAGE_SOURCE_HOOK &&
        event.data.payload?.type === "locationChange"
      ) {
        const { frameId } = event.data;
        setEvaluationsByFrameId(frameId, []);
        setTransformationsByFrameId(frameId, []);
      }
    }
    window.addEventListener("message", onMessage);
    return (): void => window.removeEventListener("message", onMessage);
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
      frames,
      inspectContext,
      setInspectContext,
    }),
    [frames, inspectContext]
  );

  const selectedPanelCtx = React.useMemo(
    () => ({
      selectedPanel,
      setSelectedPanel,
    }),
    [selectedPanel]
  );

  const setEvaluations = React.useCallback(
    (value: React.SetStateAction<Evaluation[]>) => {
      setEvaluationsByFrameId(inspectContext, value);
    },
    [inspectContext, setEvaluationsByFrameId]
  );

  const evaluationsCtx = React.useMemo(
    () => ({
      preserveLogs,
      savePreserveLogs,
      evaluations: evaluationsMap[inspectContext] ?? [],
      setEvaluations,
    }),
    [evaluationsMap, inspectContext, preserveLogs, setEvaluations]
  );

  const setTransformations = React.useCallback(
    (value: React.SetStateAction<Transformation[]>) => {
      setTransformationsByFrameId(inspectContext, value);
    },
    [inspectContext, setTransformationsByFrameId]
  );

  const transformationsCtx = React.useMemo(
    () => ({
      preserveLogs,
      savePreserveLogs,
      transformations: transformationsMap[inspectContext] ?? [],
      setTransformations,
    }),
    [preserveLogs, transformationsMap, inspectContext, setTransformations]
  );

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
