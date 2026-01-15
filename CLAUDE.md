# Claude Code リファレンスプロジェクト

Claude Codeの拡張機能（Skills, Hooks, Slash Commands, Agents, MCP等）に関するドキュメント・ノウハウ集

## ディレクトリ構成

| フォルダ | 用途 |
|---------|------|
| `10_Document/` | 公式機能のリファレンス |
| `20_Reference/` | 外部記事・ノウハウ |
| `30_Tutorial/` | セットアップガイド |
| `40_Research/` | 調査メモ |
| `50_ResearchSummary/` | リサーチまとめ |
| `90_Tools/` | ユーティリティ |

## 詳細ドキュメント

機能別の詳細は以下を参照:

- [01_overview.md](10_Document/01_overview.md) - 全機能の概要と使い分け
- [02_claude-md.md](10_Document/02_claude-md.md) - CLAUDE.mdの書き方
- [10_progressive-disclosure.md](10_Document/10_progressive-disclosure.md) - Progressive Disclosure（段階的開示）
- [03_skills.md](10_Document/03_skills.md) - Agent Skills
- [04_slash-commands.md](10_Document/04_slash-commands.md) - Slash Commands
- [05_hooks.md](10_Document/05_hooks.md) - Hooks
- [06_agents.md](10_Document/06_agents.md) - Subagents
- [07_plugins.md](10_Document/07_plugins.md) - Plugins
- [08_settings.md](10_Document/08_settings.md) - Settings・Permissions
- [09_windows-tips.md](10_Document/09_windows-tips.md) - Windows環境での注意点
- [11_agent-best-practices.md](10_Document/11_agent-best-practices.md) - Anthropic公式エージェントベストプラクティス

インデックス: [01_IndexNote/README.md](01_IndexNote/README.md)

## Windows環境での注意

- **Bashツール**: パスは `/c/path/to/file` 形式
- **ファイル操作**: Read, Write, Edit, Glob, Grep ツールを優先使用
