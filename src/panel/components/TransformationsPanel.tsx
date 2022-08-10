import React from "react";
import { Button, Tooltip, ButtonGroup, Switch } from "@blueprintjs/core";
import classNames from "classnames";
import { PanelSelector } from "./PanelSelector";
import { useTransformationsContext } from "../libs/TransformationsContext";
import { PropItem } from "./PropList";
import {
  TRANSFORMATION_EDIT,
  MESSAGE_SOURCE_PANEL,
  EDIT_EVALUATIONS_AND_TRANSFORMATIONS_IN_DEVTOOLS,
} from "../../shared/constants";
import { Transformation } from "../../shared/interfaces";
import { useSupports } from "../libs/useSupports";
import { InspectContextSelector } from "./InspectContextSelector";

export function TransformationsPanel(): React.ReactElement {
  const {
    transformations,
    setTransformations,
    preserveLogs,
    savePreserveLogs,
  } = useTransformationsContext();
  const [stringWrap, setStringWrap] = React.useState(false);
  const editable = useSupports(
    EDIT_EVALUATIONS_AND_TRANSFORMATIONS_IN_DEVTOOLS
  );

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
    },
    [savePreserveLogs]
  );

  const handleTransform = (item: Transformation, value: any): void => {
    const { options, data } = item.detail;
    window.postMessage(
      {
        source: MESSAGE_SOURCE_PANEL,
        payload: {
          type: TRANSFORMATION_EDIT,
          options,
          data,
          id: item.id,
          transform: value,
        },
      },
      "*"
    );
  };

  return (
    <div
      className={classNames("panel transformations-panel", {
        "string-wrap": stringWrap,
      })}
    >
      <div className="transformations-toolbar">
        <div className="toolbar-group">
          <InspectContextSelector />
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
              {transformations.map((item, key) => {
                return (
                  <tr key={key}>
                    <td>
                      <PropItem
                        overrideProps={(_name, _prop, value) =>
                          handleTransform(item, value)
                        }
                        propValue={item.detail?.transform}
                        standalone
                        editable={editable}
                      />
                    </td>
                    <td>
                      {item.error ? (
                        <code className="bp3-code error-message">
                          Error: {item.error}
                        </code>
                      ) : (
                        <PropItem propValue={item.detail?.result} standalone />
                      )}
                    </td>
                    <td>
                      <PropItem propValue={item.detail?.data} standalone />
                    </td>
                    <td>
                      <PropItem
                        propValue={Object.fromEntries(
                          Object.entries(item.detail?.options).filter(
                            (entry) => entry[1] !== undefined
                          )
                        )}
                        standalone
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
