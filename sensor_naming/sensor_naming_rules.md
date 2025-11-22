# センサー自動命名規則 (AI Mapping向け)

## 1. 命名フォーマット

```
{EntityType}:{EntityID}:{MeasurementContext}:{SensorType}
```

区切り文字として `:` を使用（AIがトークン分割しやすい）

## 2. 各フィールドの定義

### 2.1 EntityType（エンティティ種別）

| コード | オントロジークラス | 説明 |
|--------|-------------------|------|
| `BLD` | wb:BuildingModel | 建物 |
| `FLR` | wb:FloorModel | 階 |
| `LZN` | wb:ZoneModel (Large) | 大ゾーン |
| `SZN` | wb:ZoneModel (Small) | 小ゾーン |
| `ROM` | wb:RoomModel | 部屋 |
| `CHL` | brick:Chiller | チラー |
| `AHU` | brick:AHU | 外調機（空調機） |
| `VAV` | brick:VAV | VAV |
| `VRF` | wb:IndividualHVAC | VRF室外機 |

### 2.2 EntityID（エンティティID）

JSONデータの `id` フィールドをそのまま使用

### 2.3 MeasurementContext（測定コンテキスト）

測定対象の媒体や位置を示す。

| コード | 説明 | 適用対象 |
|--------|------|----------|
| `OUT` | 外気/室外 | Building, AHU, VRF |
| `SUP_AIR` | 給気 | AHU, VAV |
| `RET_AIR` | 還気 | AHU |
| `SUP_WTR` | 送水 | Chiller |
| `RET_WTR` | 還水 | Chiller |
| `WTR_FLW` | 水流量 | Chiller |
| `AIR_FLW` | 風量 | AHU, VAV |
| `DMPR` | ダンパー | AHU, VAV |
| `FAN` | ファン | AHU |
| `FLTR` | フィルタ | AHU |
| `COMP` | 圧縮機 | VRF |
| `AMB` | 環境（室内） | Zone, Room |
| `TOTAL` | 総量 | Building |
| `UNIT` | 機器本体 | Equipment |

### 2.4 SensorType（センサー種別）

| コード | オントロジークラス | 単位 |
|--------|-------------------|------|
| `TEMP` | wb:TemperatureSensor | °C |
| `HUMD` | wb:HumiditySensor | %RH |
| `POWR` | wb:PowerSensor | kW |
| `FLOW` | wb:FlowSensor | m³/h, L/min |
| `PRES` | brick:Pressure_Sensor | Pa |
| `POS` | wb:PositionSensor | % |
| `SPD` | brick:Speed_Sensor | rpm |
| `FREQ` | brick:Frequency_Sensor | Hz |
| `STAT` | brick:Status | on/off |
| `CO2` | brick:CO2_Sensor | ppm |
| `OCCP` | brick:Occupancy_Sensor | persons |
| `ILLM` | brick:Illuminance_Sensor | lx |

## 3. 命名例（JSONデータ対応）

### 3.1 建物レベルセンサー

| 自動命名 | 対応する実センサー名 |
|----------|---------------------|
| `BLD:Building_A:OUT:TEMP` | 建物外気温度センサー |
| `BLD:Building_A:OUT:HUMD` | 建物外気湿度センサー |
| `BLD:Building_A:TOTAL:POWR` | 建物総電力量センサー |

### 3.2 チラーセンサー

| 自動命名 | 対応する実センサー名 |
|----------|---------------------|
| `CHL:Chiller_1:SUP_WTR:TEMP` | チラー1_送水温度センサー |
| `CHL:Chiller_1:RET_WTR:TEMP` | チラー1_還水温度センサー |
| `CHL:Chiller_1:WTR_FLW:FLOW` | チラー1_水流量センサー |
| `CHL:Chiller_1:UNIT:POWR` | チラー1_電力センサー |
| `CHL:Chiller_1:UNIT:STAT` | チラー1_運転状態センサー |

### 3.3 外調機(AHU)センサー

| 自動命名 | 対応する実センサー名 |
|----------|---------------------|
| `AHU:AHU_1:OUT:TEMP` | 外調機1_外気温度センサー |
| `AHU:AHU_1:OUT:HUMD` | 外調機1_外気湿度センサー |
| `AHU:AHU_1:SUP_AIR:TEMP` | 外調機1_給気温度センサー |
| `AHU:AHU_1:SUP_AIR:HUMD` | 外調機1_給気湿度センサー |
| `AHU:AHU_1:RET_AIR:TEMP` | 外調機1_還気温度センサー |
| `AHU:AHU_1:RET_AIR:HUMD` | 外調機1_還気湿度センサー |
| `AHU:AHU_1:AIR_FLW:FLOW` | 外調機1_給気風量センサー |
| `AHU:AHU_1:DMPR:POS` | 外調機1_ダンパー開度センサー |
| `AHU:AHU_1:FAN:SPD` | 外調機1_ファン回転数センサー |
| `AHU:AHU_1:UNIT:POWR` | 外調機1_電力センサー |
| `AHU:AHU_1:FLTR:PRES` | 外調機1_フィルタ差圧センサー |

### 3.4 VAVセンサー

| 自動命名 | 対応する実センサー名 |
|----------|---------------------|
| `VAV:VAV_1A1:SUP_AIR:TEMP` | VAV1A-1_給気温度センサー |
| `VAV:VAV_1A1:DMPR:POS` | VAV1A-1_ダンパー開度センサー |
| `VAV:VAV_1A1:AIR_FLW:FLOW` | VAV1A-1_風量センサー |

