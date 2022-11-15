import { Message, Type, Field } from "protobufjs/light"; // respectively "./node_modules/protobufjs/light.js"
import { EmitData } from "../shared/interfaces";

@Type.d("DevtoolsMessage")
export class DevtoolsMessage extends Message {
  @Field.d(1, "string")
  public type: string;

  @Field.d(2, "string")
  public payload: string;
}

export function encodeMessage(data: EmitData): Uint8Array {
  const message = new DevtoolsMessage();
  const { type, payload } = data;
  message.type = type;
  message.payload = payload;
  return DevtoolsMessage.encode(message).finish();
}

export function decodeMessage(encode: Uint8Array): EmitData {
  const { type, payload } = DevtoolsMessage.decode(encode);
  return {
    type,
    payload: typeof payload === "string" ? JSON.parse(payload) : payload,
  };
}

// const testMessage =  new DevtoolsMessage();
// testMessage.type = "wahahahaType";
// testMessage.payload = "abc";
// const testBuf = DevtoolsMessage.encode(testMessage).finish();
// const result = DevtoolsMessage.decode(testBuf);
// console.log(result);
