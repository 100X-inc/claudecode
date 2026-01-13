前提：Claude Code には **Hooks**（イベント発火で任意コマンド実行）があり、**タスク完了＝Claude Code が応答を終えるタイミング**は `Stop` イベントで取れます。Hooks は `~/.claude/settings.json` や `.claude/settings.json` 等で設定します。 ([Claude Code][1])

---

## 手順（Stop フックで Slack に飛ばす）

### 1) Slack 側で Incoming Webhook を作成

Slack の Incoming Webhooks で Webhook URL を発行します（このURLにPOSTします）。 ([クラスメソッド発「やってみた」系技術メディア | DevelopersIO][2])

### 2) 通知スクリプトを作る（stdin のJSONを読んで Slack にPOST）

例：プロジェクト配下に置く（`$CLAUDE_PROJECT_DIR` が使えるため） ([Claude Code][1])

```bash
mkdir -p .claude/hooks
cat > .claude/hooks/notify_slack_stop.sh <<'SH'
#!/usr/bin/env bash
set -euo pipefail

# Slack Incoming Webhook URL（環境変数で渡す想定）
: "${SLACK_WEBHOOK_URL:?SLACK_WEBHOOK_URL is not set}"

payload="$(cat)"  # Claude Code hook input JSON is passed via stdin :contentReference[oaicite:3]{index=3}

session_id="$(jq -r '.session_id // "unknown"' <<<"$payload")"
transcript_path="$(jq -r '.transcript_path // ""' <<<"$payload")"
stop_hook_active="$(jq -r '.stop_hook_active // false' <<<"$payload")"

text="✅ Claude Code finished (Stop). session_id=${session_id} stop_hook_active=${stop_hook_active}\ntranscript=${transcript_path}"

curl -sS -X POST \
  -H 'Content-type: application/json' \
  --data "$(jq -n --arg text "$text" '{text:$text}')" \
  "$SLACK_WEBHOOK_URL" >/dev/null
SH

chmod +x .claude/hooks/notify_slack_stop.sh
```

※ `Stop` フックの入力には `session_id` / `transcript_path` / `stop_hook_active` などが入ります。 ([Claude Code][1])

### 3) Claude Code の settings に Stop hook を追加

コミットしたくないなら `.claude/settings.local.json`、全プロジェクト共通なら `~/.claude/settings.json` に書きます。 ([Claude Code][1])

```json
{
  "hooks": {
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "\"$CLAUDE_PROJECT_DIR\"/.claude/hooks/notify_slack_stop.sh"
          }
        ]
      }
    ]
  }
}
```

### 4) 反映（重要）

Hooks 設定は **起動時にスナップショット**され、外部編集後は `/hooks` でレビューして適用する動きになります（必要なら Claude Code を再起動）。 ([Claude Code][1])

---

## これで何が起きるか

* Claude Code が「応答完了」した瞬間に `Stop` が発火 → Slack に通知が飛びます。 ([Claude Code][3])

[1]: https://code.claude.com/docs/en/hooks "Hooks reference - Claude Code Docs"
[2]: https://dev.classmethod.jp/articles/claude-code-hooks-slack-notifications/?utm_source=chatgpt.com "Claude CodeのHooks機能を使ってTask完了時にSlack通知し ..."
[3]: https://code.claude.com/docs/en/hooks-guide "Get started with Claude Code hooks - Claude Code Docs"
