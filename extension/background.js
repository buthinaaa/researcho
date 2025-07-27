let isTracking = false;
let currentSession = null;

// Start tracking
function startTracking() {
  isTracking = true;
  
  // Only create a new session if there isn't one already
  if (!currentSession) {
    currentSession = {
      startedAt: new Date().toISOString(),
      pages: []
    };
    console.log("New session started");
  } else {
    console.log("Tracking resumed");
  }
}

// Pause tracking (but keep the session)
function pauseTracking() {
  isTracking = false;
  console.log("Tracking paused");
}

// End session and save it
function endSession() {
  isTracking = false;
  saveSession();
  console.log("Session ended");
}

// Save session to chrome storage with race condition protection
function saveSession(retryCount = 0) {
  if (currentSession && currentSession.pages.length > 0) {
    const sessionToSave = {
      ...currentSession,
      endedAt: new Date().toISOString()
    };
    
    saveSessionWithRetry(sessionToSave, retryCount);
  } else {
    currentSession = null; // Clear empty sessions
  }
}

function saveSessionWithRetry(sessionToSave, retryCount = 0) {
  const maxRetries = 3;
  const baseDelay = 100; // milliseconds
  
  chrome.storage.local.get(["sessions"], (result) => {
    const sessions = result.sessions || [];
    const newSessions = [...sessions, sessionToSave];
    
    chrome.storage.local.set({ sessions: newSessions }, () => {
      if (chrome.runtime.lastError) {
        // Storage operation failed
        if (retryCount < maxRetries) {
          const delay = baseDelay * Math.pow(2, retryCount); // Exponential backoff
          console.log(`Save failed, retrying in ${delay}ms (attempt ${retryCount + 1})`);
          setTimeout(() => {
            saveSessionWithRetry(sessionToSave, retryCount + 1);
          }, delay);
        } else {
          console.error("Failed to save session after maximum retries:", chrome.runtime.lastError);
        }
      } else {
        // Success!
        console.log("Session saved successfully:", sessionToSave);
        currentSession = null; // Clear the current session after saving
      }
    });
  });
}

// Track visited pages
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (isTracking && changeInfo.status === "complete" && tab.url.startsWith("http")) {
    // Check if this URL is already tracked in the current session
    const isAlreadyTracked = currentSession.pages.some(page => page.url === tab.url);
    
    if (!isAlreadyTracked) {
      const pageVisit = {
        title: tab.title,
        url: tab.url,
        visitedAt: new Date().toISOString()
      };
      currentSession.pages.push(pageVisit);
      console.log("Page tracked:", pageVisit);
    } else {
      console.log("Page already tracked in this session:", tab.url);
    }
  }
});

// Listen for messages from popup.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "start") {
    startTracking(); // Resume or start new session
  } else if (request.action === "pause") {
    pauseTracking(); // Just pause, don't save
  } else if (request.action === "end") {
    endSession(); // End and save the session
  }
});