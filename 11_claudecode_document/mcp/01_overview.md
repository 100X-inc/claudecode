# Claude Code MCP Servers 完全ガイド

## 目次

1. [MCPとは](#1-mcpとは)
2. [MCPサーバーの種類](#2-mcpサーバーの種類)
3. [インストール方法](#3-インストール方法)
4. [設定ファイル](#4-設定ファイル)
5. [MCP Resources](#5-mcp-resources)
6. [MCP Prompts](#6-mcp-prompts)
7. [Enterprise設定](#7-enterprise設定)
8. [トラブルシューティング](#8-トラブルシューティング)

---

## 1. MCPとは

### 概要

**MCP（Model Context Protocol）** は、Claude Codeに外部サービスやAPIとの連携機能を追加するプロトコルです。

### 主な特徴

| 特徴 | 説明 |
|------|------|
| **外部連携** | データベース、API、サービスとの接続 |
| **ツール拡張** | Claudeが使用できるツールを追加 |
| **リソース参照** | @mention形式でリソースにアクセス |
| **プロンプト化** | MCPプロンプトをSlash Commandとして使用 |

### Skillsとの違い

| 側面 | Skill | MCP Server |
|------|-------|-----------|
| **目的** | Claudeに**情報**を与える | Claudeに**機能**を与える |
| **形態** | Markdownファイル | 外部プロセス |
| **できること** | 知識、手順を提供 | DB接続、API呼び出し |
| **例** | 「レビューのやり方」 | 「PostgreSQLへの接続」 |

---

## 2. MCPサーバーの種類

### HTTP（リモート、推奨）

```bash
claude mcp add --transport http notion https://mcp.notion.com/mcp
```

- 最も推奨される方式
- クラウドサービスとの連携に最適
- 認証はHTTPヘッダーで処理

### SSE（Server-Sent Events）

```bash
claude mcp add --transport sse asana https://mcp.asana.com/sse
```

- リアルタイム通信が必要な場合
- 非推奨（HTTPを優先）

### stdio（ローカル）

```bash
claude mcp add --transport stdio airtable \
  --env AIRTABLE_API_KEY=KEY \
  -- npx -y airtable-mcp-server
```

- ローカルで実行されるサーバー
- Node.js/Pythonパッケージ経由

---

## 3. インストール方法

### CLIコマンド

```bash
# HTTPサーバー追加
claude mcp add --transport http <name> <url>

# stdioサーバー追加
claude mcp add --transport stdio <name> -- <command> [args...]

# 環境変数付き
claude mcp add --transport stdio postgres \
  --env DB_URL=postgres://localhost:5432/mydb \
  -- npx -y @modelcontextprotocol/server-postgres

# スコープ指定
claude mcp add -s user github https://api.github.com/mcp   # ユーザーレベル
claude mcp add -s project db -- npx db-server              # プロジェクトレベル
```

### 管理コマンド

```bash
claude mcp list          # 一覧表示
claude mcp remove <name>  # 削除
/mcp                     # インタラクティブUI
```

---

## 4. 設定ファイル

### スコープと優先順位

```
Local scope:   .mcp.json (プロジェクト内のみ、デフォルト)
Project scope: .mcp.json (チーム共有、version control対象)
User scope:    ~/.claude.json (全プロジェクト共通)
```

### .mcp.json の形式

```json
{
  "mcpServers": {
    "github": {
      "type": "http",
      "url": "https://api.githubcopilot.com/mcp/",
      "headers": {
        "Authorization": "Bearer ${GITHUB_TOKEN}"
      }
    },
    "database": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres"],
      "env": {
        "DATABASE_URL": "${DATABASE_URL}"
      }
    },
    "filesystem": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/path/to/dir"]
    }
  }
}
```

### 環境変数の展開

```json
{
  "url": "${API_BASE_URL:-https://api.example.com}/mcp",
  "headers": {
    "Authorization": "Bearer ${API_KEY}"
  },
  "env": {
    "DB_URL": "${DATABASE_URL}",
    "DEBUG": "${DEBUG:-false}"
  }
}
```

- `${VAR}` - 環境変数を展開
- `${VAR:-default}` - デフォルト値付き

---

## 5. MCP Resources

### リソース参照

MCPサーバーが提供するリソースを@mention形式で参照：

```
@server:protocol://resource/path

例:
@github:issue://123
@postgres:schema://users
@filesystem:file:///path/to/file.txt
```

### 使用例

```
このイシュー @github:issue://456 について調査してください。

@postgres:schema://users テーブルの構造を確認して、
新しいカラムを追加する方法を教えてください。
```

---

## 6. MCP Prompts

### Prompts as Slash Commands

MCPサーバーが提供するプロンプトはSlash Commandとして使用可能：

```
/mcp__servername__promptname arg1 arg2

例:
/mcp__github__create_issue "Bug report" "Description"
/mcp__postgres__analyze_query "SELECT * FROM users"
```

### プロンプト一覧

```bash
/mcp
# または
claude mcp prompts <server-name>
```

---

## 7. Enterprise設定

### 許可サーバーの制限

```json
{
  "allowedMcpServers": [
    {"serverName": "github"},
    {"serverCommand": ["npx", "-y", "approved-package"]},
    {"serverUrl": "https://mcp.company.com/*"}
  ]
}
```

### 禁止サーバーの設定

```json
{
  "deniedMcpServers": [
    {"serverName": "dangerous-server"},
    {"serverUrl": "https://untrusted.com/*"}
  ]
}
```

### 自動有効化

```json
{
  "enableAllProjectMcpServers": true,
  "enabledMcpjsonServers": ["memory", "github"],
  "disabledMcpjsonServers": ["filesystem"]
}
```

---

## 8. トラブルシューティング

### デバッグモード

```bash
claude --debug
```

### 一般的な問題

| 問題 | 原因 | 解決方法 |
|------|------|---------|
| 接続エラー | URLが間違っている | URL確認、ネットワーク確認 |
| 認証エラー | トークン期限切れ | トークン再生成 |
| コマンド見つからない | パッケージ未インストール | `npm install -g` |
| 環境変数未定義 | 変数が設定されていない | `.env`または環境変数を設定 |

### サーバー状態確認

```bash
claude mcp list
/mcp
```

---

## 人気のMCPサーバー

### データベース

```json
{
  "postgres": {
    "type": "stdio",
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-postgres"],
    "env": {"DATABASE_URL": "${DATABASE_URL}"}
  }
}
```

### ファイルシステム

```json
{
  "filesystem": {
    "type": "stdio",
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-filesystem", "./"]
  }
}
```

### GitHub

```json
{
  "github": {
    "type": "http",
    "url": "https://api.github.com/mcp",
    "headers": {
      "Authorization": "Bearer ${GITHUB_TOKEN}"
    }
  }
}
```

### Memory（永続メモリ）

```json
{
  "memory": {
    "type": "stdio",
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-memory"]
  }
}
```

### Puppeteer（ブラウザ自動化）

```json
{
  "puppeteer": {
    "type": "stdio",
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-puppeteer"]
  }
}
```

---

## 関連ドキュメント

- [MCP Server開発ガイド](../12_mcp-development.md) - カスタムMCPサーバーの構築方法

## 参考リンク

- [MCP Documentation](https://docs.anthropic.com/en/docs/claude-code/mcp)
- [MCP Servers Registry](https://github.com/modelcontextprotocol/servers)
- [MCP Specification](https://spec.modelcontextprotocol.io/)
