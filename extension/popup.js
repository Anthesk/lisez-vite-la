import { getORPIndex, splitText, generateWordHTML } from './reader.js';

let words = [];
let currentIndex = 0;
let isPlaying = false;
let wpm = 300;
let pauseOnPunctuation = true;
let timer = null;

const elements = {
    display: document.getElementById('word-display'),
    playBtn: document.getElementById('btn-play-pause'),
    restartBtn: document.getElementById('btn-restart'),
    wpmSlider: document.getElementById('wpm-slider'),
    wpmDisplay: document.getElementById('wpm-display'),
    punctuationCheck: document.getElementById('check-punctuation'),
    progressFill: document.getElementById('progress-fill'),
    progressText: document.getElementById('progress-text')
};

// Controls Event Listeners
elements.playBtn.addEventListener('click', togglePlay);
elements.restartBtn.addEventListener('click', restart);
elements.wpmSlider.addEventListener('input', (e) => updateSpeed(e.target.value));
elements.punctuationCheck.addEventListener('change', (e) => updatePunctuationSetting(e.target.checked));

// Keyboard Shortcuts
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault(); // Prevent scrolling
        togglePlay();
    } else if (e.code === 'ArrowRight') {
        if (!isPlaying && currentIndex < words.length - 1) {
            currentIndex++;
            renderWord();
            updateProgress();
        }
    } else if (e.code === 'ArrowLeft') {
        if (!isPlaying && currentIndex > 0) {
            currentIndex--;
            renderWord();
            updateProgress();
        }
    }
});

function init() {
    // Load Settings
    chrome.storage.local.get(['wpm', 'pauseOnPunctuation'], (result) => {
        if (result.wpm) {
            wpm = parseInt(result.wpm, 10);
            elements.wpmDisplay.textContent = `${wpm} WPM`;
            elements.wpmSlider.value = wpm;
        }
        if (result.pauseOnPunctuation !== undefined) {
            pauseOnPunctuation = result.pauseOnPunctuation;
            elements.punctuationCheck.checked = pauseOnPunctuation;
        }
    });

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
    // Save setting
    chrome.storage.local.set({ wpm: wpm });
}

function updatePunctuationSetting(checked) {
    pauseOnPunctuation = checked;
    chrome.storage.local.set({ pauseOnPunctuation: checked });
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
    
    if (pauseOnPunctuation) {
        const currentWord = words[currentIndex];
        if (currentWord.endsWith('.')) {
            delay *= 2.0;
        }
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