### 3.5 VRFセンサー

| 自動命名 | 対応する実センサー名 |
|----------|---------------------|
| `VRF:VRF_Unit_1:OUT:TEMP` | VRF1_室外機温度センサー |
| `VRF:VRF_Unit_1:UNIT:POWR` | VRF1_電力センサー |
| `VRF:VRF_Unit_1:UNIT:STAT` | VRF1_運転状態センサー |
| `VRF:VRF_Unit_1:COMP:FREQ` | VRF1_圧縮機周波数センサー |

### 3.6 大ゾーンセンサー

| 自動命名 | 対応する実センサー名 |
|----------|---------------------|
| `LZN:LargeZone_1A:AMB:TEMP` | 大ゾーン1A_温度センサー |
| `LZN:LargeZone_1A:AMB:HUMD` | 大ゾーン1A_湿度センサー |
| `LZN:LargeZone_1B:AMB:TEMP` | 大ゾーン1B_温度センサー |
| `LZN:LargeZone_1B:AMB:HUMD` | 大ゾーン1B_湿度センサー |
| `LZN:LargeZone_2A:AMB:TEMP` | 大ゾーン2A_温度センサー |
| `LZN:LargeZone_2A:AMB:HUMD` | 大ゾーン2A_湿度センサー |

### 3.7 小ゾーンセンサー

| 自動命名 | 対応する実センサー名 |
|----------|---------------------|
| `SZN:SmallZone_1A1:AMB:TEMP` | 小ゾーン1A1_温度センサー |
| `SZN:SmallZone_1A1:AMB:HUMD` | 小ゾーン1A1_湿度センサー |
| `SZN:SmallZone_1A2:AMB:TEMP` | 小ゾーン1A2_温度センサー |
| `SZN:SmallZone_1A2:AMB:HUMD` | 小ゾーン1A2_湿度センサー |
| `SZN:SmallZone_1B1:AMB:TEMP` | 小ゾーン1B1_温度センサー |
| `SZN:SmallZone_1B1:AMB:HUMD` | 小ゾーン1B1_湿度センサー |

### 3.8 部屋センサー

| 自動命名 | 対応する実センサー名 |
|----------|---------------------|
| `ROM:Room_101:AMB:TEMP` | 会議室101_室温センサー |
| `ROM:Room_101:AMB:HUMD` | 会議室101_湿度センサー |
| `ROM:Room_101:AMB:CO2` | 会議室101_CO2センサー |
| `ROM:Room_101:AMB:OCCP` | 会議室101_在室センサー |
| `ROM:Room_101:AMB:ILLM` | 会議室101_照度センサー |
| `ROM:Room_102:AMB:TEMP` | 会議室102_室温センサー |
| `ROM:Room_102:AMB:HUMD` | 会議室102_湿度センサー |
| `ROM:Room_102:AMB:CO2` | 会議室102_CO2センサー |
| `ROM:Room_102:AMB:OCCP` | 会議室102_在室センサー |
| `ROM:Room_102:AMB:ILLM` | 会議室102_照度センサー |
| `ROM:Room_103:AMB:TEMP` | オフィス103_室温センサー |
| `ROM:Room_103:AMB:HUMD` | オフィス103_湿度センサー |
| `ROM:Room_103:AMB:CO2` | オフィス103_CO2センサー |
| `ROM:Room_103:AMB:OCCP` | オフィス103_在室センサー |
| `ROM:Room_103:AMB:ILLM` | オフィス103_照度センサー |

## 4. AI向け展開フォーマット

AIマッピング処理用に、各センサー名を構造化した形式で展開：

```json
{
  "generated_name": "AHU:AHU_1:SUP_AIR:TEMP",
  "semantic_breakdown": {
    "entity_type": "AHU",
    "entity_type_label": "Air Handling Unit",
    "entity_id": "AHU_1",
    "measurement_context": "SUP_AIR",
    "measurement_context_label": "Supply Air",
    "sensor_type": "TEMP",
    "sensor_type_label": "Temperature",
    "unit": "°C"
  },
  "natural_language_hint": "AHU_1の給気温度を測定するセンサー",
  "ontology_class": "wb:TemperatureSensor",
  "brick_relation": "brick:isPointOf"
}
```

## 5. 階層関係の表現（拡張形式）

より詳細な位置情報が必要な場合のフルパス形式：

```
{BuildingID}/{FloorID}/{LargeZoneID}/{SmallZoneID}/{RoomID}:{EntityType}:{EntityID}:{MeasurementContext}:{SensorType}
```

例：
```
Building_A/Floor_1/LargeZone_1A/SmallZone_1A1/Room_101:ROM:Room_101:AMB:TEMP
```

## 6. マッピング信頼度向上のためのヒント

AIがマッピングを行う際の判断材料として、以下の特徴を利用：

1. **EntityID内の数字パターン**: `AHU_1` ↔ `外調機1`
2. **MeasurementContextキーワード**: `SUP_AIR` ↔ `給気`, `RET_AIR` ↔ `還気`
3. **SensorTypeと単位の一致**: `TEMP` + `°C`, `HUMD` + `%RH`
4. **階層構造の整合性**: Floor_1に属するLargeZoneのセンサーは1階関連の名称を持つ
