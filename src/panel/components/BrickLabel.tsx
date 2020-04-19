import React from "react";
import { Tooltip, Tag } from "@blueprintjs/core";
import { useShowFullNameContext } from "../libs/ShowFullNameContext";

interface BrickLabelProps {
  tagName: string;
}

const warningBricksMap = new Map<string, string>([
  ["basic-bricks.micro-app", "Use `basic-bricks.micro-view` instead."],
]);

const dangerBricksMap = new Map<string, string>([
  ["basic-bricks.script-brick", "Use evaluate-placeholders instead."],
]);

export function BrickLabel({ tagName }: BrickLabelProps): React.ReactElement {
  const { showFullName } = useShowFullNameContext();
  return (
    <span className="brick-label">
      <span className="brick-title">
        {showFullName ? tagName : tagName.split(".").slice(-1)[0]}
      </span>
      {warningBricksMap.has(tagName) ? (
        <Tooltip content={warningBricksMap.get(tagName)}>
          <Tag intent="warning">warn</Tag>
        </Tooltip>
      ) : dangerBricksMap.has(tagName) ? (
        <Tooltip content={dangerBricksMap.get(tagName)}>
          <Tag intent="danger">danger</Tag>
        </Tooltip>
      ) : null}
    </span>
  );
}
