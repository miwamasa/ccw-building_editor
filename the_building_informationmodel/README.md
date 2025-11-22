# ハイブリッド空調システム情報モデル

## 概要

このプロジェクトは、**全館空調（セントラル方式）**と**個別空調（VRF方式）**を組み合わせたハイブリッド空調システムの情報モデルです。Brick Schemaをベースに、教育的でミニマムな構成として設計されています。

## 目的

- 空調システムの性能評価
- 省エネ運転の検討
- エネルギー使用の可視化
- 建物と空調設備の関係性の明確化

## ファイル構成

```
├── hvac_information_model.ttl        # 情報モデル定義
├── building_example_with_data.ttl    # 具体的なビル例とセンサーデータ
├── test_queries.sparql               # 検証用SPARQLクエリ集
├── visualization_diagram.md          # システム構成図
└── README.md                         # このファイル
```

## 情報モデルの特徴

### 1. 階層構造

```
Building (建物)
  └─ Floor (階)
      └─ Large Zone (大ゾーン: 全館空調担当)
          └─ Small Zone (小ゾーン: 個別空調担当)
              └─ Room (室)
```

### 2. ハイブリッド空調システム

#### 全館空調システム
- **チラー (Chiller)**: 冷水生成
- **外調機 (AHU: Air Handling Unit)**: 外気処理と空気供給
- **VAV (Variable Air Volume)**: 可変風量制御

#### 個別空調システム
- **VRF (Variable Refrigerant Flow)**: 室外機による個別制御
- 横断的構成が可能（複数の大ゾーンをまたいで運転）

### 3. センサー配置

省エネ運転検討のため、以下のセンサーを配置:

| センサー種類 | 測定対象 | 用途 |
|------------|---------|------|
| 外気温度センサー | 外気温度 | 外気冷房判断 |
| 給気温度センサー | 給気温度 | 冷房性能評価 |
| 還気温度センサー | 還気温度 | 冷房効率評価 |
| 還気湿度センサー | 還気湿度 | 除湿性能評価 |
| 室温センサー | 室内温度 | 快適性評価 |
| 室湿度センサー | 室内湿度 | 快適性評価 |
| 電力センサー | 消費電力 | エネルギー評価 |

## モデルの読み方

### 基本的なRDF関係

```turtle
# 建物とフロアの関係
ex:Building_A brick:hasPart ex:Floor_1 .
ex:Floor_1 brick:isPartOf ex:Building_A .

# 空調機器と空調ゾーンの関係
ex:AHU_1 brick:feeds ex:LargeZone_1A .
ex:LargeZone_1A brick:isFedBy ex:AHU_1 .

# 設備とセンサーの関係
ex:AHU_1 brick:hasPoint ex:AHU1_Supply_Air_Temp_Sensor .
ex:AHU1_Supply_Air_Temp_Sensor brick:isPointOf ex:AHU_1 .
```

### センサーデータの表現

```turtle
ex:AHU1_Outside_Air_Temp_Sensor
    brick:lastKnownValue [
        brick:value "22.5"^^xsd:float ;
        brick:hasUnit unit:DEG_C ;
        brick:timestamp "2025-10-23T14:00:00+09:00"^^xsd:dateTime
    ] .
```

## 省エネ運転検討の例

### 1. 外気冷房の適用判断

**条件**: 外気温 < 還気温

```sparql
# 外気温と還気温を比較
SELECT ?outside_temp ?return_temp
WHERE {
    ex:AHU1_Outside_Air_Temp_Sensor brick:lastKnownValue ?outside_value .
    ex:AHU1_Return_Air_Temp_Sensor brick:lastKnownValue ?return_value .
    ?outside_value brick:value ?outside_temp .
    ?return_value brick:value ?return_temp .
    FILTER(?outside_temp < ?return_temp)
}
```

**アクション**: 外気導入量を増やして冷房負荷を削減

### 2. 冷水温度の最適化

外気温が低い時期には、チラーの冷水供給温度を上げることでCOP（成績係数）を向上させることができます。

```
外気温 20℃以下 → 冷水温度 8-9℃
外気温 25℃以上 → 冷水温度 7℃
```

### 3. VRFとセントラルの協調運転

- 全館空調で基本負荷（外気処理）を担当
- 個別空調で局所的な温度調整を担当
- 消費電力を監視して最適な負荷配分を実現

## 横断的構成の例

このモデルでは、**VRF_Unit_1**が複数の大ゾーンをまたいで小ゾーンに供給する例を示しています:

```
VRF_Unit_1
  ├─ SmallZone_1A1 (大ゾーン1A内)
  ├─ SmallZone_1A2 (大ゾーン1A内)
  └─ SmallZone_1B1 (大ゾーン1B内) ← 横断構成
```

## 使用技術

- **Brick Schema v1.4.4**: ビル設備のオントロジー
- **RDF/Turtle**: データ表現形式
- **SPARQL**: クエリ言語

## データの検証方法

1. **構文検証**: RDFパーサーでTurtleファイルを検証
2. **論理検証**: SPARQLクエリで期待される関係性を確認
3. **データ一貫性**: センサー値の範囲チェック

詳細は `test_queries.sparql` を参照してください。

## 拡張の方針

このモデルは教育的な最小構成ですが、以下の拡張が可能です:

1. **設備の追加**
   - ボイラー（暖房用）
   - 給湯設備
   - 照明設備
   - 換気設備

2. **センサーの追加**
   - CO2センサー（換気制御用）
   - 照度センサー（照明制御用）
   - 在室センサー（空調制御用）

3. **制御ポイントの追加**
   - バルブ開度
   - ダンパー位置
   - インバーター周波数

4. **時系列データの統合**
   - 履歴データベースとの連携
   - トレンドグラフの生成

## ライセンス

本モデルはBrick Schema (Apache 2.0 License) をベースにしています。

## 参考資料

- [Brick Schema 公式サイト](https://brickschema.org/)
- [ASHRAE Dictionary](https://www.ashrae.org/)
- [省エネルギー基準](https://www.meti.go.jp/)

## 問い合わせ

モデルに関する質問や改善提案は、プロジェクト担当者までご連絡ください。
