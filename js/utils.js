// Global memory-based state (resets on page reload)
window.gameState = {
    castleLevel: 1,
    animals: [],
    floraCount: 0 // Start with 0 flowers/trees
};

const Utils = {
    speak: (text) => {
        if (!window.speechSynthesis) return;

        // Basic speech setup for iPad compatibility
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'ja-JP';
        utterance.rate = 1.0;

        // Don't wait for voices, just speak with defaults for maximal simplicity
        window.speechSynthesis.speak(utterance);
    },

    saveData: (key, value) => {
        window.gameState[key] = value;
    },

    getData: () => {
        return window.gameState;
    }
};
