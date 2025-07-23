let isTracking = false;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "start") {
    isTracking = true;
    console.log("Tracking started");
  } else if (message.action === "pause") {
    isTracking = false;
    console.log("Tracking paused");
  } else if (message.action === "stop") {
    isTracking = false;
    console.log("Tracking stopped");
  }
});

// Allow content script to ask: “Should I track?”
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "shouldTrack") {
    sendResponse({ tracking: isTracking });
  }
});
