import React from "react";
import { EditableText, IEditableTextProps } from "@blueprintjs/core";

interface EditablePropsItemProps extends IEditableTextProps {
  onConfirm: (value: string) => void;
  value: string;
}

export function PropsEditText(props: EditablePropsItemProps) {
  const { value, onConfirm, ...textProps } = props;
  const [text, setText] = React.useState(value);

  React.useEffect(() => {
    setText(value);
  }, [value]);

  return (
    <EditableText
      alwaysRenderInput={true}
      onConfirm={onConfirm}
      multiline={true}
      maxLines={8}
      {...textProps}
      value={text}
      onChange={(newValue) => setText(newValue)}
    />
  );
}
