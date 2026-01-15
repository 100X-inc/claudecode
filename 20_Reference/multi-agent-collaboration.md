# Claude Code × Codex マルチエージェント連携テクニック

GOROman氏（@GOROman）が2026年1月14日に公開した、Claude CodeとOpenAI Codexを自律的に連携させるテクニック。

## 概要

2つの異なるAIエージェントが**自動的に協調**し、一方が実装・一方がレビューを行うワークフロー。人間の介入なしにコード品質を向上させる。

> "おー、勝手にClaude Code（左）がCodex（右）に相談しながら働いてるw おもろw"
> — GOROman (@GOROman) 2026年1月14日

---

## 1. アーキテクチャ

### 全体構成

```
┌─────────────────┐     レビュー依頼      ┌─────────────────┐
│                 │ ──────────────────→ │                 │
│   Claude Code   │                      │   OpenAI Codex  │
│   (Opus 4.5)    │ ←────────────────── │                 │
│                 │     指摘・承認        │                 │
└─────────────────┘                      └─────────────────┘
        │                                        │
        │ 実装                                   │ レビュー
        ↓                                        ↓
    ソースコード                            品質フィードバック
```

### 役割分担

| エージェント | 役割 | 強み |
|-------------|------|------|
| **Claude Code** | 実装担当 | コード生成、長時間思考、ツール操作 |
| **OpenAI Codex** | レビュー担当 | コードレビュー、バグ検出、ベストプラクティス |

---

## 2. ワークフロー詳細

### 基本フロー

```
1. Claude Code: 機能を実装
       ↓
2. Claude Code: Codexにレビュー依頼
   "勝ち手のVFX（パーティクル/衝撃波）を実装しました。
    レビューお願いします。問題なければOKと言ってください。
    git diff janken.html"
       ↓
3. Codex: コードを分析し指摘事項を返す
   "Findings:
    - Low: createParticles の color パラメータが未使用
    - Low: position: absolute はスクロール時にずれる
    If you address those, I can mark it OK."
       ↓
4. Claude Code: 指摘を受けて自動修正
   "Codexの指摘を修正します。"
   position: absolute → position: fixed
       ↓
5. 再度レビュー → Codex: "OK"
       ↓
6. 次のタスクへ
```

### 実際の指摘例

GOROmanのデモで見られた指摘：

**指摘1: 未使用パラメータ**
```javascript
// 問題: color パラメータを受け取るが使用していない
createParticles(element, color, count = 12)

// 対策: パラメータを使用するか削除
particle.style.color = color  // または引数から削除
```

**指摘2: スクロール時の位置ずれ**
```css
/* 問題: getBoundingClientRect()はviewport座標を返すが、
   position: absolute だとスクロール時にずれる */
.particle {
  position: absolute;  /* NG */
}

/* 対策: position: fixed を使用、または scrollX/Y を加算 */
.particle {
  position: fixed;     /* OK */
}
```

---

## 3. セットアップ方法

### 必要な環境

```
ターミナル構成:
├── 左ペイン: Claude Code (Opus 4.5)
└── 右ペイン: OpenAI Codex CLI
```

### Claude Code側の設定

CLAUDE.mdに以下を追加：

```markdown
## コードレビュー連携

実装完了後、以下の手順でCodexにレビューを依頼する：

1. 変更内容の要約を作成
2. 右ペインのCodexに以下の形式で依頼：
   "[機能名]を実装しました。レビューお願いします。
    問題なければOKと言ってください。
    git diff [ファイル名]"
3. Codexからの指摘があれば修正
4. OKが出るまで繰り返す
```

### レビュー依頼テンプレート

```
[機能の説明]を実装しました。レビューお願いします。
問題なければOKと言ってください。

git diff [対象ファイル]
```

### Codex側の設定

Codexに以下のシステムプロンプトを設定：

```
あなたはコードレビュアーです。
提示されたgit diffを分析し、以下の観点でレビューしてください：

1. バグや潜在的な問題
2. パフォーマンスの問題
3. ベストプラクティスからの逸脱
4. セキュリティの問題

問題がなければ "OK" と返答してください。
問題がある場合は "Findings:" セクションで指摘してください。
```

---

## 4. tmux による実装（詳細）

