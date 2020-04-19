import React from "react";
import { shallow } from "enzyme";
import { BricksPanel } from "./BricksPanel";

describe("BricksPanel", () => {
  it("should work", () => {
    const wrapper = shallow(<BricksPanel />);
    expect(wrapper.hasClass("bricks-panel")).toBe(true);
  });
});
