// Global memory-based state (resets on page reload)
window.gameState = {
    castleLevel: 1,
    animals: [],
    floraCount: 0,
    winCount: 0, // Track total wins for long-term rewards like Rainbow
    mysteryEggState: 0, // 0: new, 1: cracking, 2: hatched
    collectedHiragana: [] // List of unique characters found
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
    },

    getData: () => {
        return window.gameState;
    }
};
