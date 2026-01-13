# Claude Code + Slack 双方向連携システム 設計書

## 1. 概要

### 目的
Claude Codeで実装完了後、自動でSlackに通知し、Slackからのコメントを受けて継続作業できる双方向連携システムを構築する。

### ユースケース
1. 開発者がClaude Codeで実装作業を行う
2. 実装完了時、自動でSlackに通知される
3. レビュアーがSlackでコメント（修正依頼、追加指示など）
4. Claude Codeが自動でコメントを受け取り、続きの作業を実行
5. 結果がSlackスレッドに投稿される

---

## 2. システムアーキテクチャ

### 全体構成図

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           Claude Code + Slack 双方向連携                      │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────────┐                    ┌──────────────────────────────────────┐
│   Claude Code    │                    │            Slack Workspace           │
│   (Terminal)     │                    │                                      │
│                  │                    │  ┌─────────────────────────────────┐ │
│  ┌────────────┐  │   Stop Hook        │  │   #claude-notifications          │ │
│  │  Session   │──┼──────────────────▶ │  │                                 │ │
│  │ (作業中)   │  │   (1) 完了通知     │  │  [Bot] 実装完了しました!        │ │
│  └────────────┘  │                    │  │  Session: abc123                │ │
│        ▲         │                    │  │  [続きを指示] ボタン            │ │
│        │         │                    │  │                                 │ │
│        │         │                    │  │  [User] LGTM! テストも書いて    │ │
│  ┌─────┴──────┐  │   --resume         │  └──────────────┬──────────────────┘ │
│  │   Resume   │◀─┼──────────────────── │                 │                    │
│  │ (再開)     │  │   (2) コメント受信  │                 │                    │
│  └────────────┘  │                    └─────────────────┼────────────────────┘
│                  │                                      │
└──────────────────┘                                      │
                                                          │
┌─────────────────────────────────────────────────────────┼────────────────────┐
│                        Node.js 常駐デーモン              │                    │
│                                                          ▼                    │
│  ┌──────────────────────────────────────────────────────────────────────┐    │
│  │                    Slack Bot (Socket Mode)                            │    │
│  │                                                                       │    │
│  │  ┌─────────────┐    ┌──────────────────┐    ┌────────────────────┐  │    │
│  │  │ Message     │    │ Session Manager  │    │ Claude Executor    │  │    │
│  │  │ Listener    │───▶│                  │───▶│                    │  │    │
│  │  │             │    │ - sessionMap     │    │ - child_process    │  │    │
│  │  │ @bot reply  │    │ - channelMap     │    │ - claude --resume  │  │    │
│  │  └─────────────┘    └──────────────────┘    └────────────────────┘  │    │
│  │                                                                       │    │
│  └───────────────────────────────────────────────────────────────────────┘    │
│                                                                                │
│  ┌──────────────────────────────────────────────────────────────────────┐    │
│  │                    Webhook Receiver (HTTP Server)                     │    │
│  │                         Port: 3456                                    │    │
│  │                                                                       │    │
│  │  POST /hook/stop ◀─── Stop Hook からの通知受信                        │    │
│  │    └─▶ session_id, transcript_path を保存                            │    │
│  │    └─▶ Slack に完了メッセージ送信                                     │    │
│  │                                                                       │    │
│  └───────────────────────────────────────────────────────────────────────┘    │
│                                                                                │
└────────────────────────────────────────────────────────────────────────────────┘

                              ┌────────────────────────┐
                              │     セッションDB       │
                              │    (SQLite)            │
                              │                        │
                              │  session_id            │
                              │  transcript_path       │
                              │  slack_channel         │
                              │  slack_thread_ts       │
                              │  cwd                   │
                              │  status                │
                              │  created_at            │
                              └────────────────────────┘
