# CLAUDE.md — おうちとひらがな

Phaser 3 ベースの子ども向けひらがな学習ゲーム。
GitHub Pages で公開: `https://naosugi.github.io/moji_learn_mining/`

**詳細な実装ガイド → [`docs/dev-guide.md`](docs/dev-guide.md)**

---

## ファイル構成 (スクリプトのロード順)

```
js/utils.js          ← 定数 + Utils (最初にロード・他から参照される)
js/audio.js          ← AudioController
js/scenes/BootScene.js
js/scenes/HomeScene.js
js/scenes/SearchScene.js
js/game.js           ← Phaser.Game 設定
assets/              ← castle_flag.png, castle_roof.png, dragon/peacock/trex/unicorn.png
```

## ゲームモードの構造

`utils.js` の `MODE_CONFIG` と `HIRAGANA_DATA` がすべてのモード設定を持つ。
現在のモード: **あ / か / さ / た 行** (4種)。

```
MODE_CONFIG['あ'].floraItems      → HomeScene の植物種類
MODE_CONFIG['あ'].animalPool      → 正解報酬で追加される動物
MODE_CONFIG['あ'].skyTop/skyBot   → 空のグラデーション色
MODE_CONFIG['あ'].wallColor       → お城の壁色
MODE_CONFIG['あ'].bgmNotes/Melody → BGM 音階・メロディ
MODE_CONFIG['あ'].winXxxMsg       → 正解時のメッセージ
HIRAGANA_DATA['あ']               → [{char, word}, ...] の5文字リスト
```

## ゲーム状態

`window.gameState` (メモリのみ、localStorage は使わない)

```
Utils.getData()           → gameState 参照を返す
Utils.saveData(key, val)  → gameState[key] = val
Utils.resetData()         → INITIAL_STATE のディープコピーで上書き
```

キー: `castleLevel` / `animals[]` / `floraCount` / `winCount` /
`collectedHiragana[]` / `eggsHatched` / `gameMode`

## よくある改修タスク

| やりたいこと | 参照場所 |
|---|---|
| 新しいひらがな行を追加 | [docs/dev-guide.md#5](docs/dev-guide.md#5-新しいひらがな行を追加する) |
| お城レベルを追加 (画像不要) | [docs/dev-guide.md#6](docs/dev-guide.md#6-お城レベルを追加する) |
| 動物・植物を増やす | [docs/dev-guide.md#7](docs/dev-guide.md#7-動物植物を追加する) |
| BGM・SEを変更 | [docs/dev-guide.md#8](docs/dev-guide.md#8-bgmseの変更) |
| デバッグ | [docs/dev-guide.md#10](docs/dev-guide.md#10-デバッグ方法) |

## 重要な注意点

- **BGM 再起動**: HomeScene の `create()` 先頭で `stopBGM()` → `playBGM(mode)` を呼ぶ。
  `isPlayingBGM` フラグがあるため、`stopBGM()` を省くと新しいモードのメロディが鳴らない。
- **お城スケールと tween**: `setScale(s)` 後は tween の target を `scaleX: s + 0.03` と
  絶対値で書く。`scaleX: 1.03` にすると高レベルで縮む。
- **UI の画面固定**: スクロール不可にする要素は `.setScrollFactor(0)` を付ける。
- **localStorage は使わない**: リロードで状態リセットが仕様。
