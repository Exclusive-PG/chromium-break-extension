const METHODS = {
    pomodoro: { work: 25 * 60, breakTime: 5 * 60 },
    '20-20-20': { work: 20 * 60, breakTime: 20 },
    '45-15': { work: 45 * 60, breakTime: 15 * 60 },
    '60-10': { work: 60 * 60, breakTime: 10 * 60 },
};

let startTime = null;
let duration = METHODS[0];
let isRunning = false;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'start') {
        chrome.storage.sync.get('method', data => {
            const method = METHODS[data.method] || METHODS['pomodoro'];
            duration = method.work;
            startTime = Date.now();
            isRunning = true;
            chrome.alarms.create('workEnd', { delayInMinutes: duration / 60 });
            sendResponse({ ok: true });
        });
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
    if (message.action === 'setMethod') {
        const method = METHODS[message.method] || METHODS['pomodoro'];
        duration = method.work;
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
