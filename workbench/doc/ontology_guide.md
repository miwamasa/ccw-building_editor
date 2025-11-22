# オントロジー解説

## 目次

1. [概要](#概要)
2. [Brick Schemaとは](#brick-schemaとは)
3. [本ワークベンチのオントロジー拡張](#本ワークベンチのオントロジー拡張)
4. [主要なクラス](#主要なクラス)
5. [主要なプロパティ](#主要なプロパティ)
6. [階層構造](#階層構造)
7. [使用例](#使用例)
8. [参考資料](#参考資料)

---

## 概要

本ワークベンチでは、**Brick Schema**をベースとしたオントロジーを使用して、建物の構造、設備、センサーを体系的にモデル化しています。これにより、異なるシステム間でのデータ共有、自然言語での問い合わせ、センサーマッピングの自動化が可能になります。

### オントロジーの役割

- **データの標準化**: 建物情報を標準的な形式で表現
- **セマンティックな理解**: AIがデータの意味を理解可能
- **相互運用性**: 異なるシステム間でのデータ交換
- **推論の実現**: 明示的でない関係の推論

---

## Brick Schemaとは

[Brick Schema](https://brickschema.org/)は、建物管理システム（BMS）のための標準化されたオントロジーです。

### 主な特徴

1. **クラスベース**: 機器、センサー、空間などをクラスとして定義
2. **関係性の表現**: 機器間の接続、センサーの測定対象などを関係性として表現
3. **拡張可能**: 独自のクラスやプロパティを追加可能
4. **RDF/OWL準拠**: セマンティックWeb標準に準拠

### Brick Schemaの主要クラス階層

```
brick:Entity
├── brick:Equipment
│   ├── brick:HVAC_Equipment
│   │   ├── brick:AHU (Air Handling Unit)
│   │   ├── brick:Chiller
│   │   ├── brick:VAV (Variable Air Volume)
│   │   └── brick:VRF (Variable Refrigerant Flow)
│   └── ...
├── brick:Point
│   ├── brick:Sensor
│   │   ├── brick:Temperature_Sensor
│   │   ├── brick:Humidity_Sensor
│   │   ├── brick:CO2_Sensor
│   │   └── ...
│   └── brick:Setpoint
├── brick:Location
│   ├── brick:Building
│   ├── brick:Floor
│   ├── brick:Zone
│   └── brick:Room
└── ...
```

---

## 本ワークベンチのオントロジー拡張

本ワークベンチでは、Brick Schemaを以下の目的で拡張しています：

### 1. ハイブリッド空調システム対応

日本の建物に多いハイブリッド空調システム（中央式 + 個別式）をサポート：

- **中央式空調**: Chiller → AHU → VAV → Large Zone
- **個別式空調**: VRF → Small Zone
- **ゾーン構造**: Large Zone（ペリメーター/インテリア）と Small Zone（執務室等）の二重構造

### 2. センサーマッピング対応

生成センサー（論理的）と具体センサー（物理的）の対応関係を表現：

```turtle
wb:SensorMapping a owl:Class ;
    rdfs:label "Sensor Mapping" ;
    rdfs:comment "生成センサーと具体センサーのマッピング関係" .

wb:mapsToPhysicalSensor a owl:ObjectProperty ;
    rdfs:domain wb:GeneratedSensor ;
    rdfs:range wb:PhysicalSensor ;
    rdfs:label "maps to physical sensor" .

wb:hasConfidenceScore a owl:DatatypeProperty ;
    rdfs:domain wb:SensorMapping ;
    rdfs:range xsd:float ;
    rdfs:label "has confidence score" .
```

### 3. 自然言語クエリ対応

セマンティックタグによる自然言語での検索サポート：

```turtle
wb:hasSemanticTag a owl:DatatypeProperty ;
    rdfs:domain brick:Point ;
    rdfs:range xsd:string ;
    rdfs:label "has semantic tag" .
```

---

## 主要なクラス

### 空間関連クラス

| クラス | 説明 | 例 |
|--------|------|-----|
| `wb:Building` | 建物 | Building_A |
| `wb:Floor` | 階 | Floor_1 |
| `wb:LargeZone` | ラージゾーン（ペリメーター/インテリア等） | LargeZone_1A |
| `wb:SmallZone` | スモールゾーン（執務室、会議室等） | SmallZone_1A1 |
| `wb:Room` | 部屋 | Room_101 |

### 設備関連クラス

| クラス | 説明 | 例 |
|--------|------|-----|
| `brick:Chiller` | チラー（冷凍機） | Chiller_1 |
| `brick:AHU` | エアハンドリングユニット（外調機） | AHU_1 |
| `brick:VAV` | 変風量ユニット | VAV_1A1 |
| `brick:VRF` | 可変冷媒流量システム | VRF_Unit_1 |

### センサー関連クラス

| クラス | 説明 | 例 |
|--------|------|-----|
| `wb:GeneratedSensor` | 生成センサー（論理的） | BLD:Building_A:OUT:TEMP |
| `wb:PhysicalSensor` | 具体センサー（物理的） | PHY_TEMP_001 |
| `brick:Temperature_Sensor` | 温度センサー | - |
| `brick:Humidity_Sensor` | 湿度センサー | - |
| `brick:CO2_Sensor` | CO2センサー | - |
| `brick:Power_Sensor` | 電力センサー | - |

---

## 主要なプロパティ

### 空間階層関係

| プロパティ | 説明 | 例 |
|-----------|------|-----|
| `brick:hasPart` | 部分を持つ | Building hasPart Floor |
| `brick:isPartOf` | の部分である | Floor isPartOf Building |
| `brick:hasLocation` | 位置を持つ | Equipment hasLocation Room |
| `brick:isLocationOf` | の位置である | Room isLocationOf Equipment |

### 設備関係

| プロパティ | 説明 | 例 |
|-----------|------|-----|
| `brick:feeds` | 供給する | Chiller feeds AHU |
| `brick:isFedBy` | によって供給される | AHU isFedBy Chiller |
| `wb:servesZone` | ゾーンにサービスを提供 | VAV servesZone LargeZone |

### センサー関係

| プロパティ | 説明 | 例 |
|-----------|------|-----|
| `brick:hasPoint` | ポイント（センサー）を持つ | Equipment hasPoint Sensor |
| `brick:isPointOf` | のポイントである | Sensor isPointOf Equipment |
| `wb:mapsToPhysicalSensor` | 物理センサーにマップ | GeneratedSensor mapsTo PhysicalSensor |

### メタデータ

| プロパティ | 説明 | 例 |
|-----------|------|-----|
| `wb:hasSemanticTag` | セマンティックタグを持つ | "会議室", "温度" |
| `wb:hasConfidenceScore` | 信頼度スコアを持つ | 0.95 |
| `brick:hasUnit` | 単位を持つ | "°C", "%" |

---

## 階層構造

### 空間階層

```
Building (建物)
└── Floor (階)
    └── LargeZone (ラージゾーン: ペリメーター/インテリア等)
        └── SmallZone (スモールゾーン: 執務室、会議室等)
            └── Room (部屋: 個室、会議室等)
```

**例:**
```
Building_A (東京グリーンタワー)
└── Floor_1 (1階)
    ├── LargeZone_1A (東側ペリメーター)
    │   ├── SmallZone_1A1 (東側執務エリアA)
    │   │   ├── Room_101 (会議室101)
    │   │   └── Room_102 (執務室102)
    │   └── SmallZone_1A2 (東側執務エリアB)
    └── LargeZone_1B (西側インテリア)
```

### 設備階層（中央式空調）

```
Chiller (チラー)
└── AHU (エアハンドリングユニット)
    └── VAV (変風量ユニット)
        └── LargeZone (ラージゾーン)
```

**例:**
```
Chiller_1
└── AHU_1
    └── VAV_1A1
        → LargeZone_1A (東側ペリメーター)
```

### 設備階層（個別式空調）

```
VRF (可変冷媒流量システム)
└── SmallZone (スモールゾーン) [複数]
```

**例:**
```
VRF_Unit_1
├── SmallZone_1A1 (東側執務エリアA)
├── SmallZone_1A2 (東側執務エリアB)
└── SmallZone_1B1 (西側執務エリアA)
```

---

## 使用例

### 例1: 温度センサーの定義

```turtle
# 生成センサー（論理的）
:AHU1_SupplyAirTemp a wb:GeneratedSensor, brick:Temperature_Sensor ;
    rdfs:label "AHU1供給空気温度センサー"@ja ;
    brick:isPointOf :AHU_1 ;
    brick:hasUnit "degC" ;
    wb:hasSemanticTag "給気温度", "外調機1" ;
    wb:sensorId "AHU:AHU_1:SUP_AIR:TEMP" .

# 具体センサー（物理的）
:PhysicalTemp001 a wb:PhysicalSensor, brick:Temperature_Sensor ;
    rdfs:label "給気温度計1F-AHU1" ;
    brick:hasLocation :MachineRoom_Floor1 ;
    wb:physicalId "PHY_TEMP_001" .

# マッピング
:Mapping001 a wb:SensorMapping ;
    wb:mapsGeneratedSensor :AHU1_SupplyAirTemp ;
    wb:mapsToPhysicalSensor :PhysicalTemp001 ;
    wb:hasConfidenceScore 0.95 ;
    wb:hasMappingReason "設備ID、測定コンテキスト、センサータイプが完全一致" .
```

### 例2: VRFシステムの定義

```turtle
# VRF機器
:VRF_Unit_1 a brick:VRF ;
    rdfs:label "VRFユニット1" ;
    wb:servesZone :SmallZone_1A1, :SmallZone_1A2, :SmallZone_1B1 .

# VRFのセンサー
:VRF1_OutdoorTemp a wb:GeneratedSensor, brick:Temperature_Sensor ;
    rdfs:label "VRF1室外温度センサー" ;
    brick:isPointOf :VRF_Unit_1 ;
    wb:sensorId "VRF:VRF_Unit_1:OUT:TEMP" .

:VRF1_Power a wb:GeneratedSensor, brick:Power_Sensor ;
    rdfs:label "VRF1電力センサー" ;
    brick:isPointOf :VRF_Unit_1 ;
    wb:sensorId "VRF:VRF_Unit_1:UNIT:POWR" .
```

### 例3: 部屋のセンサー

```turtle
# 会議室
:Room_101 a wb:Room ;
    rdfs:label "会議室101"@ja ;
    brick:isPartOf :SmallZone_1A1 .

# 会議室のセンサー群
:Room101_Temp a wb:GeneratedSensor, brick:Temperature_Sensor ;
    rdfs:label "会議室101温度センサー" ;
    brick:hasLocation :Room_101 ;
    wb:sensorId "ROM:Room_101:AMB:TEMP" ;
    wb:hasSemanticTag "会議室", "温度", "Room_101" .

:Room101_CO2 a wb:GeneratedSensor, brick:CO2_Sensor ;
    rdfs:label "会議室101CO2センサー" ;
    brick:hasLocation :Room_101 ;
    wb:sensorId "ROM:Room_101:AMB:CO2" ;
    wb:hasSemanticTag "会議室", "CO2", "空気質", "Room_101" .

:Room101_Occupancy a wb:GeneratedSensor, brick:Occupancy_Sensor ;
    rdfs:label "会議室101在室センサー" ;
    brick:hasLocation :Room_101 ;
    wb:sensorId "ROM:Room_101:AMB:OCCP" ;
    wb:hasSemanticTag "会議室", "在室", "人感", "Room_101" .
```

---

## 参考資料

### 公式ドキュメント

- [Brick Schema 公式サイト](https://brickschema.org/)
- [Brick Schema GitHub](https://github.com/BrickSchema/Brick)
- [Brick Schema ドキュメント](https://docs.brickschema.org/)

### 関連標準

- [RDF (Resource Description Framework)](https://www.w3.org/RDF/)
- [OWL (Web Ontology Language)](https://www.w3.org/OWL/)
- [SPARQL (SPARQL Protocol and RDF Query Language)](https://www.w3.org/TR/sparql11-query/)

### 本ワークベンチの関連ドキュメント

- [センサー命名規則](sensor_naming_rules.md)
- [マッチングアルゴリズム](matching_algorithms.md)
- [自然言語クエリプロンプト](natural_language_query.md)

---

**最終更新**: 2025-11-22
