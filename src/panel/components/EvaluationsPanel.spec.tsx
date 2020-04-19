import React from "react";
import { shallow } from "enzyme";
import { Button } from "@blueprintjs/core";
import { EvaluationsPanel } from "./EvaluationsPanel";
import { useEvaluationsContext } from "../libs/EvaluationsContext";

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
  ],
  setEvaluations,
});

describe("EvaluationsPanel", () => {
  afterEach(() => {
    setEvaluations.mockClear();
  });

  it("should work", () => {
    const wrapper = shallow(<EvaluationsPanel />);
    expect(wrapper.find("tbody").find("tr").length).toBe(1);
  });

  it("should handle clear", () => {
    const wrapper = shallow(<EvaluationsPanel />);
    wrapper.find(Button).invoke("onClick")(null);
    expect(setEvaluations).toBeCalled();
  });
});