```

### コンポーネント説明

| コンポーネント | 役割 |
|---------------|------|
| Claude Code | ターミナルで動作するAIコーディングアシスタント |
| Stop Hook | Claude応答完了時に発火するフック |
| Webhook Server | Stop Hookからの通知を受信するHTTPサーバー |
| Slack Bot | Socket Modeで接続し、スレッド返信を監視 |
| Session Manager | セッションIDとSlackスレッドのマッピング管理 |
| Claude Executor | `claude --resume`コマンドを実行 |
| SQLite | セッション情報の永続化 |

---

## 3. プロジェクト構成

### ディレクトリ構造

```
C:\ai_programming\claudecode\claude-slack-bridge\
├── package.json                    # Node.js プロジェクト設定
├── tsconfig.json                   # TypeScript設定
├── .env                            # 環境変数（API Keys）※gitignore対象
├── .env.example                    # 環境変数テンプレート
├── .gitignore
├── src/
│   ├── index.ts                    # エントリーポイント
│   ├── config.ts                   # 設定読み込み
│   ├── slack/
│   │   ├── app.ts                  # Slack Bolt アプリ初期化
│   │   ├── listeners/
│   │   │   ├── messages.ts         # メッセージイベントハンドラ
│   │   │   ├── commands.ts         # コマンド処理（!kaki continue等）
│   │   │   └── actions.ts          # ボタンアクションハンドラ
│   │   └── blocks.ts               # Slack Block Kit メッセージ構築
│   ├── webhook/
│   │   └── server.ts               # HTTP Webhook サーバー（Stop Hook受信）
│   ├── claude/
│   │   ├── executor.ts             # Claude CLI 実行ラッパー
│   │   └── parser.ts               # Claude 出力パーサー
│   ├── queue/
│   │   ├── manager.ts              # 返信キュー管理
│   │   └── processor.ts            # キュー処理（定期実行）
│   └── session/
│       ├── manager.ts              # セッション管理ロジック
│       └── store.ts                # セッション永続化（SQLite）
├── hooks/
│   └── stop-notify.sh              # Stop Hook スクリプト
└── data/
    └── sessions.db                 # SQLiteデータベース（自動生成）
```

### 各ファイルの詳細

| ファイル | 役割 | 詳細 |
|----------|------|------|
| `src/index.ts` | エントリーポイント | Slack BotとWebhookサーバーを起動 |
| `src/slack/app.ts` | Slack Bolt初期化 | Socket Modeで接続 |
| `src/slack/listeners/messages.ts` | メッセージ監視 | スレッド返信を検知してClaude実行 |
| `src/slack/listeners/actions.ts` | ボタンハンドラ | Interactive componentsの処理 |
| `src/slack/blocks.ts` | メッセージ構築 | Block Kitでリッチな通知を構築 |
| `src/webhook/server.ts` | Webhook受信 | Stop Hookからの通知を処理 |
| `src/claude/executor.ts` | Claude実行 | `claude --resume`をchild_processで実行 |
| `src/claude/parser.ts` | 出力パース | Claude出力からサマリーを抽出 |
| `src/session/manager.ts` | セッション管理 | セッション検索・更新ロジック |
| `src/session/store.ts` | 永続化 | SQLiteへの読み書き |
| `hooks/stop-notify.sh` | Stop Hook | Webhookサーバーへセッション情報を送信 |

---

## 4. Slack App 設定手順

### 4.1. Slack App 作成

1. [Slack API](https://api.slack.com/apps) にアクセス
2. 「Create New App」 > 「From scratch」を選択
3. App Name: `Claude Code Notifier`
4. Workspace: 対象のワークスペースを選択

### 4.2. Socket Mode 有効化

1. 左メニュー「Socket Mode」を選択
2. 「Enable Socket Mode」をオンに
3. App Level Token を生成:
   - Token Name: `claude-socket`
   - Scope: `connections:write`
4. 生成された `xapp-...` トークンを保存

### 4.3. Bot Token Scopes 設定

「OAuth & Permissions」 > 「Bot Token Scopes」に以下を追加:

| Scope | 用途 |
|-------|------|
| `chat:write` | メッセージ送信 |
| `channels:history` | パブリックチャネルのメッセージ読み取り |
| `groups:history` | プライベートチャネルのメッセージ読み取り |
| `im:history` | DM のメッセージ読み取り |
| `app_mentions:read` | @メンション検知 |

### 4.4. Event Subscriptions 設定

「Event Subscriptions」 > 「Enable Events」をオン

**Subscribe to bot events:**

| Event | 用途 |
|-------|------|
| `message.channels` | パブリックチャネルのメッセージ |
| `message.groups` | プライベートチャネルのメッセージ |
| `message.im` | DM |
| `app_mention` | @メンション |

### 4.5. Interactivity 設定（オプション）

ボタンを使う場合は「Interactivity & Shortcuts」を有効化
- Socket Mode なので Request URL は不要

### 4.6. アプリをワークスペースにインストール

「Install to Workspace」を実行し、`xoxb-...` Bot Token を取得

---

## 5. 実装詳細

### 5.1. package.json

```json
{
  "name": "claude-slack-bridge",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "start": "tsx src/index.ts",
    "dev": "tsx watch src/index.ts",
    "build": "tsc"
  },
  "dependencies": {
    "@slack/bolt": "^4.1.0",
    "express": "^4.21.0",
    "better-sqlite3": "^11.0.0",
    "dotenv": "^16.4.0"
  },
  "devDependencies": {
    "@types/better-sqlite3": "^7.6.0",
    "@types/express": "^4.17.21",
    "@types/node": "^22.0.0",
    "tsx": "^4.7.0",
    "typescript": "^5.6.0"
  }
}
```

### 5.2. 環境変数（.env）

```env
# Slack API Tokens
SLACK_BOT_TOKEN=xoxb-your-bot-token
SLACK_APP_TOKEN=xapp-your-app-token
SLACK_SIGNING_SECRET=your-signing-secret

