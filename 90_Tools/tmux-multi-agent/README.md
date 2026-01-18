# tmux Multi-Agent Collaboration Tools

Claude Code と OpenAI Codex を tmux 上で連携させるためのツール集。

## 概要

GOROman氏（@GOROman）が2026年1月に公開したテクニックを実装。
2つのAIエージェントが tmux のペイン間通信で自律的に協調動作する。

```
┌─────────────────────────────────────────────────────────────┐
│                         tmux                                 │
├─────────────────────────────┬───────────────────────────────┤
│      左ペイン (Claude Code)  │     右ペイン (OpenAI Codex)   │
│                             │                               │
│  実装担当                    │  レビュー担当                 │
│  - コード生成                │  - コードレビュー             │
│  - バグ修正                  │  - 問題点指摘                 │
│  - Codexの指摘を修正        │  - OK/NGの判定               │
└─────────────────────────────┴───────────────────────────────┘
```

## 必要環境

- **WSL2** (Windows) または **macOS/Linux**
- **tmux** (`sudo apt install tmux`)
- **Claude Code** (`npm install -g @anthropic-ai/claude-code`)
- **OpenAI Codex** (`npm install -g @openai/codex`)

## クイックスタート

### 1. セットアップ

```bash
# tmux セッション起動
bash setup.sh

# または、アタッチせずにバックグラウンド起動
bash setup.sh --no-attach
```

### 2. 基本操作

```bash
# 右ペイン（Codex）の出力を読み取り
bash read-other-pane.sh 1 50

# 右ペイン（Codex）にメッセージ送信
bash send-to-pane.sh 1 "このコードをレビューしてください"

# 左ペイン（Claude Code）の出力を読み取り
bash read-other-pane.sh 0 50
```

### 3. 自動レビューループ

```bash
# ファイルをCodexにレビュー依頼
bash review-loop.sh src/app.js

# 待機時間を指定（デフォルト10秒）
bash review-loop.sh src/app.js 15
```

## スクリプト一覧

| ファイル | 用途 |
|---------|------|
| `setup.sh` | tmux セッション初期化 |
| `read-other-pane.sh` | 他ペインの出力を読み取り |
| `send-to-pane.sh` | 他ペインにメッセージ送信 |
| `review-loop.sh` | 自動レビュー依頼 |
| `CLAUDE.md.example` | CLAUDE.md 設定例 |
| `hooks.json.example` | Hooks 設定例 |

## 使い方詳細

### setup.sh

tmux セッションを作成し、左右ペインで Claude Code と Codex を起動。

```bash
# 通常起動
bash setup.sh

# Claude Code のみ
bash setup.sh --claude-only

# Codex のみ
bash setup.sh --codex-only

# バックグラウンド起動
bash setup.sh --no-attach
```

### read-other-pane.sh

指定ペインの出力を取得。

```bash
# 構文
bash read-other-pane.sh [pane_number] [lines]

# 右ペインの最新50行
bash read-other-pane.sh 1 50

# 左ペインの最新100行
bash read-other-pane.sh 0 100
```

### send-to-pane.sh

指定ペインにメッセージを送信。

```bash
# 構文
bash send-to-pane.sh <pane_number> <message>

# Codex にレビュー依頼
bash send-to-pane.sh 1 "このコードをレビューしてください"

# Claude Code に修正依頼
bash send-to-pane.sh 0 "バグを修正してください"
```

### review-loop.sh

Codex に自動レビュー依頼を送信し、結果を判定。

```bash
# 構文
bash review-loop.sh <file_path> [wait_seconds]

# 例
bash review-loop.sh src/components/Button.tsx 15
```

**終了コード:**
- `0`: OK（レビュー通過）
- `1`: Findings あり（要修正）
- `2`: 応答不明（待機時間不足）

## CLAUDE.md への統合

`CLAUDE.md.example` を参考に、プロジェクトの CLAUDE.md に追記：

```markdown
## tmux マルチエージェント連携

実装完了後、Codex にレビューを依頼する:
\`\`\`bash
bash 90_Tools/tmux-multi-agent/review-loop.sh [ファイルパス]
\`\`\`
```

## Hooks への統合

`hooks.json.example` を参考に、自動レビューを設定：

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

## トラブルシューティング

### "Session not found" エラー

```bash
# セッションが存在するか確認
tmux list-sessions

# セッションを再作成
bash setup.sh
```

### 応答が取得できない

- `wait_seconds` を増やす（15-20秒推奨）
- Codex が正常に起動しているか確認

### 文字化け

```bash
# UTF-8 を有効化
export LANG=ja_JP.UTF-8
```

## 他プロジェクトへの導入

このツールを別のプロジェクトにも導入する方法。

### Windows (Git Bash / PowerShell)

```bash
# コピー先ディレクトリを作成
mkdir -p /c/path/to/your-project/90_Tools/tmux-multi-agent

# ファイルをコピー
cp -r /c/ai_programming/claudecode/90_Tools/tmux-multi-agent/* /c/path/to/your-project/90_Tools/tmux-multi-agent/
```

### WSL2

```bash
# コピー先ディレクトリを作成
mkdir -p /mnt/c/path/to/your-project/90_Tools/tmux-multi-agent

# ファイルをコピー
cp -r /mnt/c/ai_programming/claudecode/90_Tools/tmux-multi-agent/* /mnt/c/path/to/your-project/90_Tools/tmux-multi-agent/
```

### コピー後の確認

```bash
ls -la /mnt/c/path/to/your-project/90_Tools/tmux-multi-agent/

# 期待される出力:
# setup.sh
# read-other-pane.sh
# send-to-pane.sh
# review-loop.sh
# README.md
# CLAUDE.md.example
# hooks.json.example
```

### README のパス更新

コピー後、README.md 冒頭の「WSL2でプロジェクトに移動」セクションを追加し、パスを更新：

```markdown
## クイックスタート

### 0. WSL2でプロジェクトに移動

\`\`\`bash
cd /mnt/c/path/to/your-project
cd 90_Tools/tmux-multi-agent
\`\`\`
```

---

## 参考リンク

- [GOROman (@GOROman)](https://x.com/GOROman) - 元ネタ
- [tmux send-keys](https://man7.org/linux/man-pages/man1/tmux.1.html)
- [OpenAI Codex CLI](https://github.com/openai/codex)
- [Claude Code](https://claude.ai/code)
