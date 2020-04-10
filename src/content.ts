import { MESSAGE_SOURCE_HOOK } from "./shared";

function injectScript(file: string): void {
  const script = document.createElement('script');
  script.src = chrome.runtime.getURL(file);
  document.documentElement.appendChild(script);
  script.parentNode.removeChild(script);
}

if (document.contentType === "text/html") {
  injectScript('build/hook.js');

  const port = chrome.runtime.connect({
    name: 'content-script',
  });
  // port.onMessage.addListener((message) => {

  // });
  // port.onDisconnect.addListener(handleDisconnect);
  window.addEventListener("message", (event: MessageEvent) => {
    if (event.source === window) {
      if (event.data?.source === MESSAGE_SOURCE_HOOK) {
        /* if (event.data.payload?.type === "rendered") {
          // chrome.runtime.sendMessage({});
          port.postMessage(event.data.payload);
        } */
        port.postMessage(event.data);
      }
    }
  });
}
