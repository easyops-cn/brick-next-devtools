import { onMessage, postMessage } from "./hook/postMessage";
import {
  MESSAGE_SOURCE_HOOK,
  EVALUATION_EDIT,
  TRANSFORMATION_EDIT,
  MESSAGE_SOURCE_PANEL,
  FRAME_ACTIVE_CHANGE,
  PANEL_CHANGE,
} from "./shared/constants";

function injectScript(file: string): void {
  const script = document.createElement("script");
  script.src = chrome.runtime.getURL(file);
  document.documentElement.appendChild(script);
  script.parentNode.removeChild(script);
}

let port: chrome.runtime.Port;

function initPort(): void {
  port = chrome.runtime.connect({
    name: "content-script",
  });
  port.onDisconnect.addListener(() => {
    port = null;
  });

  port.onMessage.addListener((message) => {
    if (
      message.source === MESSAGE_SOURCE_PANEL &&
      [
        EVALUATION_EDIT,
        TRANSFORMATION_EDIT,
        FRAME_ACTIVE_CHANGE,
        PANEL_CHANGE,
      ].includes(message.payload?.type)
    ) {
      postMessage(message);
    }
  });
}

if (document.contentType === "text/html") {
  injectScript("build/hook.js");

  onMessage((data) => {
    if (data?.source === MESSAGE_SOURCE_HOOK) {
      if (!port) {
        initPort();
      }
      port?.postMessage(data);
    }
  })
}
