import { decode, encode } from "../protobuf/index";
import { MessageBody } from "../shared/interfaces";

export function postMessage(message: MessageBody, win: Window = window): void {
  const { source, payload, frameId } = message;
  const data = {
    source,
    payload: JSON.stringify(payload),
    frameId,
  }
  // console.timeEnd("=== JSON.stringify ===")
  // console.time("=== encode ===")
  const body = encode(data)
  // console.timeEnd("=== encode ===")
  win.postMessage(
    body,
    "*",
    [body.buffer]
  )
}

const listener: Array<(data: MessageBody) => void> = [];

export function onMessage(cb: (data: MessageBody) => void): void {
  listener.push(cb);
}

export function offMessage(cb: (data: MessageBody) => void): void {
  const index = listener.findIndex(item => item === cb);
  listener.splice(index, 1);
}

window.addEventListener("message", (event) => {
  if (event.data && event.data instanceof Uint8Array) {
    const result = decode(event.data);
    listener.forEach(fn => fn(result))
  } else {
    listener.forEach(fn => fn(event.data))
  }
});
