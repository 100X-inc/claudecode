---
name: configuration
description: Codex CLI config.toml設定の完全リファレンス
---

# Configuration 完全ガイド

Codex CLIの設定は `~/.codex/config.toml` で管理します。

## 目次

1. [概要](#概要)
2. [ファイル構造](#ファイル構造)
3. [コア設定](#コア設定)
4. [セキュリティ設定](#セキュリティ設定)
5. [機能フラグ](#機能フラグ)
6. [環境・シェル](#環境シェル)
7. [履歴・ストレージ](#履歴ストレージ)
8. [MCP設定](#mcp設定)
9. [UI・通知](#ui通知)
10. [プロジェクト設定](#プロジェクト設定)
11. [プロファイル](#プロファイル)
12. [CLIオーバーライド](#cliオーバーライド)
13. [設定例](#設定例)

---

## 概要

### 設定ファイルの場所

```
~/.codex/config.toml         # ユーザー設定（メイン）
/etc/codex/managed_config.toml  # システム管理設定
/etc/codex/requirements.toml    # 管理者強制制限
```

### 環境変数

| 変数 | 説明 |
|------|------|
| `CODEX_HOME` | Codexホームディレクトリ（デフォルト: `~/.codex`） |
| `OPENAI_API_KEY` | OpenAI APIキー |
| `OPENAI_BASE_URL` | APIベースURL（カスタムプロバイダー用） |
| `VISUAL` / `EDITOR` | 外部エディタ（Ctrl+G用） |

### 優先順位

```
1. CLI フラグ（--config key=value）   ← 最優先
2. マネージド設定（MDM）
3. /etc/codex/managed_config.toml
4. ~/.codex/config.toml
5. デフォルト値                        ← 最低優先
```

---

## ファイル構造

### config.toml の基本構造

```toml
# ~/.codex/config.toml

# トップレベル設定
model = "gpt-5.2-codex"
sandbox_mode = "workspace-write"
approval_policy = "on-request"

# セクション
[features]
web_search_request = true

[sandbox_workspace_write]
network_access = false

[mcp_servers.my-server]
command = "npx"
args = ["-y", "@my/mcp-server"]

[profiles.fast]
model = "gpt-5"
```

---

## コア設定

### モデル設定

| オプション | 型 | デフォルト | 説明 |
|-----------|-----|-----------|------|
| `model` | string | `gpt-5-codex` | 使用するモデル |
| `model_provider` | string | `openai` | モデルプロバイダーID |
| `model_reasoning_effort` | string | - | 推論レベル（`low`/`medium`/`high`） |
| `model_context_window` | number | - | コンテキストウィンドウサイズ |
| `model_auto_compact_token_limit` | number | - | 自動圧縮のトークン閾値 |

```toml
# 例
model = "gpt-5.2-codex"
model_reasoning_effort = "high"
model_context_window = 128000
```

### 利用可能なモデル

| モデル | 説明 |
|--------|------|
| `gpt-5.2-codex` | 最新のコーディング特化モデル |
| `gpt-5-codex` | デフォルト（macOS/Linux） |
| `gpt-5` | 汎用モデル（Windowsデフォルト） |
| `o3` | 推論強化モデル |
| `o3-mini` | 軽量推論モデル |

### カスタムプロバイダー

```toml
# ~/.codex/config.toml

[model_providers.custom]
base_url = "https://api.custom-provider.com/v1"
api_key_env_var = "CUSTOM_API_KEY"
wire_api = "openai"

# 使用
model_provider = "custom"
model = "custom-model-name"
```

---

## セキュリティ設定

### サンドボックス

| オプション | 型 | デフォルト | 説明 |
|-----------|-----|-----------|------|
| `sandbox_mode` | string | `workspace-write` | サンドボックスモード |

値: `read-only`, `workspace-write`, `danger-full-access`

### 承認ポリシー

| オプション | 型 | デフォルト | 説明 |
|-----------|-----|-----------|------|
| `approval_policy` | string | `on-request` | 承認ポリシー |

値: `untrusted`, `on-failure`, `on-request`, `never`

### ネットワーク設定

```toml
[sandbox_workspace_write]
network_access = false    # ネットワークアクセス
writable_roots = ["/tmp"] # 追加の書き込み可能ディレクトリ
```

### 認証設定

| オプション | 型 | 説明 |
|-----------|-----|------|
| `forced_login_method` | string | 認証方法を制限（`chatgpt` / `api`） |
| `cli_auth_credentials_store` | string | 認証情報の保存先（`file`/`keyring`/`auto`） |
| `chatgpt_base_url` | string | ChatGPTログインのベースURL |

```toml
forced_login_method = "api"
cli_auth_credentials_store = "keyring"
```

詳細は [06_approval-sandbox.md](06_approval-sandbox.md) 参照。

---

## 機能フラグ

### [features] セクション

```toml
[features]
# 安定機能
shell_tool = true              # シェル実行（デフォルト有効）
web_search_request = true      # Web検索
undo = true                    # Git ベースの元に戻す

# ベータ機能
unified_exec = false           # PTYバックエンド実行
shell_snapshot = false         # コマンド実行の高速化

# 実験的機能
tui2 = false                   # 新しいTUI
apply_patch_freeform = false   # フリーフォームパッチ適用
exec_policy = false            # Exec Policy ルールチェック
remote_compaction = false      # リモート圧縮（ChatGPT認証のみ）
remote_models = false          # モデルリストの更新

# Windows
elevated_windows_sandbox = false      # 強化Windowsサンドボックス
experimental_windows_sandbox = false  # 実験的Windowsサンドボックス
```

### 機能の有効化/無効化

```bash
# CLI でオーバーライド
codex --enable web_search_request
codex --disable shell_snapshot
```

---

## 環境・シェル

### 環境変数ポリシー

```toml
[shell_environment_policy]
# 継承ポリシー
inherit = "core"  # all | core | none

# 明示的な環境変数設定
[shell_environment_policy.set]
NODE_ENV = "development"
DEBUG = "true"

# 特定の環境変数のみ継承
include_only = ["PATH", "HOME", "USER"]
```

### 継承オプション

| 値 | 説明 |
|----|------|
| `all` | すべての環境変数を継承 |
| `core` | コア変数のみ（PATH, HOME等） |
| `none` | 継承なし |

---

## 履歴・ストレージ

### 履歴設定

```toml
[history]
persistence = "save-all"  # save-all | none
max_bytes = 104857600     # 100MB
```

### 履歴ファイル

```
~/.codex/history.jsonl    # セッション履歴
```

---

## MCP設定

### MCPサーバーの定義

```toml
[mcp_servers.context7]
command = "npx"
args = ["-y", "@upstash/context7-mcp"]
startup_timeout_sec = 15
tool_timeout_sec = 60
enabled = true

[mcp_servers.context7.env]
API_KEY = "your-api-key"

# ツールの制限
enabled_tools = ["search", "fetch"]
```

### HTTP MCPサーバー

```toml
[mcp_servers.remote-api]
url = "https://api.example.com/mcp"
bearer_token_env_var = "API_TOKEN"
```

### MCPオプション

| オプション | 型 | デフォルト | 説明 |
|-----------|-----|-----------|------|
| `command` | string | - | STDIOサーバーの起動コマンド |
| `args` | array | `[]` | コマンド引数 |
| `url` | string | - | HTTPサーバーURL |
| `startup_timeout_sec` | number | `10` | 起動タイムアウト |
| `tool_timeout_sec` | number | `60` | ツール実行タイムアウト |
| `enabled` | boolean | `true` | サーバーの有効/無効 |
| `enabled_tools` | array | - | 許可するツール（ホワイトリスト） |
| `bearer_token_env_var` | string | - | HTTP認証トークンの環境変数 |

詳細は [08_mcp.md](08_mcp.md) 参照。

---

## UI・通知

### TUI設定

```toml
[tui]
animations = true           # アニメーション
notifications = true        # 通知
# または特定のイベントのみ
notifications = ["agent-turn-complete", "error"]
scroll_behavior = "auto"    # スクロール動作
```

### 通知フック

```toml
[notifications]
agent-turn-complete = "notify-send 'Codex' 'Task completed'"
```

外部プログラムを実行してタスク完了を通知。

---

## プロジェクト設定

### AGENTS.md 関連

```toml
# AGENTS.md の最大バイト数
project_doc_max_bytes = 32768  # 32KB

# フォールバックファイル名
project_doc_fallback_filenames = ["TEAM_GUIDE.md", ".agents.md"]
```

### プロジェクトルート検出

```toml
# プロジェクトルートのマーカー
project_root_markers = [".git", "package.json", "Cargo.toml", "pyproject.toml"]
```

---

## プロファイル

### プロファイルの定義

```toml
# デフォルトプロファイル
profile = "default"

[profiles.default]
model = "gpt-5-codex"
approval_policy = "on-request"

[profiles.fast]
model = "gpt-5"
approval_policy = "never"

[profiles.safe]
model = "gpt-5-codex"
sandbox_mode = "read-only"
approval_policy = "on-request"

[profiles.reasoning]
model = "o3"
model_reasoning_effort = "high"
```

### プロファイルの使用

```bash
# CLI でプロファイル指定
codex --profile fast
codex -p reasoning

# または config.toml でデフォルト設定
profile = "fast"
```

---

## CLIオーバーライド

### --config フラグ

```bash
# 単一の設定
codex --config model=gpt-5

# ネストした設定（ドット記法）
codex --config sandbox_workspace_write.network_access=true

# 複数の設定
codex -c model=o3 -c model_reasoning_effort=high
```

### TOML構文

```bash
# 文字列
codex -c model=\"gpt-5\"

# ブール
codex -c features.web_search_request=true

# 配列
codex -c project_doc_fallback_filenames='["A.md", "B.md"]'
```

---

## 設定例

### 日常開発用

```toml
# ~/.codex/config.toml

model = "gpt-5.2-codex"
sandbox_mode = "workspace-write"
approval_policy = "on-request"

[features]
web_search_request = true
shell_snapshot = true

[tui]
animations = true
notifications = true
```

### 高速・効率重視

```toml
model = "gpt-5"
sandbox_mode = "workspace-write"
approval_policy = "untrusted"

[features]
shell_snapshot = true
```

### 安全重視

```toml
model = "gpt-5-codex"
sandbox_mode = "read-only"
approval_policy = "on-request"

[features]
web_search_request = false
```

### CI/CD用

```toml
model = "gpt-5-codex"
sandbox_mode = "workspace-write"
approval_policy = "never"

[features]
exec_policy = true

[history]
persistence = "none"
```

### 推論タスク用

```toml
model = "o3"
model_reasoning_effort = "high"
sandbox_mode = "workspace-write"
approval_policy = "on-request"
```

---

## 管理者設定

### requirements.toml

```toml
# /etc/codex/requirements.toml

# 許可されるポリシー
allowed_approval_policies = ["on-request", "untrusted"]
allowed_sandbox_modes = ["read-only", "workspace-write"]

# danger-full-access と never は禁止
```

### managed_config.toml

```toml
# /etc/codex/managed_config.toml

# システムデフォルト
model = "gpt-5-codex"
approval_policy = "on-request"

# ユーザーはセッション内で変更可能だが、再起動で戻る
```

---

## トラブルシューティング

### 設定が反映されない

```bash
# 1. 構文チェック
cat ~/.codex/config.toml

# 2. Codex 再起動
exit
codex

# 3. 設定確認
codex
> /status
```

### TOML構文エラー

```toml
# 文字列はクォートで囲む
model = "gpt-5"      # ✓
model = gpt-5        # ✗

# ブールはクォートなし
[features]
web_search_request = true   # ✓
web_search_request = "true" # ✗
```

### プロファイルが見つからない

```bash
# プロファイル名を確認
grep -A5 '\[profiles\.' ~/.codex/config.toml

# 正しい名前で指定
codex --profile my-profile
```

---

## 関連ドキュメント

- [01_overview.md](01_overview.md) - 全機能の概要
- [06_approval-sandbox.md](06_approval-sandbox.md) - セキュリティ設定詳細
- [08_mcp.md](08_mcp.md) - MCP設定詳細
- [Basic Configuration](https://developers.openai.com/codex/config-basic) - 公式ドキュメント
- [Advanced Configuration](https://developers.openai.com/codex/config-advanced) - 公式ドキュメント
- [Configuration Reference](https://developers.openai.com/codex/config-reference) - 設定リファレンス
