(function () {
    if (document.getElementById('breakcat-overlay')) return;

    let timeLeft = 5 * 60;

    const overlay = document.createElement('div');
    overlay.id = 'breakcat-overlay';
    overlay.innerHTML = `
    <div id="breakcat-cat"></div>
    <h1>Time for a break!</h1>
    <p>Step away from the screen, look into the distance</p>
    <div id="breakcat-timer">05:00</div>
    <button id="breakcat-skip">Skip break</button>
  `;
    document.body.appendChild(overlay);
    const catUrl = chrome.runtime.getURL('assets/cat/cat.svg');
    fetch(catUrl)
        .then(r => r.text())
        .then(svg => {
            document.getElementById('breakcat-cat').innerHTML = svg;
        });

    const timerEl = document.getElementById('breakcat-timer');

    const interval = setInterval(() => {
        timeLeft--;

        const m = Math.floor(timeLeft / 60);
        const s = timeLeft % 60;
        timerEl.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;

        if (timeLeft <= 0) {
            clearInterval(interval);
            overlay.remove();
            chrome.runtime.sendMessage({ action: 'breakDone' });
        }
    }, 1000);

    document.getElementById('breakcat-skip').addEventListener('click', () => {
        clearInterval(interval);
        overlay.remove();
        chrome.runtime.sendMessage({ action: 'breakDone' });
    });
})();
