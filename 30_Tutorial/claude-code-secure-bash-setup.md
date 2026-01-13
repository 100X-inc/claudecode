# Claude Code セキュアBash設定ガイド（Windows版）

Claude Code の `--dangerously-skip-permissions` を使用する際に、hooks機能とスクリプトで安全性を確保する方法。

参考: https://wasabeef.jp/blog/claude-code-secure-bash

> **Note**: 元記事はMac/Linux向けです。このドキュメントはWindows環境向けに調整しています。

## 前提条件（Windows）

- **Git Bash** または **WSL** がインストールされていること
- **jq** がインストールされていること（後述）
- Claude CodeはGit Bash環境でbashスクリプトを実行可能

## 問題点

`--dangerously-skip-permissions` で権限チェックをスキップすると以下のリスクが生じる：

- システム設定を変更する `git config` コマンドの実行
- パッケージの自動インストール
- 権限変更や強制削除の実行
- GitHub API による破壊的操作

## 解決策の構成

1. `settings.json` で危険なコマンドパターンを定義
2. `hooks.PreToolUse` でBashコマンド実行前にチェック
3. `deny-check.sh` スクリプトでパターンマッチング

## 設定手順

### 1. ディレクトリ作成

**PowerShell:**
```powershell
New-Item -ItemType Directory -Force -Path "$env:USERPROFILE\.claude\scripts"
```

**Git Bash:**
```bash
mkdir -p ~/.claude/scripts
```

**コマンドプロンプト:**
```cmd
mkdir "%USERPROFILE%\.claude\scripts"
```

### 2. settings.json の設定

`%USERPROFILE%\.claude\settings.json`（例: `C:\Users\ユーザー名\.claude\settings.json`）を作成または編集：

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
      "Bash(gh repo delete:*)"
    ]
  },
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "bash",
            "args": ["%USERPROFILE%\\.claude\\scripts\\deny-check.sh"]
          }
        ]
      }
    ]
  }
}
```

> **Windows注意**: hookのcommandで`bash`を指定し、argsでスクリプトパスを渡す形式が必要な場合があります。
> 環境によっては以下の形式も試してください：
> ```json
> "command": "C:\\Program Files\\Git\\bin\\bash.exe",
> "args": ["-c", "~/.claude/scripts/deny-check.sh"]
> ```

**追加推奨のdenyパターン例（Windows向け）：**
```json
"Bash(git push --force *)",
"Bash(git push -f *)",
"Bash(git reset --hard *)",
"Bash(rm -rf ~/*)",
"Bash(del /f /s *)",
"Bash(format *)",
"Bash(reg delete *)",
"Bash(npm install -g *)",
"Bash(pip install *)"
```

### 3. deny-check.sh スクリプトの作成

`%USERPROFILE%\.claude\scripts\deny-check.sh` を作成：

> **重要**: Windowsでもbashスクリプトを使用します（Git Bash経由で実行されるため）

```bash
#!/bin/bash

# JSON 入力を読み取り、コマンドとツール名を抽出
input=$(cat)
command=$(echo "$input" | jq -r '.tool_input.command' 2>/dev/null || echo "")
tool_name=$(echo "$input" | jq -r '.tool_name' 2>/dev/null || echo "")

# Bash コマンドのみをチェック
if [ "$tool_name" != "Bash" ]; then
  exit 0
fi

# settings.json から拒否パターンを読み取り
settings_file="$HOME/.claude/settings.json"

# Bash コマンドの全拒否パターンを取得
deny_patterns=$(jq -r '.permissions.deny[]' "$settings_file" | select(startswith("Bash(")) | gsub("^Bash\\(|\\)$"; ""))

