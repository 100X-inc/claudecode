---
name: agent-best-practices
description: Anthropic公式のエージェント開発ベストプラクティス
---

# Anthropic公式: エージェント開発ベストプラクティス

Anthropic公式ドキュメントから抽出したエージェント開発のベストプラクティス。

## 目次

1. [基本原則](#1-基本原則)
2. [ワークフローパターン](#2-ワークフローパターン)
3. [Multi-Agent Orchestration](#3-multi-agent-orchestration)
4. [ツール設計](#4-ツール設計)
5. [コンテキスト管理](#5-コンテキスト管理)
6. [長時間実行エージェント](#6-長時間実行エージェント)
7. [安全性の原則](#7-安全性の原則)
8. [実践的ワークフロー](#8-実践的ワークフロー)
9. [公式リソース](#9-公式リソース)

---

## 1. 基本原則

### シンプルさを優先

> "可能な限りシンプルな解決策を見つけ、必要な場合にのみ複雑さを増す"

**推奨アプローチ:**
1. まずLLM APIを直接使用
2. フレームワークを使う場合は基盤コードを理解
3. 複雑さは性能向上が実証された場合にのみ追加

### ワークフロー vs エージェント

| 種類 | 定義 | 適用場面 |
|------|------|---------|
| **ワークフロー** | 事前定義されたコードパスで連携 | 予測可能なタスク |
| **エージェント** | LLMが動的にプロセスを制御 | オープンエンドな問題 |

---

## 2. ワークフローパターン

### 2.1 プロンプトチェーン

タスクを逐次ステップに分解。精度重視。

```
[入力] → [LLM 1] → [LLM 2] → [出力]
```

### 2.2 ルーティング

入力を分類し専門ハンドラに振り分け。

```
[入力] → [分類器] → [ハンドラA/B]
```

### 2.3 並列化

独立サブタスクを並列実行、または投票で信頼性向上。

```
     ┌→ [LLM A] ─┐
[入力] ─┼→ [LLM B] ──┼→ [統合]
     └→ [LLM C] ─┘
```

### 2.4 オーケストレータ-ワーカー

中央LLMがタスクを動的分解、ワーカーに委任。

### 2.5 評価者-最適化

生成LLMと評価LLMのフィードバックループ。

---

## 3. Multi-Agent Orchestration

複数のエージェントを協調させて複雑なタスクを解決するパターン。

### 3.1 Conductor パターン

「指揮者」が複雑さを吸収し、専門エージェントに委譲:

```
                    ┌─────────────┐
                    │  Conductor  │
                    │  (指揮者)    │
                    └──────┬──────┘
           ┌───────────────┼───────────────┐
           ▼               ▼               ▼
    ┌────────────┐  ┌────────────┐  ┌────────────┐
    │ Code Agent │  │ Test Agent │  │ Doc Agent  │
    └────────────┘  └────────────┘  └────────────┘
```

**適用例:** 複雑なリファクタリング、大規模コードレビュー

### 3.2 Fan-Out / Map-Reduce

入力を複数エージェントに分散し、結果をマージ:

```
入力 → [Agent1, Agent2, Agent3] → 結果マージ → 出力
```

**適用例:** 大規模コードベースの並列分析、複数ファイルの同時処理

### 3.3 Pipeline パターン

エージェントを直列に連結:

```
入力 → Agent1 → Agent2 → Agent3 → 出力
```

**適用例:** コード生成 → レビュー → テスト → ドキュメント

### 3.4 Git Worktree 隔離

複数エージェントが同時にコードを変更する際、Git worktreeで隔離:

```bash
# メインブランチから分岐
git worktree add ../agent1-workspace feature-1
git worktree add ../agent2-workspace feature-2

# 各ワークスペースで独立して作業
# 完了後にマージ
```

### 3.5 共有計画ドキュメント

複数エージェント間の通信ハブとして `PLAN.md` を使用:

```markdown
# PLAN.md

## Current Status
- Agent1: In Progress (authentication)
- Agent2: Completed (database schema)
- Agent3: Pending (API endpoints)

## Decisions
- Use JWT for auth
- PostgreSQL for persistence

## Blockers
- None
```

### 参考リソース

- ccswarm: https://github.com/wshobson/agents
- claude-flow: https://github.com/ruvnet/claude-flow

---

## 4. ツール設計

### 基本ルール

- 全APIをラップしない
- 高インパクトワークフローに集中した少数のツール
- 複数操作を統合可能

### 名前空間

```
# サービス別
asana_search, jira_search

# リソース別
asana_projects_search, asana_users_search
```

### レスポンス設計

| 悪い例 | 良い例 |
|--------|--------|
| UUID `a1b2c3...` | 意味のある名前 |
| 技術的ID | 自然言語の説明 |

### エラーメッセージ

```
# 悪い例
Error: 400 Bad Request

# 良い例
Error: Invalid date format. Expected YYYY-MM-DD.
Example: {"date": "2024-01-15"}
```

---

## 5. コンテキスト管理

### 原則

> "望む結果の可能性を最大化する、最小限の高信号トークンセット"

### 戦略

| 戦略 | 説明 |
|------|------|
| **コンパクション** | 履歴を要約（保持: 決定、バグ、詳細 / 破棄: 冗長出力） |
| **構造化ノート** | NOTES.mdで複雑タスクを追跡 |
| **サブエージェント** | クリーンなコンテキストで集中タスク |

### Few-Shot例

- エッジケース列挙より
- 期待される振る舞いを描写する多様で代表的な例

---

## 6. 長時間実行エージェント

### 課題

> "新しいセッションは以前の記憶なしに開始される"

### 解決策: 2パートアプローチ

**初期化エージェント（最初のセッション）:**
- `init.sh`セットアップ
- `claude-progress.txt`作成
- 機能リスト生成

**コーディングエージェント（後続セッション）:**
- 進捗ファイルとgitログを読む
- 説明的なコミット
- セッション終了前に進捗更新

### 失敗モード対策

| 問題 | 解決策 |
|------|--------|
| 早すぎる完了宣言 | 明示的な完了検証 |
| 中途半端な実装 | git + 進捗ファイル |
| 不完全なテスト | ブラウザ自動化でE2E検証 |

---

## 7. 安全性の原則

Anthropicの5原則:

### 7.1 人間の制御

- デフォルトで読み取り専用
- システム変更前に承認必須

### 7.2 行動の透明性

- 推論プロセスを説明
- To-Doチェックリストで計画表示

### 7.3 価値観の整合性

システムにとって合理的でも人間が望まないアクションを防止

### 7.4 プライバシー保護

部門間の不適切な情報転送を防止

### 7.5 セキュリティ強化

- プロンプトインジェクション検出
- 継続的な脅威モニタリング

---

## 8. 実践的ワークフロー

### 探索-計画-コード-コミット

1. **探索:** 関連ファイルを読む（コードを書かない）
2. **計画:** 詳細な実装計画を要求
3. **コード:** 定期的に検証しながら実装
4. **コミット:** ドキュメント更新

> ステップ1-2をスキップすると最適でない解決策に

### テスト駆動開発 (TDD)

```
1. 期待する入出力でテストを書く
2. テストが失敗することを確認
3. テストスイートをコミット
4. 全テスト通過までコーディング
5. 動作コードをコミット
```

### 拡張思考

思考の深さを制御:
```
"think" < "think hard" < "think harder" < "ultrathink"
```

---

## 9. 公式リソース

### ドキュメント

| リソース | URL |
|---------|-----|
| Building Effective Agents | https://www.anthropic.com/research/building-effective-agents |
| Claude Code Best Practices | https://www.anthropic.com/engineering/claude-code-best-practices |
| Writing Tools for Agents | https://www.anthropic.com/engineering/writing-tools-for-agents |
| Context Engineering | https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents |
| Long-Running Agents | https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents |
| Safe Agent Framework | https://www.anthropic.com/news/our-framework-for-developing-safe-and-trustworthy-agents |

### GitHub

| リソース | URL |
|---------|-----|
| Agent SDK (Python) | https://github.com/anthropics/claude-agent-sdk-python |
| Agent SDK (TypeScript) | https://github.com/anthropics/claude-agent-sdk-typescript |
| Anthropic Cookbook | https://github.com/anthropics/anthropic-cookbook/tree/main/patterns/agents |

### 詳細版

より詳細な情報: [20_Reference/anthropic-agent-best-practices.md](../20_Reference/anthropic-agent-best-practices.md)

---

## まとめ: 3つのコア原則

1. **シンプルさ:** エージェント設計を簡潔に
2. **透明性:** 計画ステップを明示的に表示
3. **ドキュメント:** ツール設計を丁寧に作り込む
