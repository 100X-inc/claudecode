# Anthropic公式: Skills ベストプラクティス

Anthropic公式ドキュメント・GitHubから収集したAgent Skillsのベストプラクティスをまとめたリファレンス。

## 公式リソース一覧

| リソース | URL |
|---------|-----|
| Claude Code Skills Docs | https://code.claude.com/docs/en/skills |
| Skill Authoring Best Practices | https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices |
| Agent Skills Specification | https://agentskills.io/specification |
| Anthropic公式Skillsリポジトリ | https://github.com/anthropics/skills |
| Introducing Agent Skills | https://www.anthropic.com/news/skills |
| Engineering Blog | https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills |

---

## 1. 基本概念

### Skillsとは

Skillsは、Claudeに専門知識・ワークフロー・ツール連携を教えるための「動的にロードされる指示書フォルダ」。

**特徴:**
- 指示、スクリプト、リソースを含むフォルダ構造
- 必須ファイルは `SKILL.md` のみ
- 必要に応じてコンテキストに動的ロード
- セマンティックマッチングで自動発動

### 保存場所（スコープ）

| スコープ | 保存先 | 用途 |
|---------|--------|------|
| **グローバル** | `~/.claude/skills/skill-name/` | 全プロジェクトで使用 |
| **プロジェクト** | `.claude/skills/skill-name/` | プロジェクト固有 |

---

## 2. SKILL.md の構造

### 必須フォーマット

```yaml
---
name: pdf-processing
description: Extract text and tables from PDF files, fill forms, merge documents. Use when working with PDF files or when the user mentions PDFs, forms, or document extraction.
---

# PDF Processing

## Quick Start
[最小限の動作例]

## Core Operations
[主要な操作方法]
```

### フロントマターフィールド

| フィールド | 必須 | 制約 |
|-----------|------|------|
| `name` | Yes | 最大64文字、小文字・数字・ハイフンのみ |
| `description` | Yes | 最大1024文字、何をするか＋いつ使うか |
| `license` | No | ライセンス名またはファイル参照 |
| `compatibility` | No | 最大500文字、環境要件 |
| `metadata` | No | 任意のキーバリューマッピング |
| `allowed-tools` | No | スペース区切りの事前承認ツールリスト |

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

### description フィールドの書き方

**良い例（トリガーリッチ）:**
```yaml
description: Extract text and tables from PDF files, fill forms, merge documents. Use when working with PDF files or when the user mentions PDFs, forms, or document extraction.
```

**悪い例:**
```yaml
description: Helps with documents   # 曖昧すぎる
description: I can help you...      # 一人称不可
```

**重要ルール:**
- 三人称で記述（"Processes...", "Extracts..."）
- 「何をするか」+「いつ使うか」の両方を含める
- 関連キーワードを含める（セマンティックマッチング用）

---

## 3. ディレクトリ構成

### 標準構造

```
skill-name/
├── SKILL.md          # 必須: コアプロンプトと指示
├── scripts/          # オプション: 実行可能スクリプト
├── references/       # オプション: 参照ドキュメント
└── assets/           # オプション: テンプレート等
```

### 各ディレクトリの役割

| ディレクトリ | 目的 | コンテキスト |
|-------------|------|-------------|
| `SKILL.md` | エントリーポイント | 発動時にロード |
| `scripts/` | 実行可能コード | 実行のみ（内容はロードされない） |
| `references/` | 参照ドキュメント | 必要時にロード |
| `assets/` | テンプレート・バイナリ | ロードされない |

### 実践的な構成例

```
pdf/
├── SKILL.md              # メイン指示
├── forms.md              # フォーム入力ガイド
├── reference.md          # APIリファレンス
├── examples.md           # 使用例
└── scripts/
    ├── analyze_form.py   # フィールド抽出
    ├── fill_form.py      # フォーム入力
    └── validate.py       # バリデーション
```

---

## 4. 核心原則: Progressive Disclosure（段階的開示）

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

### Progressive Disclosure パターン

**パターン1: 高レベルガイド + 参照**

```markdown
## Advanced features

**Form filling**: See [FORMS.md](FORMS.md) for complete guide
**API reference**: See [REFERENCE.md](REFERENCE.md) for all methods
**Examples**: See [EXAMPLES.md](EXAMPLES.md) for common patterns
```

**パターン2: ドメイン別組織化**

```markdown
## Available datasets

**Finance**: Revenue, ARR, billing → See [references/finance.md](references/finance.md)
**Sales**: Opportunities, pipeline → See [references/sales.md](references/sales.md)
```

**パターン3: 条件分岐**

```markdown
## Document modification workflow

**Creating new content?** → Follow "Creation workflow" below
**Editing existing content?** → Follow "Editing workflow" below
```

---

## 5. ベストプラクティス

### 5.1 簡潔さが鍵

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

