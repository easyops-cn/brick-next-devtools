import React from "react";
import { shallow } from "enzyme";
import { HTMLSelect } from "@blueprintjs/core";
import { PanelSelector } from "./PanelSelector";
import { useSelectedPanelContext } from "../libs/SelectedPanelContext";

jest.mock("../libs/SelectedPanelContext");
const setSelectedPanel = jest.fn();
(useSelectedPanelContext as jest.Mock).mockReturnValue({
  selectedPanel: "Bricks",
  setSelectedPanel,
});

describe("PanelSelector", () => {
  afterEach(() => {
    setSelectedPanel.mockClear();
  });

  it("should work", () => {
    const wrapper = shallow(<PanelSelector />);
    expect(wrapper.find(HTMLSelect).prop("value")).toBe("Bricks");
  });

  it("should handle change", () => {
    const wrapper = shallow(<PanelSelector />);
    wrapper.find(HTMLSelect).invoke("onChange")({
      target: {
        value: "Evaluations",
      },
    } as any);
    expect(setSelectedPanel).toBeCalledWith("Evaluations");
  });
});
