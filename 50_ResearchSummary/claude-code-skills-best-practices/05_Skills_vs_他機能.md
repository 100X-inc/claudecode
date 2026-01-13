---
tags:
  - research
  - claude-code
  - skills
  - comparison
  - slash-commands
created: 2026-01-13
source: web-researcher
---

# Skills vs 他の拡張機能

## 概要

Claude Codeには複数の拡張機能があり、それぞれ異なる目的を持つ。Skillsをいつ使うべきか、他の機能との違いを明確にする。

## 機能比較

| 機能 | トリガー方法 | 主な用途 | コンテキスト消費 |
|------|-------------|---------|----------------|
| **Skills** | 自動（セマンティックマッチング） | 専門知識・ワークフローの提供 | Progressive Disclosure |
| **Slash Commands** | 明示的（/command） | プロンプトテンプレート | 全量ロード |
| **CLAUDE.md** | 常時 | プロジェクト/グローバル設定 | 常時ロード |
| **MCP** | ツール呼び出し | 外部サービス連携 | 呼び出し時のみ |
| **Hooks** | イベントトリガー | 自動処理 | 処理時のみ |

## Skills vs Slash Commands

### 主な違い

| 特徴 | Skills | Slash Commands |
|------|--------|----------------|
| **発動方法** | Claudeが自動判断 | ユーザーが明示的に`/command`入力 |
| **適用場面** | 専門知識・複雑なワークフロー | シンプルなプロンプトテンプレート |
| **コンテキスト管理** | Progressive Disclosure | 全量ロード |
| **再利用性** | 高（複数タスクで自動発動） | 低（毎回明示的に呼び出し） |

### いつSkillsを使うか

- タスクが**専門知識**を必要とする（API仕様、ドメイン知識等）
- **複数のファイル**やスクリプトをバンドルしたい
- Claudeに**自動的に発動**してほしい
- **Progressive Disclosure**でコンテキストを効率化したい

### いつSlash Commandsを使うか

- **プロンプトテンプレート**として使いたい
- ユーザーが**明示的に制御**したい
- シンプルな**1ファイル**で完結する

## Skills vs CLAUDE.md

### 主な違い

| 特徴 | Skills | CLAUDE.md |
|------|--------|-----------|
| **スコープ** | 特定タスク向け | プロジェクト/グローバル設定 |
| **ロードタイミング** | 必要時のみ | 常時 |
| **コンテキスト量** | 可変（必要に応じてロード） | 常に全量 |
| **ファイル構成** | フォルダ + 複数ファイル | 単一ファイル |

### いつSkillsを使うか

- 特定タスクでのみ必要な情報
- 大量のコンテキスト（Progressive Disclosureで効率化）
- スクリプトやテンプレートをバンドルしたい

### いつCLAUDE.mdを使うか

- プロジェクト全体の設定・ルール
- 常に適用すべきガイドライン
- 短い（500行以下推奨）情報

## Skills vs MCP

### 主な違い

| 特徴 | Skills | MCP |
|------|--------|-----|
| **性質** | 知識・指示 | ツール・アクション |
| **外部接続** | なし | 外部サービスと連携 |
| **実行** | Claudeが指示に従う | サーバーがアクションを実行 |

### 組み合わせパターン

SkillsとMCPは補完的に使用できる：

```markdown
# SKILL.md内でMCPツールを参照

## Using BigQuery

Use the BigQuery:bigquery_schema tool to retrieve table schemas.

```bash
# MCP呼び出し例
BigQuery:execute_query "SELECT * FROM users LIMIT 10"
```
```

**注意**: MCPツール参照は完全修飾名（`ServerName:tool_name`）を使用

## 使い分けフローチャート

```
タスクに専門知識が必要？
├── Yes: 複数ファイル/スクリプトをバンドル？
│   ├── Yes → Skills
│   └── No: 常時必要な情報？
│       ├── Yes → CLAUDE.md
│       └── No → Skills（シンプルなもの）
└── No: プロンプトテンプレートが欲しい？
    ├── Yes → Slash Commands
    └── No: 外部サービス連携？
        ├── Yes → MCP
        └── No: 自動処理？
            ├── Yes → Hooks
            └── No → 標準会話で対応
```

## 組み合わせ例

### Skills + CLAUDE.md

```
.claude/
├── CLAUDE.md           # グローバルルール（常時適用）
└── skills/
    └── pdf-processing/ # PDFタスク時のみロード
        └── SKILL.md
```

### Skills + MCP

```yaml
# SKILL.md
---
name: bigquery-analysis
description: Analyze data using BigQuery...
---

# BigQuery Analysis

## Available Tools

- `BigQuery:execute_query` - SQLクエリ実行
- `BigQuery:bigquery_schema` - スキーマ取得

## Workflow

1. Use `BigQuery:bigquery_schema` to understand table structure
2. Write and execute query with `BigQuery:execute_query`
```

### Skills + Slash Commands

```
~/.claude/
├── commands/
│   └── analyze-pdf.md    # 明示的なテンプレート起動
└── skills/
    └── pdf-processing/   # 自動発動の専門知識
        └── SKILL.md
```

## トークン効率比較

| 機能 | 初期ロード | 使用時ロード | 効率 |
|------|-----------|-------------|------|
| Skills | ~100トークン（メタデータのみ） | 必要なファイルのみ | 高 |
| Slash Commands | 0 | 全量 | 中 |
| CLAUDE.md | 全量 | - | 低（常時消費） |
| MCP | 0 | ツール定義のみ | 高 |

## 関連ノート

- [[00_概要]]
- [[02_ベストプラクティス詳細]]

## ソース

- [Agent Skills - Claude Code Docs](https://code.claude.com/docs/en/skills) - 取得日: 2026-01-13
- [Skill authoring best practices - Claude Docs](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices) - 取得日: 2026-01-13
