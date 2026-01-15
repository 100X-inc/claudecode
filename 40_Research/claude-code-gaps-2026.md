# Claude Code ギャップ分析 2026

10_Document で不足している重要な概念の調査レポート

**調査日:** 2026-01-14
**目的:** 既存ドキュメントのギャップを特定し、補完情報を提供

---

## 目次

1. [MCP Server開発](#1-mcp-server開発)
2. [Extended Thinking / Ultrathink](#2-extended-thinking--ultrathink)
3. [Headless Mode / CI/CD統合](#3-headless-mode--cicd統合)
4. [Context Engineering上級テクニック](#4-context-engineering上級テクニック)
5. [Background Tasks & Async Agents](#5-background-tasks--async-agents)
6. [Remote Sessions](#6-remote-sessions)
7. [Multi-Agent Orchestration](#7-multi-agent-orchestration)
8. [その他の注目機能](#8-その他の注目機能)
9. [10_Documentへの統合推奨](#9-10_documentへの統合推奨)

---

## 1. MCP Server開発

### 概要

Model Context Protocol (MCP) サーバーは、Claude Code に外部ツールやデータソースを接続するための標準プロトコル。現在の 10_Document では MCP の使用方法は説明されているが、カスタムサーバーの構築方法は未文書化。

### 公式SDK

| 言語 | ステータス | リポジトリ |
|-----|----------|-----------|
| TypeScript | 安定版（v2開発中） | modelcontextprotocol/typescript-sdk |
| Python | 安定版 | modelcontextprotocol/python-sdk |
| C# | 安定版 | - |
| Java | 安定版 | - |

### MCP Server の3つのケーパビリティ

```
┌─────────────────────────────────────────────────┐
│                 MCP Server                       │
├─────────────────┬───────────────┬───────────────┤
│   Resources     │    Tools      │   Prompts     │
│   (ファイル等)   │  (LLM呼出可)   │ (テンプレート) │
└─────────────────┴───────────────┴───────────────┘
```

1. **Resources**: クライアントが読み取れるファイルライクなデータ
2. **Tools**: LLM がユーザー承認後に呼び出せる関数
3. **Prompts**: 特定タスク向けの事前定義テンプレート

### ビルド手順（TypeScript）

```typescript
// 1. 依存インストール
// npm install @modelcontextprotocol/sdk

// 2. サーバー実装
import { Server } from "@modelcontextprotocol/sdk/server";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio";

const server = new Server({
  name: "my-custom-server",
  version: "1.0.0"
});

// ツール定義
server.setRequestHandler("tools/list", async () => ({
  tools: [{
    name: "my_tool",
    description: "My custom tool",
    inputSchema: {
      type: "object",
      properties: { query: { type: "string" } }
    }
  }]
}));

// ツール実行
server.setRequestHandler("tools/call", async (request) => {
  if (request.params.name === "my_tool") {
    return { content: [{ type: "text", text: "Result" }] };
  }
});

// 起動
const transport = new StdioServerTransport();
await server.connect(transport);
```

### ベストプラクティス

| 原則 | 説明 |
|-----|------|
| 単一目的設計 | 1サーバー = 1ドメイン。モノリシック設計は避ける |
| ワークフロー起点 | ユーザーの実際のワークフローからトップダウンで設計 |
| エラー設計 | エージェント判断に役立つエラーメッセージを設計 |
| セキュリティ | OAuth + キーリング（直接クレデンシャル禁止） |

### アンチパターン

- ❌ 複数の無関係な機能を1サーバーに詰め込む
- ❌ 生APIオペレーションをそのまま露出
- ❌ REST API思考でLLM最適化を怠る
- ❌ クレデンシャルを暗号化なしで保存

### 参照リソース

- 公式SDK: https://modelcontextprotocol.io/docs/sdk
- ビルドガイド: https://modelcontextprotocol.io/docs/develop/build-server
- リファレンスサーバー: https://github.com/modelcontextprotocol/servers
- Block社の設計Playbook: https://engineering.block.xyz/blog/blocks-playbook-for-designing-mcp-servers

---

## 2. Extended Thinking / Ultrathink

### 概要

Extended Thinking は Claude に内部推論プロセスを明示的に実行させる機能。複雑な問題解決で品質が大幅に向上する。

### 対応モデル

- Claude 4
- Claude Sonnet 4.5
- Claude Haiku 4.5
- Claude Opus 4.5

### 設定方法

API での設定:
```json
{
  "thinking": {
    "type": "enabled",
    "budget_tokens": 10000
  }
}
```

### トリガーキーワード（Claude Code内）

| レベル | キーワード | 思考予算 |
|-------|-----------|---------|
| 1 | think | 低 |
| 2 | think hard | 中 |
| 3 | think harder | 高 |
| 4 | ultrathink | 最大 |

### Interleaved Thinking

Claude 4 モデルでは、ツール呼び出しの間に思考ブロックを挿入可能:

```
User → Claude思考 → Tool呼び出し → Claude思考 → Tool呼び出し → 最終回答
```

**利点:** 中間結果に基づいて次のアクションをより賢く判断

### Thinking Block Clearing

新機能: 前のターンの思考ブロックを自動削除し、コンテキストを効率化

### 使用推奨シナリオ

- 数学的推論
- 複雑なコード分析
- マルチステップ問題解決
- アーキテクチャ設計

### 参照リソース

- 公式ドキュメント: https://docs.claude.com/en/docs/build-with-claude/extended-thinking
- 実践Tips: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/extended-thinking-tips

---

## 3. Headless Mode / CI/CD統合

### 概要

Claude Code をスクリプトやCI/CDパイプラインから非対話的に実行する方法。

### 基本コマンド

```bash
# 基本的なヘッドレス実行
claude -p "Fix the type errors in src/utils.ts"

# システムプロンプト追加
claude -p "Review this code" --append-system-prompt "Focus on security issues"

# 権限スキップ（隔離環境のみ）
claude -p "Run all tests" --dangerously-skip-permissions

# ターン制限
claude -p "Add a simple feature" --max-turns 5
```

### 主要オプション

| オプション | 説明 |
|-----------|------|
| `-p`, `--print` | 対話なしで実行、結果をstdoutに出力 |
| `--append-system-prompt` | デフォルト動作を維持しつつ指示を追加 |
| `--dangerously-skip-permissions` | 権限チェックをバイパス |
| `--max-turns` | 実行ターン数を制限 |
| `--output-format json` | JSON形式で出力 |

### GitHub Actions 統合例

```yaml
name: Claude Code Review

on: [pull_request]

jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Install Claude Code
        run: npm install -g @anthropic-ai/claude-code

      - name: Run Code Review
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
        run: |
          claude -p "Review the changes in this PR for security issues" \
            --output-format json > review.json
```

### GitLab CI 統合例

```yaml
code-review:
  stage: review
  script:
    - npm install -g @anthropic-ai/claude-code
    - claude -p "Analyze code quality" --max-turns 3
  only:
    - merge_requests
```

### 注意事項

- 一部のCI環境では `/login` が必要な場合がある
- 長時間実行タスクには Agent SDK 方式を推奨
- `--dangerously-skip-permissions` は必ず隔離環境（Docker等）で使用

### 参照リソース

- 公式ドキュメント: https://code.claude.com/docs/en/headless
- 実践ガイド: https://angelo-lima.fr/en/claude-code-cicd-headless-en/

---

## 4. Context Engineering上級テクニック

### 概要

コンテキストウィンドウは有限リソース。トークン数が増えると推論品質が低下するため、戦略的な管理が必要。

### 4つの主要テクニック

#### 4.1 Compaction（圧縮）

コンテキスト上限に近づいた時、会話を要約して重要な決定事項のみ保持:

```
会話履歴 (50K tokens) → Compaction → 要約 (5K tokens)
                         ↓
                    重要な決定事項
                    コードスニペット
                    エラー情報
```

#### 4.2 Structured Note-Taking

コンテキストウィンドウ外の永続メモリファイルを活用:

```markdown
# session-notes.md

## 決定事項
- 認証方式: JWT
- DB: PostgreSQL

## 未解決
- キャッシュ戦略

## 次のステップ
1. API設計
2. テスト作成
```

#### 4.3 Just-in-Time Loading

事前にすべてのデータをロードせず、必要時にツール経由で動的取得:

```
❌ 悪い例: 全ファイルを最初にコンテキストに含める
✅ 良い例: 必要になった時点でRead/Grepツールで取得
```

#### 4.4 Sub-Agent Architecture

専門エージェントが焦点を絞ったタスクを処理し、凝縮した結果を返す:

```
Main Agent
    ├── Code Review Agent → "3件の問題を発見"
    ├── Test Agent → "全テストパス"
    └── Security Agent → "脆弱性なし"
```

### 効果測定データ

Anthropic研究によると:
- Context editing + Memory tool = **39%のパフォーマンス向上**
- GitHub Copilot事例: Progressive Disclosure で **54%のトークン削減**

### 参照リソース

- 公式ガイド: https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents

---

## 5. Background Tasks & Async Agents

### 概要

v2.0.64以降、サブエージェントをバックグラウンドで実行し、メインエージェントで別タスクを継続可能。

### 機能

| 機能 | 説明 |
|-----|------|
| 非同期実行 | タスクIDを返して即座に次のプロンプトに対応 |
| Background Agents | サブエージェントをバックグラウンド化 |
| プロセス永続化 | セッション間でプロセス継続 |
| 自動クリーンアップ | Claude Code終了時に自動終了 |

### 使用方法

Task ツールで `run_in_background: true` を指定:

```json
{
  "description": "Run tests in background",
  "prompt": "Execute all unit tests",
  "run_in_background": true
}
```

### タスク管理コマンド

```bash
# 実行中タスクの確認
/tasks

# タスク出力の取得
TaskOutput tool with task_id

# バックグラウンドシェルの終了
KillShell tool with shell_id
```

### 無効化オプション

```bash
export CLAUDE_CODE_DISABLE_BACKGROUND_TASKS=1
```

### 参照リソース

- Claude Code リリースノート: https://docs.anthropic.com/en/release-notes/claude-code

---

## 6. Remote Sessions

### 概要

Claude Code をWeb上で実行し、ローカル環境と連携する機能。

### 主要機能

| 機能 | 説明 |
|-----|------|
| Web実行 | `&` プレフィックスでタスクをWeb上で実行 |
| セッション永続化 | ノートパソコンを閉じてもセッション継続 |
| モバイル監視 | iOSアプリからセッション状態を確認 |
| 一方向性 | Web→ローカル取り込みは可能、逆は不可 |

### 使用方法

```bash
# Webで長時間タスクを実行
& claude -p "Refactor the entire authentication module"

# 後でローカルに取り込み
claude --resume <session-id>
```

### Agent SDK Session Management

```python
from anthropic import Anthropic

client = Anthropic()

# セッション作成
response = client.sessions.create()
session_id = response.session_id

# セッション復元
response = client.sessions.continue(
    session_id=session_id,
    messages=[...]
)
```

### 参照リソース

- 公式ドキュメント: https://code.claude.com/docs/en/claude-code-on-the-web

---

## 7. Multi-Agent Orchestration

### 概要

複数のエージェントを協調させて複雑なタスクを解決するパターン。

### Conductor パターン

「指揮者」が複雑さを吸収し、専門エージェントに委譲:

```
                    ┌─────────────┐
                    │  Conductor  │
                    │  (指揮者)    │
                    └──────┬──────┘
           ┌───────────────┼───────────────┐
           ▼               ▼               ▼
    ┌────────────┐  ┌────────────┐  ┌────────────┐
    │ Code Agent │  │ Test Agent │  │ Doc Agent  │
    └────────────┘  └────────────┘  └────────────┘
```

### Fan-Out / Map-Reduce

```
入力 → [Agent1, Agent2, Agent3] → 結果マージ → 出力
```

**適用例:** 大規模コードベースの並列分析

### Pipeline パターン

```
入力 → Agent1 → Agent2 → Agent3 → 出力
```

**適用例:** コード生成 → レビュー → テスト

### Git Worktree 隔離

複数エージェントが同時にコードを変更する際、Git worktree で隔離:

```bash
# メインブランチ
git worktree add ../agent1-workspace feature-1
git worktree add ../agent2-workspace feature-2
```

### 共有計画ドキュメント

複数エージェント間の通信ハブとして `PLAN.md` を使用:

```markdown
# PLAN.md

## Current Status
- Agent1: In Progress (authentication)
- Agent2: Completed (database schema)
- Agent3: Pending (API endpoints)

## Decisions
- Use JWT for auth
- PostgreSQL for persistence
```

### 参照リソース

- ccswarm: https://github.com/wshobson/agents
- claude-flow: https://github.com/ruvnet/claude-flow

---

## 8. その他の注目機能

### 8.1 LSP Integration

Language Server Protocol 連携でリアルタイムコード診断:

- Go-to-definition
- Find references
- Hover documentation
- 型エラーのリアルタイム検出

**効果:** "single biggest productivity gain" と評価される

### 8.2 Hot Reload for Skills

`~/.claude/skills` または `.claude/skills` 内のSkillは即座に反映:

- 再起動不要
- 開発中のSkillをすぐにテスト可能

### 8.3 Token最適化テクニック

| テクニック | 効果 |
|-----------|------|
| System Prompt Patching | ~50%削減、10,000+トークン解放 |
| MCP Lazy Loading | 必要時のみツール読み込み |
| Skills活用 | フルエージェントコンテキストより効率的 |

### 8.4 /chrome コマンド

Chromeブラウザと直接連携してUIデバッグ:

```
/chrome open https://localhost:3000
/chrome screenshot
/chrome click "#submit-button"
```

### 8.5 Plan Mode のショートカット

`Shift+Tab` を2回押すと Plan Mode が有効化

---

## 9. 10_Documentへの統合推奨

### 高優先度（新規ドキュメント作成推奨）

| ファイル名 | 内容 |
|-----------|------|
| `12_mcp-development.md` | MCP Server開発ガイド |
| `13_headless-cicd.md` | Headless Mode & CI/CD統合 |
| `14_extended-thinking.md` | Extended Thinking詳細 |

### 中優先度（既存ドキュメントに追記推奨）

| 対象ファイル | 追記内容 |
|-------------|---------|
| `11_agent-best-practices.md` | Multi-Agent Orchestration パターン |
| `10_progressive-disclosure.md` | Context Engineering上級テクニック |
| `06_agents.md` | Background Tasks & Async Agents |

### 低優先度（参照リンク追加）

| 対象 | 追加するリンク |
|-----|---------------|
| `01_overview.md` | Remote Sessions, LSP Integration への言及 |
| MCP セクション | Server開発ドキュメントへのリンク |

---

## 参照ソース一覧

### 公式 Anthropic

- https://www.anthropic.com/engineering/claude-code-best-practices
- https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents
- https://code.claude.com/docs/en/overview
- https://docs.anthropic.com/en/release-notes/claude-code
- https://modelcontextprotocol.io/docs/sdk
- https://docs.claude.com/en/docs/build-with-claude/extended-thinking

### コミュニティ

- https://claudelog.com/
- https://github.com/ykdojo/claude-code-tips
- https://dev.to/valgard/claude-code-must-haves-january-2026-kem
- https://engineering.block.xyz/blog/blocks-playbook-for-designing-mcp-servers
