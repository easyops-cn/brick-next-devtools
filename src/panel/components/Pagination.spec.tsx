import React from "react";
import { shallow, ShallowWrapper } from "enzyme";
import { Button } from "@blueprintjs/core";
import { Pagination } from "./Pagination";

function getButtons(wrapper: ShallowWrapper): (string | number)[] {
  const buttons = wrapper.find(Button);
  const text: string[] = [];
  for (let i = 1; i < buttons.length - 1; i++) {
    text.push(String(buttons.at(i).prop("text")));
  }
  return text;
}

describe("Pagination", () => {
  it("should work for 1/1", () => {
    const wrapper = shallow(
      <Pagination page={1} pageSize={20} totalPages={1} />
    );
    expect(wrapper.find(Button).length).toBe(3);
    expect(wrapper.find(Button).first().prop("disabled")).toBe(true);
    expect(wrapper.find(Button).at(1).prop("active")).toBe(true);
    expect(wrapper.find(Button).last().prop("disabled")).toBe(true);

    expect(getButtons(wrapper)).toEqual(["1"]);
  });

  it("should work for 1/9", () => {
    const wrapper = shallow(
      <Pagination page={1} pageSize={20} totalPages={9} />
    );
    expect(wrapper.find(Button).length).toBe(11);
    expect(wrapper.find(Button).first().prop("disabled")).toBe(true);
    expect(wrapper.find(Button).at(1).prop("active")).toBe(true);
    expect(wrapper.find(Button).last().prop("disabled")).not.toBe(true);

    expect(getButtons(wrapper)).toEqual([
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
    ]);
  });

  it("should work for 5/9", () => {
    const wrapper = shallow(
      <Pagination page={5} pageSize={20} totalPages={9} />
    );
    expect(wrapper.find(Button).first().prop("disabled")).not.toBe(true);
    expect(wrapper.find(Button).at(5).prop("active")).toBe(true);
    expect(wrapper.find(Button).last().prop("disabled")).not.toBe(true);

    expect(getButtons(wrapper)).toEqual([
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
    ]);
  });

  it("should work for 5/10", () => {
    const wrapper = shallow(
      <Pagination page={5} pageSize={20} totalPages={10} />
    );
    expect(getButtons(wrapper)).toEqual([
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "···",
      "10",
    ]);
  });

  it("should work for 6/10", () => {
    const wrapper = shallow(
      <Pagination page={6} pageSize={20} totalPages={10} />
    );
    expect(getButtons(wrapper)).toEqual([
      "1",
      "···",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "10",
    ]);
  });

  it("should work for 6/11", () => {
    const wrapper = shallow(
      <Pagination page={6} pageSize={20} totalPages={11} />
    );
    expect(getButtons(wrapper)).toEqual([
      "1",
      "···",
      "4",
      "5",
      "6",
      "7",
      "8",
      "···",
      "11",
    ]);
  });
});