# 通知先チャネル
SLACK_CHANNEL_ID=C0123456789

# Webhook サーバーポート
WEBHOOK_PORT=3456

# セキュリティ（H-03対応）
KAKI_LOCAL_TOKEN=your-random-local-token  # Hook認証用トークン
```

### 5.3. src/index.ts（エントリーポイント）

```typescript
import 'dotenv/config';
import { createSlackApp } from './slack/app.js';
import { createWebhookServer } from './webhook/server.js';
import { SessionManager } from './session/manager.js';

async function main() {
  // セッションマネージャー初期化
  const sessionManager = new SessionManager();

  // Slack Bot 起動（Socket Mode）
  const slackApp = createSlackApp(sessionManager);
  await slackApp.start();
  console.log('Slack Bot started (Socket Mode)');

  // Webhook サーバー起動
  const webhookPort = parseInt(process.env.WEBHOOK_PORT || '3456');
  const webhookServer = createWebhookServer(sessionManager, slackApp);
  // H-03: localhostにのみバインド（外部公開しない）
  webhookServer.listen(webhookPort, '127.0.0.1', () => {
    console.log(`Webhook server listening on 127.0.0.1:${webhookPort}`);
  });
}

main().catch(console.error);
```

### 5.4. src/slack/app.ts（Slack Bolt 初期化）

```typescript
import { App } from '@slack/bolt';
import type { SessionManager } from '../session/manager.js';
import { registerMessageListeners } from './listeners/messages.js';
import { registerCommandListeners } from './listeners/commands.js';  // H-02追加
import { registerActionListeners } from './listeners/actions.js';

export function createSlackApp(sessionManager: SessionManager) {
  const app = new App({
    token: process.env.SLACK_BOT_TOKEN,
    appToken: process.env.SLACK_APP_TOKEN,
    socketMode: true,
  });

  // イベントリスナー登録
  registerMessageListeners(app, sessionManager);
  registerCommandListeners(app, sessionManager);  // H-02追加
  registerActionListeners(app, sessionManager);

  return app;
}
```

### 5.5. src/slack/listeners/messages.ts（メッセージ監視）

```typescript
import type { App } from '@slack/bolt';
import type { SessionManager } from '../../session/manager.js';
import { executeClaudeResume } from '../../claude/executor.js';

