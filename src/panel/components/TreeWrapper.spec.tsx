import React from "react";
import { shallow } from "enzyme";
import { TreeWrapper } from "./TreeWrapper";

describe("TreeWrapper", () => {
  it("should work", () => {
    const wrapper = shallow(<TreeWrapper />);
    expect(wrapper.hasClass("tree-wrapper")).toBe(true);
  });
});
