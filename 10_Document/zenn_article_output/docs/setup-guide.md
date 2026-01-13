# Claude Code Action サブエージェント並列レビュー セットアップガイド

## 概要

このガイドでは、Claude Code Action を使用した自動PRレビューシステムのセットアップ方法を説明します。

5つの専門サブエージェントが並列でPRをレビューし、インラインコメントで具体的なフィードバックを提供します。

## 前提条件

- GitHub リポジトリへの管理者権限
- Anthropic API キー

## セットアップ手順

### 1. ファイルの配置

`implementation/` ディレクトリ内のファイルをプロジェクトルートにコピーします。

```bash
# ディレクトリ構造
your-project/
├── .github/
│   └── workflows/
│       └── claude-review.yml
├── .claude/
│   ├── commands/
│   │   └── review-pr.md
│   └── agents/
│       ├── code-quality-reviewer.md
│       ├── performance-reviewer.md
│       ├── security-code-reviewer.md
│       ├── test-coverage-reviewer.md
│       └── documentation-reviewer.md
└── CLAUDE.md
```

### 2. GitHub Secrets の設定

1. リポジトリの **Settings** > **Secrets and variables** > **Actions** に移動
2. **New repository secret** をクリック
3. 以下のシークレットを追加:
   - **Name**: `ANTHROPIC_API_KEY`
   - **Secret**: あなたの Anthropic API キー

### 3. CLAUDE.md のカスタマイズ

プロジェクトに合わせて `CLAUDE.md` を編集します：

- 開発環境（言語、フレームワーク）
- コーディング規約
- テスト要件
- セキュリティ要件
- PRレビュー基準

### 4. 動作確認

1. テスト用のブランチを作成
2. 適当な変更を加えてコミット
3. Pull Request を作成
4. 自動的にレビューが開始されることを確認

## 使い方

### 自動レビュー

PRが作成されると、自動的に5つの観点からレビューが実行されます：

| エージェント | レビュー内容 |
|------------|-------------|
| code-quality-reviewer | コード品質、命名、DRY原則 |
| performance-reviewer | パフォーマンス、N+1問題、メモリリーク |
| security-code-reviewer | セキュリティ脆弱性、OWASP Top 10 |
| test-coverage-reviewer | テストカバレッジ、テスト品質 |
| documentation-reviewer | ドキュメント正確性 |

### 再レビューの依頼

PRにコメントで以下を投稿すると、再レビューが実行されます：

```
@claude /review-pr
```

### レビュー結果の形式

レビュー完了後、以下の形式で結果が投稿されます：

- **インラインコメント**: 特定の行に対する具体的な指摘
- **トップレベルコメント**: 総合判定とサマリー

```
## レビュー結果

### 総合判定: ✅ マージ可能 / ⚠️ 要修正 / ❌ 重大な問題あり

### 指摘事項サマリー
- 🔴 Critical: X件
- 🟠 Warning: X件
- 🟢 Info: X件
```

## カスタマイズ

### エージェントのカスタマイズ

各エージェントファイル（`.claude/agents/*.md`）を編集して：

- レビュー項目の追加/削除
- 言語/フレームワーク固有のルール追加
- 重要度の基準調整

### レビュートリガーの変更

`claude-review.yml` の `on` セクションを編集：

```yaml
on:
  pull_request:
    types: [opened]        # PR作成時のみ
    # types: [opened, synchronize]  # プッシュ毎にも実行
```

### 許可するツールの追加

```yaml
claude_args: |
  --allowedTools "mcp__github_inline_comment__create_inline_comment,Bash(gh pr comment:*)"
```

## トラブルシューティング

### インラインコメントが投稿されない

**原因**: `claude_args` にツールが指定されていない

**解決策**:
```yaml
claude_args: |
  --allowedTools "mcp__github_inline_comment__create_inline_comment"
```

### エージェントが見つからない

**原因**: ファイルパスまたはファイル名の誤り

**解決策**:
- `.claude/agents/` ディレクトリの存在を確認
- ファイル名が正確か確認（ハイフン、アンダースコアに注意）

### レビューが何度も実行される

**原因**: `synchronize` トリガーが含まれている

**解決策**:
```yaml
on:
  pull_request:
    types: [opened]  # synchronize を削除
```

### API キーエラー

**原因**: GitHub Secrets の設定ミス

**解決策**:
1. シークレット名が `ANTHROPIC_API_KEY` か確認
2. API キーが有効か確認
3. リポジトリのシークレットに正しく設定されているか確認

## MCP ツール詳細

### mcp__github_inline_comment__create_inline_comment

PRの特定行にインラインコメントを投稿するMCPツール。

**初期化条件**:
- PRコンテキストが必須
- `--allowedTools` に明示的に指定が必要

**既知の問題**:
- `workflow_dispatch` トリガーでは初期化されない（Issue #635）
- `mcp__github` 単体では有効化されない（Issue #723）

## 参考リンク

- [anthropics/claude-code-action](https://github.com/anthropics/claude-code-action)
- [Claude Code Action ドキュメント](https://github.com/anthropics/claude-code-action/blob/main/docs/configuration.md)
- [元記事: 本家に学ぶ Claude Code Action のサブエージェント並列レビュー](https://zenn.dev/genda_jp/articles/70aa9a74ac1e62)
