import React from "react";
import classNames from "classnames";
import { Icon } from "@blueprintjs/core";

function isObject(value: any): value is Record<string, any> {
  return typeof value === "object" && value;
}

interface PropTreeProps {
  properties: any[] | Record<string, any>;
}

export function PropTree({ properties }: PropTreeProps): React.ReactElement {
  return (
    <ul className="prop-tree">
      {Array.isArray(properties)
        ? properties.map((item, index) => (
            <PropItem key={index} propName={String(index)} propValue={item} />
          ))
        : Object.entries(properties).map((entry) => (
            <PropItem key={entry[0]} propName={entry[0]} propValue={entry[1]} />
          ))}
    </ul>
  );
}

interface PropItemProps {
  propName: string;
  propValue: any;
}

export function PropItem({
  propName,
  propValue,
}: PropItemProps): React.ReactElement {
  const [expanded, setExpanded] = React.useState(false);

  const handleClick = React.useCallback(() => {
    setExpanded(!expanded);
  }, [expanded]);

  const hasChildren = isObject(propValue);

  return (
    <li className={classNames("prop-item", { expanded })}>
      <div
        className="bp3-text-overflow-ellipsis prop-item-label"
        onClick={handleClick}
      >
        <Icon
          icon={
            hasChildren ? (expanded ? "caret-down" : "caret-right") : "blank"
          }
          iconSize={16}
        />
        <span className="prop-name">{propName}</span>
        <span className="prop-punctuation">:</span>{" "}
        <span className="prop-value">
          <ValueStringify value={propValue} expanded={expanded} />
        </span>
      </div>
      {isObject(propValue) && expanded && <PropTree properties={propValue} />}
    </li>
  );
}

interface ValueStringifyProps {
  value: any;
  expanded?: boolean;
}

export function ValueStringify({
  value,
  expanded,
}: ValueStringifyProps): React.ReactElement {
  if (Array.isArray(value)) {
    if (expanded) {
      return <span className="prop-value-expanded">Array({value.length})</span>;
    }

    return (
      <span className="prop-value-array">
        <span className="prop-value-array-length">{` (${value.length}) `}</span>
        [
        {value.map((item, index, array) => (
          <React.Fragment key={index}>
            <ValueItemStringify item={item} />
            {index < array.length - 1 && ", "}
          </React.Fragment>
        ))}
        ]
      </span>
    );
  }

  if (isObject(value)) {
    if (expanded) {
      return null;
    }

    return (
      <span className="prop-value-object">
        {"{"}
        {Object.entries(value).map((entry, index, array) => (
          <React.Fragment key={entry[0]}>
            <ObjectPropStringify propName={entry[0]} propValue={entry[1]} />
            {index < array.length - 1 && ", "}
          </React.Fragment>
        ))}
        {"}"}
      </span>
    );
  }

  if (typeof value === "string") {
    return (
      <>
        <span className="prop-value-punctuation">{'"'}</span>
        <span className="prop-value-item-string">{value}</span>
        <span className="prop-value-punctuation">{'"'}</span>
      </>
    );
  }

  if (typeof value === "function") {
    return <span className="prop-value-function">ƒ</span>;
  }

  return (
    <span
      className={classNames("prop-value-primitive", {
        "prop-value-nil": value === null || value === undefined,
      })}
    >
      {String(value)}
    </span>
  );
}

interface ValueItemStringifyProps {
  item: any;
}

export function ValueItemStringify({
  item,
}: ValueItemStringifyProps): React.ReactElement {
  if (Array.isArray(item)) {
    return <span className="prop-value-item">{`Array(${item.length})`}</span>;
  }

  if (isObject(item)) {
    return <span className="prop-value-item">{`{…}`}</span>;
  }

  if (typeof item === "string") {
    return <span className="prop-value-item-string">{`"${item}"`}</span>;
  }

  if (typeof item === "function") {
    return <span className="prop-value-item-function">ƒ</span>;
  }

  return (
    <span
      className={classNames("prop-value-item-primitive", {
        "prop-value-item-nil": item === null || item === undefined,
      })}
    >
      {String(item)}
    </span>
  );
}

interface ObjectPropStringifyProps {
  propName: string;
  propValue: any;
}

export function ObjectPropStringify({
  propName,
  propValue,
}: ObjectPropStringifyProps): React.ReactElement {
  return (
    <span className="prop-value-object-prop">
      <span className="prop-value-object-prop-name">{propName}</span>
      <span className="prop-value-punctuation">:</span>{" "}
      <span className="prop-value-object-prop-value">
        <ValueItemStringify item={propValue} />
      </span>
    </span>
  );
}
