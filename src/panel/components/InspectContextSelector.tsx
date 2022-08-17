import React from "react";
import { HTMLSelect } from "@blueprintjs/core";
import classNames from "classnames";
import { useSelectedInspectContext } from "../libs/SelectedInspectContext";
import { Storage } from "../libs/Storage";

const FRAME_COUNT = 3;

export function InspectContextSelector(): React.ReactElement {
  const {
    framesRef,
    inspectFrameIndex,
    setInspectFrameIndex,
  } = useSelectedInspectContext();

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    const newInspectFrameIndex = +event.target.value;
    setInspectFrameIndex(newInspectFrameIndex);
    Storage.setItem("inspectFrameIndex", newInspectFrameIndex);
    console.log("inspect context change:", newInspectFrameIndex);
  };

  return (
    <div
      className={classNames({
        "inspect-inner-frame": inspectFrameIndex > 0,
        "inspect-frame-unavailable":
          inspectFrameIndex > 0 && !framesRef.current.has(inspectFrameIndex),
      })}
    >
      <HTMLSelect
        value={inspectFrameIndex}
        options={[
          ...new Array(FRAME_COUNT).fill(null).map((_, index) => ({
            label: index === 0 ? "Top frame" : `Frame ${index}`,
            value: index,
          })),
        ]}
        onChange={handleChange}
        minimal
      />
    </div>
  );
}
