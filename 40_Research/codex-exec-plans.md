# OpenAI Codex ExecPlans (PLANS.md) 調査

**Source**: https://cookbook.openai.com/articles/codex_exec_plans
**Author**: Aaron Friel (OpenAI)
**Date**: Oct 7, 2025

## 概要

Codex CLI と `gpt-5.2-codex` モデルを使った**長時間タスク（7時間以上）**を実現するための設計ドキュメント形式。

### 目的
- 複雑なタスクの研究・設計・実装を単一プロンプトから実行
- 実装前にCodexのアプローチを検証可能
- "living document"（生きたドキュメント）として進捗に応じて更新

---

## 使い方

### 1. AGENTS.md に ExecPlan の使用ルールを追加

```markdown
# ExecPlans
When writing complex features or significant refactors, use an ExecPlan
(as described in .agent/PLANS.md) from design to implementation.
```

### 2. PLANS.md テンプレートをリポジトリに配置

### 3. タスク実行時に "do the plan" と指示
→ エージェントが計画に従って methodically に実行（1-3イテレーションで完了）

---

## ExecPlan の必須要件 (Non-negotiable)

| 要件 | 説明 |
|------|------|
| **完全自己完結** | 現在の形式で必要な知識をすべて含む |
| **Living Document** | 進捗に応じて更新が必須 |
| **初心者でも実装可能** | リポジトリの事前知識なしで end-to-end 実装できる |
| **動作する成果物** | 定義を満たすだけでなく、demonstrably working な振る舞いを生成 |
| **専門用語の定義** | 平易な言葉で定義するか、使用しない |

---

## フォーマットルール

- 単一の fenced code block (`md`) として記述
- `.md` ファイルに直接書く場合はバッククォート不要
- **平文で書く** - リストより文章を優先
- チェックリスト・表・長い列挙は簡潔に必要な場合のみ

---

## ExecPlan のスケルトン（テンプレート）

```markdown
# <Short, action-oriented description>

This ExecPlan is a living document. The sections `Progress`, `Surprises & Discoveries`,
`Decision Log`, and `Outcomes & Retrospective` are updated as work proceeds.

## Purpose / Big Picture
Explain what someone gains after this change and how they can see it working.

## Progress
- [x] (2025-10-01 13:00Z) Example completed step.
- [ ] Example incomplete step.
- [ ] Example partially completed step (completed: X; remaining: Y).

Use timestamps to measure rates of progress.

## Surprises & Discoveries
Document unexpected behaviors, bugs, optimizations, or insights discovered.
- Observation: ...
  Evidence: ...

## Decision Log
Record every decision made while working on the plan:
- Decision: ...
  Rationale: ...
  Date/Author: ...

## Outcomes & Retrospective
Summarize outcomes, gaps, and lessons learned at major milestones or completion.

## Context and Orientation
Describe the current state relevant to this task as if the reader knows nothing.
Name the key files and modules.

## Plan of Work
Describe, in prose, the sequence of edits and additions.
For each edit, name the file and location (function, module).

## Concrete Steps
State the exact commands to run and where to run them (working directory).
When a command generates output, show expected output.

## Validation and Acceptance
Describe how to start or exercise the system and what to observe.
Phrase acceptance as behavior, with specific inputs/outputs.

## Idempotence and Recovery
If steps can be repeated safely, say so.
If a step is risky, provide a safe retry or rollback path.

## Artifacts and Notes
Include the most important transcripts, diffs, or snippets as indented examples.

## Interfaces and Dependencies
Be prescriptive. Name the libraries, modules, and services to use and why.
Specify the types, traits/interfaces.
```

---

## ガイドライン

| ガイドライン | 詳細 |
|-------------|------|
| **自己完結・平易な言語** | 専門用語を導入する場合は定義する |
| **観察可能な成果で計画を固定** | 実装後にユーザーができること、実行コマンド、期待される観察結果を明記 |
| **リポジトリコンテキストを明示** | ファイル名はリポジトリルートからの完全相対パス |
| **冪等性と安全性** | ステップは複数回実行してもダメージやドリフトを起こさない |
| **検証は必須** | テスト実行、システム起動、動作観察の指示を含める |

---

## Living Plans と設計決定

- 重要な設計決定を行ったら、決定と根拠の両方を計画に記録
- `Progress`, `Surprises & Discoveries`, `Decision Log` を常に維持
- 実装途中で方針変更する場合は `Decision Log` に理由を記録
- メジャータスク完了時は `Outcomes & Retrospective` を更新

---

## Claude Code での適用可能性

### Progressive Disclosure を適用

CLAUDE.md は短く保つべき（60-300行推奨）。詳細指示は別ファイルに分離。

### 違い・注意点

| Codex | Claude Code |
|-------|-------------|
| `codex exec` で非対話実行 | 対話的セッションが基本 |
| 7時間連続稼働可能 | セッション制限あり |
| AGENTS.md で指示 | CLAUDE.md で指示 |

### 置いただけで動作するか？

**No** - 最小限のポインタが必要:

**CLAUDE.md に追加（2-3行のみ）**:
```markdown
## 大規模タスク
3ファイル以上の変更時は `doc/plans/PLAN-{yyyymmdd_hhmm}-{feature}.md` を作成。
テンプレート: [doc/plans/PLANS-template.md](doc/plans/PLANS-template.md)
```

詳細な使い方はテンプレートファイル自体に記載。Claudeは必要時に読みに行く。

### 代替: Skill として設定

```
.claude/skills/exec-plans/
├── SKILL.md              # 発動条件と基本指示
└── PLANS-template.md     # テンプレート
```

---

## 参考リンク

- [OpenAI Cookbook - Using PLANS.md](https://cookbook.openai.com/articles/codex_exec_plans)
- [GitHub Source](https://github.com/openai/openai-cookbook/blob/main/articles/codex_exec_plans.md)
- [Codex CLI Features](https://developers.openai.com/codex/cli/features/)
- [AGENTS.md Guide](https://developers.openai.com/codex/guides/agents-md/)
