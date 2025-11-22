# センサー命名規則

## 目次

1. [概要](#概要)
2. [命名フォーマット](#命名フォーマット)
3. [エンティティタイプ](#エンティティタイプentitytype)
4. [エンティティID](#エンティティidentityid)
5. [測定コンテキスト](#測定コンテキストmeasurementcontext)
6. [センサータイプ](#センサータイプsensortype)
7. [命名例](#命名例)
8. [設計原則](#設計原則)

---

## 概要

本ワークベンチでは、**オントロジーベースのセンサー命名規則**を採用しています。この規則により、センサーIDだけで以下の情報が明確になります：

- **どこの**（エンティティタイプ＋エンティティID）
- **何を**（測定コンテキスト）
- **どう測っているか**（センサータイプ）

この体系的な命名により、自動マッピング、検索、データ分析が容易になります。

---

## 命名フォーマット

### 基本構造

```
{EntityType}:{EntityID}:{MeasurementContext}:{SensorType}
```

### 例

```
AHU:AHU_1:SUP_AIR:TEMP
```

- **EntityType**: `AHU` (Air Handling Unit)
- **EntityID**: `AHU_1` (エアハンドリングユニット1)
- **MeasurementContext**: `SUP_AIR` (供給空気)
- **SensorType**: `TEMP` (温度)

**意味**: エアハンドリングユニット1の供給空気の温度センサー

---

## エンティティタイプ（EntityType）

エンティティタイプは、センサーが属する機器や空間の種類を示します。

### 空間エンティティ

| コード | 正式名称 | 説明 | 例 |
|--------|----------|------|-----|
| **BLD** | Building | 建物全体 | 建物の外気温センサー |
| **FLR** | Floor | 階 | 階全体の電力センサー |
| **LZN** | Large Zone | ラージゾーン | ペリメーター、インテリアゾーン |
| **SZN** | Small Zone | スモールゾーン | 執務エリア、会議エリア |
| **ROM** | Room | 部屋 | 個室、会議室 |

### 設備エンティティ（中央式空調）

| コード | 正式名称 | 説明 | 例 |
|--------|----------|------|-----|
| **CHL** | Chiller | チラー（冷凍機） | 冷水温度センサー |
| **AHU** | Air Handling Unit | エアハンドリングユニット（外調機） | 給気温度センサー |
| **VAV** | Variable Air Volume | 変風量ユニット | ダンパー開度センサー |

### 設備エンティティ（個別式空調）

| コード | 正式名称 | 説明 | 例 |
|--------|----------|------|-----|
| **VRF** | Variable Refrigerant Flow | 可変冷媒流量システム | 室外機温度センサー |

---

## エンティティID（EntityID）

エンティティIDは、同じタイプの中で個々のエンティティを識別します。

### 命名パターン

| エンティティタイプ | IDパターン | 例 |
|-------------------|------------|-----|
| Building | `Building_{識別子}` | `Building_A`, `Building_North` |
| Floor | `Floor_{階数}` | `Floor_1`, `Floor_2` |
| LargeZone | `LargeZone_{階数}{エリア}` | `LargeZone_1A`, `LargeZone_2B` |
| SmallZone | `SmallZone_{階数}{エリア}{番号}` | `SmallZone_1A1`, `SmallZone_2B2` |
| Room | `Room_{部屋番号}` | `Room_101`, `Room_202` |
| Chiller | `Chiller_{番号}` | `Chiller_1`, `Chiller_2` |
| AHU | `AHU_{番号}` | `AHU_1`, `AHU_2` |
| VAV | `VAV_{ゾーン識別子}` | `VAV_1A1`, `VAV_2B1` |
| VRF | `VRF_Unit_{番号}` | `VRF_Unit_1`, `VRF_Unit_2` |

### 例

```
AHU:AHU_1:SUP_AIR:TEMP
    ↑   ↑
    │   └─ エンティティID: AHU_1（エアハンドリングユニット1号機）
    └───── エンティティタイプ: AHU
```

---

## 測定コンテキスト（MeasurementContext）

測定コンテキストは、「何を測定しているか」を示します。

### 空気・水関連

| コード | 意味 | 説明 | 適用例 |
|--------|------|------|--------|
| **OUT** | Outdoor | 外気・屋外 | 建物外気温、VRF室外温度 |
| **SUP_AIR** | Supply Air | 供給空気・給気 | AHU給気温度、VAV給気温度 |
| **RET_AIR** | Return Air | 還気 | AHU還気温度 |
| **SUP_WTR** | Supply Water | 供給水・往き | チラー冷水供給温度 |
| **RET_WTR** | Return Water | 還水・戻り | チラー冷水還り温度 |

### 流量関連

| コード | 意味 | 説明 | 適用例 |
|--------|------|------|--------|
| **AIR_FLW** | Air Flow | 空気流量 | AHU風量、VAV風量 |
| **WTR_FLW** | Water Flow | 水流量 | チラー冷水流量 |

### 機器部品関連

| コード | 意味 | 説明 | 適用例 |
|--------|------|------|--------|
| **DMPR** | Damper | ダンパー | VAVダンパー開度 |
| **FAN** | Fan | ファン | AHUファン回転数 |
| **FLTR** | Filter | フィルター | AHUフィルター圧力損失 |
| **COMP** | Compressor | 圧縮機 | VRF圧縮機周波数 |

### 環境・その他

| コード | 意味 | 説明 | 適用例 |
|--------|------|------|--------|
| **AMB** | Ambient | 環境・室内 | 部屋の温度、湿度、CO2 |
| **UNIT** | Unit | 機器全体 | 機器の電力、状態 |
| **TOTAL** | Total | 合計・全体 | 建物全体の電力 |

---

## センサータイプ（SensorType）

センサータイプは、測定する物理量の種類を示します。

### 基本センサー

| コード | 物理量 | 単位 | 説明 |
|--------|--------|------|------|
| **TEMP** | Temperature | °C | 温度 |
| **HUMD** | Humidity | % | 湿度 |
| **POWR** | Power | kW | 電力 |
| **FLOW** | Flow | m³/h | 流量 |
| **PRES** | Pressure | Pa | 圧力 |

### 制御・状態センサー

| コード | 物理量 | 単位 | 説明 |
|--------|--------|------|------|
| **POS** | Position | % | 位置（ダンパー開度等） |
| **SPD** | Speed | rpm | 速度（ファン回転数等） |
| **FREQ** | Frequency | Hz | 周波数（インバータ周波数等） |
| **STAT** | Status | - | 状態（ON/OFF等） |

### 環境品質センサー

| コード | 物理量 | 単位 | 説明 |
|--------|--------|------|------|
| **CO2** | CO2 Concentration | ppm | CO2濃度 |
| **OCCP** | Occupancy | - | 在室検知 |
| **ILLM** | Illuminance | lux | 照度 |

---

## 命名例

### 建物レベル

```
BLD:Building_A:OUT:TEMP      # 建物外気温度センサー
BLD:Building_A:OUT:HUMD      # 建物外気湿度センサー
BLD:Building_A:TOTAL:POWR    # 建物全体電力センサー
```

### チラー（冷凍機）

```
CHL:Chiller_1:SUP_WTR:TEMP   # チラー1冷水供給温度センサー
CHL:Chiller_1:RET_WTR:TEMP   # チラー1冷水還り温度センサー
CHL:Chiller_1:WTR_FLW:FLOW   # チラー1冷水流量センサー
CHL:Chiller_1:UNIT:POWR      # チラー1電力センサー
CHL:Chiller_1:UNIT:STAT      # チラー1運転状態センサー
```

### エアハンドリングユニット（AHU）

```
AHU:AHU_1:OUT:TEMP           # AHU1外気温度センサー
AHU:AHU_1:SUP_AIR:TEMP       # AHU1給気温度センサー
AHU:AHU_1:RET_AIR:TEMP       # AHU1還気温度センサー
AHU:AHU_1:AIR_FLW:FLOW       # AHU1風量センサー
AHU:AHU_1:DMPR:POS           # AHU1外気ダンパー開度センサー
AHU:AHU_1:FAN:SPD            # AHU1ファン回転数センサー
AHU:AHU_1:FLTR:PRES          # AHU1フィルター圧力損失センサー
AHU:AHU_1:UNIT:POWR          # AHU1電力センサー
```

### 変風量ユニット（VAV）

```
VAV:VAV_1A1:SUP_AIR:TEMP     # VAV1A1給気温度センサー
VAV:VAV_1A1:DMPR:POS         # VAV1A1ダンパー開度センサー
VAV:VAV_1A1:AIR_FLW:FLOW     # VAV1A1風量センサー
```

### VRFシステム

```
VRF:VRF_Unit_1:OUT:TEMP      # VRFユニット1室外温度センサー
VRF:VRF_Unit_1:UNIT:POWR     # VRFユニット1電力センサー
VRF:VRF_Unit_1:UNIT:STAT     # VRFユニット1運転状態センサー
VRF:VRF_Unit_1:COMP:FREQ     # VRFユニット1圧縮機周波数センサー
```

### ラージゾーン

```
LZN:LargeZone_1A:AMB:TEMP    # ラージゾーン1A室温センサー
LZN:LargeZone_1A:AMB:HUMD    # ラージゾーン1A湿度センサー
LZN:LargeZone_1A:AMB:CO2     # ラージゾーン1A CO2センサー
```

### スモールゾーン

```
SZN:SmallZone_1A1:AMB:TEMP   # スモールゾーン1A1室温センサー
SZN:SmallZone_1A1:AMB:HUMD   # スモールゾーン1A1湿度センサー
SZN:SmallZone_1A1:AMB:CO2    # スモールゾーン1A1 CO2センサー
```

### 部屋

```
ROM:Room_101:AMB:TEMP        # 会議室101温度センサー
ROM:Room_101:AMB:HUMD        # 会議室101湿度センサー
ROM:Room_101:AMB:CO2         # 会議室101 CO2センサー
ROM:Room_101:AMB:OCCP        # 会議室101在室センサー
ROM:Room_101:AMB:ILLM        # 会議室101照度センサー
```

---

## 設計原則

### 1. 一意性

各センサーIDは建物内で一意でなければなりません。

**良い例:**
```
AHU:AHU_1:SUP_AIR:TEMP
AHU:AHU_2:SUP_AIR:TEMP
```

**悪い例:**
```
AHU:AHU_1:SUP_AIR:TEMP  # 同じIDが重複
AHU:AHU_1:SUP_AIR:TEMP
```

### 2. 階層性の反映

エンティティIDは階層構造を反映すべきです。

```
Building_A           # 建物
└── Floor_1         # 1階
    └── LargeZone_1A    # 1階Aゾーン
        └── SmallZone_1A1   # 1階A1小ゾーン
            └── Room_101    # 101号室
```

### 3. 可読性

専門家が見れば意味が分かる命名を心がけます。

**良い例:**
```
AHU:AHU_1:SUP_AIR:TEMP  # 意味が明確
```

**悪い例:**
```
A1:1:SA:T  # 省略しすぎて不明確
```

### 4. 拡張性

将来的に新しいエンティティタイプやセンサータイプを追加できる設計。

```
# 将来追加する可能性
FCU:FCU_1:SUP_AIR:TEMP   # Fan Coil Unit
RAD:RAD_1:UNIT:TEMP      # Radiator
```

### 5. 国際標準との整合性

可能な限りBrick Schemaなどの国際標準と整合性を保ちます。

---

## マッピングへの活用

この命名規則は、自動センサーマッピングで以下のように活用されます：

### 正規表現マッチング

```javascript
// センサーIDを解析
const [entityType, entityId, context, sensorType] = sensorId.split(':');

// 各要素をキーワードマッチング
if (physicalSensorName.includes(entityId.toLowerCase())) {
    score += 0.4;  // エンティティIDマッチング
}
```

### AIマッチング

AIに命名規則を提示することで、セマンティックな理解に基づくマッチングが可能：

```
生成センサー: AHU:AHU_1:SUP_AIR:TEMP
物理センサー: "給気温度計1F-AHU1"

AI推論:
- AHU_1 → "AHU1" (エンティティ一致)
- SUP_AIR → "給気" (コンテキスト一致)
- TEMP → "温度計" (センサータイプ一致)
→ 信頼度: 0.95
```

---

## 関連ドキュメント

- [オントロジー解説](ontology_guide.md)
- [マッチングアルゴリズム](matching_algorithms.md)
- [自然言語クエリプロンプト](natural_language_query.md)

---

**最終更新**: 2025-11-22
