import React from "react";
import { Button, Tooltip, ButtonGroup, InputGroup } from "@blueprintjs/core";
import { PanelSelector } from "./PanelSelector";
import { useEvaluationsContext } from "../libs/EvaluationsContext";
import { PropList, PropItem } from "./PropList";

export function EvaluationsPanel(): React.ReactElement {
  const { evaluations, setEvaluations } = useEvaluationsContext();
  const [q, setQ] = React.useState<string>();

  const handleClear = React.useCallback(() => {
    setEvaluations([]);
  }, [setEvaluations]);

  const handleFilterChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setQ(event.target.value);
    },
    []
  );

  const filteredEvaluations = React.useMemo(() => {
    if (!q) {
      return evaluations;
    }
    return evaluations.filter((item) =>
      item.raw.toLocaleLowerCase().includes(q.toLocaleLowerCase())
    );
  }, [evaluations, q]);

  return (
    <div className="panel evaluations-panel">
      <div className="evaluations-toolbar">
        <div style={{ display: "flex", alignItems: "center" }}>
          <PanelSelector />
          <InputGroup
            leftIcon="filter"
            onChange={handleFilterChange}
            placeholder="Filter expressions..."
            value={q}
          />
        </div>
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
              {filteredEvaluations.map((item, key) => (
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
