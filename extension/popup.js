import { getORPIndex, splitText, generateWordHTML } from './reader.js';

let words = [];
let currentIndex = 0;
let isPlaying = false;
let wpm = 300;
let timer = null;

const elements = {
    display: document.getElementById('word-display'),
    playBtn: document.getElementById('btn-play-pause'),
    restartBtn: document.getElementById('btn-restart'),
    wpmSlider: document.getElementById('wpm-slider'),
    wpmDisplay: document.getElementById('wpm-display'),
    progressFill: document.getElementById('progress-fill'),
    progressText: document.getElementById('progress-text')
};

// Controls Event Listeners
elements.playBtn.addEventListener('click', togglePlay);
elements.restartBtn.addEventListener('click', restart);
elements.wpmSlider.addEventListener('input', (e) => updateSpeed(e.target.value));

function init() {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        if (!tabs[0]) return;
        
        chrome.tabs.sendMessage(tabs[0].id, {action: "getText"}, (response) => {
            if (chrome.runtime.lastError) {
                console.warn(chrome.runtime.lastError);
                elements.display.innerHTML = `<div class='placeholder'>Cannot read this page.<br>Refresh or try another tab.</div>`;
                return;
            }

            if (response && response.text) {
                words = splitText(response.text);
                if (words.length > 0) {
                    currentIndex = 0;
                    renderWord();
                    updateProgress();
                } else {
                    elements.display.innerHTML = `<div class='placeholder'>No text found.</div>`;
                }
            }
        });
    });
}

function togglePlay() {
    isPlaying = !isPlaying;
    updatePlayButton();
    if (isPlaying) {
        loop();
    } else {
        clearTimeout(timer);
    }
}

function updatePlayButton() {
    elements.playBtn.textContent = isPlaying ? "Pause" : "Play";
}

function updateSpeed(newWpm) {
    wpm = parseInt(newWpm, 10);
    elements.wpmDisplay.textContent = `${wpm} WPM`;
}

function restart() {
    currentIndex = 0;
    renderWord();
    updateProgress();
    if (!isPlaying) {
    } else {
        clearTimeout(timer);
        loop();
    }
}

function loop() {
    if (!isPlaying) return;
    
    // 60000 ms / WPM = ms per word
    let delay = 60000 / wpm;
    
    const currentWord = words[currentIndex];
    if (currentWord.endsWith('.')) {
        delay *= 2.0;
    }

    timer = setTimeout(() => {
        if (currentIndex < words.length - 1) {
            currentIndex++;
            renderWord();
            updateProgress();
            loop();
        } else {
            isPlaying = false;
            updatePlayButton();
        }
    }, delay);
}

function renderWord() {
    const word = words[currentIndex];
    const orp = getORPIndex(word);
    const html = generateWordHTML(word, orp);
    
    elements.display.innerHTML = html;
}

function updateProgress() {
    if (words.length === 0) return;
    const progress = Math.round((currentIndex / (words.length - 1)) * 100);
    elements.progressFill.style.width = `${progress}%`;
    elements.progressText.textContent = `${progress}%`;
}

init();