# コマンドが拒否パターンにマッチするかチェックする関数
matches_deny_pattern() {
  local cmd="$1"
  local pattern="$2"

  # 先頭・末尾の空白を削除
  cmd="${cmd#"${cmd%%[![:space:]]*}"}" # 先頭の空白を削除
  cmd="${cmd%"${cmd##*[![:space:]]}"}" # 末尾の空白を削除

  # glob パターンマッチング（ワイルドカード対応）
  [[ "$cmd" == $pattern ]]
}

# まずコマンド全体をチェック
while IFS= read -r pattern; do
  # 空行をスキップ
  [ -z "$pattern" ] && continue

  # コマンド全体がパターンにマッチするかチェック
  if matches_deny_pattern "$command" "$pattern"; then
    echo "Error: コマンドが拒否されました: '$command' (パターン: '$pattern')" >&2
    exit 2
  fi
done <<<"$deny_patterns"

# コマンドを論理演算子で分割し、各部分もチェック
# セミコロン、&& と || で分割（パイプ | と単一 & は分割しない）
temp_command="${command//;/$'\n'}"
temp_command="${temp_command//&&/$'\n'}"
temp_command="${temp_command//\|\|/$'\n'}"

IFS=$'\n'
for cmd_part in $temp_command; do
  # 空の部分をスキップ
  [ -z "$(echo "$cmd_part" | tr -d '[:space:]')" ] && continue

  # 各拒否パターンに対してチェック
  while IFS= read -r pattern; do
    # 空行をスキップ
    [ -z "$pattern" ] && continue

    # このコマンド部分がパターンにマッチするかチェック
    if matches_deny_pattern "$cmd_part" "$pattern"; then
      echo "Error: コマンドが拒否されました: '$cmd_part' (パターン: '$pattern')" >&2
      exit 2
    fi
  done <<<"$deny_patterns"
done

# コマンドを許可
exit 0
```

### 4. スクリプトに実行権限を付与（Git Bash）

Git Bashを開いて実行：
```bash
chmod +x ~/.claude/scripts/deny-check.sh
```

> **Note**: Windowsのファイルシステムでは実行権限の概念が異なりますが、Git Bash経由で実行する場合はこの設定が有効です。

### 5. jqのインストール（Windows）

スクリプトはjqを使用するため、以下のいずれかの方法でインストール：

**方法1: Chocolatey（推奨）**
```powershell
choco install jq
```

**方法2: Scoop**
```powershell
scoop install jq
```

**方法3: winget**
```powershell
winget install jqlang.jq
```

**方法4: 手動インストール**
1. https://github.com/jqlang/jq/releases からWindows用バイナリをダウンロード
2. `jq-win64.exe` を `jq.exe` にリネーム
3. PATHの通ったディレクトリ（例: `C:\Windows\System32`）に配置

**インストール確認:**
```powershell
jq --version
```

## 使用方法

設定後、以下のコマンドで起動：

```bash
claude --dangerously-skip-permissions
```

危険なコマンドが実行されようとすると、`deny-check.sh` がブロックする。

**ブロック時の表示例：**
```
● Bash(brew install hogeee)
└ Error: Bash operation blocked by hook:
  - [/Users/xxx/.claude/scripts/deny-check.sh]: Error: コマンドが拒否されました: 'brew install hogeee' (パターン: 'brew install *')
```

## 実際に使ってみた結果

この設定により、以下の効果が得られる：

- 権限チェックをスキップしても安全性を維持
- 危険なコマンドのみを選択的にブロック
- 開発効率とセキュリティのバランスを実現

## カスタマイズ

### denyパターンの追加

`settings.json` の `permissions.deny` 配列にパターンを追加：

```json
"Bash(危険なコマンド *)"
```

### ワイルドカードの使い方

| パターン | 説明 |
|---------|------|
| `*` | 任意の文字列にマッチ |
| `Bash(git config *)` | git configで始まる全コマンド |
| `Bash(rm -rf /*)` | rm -rf / で始まる全コマンド |
| `Bash(rm -rf C:/*)` | Cドライブ全削除（Windows） |
| `Bash(del /f /s *)` | Windows del強制削除 |
| `Bash(npm install -g *)` | グローバルnpmインストール |

### プロジェクト固有の設定

プロジェクトルートに `.claude/settings.json` を配置すると、そのプロジェクトでのみ適用される設定を追加できる。

## 注意事項

1. **両方の設定が必要**: `permissions.deny` と `hooks.PreToolUse` の両方を設定すること
2. **パスの指定**: チルダ(`~`)またはフルパスを使用
3. **過度な制限に注意**: 必要なコマンドまでブロックしないよう慎重に設定
4. **テスト推奨**: 設定後、意図通りに動作するか確認する

## トラブルシューティング

### スクリプトが動作しない場合

**Git Bashで確認:**
```bash
# スクリプトの存在と内容を確認
ls -la ~/.claude/scripts/deny-check.sh
cat ~/.claude/scripts/deny-check.sh

# 手動でテスト
echo '{"tool_name":"Bash","tool_input":{"command":"git config user.name test"}}' | ~/.claude/scripts/deny-check.sh
# "Error: コマンドが拒否されました:" メッセージが表示されれば正常
```

### jqが見つからない場合

**Git Bash:**
```bash
which jq
```

**PowerShell:**
```powershell
Get-Command jq
# または
where.exe jq
```

パスが表示されない場合は、jqをインストールしてPATHを通す。

### 設定が反映されない場合

- Claude Codeを再起動
- settings.jsonの構文エラーをチェック：
  ```powershell
  jq . "$env:USERPROFILE\.claude\settings.json"
  ```
- settings.jsonのパスを確認（`%USERPROFILE%\.claude\settings.json`）

### Windows特有の問題

**改行コードの問題:**
- Windowsで作成したスクリプトはCRLF改行になることがある
- Git Bashで実行エラーが出る場合、LF改行に変換：
  ```bash
  sed -i 's/\r$//' ~/.claude/scripts/deny-check.sh
  ```
  または、VSCodeで開いて右下の「CRLF」をクリック→「LF」に変更して保存

**パスの問題:**
- hookのcommandで絶対パスを使用する場合、バックスラッシュをエスケープ：
  - `"C:\\Users\\username\\.claude\\scripts\\deny-check.sh"`
- または、Git Bash形式のパスを使用：
  - `"/c/Users/username/.claude/scripts/deny-check.sh"`

**bashが見つからない場合:**
- Git for Windowsがインストールされているか確認
- Git Bashのパス（通常 `C:\Program Files\Git\bin\bash.exe`）をhookのcommandに指定

## Windowsクイックスタート

以下の手順で最小限の設定が完了します：

### 1. 必要なツールの確認
```powershell
# Git Bashの確認
& "C:\Program Files\Git\bin\bash.exe" --version

# jqの確認（なければインストール）
jq --version
# インストール: choco install jq または winget install jqlang.jq
```

### 2. ディレクトリとファイルの作成
```powershell
# ディレクトリ作成
New-Item -ItemType Directory -Force -Path "$env:USERPROFILE\.claude\scripts"

# settings.jsonの作成
@'
{
  "permissions": {
    "deny": [
      "Bash(git config *)",
      "Bash(rm -rf /*)",
      "Bash(rm -rf C:/*)",
      "Bash(del /s /q *)",
      "Bash(npm install -g *)",
      "Bash(gh repo delete:*)"
    ]
  },
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "bash",
            "args": ["-c", "~/.claude/scripts/deny-check.sh"]
          }
        ]
      }
    ]
  }
}
'@ | Out-File -FilePath "$env:USERPROFILE\.claude\settings.json" -Encoding UTF8
```

### 3. deny-check.shの作成
上記「3. deny-check.sh スクリプトの作成」セクションの内容を `%USERPROFILE%\.claude\scripts\deny-check.sh` に保存

### 4. 改行コードをLFに変換
```bash
# Git Bashで実行
sed -i 's/\r$//' ~/.claude/scripts/deny-check.sh
chmod +x ~/.claude/scripts/deny-check.sh
```

### 5. 動作確認
```bash
# Git Bashで実行
echo '{"tool_name":"Bash","tool_input":{"command":"git config user.name test"}}' | ~/.claude/scripts/deny-check.sh
# "Error: コマンドが拒否されました:" と表示されれば成功
```
