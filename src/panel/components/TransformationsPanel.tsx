import React from "react";
import { Button, Tooltip, ButtonGroup, Switch } from "@blueprintjs/core";
import classNames from "classnames";
import { PanelSelector } from "./PanelSelector";
import { useTransformationsContext } from "../libs/TransformationsContext";
import { PropItem } from "./PropList";
import { Storage } from "../libs/Storage";

export function TransformationsPanel(): React.ReactElement {
  const {
    transformations,
    setTransformations,
    preserveLogs,
    savePreserveLogs,
  } = useTransformationsContext();
  const [stringWrap, setStringWrap] = React.useState(false);

  const handleClear = React.useCallback(() => {
    setTransformations([]);
  }, [setTransformations]);

  const handleToggleStringWrap = React.useCallback(
    (event: React.FormEvent<HTMLInputElement>) => {
      setStringWrap((event.target as HTMLInputElement).checked);
    },
    []
  );

  const handleToggleLogs = React.useCallback(
    (event: React.FormEvent<HTMLInputElement>) => {
      savePreserveLogs((event.target as HTMLInputElement).checked);
      // Storage.setItem(
      //   "preserveLogs",
      //   (event.target as HTMLInputElement).checked
      // );
    },
    []
  );

  return (
    <div
      className={classNames("panel transformations-panel", {
        "string-wrap": stringWrap,
      })}
    >
      <div className="transformations-toolbar">
        <div className="toolbar-group">
          <PanelSelector />
          <ButtonGroup>
            <Tooltip content="Clear" hoverOpenDelay={300}>
              <Button icon="disable" minimal onClick={handleClear} />
            </Tooltip>
          </ButtonGroup>
        </div>
        <div className="toolbar-group">
          <Switch
            checked={preserveLogs}
            label="Preserve logs"
            onChange={handleToggleLogs}
          />
          <Switch
            checked={stringWrap}
            label="String wrap"
            onChange={handleToggleStringWrap}
          />
        </div>
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
                    <PropItem
                      propValue={Object.fromEntries(
                        Object.entries(item.options).filter(
                          (entry) => entry[1] !== undefined
                        )
                      )}
                      standalone
                    />
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
