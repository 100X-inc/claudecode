---
tags:
  - research
  - raw-data
  - sephora
  - braze
created: 2026-01-18
source: web-researcher
---

# T002: Sephora Braze/Engagement事例

## 信頼性評価: High
公式Braze事例ページからの情報

---

## 企業概要

- **会社名**: Sephora SEA（東南アジア）
- **業態**: 高級コスメリテーラー
- **課題**: 競争の激しい市場での差別化、AR機能の認知度向上

## キャンペーン事例1: Ang Pao（旧正月）キャンペーン

### 概要
- **期間**: 2020年1月15-17日（マレーシア市場）
- **目的**: 旧正月に合わせた記憶に残るエンゲージメント施策
- **手法**: バーチャル紅包（Ang Pao）配布

### 技術実装
- カスタムHTML in-app message
- Google Sheetsとの連携による動的景品配分
- JavaScript API統合によるリアルタイムデータ同期
- APIトリガーによる景品情報の動的取得
- 当選後のIAMでパーソナル情報をリアルタイムでプロファイルに追加

### ゲーミフィケーション戦略
- 伝統的なAng Pao贈答習慣を模倣
- 階層型リワード: キャッシュバウチャー、ロイヤリティポイント、プレミアム商品（Dysonヘアドライヤー）

### 成果

| 指標 | 結果 |
|------|------|
| 購入率向上 | **132%増**（キャンペーン参加者 vs 非参加者、30日間追跡） |

### 重要な発見
- 最低価値の景品を受け取った顧客が最も多くコンバージョン
- **ゲーミング要素自体**がエンゲージメントを促進（金銭的インセンティブではなく）

### 実装スピード
> 「企画から実行までわずか1ヶ月」
> - Geoffrey IP, Regional Mobile Marketing Manager, Sephora SEA

## キャンペーン事例2: Virtual Artist AR機能促進

### 背景・課題
- 優れたAR機能（Virtual Artist）を構築したが、ユーザー認知度が低い
- 機能採用率の向上が必要

### 戦略
- Virtual Artistの活用方法を紹介するステップバイステップ動画を制作
- 3つのチャネル（プッシュ、Content Cards、IAM）で効果的に配信
- 一斉配信ではなく、ターゲットグループを慎重に選定
- **ターゲット**: 過去30日間にメイク商品ページを閲覧したが、VAを使用していないユーザー

### 成果

| 指標 | 結果 |
|------|------|
| AR機能採用率 | **28%増** |
| AR機能全体トラフィック | **48%増** |
| ユーザーあたり使用回数 | **16%向上** |

## パーソナライゼーション戦略全般

### データ活用
- 顧客のショッピング習慣データを収集
- アプリ内コンテンツをユーザーごとにパーソナライズ

### アプリユーザーの価値
- アプリユーザーは平均的なSephora顧客の**2倍の年間支出**
- 購入頻度も**2倍**

### テクノロジースタック
- Adobe Target
- Certona
- Braze
- APT

---

## ソース

- [Braze公式事例: Sephora SEA パーソナライズドマーケティング](https://www.braze.com/customers/sephora-sea-case-study) - 取得日: 2026-01-18
- [Braze公式事例: Sephora SEA ARマーケティング](https://www.braze.com/customers/sephora-sea-case-study-ar) - 取得日: 2026-01-18
- [Braze動画: Sephora SEA ゲーミフィケーション](https://www.braze.com/resources/videos/sephora-case-study-2) - 取得日: 2026-01-18
