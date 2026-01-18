---
name: advanced-features
description: Codex CLIの上級機能（画像入力、Web検索、Undo、MCP Server等）
---

# 上級機能 完全ガイド

Codex CLIの上級機能について、画像入力、Web検索、Undo機能、MCPサーバーモードなどを詳しく解説します。

## 目次

1. [画像入力](#画像入力)
2. [Web検索](#web検索)
3. [Undo機能](#undo機能)
4. [MCPサーバーモード](#mcpサーバーモード)
5. [外部エディタ連携](#外部エディタ連携)
6. [シェル補完](#シェル補完)
7. [プロファイル](#プロファイル)
8. [通知フック](#通知フック)
9. [OpenTelemetry](#opentelemetry)

---

## 画像入力

### 概要

Codexはスクリーンショット、ワイヤーフレーム、設計図を理解できます。

### 入力方法

#### 1. コマンドラインフラグ

```bash
codex "Build a dashboard like this" --image ./mockup.png

# 複数画像
codex "Compare these designs" --image ./design1.png,./design2.png
codex -i ./img1.png -i ./img2.png "Implement both"
```

#### 2. クリップボードからペースト

```
# macOS: Ctrl + Cmd + Shift + 4 でスクリーンショット後
# ターミナルで Ctrl + V

# または TUI 内でペースト
codex
> [Ctrl+V でペースト]
```

#### 3. ドラッグ＆ドロップ

ファイルをターミナルウィンドウにドラッグ。

#### 4. ファイルパス指定

```
codex
> Implement the UI shown in /path/to/screenshot.png
```

### サポート形式

- PNG
- JPEG
- GIF（静止画として）
- WebP

### ユースケース

#### UIデザインの実装

```bash
codex "Build this React component based on the Figma screenshot" \
  --image ./figma-export.png
```

#### エラーのデバッグ

```bash
codex "Fix the error shown in this screenshot" \
  --image ./error-screenshot.png
```

#### ワイヤーフレームからの実装

```bash
codex "Create the HTML/CSS for this wireframe. Use Tailwind CSS." \
  --image ./wireframe.png
```

### 制限事項

- Codexは自律的にスクリーンショットを取得できない
- 「試す→確認→修正」ループはユーザーの補助が必要
- 大きな画像は処理時間が長くなる

---

## Web検索

### 概要

Codexは最新のドキュメント、API仕様、リリースノートを検索できます。

### 有効化方法

#### CLIフラグ

```bash
codex --search "Use the latest React 19 features"
```

#### config.toml

```toml
[features]
web_search_request = true
```

#### セッション内

```bash
codex --enable web_search_request
```

### ネットワークアクセスとの違い

| 機能 | Web検索 | ネットワークアクセス |
|------|---------|-------------------|
| 設定 | `web_search_request` | `network_access` |
| 用途 | 情報検索 | API呼び出し、ダウンロード |
| リスク | 低い | 高い |

```toml
# Web検索のみ（推奨）
[features]
web_search_request = true

# フルネットワーク（慎重に）
[sandbox_workspace_write]
network_access = true
```

### ユースケース

```bash
# 最新ドキュメントを参照
codex --search "Use the latest Next.js 15 app router features"

# セキュリティ情報
codex --search "Check if lodash has any recent CVEs and update if needed"

# API変更の確認
codex --search "Migrate from deprecated Stripe API to the latest version"
```

### 自動Web検索（提案中）

将来的に、「最新の」「2024年の」などの表現を検出して自動検索する機能が検討されています。

---

## Undo機能

### 概要

Codexの変更を元に戻す機能。Gitベースで動作。

### 有効化

```toml
[features]
undo = true  # デフォルトで有効
```

### 使用方法

#### TUI内

変更後に表示されるUndoボタンをクリック。

#### 注意点

**既知の問題**:
- UndoボタンはGitにステージングしてしまう場合がある
- 期待通りに動作しないケースが報告されている

### 推奨代替手段

```bash
# Gitコマンドを直接使用

# 未ステージの変更を破棄
git checkout -- <file>

# ステージ済みを破棄
git restore --staged <file>

# 直前のコミットを取り消し（変更は保持）
git reset --soft HEAD~1

# 直前のコミットを完全に取り消し
git reset --hard HEAD~1
```

### 安全な作業フロー

```bash
# 1. 作業前にブランチを作成
git checkout -b feature/codex-changes

# 2. Codexで作業
codex "Implement feature X"

# 3. 問題があればブランチごと破棄
git checkout main
git branch -D feature/codex-changes
```

---

## MCPサーバーモード

### 概要

Codex自体をMCPサーバーとして公開し、他のツールから呼び出せます。

### 起動方法

```bash
codex mcp-server
```

STDIOでMCPプロトコルを話すサーバーとして動作。

### ユースケース

#### マルチエージェントシステム

```
┌─────────────┐
│ Orchestrator│
│   Agent     │
└─────┬───────┘
      │ MCP
      ▼
┌─────────────┐     ┌─────────────┐
│   Codex     │     │   Other     │
│  MCP Server │     │   Agent     │
└─────────────┘     └─────────────┘
```

#### 他のAIツールとの連携

OpenAI Agents SDKなどから Codex を呼び出し:

```python
# Agents SDK での使用例
from openai import agents

# Codex MCP Server に接続
codex_tool = agents.MCPTool(
    command=["codex", "mcp-server"]
)
```

### MCP Inspector での確認

```bash
# MCP Inspector で接続テスト
npx @modelcontextprotocol/inspector
# → codex mcp-server を指定
```

---

## 外部エディタ連携

### 概要

長いプロンプトを外部エディタで編集できます。

### 設定

```bash
# 環境変数で設定
export VISUAL=code    # VS Code
export EDITOR=vim     # Vim
```

### 使用方法

```
codex
> [Ctrl+G を押す]
# → 設定したエディタが起動
# → 編集して保存・終了
# → 内容がCodexに送信される
```

### ユースケース

- 複数行のプロンプト
- コード例を含むプロンプト
- 複雑な指示

---

## シェル補完

### 生成方法

```bash
# Bash
codex completion bash >> ~/.bashrc

# Zsh
codex completion zsh >> ~/.zshrc

# Fish
codex completion fish > ~/.config/fish/completions/codex.fish

# PowerShell
codex completion power-shell | Out-File -Encoding UTF8 $PROFILE
```

### 有効化

```bash
# シェル再起動 または
source ~/.bashrc  # Bash
source ~/.zshrc   # Zsh
```

### 補完される内容

- サブコマンド（`exec`, `resume`, `mcp`, etc.）
- オプション（`--sandbox`, `--model`, etc.）
- オプション値（`read-only`, `workspace-write`, etc.）

---

## プロファイル

### 概要

異なる設定セットを名前付きで管理。

### 定義

```toml
# ~/.codex/config.toml

# デフォルトプロファイル
profile = "default"

[profiles.default]
model = "gpt-5-codex"
approval_policy = "on-request"
sandbox_mode = "workspace-write"

[profiles.fast]
model = "gpt-5"
approval_policy = "untrusted"

[profiles.safe]
model = "gpt-5-codex"
sandbox_mode = "read-only"
approval_policy = "on-request"

[profiles.hard]
model = "gpt-5.2-codex"
model_reasoning_effort = "xhigh"

[profiles.ci]
approval_policy = "never"
sandbox_mode = "workspace-write"
[profiles.ci.history]
persistence = "none"
```

### 使用方法

```bash
# プロファイル指定
codex --profile fast "Quick task"
codex -p hard "Complex refactoring"
codex -p ci "Run in CI"

# デフォルトを変更
# config.toml で profile = "fast"
```

### ユースケース別

| プロファイル | ユースケース |
|-------------|-------------|
| `default` | 日常開発 |
| `fast` | 簡単なタスク、速度重視 |
| `safe` | 初めてのプロジェクト、探索 |
| `hard` | 複雑なリファクタ、長時間タスク |
| `ci` | CI/CD パイプライン |

---

## 通知フック

### 概要

タスク完了時に外部プログラムを実行。

### 設定

```toml
# ~/.codex/config.toml

[notifications]
agent-turn-complete = "notify-send 'Codex' 'Task completed'"
```

### ユースケース

#### デスクトップ通知

```toml
# Linux
[notifications]
agent-turn-complete = "notify-send 'Codex' 'Done!'"

# macOS
[notifications]
agent-turn-complete = "osascript -e 'display notification \"Done!\" with title \"Codex\"'"
```

#### Slack通知

```toml
[notifications]
agent-turn-complete = "curl -X POST -d '{\"text\":\"Codex task completed\"}' $SLACK_WEBHOOK"
```

#### カスタムスクリプト

```toml
[notifications]
agent-turn-complete = "/path/to/notify-script.sh"
```

```bash
#!/bin/bash
# notify-script.sh
echo "$(date): Codex completed" >> ~/codex-log.txt
# 通知音
afplay /System/Library/Sounds/Glass.aiff
```

---

## OpenTelemetry

### 概要

APIリクエスト、プロンプト、ツール使用をトレース。

### 設定

```toml
# ~/.codex/config.toml

[otel]
enabled = true
exporter = "otlp-http"  # または otlp-grpc
endpoint = "http://localhost:4318"
```

### トレースされる内容

- APIリクエスト
- プロンプト内容
- ツール呼び出し
- 応答時間

### 無効化

```toml
[analytics]
enabled = false
```

---

## その他の上級機能

### sandbox コマンド

Codexサンドボックス内でコマンドを直接実行:

```bash
# サンドボックスポリシー下でコマンド実行
codex sandbox --full-auto ls -la
codex sandbox -c "sandbox_mode='read-only'" cat /etc/passwd
```

テストやデバッグに有用。

### execpolicy コマンド

Exec Policyルールの検証:

```bash
codex execpolicy check --rules ~/.codex/rules/safety.toml "rm -rf /"
codex execpolicy check --pretty --rules rules.toml "npm install"
```

### app-server コマンド

ローカルでアプリサーバーを起動（開発・デバッグ用）:

```bash
codex app-server
```

### apply コマンド

Codex Cloudタスクの結果を適用:

```bash
codex apply <TASK_ID>
codex apply --dry-run <TASK_ID>  # プレビュー
```

---

## 関連ドキュメント

- [07_configuration.md](07_configuration.md) - 設定詳細
- [08_mcp.md](08_mcp.md) - MCP連携
- [13_cloud-tasks.md](13_cloud-tasks.md) - Codex Cloud
- [15_best-practices.md](15_best-practices.md) - ベストプラクティス
