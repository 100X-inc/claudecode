---
name: custom-prompts
description: Codex CLI Custom Promptsの作成と活用ガイド
---

# Custom Prompts 完全ガイド

Custom Promptsは、頻繁に使用するプロンプトをテンプレート化し、`/prompts:name` で呼び出せるようにする機能です。

## 目次

1. [概要](#概要)
2. [ファイル構造](#ファイル構造)
3. [メタデータ](#メタデータ)
4. [引数の使用](#引数の使用)
5. [作成と管理](#作成と管理)
6. [使用例](#使用例)
7. [Skills との違い](#skills-との違い)
8. [Claude Codeとの比較](#claude-codeとの比較)
9. [実践例](#実践例)

---

## 概要

### Custom Promptsとは

- ユーザーが定義するプロンプトテンプレート
- `/prompts:name` で明示的に呼び出し
- 引数のサポート（`$1`, `$ARGUMENTS`, 名前付き）
- ローカル保存のみ（リポジトリ共有不可）

### 特徴

| 特徴 | 説明 |
|------|------|
| **明示的呼び出し** | `/prompts:name` で実行 |
| **引数サポート** | 位置引数・名前付き引数 |
| **ローカル専用** | `~/.codex/prompts/` に保存 |
| **即座に利用可能** | Codex再起動で読み込み |

---

## ファイル構造

### 保存場所

```
~/.codex/prompts/          # CODEX_HOME/prompts
├── draftpr.md             # /prompts:draftpr
├── review-changes.md      # /prompts:review-changes
├── generate-tests.md      # /prompts:generate-tests
└── explain-code.md        # /prompts:explain-code
```

**注意**:
- トップレベルの `.md` ファイルのみスキャン
- サブディレクトリは無視される
- ファイル名（`.md` を除く）がコマンド名になる

### 基本フォーマット

```markdown
---
description: プロンプトの説明（スラッシュコマンドメニューに表示）
argument-hint: [PARAM="<説明>"] [ANOTHER=<value>]
---

プロンプトの本文をここに記述。
引数は $PARAM や $1 で参照。
```

---

## メタデータ

### 利用可能なフィールド

| フィールド | 必須 | 説明 |
|-----------|------|------|
| `description` | 推奨 | スラッシュコマンドメニューに表示される説明 |
| `argument-hint` | オプション | 期待するパラメータの形式 |

### メタデータ例

```markdown
---
description: Create a pull request description from staged changes
argument-hint: [TITLE="<PR title>"] [TYPE=feat|fix|docs]
---
```

---

## 引数の使用

### 位置引数 ($1 - $9)

スペース区切りの引数を順番に展開:

```markdown
---
description: Generate tests for a specific file
argument-hint: <filepath> [framework]
---

Generate unit tests for $1 using $2 framework.
If no framework specified, detect from project config.
```

使用:
```
/prompts:generate-tests src/utils.ts jest
```

展開結果:
```
Generate unit tests for src/utils.ts using jest framework.
If no framework specified, detect from project config.
```

### 名前付き引数

`KEY=value` 形式で指定:

```markdown
---
description: Review code with specific focus
argument-hint: FILE="<path>" FOCUS="<area>"
---

Review the code in $FILE with focus on $FOCUS.
Provide actionable suggestions.
```

使用:
```
/prompts:review FILE="src/auth.ts" FOCUS="security"
```

### $ARGUMENTS（全引数）

すべての引数をそのまま展開:

```markdown
---
description: Explain code in detail
---

Explain the following code in detail:

$ARGUMENTS
```

使用:
```
/prompts:explain-code function calculateTotal(items) { return items.reduce((sum, item) => sum + item.price, 0); }
```

### 特殊文字

| 記法 | 展開結果 |
|------|---------|
| `$1` | 1番目の引数 |
| `$2` - `$9` | 2-9番目の引数 |
| `$ARGUMENTS` | 全引数 |
| `$NAME` | 名前付き引数 `NAME=value` |
| `$$` | リテラルの `$` |

### スペースを含む値

クォートで囲む:

```
/prompts:draftpr TITLE="Add user authentication" SCOPE="auth module"
```

---

## 作成と管理

### プロンプトの作成

```bash
# ディレクトリ作成（初回のみ）
mkdir -p ~/.codex/prompts

# プロンプトファイル作成
cat > ~/.codex/prompts/draftpr.md << 'EOF'
---
description: Draft a pull request description
argument-hint: [TITLE="<title>"] [TYPE=feat|fix|docs|refactor]
---

Create a pull request description with:

Title: $TITLE
Type: $TYPE

Based on the current staged changes, write:
1. Summary of changes
2. Motivation
3. Testing done
4. Checklist

Use conventional PR format.
EOF
```

### プロンプトの編集

```bash
# 直接編集
code ~/.codex/prompts/draftpr.md

# または Codex 内で Ctrl+G でエディタ起動
```

### プロンプトの削除

```bash
rm ~/.codex/prompts/draftpr.md
```

### 変更の反映

**Codexを再起動**して新しいプロンプトを読み込む:

```bash
# Codex を終了して再起動
exit
codex
```

---

## 使用例

### プロンプト一覧の表示

```
# Codex CLI 内で
/prompts:

# または
/
# → prompts: を選択
```

### プロンプトの実行

```
# 基本
/prompts:draftpr

# 引数付き
/prompts:draftpr TITLE="Add OAuth support" TYPE=feat

# 位置引数
/prompts:generate-tests src/utils.ts jest
```

---

## Skills との違い

### 比較表

| 側面 | Custom Prompts | Skills |
|------|----------------|--------|
| **呼び出し** | `/prompts:name` | `$skill-name` or 自動 |
| **引数** | `$1`, `$ARGUMENTS`, 名前付き | なし |
| **保存場所** | `~/.codex/prompts/*.md` | `~/.codex/skills/*/SKILL.md` |
| **共有** | ローカルのみ | リポジトリ共有可能 |
| **自動検出** | 不可 | 可能（description マッチ） |
| **複数ファイル** | 不可 | 可能（scripts/, references/） |
| **Progressive Disclosure** | なし | あり |

### 使い分け

**Custom Prompts を選ぶ場合:**
- 引数を受け取りたい
- 単純なテンプレートで十分
- 個人用で共有不要
- 即座に利用したい

**Skills を選ぶ場合:**
- 自動検出で発動させたい
- 複数ファイル（参照、スクリプト）が必要
- チームで共有したい
- 複雑なワークフロー

---

## Claude Codeとの比較

### 対応機能

| Claude Code | Codex |
|-------------|-------|
| Slash Commands (`.claude/commands/*.md`) | Custom Prompts (`~/.codex/prompts/*.md`) |

### フォーマット比較

**Claude Code:**
```markdown
---
description: コマンドの説明
argument-hint: [arg1] [arg2]
allowed-tools: Read, Edit
model: sonnet
---

プロンプト本文
$ARGUMENTS
```

**Codex:**
```markdown
---
description: コマンドの説明
argument-hint: [ARG1="<desc>"] [ARG2=<value>]
---

プロンプト本文
$ARGUMENTS
```

### 機能比較

| 機能 | Claude Code | Codex |
|------|-------------|-------|
| **引数展開** | `$ARGUMENTS`, `$1`, `$2`... | `$ARGUMENTS`, `$1`-`$9`, 名前付き |
| **動的コンテンツ** | バッククォート実行 | なし |
| **ファイル参照** | `@path/to/file` | なし |
| **ツール制限** | `allowed-tools` | なし |
| **モデル指定** | `model` | なし |
| **プロジェクト配置** | 可能 (`.claude/commands/`) | 不可（ユーザーのみ） |
| **サブディレクトリ** | 可能（ネームスペース） | 不可 |

### 移行ガイド

Claude Code → Codex:

```bash
# ファイルコピー
cp .claude/commands/review.md ~/.codex/prompts/review.md

# メタデータ調整（allowed-tools, model を削除）
# 動的コンテンツ（バッククォート）は手動で置換
```

Codex → Claude Code:

```bash
# ファイルコピー
cp ~/.codex/prompts/review.md .claude/commands/review.md

# 名前付き引数は $ARGUMENTS に変更が必要な場合あり
```

---

## 実践例

### PRドラフト作成

```markdown
# ~/.codex/prompts/draftpr.md
---
description: Create a comprehensive PR description
argument-hint: [TITLE="<title>"] [ISSUE=<number>]
---

Create a pull request description based on the staged changes.

Title: $TITLE
Related Issue: $ISSUE

Include:
1. **Summary**: Brief overview of changes
2. **Motivation**: Why these changes are needed
3. **Changes Made**: Bullet list of key modifications
4. **Testing**: How the changes were tested
5. **Checklist**:
   - [ ] Tests added/updated
   - [ ] Documentation updated
   - [ ] No breaking changes (or documented)

Use the repository's PR template style if available.
```

### コードレビュー

```markdown
# ~/.codex/prompts/review-changes.md
---
description: Review staged changes with specific focus
argument-hint: [FOCUS=security|performance|style|all]
---

Review the current staged changes (git diff --staged) with focus on: $FOCUS

Provide:
1. **Critical Issues**: Must fix before merge
2. **Suggestions**: Nice to have improvements
3. **Positive Notes**: Good patterns observed

Format findings as actionable items.
```

### テスト生成

```markdown
# ~/.codex/prompts/generate-tests.md
---
description: Generate unit tests for a file
argument-hint: <filepath> [FRAMEWORK=jest|vitest|mocha]
---

Generate comprehensive unit tests for: $1

Testing framework: $FRAMEWORK (or detect from project)

Requirements:
1. Cover all exported functions
2. Include edge cases
3. Mock external dependencies
4. Follow AAA pattern (Arrange-Act-Assert)
5. Use descriptive test names

Output the test file content.
```

### コミットメッセージ

```markdown
# ~/.codex/prompts/commit.md
---
description: Generate conventional commit message
argument-hint: [TYPE=feat|fix|docs|style|refactor|test|chore]
---

Generate a conventional commit message for staged changes.

Type: $TYPE

Format:
```
<type>(<scope>): <subject>

<body>
```

Rules:
- Subject: max 50 chars, imperative mood
- Body: wrap at 72 chars
- Reference issues if applicable
```

### コード説明

```markdown
# ~/.codex/prompts/explain.md
---
description: Explain code in detail
argument-hint: [LEVEL=beginner|intermediate|advanced]
---

Explain the following code at $LEVEL level:

$ARGUMENTS

Include:
1. Purpose of the code
2. How it works step by step
3. Key concepts used
4. Potential improvements
```

---

## トラブルシューティング

### プロンプトが表示されない

```bash
# 1. ファイル存在確認
ls -la ~/.codex/prompts/

# 2. 拡張子確認（.md のみ）
# my-prompt.txt は認識されない

# 3. Codex 再起動
# プロンプトは起動時に読み込まれる
```

### 引数が展開されない

```markdown
# 名前付き引数は大文字で統一
$TITLE  ✓
$title  ✗

# スペースを含む値はクォート
TITLE="My PR Title"  ✓
TITLE=My PR Title    ✗
```

### 特殊文字の問題

```markdown
# リテラルの $ を使用
This costs $$100  →  This costs $100
```

---

## 関連ドキュメント

- [01_overview.md](01_overview.md) - 全機能の概要
- [03_skills.md](03_skills.md) - Agent Skills
- [05_slash-commands.md](05_slash-commands.md) - 組み込みSlash Commands
- [Custom Prompts Documentation](https://developers.openai.com/codex/custom-prompts/) - 公式ドキュメント
