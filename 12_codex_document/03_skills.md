---
name: skills
description: Codex CLI Agent Skillsの作成・管理・活用ガイド
---

# Agent Skills 完全ガイド

Agent Skillsは、AIエージェントが特定のタスクを一貫して実行できるようにする再利用可能なパッケージです。

## 目次

1. [概要](#概要)
2. [Skillの構造](#skillの構造)
3. [Skillの作成](#skillの作成)
4. [Skillの呼び出し](#skillの呼び出し)
5. [Progressive Disclosure](#progressive-disclosure)
6. [組み込みスキル](#組み込みスキル)
7. [Skillのインストール](#skillのインストール)
8. [ベストプラクティス](#ベストプラクティス)
9. [Claude Codeとの比較](#claude-codeとの比較)
10. [実践例](#実践例)

---

## 概要

### Agent Skillsとは

- 指示、スクリプト、リソースをパッケージ化した再利用可能なバンドル
- `$skill-name` で明示的に呼び出し、または自動検出
- [Agent Skills Specification](https://agentskills.io/specification) に準拠
- CLI とIDE拡張の両方で利用可能

### 特徴

| 特徴 | 説明 |
|------|------|
| **Progressive Disclosure** | 起動時はname/descriptionのみ読み込み |
| **明示的/暗黙的呼び出し** | `$name` または description マッチで発動 |
| **階層的保存** | リポジトリ/ユーザー/システムレベル |
| **スクリプト対応** | Python、シェルスクリプト等を同梱可能 |

---

## Skillの構造

### ディレクトリ構成

```
my-skill/
├── SKILL.md           # 必須: メタデータと指示
├── scripts/           # オプション: 実行スクリプト
│   ├── run.py
│   └── validate.sh
├── references/        # オプション: 参照ドキュメント
│   ├── api-spec.md
│   └── examples.md
└── assets/            # オプション: その他リソース
    └── template.json
```

### SKILL.md フォーマット

```markdown
---
name: my-skill
description: スキルの説明。トリガーキーワードを含める。最大500文字。
---

# スキルのタイトル

## 目的

このスキルは〇〇を行います。

## 使用方法

1. ステップ1
2. ステップ2

## 参照

詳細は [references/api-spec.md](references/api-spec.md) を参照。
```

### メタデータフィールド

| フィールド | 必須 | 制限 | 説明 |
|-----------|------|------|------|
| `name` | ✓ | 最大100文字、1行 | スキルの識別子 |
| `description` | ✓ | 最大500文字、1行 | 自動検出用のトリガー説明 |

**注意**: その他のYAMLキーは無視されます。

---

## Skillの作成

### 方法1: $skill-creator を使用（推奨）

```
# Codex CLI内で
$skill-creator Create a skill that drafts conventional commit messages
```

対話形式で以下を聞かれます:
1. スキルの機能
2. 自動トリガーの条件
3. 実行タイプ（instruction-only / script-backed）

### 方法2: 手動作成

```bash
# ユーザーレベル
mkdir -p ~/.codex/skills/my-skill

# またはプロジェクトレベル
mkdir -p .codex/skills/my-skill

# SKILL.md作成
cat > ~/.codex/skills/my-skill/SKILL.md << 'EOF'
---
name: my-skill
description: When user asks to do X, use this skill to accomplish it efficiently.
---

# My Skill

## Instructions

1. First, analyze the request
2. Then, execute the following steps
3. Finally, verify the result

## Important Notes

- Always check for errors
- Log progress to the user
EOF
```

### 保存場所と優先順位

```
優先度: 高 → 低

1. $CWD/.codex/skills/          # 現在のディレクトリ
2. $CWD/../.codex/skills/       # 親ディレクトリ
3. $REPO_ROOT/.codex/skills/    # リポジトリルート
4. ~/.codex/skills/             # ユーザーレベル（CODEX_HOME）
5. /etc/codex/skills/           # システム/管理者レベル
6. Bundled with Codex           # 組み込みスキル
```

---

## Skillの呼び出し

### 明示的呼び出し

```
# $記号でスキル名を指定
$my-skill please analyze this code

# /skills コマンドでリスト表示・選択
/skills
```

### 暗黙的呼び出し（自動検出）

Codexはタスクのdescriptionとスキルのdescriptionをマッチング:

```markdown
# SKILL.md
---
name: commit-message
description: When drafting commit messages, conventional commits, or git commit.
---
```

ユーザーが「コミットメッセージを作って」と言うと自動発動。

### 発動の確認

```
# セッション中にステータス確認
/status

# 使用中のスキルを確認
Which skills are you currently using?
```

---

## Progressive Disclosure

### 仕組み

```
起動時:
┌─────────────────────────────────────┐
│ 読み込み: name + description のみ   │
│ (各スキル約600文字以下)             │
└─────────────────────────────────────┘
           ↓
スキル発動時:
┌─────────────────────────────────────┐
│ 読み込み: SKILL.md 全体             │
│ + 参照ファイル（必要に応じて）      │
└─────────────────────────────────────┘
```

### メリット

- **コンテキスト効率**: 使わないスキルの詳細は読み込まない
- **高速起動**: 最小限の情報で開始
- **スケーラビリティ**: 多数のスキルを登録可能

### 参照ファイルの活用

```markdown
# SKILL.md
---
name: api-integration
description: When integrating with external APIs or making HTTP requests.
---

# API Integration Skill

基本的な手順はこのファイルに記載。

詳細なAPI仕様は [references/api-spec.md](references/api-spec.md) を参照。
エラーハンドリングは [references/error-codes.md](references/error-codes.md) を参照。
```

---

## 組み込みスキル

### システムスキル

| スキル | 説明 |
|--------|------|
| `$skill-creator` | 新しいスキルを対話的に作成 |
| `$skill-installer` | GitHubからスキルをインストール |
| `$create-plan` | 実装計画を作成（experimental） |

### $skill-creator の使用例

```
$skill-creator

# 対話開始:
# 1. What should this skill do?
#    > Create conventional commit messages from staged changes
#
# 2. When should Codex trigger this automatically?
#    > When user mentions commit, git commit, or commit message
#
# 3. Run type?
#    > instruction-only (default)
#
# → SKILL.md が生成される
```

### $skill-installer の使用例

```
# キュレーテッドスキルをインストール（名前のみ）
$skill-installer gh-address-comments

# 実験的スキルをインストール（フルパス指定）
$skill-installer install the create-plan skill from the .experimental folder

# GitHubリポジトリから直接
$skill-installer install https://github.com/openai/skills/tree/main/skills/.curated/my-skill
```

---

## Skillのインストール

### OpenAI公式スキルカタログ

[github.com/openai/skills](https://github.com/openai/skills)

```
skills/
├── .system/        # 自動的に含まれる
├── .curated/       # コミュニティ検証済み
└── .experimental/  # 早期段階
```

### インストール手順

```bash
# 1. $skill-installer を使用
$skill-installer <skill-name>

# 2. 手動ダウンロード
git clone https://github.com/openai/skills
cp -r skills/.curated/my-skill ~/.codex/skills/

# 3. Codexを再起動
# （新しいスキルを読み込むため）
```

### インストール確認

```
# Codex CLI内で
/skills

# または
$skill-installer list installed skills
```

---

## ベストプラクティス

### 1. 明確なトリガーを設定

```markdown
# Good ✓
description: When creating pull requests, PR descriptions, or merge requests.

# Bad ✗
description: Helps with git operations.
```

### 2. スキルは狭く・モジュラーに

```
# Good ✓
1つのスキル = 1つの明確なタスク

# Bad ✗
1つのスキルで複数の無関係なタスクを処理
```

### 3. instruction-only をデフォルトに

```markdown
# スクリプトが必要なケース:
- 決定論的な処理が必要
- 外部データの取得が必要
- 複雑な計算が必要

# それ以外は指示のみで十分
```

### 4. コンテキストを仮定しない

```markdown
# Good ✓
## Prerequisites
- Node.js 18+ installed
- npm or pnpm available

## Steps
1. Check if package.json exists
2. If not, run `npm init -y`
3. ...

# Bad ✗
Run npm install.
```

### 5. 命令形で記述

```markdown
# Good ✓
1. Read the file
2. Extract the function names
3. Generate tests for each function

# Bad ✗
1. The file should be read
2. Function names will be extracted
```

### 6. テストでトリガーを確認

```
# 期待するプロンプトでスキルが発動するか確認
Write a commit message for the staged changes

# → commit-message スキルが発動するか？
```

---

## Claude Codeとの比較

### 基本構造の比較

| 項目 | Claude Code | Codex |
|------|-------------|-------|
| **ファイル名** | `SKILL.md` | `SKILL.md` |
| **保存場所** | `.claude/skills/*/` | `.codex/skills/*/` または `~/.codex/skills/*/` |
| **メタデータ** | `name`, `description` | `name`, `description` |
| **オプション** | `allowed-tools`, `model` | なし（YAMLキーは無視） |

### 機能比較

| 機能 | Claude Code | Codex |
|------|-------------|-------|
| **明示的呼び出し** | なし（自動のみ） | `$skill-name` |
| **暗黙的呼び出し** | descriptionマッチ | descriptionマッチ |
| **ユーザー確認** | あり | なし |
| **スクリプト同梱** | あり | あり |
| **Progressive Disclosure** | あり | あり |
| **組み込みスキル作成ツール** | なし | `$skill-creator` |
| **インストーラー** | なし | `$skill-installer` |
| **スキルカタログ** | なし | github.com/openai/skills |

### 移行ガイド

Claude Code → Codex:

```bash
# ディレクトリ構造は同じ
cp -r .claude/skills/my-skill .codex/skills/my-skill

# SKILL.md のメタデータ確認
# allowed-tools, model は Codex では無視される
```

Codex → Claude Code:

```bash
# ディレクトリ構造は同じ
cp -r .codex/skills/my-skill .claude/skills/my-skill

# $skill-name 形式の呼び出しは動作しない
# descriptionによる自動検出のみ
```

---

## 実践例

### コードレビュースキル

```
.codex/skills/code-review/
├── SKILL.md
└── references/
    ├── security-checklist.md
    └── performance-patterns.md
```

```markdown
# .codex/skills/code-review/SKILL.md
---
name: code-review
description: When reviewing code, PR review, code quality check, or security audit.
---

# Code Review Skill

## Review Process

1. **Security Check**
   - SQL injection vulnerabilities
   - XSS vulnerabilities
   - Authentication/authorization issues
   - Sensitive data exposure
   See [security-checklist.md](references/security-checklist.md)

2. **Performance Check**
   - N+1 queries
   - Unnecessary re-renders
   - Memory leaks
   See [performance-patterns.md](references/performance-patterns.md)

3. **Code Quality**
   - Naming conventions
   - Function size
   - Error handling
   - Test coverage

## Output Format

```markdown
## Review Summary

### Security: [PASS/FAIL]
- [ ] Finding 1
- [ ] Finding 2

### Performance: [PASS/FAIL]
- [ ] Finding 1

### Code Quality: [PASS/FAIL]
- [ ] Finding 1
```
```

### コミットメッセージスキル

```markdown
# ~/.codex/skills/commit-message/SKILL.md
---
name: commit-message
description: When creating commit messages, git commit, or conventional commits.
---

# Conventional Commit Message Skill

## Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

## Types

- feat: New feature
- fix: Bug fix
- docs: Documentation
- style: Formatting
- refactor: Code restructuring
- test: Adding tests
- chore: Maintenance

## Process

1. Analyze staged changes with `git diff --staged`
2. Identify the primary change type
3. Determine affected scope (module/component)
4. Write concise subject (50 chars max)
5. Add body if needed (72 chars per line)

## Examples

```
feat(auth): add OAuth2 login support

- Implement Google OAuth provider
- Add token refresh mechanism
- Update user model with OAuth fields

Closes #123
```
```

### APIインテグレーションスキル

```
~/.codex/skills/api-integration/
├── SKILL.md
├── scripts/
│   └── test-endpoint.py
└── references/
    └── common-patterns.md
```

```markdown
# SKILL.md
---
name: api-integration
description: When integrating external APIs, REST endpoints, or HTTP requests.
---

# API Integration Skill

## Process

1. **Analyze API Documentation**
   - Base URL
   - Authentication method
   - Rate limits
   - Error responses

2. **Implement Client**
   - Use appropriate HTTP library
   - Implement retry logic
   - Handle rate limiting
   - Log requests/responses

3. **Test Integration**
   Run `scripts/test-endpoint.py` to verify connectivity.

4. **Error Handling**
   See [common-patterns.md](references/common-patterns.md) for patterns.

## Security Notes

- Never hardcode API keys
- Use environment variables
- Validate all responses
- Sanitize logged data
```

---

## トラブルシューティング

### スキルが表示されない

```bash
# 1. ファイル名確認（SKILL.md のみ認識）
ls -la ~/.codex/skills/my-skill/

# 2. YAMLフォーマット確認
head -10 ~/.codex/skills/my-skill/SKILL.md

# 3. Codex再起動
# スキルは起動時にのみ読み込まれる
```

### 自動検出が動作しない

```markdown
# description を改善
# Before
description: Helps with code.

# After
description: When reviewing code quality, finding bugs, or checking security vulnerabilities.
```

### スクリプトが実行されない

```bash
# 実行権限確認
chmod +x ~/.codex/skills/my-skill/scripts/run.sh

# パス確認
# SKILL.md からの相対パスで参照
```

---

## 関連ドキュメント

- [01_overview.md](01_overview.md) - 全機能の概要
- [04_custom-prompts.md](04_custom-prompts.md) - Custom Prompts
- [Agent Skills Specification](https://agentskills.io/specification) - 公式仕様
- [OpenAI Skills Catalog](https://github.com/openai/skills) - 公式スキルカタログ
- [Codex Skills Documentation](https://developers.openai.com/codex/skills/) - 公式ドキュメント
