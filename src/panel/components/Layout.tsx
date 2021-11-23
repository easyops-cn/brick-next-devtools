import React from "react";
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
} from "../../shared/interfaces";
import { EvaluationsContext } from "../libs/EvaluationsContext";
import { MESSAGE_SOURCE_HOOK } from "../../shared/constants";
import { TransformationsContext } from "../libs/TransformationsContext";
import { Storage } from "../libs/Storage";
import { hydrate } from "../libs/hydrate";

let uniqueIdCounter = 0;
function getUniqueId(): number {
  return (uniqueIdCounter += 1);
}

export function Layout(): React.ReactElement {
  const [selectedPanel, setSelectedPanel] = React.useState(
    Storage.getItem("selectedPanel") ?? "Bricks"
  );
  const [evaluations, setEvaluations] = React.useState<Evaluation[]>([]);
  const [preserveLogs, savePreserveLogs] = React.useState(false);
  const [transformations, setTransformations] = React.useState<
    Transformation[]
  >([]);

  React.useEffect(() => {
    function onMessage(event: MessageEvent): void {
      let data: DehydratedPayload;
      if (
        event.data?.source === MESSAGE_SOURCE_HOOK &&
        ((data = event.data.payload), data?.type === "evaluation")
      ) {
        setEvaluations((prev) =>
          prev.concat({
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
        setEvaluations((prev) => {
          const selected = prev.find((item) => item.id === value.id);
          if (selected) {
            selected.detail = value.detail;
            selected.error = value.error;
          }
          return [...prev];
        });
      }
    }
    window.addEventListener("message", onMessage);
    return (): void => window.removeEventListener("message", onMessage);
  }, []);

  React.useEffect(() => {
    function onMessage(event: MessageEvent): void {
      let data: DehydratedPayload;
      if (
        event.data?.source === MESSAGE_SOURCE_HOOK &&
        ((data = event.data.payload), data?.type === "transformation")
      ) {
        setTransformations((prev) =>
          prev.concat({
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
        setTransformations((prev) => {
          const selected = prev.find((item) => item.id === value.id);
          if (selected) {
            selected.detail = value.detail;
            selected.error = value.error;
          }
          return [...prev];
        });
      }
    }
    window.addEventListener("message", onMessage);
    return (): void => window.removeEventListener("message", onMessage);
  }, []);

  React.useEffect(() => {
    function onMessage(event: MessageEvent): void {
      if (
        !preserveLogs &&
        event.data?.source === MESSAGE_SOURCE_HOOK &&
        event.data.payload?.type === "locationChange"
      ) {
        setEvaluations([]);
        setTransformations([]);
      }
    }
    window.addEventListener("message", onMessage);
    return (): void => window.removeEventListener("message", onMessage);
  }, [preserveLogs]);

  React.useEffect(() => {
    Storage.setItem("selectedPanel", selectedPanel);
  }, [selectedPanel]);

  const theme = chrome.devtools.panels.themeName === "dark" ? "dark" : "light";

  React.useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  return (
    <div
      className={classNames("layout bp3-focus-disabled", {
        "bp3-dark": theme === "dark",
      })}
    >
      <BrowserThemeContext.Provider value={theme}>
        <SelectedPanelContext.Provider
          value={{ selectedPanel, setSelectedPanel }}
        >
          {selectedPanel === "Evaluations" ? (
            <EvaluationsContext.Provider
              value={{
                evaluations,
                setEvaluations,
                preserveLogs,
                savePreserveLogs,
              }}
            >
              <EvaluationsPanel />
            </EvaluationsContext.Provider>
          ) : selectedPanel === "Transformations" ? (
            <TransformationsContext.Provider
              value={{
                transformations,
                setTransformations,
                preserveLogs,
                savePreserveLogs,
              }}
            >
              <TransformationsPanel />
            </TransformationsContext.Provider>
          ) : (
            <BricksPanel />
          )}
        </SelectedPanelContext.Provider>
      </BrowserThemeContext.Provider>
    </div>
  );
}