GOROman氏のスクリーンショットでは tmux を使用してペイン間通信を実現している。

### 環境構成

```
┌─────────────────────────────────────────────────────────────┐
│                    tmux session: "agents"                    │
├─────────────────────────────┬───────────────────────────────┤
│         pane 0 (左)         │          pane 1 (右)          │
│        Claude Code          │        OpenAI Codex           │
│                             │                               │
│  $ claude                   │  $ codex                      │
│  > Thinking...              │  > OK                         │
│  > Codexからの指摘を修正... │  > Findings: ...              │
└─────────────────────────────┴───────────────────────────────┘
```

### 必要環境

- **WSL2** (Windows) または **macOS/Linux**
- **tmux**: `sudo apt install tmux`
- **Claude Code**: `npm install -g @anthropic-ai/claude-code`
- **OpenAI Codex**: `npm install -g @openai/codex`

### tmux 基本コマンド

```bash
# セッション作成＆ペイン分割
tmux new-session -d -s agents -n main
tmux split-window -h -t agents:main

# ペインへコマンド送信
tmux send-keys -t agents:main.0 'claude' Enter  # 左ペイン
tmux send-keys -t agents:main.1 'codex' Enter   # 右ペイン

# ペイン出力取得（最新50行）
tmux capture-pane -t agents:main.1 -p -S -50

# セッションにアタッチ
tmux attach -t agents
```

### ペイン間通信の仕組み

**1. send-keys**: 他ペインにキー入力を送信

```bash
# Codex ペインにメッセージ送信
tmux send-keys -t agents:main.1 "コードをレビューしてください" Enter
```

**2. capture-pane**: 他ペインの出力を取得

```bash
# Codex ペインの最新50行を取得
tmux capture-pane -t agents:main.1 -p -S -50
```

### 自動化スクリプト

本リポジトリの `90_Tools/tmux-multi-agent/` にスクリプトを用意：

| スクリプト | 用途 |
|-----------|------|
| `setup.sh` | tmux セッション初期化 |
| `read-other-pane.sh` | 他ペインの出力読み取り |
| `send-to-pane.sh` | 他ペインへメッセージ送信 |
| `review-loop.sh` | 自動レビュー依頼 |

**使用例:**

```bash
# セッション起動
bash 90_Tools/tmux-multi-agent/setup.sh

# Codex にレビュー依頼（待機10秒）
bash 90_Tools/tmux-multi-agent/review-loop.sh src/app.js 10

# 出力例:
# === Codexにレビュー依頼を送信 ===
# === Codexからの応答 ===
# Findings:
#   - Low: unused parameter
# === 結果: 要修正 (Findingsあり) ===
```

### CLAUDE.md への統合

```markdown
## tmux マルチエージェント連携

### Codexの出力を読み取る
\`\`\`bash
bash 90_Tools/tmux-multi-agent/read-other-pane.sh 1 50
\`\`\`

### レビューワークフロー
1. 実装完了後: `bash 90_Tools/tmux-multi-agent/review-loop.sh [ファイル]`
2. "Findings:" があれば修正
3. "OK" が出るまで繰り返す
```

### Hooks による自動化

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit",
        "command": "bash 90_Tools/tmux-multi-agent/review-loop.sh"
      }
    ]
  }
}
```

### 注意事項

- **待機時間**: capture-pane 前に 5-15秒 の待機が必要
- **UTF-8**: 日本語を使う場合は `export LANG=ja_JP.UTF-8`
- **セッション管理**: 終了時は `tmux kill-session -t agents`

---

## 5. 通信パターン

### パターン1: シンプルなレビューループ

```
Claude Code                          Codex
    │                                  │
    ├── 実装完了 ──────────────────────→│
    │   "レビューお願いします"           │
    │                                  │
    │←────────────────────── 指摘事項 ──┤
    │   "Findings: ..."                │
    │                                  │
    ├── 修正完了 ──────────────────────→│
    │   "修正しました。再レビューを"     │
    │                                  │
    │←──────────────────────── OK ─────┤
    │                                  │
    ↓ 次のタスクへ
```

### パターン2: 複数ファイルのバッチレビュー

```markdown
以下のファイルを実装しました。まとめてレビューお願いします。

