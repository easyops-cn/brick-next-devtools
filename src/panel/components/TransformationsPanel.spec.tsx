import React from "react";
import { shallow } from "enzyme";
import { Button, Switch } from "@blueprintjs/core";
import { TransformationsPanel } from "./TransformationsPanel";
import { useTransformationsContext } from "../libs/TransformationsContext";

jest.mock("../libs/TransformationsContext");
const setTransformations = jest.fn();
(useTransformationsContext as jest.Mock).mockReturnValue({
  transformations: [
    {
      transform: "quality",
      result: {
        quality: "good",
      },
      data: "good",
      options: {
        from: "list",
        mapArray: undefined,
      },
    },
  ],
  setTransformations,
});

describe("TransformationsPanel", () => {
  afterEach(() => {
    setTransformations.mockClear();
  });

  it("should work", () => {
    const wrapper = shallow(<TransformationsPanel />);
    expect(wrapper.find("tbody").find("tr").length).toBe(1);
  });

  it("should toggle string-wrap", () => {
    const wrapper = shallow(<TransformationsPanel />);
    expect(wrapper.hasClass("string-wrap")).toBe(false);
    wrapper.find(Switch).invoke("onChange")({
      target: {
        checked: true,
      },
    } as any);
    expect(wrapper.hasClass("string-wrap")).toBe(true);
  });

  it("should handle clear", () => {
    const wrapper = shallow(<TransformationsPanel />);
    wrapper.find(Button).invoke("onClick")(null);
    expect(setTransformations).toBeCalled();
  });
});
