function logPageData() {
  const data = {
    url: window.location.href,
    title: document.title,
    timestamp: new Date().toISOString(),
  };
  console.log("Tracking data:", data);

  // Later we'll save to localStorage or chrome.storage
}

chrome.runtime.sendMessage({ action: "shouldTrack" }, (response) => {
  if (response?.tracking) {
    logPageData();
  }
});
