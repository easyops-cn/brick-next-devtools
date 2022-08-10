import {
  EVALUATION_EDIT,
  HOOK_NAME,
  MESSAGE_SOURCE_BACKGROUND,
  MESSAGE_SOURCE_DEVTOOLS,
  MESSAGE_SOURCE_HOOK,
  MESSAGE_SOURCE_PANEL,
  TRANSFORMATION_EDIT,
} from "./shared/constants";

let panelCreated = false;
// Check to see if BrickNext has loaded once per second in case BrickNext is added
// after page load
const loadCheckInterval = setInterval(function () {
  createPanelForBricks();
}, 1000);

function createPanelForBricks(): void {
  if (panelCreated) {
    return;
  }

  chrome.devtools.inspectedWindow.eval(
    `!!(window.${HOOK_NAME} && window.${HOOK_NAME}.pageHasBricks)`,
    function (pageHasBricks) {
      if (!pageHasBricks || panelCreated) {
        return;
      }

      panelCreated = true;
      clearInterval(loadCheckInterval);
      let panelWindow: Window;
      const pendingMessages: unknown[] = [];

      const tabId = chrome.devtools.inspectedWindow.tabId;

      let port = chrome.runtime.connect({
        name: "" + tabId,
      });

      function pushMessage(msg: unknown): void {
        if (panelWindow) {
          panelWindow?.postMessage(msg, "*");
        } else {
          pendingMessages.push(msg);
        }
      }

      function onPortMessage(message: any): void {
        if (
          message?.source === MESSAGE_SOURCE_HOOK ||
          message?.source === MESSAGE_SOURCE_BACKGROUND
        ) {
          pushMessage({
            ...message,
            forwardedBy: MESSAGE_SOURCE_DEVTOOLS,
          });
        }
      }

      function onPanelMessage(event: MessageEvent): void {
        if (
          event?.data.source === MESSAGE_SOURCE_PANEL &&
          [EVALUATION_EDIT, TRANSFORMATION_EDIT].includes(
            event.data.payload?.type
          )
        ) {
          port?.postMessage(event.data);
        }
      }

      port.onMessage.addListener(onPortMessage);

      chrome.devtools.panels.create(
        "🧩 Bricks",
        "",
        "build/panel.html",
        function (panel) {
          // istanbul ignore next
          panel.onShown.addListener((win) => {
            panelWindow = win;
            panelWindow.addEventListener("message", onPanelMessage);
            for (const msg of pendingMessages) {
              panelWindow.postMessage(msg, "*");
            }
            pendingMessages.length = 0;
          });
        }
      );

      chrome.devtools.network.onNavigated.removeListener(createPanelForBricks);

      chrome.devtools.network.onNavigated.addListener(function onNavigated() {
        pushMessage({
          source: MESSAGE_SOURCE_DEVTOOLS,
          payload: {
            type: "navigated",
          },
        });
        port.onMessage.removeListener(onPortMessage);
        port.disconnect();
        port = chrome.runtime.connect({
          name: "" + tabId,
        });
        port.onMessage.addListener(onPortMessage);
      });
    }
  );
}

// Load (or reload) the DevTools extension when the user navigates to a new page.
chrome.devtools.network.onNavigated.addListener(createPanelForBricks);

createPanelForBricks();
