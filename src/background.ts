// Pipe messages between content-script and devtools.

const ports: Record<string, Record<string, chrome.runtime.Port>> = {};

chrome.runtime.onConnect.addListener(function (port) {
  console.log("onConnect", port);
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
  devtools.onDisconnect.addListener(shutdownDevtools);
  contentScript.onDisconnect.addListener(shutdownContentScript);

  function listenDevtools(message: any): void {
    contentScript.postMessage(message);
  }

  function listenContentScript(message: any): void {
    devtools.postMessage(message);
  }

  function shutdownDevtools(): void {
    devtools.onMessage.removeListener(listenDevtools);
    contentScript.disconnect();
  }

  function shutdownContentScript(): void {
    contentScript.onMessage.removeListener(listenContentScript);
    devtools.disconnect();
    ports[tab] = {};
  }
}

/* function doublePipe(one: chrome.runtime.Port, two: chrome.runtime.Port): void {
  one.onMessage.addListener(listenOne);
  two.onMessage.addListener(listenTwo);
  one.onDisconnect.addListener(shutdown);
  two.onDisconnect.addListener(shutdown);
  function listenOne(message: any): void {
    two.postMessage(message);
  }
  function listenTwo(message: any): void {
    one.postMessage(message);
  }
  function shutdown(): void {
    one.onMessage.removeListener(listenOne);
    two.onMessage.removeListener(listenTwo);
    one.disconnect();
    two.disconnect();
  }
} */
