---
name: mcp
description: Codex CLIのModel Context Protocol (MCP)連携ガイド
---

# MCP連携 完全ガイド

Model Context Protocol (MCP) を使用して、Codexに外部ツールやデータソースへのアクセスを追加できます。

## 目次

1. [概要](#概要)
2. [サーバータイプ](#サーバータイプ)
3. [CLI管理](#cli管理)
4. [config.toml設定](#configtoml設定)
5. [利用可能なサーバー](#利用可能なサーバー)
6. [認証](#認証)
7. [ベストプラクティス](#ベストプラクティス)
8. [トラブルシューティング](#トラブルシューティング)

---

## 概要

### MCPとは

- AIモデルと外部リソースを接続するプロトコル
- ドキュメント、API、開発ツールへのアクセス
- STDIO（ローカル）とHTTP（リモート）をサポート

### 特徴

| 特徴 | 説明 |
|------|------|
| **STDIO サーバー** | ローカルプロセスとして起動 |
| **HTTP サーバー** | リモートAPIに接続 |
| **ツール制限** | 許可/禁止リストで制御 |
| **OAuth対応** | OAuth認証サポート |
| **共有設定** | CLI と IDE で設定共有 |

---

## サーバータイプ

### STDIO サーバー

ローカルプロセスとして起動し、標準入出力で通信:

```toml
[mcp_servers.my-server]
command = "npx"
args = ["-y", "@my/mcp-server"]

[mcp_servers.my-server.env]
API_KEY = "your-key"
```

**特徴**:
- ローカルで実行
- 環境変数サポート
- 起動時にプロセス生成

### HTTP サーバー

リモートAPIに接続:

```toml
[mcp_servers.remote]
url = "https://api.example.com/mcp"
bearer_token_env_var = "API_TOKEN"
```

**特徴**:
- リモートサービス
- Bearer認証 / OAuth
- 既存APIとの連携

---

## CLI管理

### codex mcp コマンド

```bash
# サーバー一覧
codex mcp list

# サーバー追加（STDIO）
codex mcp add <name> -- <command> [args...]
codex mcp add context7 -- npx -y @upstash/context7-mcp

# 環境変数付きで追加
codex mcp add my-server --env API_KEY=xxx -- npx -y @my/server

# HTTP サーバー追加
codex mcp add remote-api --url https://api.example.com/mcp
codex mcp add remote-api --url https://api.example.com/mcp --bearer-token-env-var API_TOKEN

# サーバー情報表示
codex mcp get <name>

# サーバー削除
codex mcp remove <name>

# OAuth ログイン
codex mcp login <name>

# OAuth ログアウト
codex mcp logout <name>
```

### TUIでの確認

```
# Codex CLI 内で
/mcp
```

アクティブなMCPサーバーとツールを表示。

---

## config.toml設定

### 基本構造

```toml
# ~/.codex/config.toml

[mcp_servers.<server-name>]
# STDIO または HTTP の設定
```

### STDIO サーバー設定

```toml
[mcp_servers.context7]
command = "npx"
args = ["-y", "@upstash/context7-mcp"]
cwd = "/path/to/working/dir"  # オプション
startup_timeout_sec = 15
tool_timeout_sec = 60
enabled = true

[mcp_servers.context7.env]
API_KEY = "your-api-key"
DEBUG = "true"

# 環境変数を転送
env_vars = ["PATH", "HOME"]
```

### HTTP サーバー設定

```toml
[mcp_servers.remote-api]
url = "https://api.example.com/mcp"
bearer_token_env_var = "API_TOKEN"
startup_timeout_sec = 10
tool_timeout_sec = 60
enabled = true

# 静的ヘッダー
[mcp_servers.remote-api.http_headers]
X-Custom-Header = "value"

# 環境変数からヘッダー
[mcp_servers.remote-api.env_http_headers]
X-API-Key = "API_KEY_ENV"
```

### 設定オプション一覧

#### STDIO 固有

| オプション | 型 | 必須 | デフォルト | 説明 |
|-----------|-----|------|-----------|------|
| `command` | string | ✓ | - | 起動コマンド |
| `args` | array | - | `[]` | コマンド引数 |
| `env` | table | - | - | 環境変数 |
| `env_vars` | array | - | - | 転送する環境変数 |
| `cwd` | string | - | - | 作業ディレクトリ |

#### HTTP 固有

| オプション | 型 | 必須 | デフォルト | 説明 |
|-----------|-----|------|-----------|------|
| `url` | string | ✓ | - | サーバーURL |
| `bearer_token_env_var` | string | - | - | Bearer トークンの環境変数 |
| `http_headers` | table | - | - | 静的HTTPヘッダー |
| `env_http_headers` | table | - | - | 環境変数からのヘッダー |

#### 共通

| オプション | 型 | デフォルト | 説明 |
|-----------|-----|-----------|------|
| `startup_timeout_sec` | number | `10` | 起動タイムアウト |
| `tool_timeout_sec` | number | `60` | ツール実行タイムアウト |
| `enabled` | boolean | `true` | サーバー有効/無効 |
| `enabled_tools` | array | - | 許可するツール（ホワイトリスト） |
| `disabled_tools` | array | - | 禁止するツール（ブラックリスト） |

### ツール制限

```toml
[mcp_servers.github]
command = "npx"
args = ["-y", "@modelcontextprotocol/server-github"]

# 特定のツールのみ許可
enabled_tools = ["list_repos", "get_file", "search_code"]

# または特定のツールを禁止
disabled_tools = ["delete_repo", "push_changes"]
```

**注意**: `enabled_tools` が指定されている場合、`disabled_tools` はその後に適用。

---

## 利用可能なサーバー

### 主要なMCPサーバー

| サーバー | 説明 | インストール |
|---------|------|------------|
| **Context7** | 最新の開発ドキュメント | `npx -y @upstash/context7-mcp` |
| **GitHub** | リポジトリ管理 | `npx -y @modelcontextprotocol/server-github` |
| **Figma** | デザインファイルアクセス | `npx -y @anthropics/mcp-server-figma` |
| **Playwright** | ブラウザ自動化 | `npx -y @anthropics/mcp-server-playwright` |
| **Chrome DevTools** | Chrome制御・デバッグ | `npx -y @anthropics/mcp-server-chrome-devtools` |
| **Sentry** | エラーログアクセス | `npx -y @anthropics/mcp-server-sentry` |
| **Postgres** | PostgreSQL接続 | `npx -y @modelcontextprotocol/server-postgres` |

### 設定例

#### Context7（ドキュメント）

```toml
[mcp_servers.context7]
command = "npx"
args = ["-y", "@upstash/context7-mcp"]
```

#### GitHub

```toml
[mcp_servers.github]
command = "npx"
args = ["-y", "@modelcontextprotocol/server-github"]

[mcp_servers.github.env]
GITHUB_TOKEN = "ghp_xxxx"
```

#### Playwright

```toml
[mcp_servers.playwright]
command = "npx"
args = ["-y", "@anthropics/mcp-server-playwright"]
tool_timeout_sec = 120  # ブラウザ操作は時間がかかる
```

#### PostgreSQL

```toml
[mcp_servers.postgres]
command = "npx"
args = ["-y", "@modelcontextprotocol/server-postgres"]

[mcp_servers.postgres.env]
DATABASE_URL = "postgresql://user:pass@localhost:5432/db"
```

---

## 認証

### Bearer Token

```toml
[mcp_servers.api]
url = "https://api.example.com/mcp"
bearer_token_env_var = "API_TOKEN"
```

環境変数 `API_TOKEN` から Bearer トークンを読み取り。

### OAuth

```bash
# OAuth ログイン
codex mcp login my-server

# OAuth ログアウト
codex mcp logout my-server
```

OAuth対応サーバーでは、ブラウザベースの認証フローを実行。

### 環境変数での認証

```bash
# .bashrc / .zshrc
export GITHUB_TOKEN="ghp_xxxx"
export OPENAI_API_KEY="sk-xxxx"
```

```toml
[mcp_servers.github.env]
GITHUB_TOKEN = "${GITHUB_TOKEN}"
```

---

## ベストプラクティス

### 1. 必要なツールのみ有効化

```toml
[mcp_servers.github]
command = "npx"
args = ["-y", "@modelcontextprotocol/server-github"]
enabled_tools = ["list_repos", "get_file"]  # 読み取りのみ
```

### 2. タイムアウトの調整

```toml
[mcp_servers.playwright]
command = "npx"
args = ["-y", "@anthropics/mcp-server-playwright"]
startup_timeout_sec = 30   # ブラウザ起動に時間
tool_timeout_sec = 180     # ページ操作に時間
```

### 3. 機密情報は環境変数で

```toml
# Good ✓
[mcp_servers.api.env]
API_KEY = "${MY_API_KEY}"

# Bad ✗
[mcp_servers.api.env]
API_KEY = "actual-secret-key"
```

### 4. 不要なサーバーは無効化

```toml
[mcp_servers.unused]
command = "..."
enabled = false  # 一時的に無効化
```

### 5. 開発用と本番用を分離

```toml
# プロファイルで切り替え
[profiles.dev.mcp_servers.db]
command = "..."
[profiles.dev.mcp_servers.db.env]
DATABASE_URL = "postgresql://localhost/dev"

[profiles.prod.mcp_servers.db]
command = "..."
[profiles.prod.mcp_servers.db.env]
DATABASE_URL = "${PROD_DATABASE_URL}"
```

---

## トラブルシューティング

### サーバーが起動しない

```bash
# 1. コマンドを直接実行してテスト
npx -y @my/mcp-server

# 2. 環境変数確認
echo $API_KEY

# 3. タイムアウト延長
[mcp_servers.slow]
startup_timeout_sec = 30
```

### ツールが表示されない

```bash
# 1. /mcp で確認
codex
> /mcp

# 2. enabled_tools を確認
# 空配列だと全ツールが無効
enabled_tools = []  # ✗ 全無効
# 削除するか、具体的なツールを指定
```

### 認証エラー

```bash
# 1. 環境変数確認
echo $GITHUB_TOKEN

# 2. トークンの有効性確認
curl -H "Authorization: token $GITHUB_TOKEN" https://api.github.com/user

# 3. OAuth 再認証
codex mcp logout github
codex mcp login github
```

### タイムアウトエラー

```toml
# タイムアウトを延長
[mcp_servers.slow-api]
tool_timeout_sec = 120
```

### Windows での問題

```toml
# Windows では cmd /c ラッパーが必要な場合
[mcp_servers.my-server]
command = "cmd"
args = ["/c", "npx", "-y", "@my/mcp-server"]
```

---

## Claude Codeとの比較

| 機能 | Claude Code | Codex |
|------|-------------|-------|
| **設定ファイル** | `.mcp.json` | `config.toml` |
| **設定場所** | プロジェクト / ユーザー | ユーザーのみ |
| **CLI管理** | なし | `codex mcp` コマンド |
| **OAuth** | なし | `codex mcp login` |
| **ツール制限** | なし | `enabled_tools` / `disabled_tools` |
| **タイムアウト** | 固定 | カスタマイズ可能 |

### 設定形式の違い

**Claude Code (.mcp.json)**:
```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_TOKEN": "${GITHUB_TOKEN}"
      }
    }
  }
}
```

**Codex (config.toml)**:
```toml
[mcp_servers.github]
command = "npx"
args = ["-y", "@modelcontextprotocol/server-github"]

[mcp_servers.github.env]
GITHUB_TOKEN = "${GITHUB_TOKEN}"
```

---

## 関連ドキュメント

- [01_overview.md](01_overview.md) - 全機能の概要
- [07_configuration.md](07_configuration.md) - config.toml設定詳細
- [MCP Documentation](https://developers.openai.com/codex/mcp/) - 公式ドキュメント
- [MCP Specification](https://modelcontextprotocol.io/) - MCP仕様
- [Docker MCP Toolkit](https://www.docker.com/blog/connect-codex-to-mcp-servers-mcp-toolkit/) - Docker連携
