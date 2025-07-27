function sendMessage(action) {
  chrome.runtime.sendMessage({ action });
}

document.getElementById("startBtn").addEventListener("click", () => {
  sendMessage("start");
});

document.getElementById("pauseBtn").addEventListener("click", () => {
  sendMessage("pause");
});

document.getElementById("stopBtn").addEventListener("click", () => {
  sendMessage("end");
});
