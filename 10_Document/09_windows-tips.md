---
name: windows-tips
description: Windows環境でのClaude Code利用ガイド
---

# Windows環境でのClaude Code利用ガイド

## BashツールとWindows環境の注意点

### 重要：Bashツールで使用できるコマンド

**Bashツールの実行環境:**
- Git Bash、WSL、またはその他のUnix系シェルを使用
- Windowsのコマンドプロンプト（CMD）コマンドは使用できない

### 間違った使い方（エラーになる）

```bash
# ❌ dir はWindows CMDコマンドなのでBashツールでは使えない
dir "c:\path" /b
# エラー: dir: cannot access '/b': No such file or directory
```

**原因:**
- `Bash`ツールはUnix系シェル（Git Bash/WSL）で実行される
- `dir`コマンドはWindows CMD専用コマンド
- Unix系シェルでは`/b`がファイルパスとして誤認識される

---

## 正しい使い方

### 1. Bashツール使用時（推奨）

```bash
# ディレクトリ一覧表示
ls -1 "/c/path/to/directory"
# または
ls "c:/path/to/directory"

# 詳細情報付き一覧
ls -la "/c/path"

# ファイル検索
find "/c/path" -name "*.md"

# ファイル内容表示（ただしReadツール推奨）
cat "c:/path/file.txt"
```

### 2. PowerShellツール使用時

```bash
powershell -Command "Get-ChildItem 'c:\path' | Select-Object Name"
powershell -Command "dir 'c:\path' /b"  # PowerShellのdirエイリアスは使える
```

### 3. Windows CMDコマンドを使いたい場合

```bash
cmd /c "dir c:\path /b"
```

---

## パス表記の違い

### Bashツール
- スラッシュ区切り: `c:/path/to/file`
- WSL形式: `/c/path/to/file` (推奨)
- バックスラッシュは使えない: `c:\path` → エラー

### PowerShell/CMD
- バックスラッシュ: `c:\path\to\file` (標準)
- スラッシュも可: `c:/path/to/file`

---

## コマンド対応表

| 操作 | Bashツール | PowerShellツール |
|------|------------|------------------|
| ディレクトリ一覧 | `ls -1 "/c/path"` | `powershell -Command "Get-ChildItem 'c:\path'"` |
| ファイル検索 | `find "/c/path" -name "*.md"` | `powershell -Command "Get-ChildItem 'c:\path' -Recurse -Filter *.md"` |
| ファイル内容 | `cat "/c/path/file.txt"` | `powershell -Command "Get-Content 'c:\path\file.txt'"` |
| テキスト検索 | `grep "pattern" "/c/path/file.txt"` | `powershell -Command "Select-String -Path 'c:\path\file.txt' -Pattern 'pattern'"` |

---

## 原則

1. **ファイル操作**: 専用ツール（Read, Write, Edit, Glob, Grep）を優先使用
2. **ディレクトリ一覧**:
   - Bashツール → `ls`
   - PowerShell → `Get-ChildItem`
3. **システムコマンド**: 実行環境（Bash/PowerShell）に応じたコマンドを選択
4. **パス記述**:
   - Bashツール → `/c/path/to/file` (スラッシュ区切り)
   - PowerShell → `c:\path\to\file` (バックスラッシュ可)

---

## よくあるエラーと解決方法

### エラー: `dir: cannot access '/b'`
- **原因**: BashツールでWindows `dir`コマンドを使用
- **解決**: `ls -1 "/c/path"` を使用

### エラー: `No such file or directory: c:\path`
- **原因**: Bashツールでバックスラッシュパスを使用
- **解決**: `c:/path` または `/c/path` に変更

### エラー: パス内のスペースでエラー
- **原因**: クォートが不足
- **解決**: `ls "/c/path with spaces"` のようにクォートで囲む

---

## MCP設定（Windows）

### テンプレート

```json
{
  "mcpServers": {
    "server-name": {
      "command": "cmd",
      "args": ["/c", "npx", "package-name"],
      "env": {
        "API_KEY": "${ENV_VARIABLE_NAME}"
      }
    }
  }
}
```

### 具体例

**Context7（ドキュメント検索MCP）:**
```json
{
  "mcpServers": {
    "context7": {
      "command": "cmd",
      "args": ["/c", "npx", "-y", "@anthropic/context7-mcp"]
    }
  }
}
```

**Filesystem（ファイル操作MCP）:**
```json
{
  "mcpServers": {
    "filesystem": {
      "command": "cmd",
      "args": ["/c", "npx", "-y", "@anthropic/mcp-filesystem", "C:/projects"]
    }
  }
}
```

**カスタム引数が多い場合（1つの文字列にまとめる）:**
```json
{
  "mcpServers": {
    "custom-server": {
      "command": "cmd",
      "args": ["/c", "npx -y @scope/package --port 3000 --verbose"]
    }
  }
}
```

### よくあるエラー

| エラー | 原因 | 解決 |
|--------|------|------|
| スキーマエラー | `servers`を使用 | `mcpServers`に変更 |
| ファイルが見つからない | 作業ディレクトリに`.mcp.json`がない | `/doctor`で表示されるパスに作成 |
| cmd /c wrapper警告 | Windowsで`npx`直接実行 | `"command": "cmd", "args": ["/c", "npx", ...]` |

### 診断

```bash
/doctor  # MCP設定の診断
```
