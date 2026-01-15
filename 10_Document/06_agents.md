---
name: agents
description: Subagentsの作成と管理
---

# Claude Code Agents / Subagents 完全ガイド

## 目次

1. [Subagentsとは](#1-subagentsとは)
2. [ファイル構造と設定](#2-ファイル構造と設定)
3. [組み込みSubagents](#3-組み込みsubagents)
4. [カスタムSubagentの作成](#4-カスタムsubagentの作成)
5. [Subagentの管理](#5-subagentの管理)
6. [高度な機能](#6-高度な機能)
7. [ベストプラクティス](#7-ベストプラクティス)

---

## 1. Subagentsとは

### 概要

**Subagents**は専門分野に特化したAIアシスタントです。メイン会話から独立したコンテキストウィンドウで動作し、タスク固有の設定、カスタムシステムプロンプト、ツール権限を備えています。

### 主な特徴

| 特徴 | 説明 |
|------|------|
| **独立したコンテキスト** | メイン会話とは別のコンテキストで実行 |
| **専門化** | 特定タスクに特化した設定が可能 |
| **ツール制限** | 使用可能なツールを制限できる |
| **モデル選択** | エージェントごとに異なるモデルを指定可能 |
| **再開可能** | 前回の会話から続行可能 |

---

## 2. ファイル構造と設定

### ファイル位置と優先度

```
プロジェクトレベル: .claude/agents/*.md        (最高優先度)
ユーザーレベル:    ~/.claude/agents/*.md       (低優先度)
CLI動的設定:       --agents JSONフラグ          (中優先度)
```

### Subagentファイル構造

```markdown
---
name: unique-agent-name
description: When to use this agent
tools: Read, Edit, Grep, Bash
model: sonnet
permissionMode: default
skills: skill1, skill2
---

エージェントのシステムプロンプトをここに記述。
詳細な指示、ベストプラクティス、制約条件を含める。
```

### フロントマターのフィールド

| フィールド | 必須 | 説明 | 値の例 |
|-----------|------|------|--------|
| `name` | ○ | 一意の識別子 | `code-reviewer` |
| `description` | ○ | 使用タイミングの説明 | `コードレビュー時に使用` |
| `tools` | × | 使用可能なツール | `Read, Edit, Grep` |
| `model` | × | 使用モデル | `sonnet`, `opus`, `haiku`, `inherit` |
| `permissionMode` | × | 権限モード | `default`, `acceptEdits`, `bypassPermissions`, `plan` |
| `skills` | × | 使用するSkills | `code-review, security-check` |

### permissionModeの値

| 値 | 説明 |
|----|------|
| `default` | 通常モード：許可プロンプト表示 |
| `acceptEdits` | ファイル編集を自動承認 |
| `bypassPermissions` | 全ての許可をスキップ（注意） |
| `plan` | 読み取り専用モード |
| `ignore` | 権限チェックを無視 |

---

## 3. 組み込みSubagents

### Plan Subagent

プランモード用のエージェント。読み取り専用でコードベースを分析。

```
用途: 実装計画の立案
モード: 読み取り専用
ツール: Read, Grep, Glob
```

### Explore Subagent

高速な軽量検索エージェント。Haikuモデルを使用。

```
用途: コードベースの探索・検索
モデル: Haiku（高速・低コスト）
ツール: Read, Grep, Glob
```

### General Purpose Subagent

複雑なマルチステップタスク用。全ツール使用可能。

```
用途: 複雑なタスクの自律実行
モデル: 継承（親と同じ）
ツール: 全ツール
```

---

## 4. カスタムSubagentの作成

### ステップ1: ディレクトリ作成

```bash
# プロジェクト用
mkdir -p .claude/agents

# 個人用
mkdir -p ~/.claude/agents
```

### ステップ2: エージェントファイル作成

**.claude/agents/code-reviewer.md**:

```markdown
---
name: code-reviewer
description: コードレビューと品質チェックを実行。PRレビュー時に使用。
tools: Read, Grep, Glob
model: sonnet
permissionMode: plan
skills: code-review
---

# コードレビューエージェント

あなたはシニアソフトウェアエンジニアとしてコードレビューを実行します。

## レビュー基準

1. **コード品質**
   - 可読性と保守性
   - DRY原則の遵守
   - 適切な命名規則

2. **セキュリティ**
   - 入力検証
   - 認証・認可
   - 機密情報の取り扱い

3. **パフォーマンス**
   - アルゴリズムの効率性
   - リソース使用量
   - キャッシング戦略

## 出力形式

レビュー結果は以下の形式で報告：
- 重大な問題（Critical）
- 改善推奨（Improvement）
- 軽微な指摘（Minor）
```

### ステップ3: セキュリティテストエージェント例

**.claude/agents/security-auditor.md**:

```markdown
---
name: security-auditor
description: セキュリティ監査と脆弱性チェック。セキュリティレビュー時に使用。
tools: Read, Grep, Glob
model: opus
permissionMode: plan
---

# セキュリティ監査エージェント

セキュリティの専門家としてコードベースを監査します。

## チェック項目

### OWASP Top 10
- SQLインジェクション
- XSS（クロスサイトスクリプティング）
- CSRF（クロスサイトリクエストフォージェリ）
- 認証の不備
- セキュリティ設定ミス

### 機密情報
- ハードコードされた認証情報
- APIキーの露出
- 環境変数の不適切な使用

## 報告形式

脆弱性は以下の形式で報告：
- 深刻度: Critical / High / Medium / Low
- 場所: ファイル:行番号
- 説明: 問題の詳細
- 修正案: 推奨される対策
```

---

## 5. Subagentの管理

### インタラクティブUI

```bash
/agents
```

利用可能なエージェント一覧を表示し、選択・実行できます。

### CLI動的設定

```bash
claude --agents '{
  "custom-agent": {
    "description": "一時的なエージェント",
    "tools": ["Read", "Grep"],
    "model": "haiku"
  }
}'
```

### Taskツールからの呼び出し

Claudeは自動的に適切なSubagentを選択して実行します：

```
ユーザー: このPRをレビューして
Claude: [code-reviewerエージェントを自動選択して実行]
```

---

## 6. 高度な機能

### エージェントの連鎖（Chaining）

複数のSubagentを連続して実行：

```
1. security-auditor → セキュリティチェック
2. code-reviewer → コード品質チェック
3. documentation-writer → ドキュメント更新
```

### 会話の再開（Resume）

前回の実行から続行：

```bash
# agentIdを指定して再開
claude --resume <agentId>
```

### 動的選択（Dynamic Selection）

Claudeはdescriptionに基づいて適切なエージェントを自動選択：

```markdown
---
description: コードレビュー、PR確認、品質チェックが必要な時に使用
---
```

ユーザーが「レビュー」「品質チェック」などのキーワードを使うと自動選択されます。

### Background Tasks & Async Agents

v2.0.64以降、サブエージェントをバックグラウンドで実行し、メインエージェントで別タスクを継続可能。

#### 機能

| 機能 | 説明 |
|-----|------|
| 非同期実行 | タスクIDを返して即座に次のプロンプトに対応 |
| Background Agents | サブエージェントをバックグラウンド化 |
| プロセス永続化 | セッション間でプロセス継続 |
| 自動クリーンアップ | Claude Code終了時に自動終了 |

#### 使用方法

Taskツールで `run_in_background: true` を指定：

```json
{
  "description": "Run tests in background",
  "prompt": "Execute all unit tests",
  "run_in_background": true
}
```

#### タスク管理

| コマンド/ツール | 用途 |
|---------------|------|
| `/tasks` | 実行中タスクの確認 |
| `TaskOutput` | タスク出力の取得 |
| `KillShell` | バックグラウンドシェルの終了 |

#### 無効化

```bash
export CLAUDE_CODE_DISABLE_BACKGROUND_TASKS=1
```

---

## 7. ベストプラクティス

### 明確なdescriptionを書く

```markdown
# 良い例
description: コードレビューと品質チェック。PR確認、コード分析、リファクタリング提案時に使用。

# 悪い例
description: コードを見る
```

### ツールを最小限に制限

```markdown
# 読み取り専用タスク
tools: Read, Grep, Glob

# 編集が必要なタスク
tools: Read, Edit, Write, Grep
```

### 適切なモデルを選択

| タスク | 推奨モデル |
|--------|----------|
| 高速な検索・探索 | `haiku` |
| 一般的なタスク | `sonnet` |
| 複雑な分析・設計 | `opus` |
| 親と同じ | `inherit` |

### Skillsとの組み合わせ

```markdown
---
name: security-reviewer
skills: security-check, owasp-checklist
---
```

Skillsを指定することで、エージェントに専門知識を付与できます。

### permissionModeの適切な選択

```markdown
# 分析のみ（安全）
permissionMode: plan

# ファイル編集が必要
permissionMode: acceptEdits

# 通常（許可プロンプト表示）
permissionMode: default
```

---

## サンプル集

### ドキュメント生成エージェント

```markdown
---
name: doc-writer
description: ドキュメント生成。README、API docs、コメント追加時に使用。
tools: Read, Write, Edit, Grep
model: sonnet
---

# ドキュメント生成エージェント

明確で包括的なドキュメントを生成します。

## スタイルガイド
- 簡潔で明確な文章
- コード例を含める
- 対象読者を意識
```

### テストエージェント

```markdown
---
name: test-writer
description: テストコード生成。ユニットテスト、統合テスト作成時に使用。
tools: Read, Write, Edit, Bash
model: sonnet
permissionMode: acceptEdits
---

# テスト生成エージェント

包括的なテストケースを生成します。

## テスト戦略
- 正常系テスト
- 異常系テスト
- エッジケース
- モックの適切な使用
```

---

## 参考リンク

- [Subagents Documentation](https://docs.anthropic.com/en/docs/claude-code/sub-agents)
- [Task Tool Reference](https://docs.anthropic.com/en/docs/claude-code/task-tool)
