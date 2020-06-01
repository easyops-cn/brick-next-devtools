import React from "react";
import { shallow } from "enzyme";
import { Button, InputGroup, Switch } from "@blueprintjs/core";
import { EvaluationsPanel } from "./EvaluationsPanel";
import { useEvaluationsContext } from "../libs/EvaluationsContext";
import { PropItem } from "./PropList";

jest.mock("../libs/EvaluationsContext");
const setEvaluations = jest.fn();
const savePreserveLogs = jest.fn();
(useEvaluationsContext as jest.Mock).mockReturnValue({
  evaluations: [
    {
      raw: "<% EVENT.detail %>",
      result: "good",
      context: {
        EVENT: {
          detail: "good",
        },
      },
    },
    {
      raw: "<% DATA.quality %>",
      result: "better",
      context: {
        EVENT: {
          detail: "better",
        },
      },
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
    expect(wrapper.find("tbody").find("tr").length).toBe(2);
  });

  it("should toggle string-wrap", () => {
    const wrapper = shallow(<EvaluationsPanel />);
    expect(wrapper.hasClass("string-wrap")).toBe(false);
    wrapper.find("[label='String Wrap']").invoke("onChange")({
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
});
