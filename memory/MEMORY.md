# moji_learn_mining プロジェクトメモ

## ドキュメント
- CLAUDE.md: クイックリファレンス (自動でコンテキストに読み込まれる)
- docs/dev-guide.md: 詳細な実装ガイド

## ファイル構成
- `js/utils.js`: HIRAGANA_DATA, MODE_CONFIG, INITIAL_STATE, Utils, FOOD_REACTIONS
- `js/audio.js`: AudioController (BGM/SE)
- `js/scenes/HomeScene.js`: おうちシーン（お城・動物・自然・UI）
- `js/scenes/SearchScene.js`: ひらがなさがしゲーム
- `js/game.js`: Phaser設定・スタート

## 現在のモード（9行）
あ / か / さ / た / な / は / ま / や（やわ行） / ら
- utils.js の `HIRAGANA_DATA` と `MODE_CONFIG` がすべての設定を持つ
- やわ行のキーは `'や'`、ラベルは `'やわ行'`（や・ゆ・よ・わ・を）

## 新しい行を追加するとき
1. `utils.js` → `HIRAGANA_DATA` に5文字追加
2. `utils.js` → `MODE_CONFIG` にビジュアル・BGM・動物等を追加
3. `utils.js` → `FOOD_REACTIONS` に新foodItemsの読み上げテキストを追加
4. `SearchScene.js` → `modeBlockColor` にブロック色を追加
5. `HomeScene.js` → ZUKANデバッグの `collectedHiragana` リストを更新
6. UIは `Object.keys(MODE_CONFIG)` で動的生成するのでコード変更不要

## Phaser 3 UIの重要な注意点
**Containerに入れたインタラクティブ要素はヒット判定がズレる**
- `setInteractive()` する要素は Container に入れず、直接 `setScrollFactor(0)` + `setDepth()` を設定する
- Containerの `setScrollFactor(0)` は子要素のhit areaに伝播しない

**スクリーン固定UIの座標**
- 固定値（例: x=1880）ではなく `this.cameras.main.width / height` を使う
- `setScrollFactor(0)` の要素のx,yはスクリーン座標として扱われる

## HomeSceneのUI構成（現在）
- 左上: 「あ行 ▼」バッジ → タップでモーダルグリッド（2列、全モード表示+進捗）
- 右上: 📖ボタン (`cw - 50, 50`) → 図鑑モーダル（モード別タブ）
- モーダル表示中はスパークルをガード（`modeModalOpen || isCollectionOpen` チェック）

## 図鑑（toggleCollection）の実装パターン
- `this._collectionObjs = []` で全オブジェクトをトラック
- `track(obj)` ヘルパーで追加し、閉じるとき `forEach(o => o.destroy())`
- タブ切り替え: `this.activeCollectionTab` をsceneに保持して再呼び出し

## デプロイ
- `main` ブランチへのpushで GitHub Actions が自動デプロイ
- URL: https://naosugi.github.io/moji_learn_mining/
