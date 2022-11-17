// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import * as Pbf from "pbf";
import * as proto from "./message.js";
import type { MessageBody } from "../shared/interfaces";

const { Message } = proto as any;

function encode(data: {
  source: string;
  payload: string;
  frameId?: number;
}): Uint8Array {
  const pbf = new Pbf();
  Message.write(data, pbf);
  const buffer = pbf.finish();
  return buffer;
}

function decode(buffer: Uint8Array): MessageBody {
  const pbf = new Pbf(buffer);
  const result = Message.read(pbf);
  return {
    ...result,
    payload: JSON.parse(result.payload),
  };
}

export {
  encode,
  decode,
}
