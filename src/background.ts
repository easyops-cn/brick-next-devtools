// Pipe messages between content-script and devtools.

const ports: Record<string, Record<string, chrome.runtime.Port>> = {};

chrome.runtime.onConnect.addListener(function (port) {
  let tab = null;
  let name = null;
  if (isNumeric(port.name)) {
    tab = port.name;
    name = "devtools";
  } else {
    tab = port.sender.tab.id;
    name = "content-script";
  }

  if (!ports[tab]) {
    ports[tab] = {};
  }
  ports[tab][name] = port;

  pipeMessages(tab);
});

function isNumeric(str: string): boolean {
  return +str + "" === str;
}

function pipeMessages(tab: string | number): void {
  const { devtools, "content-script": contentScript } = ports[tab];
  if (!devtools || !contentScript) {
    return;
  }
  devtools.onMessage.addListener(listenDevtools);
  contentScript.onMessage.addListener(listenContentScript);
  devtools.onDisconnect.addListener(shutdown);
  contentScript.onDisconnect.addListener(shutdown);

  function listenDevtools(message: any): void {
    contentScript.postMessage(message);
  }

  function listenContentScript(message: any): void {
    devtools.postMessage(message);
  }

  function shutdown(): void {
    devtools.onMessage.removeListener(listenDevtools);
    contentScript.onMessage.removeListener(listenContentScript);
    devtools.disconnect();
    contentScript.disconnect();
    ports[tab] = {};
  }
}
