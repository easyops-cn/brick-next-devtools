import React, { useEffect } from "react";
import classNames from "classnames";
import { Icon, TextArea } from "@blueprintjs/core";
import { PROP_DEHYDRATED } from "../../shared/constants";
import { VariableDisplay } from "./VariableDisplay";
import { isDehydrated, isObject } from "../libs/utils";

interface PropListProps {
  list: any[] | Record<string, any>;
  editable?: boolean;
  overrideProps?: (propName: string, propValue: string, result?: any) => void;
}

export function PropList({
  list,
  editable,
  overrideProps,
}: PropListProps): React.ReactElement {
  const value = isDehydrated(list)
    ? list[PROP_DEHYDRATED].children || {}
    : list;
  return (
    <ul className="prop-list">
      {Array.isArray(value)
        ? value.map((item, index) => (
            <PropItem
              key={index}
              propName={String(index)}
              propValue={item}
              overrideProps={overrideProps}
              editable={editable}
            />
          ))
        : Object.entries(value).map((entry) => (
            <PropItem
              key={entry[0]}
              propName={entry[0]}
              propValue={entry[1]}
              overrideProps={overrideProps}
              editable={editable}
            />
          ))}
    </ul>
  );
}

interface PropItemProps {
  propValue: any;
  propName?: string;
  standalone?: boolean;
  editable?: boolean;
  editAsString?: boolean;
  overrideProps?: (propName: string, propValue: string, result?: any) => void;
}

export function PropItem({
  propValue,
  propName,
  standalone,
  editable,
  editAsString,
  overrideProps,
}: PropItemProps): React.ReactElement {
  const [expanded, setExpanded] = React.useState(false);
  const [editing, setEditing] = React.useState(false);

  const initialChangeValue = React.useMemo(() => {
    return editable
      ? editAsString
        ? propValue
        : JSON.stringify(propValue, null, 2)
      : null;
  }, [editable, editAsString, propValue]);

  const [changeValue, setChangeValue] = React.useState(initialChangeValue);
  const [error, setError] = React.useState(false);

  useEffect(() => {
    setChangeValue(initialChangeValue);
  }, [initialChangeValue]);

  const handleClick = React.useCallback(() => {
    setExpanded(!expanded);
  }, [expanded]);

  const handleDoubleClick = React.useCallback(() => {
    if (editable) {
      setEditing(true);
    }
  }, [editable]);

  const handleBlur = (): void => {
    try {
      let result;
      if (editAsString) {
        result = changeValue || "";
      } else if (changeValue === "" || changeValue === undefined) {
        result = undefined;
      } else {
        result = JSON.parse(changeValue);
      }
      overrideProps?.(propName, changeValue, result);
      setEditing(false);
      setError(false);
    } catch (error) {
      setError(true);
    }
  };

  const handleChange = (v: React.ChangeEvent<HTMLTextAreaElement>): void => {
    setChangeValue(v.target?.value);
  };

  const hasChildren = isObject(propValue);

  return React.createElement(
    standalone ? "div" : "li",
    {
      className: classNames("prop-item", { expanded }),
    },
    <>
      <div className="bp3-text-overflow-ellipsis prop-item-label">
        <span onClick={handleClick} data-testid="prop-name-wrapper">
          {(!standalone || hasChildren) && (
            <Icon
              icon={
                hasChildren && !editing
                  ? expanded
                    ? "caret-down"
                    : "caret-right"
                  : "blank"
              }
              iconSize={16}
            />
          )}
          {!standalone && (
            <>
              <span className="prop-name">{propName}</span>
              <span className="prop-punctuation">:</span>{" "}
            </>
          )}
        </span>
        {editing && editable ? (
          <TextArea
            growVertically={true}
            onChange={handleChange}
            onBlur={handleBlur}
            value={changeValue}
            className={`prop-editable ${error ? "bp3-intent-danger" : ""}`}
            autoFocus
          />
        ) : (
          <span className="prop-value" onDoubleClick={handleDoubleClick}>
            <VariableDisplay value={propValue} expanded={expanded} />
          </span>
        )}
      </div>
      {hasChildren && expanded && !editing && (
        <div onDoubleClick={handleDoubleClick}>
          <PropList list={propValue} />
        </div>
      )}
    </>
  );
}
