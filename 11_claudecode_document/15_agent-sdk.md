# Claude Agent SDK

プログラムでAIエージェントを構築するための公式ライブラリ

---

## 目次

1. [概要](#1-概要)
2. [インストール](#2-インストール)
3. [基本的な使い方](#3-基本的な使い方)
4. [組み込みツール](#4-組み込みツール)
5. [オプション設定](#5-オプション設定)
6. [query vs ClaudeSDKClient](#6-query-vs-claudesdkclient)
7. [サブエージェント](#7-サブエージェント)
8. [MCP統合](#8-mcp統合)
9. [Hooks](#9-hooks)
10. [セッション管理](#10-セッション管理)
11. [セキュリティ](#11-セキュリティ)
12. [ベストプラクティス](#12-ベストプラクティス)
13. [参照リソース](#13-参照リソース)

---

## 1. 概要

### Claude Agent SDKとは

Claude Agent SDKは、AnthropicがClaude Codeと同じツール、エージェントループ、コンテキスト管理をプログラムから利用できるようにした公式ライブラリ。

### 特徴

| 特徴 | 説明 |
|-----|------|
| 自動エージェントループ | プロンプト→API→ツール実行→結果処理を自動化 |
| 組み込みツール | 15+のツール（Read, Write, Edit, Bash等） |
| サブエージェント | 専門タスクの委譲 |
| MCP統合 | 外部ツールの追加 |
| セッション管理 | 会話コンテキストの永続化 |

### 対応言語

| 言語 | パッケージ | 要件 |
|-----|----------|------|
| Python | `claude-agent-sdk` | Python 3.10+ |
| TypeScript | `@anthropic-ai/claude-agent-sdk` | Node.js 18+ |

---

## 2. インストール

### 前提条件

- Claude Code CLI（インストール・認証済み）
- Anthropic APIキー

### Python

```bash
# pip
pip install claude-agent-sdk

# uv（推奨）
uv init && uv add claude-agent-sdk
```

### TypeScript

```bash
npm install @anthropic-ai/claude-agent-sdk
```

### 認証

```bash
# 推奨: Claude Code認証を共有
claude login

# 手動設定
export ANTHROPIC_API_KEY=your-api-key

# 代替プロバイダ
export CLAUDE_CODE_USE_BEDROCK=1    # Amazon Bedrock
export CLAUDE_CODE_USE_VERTEX=1     # Google Vertex AI
```

---

## 3. 基本的な使い方

### Python

```python
import asyncio
from claude_agent_sdk import query, ClaudeAgentOptions

async def main():
    async for message in query(
        prompt="auth.pyのバグを見つけて修正して",
        options=ClaudeAgentOptions(
            allowed_tools=["Read", "Edit", "Bash"],
            permission_mode="acceptEdits"
        )
    ):
        print(message)

asyncio.run(main())
```

### TypeScript

```typescript
import { query } from "@anthropic-ai/claude-agent-sdk";

async function main() {
  for await (const message of query({
    prompt: "auth.pyのバグを見つけて修正して",
    options: {
      allowedTools: ["Read", "Edit", "Bash"],
      permissionMode: "acceptEdits"
    }
  })) {
    console.log(message);
  }
}

main();
```

### メッセージの解析

```python
from claude_agent_sdk import (
    AssistantMessage, ResultMessage, TextBlock, ToolUseBlock
)

async for message in query(prompt="..."):
    if isinstance(message, AssistantMessage):
        for block in message.content:
            if isinstance(block, TextBlock):
                print(f"Claude: {block.text}")
            elif isinstance(block, ToolUseBlock):
                print(f"Tool: {block.name}")

    elif isinstance(message, ResultMessage):
        print(f"Status: {message.subtype}")
        print(f"Cost: ${message.total_cost_usd}")
```

---

## 4. 組み込みツール

| ツール | 用途 |
|-------|------|
| `Read` | ファイル読み取り（テキスト、画像、PDF、ノートブック） |
| `Write` | 新規ファイル作成 |
| `Edit` | 文字列置換による編集 |
| `Bash` | ターミナルコマンド実行 |
| `Glob` | パターンでファイル検索 |
| `Grep` | 正規表現でファイル内容検索 |
| `WebSearch` | Web検索 |
| `WebFetch` | Webページ取得・分析 |
| `AskUserQuestion` | ユーザーへの質問 |
| `Task` | サブエージェントへの委譲 |
| `TodoWrite` | タスクリスト管理 |
| `NotebookEdit` | Jupyterノートブック編集 |
| `ListMcpResources` | MCPリソース一覧 |
| `ReadMcpResource` | MCPリソース読み取り |
| `BashOutput` | バックグラウンドコマンド出力取得 |

---

## 5. オプション設定

### 主要オプション

| オプション | 型 | 説明 |
|-----------|---|------|
| `allowed_tools` | `list[str]` | 使用可能なツール |
| `permission_mode` | `str` | 権限モード |
| `system_prompt` | `str \| dict` | システムプロンプト |
| `cwd` | `str` | 作業ディレクトリ |
| `model` | `str` | Claudeモデル |
| `max_turns` | `int` | 最大ターン数 |
| `env` | `dict` | 環境変数 |

### 権限モード

```python
# デフォルト: 承認が必要
permission_mode="default"

# ファイル操作を自動承認
permission_mode="acceptEdits"

# すべて自動承認（注意）
permission_mode="bypassPermissions"

# 計画のみ（実行なし）
permission_mode="plan"
```

### システムプロンプト

```python
# カスタム
options=ClaudeAgentOptions(
    system_prompt="あなたはPythonの専門家です。PEP 8に従ってください。"
)

# Claude Codeプリセットを使用
options=ClaudeAgentOptions(
    system_prompt={
        "type": "preset",
        "preset": "claude_code"
    }
)

# プリセット + 追加指示
options=ClaudeAgentOptions(
    system_prompt={
        "type": "preset",
        "preset": "claude_code",
        "append": "必ずdocstringを追加してください。"
    }
)
```

---

## 6. query vs ClaudeSDKClient

### query() - 単発タスク

```python
# 各呼び出しが独立したセッション
async for msg in query(prompt="タスク1"):
    pass

async for msg in query(prompt="タスク2"):
    pass  # タスク1のコンテキストなし
```

**適用:**
- 独立したタスク
- コンテキスト不要
- シンプルな自動化

### ClaudeSDKClient - 継続的な会話

```python
from claude_agent_sdk import ClaudeSDKClient

async with ClaudeSDKClient() as client:
    # 最初の質問
    await client.query("認証モジュールを読んで")
    async for msg in client.receive_response():
        pass

    # フォローアップ（コンテキスト保持）
    await client.query("それを呼び出している箇所を探して")
    async for msg in client.receive_response():
        pass
```

**適用:**
- マルチターン会話
- フォローアップ質問
- 対話型アプリケーション

---

## 7. サブエージェント

専門タスクを別のエージェントに委譲:

```python
from claude_agent_sdk import query, ClaudeAgentOptions, AgentDefinition

async for message in query(
    prompt="コードをレビューして",
    options=ClaudeAgentOptions(
        allowed_tools=["Read", "Glob", "Grep", "Task"],
        agents={
            "code-reviewer": AgentDefinition(
                description="コード品質とセキュリティをレビュー",
                prompt="コード品質を分析し改善提案を行う",
                tools=["Read", "Glob", "Grep"],
                model="opus"
            ),
            "test-writer": AgentDefinition(
                description="包括的なユニットテストを作成",
                prompt="エッジケースをカバーするテストを書く",
                tools=["Read", "Write", "Bash"]
            )
        }
    )
):
    print(message)
```

---

## 8. MCP統合

### MCPサーバーの追加

```python
options=ClaudeAgentOptions(
    mcp_servers={
        "playwright": {
            "command": "npx",
            "args": ["@playwright/mcp@latest"]
        }
    }
)
```

### カスタムツールの作成

```python
from claude_agent_sdk import tool, create_sdk_mcp_server

@tool("calculate", "数学計算を実行", {"expression": str})
async def calculate(args):
    result = eval(args["expression"], {"__builtins__": {}})
    return {
        "content": [{
            "type": "text",
            "text": f"Result: {result}"
        }]
    }

calculator = create_sdk_mcp_server(
    name="calculator",
    tools=[calculate]
)

options=ClaudeAgentOptions(
    mcp_servers={"calc": calculator},
    allowed_tools=["mcp__calc__calculate"]
)
```

---

## 9. Hooks

エージェントの動作をインターセプト:

```python
from claude_agent_sdk import query, ClaudeAgentOptions, HookMatcher

async def validate_bash(input_data, tool_use_id, context):
    """危険なコマンドをブロック"""
    if input_data['tool_name'] == 'Bash':
        cmd = input_data['tool_input'].get('command', '')
        if 'rm -rf /' in cmd:
            return {
                'hookSpecificOutput': {
                    'permissionDecision': 'deny',
                    'permissionDecisionReason': '危険なコマンド'
                }
            }
    return {}

async def log_tools(input_data, tool_use_id, context):
    """ツール使用をログ"""
    print(f"[AUDIT] Using: {input_data.get('tool_name')}")
    return {}

options=ClaudeAgentOptions(
    hooks={
        'PreToolUse': [
            HookMatcher(matcher='Bash', hooks=[validate_bash]),
            HookMatcher(hooks=[log_tools])
        ]
    }
)
```

### 利用可能なフック

| フック | タイミング |
|-------|----------|
| `PreToolUse` | ツール実行前 |
| `PostToolUse` | ツール成功後 |
| `PostToolUseFailure` | ツール失敗後 |
| `UserPromptSubmit` | プロンプト送信時 |
| `SessionStart` | セッション開始時 |
| `SessionEnd` | セッション終了時 |
| `Stop` | 実行停止時 |
| `SubagentStop` | サブエージェント完了時 |

---

## 10. セッション管理

### セッションの継続

```python
# セッションIDを取得
session_id = None
async for message in query(prompt="認証モジュールを読んで"):
    if hasattr(message, 'subtype') and message.subtype == 'init':
        session_id = message.session_id

# セッションを継続
async for message in query(
    prompt="呼び出し箇所を探して",
    options=ClaudeAgentOptions(resume=session_id)
):
    print(message)
```

### セッションのフォーク

```python
# 新しいセッションに分岐
async for message in query(
    prompt="別のアプローチを試す",
    options=ClaudeAgentOptions(
        resume=session_id,
        fork_session=True  # 新しいセッションを作成
    )
):
    pass
```

---

## 11. セキュリティ

### カスタム権限ハンドラ

```python
async def check_permissions(tool_name, input_data, context):
    """カスタム権限ロジック"""

    # システムディレクトリへの書き込みをブロック
    if tool_name == "Write" and "/system/" in input_data.get("file_path", ""):
        return {
            "behavior": "deny",
            "message": "システムディレクトリへのアクセス拒否"
        }

    return {"behavior": "allow", "updatedInput": input_data}

options=ClaudeAgentOptions(
    can_use_tool=check_permissions,
    allowed_tools=["Read", "Write", "Edit"]
)
```

### 最小権限の原則

```python
# 読み取り専用で開始
options=ClaudeAgentOptions(
    allowed_tools=["Read", "Glob", "Grep"],
    add_dirs=["/home/user/project"],
    disallowed_tools=["Bash"]
)
```

---

## 12. ベストプラクティス

### コンテキスト管理

- フォルダ構造を戦略的に設計
- セマンティック検索より先にエージェント検索を使用
- コンテキストウィンドウを集中させる

### ツール設計

- ツールは主要なアクションを表現
- 最小限のツールセットから開始
- 必要に応じて拡張

### エージェント分離

- 1エージェント = 1責務
- オーケストレータがグローバル状態を管理
- 分離が良いほどパフォーマンス向上

### エラーハンドリング

```python
from claude_agent_sdk import (
    query,
    CLINotFoundError,
    ProcessError,
    CLIJSONDecodeError
)

try:
    async for message in query(prompt="..."):
        pass
except CLINotFoundError:
    print("Claude Codeをインストールしてください")
except ProcessError as e:
    print(f"終了コード: {e.exit_code}")
```

### コスト管理

```python
async for message in query(prompt="..."):
    if isinstance(message, ResultMessage):
        print(f"合計コスト: ${message.total_cost_usd}")

# 予算制限
options=ClaudeAgentOptions(
    max_budget_usd=10.0,
    max_turns=5
)
```

---

## 13. 参照リソース

### 公式ドキュメント

- Agent SDK概要: https://platform.claude.com/docs/en/agent-sdk/overview
- Python SDK: https://platform.claude.com/docs/en/agent-sdk/python
- TypeScript SDK: https://platform.claude.com/docs/en/agent-sdk/typescript
- クイックスタート: https://platform.claude.com/docs/en/agent-sdk/quickstart

### GitHub

- Python SDK: https://github.com/anthropics/claude-agent-sdk-python
- TypeScript SDK: https://github.com/anthropics/claude-agent-sdk-typescript
- サンプル: https://github.com/anthropics/claude-agent-sdk-demos

### 関連ドキュメント

- [Agents](06_agents.md) - Claude Code内のSubagents
- [MCP Development](12_mcp-development.md) - MCPサーバー開発
- [Headless Mode](13_headless-cicd.md) - CLI自動化
