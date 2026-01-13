# Anthropic公式: Slash Commands ベストプラクティス

Anthropic公式ドキュメント・GitHubから収集したSlash Commandsのベストプラクティスをまとめたリファレンス。

## 公式リソース一覧

| リソース | URL |
|---------|-----|
| Slash Commands 公式ドキュメント | https://code.claude.com/docs/en/slash-commands |
| Agent SDK Slash Commands | https://platform.claude.com/docs/en/agent-sdk/slash-commands |
| Claude Code Best Practices | https://www.anthropic.com/engineering/claude-code-best-practices |
| Plugins README | https://github.com/anthropics/claude-code/blob/main/plugins/README.md |
| Official Plugins | https://github.com/anthropics/claude-plugins-official |

---

## 1. 基本概念

### Slash Commandsとは

Slash Commandsは、頻繁に使用するプロンプトをMarkdownファイルとして保存し、`/`プレフィックスで呼び出せるようにする機能。

**特徴:**
- Markdownファイルで定義
- `$ARGUMENTS`で動的パラメータを受け取り可能
- Frontmatterでツール制限やモデル指定が可能
- Hooksと連携可能

### 保存場所（スコープ）

| スコープ | 保存先 | 用途 |
|---------|--------|------|
| **プロジェクト** | `.claude/commands/` | プロジェクト固有のコマンド（git管理推奨） |
| **個人** | `~/.claude/commands/` | 全プロジェクトで使用するコマンド |

---

## 2. ファイル構造

### 基本形式

```markdown
---
description: コマンドの説明
allowed-tools: Read, Grep, Glob
argument-hint: [parameter1] [parameter2]
model: claude-sonnet-4-5-20250929
---

コマンドの本文（プロンプト）
```

### Frontmatterオプション

| オプション | 説明 | 例 |
|------------|------|-----|
| `description` | コマンドの説明（オートコンプリートに表示） | `Run security vulnerability scan` |
| `allowed-tools` | 許可するツール（カンマ区切り） | `Read, Grep, Glob, Bash(git:*)` |
| `argument-hint` | 引数のヒント | `[issue-number] [priority]` |
| `model` | 使用するモデル | `claude-sonnet-4-5-20250929` |
| `hooks` | コマンド実行時のフック | （後述） |

---

## 3. 特殊構文

### 引数の受け取り

```markdown
# $ARGUMENTS - すべての引数を受け取る
Fix issue: $ARGUMENTS

# $1, $2, ... - 位置引数
Fix issue #$1 with priority $2
```

### シェルコマンドの埋め込み

`!` で囲むことで、コマンド実行時にシェルコマンドの出力を埋め込める:

```markdown
## Context
- Current status: !`git status`
- Current diff: !`git diff HEAD`
```

### ファイル参照

`@` プレフィックスでファイル内容を埋め込める:

```markdown
Review the following configuration files:
- Package config: @package.json
- TypeScript config: @tsconfig.json
```

---

## 4. ベストプラクティス

### 4.1 命名規則

**推奨:**
- 動詞で始める（`fix-`, `review-`, `generate-`）
- ハイフン区切り（`code-review`, `security-scan`）
- 明確で説明的な名前

```
.claude/commands/
├── fix-github-issue.md
├── code-review.md
├── security-scan.md
└── generate-tests.md
```

### 4.2 名前空間による整理

サブディレクトリで分類:

```
.claude/commands/
├── frontend/
│   ├── component.md      # /component
│   └── style-check.md    # /style-check
├── backend/
│   ├── api-test.md       # /api-test
│   └── db-migrate.md     # /db-migrate
└── review.md             # /review
```

### 4.3 ツール制限

セキュリティと意図の明確化のため、必要なツールのみを許可:

```markdown
---
allowed-tools: Read, Grep, Glob
---
```

Bashコマンドは細かく制限可能:

```markdown
---
allowed-tools: Bash(git add:*), Bash(git status:*), Bash(git commit:*)
---
```

### 4.4 明確なステップ構成

```markdown
---
description: Fix a GitHub issue
argument-hint: [issue-number]
---

## Task
Fix GitHub issue #$ARGUMENTS

## Steps
1. Use `gh issue view $ARGUMENTS` to get issue details
2. Analyze the problem described
3. Find relevant files in the codebase
4. Implement the fix
5. Write or update tests
6. Verify the fix works
```

### 4.5 コンテキストの提供

コマンド実行時に必要な情報を事前に収集:

```markdown
---
allowed-tools: Read, Grep, Glob, Bash(git diff:*)
description: Comprehensive code review
---

## Changed Files
!`git diff --name-only HEAD~1`

## Detailed Changes
!`git diff HEAD~1`

## Review Checklist

Review the above changes for:
1. Code quality and readability
2. Security vulnerabilities
3. Performance implications
4. Test coverage
5. Documentation completeness
```

---

## 5. Hooks連携

### コマンド固有のフック

コマンド実行中のみ有効なフックを定義:

```markdown
---
description: Create a new feature with quality gates
hooks:
  PreToolUse:
    - matcher: Edit
      command: echo "File being edited: $TOOL_INPUT" >> /tmp/edit-log.txt
  Stop:
    - command: echo "Feature command completed" | notify
---
```

### フックの種類