export function registerMessageListeners(app: App, sessionManager: SessionManager) {
  // スレッド内のメッセージを監視
  app.message(async ({ message, say, client }) => {
    // H-03: Bot自身のメッセージは無視（ループ防止）
    if ('bot_id' in message) return;
    if ('subtype' in message && message.subtype) return;  // bot_message等も除外

    // スレッドへの返信かチェック
    if (!('thread_ts' in message) || !message.thread_ts) return;

    const threadTs = message.thread_ts;
    const channelId = message.channel;

    // このスレッドに紐づくセッションを検索
    const session = sessionManager.getSessionByThread(channelId, threadTs);

    // L-01: セッションが見つからない場合はエラー返信
    if (!session) {
      await say({
        text: ':warning: このスレッドは Kaki セッションに紐付いていません。\n新規セッションを開始するには、Claude Code でタスクを実行してください。',
        thread_ts: threadTs,
      });
      return;
    }

    // ユーザーのメッセージを取得
    const userMessage = 'text' in message ? message.text : '';
    if (!userMessage) return;

    // 処理中メッセージを送信
    await say({
      text: ':hourglass_flowing_sand: Claude Code で処理中...',
      thread_ts: threadTs,
    });

    // Claude --resume を実行
    try {
      const result = await executeClaudeResume(session.sessionId, userMessage, session.cwd);

      // 結果を Slack に投稿
      await say({
        text: `:white_check_mark: 完了\n\`\`\`\n${result.summary}\n\`\`\``,
        thread_ts: threadTs,
      });

      // セッション情報を更新（新しい session_id があれば）
      if (result.newSessionId) {
        sessionManager.updateSession(session.sessionId, {
          sessionId: result.newSessionId,
        });
      }
    } catch (error) {
      await say({
        text: `:x: エラーが発生しました: ${error instanceof Error ? error.message : 'Unknown error'}`,
        thread_ts: threadTs,
      });
    }
  });
}
```

### 5.5.1. src/slack/listeners/commands.ts（H-02: コマンド処理）

```typescript
import type { App } from '@slack/bolt';
import type { SessionManager } from '../../session/manager.js';

// H-02: Slackコマンド処理（プレフィックス方式）
export function registerCommandListeners(app: App, sessionManager: SessionManager) {
  // !kaki <command> 形式のコマンドを処理
  app.message(/^!kaki\s+(\w+)(?:\s+(.*))?/, async ({ context, say, message }) => {
    if (!('thread_ts' in message) || !message.thread_ts) {
      await say(':warning: コマンドはスレッド内で実行してください。');
      return;
    }

    const threadTs = message.thread_ts;
    const channelId = message.channel;
    const command = context.matches[1];
    const args = context.matches[2] || '';

    const session = sessionManager.getSessionByThread(channelId, threadTs);
    if (!session) {
      await say({
        text: ':warning: このスレッドに紐付くセッションが見つかりません。',
        thread_ts: threadTs,
      });
      return;
    }

    switch (command) {
      case 'continue':
        // セッション状態を RUNNING に変更
        sessionManager.updateSession(session.sessionId, { status: 'RUNNING' });
        await say({
          text: ':arrow_forward: セッションを継続モードに変更しました。',
          thread_ts: threadTs,
        });
        break;

      case 'stop':
        // セッション状態を CLOSED に変更
        sessionManager.updateSession(session.sessionId, { status: 'CLOSED' });
        await say({
          text: ':stop_sign: セッションを終了しました。',
          thread_ts: threadTs,
        });
        break;

      case 'status':
        // 現在の状態を返信
        await say({
          text: `:information_source: *セッション状態:* \`${session.status}\`\n*Session ID:* \`${session.sessionId}\``,
          thread_ts: threadTs,
        });
        break;

      case 'summarize':
        // 直近のやり取りを要約（将来的にClaude APIで要約生成）
        await say({
          text: ':memo: *セッション要約*\n（要約機能は今後実装予定）',
          thread_ts: threadTs,
        });
        break;

      default:
        await say({
          text: `:question: 不明なコマンド: \`${command}\`\n利用可能: \`!kaki continue\`, \`!kaki stop\`, \`!kaki status\`, \`!kaki summarize\``,
          thread_ts: threadTs,
        });
    }
  });
}
```

### 5.6. src/webhook/server.ts（Webhook 受信）

```typescript
import express from 'express';
import type { App } from '@slack/bolt';
import type { SessionManager } from '../session/manager.js';
import { buildCompletionMessage } from '../slack/blocks.js';

// M-01: イベント種別を要件と統一
interface StopHookPayload {
  session_id: string;
  transcript_path: string;
  cwd: string;
  timestamp: string;
  event_type: 'TASK_COMPLETED' | 'CHECKPOINT' | 'TASK_FAILED';  // M-01追加
  summary?: string;       // M-02追加
  artifacts?: {           // M-02追加
    repo?: string;
    branch?: string;
    commit?: string;
    pr_url?: string;
  };
}

