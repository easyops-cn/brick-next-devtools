import React from "react";
import { shallow } from "enzyme";
import { Button, InputGroup } from "@blueprintjs/core";
import { EvaluationsPanel } from "./EvaluationsPanel";
import { useEvaluationsContext } from "../libs/EvaluationsContext";
import { PropItem } from "./PropList";

jest.mock("../libs/EvaluationsContext");
const setEvaluations = jest.fn();
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
});

describe("EvaluationsPanel", () => {
  afterEach(() => {
    setEvaluations.mockClear();
  });

  it("should work", () => {
    const wrapper = shallow(<EvaluationsPanel />);
    expect(wrapper.find("tbody").find("tr").length).toBe(2);
  });

  it("should handle clear", () => {
    const wrapper = shallow(<EvaluationsPanel />);
    wrapper.find(Button).invoke("onClick")(null);
    expect(setEvaluations).toBeCalledWith([]);
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
