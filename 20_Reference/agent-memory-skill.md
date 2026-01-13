# Claude Codeで記憶領域を持つAgent Skills

> 出典: https://zenn.dev/yamadashy/articles/claude-code-agent-skills-agent-memory

## 概要

Claude Codeで作業内容を記憶させるカスタムAgent Skillsの実装方法。マルチタスク時に細かい対応内容を記憶させておき、後から思い出せる仕組み。

**コンセプト**: 「マルチタスクをこなすうえで大事なのは、メモを残して忘れること」

## 使い方

| 操作 | トリガーフレーズ |
|------|-----------------|
| 保存 | 「記憶して」「覚えておいて」「保存して」「メモして」 |
| 検索 | 「○○について思い出して」「メモ確認して」 |

## フォルダ構造

```
.claude/skills/agent-memory/
├── SKILL.md          # スキル定義
├── .gitignore        # memories/を除外
└── memories/         # 記憶保存領域
    ├── issue-123/
    │   └── investigation.md
    └── feature-x/
        └── design-decision.md
```

## 記憶ファイルの形式

YAML frontmatter付きのマークダウンファイル:

```markdown
---
summary: "Issue #123 の調査結果と方針"
created: 2025-01-01
updated: 2025-01-05
status: in-progress
tags: [bug, authentication]
related: [memories/auth/login-flow.md]
---

# 調査内容

ここに詳細な内容を記述...
```

### Frontmatterフィールド

| フィールド | 必須 | 説明 |
|-----------|------|------|
| `summary` | ○ | 1-2行の説明（検索用） |
| `created` | ○ | 作成日（YYYY-MM-DD） |
| `updated` | - | 更新日 |
| `status` | - | `in-progress` / `resolved` / `blocked` / `abandoned` |
| `tags` | - | タグリスト |
| `related` | - | 関連ファイル |

## 検索ワークフロー

ripgrepを使った効率的な検索:

```bash
# カテゴリ一覧
ls .claude/skills/agent-memory/memories/

# サマリー一覧を取得
rg "^summary:" .claude/skills/agent-memory/memories/ --no-ignore --hidden

# キーワードで検索
rg "認証" .claude/skills/agent-memory/memories/ --no-ignore --hidden
```

## 導入手順

### 1. ディレクトリ作成

```bash
mkdir -p .claude/skills/agent-memory/memories
```

### 2. SKILL.md作成

`.claude/skills/agent-memory/SKILL.md`:

```markdown
# Agent Memory

Persistent memory storage for knowledge across conversations.
Location: `.claude/skills/agent-memory/memories/`

## When to Use

**Proactive usage:**
- Save research findings and non-obvious patterns
- Save solutions to problems
- Save architectural decisions
- Save in-progress work
- Check memories before investigating related problems

## Organization

Use category folders with kebab-case naming:
```
memories/
├── file-processing/
├── dependencies/
└── project-context/
```

## Operations

### Save
- Create category folders as needed
- Write files with required frontmatter
- Use `date +%Y-%m-%d` for timestamps

### Maintain
- Update content when information changes
- Delete obsolete memories
- Consolidate related notes
- Reorganize as category grows

### Search (Summary-first approach)
1. List categories
2. View summaries: `rg "^summary:" memories/ --no-ignore --hidden`
3. Search summaries/tags for keywords
4. Full-text search when needed
5. Read specific relevant files

## Guidelines

- Write self-contained notes with full context
- Keep summaries decisive
- Maintain currency
- Prioritize practical utility over comprehensiveness
```

### 3. .gitignore作成

`.claude/skills/agent-memory/.gitignore`:

```
memories/
```

## 他ツールとの比較

| 観点 | Agent Skills | Memory MCP | claude-mem |
|------|-------------|------------|------------|
| 保存場所 | リポジトリ内 | 外部サーバー | 外部DB |
| ポータビリティ | ○ 高い | △ | △ |
| リポジトリ独立性 | ○ | × 共有 | × 共有 |
| セットアップ | ファイル配置のみ | サーバー設定必要 | DB設定必要 |

**選定理由**:
- リポジトリごとに独立した記憶領域を持てる
- 複数ツール間でのポータビリティが高い
- ファイルベースでシンプル

## 参考リンク

- [yamadashy/repomix - agent-memory](https://github.com/yamadashy/repomix/tree/main/.claude/skills/agent-memory)
