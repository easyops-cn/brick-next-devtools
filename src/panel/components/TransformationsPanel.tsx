import React from "react";
import { Button, Tooltip, ButtonGroup } from "@blueprintjs/core";
import { PanelSelector } from "./PanelSelector";
import { useTransformationsContext } from "../libs/TransformationsContext";
import { PropItem } from "./PropList";

export function TransformationsPanel(): React.ReactElement {
  const { transformations, setTransformations } = useTransformationsContext();

  const handleClear = React.useCallback(() => {
    setTransformations([]);
  }, [setTransformations]);

  return (
    <div className="panel transformations-panel">
      <div className="transformations-toolbar">
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
                <th>Transform</th>
                <th>Result</th>
                <th>Data</th>
                <th style={{ width: "15%" }}>Options</th>
              </tr>
            </thead>
            <tbody className="source-code">
              {transformations.map((item, key) => (
                <tr key={key}>
                  <td>
                    <PropItem propValue={item.transform} standalone />
                  </td>
                  <td>
                    <PropItem propValue={item.result} standalone />
                  </td>
                  <td>
                    <PropItem propValue={item.data} standalone />
                  </td>
                  <td>
                    <PropItem propValue={item.options} standalone />
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
