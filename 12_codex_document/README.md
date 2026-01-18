# Codex CLI ドキュメント

OpenAI Codex CLIの機能リファレンス集

## ドキュメント一覧

### コア機能

| # | ファイル | 内容 |
|---|---------|------|
| 01 | [01_overview.md](01_overview.md) | 全機能の概要と使い分け |
| 02 | [02_agents-md.md](02_agents-md.md) | AGENTS.mdの書き方（カスケード、override等） |
| 03 | [03_skills.md](03_skills.md) | Agent Skills（SKILL.md、Progressive Disclosure） |
| 04 | [04_custom-prompts.md](04_custom-prompts.md) | Custom Prompts（Slash Commands相当） |
| 05 | [05_slash-commands.md](05_slash-commands.md) | 組み込みSlash Commands一覧 |
| 06 | [06_approval-sandbox.md](06_approval-sandbox.md) | Approval PolicyとSandbox Mode |
| 07 | [07_configuration.md](07_configuration.md) | config.toml設定詳細（プロファイル含む） |
| 08 | [08_mcp.md](08_mcp.md) | MCPサーバー連携 |

### 自動化・CI/CD

| # | ファイル | 内容 |
|---|---------|------|
| 09 | [09_exec-mode.md](09_exec-mode.md) | Exec Mode（非対話モード） |
| 10 | [10_github-action.md](10_github-action.md) | GitHub Action連携 |
| 11 | [11_code-review.md](11_code-review.md) | /review機能の詳細 |

### 応用・その他

| # | ファイル | 内容 |
|---|---------|------|
| 12 | [12_session-management.md](12_session-management.md) | Session Resume、履歴管理 |
| 13 | [13_cloud-tasks.md](13_cloud-tasks.md) | Codex Cloud連携 |
| 14 | [14_windows-tips.md](14_windows-tips.md) | Windows環境での注意点 |

### ベストプラクティス・上級機能

| # | ファイル | 内容 |
|---|---------|------|
| 15 | [15_best-practices.md](15_best-practices.md) | ベストプラクティス完全ガイド |
| 16 | [16_plans-md.md](16_plans-md.md) | PLANS.mdによる複雑タスク管理 |
| 17 | [17_advanced-features.md](17_advanced-features.md) | 上級機能（画像入力、Web検索、Undo、MCP Server等） |

---

## 機能比較：Claude Code vs Codex CLI

| 機能カテゴリ | Claude Code | Codex CLI |
|-------------|-------------|-----------|
| **メモリファイル** | CLAUDE.md | AGENTS.md |
| **スキル** | Skills (.claude/skills/) | Skills (~/.codex/skills/) |
| **コマンド** | Slash Commands (.claude/commands/) | Custom Prompts (~/.codex/prompts/) |
| **設定** | settings.json | config.toml |
| **自動処理** | Hooks | Exec Policy / Notifications |
| **サブエージェント** | Agents (.claude/agents/) | - (Skills内で対応) |
| **外部連携** | MCP (.mcp.json) | MCP (config.toml) |
| **承認制御** | Permissions | Approval Policy |
| **サンドボックス** | - | Sandbox Mode |
| **CI/CD** | Headless Mode | Exec Mode / GitHub Action |
| **コードレビュー** | - | /review |
| **セッション管理** | - | resume |
| **クラウド連携** | - | Codex Cloud |

---

## 調査ソース

### 公式ドキュメント
- [Codex CLI](https://developers.openai.com/codex/cli)
- [Codex CLI Features](https://developers.openai.com/codex/cli/features/)
- [Command Line Options](https://developers.openai.com/codex/cli/reference/)
- [Agent Skills](https://developers.openai.com/codex/skills/)
- [Custom Prompts](https://developers.openai.com/codex/custom-prompts/)
- [AGENTS.md Guide](https://developers.openai.com/codex/guides/agents-md/)
- [Basic Configuration](https://developers.openai.com/codex/config-basic)
- [Advanced Configuration](https://developers.openai.com/codex/config-advanced)
- [MCP Integration](https://developers.openai.com/codex/mcp/)
- [GitHub Action](https://developers.openai.com/codex/github-action/)
- [Slash Commands](https://developers.openai.com/codex/cli/slash-commands/)

### GitHub
- [openai/codex](https://github.com/openai/codex)
- [openai/codex-action](https://github.com/openai/codex-action)

### 外部リファレンス
- [AGENTS.md Specification](https://agents.md/)
- [Agent Skills Specification](https://agentskills.io/specification)

---

## 次のステップ

1. **高優先度**から順にドキュメントを作成
2. 各機能の詳細調査
3. 実際の使用例・設定サンプルの収集
4. Claude Codeとの比較・使い分けガイド作成