export function createWebhookServer(sessionManager: SessionManager, slackApp: App) {
  const app = express();
  app.use(express.json());

  // H-03: トークン認証
  const LOCAL_TOKEN = process.env.KAKI_LOCAL_TOKEN;

  app.post('/hook/stop', async (req, res) => {
    // H-03: 認証チェック
    const authHeader = req.headers.authorization;
    if (LOCAL_TOKEN && authHeader !== `Bearer ${LOCAL_TOKEN}`) {
      console.error('Unauthorized request to /hook/stop');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const payload: StopHookPayload = req.body;
    console.log('Received Stop Hook:', payload);

    // セッション情報を保存
    const channelId = process.env.SLACK_CHANNEL_ID!;

    try {
      // Slack に完了通知を送信
      const result = await slackApp.client.chat.postMessage({
        channel: channelId,
        ...buildCompletionMessage(payload.session_id, payload.cwd),
      });

      // セッションとスレッドの紐付けを保存
      if (result.ts) {
        sessionManager.saveSession({
          sessionId: payload.session_id,
          transcriptPath: payload.transcript_path,
          cwd: payload.cwd,
          slackChannel: channelId,
          slackThreadTs: result.ts,
          status: 'waiting',
          createdAt: new Date().toISOString(),
        });
      }

      res.json({ success: true });
    } catch (error) {
      console.error('Error posting to Slack:', error);
      res.status(500).json({ error: 'Failed to post to Slack' });
    }
  });

  return app;
}
```

### 5.7. src/slack/blocks.ts（Block Kit メッセージ）

```typescript
// M-02: summary と artifacts を追加
export function buildCompletionMessage(
  sessionId: string,
  cwd: string,
  summary?: string,
  artifacts?: {
    branch?: string;
    commit?: string;
    pr_url?: string;
  }
) {
  return {
    text: 'Claude Code の実装が完了しました',
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: ':white_check_mark: *Claude Code の実装が完了しました*',
        },
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*Session ID:*\n\`${sessionId}\``,
          },
          {
            type: 'mrkdwn',
            text: `*作業ディレクトリ:*\n\`${cwd}\``,
          },
          // M-02: ブランチ情報を追加
          ...(artifacts?.branch ? [{
            type: 'mrkdwn',
            text: `*ブランチ:*\n\`${artifacts.branch}\``,
          }] : []),
          // M-02: コミット情報を追加
          ...(artifacts?.commit ? [{
            type: 'mrkdwn',
            text: `*コミット:*\n\`${artifacts.commit}\``,
          }] : []),
        ],
      },
      // M-02: サマリを追加
      ...(summary ? [{
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*要約:*\n${summary}`,
        },
      }] : []),
      // M-02: PRリンクを追加
      ...(artifacts?.pr_url ? [{
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*PR:* <${artifacts.pr_url}|Pull Request を確認>`,
        },
      }] : []),
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: ':point_right: *このスレッドに返信すると、Claude Code が続きの作業を行います*',
          },
        ],
      },
      {
        type: 'divider',
      },
    ],
  };
}
```

### 5.8. src/claude/executor.ts（Claude CLI 実行）

```typescript
import { spawn } from 'child_process';

interface ClaudeResult {
  success: boolean;
  summary: string;
  newSessionId?: string;
  fullOutput: string;
}

