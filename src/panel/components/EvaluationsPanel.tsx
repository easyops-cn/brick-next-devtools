import React from "react";
import { Button, Tooltip, ButtonGroup } from "@blueprintjs/core";
import { PanelSelector } from "./PanelSelector";
import { useEvaluationsContext } from "../libs/EvaluationsContext";
import { PropList, PropItem } from "./PropList";

export function EvaluationsPanel(): React.ReactElement {
  const { evaluations, setEvaluations } = useEvaluationsContext();

  const handleClear = React.useCallback(() => {
    setEvaluations([]);
  }, [setEvaluations]);

  return (
    <div className="panel evaluations-panel">
      <div className="evaluations-toolbar">
        <PanelSelector />
        <ButtonGroup>
          <Tooltip content="Clear" hoverOpenDelay={300}>
            <Button icon="disable" minimal onClick={handleClear} />
          </Tooltip>
        </ButtonGroup>
      </div>
      <div className="table-view">
        <div className="scroll-container">
          <table className="bp3-html-table bp3-html-table-bordered bp3-html-table-condensed">
            <thead>
              <tr>
                <th>Expression</th>
                <th>Result</th>
                <th>Context</th>
              </tr>
            </thead>
            <tbody className="source-code">
              {evaluations.map((item, key) => (
                <tr key={key}>
                  <td>
                    <PropItem propValue={item.raw} standalone />
                  </td>
                  <td>
                    <PropItem propValue={item.result} standalone />
                  </td>
                  <td>
                    <PropList list={item.context || {}} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