1. src/components/Button.tsx - ボタンコンポーネント
2. src/hooks/useClick.ts - クリックハンドラ
3. src/styles/button.css - スタイル

問題なければOKと言ってください。
```

### パターン3: 設計レビュー → 実装 → コードレビュー

```
1. Claude Code: 設計案を作成
       ↓
2. Codex: 設計をレビュー
       ↓
3. Claude Code: 承認された設計で実装
       ↓
4. Codex: コードレビュー
       ↓
5. Claude Code: 修正 → 完了
```

---

## 6. メリットとデメリット

### メリット

| 項目 | 説明 |
|------|------|
| **品質向上** | 2つの異なる視点でコードをチェック |
| **自動化** | 人間の介入なしにレビューサイクル |
| **バグ早期発見** | 実装直後に問題を検出 |
| **学習効果** | 指摘をCLAUDE.mdに蓄積 |

### デメリット

| 項目 | 説明 |
|------|------|
| **コスト** | 2つのAIサービスの料金 |
| **遅延** | レビュー往復の時間 |
| **セットアップ** | 初期設定が必要 |
| **一貫性** | 異なるAI間で判断基準が異なる可能性 |

---

## 7. 応用パターン

### Claude Code × Claude Code（同一モデル並列）

```
Claude Code A (実装)     Claude Code B (レビュー)
      │                        │
      ├── 実装 ────────────────→│
      │←─────────── レビュー ───┤
      ↓                        ↓
   修正・完了              次のレビュー待ち
```

### Claude Code × 専門特化エージェント

```
Claude Code (汎用)
      │
      ├──→ Security Agent (セキュリティレビュー)
      ├──→ Performance Agent (パフォーマンス分析)
      └──→ Accessibility Agent (アクセシビリティチェック)
```

### 3エージェント以上の連携

```
Architect Agent ─→ Claude Code ─→ Review Agent ─→ Test Agent
   (設計)           (実装)         (レビュー)      (テスト)
```

---

## 8. 実践的なTips

### レビュー依頼の書き方

**良い例:**
```
勝ち手のVFX（パーティクル/衝撃波）を実装しました。
レビューお願いします。問題なければOKと言ってください。

主な変更点:
- createParticles(): パーティクル生成
- createShockwave(): 衝撃波エフェクト
- 連勝ボーナス機能

git diff janken.html
```

**悪い例:**
```
コード書いた。見て。
```

### 指摘への対応

```markdown
## Codexからの指摘対応

1. 指摘を受けたらまず理解
2. 修正方針を決定
3. 修正を実装
4. 修正内容を説明して再レビュー依頼

例:
"Codexの指摘を修正します。
 - color パラメータ: particle.style.color に適用
 - position: absolute → fixed に変更
 再度レビューお願いします。"
```

### 効率化のコツ

1. **バッチ処理**: 小さな変更を溜めてまとめてレビュー
2. **テンプレート化**: レビュー依頼文をスラッシュコマンド化
3. **自動化**: Hooksでレビュー依頼を自動送信
4. **学習蓄積**: 頻出の指摘はCLAUDE.mdに追加

---

## 9. スラッシュコマンド例

### /review-with-codex.md

```markdown
---
description: Codexにコードレビューを依頼
argument-hint: [ファイルパス]
---

以下の変更をCodexにレビュー依頼してください。

## 依頼文テンプレート

```
$ARGUMENTSの変更を実装しました。
レビューお願いします。問題なければOKと言ってください。

git diff $ARGUMENTS
```

右ペインのCodexに上記を送信し、指摘があれば修正してください。
OKが出るまで繰り返してください。
```

---

## まとめ

### このテクニックの本質

- **異なるAI間の協調**: 実装と検証を分離
- **自動フィードバックループ**: 人間介入なしの品質向上
- **多角的チェック**: 異なる視点でのコードレビュー

### 導入チェックリスト

- [ ] ターミナルを左右分割
- [ ] Claude Code（左）とCodex（右）を起動
- [ ] CLAUDE.mdにレビュー連携手順を記載
- [ ] レビュー依頼テンプレートを用意
- [ ] 頻出指摘をCLAUDE.mdに蓄積

---

*最終更新: 2026-01-14*
*情報源: GOROman (@GOROman) X投稿*
*元ツイート: https://x.com/GOROman/status/2011099465302913287*
