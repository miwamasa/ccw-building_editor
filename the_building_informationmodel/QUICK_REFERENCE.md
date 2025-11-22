# ハイブリッド空調システム情報モデル - クイックリファレンス

## 📁 ファイル一覧

| ファイル名 | 説明 | 用途 |
|-----------|------|------|
| `hvac_information_model.ttl` | 情報モデル定義 | システムの構造とセンサー配置を定義 |
| `building_example_with_data.ttl` | ビル例とデータ | 具体的なセンサーデータの例 |
| `test_queries.sparql` | テストケース | モデル検証用のSPARQLクエリ集 |
| `visualization_diagram.md` | 構成図 | システムの視覚的な説明 |
| `README.md` | ドキュメント | 詳細な説明とガイド |

## 🏢 システム構成の要点

### 建物構造
```
Building (2階建て)
  ├─ Floor_1 (1階)
  │   ├─ Large Zone 1A (3つの小ゾーン)
  │   └─ Large Zone 1B (2つの小ゾーン)
  └─ Floor_2 (2階)
      └─ Large Zone 2A (2つの小ゾーン)
```

### 空調機器
- **全館空調**: 1台のチラー、2台の外調機(AHU)、4台のVAV
- **個別空調**: 3台のVRF室外機
- **特徴**: VRF_Unit_1が大ゾーン1Aと1Bをまたぐ横断構成

### センサー配置（省エネ運転用）
| センサー | 数 | 主な用途 |
|---------|---|---------|
| 外気温度 | 2 | 外気冷房判断 |
| 給気温度 | 2 | 性能評価 |
| 還気温度 | 2 | 効率評価 |
| 還気湿度 | 2 | 除湿性能 |
| 室温 | 3 | 快適性評価 |
| 室湿度 | 2 | 快適性評価 |
| 電力 | 4 | エネルギー評価 |

## 🔍 主要なBrick Schemaクラス

### 建物・ゾーン
- `brick:Building` - 建物
- `brick:Floor` - 階
- `brick:HVAC_Zone` - 空調ゾーン
- `brick:Room` - 部屋

### 設備
- `brick:Chiller` - チラー(冷凍機)
- `brick:AHU` - 外調機
- `brick:VAV` - 変風量ユニット
- `brick:Variable_Frequency_Drive` - VRF

### センサー
- `brick:Outside_Air_Temperature_Sensor` - 外気温センサー
- `brick:Supply_Air_Temperature_Sensor` - 給気温センサー
- `brick:Return_Air_Temperature_Sensor` - 還気温センサー
- `brick:Return_Air_Humidity_Sensor` - 還気湿度センサー
- `brick:Zone_Air_Temperature_Sensor` - 室温センサー
- `brick:Zone_Air_Humidity_Sensor` - 室湿度センサー
- `brick:Electric_Power_Sensor` - 電力センサー

## 🔗 主要な関係性プロパティ

| プロパティ | 意味 | 例 |
|-----------|------|---|
| `brick:hasPart` | 〜を含む | Building hasPart Floor |
| `brick:isPartOf` | 〜に含まれる | Floor isPartOf Building |
| `brick:feeds` | 〜に供給する | Chiller feeds AHU |
| `brick:isFedBy` | 〜から供給される | AHU isFedBy Chiller |
| `brick:hasPoint` | センサーを持つ | AHU hasPoint Sensor |
| `brick:isPointOf` | 〜のセンサー | Sensor isPointOf AHU |

## 💡 省エネ分析の例

### 1️⃣ 外気冷房チャンスの検出
```sparql
# 外気温 < 還気温 のときを検出
SELECT ?outside_temp ?return_temp
WHERE {
    ex:AHU1_Outside_Air_Temp_Sensor 
        brick:lastKnownValue/brick:value ?outside_temp .
    ex:AHU1_Return_Air_Temp_Sensor 
        brick:lastKnownValue/brick:value ?return_temp .
    FILTER(?outside_temp < ?return_temp)
}
```
**結果**: 外気温22.5°C < 還気温24.5°C → **外気冷房推奨**

