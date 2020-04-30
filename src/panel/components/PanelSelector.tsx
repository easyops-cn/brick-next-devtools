import React from "react";
import { HTMLSelect } from "@blueprintjs/core";
import { useSelectedPanelContext } from "../libs/SelectedPanelContext";

export function PanelSelector({
  style,
}: {
  style?: React.CSSProperties;
}): React.ReactElement {
  const { selectedPanel, setSelectedPanel } = useSelectedPanelContext();

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    setSelectedPanel(event.target.value);
  };

  return (
    <div style={style}>
      {
        <HTMLSelect
          value={selectedPanel}
          options={["Bricks", "Evaluations", "Transformations"]}
          onChange={handleChange}
          minimal
        />
      }
    </div>
  );
}
