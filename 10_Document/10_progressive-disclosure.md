---
name: progressive-disclosure
description: Progressive Disclosure（段階的開示）の設計原則
---

# Progressive Disclosure（段階的開示）

Claude CodeにおけるCLAUDE.mdやSkillsを効果的に設計するための中核的な原則。

## 概要

Progressive Disclosureとは、情報を一度にすべて提示するのではなく、**必要なタイミングで必要な分だけ開示**する設計原則。

> "Showing just enough information to help agents decide what to do next, then reveal more details as they need them."
> （エージェントが次に何をすべきか判断するのに十分な情報だけを示し、必要に応じて詳細を開示する）

## なぜ重要か

### 1. コンテキストウィンドウは公共財

CLAUDE.mdの内容は、システムプロンプト、会話履歴、他のSkillsメタデータとコンテキストを共有する。無駄な情報はトークンを消費し、パフォーマンスに悪影響。

### 2. 指示遵守の限界

| モデル | 一貫して従える指示数 |
|--------|---------------------|
| Frontier LLM（Opus等） | 約150-200個 |
| 小型モデル | より少ない（急速に劣化） |

Claude Codeのシステムプロンプトだけで約50個の指示を消費。CLAUDE.mdに追加する指示は厳選すべき。

### 3. コンテキスト使用効率

GitHub社の事例では、Progressive Disclosureの適用により**54%のトークン削減**が報告されている。

## 3層アーキテクチャ

| レイヤー | 内容 | トークン消費 | 読み込みタイミング |
|---------|------|-------------|-------------------|
| Layer 1 | メタデータ（名前、説明） | 約100トークン | 起動時に常時 |
| Layer 2 | SKILL.md/CLAUDE.md本体 | 500-5,000トークン | 発動時のみ |
| Layer 3 | 参照ファイル・スクリプト | 可変 | 実際に必要な時のみ |

## 実装パターン

### CLAUDE.mdでの実装

**基本原則**: CLAUDE.mdは最小限に保ち、詳細は別ファイルに分離

```
project/
├── CLAUDE.md              # 簡潔な概要とポインタ（60行以下推奨）
├── agent_docs/            # 詳細ドキュメント
│   ├── building_the_project.md
│   ├── running_tests.md
│   ├── code_conventions.md
│   └── service_architecture.md
└── .claude/
    └── rules/             # モジュール化されたルール
        ├── testing.md
        └── formatting.md
```

**CLAUDE.mdの書き方例**:

```markdown
# プロジェクト名

## 概要
このプロジェクトは〇〇を行うWebアプリケーション。

## クイックリファレンス
- ビルド: `npm run build`
- テスト: `npm test`
- リント: `npm run lint`

## 詳細ドキュメント
- **ビルド手順**: [agent_docs/building_the_project.md](agent_docs/building_the_project.md)
- **テスト戦略**: [agent_docs/running_tests.md](agent_docs/running_tests.md)
- **アーキテクチャ**: [agent_docs/service_architecture.md](agent_docs/service_architecture.md)

## 重要ルール
- ES Modules構文を使用（CommonJSは不可）
- コミットメッセージは日本語で記述
```

### ポインタ優先戦略

コード片をコピーするのではなく、**ファイル:行番号**の参照で正規の情報源を指し示す。

```markdown
## 認証処理
認証の実装詳細は `src/auth/handler.ts:45-120` を参照。
```

**利点**: 内容の陳腐化を防ぎ、常に最新のコードを参照できる。

### Agent Skillsでの実装

```
pdf-skill/
├── SKILL.md           # 発動時に読み込み（~500行以下）
├── FORMS.md           # フォーム処理時のみ
├── reference.md       # API参照時のみ
└── scripts/
    └── analyze.py     # 実行時のみ（コンテキスト消費なし）
```

```markdown
---
name: pdf-processing
description: PDFファイルからテキストや表を抽出し、フォーム入力やマージを行う。
---

# PDF Processing

## クイックスタート
pdfplumberでテキスト抽出:
（基本的な使用例）

## 高度な機能
- **フォーム入力**: [FORMS.md](FORMS.md) を参照
- **APIリファレンス**: [REFERENCE.md](REFERENCE.md) を参照
```

