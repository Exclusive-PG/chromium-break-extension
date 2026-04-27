let startTime = null;
let duration = 25 * 60;
let isRunning = false;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'start') {
        startTime = Date.now();
        isRunning = true;
        chrome.alarms.create('workEnd', { delayInMinutes: duration / 60 });
        sendResponse({ ok: true });
    }

    if (message.action === 'stop') {
        isRunning = false;
        startTime = null;
        chrome.alarms.clear('workEnd');
        sendResponse({ ok: true });
    }

    if (message.action === 'getTime') {
        if (!isRunning) {
            sendResponse({ timeLeft: duration, isRunning: false });
        } else {
            const elapsed = Math.floor((Date.now() - startTime) / 1000);
            const timeLeft = Math.max(0, duration - elapsed);
            sendResponse({ timeLeft, isRunning: true });
        }
    }

    if (message.action === 'breakDone') {
        isRunning = false;
        startTime = null;
        sendResponse({ ok: true });
    }
    return true;
});

chrome.alarms.onAlarm.addListener(alarm => {
    if (alarm.name === 'workEnd') {
        isRunning = false;
        chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
            if (tabs[0]) {
                chrome.scripting.insertCSS({
                    target: { tabId: tabs[0].id },
                    files: ['break/break.css'],
                });
                chrome.scripting.executeScript({
                    target: { tabId: tabs[0].id },
                    files: ['break/break.js'],
                });
            }
        });
    }
});
