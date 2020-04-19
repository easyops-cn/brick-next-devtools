import React from "react";
import classNames from "classnames";
import { Icon } from "@blueprintjs/core";
import { PROP_DEHYDRATED } from "../../shared/constants";
import { VariableDisplay } from "./VariableDisplay";
import { isDehydrated, isObject } from "../libs/utils";

interface PropListProps {
  list: any[] | Record<string, any>;
}

export function PropList({ list }: PropListProps): React.ReactElement {
  const value = isDehydrated(list)
    ? list[PROP_DEHYDRATED].children || {}
    : list;
  return (
    <ul className="prop-list">
      {Array.isArray(value)
        ? value.map((item, index) => (
            <PropItem key={index} propName={String(index)} propValue={item} />
          ))
        : Object.entries(value).map((entry) => (
            <PropItem key={entry[0]} propName={entry[0]} propValue={entry[1]} />
          ))}
    </ul>
  );
}

interface PropItemProps {
  propValue: any;
  propName?: string;
  standalone?: boolean;
}

export function PropItem({
  propValue,
  propName,
  standalone,
}: PropItemProps): React.ReactElement {
  const [expanded, setExpanded] = React.useState(false);

  const handleClick = React.useCallback(() => {
    setExpanded(!expanded);
  }, [expanded]);

  const hasChildren = isObject(propValue);

  return React.createElement(
    standalone ? "div" : "li",
    {
      className: classNames("prop-item", { expanded }),
    },
    <>
      <div
        className="bp3-text-overflow-ellipsis prop-item-label"
        onClick={handleClick}
      >
        {(!standalone || hasChildren) && (
          <Icon
            icon={
              hasChildren ? (expanded ? "caret-down" : "caret-right") : "blank"
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
        <span className="prop-value">
          <VariableDisplay value={propValue} expanded={expanded} />
        </span>
      </div>
      {hasChildren && expanded && <PropList list={propValue} />}
    </>
  );
}
