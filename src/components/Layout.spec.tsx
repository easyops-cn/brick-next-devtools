import React from "react";
import { shallow } from "enzyme";
import { Layout } from "./Layout";

const mockPanels: Record<string, any> = {};
(window as any).chrome = {
  devtools: {
    panels: mockPanels,
  },
};

describe("Layout", () => {
  it("should work as default theme", () => {
    mockPanels.themeName = undefined;
    const wrapper = shallow(<Layout />);
    expect(wrapper.hasClass("bp3-dark")).toBe(false);
  });

  it("should work as dark theme", () => {
    mockPanels.themeName = "dark";
    const wrapper = shallow(<Layout />);
    expect(wrapper.hasClass("bp3-dark")).toBe(true);
  });
});
