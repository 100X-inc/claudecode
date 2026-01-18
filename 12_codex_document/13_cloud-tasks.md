---
name: cloud-tasks
description: Codex Cloudによるリモートタスク実行
---

# Codex Cloud 完全ガイド

Codex Cloudは、クラウド環境でCodexタスクを実行するサービスです。

## 目次

1. [概要](#概要)
2. [基本的な使用方法](#基本的な使用方法)
3. [環境設定](#環境設定)
4. [タスク管理](#タスク管理)
5. [結果の取得](#結果の取得)
6. [ユースケース](#ユースケース)
7. [注意事項](#注意事項)

---

## 概要

### Codex Cloudとは

- クラウド上でCodexタスクを実行
- ローカルマシンのリソースを使わない
- 複数の試行（Best-of-N）サポート
- CLIから直接操作可能

### 特徴

| 特徴 | 説明 |
|------|------|
| **リモート実行** | クラウドでタスク実行 |
| **複数試行** | 最大4回の試行で最良の結果 |
| **環境選択** | 異なる実行環境を選択 |
| **差分適用** | 結果をローカルに適用 |

### 前提条件

- ChatGPT Plus/Pro/Business/Enterprise プラン
- Codex CLIがインストール済み
- 認証済み（`codex login`）

---

## 基本的な使用方法

### タスクの起動

```bash
# 基本形式
codex cloud --env <ENVIRONMENT> "TASK DESCRIPTION"

# 例
codex cloud --env my-project "Fix all TypeScript errors"
```

### オプション

| オプション | 説明 |
|-----------|------|
| `--env` | 実行環境（必須） |
| `--attempts` | 試行回数（1-4） |

### 複数試行

```bash
# 4回試行して最良の結果を選択
codex cloud --env my-project --attempts 4 "Implement login feature"
```

---

## 環境設定

### 環境とは

Codex Cloudでは、タスクを実行する環境を指定します。環境には以下が含まれます:

- リポジトリ設定
- 依存関係
- シークレット
- ランタイム設定

### 環境の指定

```bash
codex cloud --env production "Deploy hotfix"
codex cloud --env staging "Run integration tests"
codex cloud --env development "Add new feature"
```

### 環境の管理

環境の作成・管理は Codex Cloud ダッシュボード（Web UI）で行います。

---

## タスク管理

### タスクの確認

```bash
# タスク一覧
codex cloud list

# タスク詳細
codex cloud status <TASK_ID>
```

### タスクのキャンセル

```bash
codex cloud cancel <TASK_ID>
```

### TUIでの操作

```
# Codex CLI 内で
/cloud
```

対話形式でタスク管理。

---

## 結果の取得

### 差分の適用

```bash
# タスク結果をローカルに適用
codex apply <TASK_ID>
```

### 差分の確認

```bash
# 適用前に差分を確認
codex apply --dry-run <TASK_ID>
```

### 結果のダウンロード

タスク完了後、生成されたファイルや差分をローカルリポジトリに適用。

---

## ユースケース

### 大規模リファクタリング

```bash
# 時間のかかるリファクタリングをクラウドで実行
codex cloud --env main --attempts 2 \
  "Refactor all API endpoints to use async/await"
```

### 複数アプローチの比較

```bash
# 4つの異なるアプローチを試行
codex cloud --env feature-branch --attempts 4 \
  "Implement caching for the user service"
```

### CI/CD統合

```yaml
# GitHub Actions での使用例
- name: Run Codex Cloud Task
  run: |
    codex cloud --env ${{ github.head_ref }} \
      "Fix failing tests and update documentation"
```

### 長時間タスク

```bash
# ローカルマシンを解放して長時間タスクを実行
codex cloud --env main \
  "Analyze entire codebase for security vulnerabilities"
```

---

## 注意事項

### 利用制限

- プランによって利用制限あり
- 同時実行数に制限あり
- 環境数に制限あり

### セキュリティ

- シークレットは環境設定で管理
- ソースコードはクラウドにアップロードされる
- 機密データの取り扱いに注意

### コスト

- タスクの実行時間に応じた課金
- 複数試行は試行数分のコスト
- プランの上限を確認

---

## トラブルシューティング

### 認証エラー

```bash
# 再ログイン
codex logout
codex login
```

### 環境が見つからない

```bash
# 利用可能な環境を確認
codex cloud environments

# 環境設定はWebダッシュボードで
```

### タスクが失敗

```bash
# ログを確認
codex cloud logs <TASK_ID>

# より単純なタスクに分割して再試行
```

---

## Claude Codeとの比較

| 機能 | Claude Code | Codex |
|------|-------------|-------|
| クラウド実行 | なし | Codex Cloud |
| 複数試行 | なし | --attempts |
| 環境選択 | なし | --env |
| 差分適用 | なし | codex apply |

---

## 関連ドキュメント

- [01_overview.md](01_overview.md) - 全機能の概要
- [09_exec-mode.md](09_exec-mode.md) - Exec Mode
- [Codex Cloud Documentation](https://developers.openai.com/codex/cloud/) - 公式ドキュメント
