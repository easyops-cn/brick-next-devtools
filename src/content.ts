function injectScript(file: string): void {
  const script = document.createElement('script');
  script.src = chrome.runtime.getURL(file);
  document.documentElement.appendChild(script);
  script.parentNode.removeChild(script);
}

injectScript('hook.js');
