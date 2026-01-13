# Claude Code セキュアBash設定（Windows版）

`--dangerously-skip-permissions` を安全に使うための設定ガイド。

## 一発セットアップ（推奨）

PowerShellを開いて実行：

```powershell
# セットアップスクリプトを実行（フルパス）
& "C:\ai_programming\claudecode\setup-claude-secure-bash.ps1"
```

または：

```powershell
# ディレクトリ移動してから実行
cd C:\ai_programming\claudecode
.\setup-claude-secure-bash.ps1
```

これだけで完了！

---

## 手動セットアップ

### 必要なもの

- Git for Windows（Git Bash含む）
- jq（JSONパーサー）

### Step 1: jqインストール

```powershell
# wingetの場合
winget install jqlang.jq

# Chocolateyの場合
choco install jq
```

### Step 2: フォルダ作成

```powershell
New-Item -ItemType Directory -Force -Path "$env:USERPROFILE\.claude\scripts"
```

### Step 3: settings.json 作成

以下を `C:\Users\あなたのユーザー名\.claude\settings.json` に保存：

```json
{
  "permissions": {
    "deny": [
      "Bash(git config *)",
      "Bash(rm -rf /*)",
      "Bash(rm -rf C:/*)",
      "Bash(del /s /q *)",
      "Bash(rmdir /s /q *)",
      "Bash(npm install -g *)",
      "Bash(gh repo delete:*)",
      "Bash(git push --force *)",
      "Bash(git push -f *)",
      "Bash(git reset --hard *)"
    ]
  },
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "C:\\Program Files\\Git\\bin\\bash.exe",
            "args": ["-c", "~/.claude/scripts/deny-check.sh"]
          }
        ]
      }
    ]
  }
}
```

### Step 4: deny-check.sh 作成

以下を `C:\Users\あなたのユーザー名\.claude\scripts\deny-check.sh` に保存：

> **重要**: 改行コードは **LF** で保存すること（VSCodeなら右下で変更可能）

```bash
#!/bin/bash

input=$(cat)
command=$(echo "$input" | jq -r '.tool_input.command' 2>/dev/null || echo "")
tool_name=$(echo "$input" | jq -r '.tool_name' 2>/dev/null || echo "")

if [ "$tool_name" != "Bash" ]; then
  exit 0
fi

settings_file="$HOME/.claude/settings.json"
deny_patterns=$(jq -r '.permissions.deny[]' "$settings_file" 2>/dev/null | grep "^Bash(" | sed 's/^Bash(//;s/)$//')

matches_deny_pattern() {
  local cmd="$1"
  local pattern="$2"
  cmd="${cmd#"${cmd%%[![:space:]]*}"}"
  cmd="${cmd%"${cmd##*[![:space:]]}"}"
  [[ "$cmd" == $pattern ]]
}

while IFS= read -r pattern; do
  [ -z "$pattern" ] && continue
  if matches_deny_pattern "$command" "$pattern"; then
    echo "Error: コマンドが拒否されました: '$command' (パターン: '$pattern')" >&2
    exit 2
  fi
done <<<"$deny_patterns"

temp_command="${command//;/$'\n'}"
temp_command="${temp_command//&&/$'\n'}"
temp_command="${temp_command//\|\|/$'\n'}"

IFS=$'\n'
for cmd_part in $temp_command; do
  [ -z "$(echo "$cmd_part" | tr -d '[:space:]')" ] && continue
  while IFS= read -r pattern; do
    [ -z "$pattern" ] && continue
    if matches_deny_pattern "$cmd_part" "$pattern"; then
      echo "Error: コマンドが拒否されました: '$cmd_part' (パターン: '$pattern')" >&2
      exit 2
    fi
  done <<<"$deny_patterns"
done

exit 0
```

### Step 5: 実行権限付与

Git Bashを開いて：

```bash
chmod +x ~/.claude/scripts/deny-check.sh
```

---

## 動作確認

Git Bashで実行：

```bash
echo '{"tool_name":"Bash","tool_input":{"command":"git config user.name test"}}' | ~/.claude/scripts/deny-check.sh
```

↓ こう表示されれば成功：

```
Error: コマンドが拒否されました: 'git config user.name test' (パターン: 'git config *')
```

---

## 使い方

```powershell
claude --dangerously-skip-permissions
```

危険なコマンドは自動でブロックされます：

```
● Bash(git config user.name "test")
└ Error: Bash operation blocked by hook:
  - Error: コマンドが拒否されました: 'git config user.name "test"' (パターン: 'git config *')
```

---

## ブロック対象のカスタマイズ

`settings.json` の `permissions.deny` 配列を編集：

```json
"deny": [
  "Bash(危険なコマンド *)",
  "Bash(別の危険コマンド *)"
]
```

### よく使うパターン例

**重要**: プレフィックスマッチには `:*` を使用（スペース+`*`はエラー）

| パターン | ブロック対象 |
|---------|-------------|
| `Bash(git config:*)` | git設定変更（git config で始まる全て） |
| `Bash(rm -rf /)` | ルート削除（完全一致） |
| `Bash(del /s /q:*)` | Windows再帰削除 |
| `Bash(npm install -g:*)` | グローバルnpm |
| `Bash(git push --force:*)` | 強制プッシュ |
| `Bash(git:*)` | gitコマンド全て |

---

## トラブルシューティング

### スクリプトが動かない

1. **改行コードを確認**: LFになっているか（CRLFだとエラー）
2. **jqがあるか確認**: `jq --version`
3. **パスを確認**: `ls ~/.claude/scripts/deny-check.sh`

### 改行コードの変換

```bash
# Git Bashで実行
sed -i 's/\r$//' ~/.claude/scripts/deny-check.sh
```

### 設定が反映されない

Claude Codeを再起動してください。
