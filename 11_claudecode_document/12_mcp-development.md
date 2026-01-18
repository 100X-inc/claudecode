# MCP Server開発ガイド

カスタムMCP（Model Context Protocol）サーバーの構築方法

---

## 目次

1. [概要](#1-概要)
2. [公式SDK](#2-公式sdk)
3. [MCP Serverの3つのケーパビリティ](#3-mcp-serverの3つのケーパビリティ)
4. [ビルド手順](#4-ビルド手順)
5. [ベストプラクティス](#5-ベストプラクティス)
6. [アンチパターン](#6-アンチパターン)
7. [参照リソース](#7-参照リソース)

---

## 1. 概要

MCPサーバーは、Claude Codeに外部ツールやデータソースを接続するための標準プロトコル。JSON-RPC 2.0ベースのステートフル通信を使用する。

### アーキテクチャ

```
┌─────────────┐    JSON-RPC    ┌─────────────┐
│ Claude Code │ ←───────────→ │ MCP Server  │
│  (Client)   │    stdin/out   │  (Custom)   │
└─────────────┘                └─────────────┘
```

### トランスポート方式

| 方式 | 用途 | 推奨 |
|-----|------|------|
| stdio | ローカル開発・テスト | 開発時 |
| HTTP (Streamable) | 本番・リモート | 本番時 |
| SSE | レガシー互換 | - |

---

## 2. 公式SDK

| 言語 | ステータス | パッケージ |
|-----|----------|-----------|
| TypeScript | 安定版（v2開発中） | `@modelcontextprotocol/sdk` |
| Python | 安定版 | `mcp` |
| C# | 安定版 | NuGet経由 |
| Java | 安定版 | Maven経由 |

### インストール

```bash
# TypeScript
npm install @modelcontextprotocol/sdk

# Python
pip install mcp
```

---

## 3. MCP Serverの3つのケーパビリティ

```
┌─────────────────────────────────────────────────┐
│                 MCP Server                       │
├─────────────────┬───────────────┬───────────────┤
│   Resources     │    Tools      │   Prompts     │
│   (データ)       │  (関数)        │ (テンプレート) │
└─────────────────┴───────────────┴───────────────┘
```

### 3.1 Resources

クライアントが読み取れるファイルライクなデータ。

```typescript
server.setRequestHandler("resources/list", async () => ({
  resources: [{
    uri: "file:///config.json",
    name: "Configuration",
    mimeType: "application/json"
  }]
}));
```

### 3.2 Tools

LLMがユーザー承認後に呼び出せる関数。

```typescript
server.setRequestHandler("tools/list", async () => ({
  tools: [{
    name: "search_database",
    description: "Search the database for records",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Search query" }
      },
      required: ["query"]
    }
  }]
}));
```

### 3.3 Prompts

特定タスク向けの事前定義テンプレート。

```typescript
server.setRequestHandler("prompts/list", async () => ({
  prompts: [{
    name: "code_review",
    description: "Review code for best practices",
    arguments: [{
      name: "language",
      description: "Programming language",
      required: true
    }]
  }]
}));
```

---

## 4. ビルド手順

### 4.1 TypeScript での実装

```typescript
import { Server } from "@modelcontextprotocol/sdk/server";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio";

// サーバー作成
const server = new Server({
  name: "my-custom-server",
  version: "1.0.0"
});

// ツール一覧
server.setRequestHandler("tools/list", async () => ({
  tools: [{
    name: "my_tool",
    description: "My custom tool",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string" }
      }
    }
  }]
}));

// ツール実行
server.setRequestHandler("tools/call", async (request) => {
  if (request.params.name === "my_tool") {
    const { query } = request.params.arguments;
    // 処理を実行
    return {
      content: [{
        type: "text",
        text: `Result for: ${query}`
      }]
    };
  }
  throw new Error(`Unknown tool: ${request.params.name}`);
});

// 起動
const transport = new StdioServerTransport();
await server.connect(transport);
```

### 4.2 Python での実装

```python
from mcp.server import Server
from mcp.server.stdio import stdio_server

server = Server("my-custom-server")

@server.list_tools()
async def list_tools():
    return [{
        "name": "my_tool",
        "description": "My custom tool",
        "inputSchema": {
            "type": "object",
            "properties": {
                "query": {"type": "string"}
            }
        }
    }]

@server.call_tool()
async def call_tool(name: str, arguments: dict):
    if name == "my_tool":
        return f"Result for: {arguments['query']}"
    raise ValueError(f"Unknown tool: {name}")

async def main():
    async with stdio_server() as (read, write):
        await server.run(read, write)
```

### 4.3 Claude Code への登録

```bash
# グローバル登録
claude mcp add --scope user my-server node /path/to/server.js

# プロジェクト登録
claude mcp add my-server node /path/to/server.js
```

### 4.4 .mcp.json での設定

```json
{
  "mcpServers": {
    "my-server": {
      "command": "node",
      "args": ["/path/to/server.js"],
      "env": {
        "API_KEY": "${MY_API_KEY}"
      }
    }
  }
}
```

---

## 5. ベストプラクティス

### 5.1 設計原則

| 原則 | 説明 |
|-----|------|
| 単一目的設計 | 1サーバー = 1ドメイン。モノリシック設計は避ける |
| ワークフロー起点 | APIオペレーションではなく、ユーザーワークフローから設計 |
| エラー設計 | エージェント判断に役立つエラーメッセージを設計 |

### 5.2 セキュリティ

| 項目 | 推奨 |
|-----|------|
| 認証 | OAuth Authorization Code Grant を使用 |
| 秘匿情報 | キーリング（macOS Keychain, Windows Credential Locker）に保存 |
| 入力検証 | すべてのパラメータをサニタイズ |

### 5.3 ツール設計

```
✅ 良い例: "search_customers" - 顧客を検索
✅ 良い例: "create_invoice" - 請求書を作成
❌ 悪い例: "api_call" - 汎用すぎる
❌ 悪い例: "do_stuff" - 意味が不明
```

### 5.4 エラーメッセージ

```typescript
// 良い例: エージェントが次のアクションを判断できる
throw new Error(
  "Customer not found. Available actions: " +
  "1) Search with different criteria, " +
  "2) Create new customer"
);

// 悪い例: 情報が不足
throw new Error("Not found");
```

---

## 6. アンチパターン

| パターン | 問題 | 解決策 |
|---------|------|--------|
| モノリシック設計 | 複数の無関係な機能を1サーバーに | 機能ごとに分離 |
| 生API露出 | APIエンドポイントをそのままツール化 | ワークフロー起点で再設計 |
| REST思考 | CRUD操作の羅列 | タスク完了に必要な操作を集約 |
| 平文クレデンシャル | 環境変数に直接保存 | キーリングを使用 |
| 過度な権限 | 全操作を1ツールに | 最小権限の原則 |

---

## 7. 参照リソース

### 公式ドキュメント

- SDK概要: https://modelcontextprotocol.io/docs/sdk
- ビルドガイド: https://modelcontextprotocol.io/docs/develop/build-server
- アーキテクチャ: https://modelcontextprotocol.io/docs/learn/architecture

### リファレンス実装

- 公式サーバー集: https://github.com/modelcontextprotocol/servers
- Anthropic MCP Servers: https://github.com/madhukarkumar/anthropic-mcp-servers

### ベストプラクティス

- Block社の設計Playbook: https://engineering.block.xyz/blog/blocks-playbook-for-designing-mcp-servers
- Docker ベストプラクティス: https://www.docker.com/blog/mcp-server-best-practices/

### 学習リソース

- Anthropic MCP入門: https://anthropic.skilljar.com/introduction-to-model-context-protocol
- DeepLearning.AI コース: https://www.deeplearning.ai/short-courses/mcp-build-rich-context-ai-apps-with-anthropic/

---

## 関連ドキュメント

- [MCP概要](mcp/01_overview.md) - MCPの基本とセットアップ
- [Hooks](05_hooks.md) - MCP連携の自動化
