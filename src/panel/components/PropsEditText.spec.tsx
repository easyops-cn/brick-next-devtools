import React from "react";
import { shallow, mount } from "enzyme";
import { PropsEditText } from "./PropsEditText";

describe("PropsEditText", () => {
  it("should work", () => {
    const props = {
      value: "<% DATA.message %>",
      onConfirm: jest.fn(),
    };
    const wrapper = shallow(<PropsEditText {...props} />);

    wrapper.invoke("onChange")("DATA.age");
    expect(wrapper.prop("value")).toEqual("DATA.age");
  });

  it("should update value", () => {
    const props = {
      value: "<% DATA.message %>",
      onConfirm: jest.fn(),
    };
    const wrapper = mount(<PropsEditText {...props} />);

    wrapper.setProps({
      value: "<% DATA.name %>",
    });

    expect(wrapper.prop("value")).toEqual("<% DATA.name %>");
  });
});
