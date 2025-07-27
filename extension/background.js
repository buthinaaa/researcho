let isTracking = false;
let currentSession = null;

// Start tracking
function startTracking() {
  isTracking = true;
  currentSession = {
    startedAt: new Date().toISOString(),
    pages: []
  };
  console.log("Tracking started");
}

// Pause tracking
function pauseTracking() {
  isTracking = false;
  saveSession(); // Save current session
  console.log("Tracking paused");
}

// Save session to localStorage
function saveSession() {
  if (currentSession && currentSession.pages.length > 0) {
    chrome.storage.local.get(["sessions"], (result) => {
      const sessions = result.sessions || [];
      sessions.push(currentSession);
      chrome.storage.local.set({ sessions }, () => {
        console.log("Session saved:", currentSession);
        currentSession = null; // move this inside the callback
      });
    });
  } else {
    currentSession = null; // fallback for empty sessions
  }
}


// Track visited pages
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (isTracking && changeInfo.status === "complete" && tab.url.startsWith("http")) {
    const pageVisit = {
      title: tab.title,
      url: tab.url,
      visitedAt: new Date().toISOString()
    };
    currentSession.pages.push(pageVisit);
    console.log("Page tracked:", pageVisit);
  }
});

// Listen for messages from popup.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "start") {
    startTracking();
  } else if (request.action === "pause") {
    pauseTracking();
  }
});