```python
import pdfplumber

with pdfplumber.open("file.pdf") as pdf:
    text = pdf.pages[0].extract_text()
```
```

### 5.2 適切な自由度の設定

| 自由度 | 使用場面 | 例 |
|-------|---------|-----|
| **高** | 複数アプローチが有効 | コードレビュー手順 |
| **中** | 推奨パターンがあるが変更可 | レポート生成テンプレート |
| **低** | 一貫性が重要 | DBマイグレーション |

### 5.3 500行以下を維持

SKILL.md本文が500行を超える場合は、詳細を別ファイルに分割する。

### 5.4 1レベル深さを維持

```markdown
# 良い例
SKILL.md → advanced.md
SKILL.md → reference.md

# 悪い例（深すぎる）
SKILL.md → advanced.md → details.md → actual_info.md
```

### 5.5 Unixスタイルパスを使用

```markdown
# 良い例
scripts/helper.py
references/guide.md

# 悪い例（Windowsスタイル）
scripts\helper.py
```

---

## 6. ワークフローとフィードバックループ

### チェックリストパターン

````markdown
## PDF form filling workflow

Copy this checklist and check off items as you complete them:

```
Task Progress:
- [ ] Step 1: Analyze the form (run analyze_form.py)
- [ ] Step 2: Create field mapping (edit fields.json)
- [ ] Step 3: Validate mapping (run validate_fields.py)
- [ ] Step 4: Fill the form (run fill_form.py)
- [ ] Step 5: Verify output (run verify_output.py)
```
````

### フィードバックループ

```markdown
## Document editing process

1. Make your edits to `word/document.xml`
2. **Validate immediately**: `python validate.py unpacked_dir/`
3. If validation fails:
   - Review the error message carefully
   - Fix the issues in the XML
   - Run validation again
4. **Only proceed when validation passes**
5. Rebuild: `python pack.py unpacked_dir/ output.docx`
```

---

## 7. Skills vs 他機能

| 特徴 | Skills | Slash Commands |
|------|--------|----------------|
| **発動** | 自動（セマンティックマッチング） | 明示的（/command） |
| **保存先** | `skills/skill-name/` | `commands/` |
| **用途** | 専門知識・複雑なワークフロー | プロンプトテンプレート |
| **コンテキスト** | Progressive Disclosure | 全量ロード |
| **構造** | フォルダ（複数ファイル可） | 単一Markdownファイル |

**使い分けの目安:**
- **Skills**: Claudeに「能力」を与える（PDFの処理方法、データ分析手法）
- **Slash Commands**: ユーザーが「呼び出す」ワークフロー（/commit, /review）

---

## 8. 公式サンプル分析

### anthropics/skills リポジトリ

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

### PDF Skillの構造（参考例）

```
skills/pdf/
├── SKILL.md          # メインガイド
├── forms.md          # PDFフォーム入力
├── reference.md      # 高度な機能
├── LICENSE.txt
└── scripts/          # ユーティリティスクリプト
```

**設計原則:**
- 段階的複雑さ: Quick start → specific operations → advanced tasks
- 複数ツール: 異なるニーズに異なるライブラリ
- 実用的タスク: 実世界のユースケース
- クロスリファレンス: forms.md, reference.mdへのリンク

---

## 9. 評価と反復

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

## 10. アンチパターン（避けるべきこと）

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

## 11. 実践例: 完全なSkill

```yaml
---
name: data-analysis
description: Analyze datasets using pandas and create visualizations. Use when the user asks about data analysis, CSV processing, or chart generation.
---

# Data Analysis

## Quick Start

```python
import pandas as pd

df = pd.read_csv("data.csv")
print(df.describe())
```

## Core Operations

### Load data
```python
df = pd.read_csv("file.csv")
df = pd.read_excel("file.xlsx")
df = pd.read_json("file.json")
```

### Basic analysis
```python
df.head()           # First 5 rows
df.info()           # Column types
df.describe()       # Statistics
df.value_counts()   # Frequency
```

## Advanced Features

**Visualization**: See [references/charts.md](references/charts.md)
**Time series**: See [references/timeseries.md](references/timeseries.md)

## Workflow

1. Load and inspect data
2. Clean and preprocess
3. Analyze patterns
4. Create visualizations
5. Export results

## Examples

**Example: Sales summary**
Input: "Summarize monthly sales from sales.csv"
Output: Grouped bar chart + statistics table
```

---

## まとめ: 設計チェックリスト

### コア品質
- [ ] 説明文が具体的でキーワードを含む
- [ ] 「何をするか」と「いつ使うか」の両方を含む
- [ ] SKILL.md本文が500行以下
- [ ] 詳細は別ファイルに分離（必要な場合）
- [ ] 時間依存の情報がない
- [ ] ファイル参照が1レベル深さ
- [ ] Unixスタイルパス使用

### テスト
- [ ] 最低3つの評価シナリオを作成
- [ ] Haiku、Sonnet、Opusでテスト
- [ ] 実際の使用シナリオでテスト

---

*最終更新: 2026-01-13*
*情報源: Anthropic公式ドキュメント・GitHub*
