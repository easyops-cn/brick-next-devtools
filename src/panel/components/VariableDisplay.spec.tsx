import React from "react";
import { mount } from "enzyme";
import { VariableDisplay } from "./VariableDisplay";
import { PROP_DEHYDRATED } from "../../shared/constants";

describe("VariableDisplay", () => {
  it("should work for array value when not expanded", () => {
    const wrapper = mount(<VariableDisplay value={[1, 2]} />);
    expect(wrapper.text()).toBe(" (2) [1, 2]");
  });

  it("should work for object value when not expanded", () => {
    const wrapper = mount(
      <VariableDisplay value={{ quality: "good", hello: "world" }} />
    );
    expect(wrapper.text()).toBe('{quality: "good", hello: "world"}');
  });

  it("should work for array value when expanded", () => {
    const wrapper = mount(<VariableDisplay value={[1, 2]} expanded />);
    expect(wrapper.text()).toBe("Array(2)");
  });

  it("should work for object value when expanded", () => {
    const wrapper = mount(
      <VariableDisplay value={{ quality: "good", hello: "world" }} expanded />
    );
    expect(wrapper.text()).toBe("Object");
  });

  it("should work for object value in minimal mode", () => {
    const wrapper = mount(
      <VariableDisplay value={{ quality: "good", hello: "world" }} minimal />
    );
    expect(wrapper.text()).toBe("{…}");
  });

  it("should work for string value", () => {
    const wrapper = mount(<VariableDisplay value="good" />);
    expect(wrapper.text()).toBe('"good"');
  });

  it("should work for function value", () => {
    const wrapper = mount(<VariableDisplay value={() => 0} />);
    expect(wrapper.find("span").hasClass("variable-function")).toBe(true);
    expect(wrapper.text()).toBe("ƒ");
  });

  it("should work for null value", () => {
    const wrapper = mount(<VariableDisplay value={null} />);
    expect(wrapper.find("span").hasClass("variable-nil")).toBe(true);
    expect(wrapper.text()).toBe("null");
  });

  it("should work for undefined value", () => {
    const wrapper = mount(<VariableDisplay value={undefined} />);
    expect(wrapper.find("span").hasClass("variable-nil")).toBe(true);
    expect(wrapper.text()).toBe("undefined");
  });

  it("should work for other primitive value", () => {
    const wrapper = mount(<VariableDisplay value={0} />);
    expect(wrapper.find("span").hasClass("variable-nil")).toBe(false);
    expect(wrapper.text()).toBe("0");
  });

  it("should work for dehydrated value", () => {
    const dehydrated = {
      [PROP_DEHYDRATED]: {
        type: "object",
        constructorName: "CustomEvent",
        children: {
          type: "click",
        },
      },
    };
    const wrapper = mount(<VariableDisplay value={dehydrated} />);
    expect(wrapper.text()).toBe('CustomEvent {type: "click"}');
  });

  it("should work for dehydrated value in minimal mode", () => {
    const dehydrated = {
      [PROP_DEHYDRATED]: {
        type: "object",
        constructorName: "CustomEvent",
        children: {
          type: "click",
        },
      },
    };
    const wrapper = mount(<VariableDisplay value={dehydrated} minimal />);
    expect(wrapper.text()).toBe("CustomEvent");
  });

  it("should work for dehydrated value with no children", () => {
    const dehydrated = {
      [PROP_DEHYDRATED]: {
        type: "object",
        constructorName: "MouseEvent",
      },
    };
    const wrapper = mount(<VariableDisplay value={dehydrated} />);
    expect(wrapper.text()).toBe("MouseEvent {}");
  });
});
