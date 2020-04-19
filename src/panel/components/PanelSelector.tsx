import React from "react";
import { HTMLSelect } from "@blueprintjs/core";
import { useSelectedPanelContext } from "../libs/SelectedPanelContext";

export function PanelSelector(): React.ReactElement {
  const { selectedPanel, setSelectedPanel } = useSelectedPanelContext();

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    setSelectedPanel(event.target.value);
  };

  return (
    <div>
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
