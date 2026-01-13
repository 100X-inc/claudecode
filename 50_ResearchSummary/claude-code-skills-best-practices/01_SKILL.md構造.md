---
tags:
  - research
  - claude-code
  - skills
  - skill-md
  - structure
created: 2026-01-13
source: web-researcher
---

# SKILL.md の構造と書き方

## 概要

SKILL.mdはSkillの唯一の必須ファイルであり、YAMLフロントマターとMarkdown本文の2部構成である。

## フロントマター仕様

### 必須フィールド

```yaml
---
name: pdf-processing
description: Extract text and tables from PDF files, fill forms, merge documents. Use when working with PDF files or when the user mentions PDFs, forms, or document extraction.
---
```

### フィールド詳細

| フィールド | 必須 | 制約 |
|-----------|------|------|
| `name` | Yes | 最大64文字、小文字・数字・ハイフンのみ、ハイフンで開始/終了不可、連続ハイフン不可 |
| `description` | Yes | 最大1024文字、非空、XMLタグ不可、何をするか＋いつ使うかを記述 |
| `license` | No | ライセンス名またはファイル参照 |
| `compatibility` | No | 最大500文字、環境要件 |
| `metadata` | No | 任意のキーバリューマッピング |
| `allowed-tools` | No | スペース区切りの事前承認ツールリスト（実験的） |

### name フィールドの例

**有効な例:**
```yaml
name: pdf-processing
name: data-analysis
name: code-review
name: processing-pdfs      # 動名詞形（推奨）
name: analyzing-spreadsheets
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

```yaml
description: Generate descriptive commit messages by analyzing git diffs. Use when the user asks for help writing commit messages or reviewing staged changes.
```

**悪い例:**
```yaml
description: Helps with documents   # 曖昧すぎる
description: Processes data          # 具体性がない
description: I can help you process Excel files  # 一人称不可
```

**重要ルール:**
- 三人称で記述する（"Processes...", "Extracts..."）
- 一人称（"I can..."）・二人称（"You can..."）は避ける
- 何をするか＋いつ使うかの両方を含める
- 関連キーワードを含める（セマンティックマッチング用）

## Markdown本文の構造

### 推奨構成

```markdown
---
name: pdf-processing
description: ...
---

# PDF Processing

## Quick Start
[最小限の動作例]

## Core Operations
[主要な操作方法]

## Advanced Features
**Form filling**: See [FORMS.md](FORMS.md) for complete guide
**API reference**: See [REFERENCE.md](REFERENCE.md) for all methods

## Workflow
[ステップバイステップの手順]

## Examples
[入力/出力の具体例]
```

### 本文のベストプラクティス

1. **500行以下を維持**: 超える場合は分割
2. **能動的・指示的な言語**: 「何が起こるか」ではなく「何をするか」
3. **番号付きステップ**: 複雑なタスクは順序立てて
4. **具体例を含める**: 抽象的な説明より具体例
5. **出力フォーマットを指定**: 一貫性が重要な場合

### コード例の書き方

**良い例（簡潔）:**
````markdown
## Extract PDF text

Use pdfplumber for text extraction:

```python
import pdfplumber

with pdfplumber.open("file.pdf") as pdf:
    text = pdf.pages[0].extract_text()
```
````

**悪い例（冗長）:**
````markdown
## Extract PDF text

PDF (Portable Document Format) files are a common file format that contains
text, images, and other content. To extract text from a PDF, you'll need to
use a library. There are many libraries available for PDF processing, but we
recommend pdfplumber because it's easy to use...
````

Claudeは既にPDFが何かを知っている。必要な情報だけを提供する。

## 完全なフロントマター例

```yaml
---
name: pdf-processing
description: Extract text and tables from PDF files, fill forms, merge documents.
license: Apache-2.0
metadata:
  author: example-org
  version: "1.0"
compatibility: Designed for Claude Code (or similar products)
allowed-tools: Bash(git:*) Bash(jq:*) Read
---
```

## 関連ノート

- [[00_概要]]
- [[02_ベストプラクティス詳細]]
- [[03_ディレクトリ構成]]

## ソース

- [Skill authoring best practices - Claude Docs](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices) - 取得日: 2026-01-13
- [Agent Skills Specification](https://agentskills.io/specification) - 取得日: 2026-01-13
