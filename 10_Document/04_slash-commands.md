---
name: slash-commands
description: Slash Commandsの作成方法と使い方
---

# Claude Code Slash Commands 完全ガイド

## 目次

1. [Slash Commandsとは](#1-slash-commandsとは)
2. [コマンドファイルの構造・形式](#2-コマンドファイルの構造形式)
3. [保存場所（スコープ）](#3-保存場所スコープ)
4. [引数の受け取り方](#4-引数の受け取り方)
5. [組み込みコマンドとカスタムコマンドの違い](#5-組み込みコマンドとカスタムコマンドの違い)
6. [具体的なサンプル](#6-具体的なサンプル)
7. [ベストプラクティス](#7-ベストプラクティス)
8. [Skills vs Slash Commands](#8-skills-vs-slash-commands)

---

## 1. Slash Commandsとは

**Slash Commands（スラッシュコマンド）** は、Claude Codeで頻繁に使用するプロンプトをカスタマイズ可能なコマンドとして定義できる機能です。

### 主な特徴

| 特徴 | 説明 |
|------|------|
| **プロンプトテンプレート化** | よく使うプロンプトをコマンド化 |
| **引数対応** | ユーザー入力を動的にコマンドに反映 |
| **チーム共有** | プロジェクトに含めてチーム全体で利用可能 |
| **自動補完** | `/help`コマンドでリスト化 |
| **スコープ管理** | プロジェクト固有または個人用で分離 |

---

## 2. コマンドファイルの構造・形式

### ファイル形式

カスタムSlash Commandは**Markdownファイル（.md）** で定義します。

### 基本構造

```markdown
---
description: コマンドの説明（必須）
argument-hint: [引数ヒント]
allowed-tools: Bash(git:*), Bash(npm:*)
model: claude-opus-4-5-20251101
disable-model-invocation: false
---

# コマンドのタイトル

ここにClaudeに対する指示を記述します。
```

### Frontmatter（メタデータ）の詳細

| フィールド | 必須 | 説明 | デフォルト |
|----------|------|------|----------|
| `description` | ○ | コマンドの説明（`/help`で表示） | ファイルの最初の行 |
| `argument-hint` | × | 引数のヒント | なし |
| `allowed-tools` | × | 使用可能なツール | セッション設定を継承 |
| `model` | × | 特定のモデルを指定 | セッション設定を継承 |
| `disable-model-invocation` | × | Skillツールからの自動実行を禁止 | false |

### Frontmatter例

```markdown
---
description: セキュリティ脆弱性をレビュー
argument-hint: [ファイルパス] [深さ]
allowed-tools: Bash(grep:*), Bash(find:*)
model: claude-opus-4-5-20251101
---

セキュリティレビューを実施します...
```

---

## 3. 保存場所（スコープ）

### プロジェクトコマンド（チーム共有）

**保存場所**: `.claude/commands/` ディレクトリ

```
project-root/
├── .claude/
│   └── commands/
│       ├── optimize.md
│       ├── security-review.md
│       └── frontend/
│           └── component-test.md
└── src/
```

**特徴**:
- リポジトリに含まれ、Gitでコミットされる
- チーム全体がアクセス可能
- `/help`に「(project)」と表示される

### 個人用コマンド（ユーザー個別）

**保存場所**: `~/.claude/commands/` ディレクトリ

```
~/.claude/
└── commands/
    ├── personal-optimize.md
    ├── code-review.md
    └── utilities/
        └── format-json.md
```

**特徴**:
- すべてのプロジェクトで利用可能
- `/help`に「(user)」と表示される

### スコープの優先順位

同じ名前のコマンドが存在する場合、**プロジェクトコマンドが優先**：

```
プロジェクト: .claude/commands/deploy.md  ← これが実行される
個人用:     ~/.claude/commands/deploy.md  ← これは無視される
```

### ネームスペーシング

サブディレクトリで同名コマンドを使い分け：

```
.claude/commands/
├── frontend/
│   └── test.md     → /test (project:frontend)
├── backend/
│   └── test.md     → /test (project:backend)
```

---

## 4. 引数の受け取り方

### 方法1: 全引数を受け取る (`$ARGUMENTS`)

すべての引数を単一の変数として受け取る：

```markdown
---
description: 指定されたイシューを修正
argument-hint: [issue-id] [priority]
---

イシュー #$ARGUMENTS の修正に取り組みます。

以下の手順に従います：
1. イシューの説明を理解
2. 関連コードを特定
3. ソリューション実装
```

**使用例**:
```bash
> /fix-issue 123 high-priority
# $ARGUMENTS → "123 high-priority"
```

### 方法2: 個別引数を受け取る (`$1`, `$2`, etc.)

特定の引数位置にアクセス：

```markdown
---
description: プルリクエストをレビュー
argument-hint: [pr-number] [priority] [assignee]
---

PR #$1 のレビューを開始します。

優先度: $2
担当者: $3
```

**使用例**:
```bash
> /review-pr 456 high alice
# $1 → "456"
# $2 → "high"
# $3 → "alice"
```

### 位置引数を使う利点

- 複数箇所に異なる引数を配置可能
- デフォルト値を設定可能

```markdown
PR #$1 をレビュー
優先度: ${2:-medium}  # デフォルト: medium
```

---

## 5. 組み込みコマンドとカスタムコマンドの違い

### 組み込みコマンド（Built-in Commands）

Claude Codeに最初から組み込まれているコマンド：

- `/help` - ヘルプ表示
- `/cost` - トークン使用量表示
- `/model` - モデル変更
- `/agents` - サブエージェント管理
- `/clear` - 会話履歴クリア
- `/memory` - CLAUDE.md編集
- `/mcp` - MCPサーバー管理

### カスタムコマンド

ユーザーがMarkdownファイルで定義したコマンド。

### 比較表

| 側面 | 組み込みコマンド | カスタムコマンド |
|-----|-----------------|-----------------|
| **実装** | システム実装 | Markdown |
| **カスタマイズ** | 不可 | 完全にカスタマイズ可能 |
| **共有範囲** | 全ユーザー共通 | プロジェクト/個人選択可能 |
| **引数対応** | 固定仕様 | 自由に設計 |

---

## 6. 具体的なサンプル

### サンプル1: シンプルなコードレビューコマンド

```markdown
---
description: このコードをセキュリティとパフォーマンスの観点からレビュー
---

以下の点に焦点を当ててコードをレビューしてください：

1. **セキュリティ脆弱性**
   - インジェクション攻撃の可能性
   - 認証・認可の問題

2. **パフォーマンス問題**
   - 不必要なループ
   - メモリリーク

3. **コードスタイル**
   - 命名規則の一貫性
   - 関数の責任範囲

改善案を具体的に提示してください。
```

**使用方法**: `/security-review`

### サンプル2: 動的なBashコマンド実行

```markdown
---
allowed-tools: Bash(git add:*), Bash(git status:*), Bash(git commit:*), Bash(git diff:*)
argument-hint: [message]
description: git コミットを自動生成
---

## コンテキスト情報

- **現在のgitステータス**: !`git status`
- **ステージ済みの変更**: !`git diff --cached`
- **未ステージ変更**: !`git diff`
- **最近のコミット**: !`git log --oneline -5`

## タスク

上記の変更内容を分析し、以下の要件でコミットメッセージを生成：

1. 1行目は50文字以内で変更内容をまとめる
2. Conventional Commitsフォーマットに従う（feat:, fix:, refactor:）

生成したメッセージでコミットを作成。「$ARGUMENTS」があれば使用。
```

**使用方法**: `/auto-commit "add user authentication"`

### サンプル3: ファイル参照を含むコマンド

```markdown
---
description: 2つのファイルを比較して重要な差分を抽出
---

以下の2つのファイルを比較してください：

- 旧バージョン: @src/old-api.js
- 新バージョン: @src/new-api.js

重点的に確認する項目：

1. **APIエンドポイントの変更**
2. **後方互換性**
3. **セキュリティ改善**

結果をレポート形式で提示してください。
```

**使用方法**: `/compare-api-versions`

### サンプル4: 動的なPRレビューコマンド

```markdown
---
description: PRをレビュー（優先度と担当者指定可能）
argument-hint: [pr-number] [priority] [reviewer]
allowed-tools: Bash(gh:*)
---

## PRレビュータスク

PR #$1 のレビューを開始します。

**優先度**: $2 (デフォルト: medium)
**レビュアー**: $3

## レビュー項目

1. **コード品質**
2. **ドキュメント**
3. **セキュリティ**
4. **互換性**

詳細なコメントを提供し、改善提案を含めてください。
```

**使用方法**: `/review-pr 789 high @alice`

### サンプル5: テスト生成コマンド

```markdown
---
description: 指定されたファイルのテストケースを生成
argument-hint: [file-path] [test-framework]
allowed-tools: Bash(find:*), Bash(grep:*)
---

ファイル: $1
テストフレームワーク: ${2:-jest}

## テスト生成タスク

指定されたファイルについて、以下のテストケースを生成：

1. **単体テスト**
   - 関数の正常系テスト
   - エラーハンドリング
   - エッジケース

2. **統合テスト**

生成したテストコードを表示し、実行可能な形式で提供。
```

**使用方法**: `/generate-tests src/utils/helpers.js vitest`

---

## 7. ベストプラクティス

### 1. 明確で説明的な説明を書く

```markdown
# 良い例
description: データベーススキーマの最適化を分析し、インデックス改善案を提案

# 悪い例
description: DBスキーマをチェック
```

### 2. 引数ヒントを常に提供

```markdown
argument-hint: [issue-id] [severity] [component]
```

### 3. 許可ツール（allowed-tools）を最小限に制限

```markdown
# 最小限の権限
allowed-tools: Bash(grep:*), Bash(git status:*)

# 不要なツールは避ける
# NG: Bash(rm:*), Bash(ssh:*)
```

### 4. 複雑なコマンドは複数行で説明

```markdown
# 3つの観点からコード品質を分析

1. **セキュリティ脆弱性**
2. **パフォーマンス課題**
3. **コードスタイル違反**
```

### 5. ネームスペースでコマンドを整理

```
.claude/commands/
├── frontend/
│   ├── component-test.md
│   └── style-check.md
├── backend/
│   ├── api-test.md
│   └── db-migration.md
└── general/
    ├── security-review.md
    └── documentation.md
```

### 6. チーム共有時は十分な説明を

```markdown
# プロジェクトコマンドの場合

## 使い方
> /generate-component [component-name] [type]

## 内容
このコマンドは以下のファイルを自動生成：
- Reactコンポーネント
- スタイルシート
- テストファイル
```

### 7. エラーハンドリング情報を含める

```markdown
## トラブルシューティング

- **権限エラー**: --permissionsフラグで許可を追加
- **ツール不足**: 必要なCLIツールをインストール
```

---

## 8. Skills vs Slash Commands

### Slash Commandsを使うべき場合

- 1回限りの簡単なプロンプト
- よく使うショートプロンプト
- 単一ファイルで完結

**例**:
```markdown
# .claude/commands/review.md
このコードをセキュリティの観点からレビューしてください。
```

### Skillsを使うべき場合

- 複数ステップのワークフロー
- 複数ファイル・スクリプトが必要
- 自動検出が必要

**例**:
```
.claude/skills/security-review/
├── SKILL.md
├── SECURITY-CHECKLIST.md
├── COMPLIANCE-GUIDE.md
└── scripts/
    └── scan.sh
```

### 比較表

| 側面 | Slash Command | Skill |
|------|---------------|-------|
| **呼び出し方法** | 明示的（`/command`） | 自動検出 |
| **ファイル数** | 1つ | 複数可 |
| **複雑度** | シンプル | 高度 |
| **用途** | テンプレート | 専門能力 |

---

## 参考リンク

- [Slash Commands 公式リファレンス](https://docs.anthropic.com/en/docs/claude-code/slash-commands)
- [Common Workflows](https://docs.anthropic.com/en/docs/claude-code/common-workflows)
