const timerEl = document.getElementById('timer');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const phaseLabel = document.getElementById('phaseLabel');

function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

async function loadCat() {
    const url = chrome.runtime.getURL('assets/cat/cat.svg');
    const response = await fetch(url);
    const svg = await response.text();
    document.getElementById('catContainer').innerHTML = svg;
}

function updateDisplay() {
    chrome.runtime.sendMessage({ action: 'getTime' }, response => {
        timerEl.textContent = formatTime(response.timeLeft);
        if (response.isRunning) {
            startBtn.textContent = '⏸ Pause';
        } else {
            startBtn.textContent = '▶ Start';
        }
    });
}

startBtn.addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'start' }, () => {
        phaseLabel.textContent = 'Work Session';
    });
});

stopBtn.addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'stop' }, () => {
        phaseLabel.textContent = 'STOP';
    });
});
setInterval(updateDisplay, 1000);

updateDisplay();
loadCat();
