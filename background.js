chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!message || (message.type !== 'run-extract' && message.type !== 'run-export')) {
    return;
  }

  (async () => {
    try {
      const tabId = sender?.tab?.id;
      if (!tabId) {
        sendResponse({ ok: false, error: 'No sender tab found' });
        return;
      }

      const file = message.type === 'run-export' ? '导出脚本.js' : '提取脚本.js';
      await chrome.scripting.executeScript({
        target: { tabId },
        files: [file]
      });

      sendResponse({ ok: true });
    } catch (err) {
      sendResponse({ ok: false, error: err?.message || String(err) });
    }
  })();

  return true;
});
