import React from "react";
import { PropView } from './PropView';
import { SelectedBrickToolbar } from './SelectedBrickToolbar';

export function SelectedBrickWrapper(): React.ReactElement {
  return (
    <div className="selected-brick-wrapper">
      <SelectedBrickToolbar />
      <PropView />
    </div>
  );
}
