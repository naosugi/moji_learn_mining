// === Hiragana Data per mode ===
const HIRAGANA_DATA = {
    'あ': [
        { char: 'あ', word: 'ありさん' },
        { char: 'い', word: 'いちご' },
        { char: 'う', word: 'うさぎさん' },
        { char: 'え', word: 'えんぴつ' },
        { char: 'お', word: 'おにぎり' }
    ],
    'か': [
        { char: 'か', word: 'かにさん' },
        { char: 'き', word: 'きりんさん' },
        { char: 'く', word: 'くまさん' },
        { char: 'け', word: 'けむしさん' },
        { char: 'こ', word: 'こあらさん' }
    ],
    'さ': [
        { char: 'さ', word: 'さるさん' },
        { char: 'し', word: 'しまうまさん' },
        { char: 'す', word: 'すいかさん' },
        { char: 'せ', word: 'せみさん' },
        { char: 'そ', word: 'そらまめさん' }
    ],
    'た': [
        { char: 'た', word: 'たぬきさん' },
        { char: 'ち', word: 'ちょうちょさん' },
        { char: 'つ', word: 'つきさん' },
        { char: 'て', word: 'てんとうむしさん' },
        { char: 'と', word: 'とりさん' }
    ]
};

// === Per-mode visual/audio/content configuration ===
const MODE_CONFIG = {
    'あ': {
        label: 'あ行',
        skyTop: 0x87CEEB, skyBot: 0xE0F7FA,
        mountainColor: 0xAED581,
        groundColor: 0x90EE90,
        wallColor: 0xE0E0E0, wallColorDark: 0xD0D0D0,
        roofColor: 0xFF5252, roofColorLight: 0xFF8A80,
        floraItems: ['🌲', '🌳', '🌷', '🌻', '🌼', '🍀', '🍓', '🌿', '🌱'],
        animalPool: ['🐕', '🐈', '🐇', '🐰', '🐿️', '🐑', '🐓', '🦔'],
        bgmNotes: [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88],
        bgmMelody: [
            { note: 0, dur: 0.5 }, { note: 2, dur: 0.5 }, { note: 4, dur: 1.0 },
            { note: 2, dur: 0.5 }, { note: 4, dur: 0.5 }, { note: 5, dur: 1.0 },
            { note: 4, dur: 0.5 }, { note: 2, dur: 0.5 }, { note: 0, dur: 1.0 },
            { note: 2, dur: 0.5 }, { note: -1, dur: 0.5 }
        ],
        winCastleMsg: 'おうちがおおきくなったよ！',
        winAnimalMsg: 'ともだちがあそびにきたよ！',
        winFloraMsg: 'おはながふえたよ！'
    },
    'か': {
        label: 'か行',
        skyTop: 0xFFB347, skyBot: 0xFFE4C4,
        mountainColor: 0x8B4513,
        groundColor: 0xD2A679,
        wallColor: 0xD2B48C, wallColorDark: 0xC4A882,
        roofColor: 0xE64A19, roofColorLight: 0xFF8A60,
        floraItems: ['🌾', '🌵', '🎋', '🍂', '🍁', '🌿', '🌴', '🌰', '🎍'],
        animalPool: ['🦁', '🐯', '🐴', '🦊', '🦌', '🐆', '🦘', '🐃'],
        bgmNotes: [196.00, 220.00, 246.94, 261.63, 293.66, 329.63, 392.00],
        bgmMelody: [
            { note: 4, dur: 0.3 }, { note: 5, dur: 0.3 }, { note: 6, dur: 0.6 },
            { note: 5, dur: 0.3 }, { note: 4, dur: 0.3 }, { note: 2, dur: 0.6 },
            { note: 3, dur: 0.3 }, { note: 2, dur: 0.3 }, { note: 0, dur: 0.8 },
            { note: -1, dur: 0.5 }
        ],
        winCastleMsg: 'おしろがひろくなったよ！',
        winAnimalMsg: 'あたらしいなかまがきたよ！',
        winFloraMsg: 'もりがひろがったよ！'
    },
    'さ': {
        label: 'さ行',
        skyTop: 0x2E7D32, skyBot: 0xA5D6A7,
        mountainColor: 0x1B5E20,
        groundColor: 0x66BB6A,
        wallColor: 0xB8D8B8, wallColorDark: 0xA8C8A8,
        roofColor: 0x2E7D32, roofColorLight: 0x66BB6A,
        floraItems: ['🍄', '🌿', '🎄', '🌱', '🌾', '🪴', '🌊', '🍃', '🐚'],
        animalPool: ['🐒', '🐸', '🦋', '🐛', '🐝', '🐞', '🦎', '🐊'],
        bgmNotes: [174.61, 196.00, 220.00, 261.63, 293.66, 329.63, 349.23],
        bgmMelody: [
            { note: 0, dur: 0.5 }, { note: 2, dur: 0.5 }, { note: 3, dur: 1.0 },
            { note: 3, dur: 0.5 }, { note: 2, dur: 0.5 }, { note: 0, dur: 0.5 }, { note: -1, dur: 0.3 },
            { note: 5, dur: 0.5 }, { note: 4, dur: 0.5 }, { note: 3, dur: 1.0 },
            { note: 2, dur: 0.5 }, { note: -1, dur: 0.5 }
        ],
        winCastleMsg: 'おしろがもりにかこまれたよ！',
        winAnimalMsg: 'もりのいきものがきたよ！',
        winFloraMsg: 'しぜんがゆたかになったよ！'
    },
    'た': {
        label: 'た行',
        skyTop: 0x7B1FA2, skyBot: 0xCE93D8,
        mountainColor: 0x4A148C,
        groundColor: 0xBA68C8,
        wallColor: 0xD8C8E8, wallColorDark: 0xC8B8D8,
        roofColor: 0x7B1FA2, roofColorLight: 0x9C27B0,
        floraItems: ['🌸', '🌺', '🌹', '💐', '🪷', '🎑', '🍂', '🌃', '🎋'],
        animalPool: ['🦅', '🦜', '🦢', '🕊️', '🦩', '🦚', '🦋', '🦄'],
        bgmNotes: [293.66, 329.63, 369.99, 392.00, 440.00, 493.88, 587.33],
        bgmMelody: [
            { note: 0, dur: 0.4 }, { note: 1, dur: 0.4 }, { note: 2, dur: 0.4 }, { note: 3, dur: 0.8 },
            { note: 4, dur: 0.4 }, { note: 3, dur: 0.4 }, { note: 2, dur: 0.8 },
            { note: 1, dur: 0.4 }, { note: 0, dur: 0.4 }, { note: -1, dur: 0.5 }
        ],
        winCastleMsg: 'おしろがゆめのくになったよ！',
        winAnimalMsg: 'きれいなとりがきたよ！',
        winFloraMsg: 'まほうのはながさいたよ！'
    }
};

// Single source of truth for initial game state
const INITIAL_STATE = {
    castleLevel: 1,
    animals: ['🐕'],
    floraCount: 0,
    winCount: 0,
    mysteryEggState: 0,
    collectedHiragana: [],
    eggsHatched: 0,
    gameMode: 'あ'
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
        utterance.volume = 1.0;

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