| フック | タイミング |
|--------|-----------|
| `PreToolUse` | ツール実行前 |
| `PostToolUse` | ツール実行後 |
| `Stop` | コマンド完了時 |

---

## 6. ワークフロー vs ツール

コマンドの複雑さに応じて使い分ける:

### ワークフロー（複雑なタスク）

- 複数のエージェントが連携
- 30-90秒の実行時間
- 探索的な問題解決

```markdown
---
description: End-to-end feature development
allowed-tools: Read, Grep, Glob, Edit, Write, Bash
---

## Phase 1: Analysis
Analyze the codebase to understand architecture...

## Phase 2: Design
Create implementation plan...

## Phase 3: Implementation
Write the code...

## Phase 4: Testing
Write and run tests...

## Phase 5: Review
Self-review the changes...
```

### ツール（単一目的）

- 5-30秒の実行時間
- 明確な単一タスク

```markdown
---
description: Run tests with pattern
argument-hint: [test-pattern]
allowed-tools: Bash
---

Run tests matching: $ARGUMENTS
```

---

## 7. 実践例

### 7.1 GitHub Issue修正

```markdown
---
description: Fix a GitHub issue
argument-hint: [issue-number]
allowed-tools: Read, Grep, Glob, Edit, Write, Bash(gh:*), Bash(git:*)
---

## Context
- Issue: !`gh issue view $ARGUMENTS`

## Task
Fix issue #$ARGUMENTS following these steps:

1. Analyze the issue description and requirements
2. Search the codebase for relevant files
3. Implement the necessary changes
4. Write or update tests
5. Verify the fix works
6. Create a descriptive commit message
```

### 7.2 コードレビュー

```markdown
---
description: Comprehensive PR code review
allowed-tools: Read, Grep, Glob, Bash(git diff:*)
---

## Changes
!`git diff --name-only HEAD~1`

## Diff
!`git diff HEAD~1`

## Review

Analyze the changes above for:
1. **Correctness**: Does the code do what it's supposed to?
2. **Security**: Any potential vulnerabilities?
3. **Performance**: Any performance concerns?
4. **Readability**: Is the code clear and maintainable?
5. **Tests**: Are changes properly tested?

Provide specific, actionable feedback organized by priority.
```

### 7.3 セキュリティスキャン

```markdown
---
description: Run security vulnerability scan
allowed-tools: Read, Grep, Glob
model: claude-sonnet-4-5-20250929
---

Analyze the codebase for security vulnerabilities:

1. **SQL Injection**: Check database queries
2. **XSS**: Check user input handling in frontend
3. **Exposed Credentials**: Search for hardcoded secrets
4. **Insecure Dependencies**: Check package versions
5. **CSRF**: Check form handling
6. **Authentication Issues**: Review auth implementation

Report findings with severity (Critical/High/Medium/Low) and remediation steps.
```

### 7.4 テスト生成

```markdown
---
description: Generate tests for a file
argument-hint: [file-path]
allowed-tools: Read, Grep, Glob, Write
---

## Target File
@$ARGUMENTS

## Task
Generate comprehensive tests for the above file:

1. Identify the testing framework used in this project
2. Analyze all exported functions/classes
3. Write tests covering:
   - Happy path scenarios
   - Edge cases
   - Error handling
4. Follow existing test patterns in the codebase
```

---

## 8. Skills vs Slash Commands

両者は似た機能を持つが、意図が異なる:

| 特徴 | Slash Commands | Skills |
|------|----------------|--------|
| **主な呼び出し元** | ユーザー | Claude自身 |
| **保存先** | `commands/` | `skills/` |
| **呼び出し方** | `/command-name` | `/skill-name` または自動 |
| **用途** | プロンプトテンプレート | 専門知識・能力 |

> **注意**: 現在の実装では両者はほぼ同じ動作をするが、将来的に分化する可能性がある。

---

## 9. トラブルシューティング

### コマンドが見つからない

1. ファイル拡張子が `.md` か確認
2. 正しいディレクトリに配置されているか確認
3. ファイル名にスペースや特殊文字がないか確認

### 引数が展開されない

- `$ARGUMENTS` または `$1`, `$2` の記法を確認
- Frontmatterの `argument-hint` でヒントを提供

### Hookが動作しない

- Hookの構文（YAML形式）を確認
- `command` フィールドが正しいか確認

---

## 10. 公式プラグインの例

| プラグイン | コマンド | 用途 |
|-----------|---------|------|
| agent-sdk-dev | `/new-sdk-app` | Agent SDKプロジェクトの作成 |
| code-review | `/code-review` | 自動PRレビュー |
| commit-commands | `/commit`, `/commit-push-pr` | Git操作自動化 |
| feature-dev | `/feature-dev` | 機能開発ワークフロー |
| hookify | `/hookify` | カスタムフック管理 |

参照: https://github.com/anthropics/claude-plugins-official

---

## まとめ: 設計原則

1. **明確な目的**: 1コマンド = 1タスク
2. **適切なスコープ**: ツール制限で安全性を確保
3. **十分なコンテキスト**: シェルコマンド埋め込みで情報を事前収集
4. **段階的な指示**: ステップバイステップで明確に
5. **再利用性**: 汎用的なコマンドは `~/.claude/commands/` へ

---

*最終更新: 2026-01-13*
*情報源: Anthropic公式ドキュメント・GitHub*
