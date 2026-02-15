// Global memory-based state (resets on page reload)
window.gameState = {
    castleLevel: 1,
    animals: []
};

const Utils = {
    // Keep a reference to voices to avoid empty list issues
    voices: [],

    initSpeech: () => {
        if ('speechSynthesis' in window) {
            const loadVoices = () => {
                Utils.voices = window.speechSynthesis.getVoices();
            };
            loadVoices();
            if (window.speechSynthesis.onvoiceschanged !== undefined) {
                window.speechSynthesis.onvoiceschanged = loadVoices;
            }
        }
    },

    speak: (text) => {
        if (!('speechSynthesis' in window)) return;

        // Cancel previous speech if it's still playing
        if (window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
        }

        // A tiny delay after cancel for some browsers to reset state
        setTimeout(() => {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'ja-JP';
            utterance.rate = 0.9;

            // Use cached voices or try loading again
            if (Utils.voices.length === 0) {
                Utils.voices = window.speechSynthesis.getVoices();
            }

            const jaVoices = Utils.voices.filter(voice => voice.lang.includes('ja'));
            const preferred = jaVoices.find(v => v.name.includes('Kyoko') || v.name.includes('Google') || v.name.includes('O-to-ha'));

            if (jaVoices.length > 0) {
                utterance.voice = preferred || jaVoices[0];
            }

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

// Start loading voices immediately
Utils.initSpeech();
