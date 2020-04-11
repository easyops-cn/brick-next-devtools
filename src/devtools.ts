import {
  HOOK_NAME,
  MESSAGE_SOURCE_DEVTOOLS,
  MESSAGE_SOURCE_HOOK,
} from "./shared";

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
    `window.${HOOK_NAME} && window.${HOOK_NAME}.pageHasBricks`,
    function (pageHasBricks) {
      if (!pageHasBricks || panelCreated) {
        return;
      }

      panelCreated = true;
      clearInterval(loadCheckInterval);
      let panelWindow: Window;

      const tabId = chrome.devtools.inspectedWindow.tabId;

      let port = chrome.runtime.connect({
        name: "" + tabId,
      });

      function onPortMessage(message: any): void {
        if (message?.source === MESSAGE_SOURCE_HOOK) {
          panelWindow?.postMessage(
            {
              ...message,
              forwardedBy: MESSAGE_SOURCE_DEVTOOLS,
            },
            "*"
          );
        }
      }

      port.onMessage.addListener(onPortMessage);

      chrome.devtools.panels.create(
        "🧩 Bricks",
        "",
        "build/panel.html",
        function (panel) {
          panel.onShown.addListener((win) => {
            panelWindow = win;
          });
        }
      );

      chrome.devtools.network.onNavigated.removeListener(createPanelForBricks);

      chrome.devtools.network.onNavigated.addListener(function onNavigated() {
        panelWindow?.postMessage(
          {
            source: MESSAGE_SOURCE_DEVTOOLS,
            payload: {
              type: "navigated",
            },
          },
          "*"
        );
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
