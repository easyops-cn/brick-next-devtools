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

export function Layout(): React.ReactElement {
  const [selectedPanel, setSelectedPanel] = React.useState(
    Storage.getItem("selectedPanel") ?? "Bricks"
  );
  const [evaluations, setEvaluations] = React.useState<Evaluation[]>([]);
  const [preserveLogs, savePreserveLogs] = React.useState<boolean>(true);
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
        setEvaluations((prev) => prev.concat(hydrate(data.payload, data.repo)));
      } else if (
        event.data?.source === MESSAGE_SOURCE_HOOK &&
        ((data = event.data.payload), data?.type === "locationChange") &&
        !(preserveLogs ?? true)
      ) {
        setEvaluations([]);
      }
    }
    window.addEventListener("message", onMessage);
    return (): void => window.removeEventListener("message", onMessage);
  }, [preserveLogs]);

  React.useEffect(() => {
    function onMessage(event: MessageEvent): void {
      let data: DehydratedPayload;
      if (
        event.data?.source === MESSAGE_SOURCE_HOOK &&
        ((data = event.data.payload), data?.type === "transformation")
      ) {
        setTransformations((prev) =>
          prev.concat(hydrate(data.payload, data.repo))
        );
      } else if (
        event.data?.source === MESSAGE_SOURCE_HOOK &&
        ((data = event.data.payload), data?.type === "locationChange") &&
        !(preserveLogs ?? true)
      ) {
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