### 条件付き読み込み（ディレクトリスコープ）

```
project/
├── CLAUDE.md           # プロジェクト全体
├── frontend/
│   └── CLAUDE.md       # フロントエンド作業時のみ
└── backend/
    └── CLAUDE.md       # バックエンド作業時のみ
```

### Rulesでのスコープ指定

```yaml
# .claude/rules/testing.md
---
paths:
  - "**/*.test.ts"
  - "**/*.spec.ts"
---

# テストファイル作業時のみ適用されるルール
テストは describe/it 形式で記述...
```

## ベストプラクティス

### サイズガイドライン

| 対象 | 推奨サイズ |
|------|-----------|
| CLAUDE.md | 60-300行以下 |
| SKILL.md | 500行以下 |
| メタデータ | 約100トークン |

### 参照の深さ制限

参照は**1階層**に留める。深いネストはClaudeが部分的にしかファイルを読まない原因となる。

```markdown
# 悪い例（深すぎる）
SKILL.md → advanced.md → details.md → 実際の情報

# 良い例（1階層）
SKILL.md
  ├→ advanced.md（詳細情報）
  ├→ reference.md（API参照）
  └→ examples.md（使用例）
```

### 長いファイルには目次を

100行を超える参照ファイルには、先頭に目次を配置。

### 具体的に書く

```markdown
# 悪い例
コードを適切にフォーマットしてください。

# 良い例
2スペースインデントを使用してください。
```

### 時間依存情報の回避

古くなる情報は含めない。どうしても必要な場合は `<details>` タグで折りたたむ。

## アンチパターン

### 1. すべてをCLAUDE.mdに詰め込む

```markdown
# 悪い例: 300行以上のCLAUDE.md
ビルド手順（50行）
テスト方法（30行）
コーディング規約（100行）
アーキテクチャ説明（80行）
...
```

### 2. Claudeをリンター代わりに使う

コードスタイルの指示はCLAUDE.mdに書かず、リンター・フォーマッター（Biome等）を使う。
必要なら`Stop`フックでリンターを自動実行。

### 3. /initや自動生成に頼る

CLAUDE.mdは全セッションに影響する最重要レバレッジポイント。手作業で1行1行吟味して作成すべき。

## コンテキスト最適化テクニック

### Hooks活用

冗長な指示の代わりにHooksを使用:

```json
{
  "hooks": {
    "PreToolUse": [{
      "matcher": "WebSearch",
      "action": "block",
      "message": "Use MCP search instead"
    }]
  }
}
```

### コンテキスト管理コマンド

| コマンド | 用途 |
|---------|------|
| `/compact` | 会話を要約してコンテキスト削減 |
| `/clear` | セッションをクリア |
| `/context` | コンテキスト使用状況の確認 |

**推奨**: コンテキスト50%到達時に `/compact` 実行

## チェックリスト

- [ ] CLAUDE.mdは60-300行以下か
- [ ] SKILL.mdは500行以下か
- [ ] 詳細は別ファイルに分離されているか
- [ ] ファイル参照は1階層に留まっているか
- [ ] コードスニペットではなくファイル:行番号を使っているか
- [ ] 時間依存情報がないか
- [ ] 具体的で曖昧さのない記述か
- [ ] 100行超のファイルには目次があるか

## 関連ドキュメント

- [02_claude-md.md](02_claude-md.md) - CLAUDE.mdの書き方詳細
- [03_skills.md](03_skills.md) - Agent Skills
- [05_hooks.md](05_hooks.md) - Hooks

## 参考資料

- [Skill authoring best practices - Claude Docs](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices)
- [Writing a good CLAUDE.md - HumanLayer Blog](https://www.humanlayer.dev/blog/writing-a-good-claude-md)
- [Claude Agent Skills: A First Principles Deep Dive](https://leehanchung.github.io/blogs/2025/10/26/claude-skills-deep-dive/)
- [Claude Code: Best practices for agentic coding](https://www.anthropic.com/engineering/claude-code-best-practices)
