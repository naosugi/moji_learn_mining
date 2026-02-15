// Single source of truth for initial game state
const INITIAL_STATE = {
    castleLevel: 1,
    animals: ['🐕'],
    floraCount: 0,
    winCount: 0,
    mysteryEggState: 0,
    collectedHiragana: [],
    eggsHatched: 0
};

// Deep copy to avoid mutation of the constant
window.gameState = JSON.parse(JSON.stringify(INITIAL_STATE));

const Utils = {
    resetData: () => {
        window.gameState = JSON.parse(JSON.stringify(INITIAL_STATE));
    },

    speak: (text) => {
        if (!window.speechSynthesis) return;

        window.speechSynthesis.cancel();

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
