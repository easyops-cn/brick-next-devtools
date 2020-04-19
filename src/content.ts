import { MESSAGE_SOURCE_HOOK } from "./shared/constants";

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
}

if (document.contentType === "text/html") {
  injectScript("build/hook.js");

  window.addEventListener("message", (event: MessageEvent) => {
    if (event.source === window) {
      if (event.data?.source === MESSAGE_SOURCE_HOOK) {
        if (!port) {
          initPort();
        }
        port?.postMessage(event.data);
      }
    }
  });
}
