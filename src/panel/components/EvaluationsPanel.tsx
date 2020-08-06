import React from "react";
import {
  Button,
  Tooltip,
  ButtonGroup,
  InputGroup,
  Switch,
} from "@blueprintjs/core";
import classNames from "classnames";
import { PanelSelector } from "./PanelSelector";
import { useEvaluationsContext } from "../libs/EvaluationsContext";
import { PropList, PropItem } from "./PropList";
import {
  EVALUATION_EDIT,
  MESSAGE_SOURCE_PANEL,
  EDIT_EVALUATIONS_AND_TRANSFORMATIONS_IN_DEVTOOLS,
} from "../../shared/constants";
import { Evaluation } from "../../shared/interfaces";
import { useSupports } from "../libs/useSupports";

export function EvaluationsPanel(): React.ReactElement {
  const {
    evaluations,
    setEvaluations,
    preserveLogs,
    savePreserveLogs,
  } = useEvaluationsContext();
  const [stringWrap, setStringWrap] = React.useState(false);
  const [q, setQ] = React.useState<string>();
  const editable = useSupports(
    EDIT_EVALUATIONS_AND_TRANSFORMATIONS_IN_DEVTOOLS
  );

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
      item.detail?.raw.toLocaleLowerCase().includes(q.toLocaleLowerCase())
    );
  }, [evaluations, q]);

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

  const handleEvaluations = (item: Evaluation, value: string): void => {
    const {
      context: { DATA, EVENT },
    } = item.detail;

    window.postMessage(
      {
        source: MESSAGE_SOURCE_PANEL,
        payload: {
          type: EVALUATION_EDIT,
          context: {
            data: DATA,
            event: EVENT,
          },
          id: item.id,
          raw: value,
        },
      },
      "*"
    );
  };

  return (
    <div
      className={classNames("panel evaluations-panel", {
        "string-wrap": stringWrap,
      })}
    >
      <div className="evaluations-toolbar">
        <div className="toolbar-group">
          <PanelSelector />
          <ButtonGroup>
            <Tooltip content="Clear" hoverOpenDelay={300}>
              <Button icon="disable" minimal onClick={handleClear} />
            </Tooltip>
          </ButtonGroup>
          <InputGroup
            leftIcon="filter"
            onChange={handleFilterChange}
            placeholder="Filter expressions..."
            value={q}
          />
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
                <th>Expression</th>
                <th>Result</th>
                <th>Scope</th>
              </tr>
            </thead>
            <tbody className="source-code">
              {filteredEvaluations.map((item, key) => (
                <tr key={key}>
                  <td>
                    <PropItem
                      propValue={item.detail?.raw}
                      standalone
                      editable={editable}
                      overrideProps={(_name, _prop, value) =>
                        handleEvaluations(item, value)
                      }
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
                    <PropList list={item.detail?.context || {}} />
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
