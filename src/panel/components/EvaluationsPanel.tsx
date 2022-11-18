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
import { LazyEvaluation } from "../../shared/interfaces";
import { useSupports } from "../libs/useSupports";
import { InspectContextSelector } from "./InspectContextSelector";
import { hydrate } from "../libs/hydrate";
import { Pagination } from "./Pagination";
import { LocalJsonStorage } from "../libs/Storage";

export function EvaluationsPanel(): React.ReactElement {
  const {
    evaluations,
    setEvaluations,
    preserveLogs,
    savePreserveLogs,
    logNumber,
    setLogNumber,
  } = useEvaluationsContext();
  const [stringWrap, setStringWrap] = React.useState(false);
  const [q, setQ] = React.useState<string>();
  const editable = useSupports(
    EDIT_EVALUATIONS_AND_TRANSFORMATIONS_IN_DEVTOOLS
  );
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(
    () => LocalJsonStorage.getItem("evaluationsPageSize") ?? 20
  );

  const handleClear = React.useCallback(() => {
    setEvaluations([]);
  }, [setEvaluations]);

  const handleFilterChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setQ(event.target.value);
      setPage(1);
    },
    []
  );

  const filteredEvaluations = React.useMemo(() => {
    if (!q) {
      return evaluations;
    }
    const lowerQ = q.toLowerCase();
    return evaluations.filter((item) => item.lowerRaw.includes(lowerQ));
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

  const handleEvaluations = (item: LazyEvaluation, value: string): void => {
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

  const pagedEvaluations = React.useMemo(() => {
    const list = filteredEvaluations.slice(
      (page - 1) * pageSize,
      page * pageSize
    );
    for (const item of list) {
      if (!item.hydrated) {
        item.detail = hydrate(item.payload, item.repo);
        item.hydrated = true;
        item.payload = null;
        item.repo = null;
      }
    }
    return list;
  }, [filteredEvaluations, page, pageSize]);

  const handleGotoPage = React.useCallback((targetPage: number) => {
    setPage(targetPage);
  }, []);

  const totalPages = Math.ceil(filteredEvaluations.length / pageSize);

  const handlePageSizeChange = React.useCallback((newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(1);
    LocalJsonStorage.setItem("evaluationsPageSize", newPageSize);
  }, []);

  return (
    <div
      className={classNames("panel evaluations-panel", {
        "string-wrap": stringWrap,
      })}
    >
      <div className="evaluations-toolbar">
        <div className="toolbar-group">
          <InspectContextSelector />
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
          <div className="toolbar--group-log-number-input">
            <label>Log number:</label>
            <InputGroup
              type="number"
              value={String(logNumber)}
              style={{
                width: 100,
              }}
              onChange={(e) => {
                LocalJsonStorage.setItem("logNumber", Number(e.target.value));
                setPage(1);
                setLogNumber(Number(e.target.value) ?? 0);
              }}
            />
          </div>
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
          <Pagination
            page={page}
            pageSize={pageSize}
            totalPages={totalPages}
            onGotoPage={handleGotoPage}
            onPageSizeChange={handlePageSizeChange}
          />
          <table className="bp3-html-table bp3-html-table-bordered bp3-html-table-condensed">
            <thead>
              <tr>
                <th>Expression</th>
                <th>Result</th>
                <th>Scope</th>
              </tr>
            </thead>
            <tbody className="source-code">
              {pagedEvaluations.map((item) => (
                <tr key={item.id}>
                  <td>
                    <PropItem
                      propValue={item.detail.raw}
                      standalone
                      editable={editable}
                      editAsString
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
                      <PropItem propValue={item.detail.result} standalone />
                    )}
                  </td>
                  <td>
                    <PropList list={item.detail.context || {}} />
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