export async function executeClaudeResume(
  sessionId: string,
  prompt: string,
  cwd: string
): Promise<ClaudeResult> {
  return new Promise((resolve, reject) => {
    // Windows 環境での実行
    const claude = spawn('claude', [
      '--resume', sessionId,
      '-p', prompt,
      '--output-format', 'json',
    ], {
      cwd,
      shell: true,
      env: { ...process.env },
    });

    let stdout = '';
    let stderr = '';

    claude.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    claude.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    claude.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Claude exited with code ${code}: ${stderr}`));
        return;
      }

      try {
        // JSON 出力をパース
        const lines = stdout.trim().split('\n');
        let result: ClaudeResult = {
          success: true,
          summary: '',
          fullOutput: stdout,
        };

        for (const line of lines) {
          try {
            const json = JSON.parse(line);
            if (json.type === 'result') {
              result.summary = json.result || '';
            }
            if (json.session_id) {
              result.newSessionId = json.session_id;
            }
          } catch {
            // JSON でない行は無視
          }
        }

        // サマリーが空の場合は最後の数行を使用
        if (!result.summary) {
          result.summary = stdout.slice(-500);
        }

        resolve(result);
      } catch (error) {
        reject(error);
      }
    });
  });
}
```

### 5.9. src/session/manager.ts（セッション管理）

```typescript
import { SessionStore, type SessionData } from './store.js';

export class SessionManager {
  private store: SessionStore;

  constructor() {
    this.store = new SessionStore();
  }

  saveSession(session: SessionData): void {
    this.store.save(session);
  }

  getSession(sessionId: string): SessionData | undefined {
    return this.store.get(sessionId);
  }

  getSessionByThread(channelId: string, threadTs: string): SessionData | undefined {
    return this.store.getByThread(channelId, threadTs);
  }

  updateSession(sessionId: string, updates: Partial<SessionData>): void {
    const existing = this.store.get(sessionId);
    if (existing) {
      this.store.save({ ...existing, ...updates });
    }
  }

  deleteSession(sessionId: string): void {
    this.store.delete(sessionId);
  }
}
```

### 5.10. src/session/store.ts（データ永続化）

```typescript
import Database from 'better-sqlite3';
import path from 'path';

// L-02: 状態モデルを要件定義と統一
export interface SessionData {
  sessionId: string;
  transcriptPath: string;
  cwd: string;
  slackChannel: string;
  slackThreadTs: string;
  status: 'OPEN' | 'WAITING_FOR_HUMAN' | 'RUNNING' | 'CLOSED';  // L-02統一
  createdAt: string;
}

export class SessionStore {
  private db: Database.Database;

  constructor() {
    const dbPath = path.join(process.cwd(), 'data', 'sessions.db');
    this.db = new Database(dbPath);
    this.initialize();
  }

  private initialize(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS sessions (
        session_id TEXT PRIMARY KEY,
        transcript_path TEXT,
        cwd TEXT,
        slack_channel TEXT,
        slack_thread_ts TEXT,
        status TEXT,
        created_at TEXT
      )
    `);

    // インデックス作成
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_slack_thread
      ON sessions (slack_channel, slack_thread_ts)
    `);

    // M-03: 冪等性キーテーブル
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS idempotency_keys (
        key TEXT PRIMARY KEY,
        created_at TEXT
      )
    `);

    // M-05: 監査ログテーブル
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS events_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_type TEXT NOT NULL,
        session_id TEXT,
        thread_ts TEXT,
        payload TEXT,
        status TEXT,
        error_message TEXT,
        created_at TEXT
      )
    `);
  }

  // M-03: 冪等性チェック
  hasProcessed(key: string): boolean {
    const stmt = this.db.prepare('SELECT 1 FROM idempotency_keys WHERE key = ?');
    return !!stmt.get(key);
  }

  markProcessed(key: string): void {
    const stmt = this.db.prepare('INSERT OR IGNORE INTO idempotency_keys (key, created_at) VALUES (?, ?)');
    stmt.run(key, new Date().toISOString());
  }

  // M-05: 監査ログ記録
  logEvent(event: {
    eventType: string;
    sessionId?: string;
    threadTs?: string;
    payload?: object;
    status: 'SUCCESS' | 'FAILED';
    errorMessage?: string;
  }): void {
    const stmt = this.db.prepare(`
      INSERT INTO events_log (event_type, session_id, thread_ts, payload, status, error_message, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      event.eventType,
      event.sessionId || null,
      event.threadTs || null,
      event.payload ? JSON.stringify(event.payload) : null,
      event.status,
      event.errorMessage || null,
      new Date().toISOString()
    );
  }

  save(session: SessionData): void {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO sessions
      (session_id, transcript_path, cwd, slack_channel, slack_thread_ts, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      session.sessionId,
      session.transcriptPath,
      session.cwd,
      session.slackChannel,
      session.slackThreadTs,
      session.status,
      session.createdAt
    );
  }

  get(sessionId: string): SessionData | undefined {
    const stmt = this.db.prepare('SELECT * FROM sessions WHERE session_id = ?');
    const row = stmt.get(sessionId) as any;
    return row ? this.rowToSession(row) : undefined;
  }

  getByThread(channelId: string, threadTs: string): SessionData | undefined {
    const stmt = this.db.prepare(
      'SELECT * FROM sessions WHERE slack_channel = ? AND slack_thread_ts = ?'
    );
    const row = stmt.get(channelId, threadTs) as any;
    return row ? this.rowToSession(row) : undefined;
  }

  delete(sessionId: string): void {
    const stmt = this.db.prepare('DELETE FROM sessions WHERE session_id = ?');
    stmt.run(sessionId);
  }

  private rowToSession(row: any): SessionData {
    return {
      sessionId: row.session_id,
      transcriptPath: row.transcript_path,
      cwd: row.cwd,
      slackChannel: row.slack_channel,
      slackThreadTs: row.slack_thread_ts,
      status: row.status,
      createdAt: row.created_at,
    };
  }
}
```

---

## 6. Claude Code Hook 設定

### 6.1. settings.json への追加

`~/.claude/settings.json` に以下を追加:

```json
{
  "hooks": {
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "C:\\Program Files\\Git\\bin\\bash.exe",
            "args": ["-c", "/c/ai_programming/claudecode/claude-slack-bridge/hooks/stop-notify.sh"],
            "timeout": 10
          }
        ]
      }
    ]
  }
}
```

### 6.2. Stop Hook スクリプト

`hooks/stop-notify.sh`:

```bash
#!/bin/bash

