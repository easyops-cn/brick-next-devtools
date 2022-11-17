import { postMessage } from "./hook/postMessage";
import {
  EVALUATION_EDIT,
  FRAME_ACTIVE_CHANGE,
  HOOK_NAME,
  MESSAGE_SOURCE_BACKGROUND,
  MESSAGE_SOURCE_DEVTOOLS,
  MESSAGE_SOURCE_HOOK,
  MESSAGE_SOURCE_PANEL,
  PANEL_CHANGE,
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

      function pushMessage(msg: any): void {
        if (panelWindow) {
          postMessage(msg, panelWindow);
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
          [
            EVALUATION_EDIT,
            TRANSFORMATION_EDIT,
            FRAME_ACTIVE_CHANGE,
            PANEL_CHANGE,
          ].includes(event.data.payload?.type)
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
              // panelWindow.postMessage(msg, "*");
              postMessage(msg as any, panelWindow);
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
