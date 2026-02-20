# 開発ガイド — おうちとひらがな

## 目次
1. [アーキテクチャ概要](#1-アーキテクチャ概要)
2. [ファイル構成と責務](#2-ファイル構成と責務)
3. [ゲーム状態管理](#3-ゲーム状態管理)
4. [ゲームモードの仕組み](#4-ゲームモードの仕組み)
5. [新しいひらがな行を追加する](#5-新しいひらがな行を追加する)
6. [お城レベルを追加する](#6-お城レベルを追加する)
7. [動物・植物を追加する](#7-動物植物を追加する)
8. [BGM・SEの変更](#8-bgmseの変更)
9. [Phaser固有のパターンと注意点](#9-phaser固有のパターンと注意点)
10. [デバッグ方法](#10-デバッグ方法)

---

## 1. アーキテクチャ概要

```
index.html
  └─ js/utils.js         ← 全定数 + Utils (最初にロード)
  └─ js/audio.js         ← AudioController (utils の直後)
  └─ js/scenes/BootScene.js
  └─ js/scenes/HomeScene.js
  └─ js/scenes/SearchScene.js
  └─ js/game.js          ← Phaser.Game 設定 + スタートボタン
```

**スクリプトのロード順は index.html で固定**。`HIRAGANA_DATA` / `MODE_CONFIG` は
`utils.js` で定義されるため、他のすべてのファイルから参照できる。

ゲームの流れ:
```
[スタートボタン] → BootScene (アセット読み込み) → HomeScene ⇄ SearchScene
```

---

## 2. ファイル構成と責務

### `js/utils.js`
唯一の「真実の源」。以下を定義する:

| 定数/オブジェクト | 役割 |
|---|---|
| `HIRAGANA_DATA` | モード別ひらがなリスト `{ 'あ': [{char, word}, ...], ... }` |
| `MODE_CONFIG` | モード別ビジュアル・音楽・コンテンツ設定 |
| `INITIAL_STATE` | ゲーム開始時の初期状態 |
| `window.gameState` | 実行時状態 (INITIAL_STATE のディープコピー) |
| `Utils` | `getData()` / `saveData()` / `speak()` / `resetData()` |

**注意**: `localStorage` は使わない。ゲーム状態はメモリのみ (`window.gameState`)。

### `js/audio.js`
`AudioController` クラスを定義し `window.audioController` として公開。

| メソッド | 説明 |
|---|---|
| `playBGM(mode)` | モード別メロディで BGM 開始 |
| `stopBGM()` | BGM 停止 |
| `playSE(type)` | SE 再生 ('pop' / 'correct' / 'incorrect' / 'jump' / 'shake' / 'sparkle' / 'pollen') |
| `playTone(freq, duration, delay, type)` | 単音再生 (内部用) |
| `duck()` / `unduck()` | 音声読み上げ中に BGM を下げる |

### `js/scenes/HomeScene.js`
おうちワールドシーン。主なメソッド:

| メソッド | 説明 |
|---|---|
| `create(params)` | シーン構築。`params.forceNight` で夜強制可 |
| `createModeSelector(mode)` | 画面上部の行セレクターUI |
| `createCastle(x, y, level, isNight)` | お城描画 (Lv1-5) |
| `createCastleExtensions(...)` | お城拡張 (Lv6-15、純グラフィックス) |
| `createNature()` | 植物配置 |
| `createAnimal(x, y, type, isNight)` | 動物配置 |
| `createMysteryEgg()` | ふしぎたまご |
| `hatchEgg(egg)` → `spawnRareCreature(x, y)` | 孵化 + レアキャラ出現 |
| `toggleCollection()` | 図鑑UI |
| `createDebugUI()` | デバッグパネル (`?debug=true` で表示) |

### `js/scenes/SearchScene.js`
ひらがなさがしゲームシーン。主なメソッド:

| メソッド | 説明 |
|---|---|
| `getRandomHiragana()` | 現在のモードからランダムにひらがなを選ぶ |
| `createBlocks()` | グリッド生成 (ターゲット+デコイ+ブロック) |
| `handleCorrect(targetObj)` | 正解処理 + 報酬付与 + HomeScene 遷移 |
| `handleIncorrect(char)` | 不正解処理 (ペナルティなし) |

---

## 3. ゲーム状態管理

```javascript
// 読み取り
const data = Utils.getData(); // window.gameState への参照
const level = data.castleLevel;

// 書き込み
Utils.saveData('castleLevel', level + 1);
// 内部的には: window.gameState['castleLevel'] = level + 1

// リセット
Utils.resetData(); // INITIAL_STATE のディープコピーで上書き
```

**`gameState` のキー一覧:**

| キー | 型 | 初期値 | 説明 |
|---|---|---|---|
| `castleLevel` | number | 1 | お城レベル |
| `animals` | string[] | `['🐕']` | 居住中の動物リスト |
| `floraCount` | number | 0 | 植物の追加本数 |
| `winCount` | number | 0 | 累計正解数 |
| `collectedHiragana` | string[] | `[]` | 図鑑コレクション |
| `eggsHatched` | number | 0 | 孵化済み卵の数 |
| `gameMode` | string | `'あ'` | 現在の行モード |

---

## 4. ゲームモードの仕組み

モード識別子は `'あ'` / `'か'` / `'さ'` / `'た'` の4種。

### `MODE_CONFIG[mode]` の構造

```javascript
{
  label: 'あ行',                // UIラベル
  skyTop: 0x87CEEB,             // 空グラデーション上端色
  skyBot: 0xE0F7FA,             // 空グラデーション下端色
  mountainColor: 0xAED581,      // 山の色
  groundColor: 0x90EE90,        // 地面の色
  wallColor: 0xE0E0E0,          // お城壁(主)色
  wallColorDark: 0xD0D0D0,      // お城壁(塔)色
  roofColor: 0xFF5252,          // お城屋根(主)色
  roofColorLight: 0xFF8A80,     // お城屋根(塔)色
  floraItems: ['🌲', ...],      // HomeScene の植物候補
  animalPool: ['🐕', ...],      // 正解報酬で追加される動物候補
  bgmNotes: [261.63, ...],      // BGM 音階 (7音)
  bgmMelody: [{note, dur}, ...],// BGM メロディパターン
  winCastleMsg: '...',          // 正解 → お城成長メッセージ
  winAnimalMsg: '...',          // 正解 → 動物追加メッセージ
  winFloraMsg: '...',           // 正解 → 植物追加メッセージ
}
```

### モードが影響する箇所

| ファイル | 場所 | 内容 |
|---|---|---|
| `HomeScene` | `create()` | 空/山/地面の色 |
| `HomeScene` | `create()` | BGM メロディ |
| `HomeScene` | `createNature()` | 植物の種類 |
| `HomeScene` | `createCastle()` | お城の壁/屋根の色 |
| `SearchScene` | `getRandomHiragana()` | 出題ひらがな |
| `SearchScene` | `createBlocks()` | デコイひらがな・ブロック色 |
| `SearchScene` | `handleCorrect()` | 報酬動物・メッセージ |

---

## 5. 新しいひらがな行を追加する

例: **な行** を追加する場合

### Step 1: `js/utils.js` — `HIRAGANA_DATA` に追加

```javascript
'な': [
    { char: 'な', word: 'なすびさん' },
    { char: 'に', word: 'にわとりさん' },
    { char: 'ぬ', word: 'ぬいぐるみさん' },
    { char: 'ね', word: 'ねこさん' },
    { char: 'の', word: 'のりさん' }
],
```

### Step 2: `js/utils.js` — `MODE_CONFIG` に追加

```javascript
'な': {
    label: 'な行',
    skyTop: 0x00BCD4, skyBot: 0xE0F7FA,
    mountainColor: 0x006064,
    groundColor: 0x4DD0E1,
    wallColor: 0xB2EBF2, wallColorDark: 0x80DEEA,
    roofColor: 0x0097A7, roofColorLight: 0x00BCD4,
    floraItems: ['🌊', '🐚', '🪸', '🌿', '🍀', '🌺', '🐠'],
    animalPool: ['🐬', '🐳', '🦈', '🐙', '🦀', '🦞'],
    bgmNotes: [261.63, 277.18, 311.13, 349.23, 369.99, 415.30, 466.16],
    bgmMelody: [
        { note: 0, dur: 0.5 }, { note: 2, dur: 0.5 }, { note: 4, dur: 1.0 },
        { note: 3, dur: 0.5 }, { note: 2, dur: 0.5 }, { note: 0, dur: 1.0 },
        { note: -1, dur: 0.5 }
    ],
    winCastleMsg: 'おしろがうみのなかになったよ！',
    winAnimalMsg: 'うみのいきものがきたよ！',
    winFloraMsg: 'うみのしぜんがふえたよ！'
},
```

### Step 3: `js/scenes/HomeScene.js` — `createModeSelector()` のボタン配列に追加

```javascript
// 変更前
const modes = ['あ', 'か', 'さ', 'た'];

// 変更後
const modes = ['あ', 'か', 'さ', 'た', 'な'];
```

ボタン幅は `125px` ずつなので、5行以上になる場合は `btnX` の計算式や
ボタンサイズを調整すること。

---

## 6. お城レベルを追加する

お城のレベル別描画は `HomeScene.createCastleExtensions()` に集約されている。
`if (level >= N)` ブロックを末尾に追加するだけでよい。

```javascript
// 例: Lv16 — 魔法の光の柱を追加
if (level >= 16) {
    for (let i = -2; i <= 2; i++) {
        const beam = this.add.rectangle(i * 80, -160, 12, 200, 0xFFFFAA, 0.3);
        container.add(beam);
        this.tweens.add({
            targets: beam,
            alpha: { from: 0.1, to: 0.5 },
            scaleY: { from: 0.8, to: 1.2 },
            duration: 1500 + i * 200,
            yoyo: true,
            repeat: -1
        });
    }
}
```

### お城のスケール計算
レベルに応じて全体が大きくなる:
```javascript
const castleScale = Math.min(1 + (level - 1) * 0.04, 2.0);
// Lv1=1.0x, Lv10=1.36x, Lv14=1.52x, Lv26以上=2.0x (上限)
```

スケール上限を変えたい場合は `Math.min(..., 2.0)` の `2.0` を変更する。

### 描画順序 (Phaser コンテナのレイヤー)
`castleContainer.add(obj)` → 最前面に追加
`castleContainer.addAt(obj, 0)` → 最背面に追加 (モートなど「後ろに来るもの」)

---

## 7. 動物・植物を追加する

### 動物の追加
`MODE_CONFIG[mode].animalPool` の配列に絵文字を追加するだけ。

```javascript
animalPool: ['🐕', '🐈', '🐇', '🐰', '🐿️', '🐑', '🦔', '🐓'],
//                                                         ↑ 追加
```

レアキャラ (孵化で出る画像スプライト) を追加したい場合:
1. `assets/` に PNG を配置
2. `BootScene.preload()` でロード
3. `HomeScene.spawnRareCreature()` の `rares` 配列に key 名を追加

### 植物の追加
`MODE_CONFIG[mode].floraItems` の配列に絵文字を追加するだけ。
`HomeScene.createNature()` がこのリストからランダムに選んで配置する。

---

## 8. BGM・SEの変更

### BGM (モード別)
`MODE_CONFIG[mode].bgmNotes` と `bgmMelody` を変更する。

- `bgmNotes`: 7音の周波数配列 (Hz)。任意の音階を使える。
  - C Major: `[261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88]`
  - D Major: `[293.66, 329.63, 369.99, 392.00, 440.00, 493.88, 587.33]`
- `bgmMelody`: `{note: index(0-6 or -1=休符), dur: 秒}` の配列

### SE の追加
`AudioController.playSE(type)` の `switch` に新しい `case` を追加:

```javascript
case 'myNewSE':
    osc.type = 'sine';
    osc.frequency.setValueAtTime(500, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.2);
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
    osc.start(now);
    osc.stop(now + 0.2);
    break;
```

呼び出し: `window.audioController.playSE('myNewSE')`

---

## 9. Phaser固有のパターンと注意点

### ワールド座標 vs スクリーン座標
- HomeScene はスクロール可能な 2000×2000 のワールド
- UI 要素は `.setScrollFactor(0)` で画面固定にする
- `cameras.main.width/height` でスクリーンサイズを取得

### 音声読み上げ (Web Speech API)
```javascript
Utils.speak('テキスト'); // BGM を自動ダッキング
```
iOS では最初のユーザーインタラクション後でないと動作しない。`game.js` の
スタートボタンクリックで AudioContext を初期化しているのはそのため。

### BGM の再起動
シーンを `restart()` しても AudioController は破棄されない。
HomeScene の `create()` 先頭で必ず `stopBGM()` → `playBGM(mode)` を呼ぶ:
```javascript
window.audioController.stopBGM();
window.audioController.playBGM(mode);
```

### お城コンテナとスケール
`castleContainer.setScale(s)` した後の breathing tween は
`scaleX: s + 0.03` のように絶対値で指定すること。
`scaleX: 1.03` のままだと、スケール 1.5 から 1.03 に縮んでしまう。

### ゲーム状態はメモリのみ
`localStorage` は使っていない。リロードすると状態はリセットされる設計。
意図的なデザインなので `localStorage` を追加しないこと。

---

## 10. デバッグ方法

URL に `?debug=true` を付けるとデバッグパネルが表示される:

| ボタン | 動作 |
|---|---|
| RESET | 状態リセット + リロード |
| WIN++ | winCount +1 してシーン再起動 |
| HATCH | 次の卵が即孵化できる状態にする |
| DAY/NIGHT | 昼夜トグル |
| ZUKAN | 4行分のひらがなを図鑑に一括登録 |
| CLOSEUI | パネル非表示 |

ローカル動作確認:
```bash
# Python でシンプルサーバーを立てる
python3 -m http.server 8080
# → http://localhost:8080
```
