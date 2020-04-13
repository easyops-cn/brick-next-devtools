import React from "react";
import { shallow } from "enzyme";
import { SelectedBrickWrapper } from "./SelectedBrickWrapper";

describe("SelectedBrickWrapper", () => {
  it("should work", () => {
    const wrapper = shallow(<SelectedBrickWrapper />);
    expect(wrapper.hasClass("selected-brick-wrapper")).toBe(true);
  });
});
