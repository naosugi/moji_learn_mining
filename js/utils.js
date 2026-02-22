// === Food reaction voices (food emoji → speech text) ===
const FOOD_REACTIONS = {
    // 和食
    '🍙': 'おにぎりおいしい！',
    '🍡': 'だんごもちもち！',
    '🍜': 'ラーメンおいしい！',
    '🍱': 'おべんとうおいしい！',
    '🍣': 'おすしおいしい！',
    '🍢': 'おでんあたたかい！',
    '🍘': 'おせんべいパリパリ！',
    '🍚': 'ごはんおいしい！',
    // 果物
    '🍎': 'りんごおいしい！',
    '🍊': 'みかんあまい！',
    '🍋': 'レモンすっぱい！',
    '🍇': 'ぶどうあまい！',
    '🍑': 'もものにおいすき！',
    '🍒': 'さくらんぼかわいい！',
    '🥝': 'キウイすっぱい！',
    '🍌': 'バナナおいしい！',
    // 木の実・自然系
    '🍓': 'いちごかわいい！',
    '🫐': 'ブルーベリーあまずっぱい！',
    '🥭': 'マンゴーおいしい！',
    '🍍': 'パイナップルあまい！',
    '🌰': 'くりほくほく！',
    '🥜': 'ピーナッツかりかり！',
    // スイーツ
    '🍰': 'ケーキあまくておいしい！',
    '🍦': 'アイスつめたい！',
    '🍩': 'ドーナツふわふわ！',
    '🍫': 'チョコあまい！',
    '🧁': 'カップケーキかわいい！',
    '🍭': 'ぺろぺろキャンディ！',
    '🍬': 'あめちゃんあまい！',
    // パン・洋食
    '🍯': 'はちみつあまい！',
    '🧇': 'ワッフルふわふわ！',
    '🥞': 'パンケーキやわらかい！',
    '🍞': 'パンほかほか！',
    '🍪': 'クッキーさくさく！',
    '🥐': 'クロワッサンサクサク！',
    // 秋・冬
    '🍠': 'やきいもほくほく！',
    '🍵': 'おちゃあたたかい！',
    '🥛': 'ぎゅうにゅうおいしい！',
};

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
    ],
    'な': [
        { char: 'な', word: 'なすさん' },
        { char: 'に', word: 'にじさん' },
        { char: 'ぬ', word: 'ぬいぐるみさん' },
        { char: 'ね', word: 'ねこさん' },
        { char: 'の', word: 'のりものさん' }
    ],
    'は': [
        { char: 'は', word: 'はなさん' },
        { char: 'ひ', word: 'ひよこさん' },
        { char: 'ふ', word: 'ふねさん' },
        { char: 'へ', word: 'へびさん' },
        { char: 'ほ', word: 'ほしさん' }
    ],
    'ま': [
        { char: 'ま', word: 'まくらさん' },
        { char: 'み', word: 'みかんさん' },
        { char: 'む', word: 'むしさん' },
        { char: 'め', word: 'めがねさん' },
        { char: 'も', word: 'もぐらさん' }
    ],
    'や': [
        { char: 'や', word: 'やぎさん' },
        { char: 'ゆ', word: 'ゆきさん' },
        { char: 'よ', word: 'よるさん' },
        { char: 'わ', word: 'わにさん' },
        { char: 'を', word: 'おまつり' }
    ],
    'ら': [
        { char: 'ら', word: 'らいおんさん' },
        { char: 'り', word: 'りすさん' },
        { char: 'る', word: 'るびーさん' },
        { char: 'れ', word: 'れもんさん' },
        { char: 'ろ', word: 'ろけっとさん' }
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
        foodItems: ['🍙', '🍡', '🍜', '🍣', '🍢', '🍘', '🍚'],
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
        foodItems: ['🍊', '🍋', '🍎', '🍇', '🍑', '🍒', '🥝'],
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
        foodItems: ['🍓', '🫐', '🥭', '🍍', '🌰', '🥜', '🍌'],
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
        foodItems: ['🍰', '🍦', '🍩', '🍫', '🧁', '🍭', '🍬'],
        winCastleMsg: 'おしろがゆめのくになったよ！',
        winAnimalMsg: 'きれいなとりがきたよ！',
        winFloraMsg: 'まほうのはながさいたよ！'
    },
    'な': {
        label: 'な行',
        skyTop: 0x29B6F6, skyBot: 0xE1F5FE,
        mountainColor: 0x0277BD,
        groundColor: 0xB3E5FC,
        wallColor: 0xC8E6FA, wallColorDark: 0xB0D4E8,
        roofColor: 0x0288D1, roofColorLight: 0x4FC3F7,
        floraItems: ['🌊', '🐚', '🪸', '🌿', '🪴', '🌾', '🍃', '💧', '🫧'],
        animalPool: ['🐠', '🐟', '🐬', '🦭', '🐋', '🦀', '🦞', '🐙'],
        bgmNotes: [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33],
        bgmMelody: [
            { note: 0, dur: 0.4 }, { note: 1, dur: 0.4 }, { note: 2, dur: 0.4 }, { note: 4, dur: 0.8 },
            { note: 3, dur: 0.4 }, { note: 2, dur: 0.4 }, { note: 1, dur: 0.8 },
            { note: 0, dur: 0.6 }, { note: -1, dur: 0.4 }
        ],
        foodItems: ['🍣', '🍡', '🍜', '🍙', '🍢', '🍘', '🍚'],
        winCastleMsg: 'おしろがうみのそばになったよ！',
        winAnimalMsg: 'うみのなかまがきたよ！',
        winFloraMsg: 'うみのしぜんがふえたよ！'
    },
    'は': {
        label: 'は行',
        skyTop: 0xFF8F00, skyBot: 0xFFF8E1,
        mountainColor: 0xE65100,
        groundColor: 0xFFCC80,
        wallColor: 0xFFECB3, wallColorDark: 0xFFDE7D,
        roofColor: 0xF57F17, roofColorLight: 0xFFCA28,
        floraItems: ['🌻', '🌼', '🌸', '🌺', '🌹', '🌷', '🪷', '💐', '🌾'],
        animalPool: ['🐝', '🦋', '🐦', '🦚', '🦜', '🦩', '🕊️', '🦤'],
        bgmNotes: [329.63, 369.99, 415.30, 440.00, 493.88, 554.37, 587.33],
        bgmMelody: [
            { note: 0, dur: 0.3 }, { note: 2, dur: 0.3 }, { note: 4, dur: 0.3 }, { note: 6, dur: 0.6 },
            { note: 5, dur: 0.3 }, { note: 3, dur: 0.3 }, { note: 4, dur: 0.6 },
            { note: 2, dur: 0.3 }, { note: 0, dur: 0.3 }, { note: -1, dur: 0.5 }
        ],
        foodItems: ['🍯', '🧇', '🥞', '🍞', '🍪', '🥐', '🧁'],
        winCastleMsg: 'おしろがはなばたけになったよ！',
        winAnimalMsg: 'はなのともだちがきたよ！',
        winFloraMsg: 'はながいっぱいさいたよ！'
    },
    'ま': {
        label: 'ま行',
        skyTop: 0xE65100, skyBot: 0xFFE0B2,
        mountainColor: 0xBF360C,
        groundColor: 0xFFB74D,
        wallColor: 0xFFE0B2, wallColorDark: 0xFFCC80,
        roofColor: 0xBF360C, roofColorLight: 0xE64A19,
        floraItems: ['🍁', '🍂', '🍄', '🌾', '🌰', '🎑', '🪴', '🌿', '🍃'],
        animalPool: ['🦊', '🦡', '🦦', '🐿️', '🦔', '🐻', '🦝', '🐾'],
        bgmNotes: [220.00, 246.94, 261.63, 293.66, 329.63, 349.23, 392.00],
        bgmMelody: [
            { note: 5, dur: 0.5 }, { note: 4, dur: 0.5 }, { note: 3, dur: 1.0 },
            { note: 2, dur: 0.5 }, { note: 1, dur: 0.5 }, { note: 0, dur: 0.5 }, { note: -1, dur: 0.3 },
            { note: 3, dur: 0.5 }, { note: 5, dur: 0.5 }, { note: 6, dur: 1.0 },
            { note: -1, dur: 0.5 }
        ],
        foodItems: ['🍠', '🌰', '🍡', '🍱', '🍘', '🍵', '🥛'],
        winCastleMsg: 'おしろがもみじにかこまれたよ！',
        winAnimalMsg: 'もりのなかまがきたよ！',
        winFloraMsg: 'もみじがきれいになったよ！'
    },
    'や': {
        label: 'やわ行',
        skyTop: 0x1A237E, skyBot: 0x90CAF9,
        mountainColor: 0xC5CAE9,
        groundColor: 0xE8EAF6,
        wallColor: 0xF5F5FF, wallColorDark: 0xE8EAF6,
        roofColor: 0x3949AB, roofColorLight: 0x7986CB,
        floraItems: ['🎄', '🌲', '🌿', '🍃', '🪴', '🌾', '🎋', '🎍', '❄️'],
        animalPool: ['🐧', '🦭', '🐼', '🐨', '🐻‍❄️', '🦫', '🐑', '🦌'],
        bgmNotes: [392.00, 440.00, 493.88, 523.25, 587.33, 659.25, 783.99],
        bgmMelody: [
            { note: 0, dur: 0.3 }, { note: 2, dur: 0.3 }, { note: 4, dur: 0.3 }, { note: 5, dur: 0.6 },
            { note: 6, dur: 0.3 }, { note: 5, dur: 0.3 }, { note: 4, dur: 0.6 },
            { note: 2, dur: 0.3 }, { note: 0, dur: 0.3 }, { note: -1, dur: 0.5 }
        ],
        foodItems: ['🍵', '🍢', '🍜', '🍙', '🥛', '🍡', '🍬'],
        winCastleMsg: 'おしろがゆきぐにになったよ！',
        winAnimalMsg: 'ふゆのなかまがきたよ！',
        winFloraMsg: 'ゆきのもようがふえたよ！'
    },
    'ら': {
        label: 'ら行',
        skyTop: 0xE91E63, skyBot: 0xFCE4EC,
        mountainColor: 0xC2185B,
        groundColor: 0xF48FB1,
        wallColor: 0xFCE4EC, wallColorDark: 0xF8BBD0,
        roofColor: 0x880E4F, roofColorLight: 0xE91E63,
        floraItems: ['🌈', '🌸', '🌺', '🌻', '💐', '🪷', '🌷', '🌹', '🌼'],
        animalPool: ['🦄', '🦋', '🦚', '🦜', '🦩', '🕊️', '🦢', '🐉'],
        bgmNotes: [261.63, 329.63, 392.00, 440.00, 523.25, 659.25, 783.99],
        bgmMelody: [
            { note: 0, dur: 0.25 }, { note: 1, dur: 0.25 }, { note: 2, dur: 0.25 }, { note: 3, dur: 0.25 }, { note: 4, dur: 0.5 },
            { note: 5, dur: 0.25 }, { note: 4, dur: 0.25 }, { note: 3, dur: 0.25 }, { note: 2, dur: 0.25 }, { note: 1, dur: 0.5 },
            { note: 0, dur: 0.5 }, { note: -1, dur: 0.5 }
        ],
        foodItems: ['🍭', '🍩', '🍫', '🧁', '🍬', '🍰', '🍦'],
        winCastleMsg: 'おしろがにじいろになったよ！',
        winAnimalMsg: 'にじのなかまがきたよ！',
        winFloraMsg: 'にじのはなばたけになったよ！'
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
