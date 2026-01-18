---
name: plans-md
description: PLANS.mdを使用した複雑な長時間タスクの管理手法
---

# PLANS.md による複雑タスク管理

PLANS.mdは、数時間に及ぶ複雑なタスクをCodexに実行させるための構造化されたアプローチです。

## 目次

1. [概要](#概要)
2. [PLANS.mdの構造](#plansmdの構造)
3. [必須セクション](#必須セクション)
4. [使用方法](#使用方法)
5. [実践例](#実践例)
6. [ベストプラクティス](#ベストプラクティス)
7. [Plan Modeワークフロー](#plan-modeワークフロー)

---

## 概要

### PLANS.mdとは

- 複雑なタスクの設計ドキュメント
- 「生きたドキュメント」として進捗を追跡
- Codexが7時間以上の自律作業を可能にするパターン
- 実装前に計画をレビュー可能

### いつ使うか

| シナリオ | PLANS.md使用 |
|---------|-------------|
| 単純なバグ修正 | 不要 |
| 新機能追加（小） | 任意 |
| 大規模リファクタリング | **推奨** |
| アーキテクチャ変更 | **必須** |
| マイグレーション | **必須** |
| 複数日にわたる作業 | **必須** |

### メリット

1. **事前レビュー**: 実装前に計画を確認
2. **進捗追跡**: どこまで完了したか明確
3. **決定記録**: なぜその設計にしたか記録
4. **再開可能**: 中断しても続きから再開
5. **品質向上**: TDD、検証ステップを強制

---

## PLANS.mdの構造

### 基本テンプレート

```markdown
# ExecPlan: [タスク名]

## Overview
タスクの概要と目的。

## Goals
- 主要ゴール1
- 主要ゴール2

## Non-Goals
- やらないこと1
- やらないこと2

## Milestones
1. **Milestone 1**: [説明]
2. **Milestone 2**: [説明]
3. **Milestone 3**: [説明]

## Progress
- [x] Step 1 完了 (2024-01-15 10:00)
- [x] Step 2 完了 (2024-01-15 10:30)
- [ ] Step 3 進行中
- [ ] Step 4 未着手

## Surprises & Discoveries
作業中に発見した予期せぬ事項を記録。

## Decision Log
| 日時 | 決定 | 理由 |
|------|------|------|
| 2024-01-15 | Redis使用 | スケーラビリティ要件 |

## Outcomes & Retrospective
完了後の振り返りと成果。
```

---

## 必須セクション

### 1. Progress（進捗）

**最も重要なセクション**。チェックボックス形式が必須。

```markdown
## Progress

- [x] Set up project structure (2024-01-15 09:00)
- [x] Implement data models (2024-01-15 09:30)
- [x] Create API endpoints - GET /users (2024-01-15 10:00)
- [x] Create API endpoints - POST /users (2024-01-15 10:15)
- [ ] Create API endpoints - PUT /users (in progress)
- [ ] Create API endpoints - DELETE /users
- [ ] Add authentication middleware
- [ ] Write unit tests
- [ ] Write integration tests
- [ ] Update documentation
```

**ルール**:
- タイムスタンプを含める（進捗速度を測定）
- 部分完了は分割（「done」と「remaining」）
- 常に現在の状態を正確に反映

### 2. Surprises & Discoveries（発見事項）

```markdown
## Surprises & Discoveries

- **2024-01-15 10:30**: The existing User model doesn't have an `email` field.
  Need to add migration before proceeding.

- **2024-01-15 11:00**: Found deprecated authentication method in use.
  Will need to update as part of this work.

- **2024-01-15 14:00**: Performance tests revealed N+1 query issue.
  Added optimization task to Progress.
```

予期せぬ問題、依存関係、技術的負債を記録。

### 3. Decision Log（決定ログ）

```markdown
## Decision Log

| Date | Decision | Rationale | Alternatives Considered |
|------|----------|-----------|------------------------|
| 2024-01-15 | Use JWT for auth | Stateless, scalable | Session-based (rejected: scaling issues) |
| 2024-01-15 | PostgreSQL over MongoDB | Relational data, ACID | MongoDB (rejected: complex joins needed) |
| 2024-01-15 | Add Redis cache | High read traffic expected | In-memory cache (rejected: multi-instance) |
```

**すべての重要な設計決定**を記録。後から「なぜ」を理解するため。

### 4. Outcomes & Retrospective（成果と振り返り）

```markdown
## Outcomes & Retrospective

### Completed
- ✅ User CRUD API implemented
- ✅ JWT authentication added
- ✅ 95% test coverage achieved

### Metrics
- Total time: 4 hours 30 minutes
- Files changed: 23
- Lines added: 1,250
- Lines removed: 340

### Lessons Learned
- Database migration should be planned earlier
- Integration tests caught 3 issues unit tests missed
- Documentation took longer than expected

### Follow-up Items
- [ ] Monitor performance in production
- [ ] Consider rate limiting
```

---

## 使用方法

### 1. 計画フェーズ（Read-Only）

```bash
# Read-only モードで計画を立てる
codex --sandbox read-only

> Create a PLANS.md for implementing user authentication.
> Analyze the codebase first and propose a detailed plan.
```

Codexがコードベースを分析し、PLANS.mdを生成。

### 2. レビューフェーズ

生成されたPLANS.mdを確認:
- ゴールは適切か
- マイルストーンは現実的か
- 見落としはないか

### 3. 実装フェーズ

```bash
codex --full-auto

> Execute the plan in PLANS.md.
> Update the Progress section as you complete each step.
> Record any surprises in the Surprises & Discoveries section.
```

### 4. 再開

```bash
# セッションを再開
codex resume --last

> Continue with the plan. Check PLANS.md for current progress.
```

---

## 実践例

### 大規模リファクタリング

```markdown
# ExecPlan: Migrate from Express to Fastify

## Overview
Replace Express.js with Fastify for improved performance and TypeScript support.

## Goals
- Migrate all 45 API endpoints to Fastify
- Maintain 100% API compatibility
- Improve response time by 30%

## Non-Goals
- Database changes
- Frontend modifications
- New feature additions

## Milestones
1. **Setup**: Fastify project structure, shared utilities
2. **Auth Routes**: /auth/* endpoints (8 routes)
3. **User Routes**: /users/* endpoints (12 routes)
4. **Product Routes**: /products/* endpoints (15 routes)
5. **Order Routes**: /orders/* endpoints (10 routes)
6. **Testing**: Full regression testing
7. **Deployment**: Staged rollout

## Progress
- [x] Initialize Fastify project (2024-01-15 09:00)
- [x] Setup TypeScript configuration (2024-01-15 09:15)
- [x] Create plugin structure (2024-01-15 09:30)
- [x] Migrate auth middleware (2024-01-15 10:00)
- [x] /auth/login endpoint (2024-01-15 10:20)
- [x] /auth/logout endpoint (2024-01-15 10:30)
- [ ] /auth/register endpoint (in progress)
- [ ] /auth/refresh endpoint
... [remaining routes]

## Surprises & Discoveries
- 2024-01-15 10:15: Express middleware uses `req.user` pattern.
  Fastify uses `request.user`. Created adapter for compatibility.

## Decision Log
| Date | Decision | Rationale |
|------|----------|-----------|
| 2024-01-15 | Keep route paths identical | Zero frontend changes needed |
| 2024-01-15 | Use @fastify/express plugin temporarily | Gradual migration |

## Outcomes & Retrospective
[To be completed]
```

### 新機能実装

```markdown
# ExecPlan: Implement Real-time Notifications

## Overview
Add WebSocket-based real-time notification system.

## Goals
- Push notifications for orders, messages, alerts
- Support 10,000 concurrent connections
- < 100ms delivery latency

## Non-Goals
- Push notifications (mobile)
- Email notifications
- SMS notifications

## Technical Design
### Architecture
- WebSocket server: Socket.io
- Message queue: Redis Pub/Sub
- Storage: PostgreSQL (notification history)

### Data Flow
1. Event occurs (e.g., new order)
2. Service publishes to Redis channel
3. WebSocket server receives and broadcasts
4. Client receives and displays

## Milestones
1. **Infrastructure**: WebSocket server, Redis setup
2. **Core**: Connection management, authentication
3. **Features**: Notification types, preferences
4. **Testing**: Load testing, failover
5. **Integration**: Frontend integration

## Progress
- [x] Design document approved
- [x] Redis Pub/Sub setup
- [ ] WebSocket server implementation (in progress)
...
```

---

## ベストプラクティス

### 1. 計画は文字通りに従う

```
# AGENTS.mdに追加
When executing an ExecPlan:
- Follow PLANS.md to the letter
- Update Progress after each step
- Record all discoveries and decisions
- Never skip verification steps
```

### 2. マイルストーンと進捗を区別

```markdown
## Milestones
# ストーリーを語る - 大きな区切り
1. Foundation
2. Core Features
3. Testing
4. Deployment

## Progress
# 詳細なタスク追跡
- [x] Task 1.1
- [x] Task 1.2
- [ ] Task 1.3
```

### 3. タイムスタンプを活用

```markdown
## Progress
- [x] Setup (09:00-09:30) 30min
- [x] Implementation (09:30-11:00) 90min
- [x] Testing (11:00-11:30) 30min
```

進捗速度を測定し、見積もりを改善。

### 4. 決定は必ず記録

```markdown
## Decision Log

# Good ✓
| 2024-01-15 | Use Redis | High availability needed | Memcached (less features) |

# Bad ✗
| 2024-01-15 | Use Redis | - | - |
```

理由と代替案を必ず記録。

### 5. 部分完了を正確に記録

```markdown
## Progress
# タスクが途中の場合
- [x] Implement user routes - GET, POST (2024-01-15 10:00)
- [ ] Implement user routes - PUT, DELETE (remaining)

# 「Implement user routes」を2つに分割
```

---

## Plan Modeワークフロー

### 現在のアプローチ（公式）

Codex CLIには専用のPlan Modeはないが、Read-Onlyモードで実現:

```bash
# 1. Read-Onlyで計画
codex --sandbox read-only
> Analyze the codebase and create a PLANS.md for [task]

# 2. 計画をレビュー（人間）
cat PLANS.md

# 3. 承認後、実装
codex --full-auto
> Execute the plan in PLANS.md
```

### 提案されているPlan Mode

```
# 将来的に期待される機能
codex --plan-mode

# フロー:
1. 情報収集・分析
2. 計画提案
3. ユーザーレビュー
4. 承認/フィードバック
5. 計画修正
6. 最終承認
7. 実行
```

### 安全な計画のメリット

```
Plan Mode (Read-Only):
- ファイルは変更されない
- 設計を安全に探索
- ビルドを壊さずに検討
- コード変更前にレビュー可能
```

---

## 関連ドキュメント

- [02_agents-md.md](02_agents-md.md) - AGENTS.md
- [09_exec-mode.md](09_exec-mode.md) - Exec Mode
- [12_session-management.md](12_session-management.md) - セッション管理
- [15_best-practices.md](15_best-practices.md) - ベストプラクティス

### 外部リソース

- [Using PLANS.md for multi-hour problem solving](https://cookbook.openai.com/articles/codex_exec_plans) - OpenAI Cookbook
- [Modernizing your Codebase with Codex](https://cookbook.openai.com/examples/codex/code_modernization)
