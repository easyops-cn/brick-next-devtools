import React from "react";
import { HTMLSelect } from "@blueprintjs/core";
import { useSelectedInspectContext } from "../libs/SelectedInspectContext";

export function InspectContextSelector(): React.ReactElement {
  const {
    frames,
    inspectContext,
    setInspectContext,
  } = useSelectedInspectContext();

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    setInspectContext(+event.target.value);
  };

  if (!frames?.length) {
    return null;
  }

  return (
    <div className="inspect-context-selector">
      <HTMLSelect
        value={inspectContext}
        options={[
          {
            label: "Top frame",
            value: 0,
          },
          ...frames.map(({ frameId }, index) => ({
            label: `Frame ${index + 1}`,
            value: frameId,
          })),
        ]}
        onChange={handleChange}
        minimal
      />
    </div>
  );
}
