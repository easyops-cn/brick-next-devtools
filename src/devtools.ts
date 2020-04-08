import { HOOK_NAME } from "./shared";

let panelCreated = false;

// Check to see if BrickNext has loaded once per second in case BrickNext is added
// after page load
const loadCheckInterval = setInterval(function() {
  createPanelForBricks();
}, 1000);

function createPanelForBricks(): void {
  if (panelCreated) {
    return;
  }

  chrome.devtools.inspectedWindow.eval(
    `window.${HOOK_NAME} && window.${HOOK_NAME}.pageHasBricks`,
    function(pageHasBricks) {
      if (!pageHasBricks || panelCreated) {
        return;
      }

      panelCreated = true;
      clearInterval(loadCheckInterval);

      chrome.devtools.panels.create("🧩 Bricks",
        "",
        "build/panel.html",
        function(panel) {
          // code invoked on panel creation
        }
      );
    }
  );
}

// Load (or reload) the DevTools extension when the user navigates to a new page.
chrome.devtools.network.onNavigated.addListener(createPanelForBricks);

createPanelForBricks();
