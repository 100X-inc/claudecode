#!/bin/bash
#
# tmux Multi-Agent Setup Script
# Claude Code と OpenAI Codex を左右ペインで起動
#
# 使用方法:
#   bash setup.sh [--claude-only] [--codex-only]
#
# オプション:
#   --claude-only  左ペインのみ (Claude Code)
#   --codex-only   右ペインのみ (Codex)
#   --no-attach    セッション作成のみ（アタッチしない）
#

SESSION="agents"
WINDOW="main"
CLAUDE_CMD="claude"
CODEX_CMD="codex"

# オプション解析
CLAUDE_ONLY=false
CODEX_ONLY=false
NO_ATTACH=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --claude-only)
            CLAUDE_ONLY=true
            shift
            ;;
        --codex-only)
            CODEX_ONLY=true
            shift
            ;;
        --no-attach)
            NO_ATTACH=true
            shift
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

# 既存セッションがあれば削除
tmux kill-session -t $SESSION 2>/dev/null

# 新規セッション作成
echo "Creating tmux session: $SESSION"
tmux new-session -d -s $SESSION -n $WINDOW

# 左右ペイン分割
if [[ "$CLAUDE_ONLY" == false && "$CODEX_ONLY" == false ]]; then
    tmux split-window -h -t $SESSION:$WINDOW
fi

# 左ペイン: Claude Code起動
if [[ "$CODEX_ONLY" == false ]]; then
    echo "Starting Claude Code in left pane..."
    tmux send-keys -t $SESSION:$WINDOW.0 "$CLAUDE_CMD" Enter
fi

# 右ペイン: Codex起動
if [[ "$CLAUDE_ONLY" == false && "$CODEX_ONLY" == false ]]; then
    echo "Starting Codex in right pane..."
    sleep 1  # 初期化待機
    tmux send-keys -t $SESSION:$WINDOW.1 "$CODEX_CMD" Enter
fi

# アタッチ
if [[ "$NO_ATTACH" == false ]]; then
    echo "Attaching to session..."
    tmux attach -t $SESSION
else
    echo "Session created: $SESSION"
    echo "Attach with: tmux attach -t $SESSION"
fi
