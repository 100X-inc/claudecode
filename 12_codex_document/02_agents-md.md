---
name: agents-md
description: AGENTS.mdファイルの書き方とカスケード機構の詳細
---

# AGENTS.md 完全ガイド

AGENTS.mdは、AIコーディングエージェントにプロジェクトのコンテキストと指示を伝えるための標準フォーマットです。

## 目次

1. [概要](#概要)
2. [基本フォーマット](#基本フォーマット)
3. [ファイル配置](#ファイル配置)
4. [カスケード機構](#カスケード機構)
5. [Override機構](#override機構)
6. [設定オプション](#設定オプション)
7. [ベストプラクティス](#ベストプラクティス)
8. [Claude Codeとの比較](#claude-codeとの比較)
9. [実践例](#実践例)

---

## 概要

### AGENTS.mdとは

- AIコーディングエージェント向けの指示ファイル
- READMEの補完的存在（人間向け → AI向け）
- [AGENTS.md Specification](https://agents.md/) として標準化
- Claude Code, GitHub Copilot, Cursor, Devin等 20以上のツールで対応
- Linux Foundation傘下のAgentic AI Foundationが管理

### Claude CodeのCLAUDE.mdとの違い

| 項目 | AGENTS.md (Codex) | CLAUDE.md (Claude Code) |
|------|-------------------|-------------------------|
| **カスケード** | あり（階層的マージ） | なし（単一ファイル） |
| **Override** | AGENTS.override.md | CLAUDE.local.md |
| **フォールバック** | 設定可能 | 固定 |
| **サイズ制限** | 32KB（設定可能） | 制限なし（推奨あり） |
| **標準化** | オープン仕様 | Claude Code固有 |

---

## 基本フォーマット

### ファイル構造

```markdown
# Project Name

プロジェクトの概要をここに記述。

## Build & Test

```bash
npm install
npm test
```

## Code Style

- TypeScript を使用
- ESLint + Prettier でフォーマット
- 関数コンポーネントを優先

## Security

- .env ファイルはコミットしない
- API キーはハードコードしない

## PR Guidelines

- コミットメッセージは Conventional Commits 形式
- テストを必ず追加
```

### 推奨セクション

| セクション | 内容 |
|-----------|------|
| **Project Overview** | プロジェクトの概要・目的 |
| **Build & Test** | セットアップ・ビルド・テストコマンド |
| **Code Style** | コーディング規約・パターン |
| **Testing** | テスト実行方法・カバレッジ要件 |
| **Security** | セキュリティ上の注意点 |
| **PR/Commit Guidelines** | コントリビューション規約 |
| **Dev Environment** | 開発環境固有の設定 |

### 記述のポイント

1. **実行可能にする**: 具体的なコマンドを含める
2. **簡潔に**: 必要な情報のみ
3. **更新を続ける**: プロジェクトの変化に合わせて

---

## ファイル配置

### グローバル（全プロジェクト共通）

```
~/.codex/
├── AGENTS.md              # デフォルトの指示
└── AGENTS.override.md     # 一時的なオーバーライド
```

### プロジェクトレベル

```
project-root/
├── AGENTS.md              # プロジェクト全体の指示
├── AGENTS.override.md     # ローカルオーバーライド（gitignore推奨）
├── packages/
│   ├── frontend/
│   │   └── AGENTS.md      # フロントエンド固有の指示
│   └── backend/
│       └── AGENTS.md      # バックエンド固有の指示
└── src/
    └── auth/
        └── AGENTS.md      # 認証モジュール固有の指示
```

---

## カスケード機構

### 読み込み順序

Codexはセッション開始時に以下の順序でファイルを検索:

```
1. グローバルスコープ (~/.codex/)
   └─ AGENTS.override.md があれば読む
      なければ AGENTS.md を読む
   ※ どちらか一方のみ

2. プロジェクトスコープ（Git root → 現在のディレクトリ）
   各ディレクトリで順番にチェック:
   ├─ AGENTS.override.md
   ├─ AGENTS.md
   └─ フォールバックファイル（設定可能）
   ※ 各ディレクトリで最初に見つかった1ファイルのみ
```

### マージ動作

```
~/.codex/AGENTS.md
        ↓ 連結
/project/AGENTS.md
        ↓ 連結
/project/src/AGENTS.md
        ↓ 連結
/project/src/auth/AGENTS.md
        ↓
    最終的な指示
```

**重要**: 後から読み込まれたファイルが優先（プロンプト内で後に出現）

### 具体例

```
# 作業ディレクトリ: /project/src/auth

読み込まれるファイル:
1. ~/.codex/AGENTS.md        # グローバル設定
2. /project/AGENTS.md        # プロジェクトルート
3. /project/src/AGENTS.md    # src ディレクトリ
4. /project/src/auth/AGENTS.md  # auth ディレクトリ（最優先）
```

### サイズ制限

- デフォルト: 32KB (`project_doc_max_bytes`)
- 制限に達すると、それ以降のファイルは無視
- 空ファイルはスキップ

---

## Override機構

### AGENTS.override.md

一時的なオーバーライドが必要な場合に使用:

```
~/.codex/
├── AGENTS.md              # チーム共通のルール
└── AGENTS.override.md     # 個人的な一時ルール（優先）

project/
├── AGENTS.md              # リポジトリにコミット
└── AGENTS.override.md     # ローカルのみ（.gitignore）
```

### 使用例

```markdown
# ~/.codex/AGENTS.override.md

## Temporary Override

This week I'm working on the payment feature.
Focus on security best practices for payment processing.
Always double-check PCI compliance requirements.
```

### Override解除

```bash
# 単にファイルを削除またはリネーム
mv ~/.codex/AGENTS.override.md ~/.codex/AGENTS.override.md.bak
```

---

## 設定オプション

### config.toml での設定

```toml
# ~/.codex/config.toml

# フォールバックファイル名（AGENTS.md の代替）
project_doc_fallback_filenames = ["TEAM_GUIDE.md", ".agents.md", "CONTRIBUTING.md"]

# 最大バイト数（連結後の合計）
project_doc_max_bytes = 65536  # 64KB
```

### 検索順序のカスタマイズ

フォールバック設定後の各ディレクトリでの検索順序:

```
1. AGENTS.override.md
2. AGENTS.md
3. TEAM_GUIDE.md       # フォールバック1
4. .agents.md          # フォールバック2
5. CONTRIBUTING.md     # フォールバック3
```

---

## ベストプラクティス

### 1. 階層構造を活用

```
# グローバル (~/.codex/AGENTS.md)
- 個人の作業スタイル
- 共通のツール設定

# プロジェクトルート (project/AGENTS.md)
- プロジェクト概要
- ビルド・テストコマンド
- コーディング規約

# サブディレクトリ (project/src/module/AGENTS.md)
- モジュール固有の注意点
- 特殊な依存関係
```

### 2. 実行可能なコマンドを含める

```markdown
## Good ✓
```bash
npm test
npm run lint
npm run build
```

## Bad ✗
テストを実行してください。
```

### 3. セキュリティガードレールを設定

```markdown
## Security

- Never commit .env files
- Never expose API keys in code
- Always use parameterized queries
- Run `npm audit` before PRs
```

### 4. 検証コマンドを使用

```bash
# 現在読み込まれている指示を確認
codex --ask-for-approval never "Summarize current instructions"

# または対話モードで
codex
> /status
```

### 5. .gitignore設定

```gitignore
# ローカルオーバーライドは共有しない
AGENTS.override.md
```

---

## Claude Codeとの比較

### ファイル対応

| Claude Code | Codex |
|-------------|-------|
| `CLAUDE.md` | `AGENTS.md` |
| `CLAUDE.local.md` | `AGENTS.override.md` |
| `.claude/rules/*.md` | サブディレクトリの `AGENTS.md` |

### 機能比較

| 機能 | Claude Code | Codex |
|------|-------------|-------|
| **カスケード** | なし | あり |
| **サブディレクトリ分割** | rules/ ディレクトリ | 各ディレクトリにAGENTS.md |
| **フォールバック** | なし | 設定可能 |
| **サイズ制限** | 推奨のみ | 強制 (32KB) |
| **生成コマンド** | `/project:init` | `/init` |

### 移行ガイド

Claude CodeからCodexへ移行する場合:

```bash
# CLAUDE.md → AGENTS.md
cp CLAUDE.md AGENTS.md

# CLAUDE.local.md → AGENTS.override.md
cp CLAUDE.local.md AGENTS.override.md

# .claude/rules/*.md → サブディレクトリのAGENTS.md
# 必要に応じて再構成
```

---

## 実践例

### モノレポ構成

```
monorepo/
├── AGENTS.md                    # 共通ルール
│   │
│   │  # 内容:
│   │  ## Monorepo Guidelines
│   │  - Use pnpm workspaces
│   │  - Run `pnpm install` from root
│   │  - Each package has its own test suite
│   │
├── packages/
│   ├── web/
│   │   └── AGENTS.md            # Webアプリ固有
│   │       │
│   │       │  # 内容:
│   │       │  ## Web Package
│   │       │  - Next.js 14 app router
│   │       │  - Run `pnpm dev` to start
│   │       │  - Tests: `pnpm test`
│   │       │
│   ├── api/
│   │   └── AGENTS.md            # API固有
│   │       │
│   │       │  # 内容:
│   │       │  ## API Package
│   │       │  - Express + TypeScript
│   │       │  - OpenAPI spec in docs/
│   │       │  - Integration tests require DB
│   │       │
│   └── shared/
│       └── AGENTS.md            # 共有ライブラリ固有
```

### グローバル設定例

```markdown
# ~/.codex/AGENTS.md

## Personal Preferences

- Prefer TypeScript over JavaScript
- Use functional programming patterns
- Write comprehensive tests

## Common Commands

- Format: `prettier --write .`
- Lint: `eslint --fix .`

## Git Workflow

- Use conventional commits
- Always rebase before merge
- Squash commits for cleanliness
```

### プロジェクト設定例

```markdown
# project/AGENTS.md

# E-Commerce Platform

Online marketplace built with Next.js and Node.js.

## Quick Start

```bash
pnpm install
pnpm dev        # Start development
pnpm test       # Run tests
pnpm build      # Production build
```

## Architecture

- Frontend: Next.js 14 (App Router)
- Backend: Express + Prisma
- Database: PostgreSQL
- Cache: Redis

## Code Standards

- ESLint + Prettier (auto-format on save)
- Strict TypeScript mode
- 80% test coverage minimum

## Security Rules

- Never commit .env files
- Use environment variables for secrets
- Sanitize all user inputs
- Use prepared statements for DB queries

## PR Checklist

- [ ] Tests pass
- [ ] Linting passes
- [ ] Documentation updated
- [ ] Security review (if auth changes)
```

---

## トラブルシューティング

### ファイルが読み込まれない

```bash
# 1. ファイルの存在確認
ls -la AGENTS.md

# 2. Codexの認識確認
codex
> /status

# 3. 現在の指示を要約させる
> Summarize the project instructions you have
```

### カスケードが期待通りに動作しない

```bash
# 1. 作業ディレクトリ確認
pwd

# 2. Gitルート確認
git rev-parse --show-toplevel

# 3. 各ディレクトリのファイル確認
find . -name "AGENTS*.md" -type f
```

### サイズ制限に達する

```toml
# ~/.codex/config.toml
project_doc_max_bytes = 65536  # 64KBに拡張
```

または、指示を簡潔にして分割:

```markdown
# 詳細は別ファイルに分離
詳細な手順は docs/DEVELOPMENT.md を参照。
```

---

## 関連ドキュメント

- [01_overview.md](01_overview.md) - 全機能の概要
- [07_configuration.md](07_configuration.md) - config.toml設定詳細
- [AGENTS.md Specification](https://agents.md/) - 公式仕様
- [Codex AGENTS.md Guide](https://developers.openai.com/codex/guides/agents-md/) - OpenAI公式ガイド
