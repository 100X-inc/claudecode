# Code-Simplifier Agent

Claude Code公式のコード簡素化エージェント。Claude Codeチームが内部で使用しているものをオープンソース化。

## 概要

| 項目 | 内容 |
|------|------|
| リリース | 2026年1月9日 |
| 発表者 | Boris Cherny (@bcherny) |
| モデル | Claude Opus |
| 種別 | 公式プラグイン |

**ソース**: [anthropics/claude-plugins-official](https://github.com/anthropics/claude-plugins-official/blob/main/plugins/code-simplifier/agents/code-simplifier.md)

## インストール

```bash
# 方法1: 直接インストール
claude plugin install code-simplifier

# 方法2: セッション内から
/plugin marketplace update claude-plugins-official
/plugin install code-simplifier
```

**注意**: インストール後はセッションを再起動する必要がある（ライブロードされない）

## 主な機能

### Core Principles

1. **Preserve Functionality** - コードの動作は変えず、書き方のみを改善
2. **Apply Project Standards** - CLAUDE.mdの規約に従う
3. **Enhance Clarity** - 複雑さを削減、可読性向上
4. **Maintain Balance** - 過度な簡素化を避ける
5. **Focus Scope** - デフォルトで最近変更されたコードのみ対象

### 具体的な改善内容

- 重複コード排除（DRY原則）
- 条件分岐の簡素化（ガード節、早期リターン）
- 大きなメソッドを単一責任の関数に分割
- モダンな構文への更新
- 不要なコメント削除
- ネストしたternary演算子の排除（switch/if-elseを推奨）

## 使用タイミング

| シーン | 使い方 |
|--------|--------|
| 長いコーディングセッション後 | `Run the code-simplifier agent on the changes we made today` |
| PR作成前 | `Use the code-simplifier to review and clean up these changes before we create the PR` |
| 複雑なリファクタリング後 | 一貫性確保のため |
| AI生成コードの監査 | 蓄積された複雑さのチェック |

## エージェント定義（原文）

```markdown
You are an expert code simplification specialist focused on enhancing code
clarity, consistency, and maintainability while preserving exact functionality.
Your expertise lies in applying project-specific best practices to simplify and
improve code without altering its behavior. You prioritize readable, explicit
code over overly compact solutions.
```

### Refinement Process

1. 最近変更されたコードセクションを特定
2. 改善機会を分析
3. プロジェクト固有のベストプラクティスを適用
4. 機能が変わっていないことを確認
5. 簡潔で保守性の高いコードになったことを検証
6. 理解に影響する重要な変更のみ文書化

## 効果

- **トークン消費**: 定期使用で20-30%削減（クリーンなコードはコンテキストウィンドウ消費が少ない）
- **コード品質**: 複雑さの大幅削減、可読性・保守性向上
- **テスト**: 機能維持を保証（ある例では257テストがパス）

## トレードオフ

| メリット | デメリット |
|----------|------------|
| コード複雑さの大幅削減 | 開発速度が約半分に |
| 可読性・保守性向上 | 追加のイテレーションが必要 |
| 一貫したコード品質 | リファクタリングに時間を要する |
| 長期的なプロジェクト健全性 | |

## フレームワーク固有バリアント

- **Laravel/PHP**: Taylor Otwell作成
  ```bash
  /plugin marketplace add laravel/claude-code
  /plugin install laravel-simplifier
  ```
- **Rust**: MCPマーケットプレイス経由で利用可能

## なぜ必要か

AI生成コードには冗長性の問題がある。Claudeが悪いコードを書くわけではないが、「徹底的」であろうとするため、その徹底さがメンテナンス負担を生む。code-simplifierはこの問題を解決する。

## 参考リンク

- [GitHub - anthropics/claude-plugins-official](https://github.com/anthropics/claude-plugins-official/blob/main/plugins/code-simplifier/agents/code-simplifier.md)
- [Boris Cherny (@bcherny) 発表ツイート](https://x.com/bcherny/status/2009450715081789767)
- [Cyrus AI - Code-Simplifier Agent Guide](https://www.atcyrus.com/stories/claude-code-code-simplifier-agent-guide)
- [Killer Code - Preventing Code Bloat](https://cc.deeptoai.com/docs/en/community-tips/code-simplifier-agent)
- [Laravel News - Laravel Simplifier Plugin](https://laravel-news.com/laravel-gets-a-claude-code-simplifier-plugin)
