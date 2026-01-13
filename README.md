# Claude Code リファレンス

Claude Code の拡張機能・ドキュメント・ツール集

## ディレクトリ構成

| フォルダ | 用途 | 優先度 |
|---------|------|--------|
| `00_Inbox` | 一時ファイル置き場 | 常用 |
| `01_IndexNote` | MOC（目次）・概要 | 常用 |
| `10_Document` | 公式ドキュメント・リファレンス | 高 |
| `20_Reference` | 外部ノウハウ・参考記事 | 高 |
| `30_Tutorial` | チュートリアル・セットアップガイド | 中 |
| `40_Research` | 自分のリサーチ・調査メモ | 中 |
| `50_ResearchSummary` | リサーチまとめ・結論 | 中 |
| `60_Project` | プロジェクト関連 | 中 |
| `90_Tools` | ツール・ユーティリティ | 低 |
| `99_Attachments` | 画像・添付ファイル | 低 |

## 運用フロー

```
00_Inbox（一時置き場）
    ↓ 整理
10_Document / 20_Reference / 30_Tutorial / 40_Research
    ↓ まとめ
50_ResearchSummary / 01_IndexNote（MOC）
```

## クイックリファレンス

### ファイル構造
```
~/.claude/
├── settings.json    # 設定（Hooks, Permissions）
├── CLAUDE.md        # メモリ
├── skills/          # Skills
├── commands/        # Slash Commands
└── agents/          # Agents
```

### どの機能を使う？

| やりたいこと | 機能 | 作成場所 |
|-------------|------|---------|
| プロンプトテンプレート | Slash Commands | commands/*.md |
| 専門知識を教える | Skills | skills/*/SKILL.md |
| 自動処理 | Hooks | settings.json |
| 専門エージェント | Agents | agents/*.md |
| 外部連携 | MCP | .mcp.json |

詳細: [10_Document/01_overview.md](10_Document/01_overview.md)