### 2️⃣ 総消費電力の計算
```sparql
# チラーとVRFの合計電力
SELECT (SUM(?power) as ?total)
WHERE {
    ?sensor a brick:Electric_Power_Sensor .
    ?sensor brick:lastKnownValue/brick:value ?power .
}
```
**結果**: 76.7 kW (チラー45.2 + VRF合計31.5)

### 3️⃣ 室温異常の検出
```sparql
# 設定範囲外(22-26°C)の部屋を検出
SELECT ?room ?temp
WHERE {
    ?room brick:hasPoint ?sensor .
    ?sensor a brick:Zone_Air_Temperature_Sensor .
    ?sensor brick:lastKnownValue/brick:value ?temp .
    FILTER(?temp < 22 || ?temp > 26)
}
```

## 📊 センサーデータの例（2025/10/23 14:00）

### 外気条件
- **外気温**: 22.5°C (秋季の快適な気温)

### チラープラント
- **供給水温**: 7.0°C
- **還水温**: 12.5°C (温度差5.5°C = 冷房負荷あり)
- **消費電力**: 45.2 kW

### 外調機1号機(1階)
- **給気温**: 16.0°C (冷房運転中)
- **還気温**: 24.5°C
- **還気湿度**: 52% (快適範囲)
- **給気風量**: 8,500 m³/h

### 室内環境
- **会議室101**: 23.5°C, 54% (会議中で人体発熱あり)
- **サーバー室105**: 22.0°C (24時間冷房維持)
- **オフィス202**: 24.8°C, 49% (日射の影響で高め)

## 🎯 主要な省エネ施策

### 施策1: 外気冷房の活用
- **条件**: 外気温 < 還気温
- **アクション**: 外気導入量を増加
- **効果**: 冷房負荷削減 約15%

### 施策2: 冷水温度の最適化
- **従来**: 7°C固定
- **改善**: 外気温に応じて7-9°Cで可変
- **効果**: チラーCOP向上 約10%

### 施策3: VRFとセントラルの協調
- **基本**: 全館空調で外気処理
- **追加**: 個別空調で局所調整
- **効果**: 全体効率向上 約8%

## 🔧 モデルの検証方法

### ステップ1: 構文チェック
```bash
# RDFパーサーで検証
rapper -i turtle hvac_information_model.ttl
```

### ステップ2: テストクエリ実行
```bash
# Apache Jena Arqを使用
arq --data hvac_information_model.ttl \
    --data building_example_with_data.ttl \
    --query test_queries.sparql
```

### ステップ3: 期待値との比較
- フロア数: 2
- 大ゾーン数: 3
- 小ゾーン数: 7
- 部屋数: 9
- センサー数: 20以上

## 📚 さらに学ぶには

1. **詳細ドキュメント**: `README.md` を参照
2. **システム構成**: `visualization_diagram.md` で視覚的に理解
3. **テストケース**: `test_queries.sparql` で検証方法を学習
4. **具体例**: `building_example_with_data.ttl` でデータ構造を確認

## 💻 推奨ツール

### RDFストア
- **Apache Jena Fuseki**: オープンソース、使いやすい
- **Stardog**: 商用、高性能
- **GraphDB**: 商用/無料版あり、視覚化が優れている

### 開発ツール
- **Protégé**: オントロジー編集
- **Visual Studio Code**: Turtle編集（拡張機能あり）
- **Python + rdflib**: プログラマティックな操作

## 🆘 トラブルシューティング

### Q1: センサーデータが読み込めない
**A**: `brick:lastKnownValue` のネストした構造を確認してください。

### Q2: 横断構成が表現できない
**A**: `brick:feeds` で複数の小ゾーンを指定できます。

### Q3: 時系列データを扱いたい
**A**: 時系列DBとの連携を検討してください（本モデルは静的スナップショット）。

---

**作成日**: 2025年10月23日  
**バージョン**: 1.0  
**Brick Schema**: v1.4.4準拠
