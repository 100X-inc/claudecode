# Claude Code セキュアBash設定スクリプト（Windows PowerShell用）
# 実行方法: PowerShellで実行

Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Claude Code セキュアBash設定ツール" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# ========================================
# 1. 前提条件チェック
# ========================================
Write-Host "[1/5] 前提条件をチェック中..." -ForegroundColor Yellow

# Git Bashの確認
$gitBashPath = "C:\Program Files\Git\bin\bash.exe"
if (Test-Path $gitBashPath) {
    Write-Host "  OK: Git Bash が見つかりました" -ForegroundColor Green
} else {
    Write-Host "  NG: Git Bash が見つかりません" -ForegroundColor Red
    Write-Host "      https://git-scm.com/downloads からインストールしてください" -ForegroundColor Red
    exit 1
}

# jqの確認
$jqExists = Get-Command jq -ErrorAction SilentlyContinue
if ($jqExists) {
    Write-Host "  OK: jq が見つかりました" -ForegroundColor Green
} else {
    Write-Host "  NG: jq が見つかりません" -ForegroundColor Yellow
    Write-Host "      インストールしてください: winget install jqlang.jq" -ForegroundColor Yellow
}

Write-Host ""

# ========================================
# 2. ディレクトリ作成
# ========================================
Write-Host "[2/5] ディレクトリを作成中..." -ForegroundColor Yellow

$claudeDir = "$env:USERPROFILE\.claude"
$scriptsDir = "$claudeDir\scripts"

if (-not (Test-Path $scriptsDir)) {
    New-Item -ItemType Directory -Force -Path $scriptsDir | Out-Null
    Write-Host "  作成: $scriptsDir" -ForegroundColor Green
} else {
    Write-Host "  既存: $scriptsDir" -ForegroundColor Green
}

Write-Host ""

# ========================================
# 3. settings.json 作成
# ========================================
Write-Host "[3/5] settings.json を作成中..." -ForegroundColor Yellow

$settingsPath = "$claudeDir\settings.json"

# 既存ファイルのバックアップ
if (Test-Path $settingsPath) {
    $backupPath = "$settingsPath.backup.$(Get-Date -Format 'yyyyMMdd_HHmmss')"
    Copy-Item $settingsPath $backupPath
    Write-Host "  バックアップ: $backupPath" -ForegroundColor Yellow
}

# settings.json の内容
$settingsJson = @{
    permissions = @{
        deny = @(
            "Bash(git config:*)",
            "Bash(rm -rf /)",
            "Bash(rm -rf /*)",
            "Bash(rm -rf C:*)",
            "Bash(del /s /q:*)",
            "Bash(rmdir /s /q:*)",
            "Bash(npm install -g:*)",
            "Bash(pip install --user:*)",
            "Bash(gh repo delete:*)",
            "Bash(git push --force:*)",
            "Bash(git push -f:*)",
            "Bash(git reset --hard:*)"
        )
    }
    hooks = @{
        PreToolUse = @(
            @{
                matcher = "Bash"
                hooks = @(
                    @{
                        type = "command"
                        command = "C:\Program Files\Git\bin\bash.exe"
                        args = @("-c", "~/.claude/scripts/deny-check.sh")
                    }
                )
            }
        )
    }
}

$settingsJson | ConvertTo-Json -Depth 10 | Out-File -FilePath $settingsPath -Encoding UTF8
Write-Host "  作成: $settingsPath" -ForegroundColor Green

Write-Host ""

# ========================================
# 4. deny-check.sh 作成
# ========================================
Write-Host "[4/5] deny-check.sh を作成中..." -ForegroundColor Yellow

$denyCheckPath = "$scriptsDir\deny-check.sh"

# bashスクリプトの各行を配列で定義
$bashScript = @(
    '#!/bin/bash'
    ''
    'input=$(cat)'
    'command=$(echo "$input" | jq -r ".tool_input.command" 2>/dev/null)'
    'tool_name=$(echo "$input" | jq -r ".tool_name" 2>/dev/null)'
    ''
    'if [ "$tool_name" != "Bash" ]; then'
    '  exit 0'
    'fi'
    ''
    'settings_file="$HOME/.claude/settings.json"'
    'deny_patterns=$(jq -r ".permissions.deny[]" "$settings_file" 2>/dev/null | grep "^Bash(" | sed "s/^Bash(//;s/)$//")'
    ''
    'matches_deny_pattern() {'
    '  local cmd="$1"'
    '  local pattern="$2"'
    '  [[ "$cmd" == $pattern ]]'
    '}'
    ''
    'while IFS= read -r pattern; do'
    '  [ -z "$pattern" ] && continue'
    '  if matches_deny_pattern "$command" "$pattern"; then'
    '    echo "Error: Command blocked: $command (pattern: $pattern)" >&2'
    '    exit 2'
    '  fi'
    'done <<<"$deny_patterns"'
    ''
    'exit 0'
)

# LF改行で保存
$bashScript -join "`n" | Set-Content -Path $denyCheckPath -NoNewline -Encoding UTF8
Write-Host "  作成: $denyCheckPath" -ForegroundColor Green

Write-Host ""

# ========================================
# 5. 実行権限付与（Git Bash経由）
# ========================================
Write-Host "[5/5] 実行権限を付与中..." -ForegroundColor Yellow

& $gitBashPath -c "chmod +x ~/.claude/scripts/deny-check.sh"
Write-Host "  完了: chmod +x 実行済み" -ForegroundColor Green

Write-Host ""

# ========================================
# 動作確認
# ========================================
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " 動作確認" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

Write-Host ""
Write-Host "テスト: git config コマンドをブロックできるか..." -ForegroundColor Yellow

$testJson = '{"tool_name":"Bash","tool_input":{"command":"git config user.name test"}}'
$testResult = & $gitBashPath -c "echo '$testJson' | ~/.claude/scripts/deny-check.sh 2>&1"
$exitCode = $LASTEXITCODE

if ($exitCode -eq 2) {
    Write-Host ""
    Write-Host "  SUCCESS! ブロック成功" -ForegroundColor Green
    Write-Host "  $testResult" -ForegroundColor Gray
} else {
    Write-Host ""
    Write-Host "  結果: 終了コード $exitCode" -ForegroundColor Yellow
    if ($testResult) {
        Write-Host "  $testResult" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " セットアップ完了！" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "使い方:" -ForegroundColor White
Write-Host "  claude --dangerously-skip-permissions" -ForegroundColor Yellow
Write-Host ""
