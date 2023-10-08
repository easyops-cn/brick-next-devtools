import React from "react";
import { shallow } from "enzyme";
import { ContextPanel } from "./ContextPanel";

describe("ContextPanel", () => {
  it("should work", () => {
    const wrapper = shallow(<ContextPanel />);
    expect(wrapper.hasClass("context-panel")).toBe(true);
  });
});
