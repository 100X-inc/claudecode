# Boris Cherny氏のClaude Codeワークフロー完全ガイド

Claude Code開発者Boris Cherny氏が2026年1月に公開したワークフローと、コンテキストエンジニアリングのベストプラクティスをまとめたリファレンス。

## 公式リソース一覧

| リソース | URL |
|---------|-----|
| Boris Cherny's Setup (GitHub) | https://github.com/0xquinto/bcherny-claude |
| InfoQ: Creator Workflow | https://www.infoq.com/news/2026/01/claude-code-creator-workflow/ |
| VentureBeat: Workflow Revealed | https://venturebeat.com/technology/the-creator-of-claude-code-just-revealed-his-workflow-and-developers-are |
| gihyo.jp: コンテキストウィンドウ | https://gihyo.jp/article/2025/12/get-started-claude-code-05 |
| Zenn: Claude Code ベストプラクティス | https://zenn.dev/farstep/articles/claude-code-best-practices |

---

## 1. 並列実行アーキテクチャ

### 15-20インスタンス同時実行

Boris氏は15-20のClaudeインスタンスを同時に実行：

```
実行環境の構成:
├── iTerm2 ターミナル (5タブ) - 番号1-5、システム通知付き
├── ブラウザ (5-10タブ) - claude.ai/code セッション
└── 双方向トランスポート - & と --teleport フラグでセッション間移動
```

**重要ポイント:**
- 各ローカルセッションは**ブランチではなく独自のgit checkout**を使用（コンフリクト回避）
- 約10-20%のセッションは予期せぬシナリオで放棄される
- `git worktree`で軽量なマルチチェックアウトを実現

---

## 2. モデル選択: Opus 4.5一択

Boris氏はすべてのコーディングタスクで**Opus 4.5 + thinking**を使用。

> "Opusは大きくて遅いですが、強力な理解力と正確なツール使用により、最終的には小さなモデルより**ほぼ常に速い**です。"

### なぜOpus 4.5か

| 項目 | Sonnet | Opus 4.5 |
|------|--------|----------|
| 速度 | 速い | 遅い |
| ステアリング | 多く必要 | 少なくて済む |
| ツール使用 | 標準 | 優秀 |
| 最終的な効率 | 低い | **高い** |

---

## 3. Plan Mode（計画モード）ワークフロー

PRを書く際の核心的なアプローチ。

### 手順

```
1. Plan modeに入る (Shift+Tab ×2)
2. Claudeと計画についてやり取り
3. 計画に満足したら auto-accept edits mode に切り替え
4. Claudeが通常一発で完了
```

> "良い計画は本当に重要です！計画が気に入るまでClaudeとやり取りしてから、自動承認編集モードに切り替えます。"

### 「探索→計画→実装→コミット」サイクル

| フェーズ | 内容 | ポイント |
|---------|------|---------|
| **探索** | 関連ファイルを読み込む | コードは書かない |
| **計画** | 「think」キーワードで拡張思考モード | アプローチを議論 |
| **実装** | 自動承認モードで実行 | 各段階で品質確認 |
| **検証** | テスト、リンター、型チェック | フィードバックループ |

---

## 4. 検証ループ（最重要）

Boris氏曰く、これがClaude Codeから素晴らしい結果を得るための**最も重要なこと**。

> "Claudeに自分の仕事を検証する方法を与えることで、最終結果の品質が**2〜3倍**になります。"

### 検証の仕組み

```
Claude Code → 変更を実装
    ↓
Chrome拡張でブラウザを開く
    ↓
UIをテスト
    ↓
動作するまで反復
    ↓
デプロイ
```

### 品質を高めるツール

| ツール | 役割 |
|--------|------|
| テスト | 自動化された検証 |
| リンター | コード品質の維持 |
| 型チェッカー | 静的解析 |
| デプロイスクリプト | 本番環境での確認 |

---

## 5. CLAUDE.md の運用

### チーム共有ファイル

```
CLAUDE.md の特徴:
- gitにチェックイン
- チーム全員が週に複数回貢献
- 現在約2.5kトークン
- Claudeが間違えたら必ず追加
```

### フライホイール効果

```
コードレビュー → CLAUDE.md更新 → 次回のClaude出力改善 → コードレビュー → ...
```

PRに `@.claude` タグを使用して自動的にインサイトを取り込む。

### 記載すべき内容

```markdown
# プロジェクト情報
- 言語・フレームワーク・目的

# 共通コマンド
- ビルド: npm run build
- テスト: npm test
- フォーマット: npm run format

# コードスタイル
- 命名規則
- モジュール構文

# ワークフロー
- 実装後の型チェック優先度
- テスト駆動開発の方針

# 過去の失敗と学び
- [日付] ○○の問題が発生 → 対策: △△
```

