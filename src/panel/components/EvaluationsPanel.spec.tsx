import React from "react";
import { shallow } from "enzyme";
import { Button, InputGroup } from "@blueprintjs/core";
import { EvaluationsPanel } from "./EvaluationsPanel";
import { useEvaluationsContext } from "../libs/EvaluationsContext";
import { PropItem } from "./PropList";

jest.mock("../libs/EvaluationsContext");
const setEvaluations = jest.fn();
const savePreserveLogs = jest.fn();
(useEvaluationsContext as jest.Mock).mockReturnValue({
  evaluations: [
    {
      id: 1,
      detail: {
        raw: "<% EVENT.detail %>",
        result: "good",
        context: {
          EVENT: {
            detail: "good",
          },
          DATA: {
            name: "easyops",
          },
        },
      },
    },
    {
      detail: {
        raw: "<% DATA.quality %>",
        result: "better",
        context: {
          EVENT: {
            detail: "better",
          },
        },
      },
    },
    {
      id: 2,
      detail: {
        raw: "<% DATA.quality %>",
        context: {},
      },
      error: "DATA is undefined",
    },
  ],
  setEvaluations,
  savePreserveLogs,
});

describe("EvaluationsPanel", () => {
  afterEach(() => {
    setEvaluations.mockClear();
  });

  it("should work", () => {
    const wrapper = shallow(<EvaluationsPanel />);
    expect(wrapper.find("tbody").find("tr").length).toBe(3);
    expect(wrapper.find("tbody").find("tr").at(2).find("td").at(1).text()).toBe(
      "Error: DATA is undefined"
    );
  });

  it("should toggle string-wrap", () => {
    const wrapper = shallow(<EvaluationsPanel />);
    expect(wrapper.hasClass("string-wrap")).toBe(false);
    wrapper.find("[label='String wrap']").invoke("onChange")({
      target: {
        checked: true,
      },
    } as any);
    expect(wrapper.hasClass("string-wrap")).toBe(true);
  });

  it("should handle clear", () => {
    const wrapper = shallow(<EvaluationsPanel />);
    wrapper.find(Button).invoke("onClick")(null);
    expect(setEvaluations).toBeCalledWith([]);
  });

  it("should toggle preserveLogs", () => {
    const wrapper = shallow(<EvaluationsPanel />);
    wrapper.find("[label='Preserve logs']").invoke("onChange")({
      target: {
        checked: true,
      },
    } as any);
    expect(savePreserveLogs).toBeCalledWith(true);
  });

  it("should handle filter", () => {
    const wrapper = shallow(<EvaluationsPanel />);
    wrapper.find(InputGroup).invoke("onChange")({
      target: {
        value: "detail",
      },
    } as any);
    expect(wrapper.find("tbody").find("tr").length).toBe(1);
    expect(wrapper.find(PropItem).at(0).prop("propValue")).toBe(
      "<% EVENT.detail %>"
    );
  });

  it("should post edited text message", () => {
    const wrapper = shallow(<EvaluationsPanel />);
    const postMessage = jest.spyOn(window, "postMessage");

    wrapper.find(PropItem).at(0).invoke("overrideProps")(
      "propName",
      "propValue",
      "<% DATA.name %>"
    );

    expect(postMessage.mock.calls[0][0]).toEqual({
      payload: {
        context: {
          data: {
            name: "easyops",
          },
          event: {
            detail: "good",
          },
        },
        id: 1,
        raw: "<% DATA.name %>",
        type: "devtools-evaluation-edit",
      },
      source: "brick-next-devtools-panel",
    });
  });
});
