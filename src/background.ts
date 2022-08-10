import { MESSAGE_SOURCE_BACKGROUND } from "./shared/constants";

// Pipe messages between content-script and devtools.
const devtoolsPorts = new Map<string, chrome.runtime.Port>();
const contentScriptPorts = new Map<string, Set<chrome.runtime.Port>>();

chrome.runtime.onConnect.addListener(function (port) {
  const isDevtools = isNumeric(port.name);
  if (isDevtools) {
    const tab = String(port.name);

    // When devtools port is connected, send set-frame messages
    // to already connected content script ports.
    const contentScripts = contentScriptPorts.get(tab) ?? new Set();
    for (const contentScript of contentScripts) {
      const { frameId, url } = contentScript.sender;
      port.postMessage({
        source: MESSAGE_SOURCE_BACKGROUND,
        payload: {
          type: "set-frame",
          frameId,
          frameURL: url,
        },
      });
    }

    devtoolsPorts.set(tab, port);
    port.onMessage.addListener((message) => {
      const contentScripts = contentScriptPorts.get(tab) ?? new Set();
      for (const contentScript of contentScripts) {
        contentScript.postMessage(message);
      }
    });
    port.onDisconnect.addListener(() => {
      devtoolsPorts.delete(tab);
    });
  } else {
    // Note: now we accept multiple content-script ports in each tab.
    // (Along with `all_frames = true` in manifest.json).
    const tab = String(port.sender.tab.id);
    const { frameId, url } = port.sender;

    // When devtools port is connected, send set-frame messages
    // if devtools port has been connected already.
    const devtoolsPort = devtoolsPorts.get(tab);
    if (devtoolsPort) {
      devtoolsPort.postMessage({
        source: MESSAGE_SOURCE_BACKGROUND,
        payload: {
          type: "set-frame",
          frameId,
          frameURL: url,
        },
      });
    }

    let connectedPorts = contentScriptPorts.get(tab);
    if (!connectedPorts) {
      connectedPorts = new Set();
      contentScriptPorts.set(tab, connectedPorts);
    }
    connectedPorts.add(port);

    port.onMessage.addListener((message) => {
      const devtoolsPort = devtoolsPorts.get(tab);
      if (devtoolsPort) {
        // We pass the frameId to devtools, to let it distinguish
        // frames where the message is from.
        devtoolsPort.postMessage({
          ...message,
          frameId,
        });
      }
    });

    port.onDisconnect.addListener(() => {
      connectedPorts.delete(port);
    });
  }
});

function isNumeric(str: string): boolean {
  return +str + "" === str;
}
