// Global memory-based state, initialized from localStorage if available
const savedState = (() => {
    try {
        const raw = localStorage.getItem('mojilearn_state');
        return raw ? JSON.parse(raw) : null;
    } catch (e) {
        return null;
    }
})();

window.gameState = savedState || {
    castleLevel: 1,
    animals: [],
    floraCount: 0,
    winCount: 0,
    mysteryEggState: 0,
    collectedHiragana: [],
    eggsHatched: 0
};

const Utils = {
    speak: (text) => {
        if (!window.speechSynthesis) return;

        // Stop any current speech
        window.speechSynthesis.cancel();

        // Duck BGM volume
        if (window.audioController) window.audioController.duck();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'ja-JP';
        utterance.rate = 1.0;

        utterance.onend = () => {
            if (window.audioController) window.audioController.unduck();
        };

        utterance.onerror = () => {
            if (window.audioController) window.audioController.unduck();
        };

        // Extra workaround for iOS: calling speak with a very short delay
        setTimeout(() => {
            window.speechSynthesis.speak(utterance);
        }, 50);
    },

    saveData: (key, value) => {
        window.gameState[key] = value;
        // Persist to localStorage
        try {
            localStorage.setItem('mojilearn_state', JSON.stringify(window.gameState));
        } catch (e) {
            // Storage full or unavailable — silently fail
        }
    },

    getData: () => {
        return window.gameState;
    }
};
