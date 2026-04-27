(function () {
    if (document.getElementById('breakcat-overlay')) return;

    let timeLeft = 5 * 60;
    const tips = [
        'Look at something 20 feet away for 20 seconds',
        'Blink slowly 10 times — good for dry eyes',
        'Roll your shoulders back and relax',
        'Stand up and take a short walk',
        'Take 3 slow deep breaths',
        'Stretch your neck left and right',
    ];
    const overlay = document.createElement('div');
    overlay.id = 'breakcat-overlay';
    overlay.innerHTML = `
    <div id="breakcat-cat"></div>
    <h1>Time for a break!</h1>
    <p>${tips[Math.floor(Math.random() * tips.length)]}</p>
    <div id="breakcat-timer">05:00</div>
    <button id="breakcat-skip">Skip break</button>
  `;
    document.body.appendChild(overlay);
    const catUrl = chrome.runtime.getURL('assets/cat/cat.svg');
    const entrances = ['entrance-bounce', 'entrance-left', 'entrance-right', 'entrance-pop'];
    const randomEntrance = entrances[Math.floor(Math.random() * entrances.length)];
    fetch(catUrl)
        .then(r => r.text())
        .then(svg => {
            const catEl = document.getElementById('breakcat-cat');
            catEl.innerHTML = svg;
            catEl.classList.add(randomEntrance);
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
