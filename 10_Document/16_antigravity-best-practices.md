---
name: antigravity-best-practices
description: Google Antigravity IDEのベストプラクティス
---

# Google Antigravity: ベストプラクティス

Google Antigravity IDEを効果的に活用するためのベストプラクティス集。

## 目次

1. [概要](#1-概要)
2. [主要機能](#2-主要機能)
3. [カスタマイズ](#3-カスタマイズ)
4. [Deep Thinkモード](#4-deep-thinkモード)
5. [Artifacts](#5-artifacts)
6. [ブラウザエージェント](#6-ブラウザエージェント)
7. [マルチエージェント](#7-マルチエージェント)
8. [セキュリティ設定](#8-セキュリティ設定)
9. [開発ベストプラクティス](#9-開発ベストプラクティス)
10. [Claude Codeとの連携](#10-claude-codeとの連携)
11. [公式リソース](#11-公式リソース)

---

## 1. 概要

### Google Antigravityとは

2025年11月にGemini 3と同時に発表されたGoogleのエージェントファーストIDE。

> "エージェントファーストの開発プラットフォームで、開発者がタスク指向のより高いレベルで作業できるようにする"

### 主な特徴

| 特徴 | 説明 |
|------|------|
| **エージェントファースト** | AIエージェントがエディタ、ターミナル、ブラウザに直接アクセス |
| **マルチエージェント** | 複数のエージェントを並列実行可能 |
| **Artifacts** | 計画、スクリーンショット、ブラウザ録画で信頼性を可視化 |
| **大規模コンテキスト** | Gemini 3 Proで100万トークン（約70万語）を処理 |

### 対応モデル

- **Gemini 3 Pro** - メインモデル（無料枠あり）
- **Gemini 3 Deep Think** - 高度な推論向け
- **Gemini 3 Flash** - 高速処理向け
- **Claude Sonnet 4.5** - Anthropicモデル対応
- **GPT-OSS** - OpenAIモデル対応

---

## 2. 主要機能

### 2.1 Editor View

従来のIDEに近いインターフェース。VS CodeやCursorに似た操作感。

```
┌─────────────────────────────────────┐
│  [ファイルツリー] │ [エディタ] │ [Agent] │
│                  │            │  サイド  │
│                  │            │  バー    │
└─────────────────────────────────────┘
```

**適用場面:**
- 個別ファイルの編集
- コードレビュー
- デバッグ

### 2.2 Manager View（Agent Manager）

マルチエージェントを監視・管理するコントロールセンター。

```
┌───────────────────────────────────────────┐
│  [Workspaces]  │  [Inbox]  │ [Conversation]│
│                │           │               │
│  Agent1: 実行中 │  Session  │  リアルタイム  │
│  Agent2: 完了   │  一覧     │  アクション    │
│  Agent3: 待機   │           │               │
└───────────────────────────────────────────┘
```

**適用場面:**
- 複数バグの同時修正
- 大規模リファクタリング
- 並列タスク実行

---

## 3. カスタマイズ

### 3.1 Rules（ルール）

常時有効な制約・ガイドライン。システムプロンプトのように動作。

**保存場所:**
- ワークスペース: `.agent/rules/`
- グローバル: `~/.gemini/antigravity/global_rules/`

**例: コーディング規約**
```markdown
# TypeScript Rules

- 常にTypeScript strict modeを使用
- anyの使用は禁止
- 関数には必ず戻り値の型を明示
```

**アクティベーション:**
- 常時有効、またはファイルタイプで条件付き

### 3.2 Workflows（ワークフロー）

ユーザーがオンデマンドで呼び出す保存済みプロンプト。

**保存場所:**
- ワークスペース: `.agent/workflows/`
- グローバル: `~/.gemini/antigravity/global_workflows/`

**呼び出し方:**
```
/test      - テスト実行ワークフロー
/review    - コードレビューワークフロー
/deploy    - デプロイワークフロー
```

**例: テストワークフロー**
```markdown
# Test Workflow

1. 変更されたファイルを特定
2. 関連するテストファイルを検出
3. ユニットテストを実行
4. カバレッジレポートを生成
```

### 3.3 Skills（スキル）

オンデマンドで読み込まれる拡張機能パッケージ。

**保存場所:**
- ワークスペース: `.agent/skills/`
- グローバル: `~/.gemini/antigravity/global_skills/`

**構造:**
```
my-skill/
├── SKILL.md        # 定義ファイル（必須）
├── references/     # 参照ドキュメント
├── examples/       # Few-shot例
└── scripts/        # 実行スクリプト
```

**Skillパターン:**

| パターン | 構成 | 用途 |
|---------|------|------|
| Basic Router | SKILL.mdのみ | シンプルな指示 |
| Reference | + /references | ドキュメント参照 |
| Few-shot | + /examples | 例ベースの学習 |
| Tool Use | + /scripts | スクリプト実行 |
| All in One | 全要素 | 複合機能 |

### 3.4 比較: Rules vs Workflows vs Skills

| 項目 | Rules | Workflows | Skills |
|------|-------|-----------|--------|
| 有効化 | 常時自動 | `/`で手動 | タスクに応じて自動 |
| 用途 | 制約・標準 | 定型タスク | 機能拡張 |
| コンテキスト | 常に読み込み | 呼び出し時 | 必要時のみ |

---

## 4. Deep Thinkモード

### 概要

Gemini 3 Proの拡張推論モード。複雑な問題に対して時間をかけて深く考える。

> "計算機と証明の選択に相当する推論の違い"

### 使い分け

| モード | 適用場面 | 特徴 |
|--------|---------|------|
| **Deep Think ON** | データ移行、複雑なリファクタ、アルゴリズム | 高精度、低速 |
| **Deep Think OFF** | クイック修正、ユーティリティ関数 | 低精度、高速 |

### ベストプラクティス

1. **難しい問題でON**
   - スキーマ移行
   - アーキテクチャ設計
   - 複雑なバグ調査

2. **簡単な作業でOFF**
   - UIの微調整
   - 定型コード生成
   - ドキュメント更新

3. **無料枠に注意**
   - Deep Thinkは追加のトークンを消費
   - 枠を超えると制限メッセージ

---

## 5. Artifacts

### 概要

エージェントが生成する検証可能な成果物。「Trust Gap」を解決。

> "エージェントが「バグを修正した」と主張する時、Artifactsがそれを証明する"

### Artifactタイプ

| タイプ | 説明 | 用途 |
|--------|------|------|
| **Task List** | 構造化された計画 | 実装前のレビュー |
| **Screenshots** | UI状態のキャプチャ | ビジュアル検証 |
| **Browser Recordings** | 操作の動画記録 | E2E検証 |
| **Code Diffs** | 差分表示 | コード変更の確認 |
| **Architecture Diagrams** | 設計図 | アーキテクチャ理解 |

### 表示場所

- **Editor View**: 右下の「Artifacts」ボタン
- **Manager View**: 右上の「Review changes」横のボタン

### フィードバック方法

```
1. Artifactを開く
2. 該当箇所をハイライト
3. コメントを入力
4. エージェントが読んで調整
```

**利点:** 会話をリスタートせずにコンテキストを維持

---

## 6. ブラウザエージェント

### 概要

Antigravityがブラウザを直接操作するサブエージェント。

### 利用可能なツール

| ツール | 説明 |
|--------|------|
| click | 要素をクリック |
| scroll | ページスクロール |
| type | テキスト入力 |
| read console | コンソールログ読み取り |
| screenshot | スクリーンショット撮影 |
| video | 操作の録画 |
| DOM capture | DOM構造の取得 |

### ユースケース

1. **自動QA**
   - コンポーネントをビルド
   - ブラウザで起動
   - 各状態でレンダリング検証

2. **ビジュアルリグレッション**
   - コード変更前後のスクリーンショット比較
   - CSSバグの自動検出
   - レイアウト崩れの発見

3. **E2Eテスト**
   - ボタンクリック
   - データ入力
   - 動作確認の録画

### Walkthrough Artifact

エージェントが生成する自動QAレポート:
- スクリーンショット
- 操作の動画クリップ
- 機能要件の検証結果

---

## 7. マルチエージェント

### Manager Viewの活用

```
┌─────────────────────────────────────┐
│        5つのバグを同時に修正         │
│                                     │
│  Agent1 → Bug #101  [████████ 80%]  │
│  Agent2 → Bug #102  [██████████ ✓]  │
│  Agent3 → Bug #103  [██████ 60%]    │
│  Agent4 → Bug #104  [████████████ ✓]│
│  Agent5 → Bug #105  [████ 40%]      │
└─────────────────────────────────────┘
```

### ワークスペース分離

複数エージェントが同じリポジトリで作業する際:

```
project/
├── .agent/
│   └── workspaces/
│       ├── agent1/  # Feature A
│       ├── agent2/  # Feature B
│       └── agent3/  # Bug fixes
```

### 並列実行のメリット

- **スループット倍増**: 5エージェント = 5倍の作業量
- **非同期実行**: 完了を待たずに次のタスクを開始
- **リソース効率**: 人間は監視のみ

### メンタルシフト

> "Editor Viewではコードを書く。Manager Viewでは複数エージェントを監督するアーキテクトになる"

---

## 8. セキュリティ設定

### コマンド制御

エージェントが実行するコマンドを制限。

**Allow List（許可リスト）:**
```
npm install
npm run test
git status
git diff
```

**Deny List（拒否リスト）:**
```
rm -rf
sudo
chmod 777
```

### 承認フロー

```
開発モード選択:
├── Agent-Assisted（推奨）
│   └── 安全な自動化、ユーザーが制御を維持
├── Review-Driven（バランス重視）
│   └── 決定後にユーザー承認を要求
└── Autonomous
    └── 完全自律（要注意）
```

### ベストプラクティス

1. **Review-Drivenで開始**
   - 信頼を構築しながら段階的に権限を拡大

2. **コスト発生・永続的変更は承認必須**
   - クラウドリソース作成
   - データベース変更
   - 本番デプロイ

---

## 9. 開発ベストプラクティス

### 9.1 プロンプトの書き方

**悪い例:**
```
エラーハンドリングを追加して
```

**良い例:**
```
api/upload.jsのuploadFile関数にtry-catchエラーハンドリングを追加し、
適切なHTTPステータスコードを返すようにしてください:
- バリデーションエラー: 400
- サーバーエラー: 500
```

### 9.2 Artifactフィードバックループ

```
1. 計画（Task List）のArtifactを依頼
2. 内容をレビュー・コメント
3. コード生成前に調整
4. 実装後にスクリーンショットで確認
```

### 9.3 アーキテクチャガイダンス

> "AIは実装詳細を埋めるのが得意だが、広いコンテキストや非機能要件は明示的に伝える必要がある"

```
## 要件
- React + TypeScript
- 状態管理はZustand
- APIクライアントはtanstack-query
- テストはVitest

## 制約
- バンドルサイズ100KB以下
- IE11サポート不要
```

### 9.4 モデル選択

| タスク | 推奨モデル |
|--------|-----------|
| 高速イテレーション、UI調整 | Flash / 低推論設定 |
| 難しいリファクタ、バグ調査 | Pro + Deep Think |
| 大規模リポジトリ分析 | 計画を先に立てて分割実行 |

### 9.5 レガシーコードの注意

> "Gemini 3の学習データにない独自ライブラリを使っている場合、エージェントは標準ライブラリを想定して互換性のないコードを生成することがある"

**対策:**
- Rulesで独自パターンを明示
- Skillsにライブラリドキュメントを含める
- 常に出力をレビュー

---

## 10. Claude Codeとの連携

### antigravity-claude-proxy

AntigravityとClaude Codeを連携するプロキシサーバー。

**インストール:**
```bash
npx antigravity-claude-proxy@latest start
# または
npm install -g antigravity-claude-proxy
```

**動作:**
- `http://localhost:8080`でAnthropic互換APIを提供
- Antigravityのトークンを使用してClaudeモデルを実行

### 使い分け

| ツール | 強み | 適用場面 |
|--------|------|---------|
| **Antigravity** | マルチエージェント、ビジュアル検証 | 新機能開発、アーキテクチャ設計 |
| **Claude Code** | 複雑な自律タスク、Git統合 | 大規模リファクタ、本番デプロイ |
| **Cursor** | 日常開発、チーム協業 | クイック編集、細かい修正 |

### 組み合わせワークフロー

```
1. Antigravityで全体設計・スキャフォールディング
2. Claude Codeで複雑な実装
3. Cursorで細部の調整
4. Antigravityでビジュアル検証
```

---

## 11. 公式リソース

### ドキュメント

| リソース | URL |
|---------|-----|
| 公式サイト | https://antigravityai.org/ |
| Docs: Skills | https://antigravity.google/docs/skills |
| Docs: Rules & Workflows | https://antigravity.google/docs/rules-workflows |
| Docs: Browser | https://antigravity.google/docs/browser |

### チュートリアル

| リソース | URL |
|---------|-----|
| Getting Started (Codelabs) | https://codelabs.developers.google.com/getting-started-google-antigravity |
| Skills Tutorial (Codelabs) | https://codelabs.developers.google.com/getting-started-with-antigravity-skills |
| Codecademy Guide | https://www.codecademy.com/article/how-to-set-up-and-use-google-antigravity |

### コミュニティ

| リソース | URL |
|---------|-----|
| Wikipedia | https://en.wikipedia.org/wiki/Google_Antigravity |
| antigravity-claude-proxy | https://github.com/badrisnarayanan/antigravity-claude-proxy |
| Workspace Template | https://github.com/study8677/antigravity-workspace-template |

### 関連記事

| リソース | URL |
|---------|-----|
| Google Developers Blog | https://developers.googleblog.com/build-with-google-antigravity-our-new-agentic-development-platform/ |
| Customize Rules & Workflows | https://atamel.dev/posts/2025/11-25_customize_antigravity_rules_workflows/ |
| Index.dev Blog | https://www.index.dev/blog/google-antigravity-agentic-ide |

---

## まとめ: 5つのコア原則

1. **Artifactsを活用** - 信頼性を可視化し、フィードバックループを確立
2. **Rules/Workflows/Skillsを整備** - 繰り返しを減らし、一貫性を確保
3. **モデルを使い分け** - タスクの複雑さに応じてDeep Thinkを切り替え
4. **Manager Viewでスケール** - マルチエージェントで並列作業
5. **監視を怠らない** - 特にレガシーコードや独自パターンでは人間のレビューが必須
