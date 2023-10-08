import React from "react";
import { InspectContextSelector } from "./InspectContextSelector";
import { PanelSelector } from "./PanelSelector";
import { HOOK_NAME, MESSAGE_SOURCE_HOOK } from "../../shared/constants";
import { useEvalOptions } from "../libs/useEvalOptions";
import { PropList } from "./PropList";
import { Button, ButtonGroup, Tooltip } from "@blueprintjs/core";

export function ContextPanel(): React.ReactElement {
  const [values, setValues] = React.useState<Record<string, unknown> | null>(
    {}
  );
  const evalOptions = useEvalOptions();

  const handleRefresh = React.useCallback(() => {
    chrome.devtools.inspectedWindow.eval(
      `window.${HOOK_NAME} && window.${HOOK_NAME}.getContext()`,
      evalOptions,
      function (result: Record<string, unknown>, error) {
        // istanbul ignore if
        if (error) {
          console.error("getContext()", error);
          setValues(null);
        } else {
          setValues(result);
        }
      }
    );
  }, [evalOptions]);

  React.useEffect(() => {
    handleRefresh();
  }, [handleRefresh]);

  React.useEffect(() => {
    function onMessage(event: MessageEvent): void {
      if (
        event.data?.source === MESSAGE_SOURCE_HOOK &&
        event.data.payload?.type === "rendered"
      ) {
        handleRefresh();
      }
    }
    window.addEventListener("message", onMessage);
    return (): void => window.removeEventListener("message", onMessage);
  }, [handleRefresh]);

  return (
    <div className="panel context-panel">
      <div className="context-toolbar">
        <div className="toolbar-group">
          <InspectContextSelector />
          <PanelSelector />
          <ButtonGroup>
            <Tooltip content="Refresh context" hoverOpenDelay={300}>
              <Button icon="refresh" minimal onClick={handleRefresh} />
            </Tooltip>
          </ButtonGroup>
        </div>
      </div>
      <div className="context-view source-code">
        <div className="scroll-container">
          {values && <PropList list={values} />}
        </div>
      </div>
    </div>
  );
}