# stdin から JSON を読み取り
input=$(cat)

# 必要な情報を抽出
session_id=$(echo "$input" | jq -r '.session_id // empty')
transcript_path=$(echo "$input" | jq -r '.transcript_path // empty')
cwd=$(echo "$input" | jq -r '.cwd // empty')
hook_event_name=$(echo "$input" | jq -r '.hook_event_name // empty')

# Stop イベント以外は無視
if [ "$hook_event_name" != "Stop" ]; then
  exit 0
fi

# session_id が空の場合は終了
if [ -z "$session_id" ]; then
  exit 0
fi

# H-03: ローカルトークンを環境変数から取得
KAKI_LOCAL_TOKEN="${KAKI_LOCAL_TOKEN:-}"

# Webhook サーバーに通知（H-03: 認証ヘッダー追加）
curl -s -X POST "http://127.0.0.1:3456/hook/stop" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${KAKI_LOCAL_TOKEN}" \
  -d "{
    \"session_id\": \"$session_id\",
    \"transcript_path\": \"$transcript_path\",
    \"cwd\": \"$cwd\",
    \"event_type\": \"TASK_COMPLETED\",
    \"timestamp\": \"$(date -Iseconds)\"
  }" || true

exit 0
```

### 6.3. Stop Hook が受け取るJSON形式

```json
{
  "session_id": "abc123",
  "transcript_path": "~/.claude/projects/.../session.jsonl",
  "cwd": "C:\\project",
  "hook_event_name": "Stop"
}
```

---

## 7. データフロー

### シーケンス図

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  Claude  │     │  Stop    │     │ Webhook  │     │  Slack   │     │  SQLite  │
│  Code    │     │  Hook    │     │ Server   │     │          │     │          │
└────┬─────┘     └────┬─────┘     └────┬─────┘     └────┬─────┘     └────┬─────┘
     │                │                │                │                │
     │ 作業完了        │                │                │                │
     ├───────────────▶│                │                │                │
     │                │ POST /hook/stop│                │                │
     │                ├───────────────▶│                │                │
     │                │                │ postMessage    │                │
     │                │                ├───────────────▶│                │
     │                │                │                │ 通知表示        │
     │                │                │◀───────────────┤ (thread_ts)    │
     │                │                │ saveSession    │                │
     │                │                ├────────────────┼───────────────▶│
     │                │                │                │                │
     │                │                │                │                │
     │ ─ ─ ─ 待機 ─ ─ ─                │                │                │
     │                │                │                │                │
     │                │                │                │ ユーザー返信    │
     │                │                │◀───────────────┤                │
     │                │                │ getSession     │                │
     │                │                ├────────────────┼───────────────▶│
     │                │                │◀───────────────┼────────────────┤
     │ claude --resume│                │                │                │
     │◀───────────────┼────────────────┤                │                │
     │                │                │                │                │
     │ 作業実行        │                │                │                │
     ├───────────────▶│                │                │                │
     │                │                │ postMessage    │                │
     │                │                ├───────────────▶│                │
     │                │                │                │ 結果表示        │
     │                │                │                │                │
     ▼                ▼                ▼                ▼                ▼
```

### 状態遷移（L-02: 要件定義と統一）

```
                     ┌─────────┐
                     │  OPEN   │ (セッション作成時)
                     └────┬────┘
                          │ Slack投稿完了
                          ▼
                  ┌────────────────────┐
                  │ WAITING_FOR_HUMAN  │ (Slack で待機中)
                  └─────────┬──────────┘
                            │ ユーザー返信 / !kaki continue
                            ▼
                     ┌─────────┐
                     │ RUNNING │ (--resume で再開)
                     └────┬────┘
                          │ 完了通知
                          ├──────────────────────┐
                          ▼                      │
                  ┌────────────────────┐         │
                  │ WAITING_FOR_HUMAN  │◀────────┘
                  └─────────┬──────────┘
                            │ !kaki stop or 明示的終了
                            ▼
                     ┌─────────┐
                     │ CLOSED  │
                     └─────────┘
```

