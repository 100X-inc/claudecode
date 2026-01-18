---
name: overview
description: Codex CLIのカスタマイズ機能の全体概要と使い分けガイド
---

# Codex CLI カスタマイズ機能 完全概要

このドキュメントは、OpenAI Codex CLIの全カスタマイズ機能の概要と関連性を説明します。

## 目次

1. [機能一覧](#機能一覧)
2. [各機能の比較](#各機能の比較)
3. [ファイル構造](#ファイル構造)
4. [使い分けガイド](#使い分けガイド)
5. [Claude Codeとの比較](#claude-codeとの比較)
6. [関連ドキュメント](#関連ドキュメント)

---

## 機能一覧

### コア機能

| 機能 | 説明 | 詳細ドキュメント |
|------|------|-----------------|
| **Skills** | 再利用可能なタスク自動化バンドル。`$skill-name`で呼び出し | [03_skills.md](03_skills.md) |
| **Custom Prompts** | `/prompts:name`形式で実行するプロンプトテンプレート | [04_custom-prompts.md](04_custom-prompts.md) |
| **Slash Commands** | 組み込みコマンド（`/review`, `/model`等） | [05_slash-commands.md](05_slash-commands.md) |
| **Approval Policy** | コマンド実行前の承認制御 | [06_approval-sandbox.md](06_approval-sandbox.md) |
| **Sandbox Mode** | ファイルシステム・ネットワークアクセス制限 | [06_approval-sandbox.md](06_approval-sandbox.md) |

### 設定・拡張機能

| 機能 | 説明 | 詳細ドキュメント |
|------|------|-----------------|
| **Configuration** | config.toml による詳細設定 | [07_configuration.md](07_configuration.md) |
| **MCP Servers** | Model Context Protocol による外部ツール連携 | [08_mcp.md](08_mcp.md) |
| **Exec Mode** | 非対話モードでの自動実行 | [09_exec-mode.md](09_exec-mode.md) |
| **GitHub Action** | CI/CDパイプラインへの統合 | [10_github-action.md](10_github-action.md) |

### メモリ機能

| 機能 | 説明 | 詳細ドキュメント |
|------|------|-----------------|
| **AGENTS.md** | プロジェクトの知識をCodexに伝える | [02_agents-md.md](02_agents-md.md) |
| **Session Resume** | セッションの保存と再開 | [12_session-management.md](12_session-management.md) |

---

## 各機能の比較

### 呼び出し方法

| 機能 | 呼び出し方法 | ユーザーアクション |
|------|-------------|------------------|
| **Skills** | `$skill-name` or 自動検出 | 明示的 or 自動 |
| **Custom Prompts** | `/prompts:name` | 必要 |
| **Slash Commands** | `/command` | 必要 |
| **AGENTS.md** | セッション開始時に自動読み込み | 不要 |
| **MCP** | ツール呼び出し時 | 不要 |

### 目的と役割

| 機能 | 主な目的 |
|------|---------|
| **Skills** | 複雑なワークフロー、専門知識の自動適用 |
| **Custom Prompts** | 頻繁に使うプロンプトのテンプレート化 |
| **Slash Commands** | セッション制御、設定変更 |
| **AGENTS.md** | プロジェクトのオンボーディング情報 |
| **MCP Servers** | 外部機能（DB、API、ブラウザ等）の追加 |
| **Configuration** | 動作・権限・セキュリティの制御 |

### Skills vs Custom Prompts 詳細比較

| 側面 | Custom Prompts | Skills |
|------|----------------|--------|
| **呼び出し** | 明示的（`/prompts:name`） | 明示的（`$name`）or 自動 |
| **ファイル構造** | 単一の`.md`ファイル | ディレクトリ＋複数ファイル |
| **保存場所** | `~/.codex/prompts/` | `~/.codex/skills/*/SKILL.md` |
| **引数サポート** | あり（`$1`, `$ARGUMENTS`） | なし |
| **Progressive Disclosure** | 非対応 | 対応 |
| **共有方法** | ローカルのみ | リポジトリ共有可能 |
| **暗黙的発動** | 不可 | 可能（description マッチ） |

---

## ファイル構造

### ユーザー設定（全プロジェクト共通）

```
~/.codex/                      # CODEX_HOME
├── config.toml                # 設定ファイル
├── AGENTS.md                  # グローバル指示
├── AGENTS.override.md         # 一時的オーバーライド
├── skills/                    # ユーザーSkills
│   └── my-skill/
│       ├── SKILL.md           # 必須
│       ├── scripts/           # オプション
│       └── references/        # オプション
├── prompts/                   # Custom Prompts
│   └── my-prompt.md
├── rules/                     # Exec Policy ルール
│   └── safety.toml
└── history.jsonl              # セッション履歴
```

### プロジェクト設定

```
project-root/
├── AGENTS.md                  # プロジェクト指示（推奨）
├── AGENTS.override.md         # ローカルオーバーライド
├── .codex/                    # プロジェクト設定
│   └── skills/                # プロジェクトSkills
│       └── project-skill/
│           └── SKILL.md
└── src/
    └── module/
        └── AGENTS.md          # サブディレクトリ指示
```

### 優先順位（AGENTS.md）

Codexはセッション開始時に以下の順序でファイルを検索・連結:

```
1. ~/.codex/AGENTS.override.md  （存在すれば）
   または
   ~/.codex/AGENTS.md

2. プロジェクトルートから現在のディレクトリまで各階層で:
   - AGENTS.override.md
   - AGENTS.md
   - フォールバックファイル（設定可能）
```

**後から読み込まれたファイルが優先**（プロンプト内で後に出現するため）

---

## 使い分けガイド

### どの機能を使うべきか？

```
┌─ 頻繁に同じプロンプトを入力している？
│   └─ YES → Custom Prompts
│
├─ 複雑なワークフローを自動化したい？
│   └─ YES → Skills
│
├─ プロジェクト全体の情報をCodexに伝えたい？
│   └─ YES → AGENTS.md
│
├─ 外部サービス（DB、API等）と連携したい？
│   └─ YES → MCP Servers
│
├─ CI/CDパイプラインに組み込みたい？
│   └─ YES → Exec Mode + GitHub Action
│
├─ セキュリティを厳格に制御したい？
│   └─ YES → Approval Policy + Sandbox Mode
│
└─ セッション制御・設定変更？
    └─ YES → Slash Commands
```

### 具体例

| シナリオ | 推奨機能 |
|---------|---------|
| コードレビューを自動化したい | `/review` + Skills |
| PRドラフトを定型化したい | Custom Prompts |
| プロジェクトのコーディング規約を伝えたい | AGENTS.md |
| Figmaデザインを参照したい | MCP (Figma) |
| PRマージ時に自動テストしたい | GitHub Action |
| 本番環境への変更を制限したい | Sandbox Mode |

---

## Claude Codeとの比較

| 機能カテゴリ | Claude Code | Codex CLI |
|-------------|-------------|-----------|
| **メモリファイル** | CLAUDE.md | AGENTS.md |
| **カスケード** | なし | あり（階層的マージ） |
| **スキル** | `.claude/skills/*/SKILL.md` | `~/.codex/skills/*/SKILL.md` |
| **コマンド** | `.claude/commands/*.md` | `~/.codex/prompts/*.md` |
| **設定形式** | JSON (settings.json) | TOML (config.toml) |
| **自動処理** | Hooks (Pre/PostToolUse) | Notifications, Exec Policy |
| **サブエージェント** | Agents (.claude/agents/) | Skills内で対応 |
| **外部連携** | MCP (.mcp.json) | MCP (config.toml) |
| **承認制御** | Permissions | Approval Policy |
| **サンドボックス** | なし（OS依存） | Sandbox Mode (Seatbelt/Landlock) |
| **CI/CD** | Headless Mode (`-p`) | Exec Mode (`codex exec`) |
| **コードレビュー** | なし（手動） | `/review` 組み込み |
| **セッション管理** | なし | `codex resume` |
| **クラウド連携** | なし | Codex Cloud |
| **Web検索** | WebSearch ツール | `--search` オプション |

### 同等機能の対応表

| Claude Code | Codex CLI | 備考 |
|-------------|-----------|------|
| `CLAUDE.md` | `AGENTS.md` | Codexはカスケード対応 |
| `.claude/skills/*/SKILL.md` | `~/.codex/skills/*/SKILL.md` | 同じ仕様（Agent Skills Spec準拠） |
| `.claude/commands/*.md` | `~/.codex/prompts/*.md` | Codexは引数形式が異なる |
| `settings.json` の hooks | `config.toml` の notifications | トリガータイミングが異なる |
| `/project:init` | `/init` | AGENTS.md スキャフォールド生成 |
| `--print` | `codex exec` | 非対話モード |

---

## 関連ドキュメント

### 本リポジトリ内

| # | ドキュメント | 内容 |
|---|-------------|------|
| 01 | [01_overview.md](01_overview.md) | 全機能の概要（このファイル） |
| 02 | [02_agents-md.md](02_agents-md.md) | AGENTS.mdの書き方 |
| 03 | [03_skills.md](03_skills.md) | Agent Skills |
| 04 | [04_custom-prompts.md](04_custom-prompts.md) | Custom Prompts |
| 05 | [05_slash-commands.md](05_slash-commands.md) | 組み込みSlash Commands |
| 06 | [06_approval-sandbox.md](06_approval-sandbox.md) | Approval Policy & Sandbox |
| 07 | [07_configuration.md](07_configuration.md) | config.toml設定 |
| 08 | [08_mcp.md](08_mcp.md) | MCP連携 |
| 09 | [09_exec-mode.md](09_exec-mode.md) | Exec Mode |
| 10 | [10_github-action.md](10_github-action.md) | GitHub Action |
| 11 | [11_code-review.md](11_code-review.md) | /review機能 |
| 12 | [12_session-management.md](12_session-management.md) | Session管理 |
| 13 | [13_cloud-tasks.md](13_cloud-tasks.md) | Codex Cloud |
| 14 | [14_windows-tips.md](14_windows-tips.md) | Windows環境Tips |

### 公式ドキュメント

- [Codex CLI](https://developers.openai.com/codex/cli)
- [Codex CLI Features](https://developers.openai.com/codex/cli/features/)
- [Command Line Options](https://developers.openai.com/codex/cli/reference/)
- [Agent Skills](https://developers.openai.com/codex/skills/)
- [Custom Prompts](https://developers.openai.com/codex/custom-prompts/)
- [AGENTS.md Guide](https://developers.openai.com/codex/guides/agents-md/)
- [Configuration](https://developers.openai.com/codex/config-basic)

### 関連仕様

- [AGENTS.md Specification](https://agents.md/)
- [Agent Skills Specification](https://agentskills.io/specification)

---

## クイックリファレンス

### Skill作成

```bash
mkdir -p ~/.codex/skills/my-skill
cat > ~/.codex/skills/my-skill/SKILL.md << 'EOF'
---
name: my-skill
description: スキルの説明。トリガーキーワードを含める。
---

# スキルのタイトル

指示内容をここに記述
EOF
```

### Custom Prompt作成

```bash
mkdir -p ~/.codex/prompts
cat > ~/.codex/prompts/draftpr.md << 'EOF'
---
description: PRドラフトを作成
argument-hint: [TITLE="<title>"] [SCOPE="<scope>"]
---

以下の内容でPRドラフトを作成:
- タイトル: $TITLE
- スコープ: $SCOPE
EOF
```

使用: `/prompts:draftpr TITLE="feat: add login" SCOPE="auth module"`

### AGENTS.md作成

```bash
# Codex CLIで自動生成
codex
> /init

# または手動作成
cat > AGENTS.md << 'EOF'
# Project Guidelines

## Build & Test
- Run `npm test` after changes
- Use `pnpm` for dependencies

## Code Style
- Follow ESLint rules
- Prefer functional components
EOF
```

### 基本設定 (config.toml)

```toml
# ~/.codex/config.toml

model = "gpt-5.2-codex"
approval_policy = "on-request"
sandbox_mode = "workspace-write"

[features]
web_search_request = true
```
