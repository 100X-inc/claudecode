---
name: windows-tips
description: Windows環境でのCodex CLI使用における注意点とTips
---

# Windows環境 Tips

Windows環境でCodex CLIを使用する際の注意点とベストプラクティスをまとめます。

## 目次

1. [概要](#概要)
2. [インストール](#インストール)
3. [サンドボックス](#サンドボックス)
4. [パス形式](#パス形式)
5. [MCP設定](#mcp設定)
6. [シェル環境](#シェル環境)
7. [既知の制限](#既知の制限)
8. [トラブルシューティング](#トラブルシューティング)

---

## 概要

### Windows サポート状況

| 環境 | サポート | 備考 |
|------|---------|------|
| Windows Native | 実験的 | サンドボックスが限定的 |
| WSL2 | 推奨 | Linux版として動作 |
| Git Bash | 部分的 | 一部機能に制限 |

### デフォルトモデル

- **Windows**: `gpt-5`（`gpt-5-codex` ではない）
- **macOS/Linux**: `gpt-5-codex`

```toml
# Windows でも gpt-5-codex を使用したい場合
model = "gpt-5-codex"
```

---

## インストール

### npm

```bash
npm install -g @openai/codex
```

### Winget

```bash
winget install OpenAI.Codex
```

### 確認

```bash
codex --version
```

---

## サンドボックス

### Windowsのサンドボックス制限

Windows Nativeでは、macOS/Linuxのような強力なサンドボックス（Seatbelt/Landlock）が利用できません。

### 利用可能なオプション

```toml
# ~/.codex/config.toml

[features]
# 強化Windowsサンドボックス
elevated_windows_sandbox = true

# 実験的サンドボックス（トークン制限）
experimental_windows_sandbox = true
```

### GitHub Actions での設定

```yaml
- uses: openai/codex-action@v1
  with:
    # Windows では unsafe が必要
    safety-strategy: unsafe
    # サンドボックスで制限
    sandbox: read-only
```

### 推奨: WSL2 の使用

```bash
# WSL2 内で Codex を使用
wsl -d Ubuntu

# Linux サンドボックスが利用可能
codex --sandbox workspace-write
```

---

## パス形式

### ファイルパス

Windows では以下のパス形式に注意:

```bash
# Windows形式
C:\Users\name\project

# Unix形式（Git Bash等）
/c/Users/name/project

# Codex は内部で適切に変換
```

### config.toml でのパス

```toml
# Windows 形式（バックスラッシュはエスケープ）
codex_home = "C:\\Users\\name\\.codex"

# または Unix 形式
codex_home = "C:/Users/name/.codex"
```

### 環境変数

```bash
# PowerShell
$env:CODEX_HOME = "C:\Users\name\.codex"

# Git Bash
export CODEX_HOME="/c/Users/name/.codex"
```

---

## MCP設定

### Windows での MCP サーバー設定

```toml
# ~/.codex/config.toml

[mcp_servers.my-server]
# Windows では cmd /c ラッパーが必要な場合がある
command = "cmd"
args = ["/c", "npx", "-y", "@my/mcp-server"]

# または直接 npx（Node.js がパスに通っている場合）
# command = "npx"
# args = ["-y", "@my/mcp-server"]
```

### PowerShell スクリプトの実行

```toml
[mcp_servers.ps-server]
command = "powershell"
args = ["-ExecutionPolicy", "Bypass", "-File", "C:/path/to/server.ps1"]
```

### WSL 経由での MCP サーバー

```toml
[mcp_servers.wsl-server]
command = "wsl"
args = ["npx", "-y", "@my/mcp-server"]
```

---

## シェル環境

### PowerShell 補完

```bash
# PowerShell に補完を追加
codex completion power-shell | Out-File -Encoding UTF8 $PROFILE

# 反映
. $PROFILE
```

### Git Bash での使用

```bash
# Git Bash では基本的に動作するが一部制限あり
codex

# 補完
codex completion bash >> ~/.bashrc
```

### WSL での使用（推奨）

```bash
# WSL 内で直接インストール
npm install -g @openai/codex

# Linux として完全サポート
codex
```

---

## 既知の制限

### サンドボックス

| 機能 | macOS/Linux | Windows |
|------|------------|---------|
| Seatbelt/Landlock | ✓ | ✗ |
| ネットワーク制限 | ✓ | 限定的 |
| ファイルシステム制限 | ✓ | 限定的 |

### ターミナル

| 機能 | macOS/Linux | Windows |
|------|------------|---------|
| TUI 完全サポート | ✓ | ✓ |
| カラー出力 | ✓ | 要設定 |
| Unicode | ✓ | 要設定 |

### モデル

| デフォルト | macOS/Linux | Windows |
|-----------|------------|---------|
| モデル | gpt-5-codex | gpt-5 |

---

## トラブルシューティング

### npm install エラー

```bash
# 管理者権限で実行
# PowerShell（管理者）
npm install -g @openai/codex

# または npx で直接実行
npx @openai/codex
```

### パーミッションエラー

```bash
# 実行ポリシーを確認
Get-ExecutionPolicy

# 必要に応じて変更（管理者権限）
Set-ExecutionPolicy RemoteSigned
```

### 文字化け

```bash
# PowerShell で UTF-8 を設定
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$env:PYTHONIOENCODING = "utf-8"

# または chcp で変更
chcp 65001
```

### MCP サーバーが起動しない

```toml
# cmd /c ラッパーを使用
[mcp_servers.server]
command = "cmd"
args = ["/c", "npx", "-y", "@my/server"]

# 起動タイムアウトを延長
startup_timeout_sec = 30
```

### Codex が遅い

```bash
# WSL2 を使用（推奨）
wsl -d Ubuntu
npm install -g @openai/codex
codex
```

### Git Bash でコマンドが見つからない

```bash
# Node.js/npm がパスに通っているか確認
which npm
which node

# 必要に応じてパスを追加
export PATH=$PATH:"/c/Program Files/nodejs"
```

---

## ベストプラクティス

### 1. WSL2 を使用

Windows での最良の体験には WSL2 を推奨:

```bash
# WSL2 インストール
wsl --install -d Ubuntu

# Codex をインストール
npm install -g @openai/codex
```

### 2. 適切なターミナルを選択

| ターミナル | 推奨度 | 備考 |
|-----------|-------|------|
| Windows Terminal + WSL | ★★★ | 最良 |
| Windows Terminal + PowerShell | ★★☆ | 可 |
| Git Bash | ★★☆ | 可 |
| cmd.exe | ★☆☆ | 非推奨 |

### 3. 設定ファイルの場所

```
Windows Native:
C:\Users\<username>\.codex\config.toml

WSL:
/home/<username>/.codex/config.toml
または
~/.codex/config.toml
```

### 4. 環境変数の設定

```powershell
# PowerShell で永続化
[Environment]::SetEnvironmentVariable("OPENAI_API_KEY", "sk-xxx", "User")
```

```bash
# WSL/.bashrc
echo 'export OPENAI_API_KEY="sk-xxx"' >> ~/.bashrc
```

---

## Claude Codeとの比較

| 項目 | Claude Code | Codex |
|------|-------------|-------|
| Windows サポート | ✓ | 実験的 |
| WSL サポート | ✓ | 推奨 |
| デフォルトモデル | 同一 | Windows で異なる |
| サンドボックス | OS依存 | Windows で制限 |

---

## 関連ドキュメント

- [01_overview.md](01_overview.md) - 全機能の概要
- [06_approval-sandbox.md](06_approval-sandbox.md) - サンドボックス詳細
- [07_configuration.md](07_configuration.md) - 設定詳細
- [08_mcp.md](08_mcp.md) - MCP設定
