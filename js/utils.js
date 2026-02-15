// Global memory-based state (resets on page reload)
window.gameState = {
    castleLevel: 1,
    animals: []
};

const Utils = {
    speak: (text) => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'ja-JP';
            utterance.rate = 0.9; // Slightly slower for children

            const setVoiceAndSpeak = () => {
                const voices = window.speechSynthesis.getVoices();
                let jaVoices = voices.filter(voice => voice.lang.includes('ja'));
                let preferred = jaVoices.find(v => v.name.includes('Kyoko') || v.name.includes('Google') || v.name.includes('O-to-ha'));
                utterance.voice = preferred || jaVoices[0] || null;
                window.speechSynthesis.speak(utterance);
            };

            if (window.speechSynthesis.getVoices().length > 0) {
                setVoiceAndSpeak();
            } else {
                // For some browsers, voices are loaded asynchronously
                const checkVoices = setInterval(() => {
                    if (window.speechSynthesis.getVoices().length > 0) {
                        setVoiceAndSpeak();
                        clearInterval(checkVoices);
                    }
                }, 100);
                // Timeout after 1s
                setTimeout(() => clearInterval(checkVoices), 1000);
            }
        } else {
            console.warn('Web Speech API not supported');
        }
    },

    saveData: (key, value) => {
        window.gameState[key] = value;
    },

    getData: () => {
        return window.gameState;
    }
};
