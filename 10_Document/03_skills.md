---
name: skills
description: Agent Skillsの作成方法とトリガー条件
---

# Claude Code Skills 完全ガイド

## 目次

1. [Skillsとは何か](#1-skillsとは何か)
2. [Skillsの仕様・構造](#2-skillsの仕様構造)
3. [トリガー条件と自動発見メカニズム](#3-トリガー条件と自動発見メカニズム)
4. [Skillsの作成方法](#4-skillsの作成方法)
5. [Skillsの種類と保存場所](#5-skillsの種類と保存場所)
6. [Slash Commandsとの違い](#6-slash-commandsとの違い)
7. [設定ファイルの場所と形式](#7-設定ファイルの場所と形式)
8. [具体的なサンプル](#8-具体的なサンプル)
9. [周辺機能との連携](#9-周辺機能との連携)
10. [トラブルシューティング](#10-トラブルシューティング)
11. [ベストプラクティス](#11-ベストプラクティス)
12. [Progressive Disclosure パターン](#12-progressive-disclosure-パターン)
13. [アンチパターン](#13-アンチパターン避けるべきこと)
14. [評価と反復](#14-評価と反復)
15. [公式リソース](#15-公式リソース)

---

## 1. Skillsとは何か

### 概要

**Agent Skills**は、Claudeに特定のタスクの実行方法を教えるためのMarkdownファイルです。単なるプロンプトテンプレートではなく、「どのような状況で」「何をどのようにするか」を指示する仕組みです。

### 重要な特徴

| 特徴 | 説明 |
|------|------|
| **モデル駆動型** | ユーザーが明示的に呼び出すのではなく、Claudeが自動的に判断して使用 |
| **自動検出** | Skillのdescriptionとユーザーのリクエストを照合し、関連性を判断 |
| **段階的読み込み** | 起動時は名前と説明のみ。使用時にSKILL.md全体を読み込み |

### 使用例

「PRレビュー時にチーム独自の基準を適用したい」場合：

```yaml
---
name: code-review
description: コード品質と潜在的問題をチェック。PRレビュー、コード分析が必要なときに使用。
---

# コードレビュースキル

コードをレビューするときは以下を確認：
1. コードの構成と構造
2. エラーハンドリング
3. セキュリティの懸念事項
4. テストカバレッジ
```

ユーザーが「このコードをレビューして」と言うと、Claudeは自動的にこのSkillを発見し適用します。

---

## 2. Skillsの仕様・構造

### ディレクトリ構造

Skillはディレクトリベースで構成されます：

```
my-skill/
├── SKILL.md           # 必須：メタデータと指示
├── reference.md       # オプション：詳細なリファレンス
├── examples.md        # オプション：使用例
└── scripts/
    ├── helper.py      # オプション：ユーティリティスクリプト
    └── validate.sh    # オプション：検証スクリプト
```

### SKILL.mdの構造

```markdown
---
name: skill-name
description: Skillの説明とトリガー条件（最大1024文字）
allowed-tools: Read, Grep, Write  # オプション
model: claude-sonnet-4-20250514   # オプション
---

# Skillタイトル

## 説明
このセクションでSkillの目的を説明します。

## 実行方法
ステップバイステップの指示をMarkdown形式で記述します。

## 例
具体的な使用例を示します。
```

### フロントマターのフィールド

| フィールド | 必須 | 説明 | 例 |
|-----------|------|------|-----|
| `name` | はい | Skillの識別子（小文字、数字、ハイフンのみ、最大64文字） | `code-review` |
| `description` | はい | Skillの説明と使用トリガー（最大1024文字） | `Reviews code for quality...` |
| `allowed-tools` | いいえ | 使用可能なツールを制限 | `Read, Grep, Write` |
| `model` | いいえ | Skill有効時に使用するモデル | `claude-3-5-haiku-20241022` |

---

## 3. トリガー条件と自動発見メカニズム

### 自動発見の流れ

1. **起動時**: 利用可能なすべてのSkillの名前と説明が読み込まれる
2. **マッチング**: ユーザーリクエストと意味的な類似度でSkillを探索
3. **確認**: Skillが見つかるとユーザーに使用許可を確認
4. **実行**: 承認後、SKILL.md全体がコンテキストに読み込まれ実行

### 良いdescriptionの書き方

**悪い例（曖昧）**:
```yaml
description: ドキュメント処理を助けます
```

**良い例（具体的なトリガーキーワード付き）**:
```yaml
description: PDFからテキストと表を抽出し、フォームを埋める。PDFファイルで作業するとき、PDF、フォーム、ドキュメント抽出を言及するときに使用。
```

### descriptionに含めるべき情報

1. **何ができるか**: 具体的な機能（抽出、マージ、分析など）
2. **いつ使用するか**: トリガーキーワード（「PDF」「フォーム」「レビュー」など）

---

## 4. Skillsの作成方法

### ステップ1: ディレクトリを作成

```bash
# 個人用Skill（全プロジェクトで使用可能）
mkdir -p ~/.claude/skills/my-skill

# プロジェクト用Skill（チームで共有）
mkdir -p .claude/skills/my-skill
```

### ステップ2: SKILL.mdを作成

```markdown
---
name: code-formatter
description: コードを自動フォーマット。コード品質改善やフォーマットが必要なときに使用。
allowed-tools: Read, Write, Bash(prettier:*), Bash(eslint:*)
---

# コード自動フォーマット

## 概要
このSkillはコードを自動的に整形し、チーム標準に従わせます。

## 使用方法
1. ファイルを指定
2. 自動フォーマットを適用
3. 変更内容を表示

## サポート言語
- JavaScript/TypeScript
- Python
- Markdown
```

### ステップ3: サポートファイル（オプション）を追加

```bash
# 詳細なリファレンスドキュメント
cat > ~/.claude/skills/my-skill/reference.md << 'EOF'
# フォーマット設定

## Prettier設定
prettier --write --config .prettierrc file.js

## ESLint設定
eslint --fix file.js
EOF
```

### ステップ4: Claude Codeを再起動して確認

```bash
exit
claude
```

確認コマンド:
```
What Skills are available?
```

### Progressive Disclosure（段階的情報開示）

大きなSkillは情報を分割することを推奨：

- SKILL.mdは**500行以下**に保つ
- 複雑な参考資料は別ファイルに分割
- リンクは**1段階**まで（A→B→Cは避ける）
- Claudeは必要になったときにリンク先を読む

---

## 5. Skillsの種類と保存場所

### 保存場所による分類

| 場所 | パス | 対象者 |
|------|------|--------|
| **Enterprise** | 管理者設定 | 組織全体 |
| **Personal** | `~/.claude/skills/` | 個人（全プロジェクト） |
| **Project** | `.claude/skills/` | リポジトリメンバー |
| **Plugin** | `plugin-root/skills/` | プラグインインストール者 |

### 優先順位

同名Skillがある場合の優先順位：

```
Enterprise（最優先）
    ↓
Personal
    ↓
Project
    ↓
Plugin（最低優先）
```

### 用途別Skill設定

**読み取り専用**:
```yaml
allowed-tools: Read, Grep, Glob
```

**データ分析**:
```yaml
allowed-tools: Read, Bash(python:*)
```

**コード修正**:
```yaml
allowed-tools: Read, Edit, Write, Bash(git:*)
```

**完全制御**（allowed-tools省略で標準権限）

---

## 6. Slash Commandsとの違い

### 比較表

| 側面 | Slash Command | Agent Skill |
|------|---------------|-------------|
| **呼び出し方法** | 明示的（`/command`） | 自動（Claudeが判断） |
| **ファイル数** | 1つのMarkdownファイル | ディレクトリ＋複数ファイル |
| **複雑度** | シンプルなプロンプト | 複数ファイル、スクリプト対応 |
| **検出方法** | ユーザーが知っている | 説明から自動マッチ |
| **用途** | よく使うテンプレート | 専門的な能力 |

### 使い分け

**Slash Commandを使う場合**:
- 同じプロンプトを頻繁に入力する
- 短い定型コマンド（`/review`, `/test`など）

**Skillsを使う場合**:
- 複数手順を含む複雑なワークフロー
- チーム標準を自動適用したい
- 参考資料やスクリプトが必要

### 例：Slash Command

```markdown
# .claude/commands/review.md
---
description: コードをレビュー
---

このコードを以下の観点からレビュー：
- セキュリティ問題
- パフォーマンス問題
- コードスタイル違反
```

使用: `/review` と入力

### 例：Skill

```
.claude/skills/code-review/
├── SKILL.md
├── SECURITY.md
├── PERFORMANCE.md
└── scripts/
    └── run-linters.sh
```

使用: 「このコードをレビューして」と言うだけ

---

## 7. 設定ファイルの場所と形式

### ディレクトリ構造

```
~/.claude/
├── skills/                      # ユーザー個人用スキル
│   ├── skill-1/
│   │   └── SKILL.md
│   └── skill-2/
│       └── SKILL.md
├── settings.json               # ユーザー設定
└── CLAUDE.md                   # ユーザー用メモリ

プロジェクト/
├── .claude/
│   ├── skills/                 # プロジェクト用スキル
│   │   └── project-skill/
│   │       └── SKILL.md
│   ├── settings.json           # プロジェクト設定
│   ├── commands/               # カスタムコマンド
│   ├── agents/                 # カスタムエージェント
│   └── hooks/                  # カスタムフック
└── CLAUDE.md                   # プロジェクトメモリ
```

### プラグイン構造

```
plugin-directory/
├── .claude-plugin/
│   └── plugin.json
└── skills/
    └── skill-1/
        └── SKILL.md
```

---

## 8. 具体的なサンプル

### サンプル1: コミットメッセージ生成

```yaml
# ~/.claude/skills/commit-message-generator/SKILL.md
---
name: commit-message-generator
description: Gitの変更内容からコミットメッセージを生成。コミット作成時に使用。
---

# コミットメッセージ生成

## 指示
1. `git diff --staged`を実行して変更内容を確認
2. 以下の形式でコミットメッセージを生成：
   - 最初の行：50文字以下の要約
   - 空行
   - 詳細な説明

## ベストプラクティス
- 現在形を使用（「Added」ではなく「Add」）
- 理由（Why）を説明
```

### サンプル2: 複数ファイル構成のスキル

**SKILL.md**:
```yaml
---
name: code-review
description: コード品質とベストプラクティスをレビュー。PRレビュー時に使用。
allowed-tools: Read, Grep
---

# コードレビュースキル

## レビュー対象
- セキュリティの脆弱性
- パフォーマンス問題
- テストカバレッジ

詳細:
- [セキュリティチェックリスト](SECURITY.md)
- [パフォーマンスパターン](PERFORMANCE.md)
```

**SECURITY.md**:
```markdown
# セキュリティレビューチェックリスト

## SQL Injectionチェック
- [ ] ユーザー入力はサニタイズされているか
- [ ] プリペアドステートメントを使用しているか

## XSSチェック
- [ ] DOM操作でescapeされているか
```

### サンプル3: 読み取り専用スキル

```yaml
---
name: safe-file-reader
description: ファイルを読み取り専用で操作。安全なファイルアクセスが必要な場合に使用。
allowed-tools: Read, Grep, Glob
---

# 安全なファイルリーダー

このスキルは以下のツールのみ使用：
- **Read**: ファイル内容を読む
- **Grep**: テキスト検索
- **Glob**: パターンマッチング

修正や削除は実行されません。
```

---

## 9. 周辺機能との連携

### Hooks（フック）との連携

Skillの実行後に自動検証を行う設定例：

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "~/.claude/hooks/validate-changes.sh"
          }
        ]
      }
    ]
  }
}
```

### MCP Serversとの使い分け

| 側面 | Skill | MCP Server |
|------|-------|-----------|
| **目的** | Claudeに**情報**を与える | Claudeに**機能**を与える |
| **形態** | Markdownファイル | 外部プロセス |
| **できること** | 知識、手順を提供 | DB接続、API呼び出し |
| **例** | 「コードレビューのやり方」 | 「PostgreSQLへのアクセス」 |

### Subagents（サブエージェント）との関係

エージェントにSkillを割り当てる：

```yaml
# .claude/agents/code-reviewer/AGENT.md
---
name: code-reviewer
description: コード品質レビュー専門エージェント
skills: code-review, security-check
---

このエージェントはコードレビューに特化。
```

---

## 10. トラブルシューティング

### よくある問題

**問題1: Skillが発動しない**
- 原因: descriptionが曖昧
- 解決: 具体的な機能とトリガーキーワードを含める

**問題2: SKILL.mdが読み込まれない**
- 原因: ファイルパスやYAML構文エラー
- 解決:
  - ファイル名は大文字小文字を区別
  - 先頭に `---` で始まる
  - name/descriptionは必須

**問題3: スクリプトが見つからない**
- 原因: パス区切り文字の誤り
- 解決:
  - スラッシュを使用: `scripts/helper.py`
  - 実行権限を確認: `chmod +x scripts/*.sh`

### デバッグ方法

```bash
# デバッグモードで起動
claude --debug
```

### スキル一覧の確認

```
What Skills are available?
```

---

## 11. ベストプラクティス

### descriptionの書き方

- 何ができるかを具体的に記述
- トリガーキーワードを含める
- 最大1024文字を有効活用
- 三人称で記述（"Processes...", "Extracts..."）
- 「何をするか」+「いつ使うか」の両方を含める

### name フィールドの規則

**有効な例:**
```yaml
name: pdf-processing
name: data-analysis
name: processing-pdfs      # 動名詞形（推奨）
```

**無効な例:**
```yaml
name: PDF-Processing      # 大文字不可
name: -pdf                # ハイフン開始不可
name: pdf--processing     # 連続ハイフン不可
name: anthropic-helper    # 予約語（anthropic, claude）不可
```

### Skillのサイズ

- SKILL.md: **500行以下**が最適
- 詳細情報は別ファイルに分割
- リンクは1段階まで（A→B→Cは避ける）
- Unixスタイルパスを使用: `scripts/helper.py`

### ツール権限の設計

```yaml
# 必要最小限の権限のみ付与
allowed-tools: Read, Grep, Glob

# 修正が必要な場合のみEdit/Writeを追加
allowed-tools: Read, Edit, Write, Bash(git:*)
```

### 簡潔さが鍵

**デフォルトの前提: Claudeは既に非常に賢い**

追加すべきは「Claudeが持っていない」コンテキストのみ。各情報に対して問いかける：
- 「Claudeは本当にこの説明が必要か？」
- 「この段落はトークンコストに見合うか？」

**悪い例（冗長）:**
```markdown
PDF (Portable Document Format) files are a common file format that contains
text, images, and other content. To extract text from a PDF, you'll need to
use a library. There are many libraries available...
```

**良い例（簡潔）:**
```markdown
## Extract PDF text

Use pdfplumber for text extraction:
import pdfplumber
with pdfplumber.open("file.pdf") as pdf:
    text = pdf.pages[0].extract_text()
```

### 適切な自由度の設定

| 自由度 | 使用場面 | 例 |
|-------|---------|-----|
| **高** | 複数アプローチが有効 | コードレビュー手順 |
| **中** | 推奨パターンがあるが変更可 | レポート生成テンプレート |
| **低** | 一貫性が重要 | DBマイグレーション |

### ドキュメント化

- 具体的な使用例を必ず含める
- 必要なパッケージやバージョンを明記
- 制限事項を記載

### 共有・配布

```bash
# プロジェクト内で共有（Gitにコミット）
git add .claude/skills/
git commit -m "Add code-review skill"
git push
```

---

## 12. Progressive Disclosure パターン

Skillsの最も重要な設計原則。マニュアルの目次→章→付録のように、必要な情報だけを段階的にロードする。

### 3層構造

```
Layer 1: メタデータ（name + description）
         → 常にプリロード（~100トークン）

Layer 2: SKILL.md本文
         → Skill発動時にロード（5000トークン以下推奨）

Layer 3+: 参照ファイル（references/, scripts/等）
         → 必要に応じてオンデマンドロード（無制限）
```

### パターン1: 高レベルガイド + 参照

```markdown
## Advanced features

**Form filling**: See [FORMS.md](FORMS.md) for complete guide
**API reference**: See [REFERENCE.md](REFERENCE.md) for all methods
**Examples**: See [EXAMPLES.md](EXAMPLES.md) for common patterns
```

### パターン2: ドメイン別組織化

```markdown
## Available datasets

**Finance**: Revenue, ARR, billing → See [references/finance.md](references/finance.md)
**Sales**: Opportunities, pipeline → See [references/sales.md](references/sales.md)
```

### パターン3: 条件分岐

```markdown
## Document modification workflow

**Creating new content?** → Follow "Creation workflow" below
**Editing existing content?** → Follow "Editing workflow" below
```

---

## 13. アンチパターン（避けるべきこと）

### 選択肢の過剰提示

```markdown
# 悪い例
"You can use pypdf, or pdfplumber, or PyMuPDF, or pdf2image, or..."

# 良い例
"Use pdfplumber for text extraction:
[コード例]
For scanned PDFs requiring OCR, use pdf2image with pytesseract instead."
```

### 時間依存の情報

```markdown
# 悪い例
"If you're doing this before August 2025, use the old API."

# 良い例
## Current method
Use the v2 API endpoint: `api.example.com/v2/messages`

## Old patterns
<details>
<summary>Legacy v1 API (deprecated 2025-08)</summary>
[旧情報]
</details>
```

### 含めるべきでないファイル

以下の補助的ドキュメントは**作成しない**：
- README.md
- INSTALLATION_GUIDE.md
- QUICK_REFERENCE.md
- CHANGELOG.md

Skillには「AIエージェントがタスクを実行するために必要な情報」のみを含める。

---

## 14. 評価と反復

### 評価駆動開発

1. **ギャップを特定**: Skillなしで代表的タスクを実行、失敗を記録
2. **評価を作成**: ギャップをテストする3つのシナリオを構築
3. **ベースラインを確立**: Skillなしのパフォーマンスを測定
4. **最小限の指示を書く**: ギャップを埋め、評価をパスする最小限のコンテンツ
5. **反復**: 評価実行、ベースライン比較、改善

### テストチェックリスト

- [ ] Haiku、Sonnet、Opusでテスト
- [ ] 最低3つの評価シナリオを作成
- [ ] 実際の使用シナリオでテスト

---

## 15. 公式リソース

### Anthropic公式Skillsリポジトリ

```
anthropics/skills/
├── skills/
│   ├── Creative & Design/
│   ├── Development & Technical/
│   ├── Enterprise & Communication/
│   └── Document Skills/
├── spec/                    # Agent Skills仕様
├── template-skill/          # テンプレート
└── README.md
```

**公式Skill一覧:**

| Skill | 説明 |
|-------|------|
| `pdf` | PDFの操作、テキスト抽出、フォーム入力 |
| `docx` | Word文書の作成・編集 |
| `pptx` | PowerPointプレゼンテーション |
| `xlsx` | Excelスプレッドシート |
| `skill-creator` | 新しいSkillの作成ガイド |

### リンク一覧

| リソース | URL |
|---------|-----|
| Claude Code Skills Docs | https://code.claude.com/docs/en/skills |
| Skill Authoring Best Practices | https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices |
| Agent Skills Specification | https://agentskills.io/specification |
| Anthropic公式Skillsリポジトリ | https://github.com/anthropics/skills |
| Introducing Agent Skills | https://www.anthropic.com/news/skills |

---

## 参考リンク

- [Claude Code 公式ドキュメント](https://docs.anthropic.com/en/docs/claude-code)
- [Agent Skills ガイド](https://docs.anthropic.com/en/docs/claude-code/agent-skills)
- [Slash Commands ガイド](https://docs.anthropic.com/en/docs/claude-code/slash-commands)