---

## 8. デーモン起動設定

### PM2による常駐化

```bash
# PM2のインストール
npm install -g pm2

# アプリケーション起動
cd C:\ai_programming\claudecode\claude-slack-bridge
pm2 start src/index.ts --name claude-slack-bridge --interpreter tsx

# 設定の保存
pm2 save

# 起動状態の確認
pm2 status

# ログの確認
pm2 logs claude-slack-bridge
```

### Windows起動時の自動開始

PM2をWindowsサービス化する場合は `pm2-windows-startup` を使用:

```bash
npm install -g pm2-windows-startup
pm2-startup install
pm2 save
```

---

## 9. 依存関係

| パッケージ | バージョン | 用途 |
|-----------|----------|------|
| @slack/bolt | ^4.1.0 | Slack Bot Framework (Socket Mode対応) |
| express | ^4.21.0 | Webhook HTTPサーバー |
| better-sqlite3 | ^11.0.0 | セッション永続化（SQLite） |
| dotenv | ^16.4.0 | 環境変数管理 |
| tsx | ^4.7.0 | TypeScript実行 |
| typescript | ^5.6.0 | TypeScriptコンパイラ |

---

## 10. Windows環境での注意点

### 10.1. Hook設定

- Git Bashを明示的に指定: `C:\Program Files\Git\bin\bash.exe`
- パスはUnix形式で記述: `/c/ai_programming/...`

### 10.2. better-sqlite3のビルド

better-sqlite3はネイティブモジュールのため、ビルドツールが必要:

```bash
# Windows Build Tools のインストール（管理者権限）
npm install -g windows-build-tools

# または Visual Studio Build Tools をインストール
```

### 10.3. パス形式

- Node.js内ではバックスラッシュ形式（`C:\path`）でも動作
- child_processでのコマンド実行時は注意が必要

---

## 11. セキュリティ考慮事項

### 11.1. 認証情報の管理

- `.env`ファイルは`.gitignore`に追加
- Slack Tokenは環境変数経由でのみアクセス
- `KAKI_LOCAL_TOKEN` は十分な長さのランダム文字列を使用

### 11.2. Webhook エンドポイント（H-03対応）

- **ループバック限定**: `127.0.0.1:3456` でのみ待ち受け（外部公開不要）
- **トークン認証**: `Authorization: Bearer <token>` ヘッダーで認証
- **認証失敗時**: 401 Unauthorized を返却しログ記録

### 11.3. Slackイベント検証

- **Socket Mode**: Slack SDKが自動で署名検証を実施
- Socket Mode使用時は外部Webhookエンドポイント不要

### 11.4. ボット自己投稿の除外（H-03対応）

- `bot_id` が存在するメッセージは処理をスキップ
- `subtype` が存在するメッセージ（bot_message等）も除外
- これによりボットの投稿を自身が処理するループを防止

### 11.5. SQLiteセキュリティ

- データベースファイルの権限管理
- センシティブ情報（transcript_path等）の取り扱いに注意
- 監査ログ（events_log）には個人情報が含まれる可能性あり

---

## 12. 実装ステップまとめ

| Step | 内容 |
|------|------|
| 1 | Slack App作成・設定 |
| 2 | プロジェクト初期化・依存関係インストール |
| 3 | 環境変数設定 |
| 4 | Stop Hook設定（settings.json + スクリプト） |
| 5 | Node.jsデーモン実装 |
| 6 | PM2設定・動作確認 |

---

## 13. 既存ファイルの変更

| ファイル | 変更内容 |
|----------|---------|
| `~/.claude/settings.json` | `hooks.Stop` セクションを追加 |

---

## 14. 参考リンク

- [Slack Bolt for JavaScript - Socket Mode](https://tools.slack.dev/bolt-js/concepts/socket-mode/)
- [Claude Code Hooks Documentation](https://docs.anthropic.com/en/docs/claude-code/hooks)
- [better-sqlite3 Documentation](https://github.com/WiseLibs/better-sqlite3)
