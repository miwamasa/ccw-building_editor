# Building Model Workbench - Backend Server

バックエンドサーバーを使用して、AI APIを安全に呼び出すための設定手順です。

## 概要

このバックエンドサーバーは：
- ブラウザのCORS制限を回避
- APIキーをクライアント側に露出させない
- OpenAI、Anthropic (Claude)、Google (Gemini) の3つのプロバイダーに対応

## セットアップ手順

### 1. Node.jsのインストール確認

```bash
node --version
npm --version
```

Node.js がインストールされていない場合は、[公式サイト](https://nodejs.org/)からダウンロードしてください（推奨: LTS版）。

### 2. 依存パッケージのインストール

```bash
cd workbench
npm install
```

### 3. サーバーの起動

```bash
npm start
```

または開発モード（ファイル変更時に自動再起動）:

```bash
npm run dev
```

### 4. ブラウザでアクセス

サーバー起動後、以下のURLにアクセス:

```
http://localhost:3001/building_model_workbench.html
```

## 使用方法

1. **API設定画面**で各プロバイダーのAPIキーを設定
2. **カスタムエンドポイント**は空欄のままでOK（自動的にローカルサーバー経由になります）
3. **自然言語クエリ**でAIに質問

## エンドポイント

### ヘルスチェック
```
GET http://localhost:3001/health
```

### OpenAI
```
POST http://localhost:3001/api/openai
```

### Anthropic (Claude)
```
POST http://localhost:3001/api/anthropic
```

### Google (Gemini)
```
POST http://localhost:3001/api/google
```

## トラブルシューティング

### ポートが既に使用されている

デフォルトポート3001が使用中の場合、環境変数で変更できます:

```bash
PORT=3002 npm start
```

### CORS エラーが出る

サーバーが正しく起動しているか確認してください。ブラウザのコンソールでエラーメッセージを確認してください。

### API呼び出しが失敗する

1. APIキーが正しく設定されているか確認
2. サーバーのコンソールログでエラー詳細を確認
3. デバッグモードをONにして、詳細情報を確認

## セキュリティ注意事項

### 開発環境
- このサーバーは開発・テスト用です
- CORS設定が緩いため、本番環境では使用しないでください

### 本番環境
本番環境で使用する場合は以下を実装してください：
1. 環境変数でAPIキーを管理（`.env`ファイル使用）
2. CORS設定を厳格化（特定のオリジンのみ許可）
3. レート制限の実装
4. HTTPSの使用（Let's Encrypt等）
5. 認証・認可の実装

## ディレクトリ構成

```
workbench/
├── server.js                           # バックエンドサーバー
├── package.json                        # 依存関係定義
├── building_model_workbench.html       # フロントエンド
├── building_ontology.ttl               # オントロジー定義
├── sample_physical_sensors.csv         # サンプルデータ
└── README_SERVER.md                    # このファイル
```

## 開発

### ログ出力

サーバーはコンソールにリクエスト情報を出力します:
- API呼び出しのプロバイダー
- エラー詳細
- レスポンス状態

### デバッグ

`server.js`内の`console.error()`や`console.log()`を追加してデバッグできます。

## ライセンス

MIT
