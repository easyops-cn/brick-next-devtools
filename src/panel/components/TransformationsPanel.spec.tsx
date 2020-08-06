import React from "react";
import { shallow } from "enzyme";
import { Button } from "@blueprintjs/core";
import { TransformationsPanel } from "./TransformationsPanel";
import { useTransformationsContext } from "../libs/TransformationsContext";
import { PropItem } from "./PropList";

jest.mock("../libs/TransformationsContext");
const setTransformations = jest.fn();
const savePreserveLogs = jest.fn();
(useTransformationsContext as jest.Mock).mockReturnValue({
  transformations: [
    {
      id: 1,
      detail: {
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
    },
    {
      id: 2,
      detail: {
        transform: {
          quality: "<% DATA() %>",
        },
        data: "good",
        options: {},
      },
      error: "DATA is not a function",
    },
  ],
  setTransformations,
  savePreserveLogs,
});

describe("TransformationsPanel", () => {
  afterEach(() => {
    setTransformations.mockClear();
  });

  it("should work", () => {
    const wrapper = shallow(<TransformationsPanel />);
    expect(wrapper.find("tbody").find("tr").length).toBe(2);
    expect(wrapper.find("tbody").find("tr").at(1).find("td").at(1).text()).toBe(
      "Error: DATA is not a function"
    );
  });

  it("should toggle string-wrap", () => {
    const wrapper = shallow(<TransformationsPanel />);
    expect(wrapper.hasClass("string-wrap")).toBe(false);
    wrapper.find("[label='String wrap']").invoke("onChange")({
      target: {
        checked: true,
      },
    } as any);
    expect(wrapper.hasClass("string-wrap")).toBe(true);
  });

  it("should toggle preserveLogs", () => {
    const wrapper = shallow(<TransformationsPanel />);
    wrapper.find("[label='Preserve logs']").invoke("onChange")({
      target: {
        checked: true,
      },
    } as any);
    expect(savePreserveLogs).toBeCalledWith(true);
  });

  it("should handle clear", () => {
    const wrapper = shallow(<TransformationsPanel />);
    wrapper.find(Button).invoke("onClick")(null);
    expect(setTransformations).toBeCalled();
  });

  it("should post edited transformation message", () => {
    const wrapper = shallow(<TransformationsPanel />);
    const postMessage = jest.spyOn(window, "postMessage");

    wrapper.find(PropItem).at(0).invoke("overrideProps")(
      "propName",
      "propValue",
      { name: "<% DATA.name %>" }
    );

    expect(postMessage.mock.calls[0][0]).toEqual({
      payload: {
        data: "good",
        id: 1,
        options: {
          from: "list",
          mapArray: undefined,
        },
        transform: {
          name: "<% DATA.name %>",
        },
        type: "devtools-transformation-edit",
      },
      source: "brick-next-devtools-panel",
    });
  });
});
