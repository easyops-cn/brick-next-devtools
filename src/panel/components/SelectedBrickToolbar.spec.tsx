import React from "react";
import { shallow } from "enzyme";
import { Button } from "@blueprintjs/core";
import { SelectedBrickToolbar } from "./SelectedBrickToolbar";
import { useSelectedBrickContext } from "../libs/SelectedBrickContext";

jest.mock("../libs/SelectedBrickContext");

(useSelectedBrickContext as jest.Mock).mockReturnValue({ selectedBrick: null });

const mockEval = jest.fn();

(window as any).chrome = {
  devtools: {
    inspectedWindow: {
      eval: mockEval,
    },
  },
};

describe("SelectedBrickToolbar", () => {
  afterEach(() => {
    mockEval.mockClear();
  });

  it("should work when no brick is selected", () => {
    const wrapper = shallow(<SelectedBrickToolbar />);
    expect(wrapper.find(".brick-title").length).toBe(0);
  });

  it("should work when a brick is selected", () => {
    const selectedBrick = {
      uid: 1,
      tagName: "your.awesome-brick",
    };
    (useSelectedBrickContext as jest.Mock).mockReturnValue({ selectedBrick });

    const wrapper = shallow(<SelectedBrickToolbar />);

    expect(wrapper.find(".brick-title").text()).toBe("your.awesome-brick");

    wrapper.find(Button).at(0).invoke("onClick")(null);
    expect(mockEval).toHaveBeenNthCalledWith(
      1,
      "inspect(window.__BRICK_NEXT_DEVTOOLS_HOOK__.getBrickByUid(1));",
      {}
    );

    wrapper.find(Button).at(1).invoke("onClick")(null);
    expect(mockEval).toHaveBeenNthCalledWith(
      2,
      "inspect(window.__BRICK_NEXT_DEVTOOLS_HOOK__.getBrickByUid(1).constructor);",
      {}
    );

    (useSelectedBrickContext as jest.Mock).mockReset();
  });
});
