import React from "react";
import { mount } from "enzyme";
import { PropView } from "./PropView";
import { useSelectedBrickContext } from "../libs/SelectedBrickContext";
import { PropTree } from "./PropTree";

jest.mock("../libs/SelectedBrickContext");

(useSelectedBrickContext as jest.Mock).mockReturnValue({ selectedBrick: null });

const mockEval = jest.fn((string: string, fn: Function): void => {
  fn({
    properties: {
      quality: "good",
    },
    events: ["click"],
  });
});

(window as any).chrome = {
  devtools: {
    inspectedWindow: {
      eval: mockEval,
    },
  },
};

describe("PropView", () => {
  afterEach(() => {
    mockEval.mockClear();
  });

  it("should work when no brick is selected", () => {
    const wrapper = mount(<PropView />);
    expect(wrapper.html()).toBe(null);
  });

  it("should work when a brick is selected", () => {
    const selectedBrick = {
      uid: 1,
    };
    (useSelectedBrickContext as jest.Mock).mockReturnValue({ selectedBrick });

    const wrapper = mount(<PropView />);

    expect(mockEval.mock.calls[0][0]).toBe(
      "window.__BRICK_NEXT_DEVTOOLS_HOOK__.getBrickInfo(1)"
    );
    expect(wrapper.find(PropTree).at(0).prop("properties")).toEqual({
      quality: "good",
    });
    expect(
      (wrapper.find(PropTree).at(1).prop("properties") as string[])[0][0]
    ).toBe("click");

    (useSelectedBrickContext as jest.Mock).mockReset();
  });
});
