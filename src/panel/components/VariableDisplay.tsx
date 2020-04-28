import React from "react";
import classNames from "classnames";
import { PROP_DEHYDRATED } from "../../shared/constants";
import { DehydratedWrapper } from "../../shared/interfaces";
import { isDehydrated, isObject } from "../libs/utils";

interface VariableDisplayProps<T = any> {
  value: T;
  minimal?: boolean;
  expanded?: boolean;
}

export function VariableDisplay(
  props: VariableDisplayProps
): React.ReactElement {
  const value = props.value;
  if (isDehydrated(value)) {
    return <DehydratedDisplay {...props} />;
  }
  if (Array.isArray(value)) {
    return <ArrayDisplay {...props} />;
  }
  if (isObject(value)) {
    return <ObjectDisplay {...props} />;
  }
  switch (typeof value) {
    case "string":
      return <StringDisplay {...props} />;
    case "function":
      return <FunctionDisplay />;
    default:
      return <PrimitiveDisplay {...props} />;
  }
}

export function ArrayDisplay({
  value,
  minimal,
  expanded,
}: VariableDisplayProps<any[]>): React.ReactElement {
  if (minimal || expanded) {
    return (
      <span className="variable-internal-type">{`Array(${value.length})`}</span>
    );
  }

  return (
    <span className="variable-array">
      <span className="variable-array-length">{` (${value.length}) `}</span>[
      {value.map((item, index, array) => (
        <React.Fragment key={index}>
          <VariableDisplay value={item} minimal />
          {index < array.length - 1 && ", "}
        </React.Fragment>
      ))}
      ]
    </span>
  );
}

interface ObjectDisplayProps
  extends VariableDisplayProps<Record<string | number, any>> {
  constructorName?: string;
}

export function ObjectDisplay({
  value,
  minimal,
  expanded,
  constructorName,
}: ObjectDisplayProps): React.ReactElement {
  if (constructorName && (minimal || expanded)) {
    return <span className="variable-type">{constructorName}</span>;
  }

  if (minimal) {
    return <span className="variable-ellipsis">{`{…}`}</span>;
  }

  if (expanded) {
    return <span className="variable-internal-type">Object</span>;
  }

  return (
    <span className="variable-object">
      {constructorName && (
        <span className="variable-type">{`${constructorName} `}</span>
      )}
      {"{"}
      {Object.entries(value).map((entry, index, array) => (
        <React.Fragment key={entry[0]}>
          <ObjectEntryDisplay propName={entry[0]} propValue={entry[1]} />
          {index < array.length - 1 && ", "}
        </React.Fragment>
      ))}
      {"}"}
    </span>
  );
}

interface ObjectEntryDisplayProps {
  propName: string | number;
  propValue: any;
}

export function ObjectEntryDisplay({
  propName,
  propValue,
}: ObjectEntryDisplayProps): React.ReactElement {
  return (
    <span className="variable-object-entry">
      <span className="variable-prop-name">{propName}</span>
      <span className="variable-prop-punctuation">:</span>{" "}
      <span className="variable-prop-value">
        <VariableDisplay value={propValue} minimal />
      </span>
    </span>
  );
}

export function StringDisplay({
  value,
  minimal,
}: VariableDisplayProps<string>): React.ReactElement {
  if (minimal) {
    return <span className="variable-string">{`"${value}"`}</span>;
  }
  return (
    <span className="variable-string-full">
      <span className="variable-punctuation">{'"'}</span>
      <span className="variable-string" title={value}>
        {value}
      </span>
      <span className="variable-punctuation">{'"'}</span>
    </span>
  );
}

export function FunctionDisplay(): React.ReactElement {
  return <span className="variable-function">ƒ</span>;
}

export function PrimitiveDisplay({
  value,
}: VariableDisplayProps): React.ReactElement {
  return (
    <span
      className={classNames("variable-primitive", {
        "variable-nil": value === null || value === undefined,
      })}
    >
      {String(value)}
    </span>
  );
}

export function DehydratedDisplay({
  value,
  minimal,
  expanded,
}: VariableDisplayProps<DehydratedWrapper>): React.ReactElement {
  const dehydrated = value[PROP_DEHYDRATED];
  switch (dehydrated.type) {
    case "object":
      return (
        <ObjectDisplay
          value={dehydrated.children || {}}
          minimal={minimal}
          expanded={expanded}
          constructorName={dehydrated.constructorName}
        />
      );
    // Should never reach `default`.
    // istanbul ignore next
    default:
      return (
        <span className="variable-unexpected">{`Unexpected: ${dehydrated.type}`}</span>
      );
  }
}