---

## 6. スラッシュコマンド

Boris氏は「1日に何度も行うインナーループワークフローすべてにスラッシュコマンドを使用」。

### 主要コマンド（.claude/commands/）

| コマンド | 用途 | 使用頻度 |
|---------|------|---------|
| `/commit-push-pr` | git全体のワークフロー | 毎日数十回 |
| `/quick-commit` | 迅速なコミット | 高 |
| `/test-and-fix` | テスト実行と修正 | 高 |
| `/review-changes` | コードレビュー | 中 |
| `/first-principles` | 問題の根本分析 | 低 |

### コマンドの配置

```
.claude/commands/
├── commit-push-pr.md
├── quick-commit.md
├── test-and-fix.md
├── review-changes.md
└── first-principles.md
```

---

## 7. サブエージェント

専門化されたエージェントで品質ゲートを自動化。

### 主要エージェント（.claude/agents/）

| エージェント | 役割 |
|-------------|------|
| `code-simplifier` | コード簡潔化 |
| `code-architect` | 設計レビュー |
| `verify-app` | アプリケーション検証 |
| `build-validator` | ビルド確認 |
| `oncall-guide` | 本番環境問題対応 |

---

## 8. 設定とフック

### settings.json の事前許可

```json
{
  "permissions": {
    "allow": [
      "Bash(npm:*)",
      "Bash(git:*)",
      "Bash(gh:*)"
    ]
  }
}
```

一般的で安全なコマンドは承認プロンプトなしで実行。

### PostToolUseフック

編集後の自動コード整形を実行：

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit",
        "command": "npm run format"
      }
    ]
  }
}
```

---

## 9. ツール統合

Boris氏のチームは以下を統合：

| ツール | 用途 |
|--------|------|
| Slack | チーム通知 |
| BigQuery | データ分析 |
| Sentry | エラー監視 |
| Chrome拡張 | UI検証 |

---

## 10. コンテキストエンジニアリング

### コンテキストウィンドウの内訳

20万トークンの配分：

```
システムコンポーネント (30%)
├── システムプロンプト: 1.4%
├── ツール定義: 9.7%
└── Auto Compactバッファ: 22.5%

ユーザー利用可能 (70%)
└── 実際の開発作業に使用
```

### 最適化テクニック

**1. 常駐要素の最小化**
- CLAUDE.mdは簡潔に（40k文字超で警告）
- 不要なMCPサーバーを避ける
- Agent Skillsを活用（メタデータのみ保存）

**2. コンテキスト消費の制御**
- IDE統合に注意（開いたファイルは自動送信 ~2,000トークン/ファイル）
- 無関係なファイルが開いている場合は`/ide`接続を無効化
- settings.local.jsonで制限的な権限ルールを設定

**3. 効率的な機能の活用**
- Agent Skills: 最小フットプリント
- Hooks: コンテキスト不要
- カスタムスラッシュコマンド: MCPより少ないコンテキスト

---

## 11. ヘッドレスモード

`-p`フラグでプロンプト指定による自動化：

```bash
# 単一コマンド
claude -p "lintエラーを修正してください"

# パイプライン
echo "テストを追加" | claude -p -
```

---

## 12. 実践的なワークフロー例

### PR作成の完全フロー

```bash
# 1. 新しいworktreeを作成
git worktree add ../feature-x feature-branch

# 2. Plan modeで計画
claude
# (Shift+Tab ×2 でPlan modeに入る)
# "この機能を実装する計画を立てて"

# 3. 計画に満足したら自動承認モードへ
# (auto-accept edits modeに切り替え)

# 4. 実装完了後、検証
/test-and-fix

# 5. コミットからPR作成まで
/commit-push-pr
```

---

## まとめ: Boris Cherny式チェックリスト

### セットアップ
- [ ] Opus 4.5 + thinkingを使用
- [ ] CLAUDE.mdをgitにチェックイン
- [ ] 主要コマンドをスラッシュコマンド化
- [ ] サブエージェントで品質ゲート構築

### 日常のワークフロー
- [ ] Plan modeで計画を立ててから実装
- [ ] 検証ループを必ず含める
- [ ] 失敗したらCLAUDE.mdに追記
- [ ] 並列セッションで効率化

### 最適化
- [ ] コンテキストウィンドウの使用状況を監視
- [ ] CLAUDE.mdは簡潔に維持
- [ ] 不要なMCPサーバーを削除
- [ ] Hooksで自動化

---

*最終更新: 2026-01-14*
*情報源: Boris Cherny氏のX投稿、InfoQ、VentureBeat、gihyo.jp、Zenn*
