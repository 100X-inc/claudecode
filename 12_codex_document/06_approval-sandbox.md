---
name: approval-sandbox
description: Codex CLIのApproval PolicyとSandbox Modeによるセキュリティ制御
---

# Approval Policy & Sandbox Mode 完全ガイド

Codex CLIは、2層のセキュリティ制御を提供します：Sandbox Mode（技術的制限）とApproval Policy（承認制御）。

## 目次

1. [概要](#概要)
2. [Sandbox Mode](#sandbox-mode)
3. [Approval Policy](#approval-policy)
4. [組み合わせパターン](#組み合わせパターン)
5. [ネットワークアクセス](#ネットワークアクセス)
6. [CLIオプション](#cliオプション)
7. [設定方法](#設定方法)
8. [Exec Policy](#exec-policy)
9. [エンタープライズ制御](#エンタープライズ制御)
10. [ベストプラクティス](#ベストプラクティス)

---

## 概要

### 2層のセキュリティ

| レイヤー | 役割 | 制御対象 |
|---------|------|---------|
| **Sandbox Mode** | 技術的制限 | ファイルアクセス、ネットワーク、コマンド実行 |
| **Approval Policy** | 承認制御 | いつユーザーに確認するか |

### セキュリティモデル

```
ユーザー入力
    ↓
Codex がコマンド生成
    ↓
┌─────────────────────────────┐
│     Approval Policy         │  ← いつ確認するか
│  (on-request, never, etc.)  │
└─────────────────────────────┘
    ↓ 承認後
┌─────────────────────────────┐
│       Sandbox Mode          │  ← 何ができるか
│  (read-only, workspace-write, etc.)
└─────────────────────────────┘
    ↓
コマンド実行
```

---

## Sandbox Mode

### 利用可能なモード

| モード | ファイル読取 | ファイル書込 | コマンド実行 | ネットワーク |
|--------|------------|------------|------------|------------|
| `read-only` | ワークスペース | ✗ | ✗ | ✗ |
| `workspace-write` | ワークスペース | ワークスペース | ✓ | デフォルト ✗ |
| `danger-full-access` | 全て | 全て | ✓ | ✓ |

### read-only

**最も制限的**なモード。

```toml
# ~/.codex/config.toml
sandbox_mode = "read-only"
```

- ファイルの閲覧のみ可能
- 編集・コマンド実行不可
- コードレビュー、分析に最適

**ユースケース**:
- 初めてのプロジェクト探索
- セキュリティ監査
- 信頼できないコードベースの分析

### workspace-write（デフォルト）

**推奨**モード。バランスの取れた設定。

```toml
# ~/.codex/config.toml
sandbox_mode = "workspace-write"
```

- ワークスペース内でファイル読み書き可能
- コマンド実行可能
- ワークスペース外への書き込みは承認必要
- ネットワークはデフォルト無効

**ユースケース**:
- 日常の開発作業
- コード編集・テスト実行
- ほとんどのシナリオ

### danger-full-access

**最も緩い**モード。**非推奨**。

```toml
# ~/.codex/config.toml
sandbox_mode = "danger-full-access"
```

- 全ファイルへのアクセス
- 全コマンド実行可能
- ネットワークアクセス可能

**ユースケース**:
- システム全体の設定変更が必要な場合
- 専用のサンドボックスVM内でのみ

### プラットフォーム実装

| OS | 実装技術 |
|----|---------|
| macOS | Seatbelt (`sandbox-exec`) |
| Linux | Landlock + seccomp |
| Windows (WSL) | Linux サンドボックス継承 |
| Windows (Native) | 実験的（トークン制限） |

---

## Approval Policy

### 利用可能なポリシー

| ポリシー | 承認タイミング |
|---------|--------------|
| `untrusted` | 不審なコマンドパターン時のみ |
| `on-failure` | 実行エラー検出後 |
| `on-request` | ワークスペース外、ネットワーク、信頼されないコマンド時 |
| `never` | 承認なし（自動実行） |

### untrusted

```toml
approval_policy = "untrusted"
```

- 不審なコマンドパターンを検出時に承認要求
- 一般的なコマンドは自動実行
- セキュリティと利便性のバランス

### on-failure

```toml
approval_policy = "on-failure"
```

- エラー発生時に承認要求
- 成功するコマンドは自動実行
- デバッグ・リカバリー向け

### on-request（デフォルト）

```toml
approval_policy = "on-request"
```

- ワークスペース外への書き込み時
- ネットワークアクセス時
- 信頼されないコマンド時

### never

```toml
approval_policy = "never"
```

- すべて自動実行
- 承認プロンプトなし
- CI/CD、自動化向け

---

## 組み合わせパターン

### 推奨組み合わせ

| シナリオ | Sandbox | Approval | 説明 |
|---------|---------|----------|------|
| **初心者・探索** | `read-only` | `on-request` | 最大の安全性 |
| **日常開発** | `workspace-write` | `on-request` | バランス（デフォルト） |
| **熟練者** | `workspace-write` | `untrusted` | 効率重視 |
| **CI/CD** | `workspace-write` | `never` | 自動化 |
| **フルコントロール** | `danger-full-access` | `untrusted` | 要注意 |

### よく使う設定例

**安全な開発（デフォルト）**:
```toml
sandbox_mode = "workspace-write"
approval_policy = "on-request"
```

**効率重視の開発**:
```toml
sandbox_mode = "workspace-write"
approval_policy = "untrusted"
```

**自動化・CI向け**:
```toml
sandbox_mode = "workspace-write"
approval_policy = "never"
```

**フルアクセス（慎重に）**:
```toml
sandbox_mode = "danger-full-access"
approval_policy = "untrusted"
```

---

## ネットワークアクセス

### デフォルト動作

- `workspace-write` モードではネットワーク**無効**
- Web検索は別オプション（`--search`）

### ネットワーク有効化

```toml
# ~/.codex/config.toml

[sandbox_workspace_write]
network_access = true
```

または CLI:
```bash
codex --config sandbox_workspace_write.network_access=true
```

### Web検索のみ有効化

ネットワーク全体ではなく、Web検索のみ:

```toml
[features]
web_search_request = true
```

または:
```bash
codex --search
```

---

## CLIオプション

### 基本オプション

| オプション | 説明 |
|-----------|------|
| `--sandbox, -s <MODE>` | サンドボックスモード指定 |
| `--ask-for-approval, -a <POLICY>` | 承認ポリシー指定 |

### 値

**--sandbox**:
- `read-only`
- `workspace-write`
- `danger-full-access`

**--ask-for-approval**:
- `untrusted`
- `on-failure`
- `on-request`
- `never`

### ショートカット

| オプション | 展開 |
|-----------|------|
| `--full-auto` | `--sandbox workspace-write --ask-for-approval on-request` |
| `--yolo` | `--dangerously-bypass-approvals-and-sandbox` |

### 追加ディレクトリ

```bash
# ワークスペース外のディレクトリに書き込み権限を追加
codex --add-dir /path/to/other/dir
```

`danger-full-access` より安全に追加ディレクトリを許可。

### 使用例

```bash
# 読み取り専用でコードレビュー
codex --sandbox read-only "Review this codebase for security issues"

# 効率的な開発作業
codex --full-auto

# CI/CD での自動実行
codex exec --sandbox workspace-write --ask-for-approval never "Run tests and fix failures"

# 追加ディレクトリを許可
codex --add-dir /shared/config --full-auto
```

---

## 設定方法

### config.toml

```toml
# ~/.codex/config.toml

# 基本設定
sandbox_mode = "workspace-write"
approval_policy = "on-request"

# ネットワーク設定
[sandbox_workspace_write]
network_access = false

# 書き込み可能ディレクトリの追加
writable_roots = ["/tmp", "/var/log/myapp"]
```

### セッション中の変更

```
# /approvals コマンドで対話的に変更
/approvals
```

### 優先順位

```
1. マネージド設定（MDM）       ← 最優先
2. /etc/codex/managed_config.toml
3. ~/.codex/config.toml
4. CLI フラグ
```

---

## Exec Policy

### 概要

Exec Policy（実行ポリシー）は、コマンド実行前にルールベースでチェックを行う機能。

### ルールファイル

```toml
# ~/.codex/rules/safety.toml

[[rules]]
pattern = "rm -rf /*"
action = "deny"
message = "Dangerous recursive deletion blocked"

[[rules]]
pattern = "npm install *"
action = "allow"

[[rules]]
pattern = "curl *"
action = "ask"
message = "Network request detected"
```

### 有効化

```toml
# ~/.codex/config.toml
[features]
exec_policy = true
```

### チェック

```bash
# ルールファイルの検証
codex execpolicy check --rules ~/.codex/rules/safety.toml "rm -rf /tmp"
codex execpolicy check --rules ~/.codex/rules/safety.toml --pretty "npm install express"
```

---

## エンタープライズ制御

### マネージド設定

システム管理者が制御可能:

```toml
# /etc/codex/managed_config.toml
sandbox_mode = "workspace-write"
approval_policy = "on-request"
```

### 要件ファイル

オーバーライド不可の制限:

```toml
# /etc/codex/requirements.toml
allowed_approval_policies = ["on-request", "untrusted"]
allowed_sandbox_modes = ["read-only", "workspace-write"]
# danger-full-access を禁止
```

### MDM対応（macOS）

macOS MDM を通じた設定配布:
- 設定プロファイルで強制
- ユーザーによる変更を防止

---

## ベストプラクティス

### 1. デフォルトを維持

```toml
# ほとんどのケースで十分
sandbox_mode = "workspace-write"
approval_policy = "on-request"
```

### 2. --add-dir を活用

```bash
# danger-full-access の代わりに
codex --add-dir /path/to/needed/dir
```

### 3. 段階的エスカレーション

```
read-only → workspace-write → workspace-write + add-dir → danger-full-access
```

必要な場合のみ権限を拡大。

### 4. CI/CD での安全な設定

```yaml
# GitHub Actions
- uses: openai/codex-action@v1
  with:
    sandbox: workspace-write
    # never は必要な場合のみ
```

### 5. --yolo を避ける

```bash
# 避けるべき
codex --yolo

# 代わりに明示的な設定
codex --sandbox workspace-write --ask-for-approval never
```

### 6. ネットワークは必要な時だけ

```toml
# デフォルトは無効のまま
# 必要な時だけ --search を使用
```

---

## トラブルシューティング

### 承認プロンプトが多すぎる

```toml
# approval_policy を緩和
approval_policy = "untrusted"  # on-request から変更
```

### ファイルに書き込めない

```bash
# 1. サンドボックスモード確認
codex
> /status

# 2. ワークスペース外なら --add-dir
codex --add-dir /path/to/dir

# 3. または一時的に緩和
codex --sandbox danger-full-access  # 注意して使用
```

### ネットワークアクセスできない

```toml
# config.toml
[sandbox_workspace_write]
network_access = true
```

### Windows でサンドボックスが効かない

```bash
# WSL を使用するか、実験的ネイティブサンドボックスを有効化
[features]
elevated_windows_sandbox = true
# または
experimental_windows_sandbox = true
```

---

## Claude Codeとの比較

| 機能 | Claude Code | Codex |
|------|-------------|-------|
| **サンドボックス** | OS依存 | OS強制（Seatbelt/Landlock） |
| **承認制御** | Permissions | Approval Policy |
| **ネットワーク制御** | なし | sandbox設定で制御 |
| **追加ディレクトリ** | なし | `--add-dir` |
| **Exec Policy** | なし | ルールベースチェック |

---

## 関連ドキュメント

- [01_overview.md](01_overview.md) - 全機能の概要
- [07_configuration.md](07_configuration.md) - config.toml設定詳細
- [09_exec-mode.md](09_exec-mode.md) - Exec Mode
- [Codex Security Documentation](https://developers.openai.com/codex/security/) - 公式ドキュメント
