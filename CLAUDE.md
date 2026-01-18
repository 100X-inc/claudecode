# Claude Code リファレンスプロジェクト

Claude Codeの拡張機能（Skills, Hooks, Slash Commands, Agents, MCP等）に関するドキュメント・ノウハウ集

## 拡張機能を作成する際の必須事項

**Skills, Agents, Slash Commands, Hooks, MCP を作成・編集する際は、必ず `claudecode/` のベストプラクティスを確認すること。**

| 作成対象 | 参照ドキュメント |
|---------|----------------|
| Skills | [claudecode/03_skills.md](claudecode/03_skills.md) |
| Agents | [claudecode/06_agents.md](claudecode/06_agents.md), [claudecode/11_agent-best-practices.md](claudecode/11_agent-best-practices.md) |
| Slash Commands | [claudecode/04_slash-commands.md](claudecode/04_slash-commands.md) |
| Hooks | [claudecode/05_hooks.md](claudecode/05_hooks.md) |
| MCP | [claudecode/12_mcp-development.md](claudecode/12_mcp-development.md) |
| 全体概要 | [claudecode/01_overview.md](claudecode/01_overview.md) |

## ディレクトリ構成

| フォルダ | 用途 |
|---------|------|
| `claudecode/` | 公式機能のリファレンス |
| `20_Reference/` | 外部記事・ノウハウ |
| `30_Tutorial/` | セットアップガイド |
| `40_Research/` | 調査メモ |
| `50_ResearchSummary/` | リサーチまとめ |
| `90_Tools/` | ユーティリティ |

## 詳細ドキュメント

機能別の詳細は以下を参照:

- [01_overview.md](claudecode/01_overview.md) - 全機能の概要と使い分け
- [02_claude-md.md](claudecode/02_claude-md.md) - CLAUDE.mdの書き方
- [10_progressive-disclosure.md](claudecode/10_progressive-disclosure.md) - Progressive Disclosure（段階的開示）
- [03_skills.md](claudecode/03_skills.md) - Agent Skills
- [04_slash-commands.md](claudecode/04_slash-commands.md) - Slash Commands
- [05_hooks.md](claudecode/05_hooks.md) - Hooks
- [06_agents.md](claudecode/06_agents.md) - Subagents
- [07_plugins.md](claudecode/07_plugins.md) - Plugins
- [08_settings.md](claudecode/08_settings.md) - Settings・Permissions
- [09_windows-tips.md](claudecode/09_windows-tips.md) - Windows環境での注意点
- [11_agent-best-practices.md](claudecode/11_agent-best-practices.md) - Anthropic公式エージェントベストプラクティス
- [12_mcp-development.md](claudecode/12_mcp-development.md) - MCP開発
- [13_headless-cicd.md](claudecode/13_headless-cicd.md) - Headless/CI/CD
- [14_extended-thinking.md](claudecode/14_extended-thinking.md) - Extended Thinking
- [15_agent-sdk.md](claudecode/15_agent-sdk.md) - Agent SDK

インデックス: [01_IndexNote/README.md](01_IndexNote/README.md)

## Windows環境での注意

- **Bashツール**: パスは `/c/path/to/file` 形式
- **ファイル操作**: Read, Write, Edit, Glob, Grep ツールを優先使用
