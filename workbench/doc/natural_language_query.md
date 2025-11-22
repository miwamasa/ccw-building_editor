# 自然言語クエリプロンプト

## 目次

1. [概要](#概要)
2. [プロンプト構造](#プロンプト構造)
3. [クエリ処理フロー](#クエリ処理フロー)
4. [クエリ例とレスポンス](#クエリ例とレスポンス)
5. [プロンプトのカスタマイズ](#プロンプトのカスタマイズ)
6. [ベストプラクティス](#ベストプラクティス)
7. [トラブルシューティング](#トラブルシューティング)

---

## 概要

本ワークベンチは、**自然言語（日本語）**での問い合わせにより、建物のセンサー情報を検索できる機能を提供します。AIを活用することで、専門知識がなくても直感的にセンサー情報を取得できます。

### 主な特徴

- **日本語での問い合わせ**: 専門用語を知らなくても質問可能
- **セマンティック検索**: 意味を理解した検索
- **マッピング情報の統合**: 論理センサーと物理センサーを同時に提示
- **JSON形式の出力**: プログラムから利用可能な構造化データ

### 使用例

```
質問: 会議室101の温度センサーを教えて

回答:
{
  "sensorlist": [
    {
      "generated": "会議室101温度センサー",
      "concrete": "Room101温度計"
    }
  ]
}
```

---

## プロンプト構造

自然言語クエリのプロンプトは、以下の要素で構成されています：

### 1. システムロール

```
あなたは建物のセンサー情報を検索・分析するAIアシスタントです。
```

AIの役割を明確に定義し、専門的な回答を促します。

### 2. 建物データの提供

```
以下の建物データが提供されます：
<building_data>
{buildingData}
</building_data>
```

**buildingData** には以下の情報が含まれます：

```json
{
  "building": {
    "id": "Building_A",
    "name": "東京グリーンタワー",
    "location": "東京都千代田区",
    "totalArea": 2400
  },
  "floors": [...],
  "largeZones": [...],
  "smallZones": [...],
  "rooms": [...],
  "centralHVAC": {
    "chillers": [...],
    "ahus": [...],
    "vavs": [...]
  },
  "individualHVAC": {
    "vrfs": [...]
  },
  "sensors": [
    {
      "id": "ROM:Room_101:AMB:TEMP",
      "name": "会議室101温度センサー",
      "type": "temperature",
      "equipmentId": "Room_101",
      "unit": "°C"
    },
    ...
  ]
}
```

### 3. センサーマッピング情報

```
以下のセンサーマッピング情報が提供されます：
<sensor_mapping>
{sensorMappings}
</sensor_mapping>
```

**sensorMappings** には、論理センサーと物理センサーの対応関係が含まれます：

```json
[
  {
    "generatedSensorId": "ROM:Room_101:AMB:TEMP",
    "generatedSensorName": "会議室101温度センサー",
    "physicalSensorId": "PHY_TEMP_101",
    "physicalSensorName": "Room101温度計",
    "confidence": 0.95,
    "reason": "部屋番号とセンサータイプが完全一致"
  },
  ...
]
```

### 4. タスク定義

```
ユーザーからの質問に基づいて、該当するセンサーを特定し、
生成センサー（generated sensor）と対応する物理センサー（physical sensor）の
情報を併記してJSON形式で回答してください。
```

### 5. 処理手順

```
処理手順：
1. ユーザーの質問を分析し、求められているセンサーの種類や設置場所を特定する
2. 建物データのsensorsリストから、質問に該当するセンサーを検索する
   （センサー名、タイプ、設置場所などを考慮）
3. 特定した各センサーについて、センサーマッピング情報から対応する
   物理センサーの情報を取得する
4. 結果をJSON形式で出力する
```

この明確な手順により、AIが一貫した処理を行います。

### 6. 出力形式

```
出力形式：
```json
{
  "sensorlist": [
    {
      "generated": "生成センサー名（generatedSensorName）",
      "concrete": "物理センサー名（physicalSensorName）"
    }
  ]
}
```
```

JSON形式を指定することで、プログラムから扱いやすい構造化データを取得できます。

### 7. 注意事項

```
注意事項：
- センサーマッピング情報にない生成センサーの場合は、
  "concrete"フィールドに"マッピング情報なし"と記載してください
- 質問に該当するセンサーが複数ある場合は、すべてリストに含めてください
- センサー名は正確にデータから取得してください
```

### 8. ユーザークエリ

```
質問：
{query}
```

ユーザーが入力した質問がここに挿入されます。

---

## クエリ処理フロー

### 1. クエリ入力

```
ユーザー入力: "会議室の温度センサーを教えて"
```

### 2. プロンプト構築

システムは以下の処理を行います：

```javascript
// 1. 建物データをJSON文字列化
const buildingDataStr = JSON.stringify(buildingData, null, 2);

// 2. センサーマッピングをJSON文字列化
const sensorMappingsStr = JSON.stringify(sensorMappings, null, 2);

// 3. プロンプトテンプレートに挿入
const fullPrompt = queryPromptTemplate
    .replace('{buildingData}', buildingDataStr)
    .replace('{sensorMappings}', sensorMappingsStr)
    .replace('{query}', userQuery);
```

### 3. AI API呼び出し

```javascript
const response = await callActualAPI(
    fullPrompt,
    apiProvider,  // 'openai', 'anthropic', etc.
    apiModel,     // 'gpt-4o-mini', etc.
    apiEndpoint,
    apiKey
);
```

### 4. レスポンス解析

```javascript
// JSONレスポンスを抽出
const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/);
const result = JSON.parse(jsonMatch[1]);

// sensorlistを取得
const sensors = result.sensorlist;
```

### 5. 結果表示

```javascript
sensors.forEach(sensor => {
    console.log(`生成センサー: ${sensor.generated}`);
    console.log(`物理センサー: ${sensor.concrete}`);
});
```

---

## クエリ例とレスポンス

### 例1: 特定の部屋のセンサー

**質問:**
```
会議室101の温度センサーを教えて
```

**AI処理:**
1. "会議室101" → `Room_101` を特定
2. "温度センサー" → `type: "temperature"` でフィルタ
3. センサーIDを検索: `ROM:Room_101:AMB:TEMP`
4. マッピング情報から物理センサーを取得

**回答:**
```json
{
  "sensorlist": [
    {
      "generated": "会議室101温度センサー",
      "concrete": "Room101温度計"
    }
  ]
}
```

### 例2: 特定機器のセンサー

**質問:**
```
AHU1の給気温度を教えて
```

**AI処理:**
1. "AHU1" → `AHU_1` を特定
2. "給気温度" → `SUP_AIR:TEMP` を推論
3. センサーIDを検索: `AHU:AHU_1:SUP_AIR:TEMP`

**回答:**
```json
{
  "sensorlist": [
    {
      "generated": "外調機1_給気温度センサー",
      "concrete": "給気温度計1F-AHU1"
    }
  ]
}
```

### 例3: 複数センサーの検索

**質問:**
```
1階のセンサー一覧
```

**AI処理:**
1. "1階" → `Floor_1` に関連する全センサーを検索
2. 階層構造を参照して該当センサーを特定
3. 複数のセンサーをリストアップ

**回答:**
```json
{
  "sensorlist": [
    {
      "generated": "ラージゾーン1A室温センサー",
      "concrete": "Zone1A温度計"
    },
    {
      "generated": "会議室101温度センサー",
      "concrete": "Room101温度計"
    },
    {
      "generated": "会議室101CO2センサー",
      "concrete": "Room101CO2計"
    }
  ]
}
```

### 例4: センサータイプでの検索

**質問:**
```
外気温度センサーを教えて
```

**AI処理:**
1. "外気" → `OUT` コンテキスト
2. "温度" → `TEMP` センサータイプ
3. 該当センサーを検索

**回答:**
```json
{
  "sensorlist": [
    {
      "generated": "建物外気温度センサー",
      "concrete": "外気温センサーA棟"
    },
    {
      "generated": "外調機1_外気温度センサー",
      "concrete": "AHU1外気温度計"
    },
    {
      "generated": "VRFユニット1室外温度センサー",
      "concrete": "VRF1室外機温度センサー"
    }
  ]
}
```

### 例5: マッピング情報がない場合

**質問:**
```
会議室102の温度センサーを教えて
```

**AI処理:**
1. センサーは建物データに存在
2. しかしマッピング情報が未登録

**回答:**
```json
{
  "sensorlist": [
    {
      "generated": "会議室102温度センサー",
      "concrete": "マッピング情報なし"
    }
  ]
}
```

---

## プロンプトのカスタマイズ

ワークベンチでは、プロンプトテンプレートをカスタマイズできます。

### カスタマイズ方法

1. 「自然言語クエリ」画面で「プロンプト編集」ボタンをクリック
2. プロンプトテンプレートを編集
3. 「保存」をクリック

### カスタマイズ例1: 詳細情報の追加

**デフォルト:**
```
出力形式：
{
  "sensorlist": [
    {
      "generated": "生成センサー名",
      "concrete": "物理センサー名"
    }
  ]
}
```

**カスタマイズ後:**
```
出力形式：
{
  "sensorlist": [
    {
      "generated": "生成センサー名",
      "generatedId": "生成センサーID",
      "concrete": "物理センサー名",
      "concreteId": "物理センサーID",
      "unit": "単位",
      "location": "設置場所"
    }
  ]
}
```

### カスタマイズ例2: 説明文の追加

**追加内容:**
```
- センサーの種類についても簡潔に説明を加えてください
- 測定対象の用途（空調制御、監視等）も記載してください
```

**期待される出力:**
```json
{
  "sensorlist": [
    {
      "generated": "会議室101温度センサー",
      "concrete": "Room101温度計",
      "description": "会議室の室温を測定。VRF空調制御に使用。",
      "purpose": "空調制御"
    }
  ]
}
```

### カスタマイズ例3: 多言語対応

**英語版プロンプト:**
```
You are an AI assistant for searching and analyzing building sensor information.

Building data is provided below:
<building_data>
{buildingData}
</building_data>

Sensor mapping information is provided below:
<sensor_mapping>
{sensorMappings}
</sensor_mapping>

Based on the user's question, identify the relevant sensors and respond in JSON format
with both generated sensor and physical sensor information.

Output format:
```json
{
  "sensorlist": [
    {
      "generated": "Generated sensor name",
      "concrete": "Physical sensor name"
    }
  ]
}
```

Question:
{query}
```

---

## ベストプラクティス

### 1. 具体的な質問をする

**良い例:**
- "会議室101の温度センサーを教えて"
- "AHU1の給気温度センサーは？"
- "1階東側の湿度センサー一覧"

**悪い例:**
- "センサーを教えて"（範囲が広すぎる）
- "温度」（不完全な質問）

### 2. センサー命名規則を活用

オントロジーベースの命名規則を理解していると、より正確な検索が可能：

```
質問: "AHU1のSUP_AIRのTEMPセンサーは？"
→ より正確に AHU:AHU_1:SUP_AIR:TEMP を特定
```

### 3. 階層構造を活用

```
質問: "LargeZone_1Aのセンサー一覧"
→ 階層構造を理解したAIが、関連するSmallZoneやRoomのセンサーも含めて提示
```

### 4. 自然な表現も可能

```
質問: "1階の会議室の空気質を測っているセンサーは？"
→ AIが "空気質" を CO2、温度、湿度センサーと解釈
```

### 5. 複数条件の組み合わせ

```
質問: "1階で、温度と湿度を測定しているセンサーを全て教えて"
→ 複数の条件（階層、センサータイプ）を組み合わせた検索
```

---

## トラブルシューティング

### Q1: 検索結果が返ってこない

**原因:**
- 建物データが読み込まれていない
- センサーが存在しない
- クエリが曖昧すぎる

**対策:**
1. サンプルデータを読み込む
2. 建物エディタでセンサーを確認
3. より具体的な質問に変更

### Q2: JSONパースエラー

**原因:**
- AIのレスポンスがJSON形式でない
- レスポンスに余計なテキストが含まれる

**対策:**
1. プロンプトで出力形式を明確に指定
2. デバッグモードでAIのレスポンスを確認
3. APIモデルを変更（GPT-4o-miniを推奨）

### Q3: 物理センサー情報が"マッピング情報なし"

**原因:**
- センサーマッピングが実行されていない
- マッピングの信頼度が低く、結果に含まれていない

**対策:**
1. センサーマッピングを実行
2. 物理センサーCSVを読み込む
3. AIマッチングを試す（より高精度）

### Q4: 関係ないセンサーが含まれる

**原因:**
- クエリが曖昧
- AIの解釈が広すぎる

**対策:**
1. より具体的な質問に変更
2. センサーIDやエンティティIDを明示
3. プロンプトに制約条件を追加

### Q5: API呼び出しエラー

**原因:**
- APIキーが無効
- バックエンドサーバーが起動していない
- API利用制限

**対策:**
1. API設定を確認
2. バックエンドサーバーを起動（`npm start`）
3. APIプロバイダーのコンソールで利用状況を確認

---

## 高度な活用

### プロンプトエンジニアリング

より高度な検索のために、プロンプトに以下を追加できます：

#### 1. センサーの状態判定

```
追加指示：
- 各センサーの現在の状態（正常、異常）も判定してください
- 異常がある場合は、その理由も記載してください
```

#### 2. 推奨事項の提示

```
追加指示：
- センサーの配置に関する推奨事項があれば提示してください
- 不足しているセンサーがあれば指摘してください
```

#### 3. データ分析

```
追加指示：
- 検索されたセンサーの種類別の統計情報も提示してください
- 各エリアのセンサー密度を比較してください
```

---

## 関連ドキュメント

- [オントロジー解説](ontology_guide.md)
- [センサー命名規則](sensor_naming_rules.md)
- [マッチングアルゴリズム](matching_algorithms.md)

---

**最終更新**: 2025-11-22
