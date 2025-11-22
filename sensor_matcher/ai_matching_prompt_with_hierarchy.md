# AI APIによるセンサーマッチング（階層関係対応版）

## 1. コンテキストに載せる命名規則解説（システムプロンプト用）

```
<sensor_naming_convention>
## 自動生成センサー名の命名規則

フォーマット: {EntityType}:{EntityID}:{MeasurementContext}:{SensorType}

### EntityType（エンティティ種別）
- BLD: 建物
- FLR: 階
- LZN: 大ゾーン（空調ゾーン）
- SZN: 小ゾーン
- ROM: 部屋
- CHL: チラー（冷凍機）
- AHU: 外調機（Air Handling Unit）
- VAV: 可変風量装置
- VRF: ビル用マルチエアコン室外機

### MeasurementContext（測定コンテキスト）
- OUT: 外気・室外
- SUP_AIR: 給気
- RET_AIR: 還気
- SUP_WTR: 送水（冷水供給）
- RET_WTR: 還水（冷水戻り）
- AIR_FLW: 風量
- WTR_FLW: 水流量
- DMPR: ダンパー
- FAN: ファン
- FLTR: フィルタ
- COMP: 圧縮機
- AMB: 室内環境
- UNIT: 機器本体
- TOTAL: 総量

### SensorType（センサー種別）
- TEMP: 温度 (°C)
- HUMD: 湿度 (%RH)
- POWR: 電力 (kW)
- FLOW: 流量 (m³/h, L/min)
- PRES: 圧力・差圧 (Pa)
- POS: 位置・開度 (%)
- SPD: 回転速度 (rpm)
- FREQ: 周波数 (Hz)
- STAT: 運転状態 (on/off)
- CO2: CO2濃度 (ppm)
- OCCP: 在室人数 (persons)
- ILLM: 照度 (lx)
</sensor_naming_convention>

<hierarchy_structure>
## 階層構造

### 空間階層（上位→下位）
Building → Floor → LargeZone → SmallZone → Room

### 設備階層（全館空調系統）
Chiller → AHU → VAV → LargeZone
  - Chiller: 冷水を生成
  - AHU: 冷水を受けて空気を調整、LargeZoneに給気
  - VAV: AHUからの給気を各ゾーンに分配

### 設備階層（個別空調系統）
VRF → SmallZone
  - VRF室外機が複数のSmallZoneを担当（大ゾーンを横断可能）

### 関係性の例
- Floor_1 には LargeZone_1A, LargeZone_1B が属する
- LargeZone_1A には SmallZone_1A1, SmallZone_1A2 が属する
- SmallZone_1A1 には Room_101, Room_102 が属する
- AHU_1 は LargeZone_1A, LargeZone_1B に給気する
- VRF_Unit_1 は SmallZone_1A1, SmallZone_1A2, SmallZone_1B1 を担当（ゾーン横断）
</hierarchy_structure>

<hierarchy_data>
## 建物階層データ

### 空間構造
Building_A (東京グリーンタワー)
├── Floor_1 (1階)
│   ├── LargeZone_1A (東側エリア) ← AHU_1が担当
│   │   ├── SmallZone_1A1 (会議室エリア) ← VRF_Unit_1が担当
│   │   │   ├── Room_101 (会議室101)
│   │   │   └── Room_102 (会議室102)
│   │   └── SmallZone_1A2 (オフィスエリア) ← VRF_Unit_1が担当
│   │       └── Room_103 (オフィス103)
│   └── LargeZone_1B (西側エリア) ← AHU_1が担当
│       └── SmallZone_1B1 (執務室エリア) ← VRF_Unit_1が担当
└── Floor_2 (2階)
    └── LargeZone_2A (全フロア) ← AHU_2が担当

### 設備構造
Chiller_1 (チラー1号機)
├── AHU_1 (外調機1号機) → LargeZone_1A, LargeZone_1B
│   └── VAV_1A1 → LargeZone_1A
└── AHU_2 (外調機2号機) → LargeZone_2A

VRF_Unit_1 (VRF室外機1号機)
├── → SmallZone_1A1
├── → SmallZone_1A2
└── → SmallZone_1B1 （大ゾーンを横断して担当）
</hierarchy_data>
```

---

## 2. プロンプト例

### 2.1 階層関係を考慮した単一センサーマッチング

```
以下の物理センサーを、階層関係を考慮して生成センサーリストからマッチングしてください。

【物理センサー】
- ID: PHY_TEMP_004
- 名称: 会議室101温度センサー
- タイプ: temperature
- 設置場所: 1階会議室101天井
- 単位: °C

【生成センサーリスト】
- ROM:Room_101:AMB:TEMP
- ROM:Room_102:AMB:TEMP
- ROM:Room_103:AMB:TEMP
- SZN:SmallZone_1A1:AMB:TEMP
- LZN:LargeZone_1A:AMB:TEMP

【階層関係】
Room_101 ⊂ SmallZone_1A1 ⊂ LargeZone_1A ⊂ Floor_1 ⊂ Building_A

【出力形式】
{
  "matched_sensor": "マッチした生成センサー名",
  "confidence": 0.0〜1.0の信頼度,
  "hierarchy_path": "該当する階層パス",
  "reasoning": "マッチング理由（階層関係の考慮点を含む）"
}
```

### 2.2 設備系統を考慮したマッチング

```
以下の物理センサーを、設備の系統関係を考慮してマッチングしてください。

【物理センサー】
- ID: PHY_TEMP_002
- 名称: 給気温度計1F-AHU1
- タイプ: temperature
- 設置場所: 1階機械室AHU1給気ダクト

【生成センサーリスト】
- AHU:AHU_1:SUP_AIR:TEMP
- AHU:AHU_1:RET_AIR:TEMP
- AHU:AHU_2:SUP_AIR:TEMP
- VAV:VAV_1A1:SUP_AIR:TEMP
- LZN:LargeZone_1A:AMB:TEMP

【設備系統】
Chiller_1 → AHU_1 → VAV_1A1 → LargeZone_1A
AHU_1 は Floor_1 の LargeZone_1A, LargeZone_1B を担当

【出力形式】
{
  "matched_sensor": "マッチした生成センサー名",
  "confidence": 信頼度,
  "equipment_chain": "関連する設備チェーン",
  "served_zones": ["給気先ゾーン"],
  "reasoning": "理由"
}
```

### 2.3 バッチマッチング（階層情報付き）

```
以下の物理センサーリストを、階層・系統関係を考慮してマッチングしてください。

【物理センサーリスト】
1. PHY_TEMP_001 | 外気温センサーA棟 | temperature | 建物外壁東側
2. PHY_TEMP_002 | 給気温度計1F-AHU1 | temperature | 1階機械室AHU1給気ダクト
3. PHY_TEMP_004 | 会議室101温度センサー | temperature | 1階会議室101天井
4. PHY_HUM_001 | 還気湿度計1F-AHU1 | humidity | 1階AHU1還気ダクト
5. PHY_PWR_002 | VRF室外機1号機電力計 | power | 屋上VRF-OU1

【生成センサーリスト】
- BLD:Building_A:OUT:TEMP
- AHU:AHU_1:SUP_AIR:TEMP
- AHU:AHU_1:RET_AIR:HUMD
- ROM:Room_101:AMB:TEMP
- VRF:VRF_Unit_1:UNIT:POWR

【階層・系統データ】
空間: Building_A > Floor_1 > LargeZone_1A > SmallZone_1A1 > Room_101
全館空調: Chiller_1 → AHU_1 → LargeZone_1A/1B
個別空調: VRF_Unit_1 → SmallZone_1A1, 1A2, 1B1

【出力形式】
JSON配列で回答:
[
  {
    "physical_id": "物理センサーID",
    "matched_sensor": "生成センサー名",
    "confidence": 信頼度,
    "hierarchy_level": "BLD/FLR/LZN/SZN/ROM/CHL/AHU/VAV/VRF",
    "related_entities": ["関連するエンティティ"],
    "reasoning": "理由"
  }
]
```

### 2.4 階層の曖昧さがある場合の判定

```
以下の物理センサーは、階層のどのレベルに対応するか判定してください。

【物理センサー】
- ID: PHY_TEMP_020
- 名称: 1階東側エリア温度センサー
- タイプ: temperature
- 設置場所: 1階東側天井中央

【候補となる階層レベル】
1. Floor_1 (1階全体)
2. LargeZone_1A (1階東側エリア = 大ゾーン1A)
3. SmallZone_1A1 または SmallZone_1A2 (小ゾーン)

【生成センサー候補】
- FLR:Floor_1:AMB:TEMP （もし存在すれば）
- LZN:LargeZone_1A:AMB:TEMP
- SZN:SmallZone_1A1:AMB:TEMP
- SZN:SmallZone_1A2:AMB:TEMP

【出力形式】
{
  "matched_sensor": "最も適切な生成センサー",
  "confidence": 信頼度,
  "hierarchy_analysis": {
    "detected_floor": "Floor_1",
    "detected_area": "東側",
    "best_match_level": "LZN（大ゾーン）",
    "reason": "「東側エリア」は大ゾーン1Aの名称と一致"
  },
  "alternatives": [
    {"sensor": "代替候補", "confidence": 信頼度, "reason": "理由"}
  ]
}
```

---

## 3. 完全なAPIリクエスト例（階層対応版）

```python
import anthropic

client = anthropic.Anthropic()

system_prompt = """あなたはビル管理システムのセンサーマッピング専門家です。
物理センサー名と自動生成されたセンサー名を、階層関係を考慮してマッチングします。

<sensor_naming_convention>
フォーマット: {EntityType}:{EntityID}:{MeasurementContext}:{SensorType}

EntityType: BLD=建物, FLR=階, LZN=大ゾーン, SZN=小ゾーン, ROM=部屋, CHL=チラー, AHU=外調機, VAV, VRF=マルチ
MeasurementContext: OUT=外気, SUP_AIR=給気, RET_AIR=還気, SUP_WTR=送水, RET_WTR=還水, AMB=室内, UNIT=機器
SensorType: TEMP=温度, HUMD=湿度, POWR=電力, FLOW=流量, POS=開度, STAT=状態, CO2=CO2濃度
</sensor_naming_convention>

<hierarchy_structure>
## 空間階層（上位→下位）
Building → Floor → LargeZone → SmallZone → Room

## 設備階層
全館空調: Chiller → AHU → VAV → LargeZone
個別空調: VRF → SmallZone（大ゾーン横断可能）

## 本建物の構造
Building_A
├── Floor_1
│   ├── LargeZone_1A (東側) ← AHU_1
│   │   ├── SmallZone_1A1 ← VRF_Unit_1
│   │   │   ├── Room_101
│   │   │   └── Room_102
│   │   └── SmallZone_1A2 ← VRF_Unit_1
│   │       └── Room_103
│   └── LargeZone_1B (西側) ← AHU_1
│       └── SmallZone_1B1 ← VRF_Unit_1
└── Floor_2
    └── LargeZone_2A ← AHU_2

設備系統:
- Chiller_1 → AHU_1 (1階担当), AHU_2 (2階担当)
- AHU_1 → VAV_1A1 → LargeZone_1A
- VRF_Unit_1 → SmallZone_1A1, 1A2, 1B1 (ゾーン横断)
</hierarchy_structure>

マッチング時の考慮事項:
1. センサータイプの一致
2. エンティティIDの数字・文字パターン
3. 測定コンテキストのキーワード
4. 設置場所から推定される階層レベル
5. 設備系統の上下関係（AHUのセンサーはそのAHUが担当するゾーンと関連）
6. 空間階層の包含関係（Room_101はSmallZone_1A1に属する等）"""

user_message = """以下の物理センサーをマッチングしてください。

【物理センサー】
名称: 1階東側エリア温度センサー
タイプ: temperature
設置場所: 1階東側天井中央

【生成センサー候補】
- LZN:LargeZone_1A:AMB:TEMP
- LZN:LargeZone_1B:AMB:TEMP
- SZN:SmallZone_1A1:AMB:TEMP
- SZN:SmallZone_1A2:AMB:TEMP
- ROM:Room_101:AMB:TEMP

階層関係を考慮してJSON形式で回答してください。"""

response = client.messages.create(
    model="claude-sonnet-4-20250514",
    max_tokens=1024,
    system=system_prompt,
    messages=[{"role": "user", "content": user_message}]
)

print(response.content[0].text)
```

### 期待される出力例

```json
{
  "matched_sensor": "LZN:LargeZone_1A:AMB:TEMP",
  "confidence": 0.92,
  "hierarchy_analysis": {
    "detected_floor": "Floor_1",
    "detected_area": "東側",
    "matched_level": "LargeZone",
    "matched_entity": "LargeZone_1A"
  },
  "reasoning": "1) '1階' → Floor_1に対応。2) '東側エリア' → LargeZone_1A（東側エリア）の名称と一致。3) '天井中央'という広域的な設置位置は、小ゾーンや部屋単位ではなく大ゾーンレベルを示唆。4) LargeZone_1BはWest側のため除外。",
  "related_entities": {
    "parent": "Floor_1",
    "children": ["SmallZone_1A1", "SmallZone_1A2"],
    "served_by": "AHU_1"
  }
}
```

---

## 4. コンテキスト最小化版（トークン節約用）

```
<naming_rule>
Format: {Type}:{ID}:{Context}:{Sensor}

Type: BLD=建物, FLR=階, LZN=大ゾーン, SZN=小ゾーン, ROM=部屋, CHL=チラー, AHU=外調機, VAV, VRF
Context: OUT=外気, SUP_AIR=給気, RET_AIR=還気, SUP_WTR=送水, RET_WTR=還水, AMB=室内, UNIT=機器
Sensor: TEMP=温度, HUMD=湿度, POWR=電力, FLOW=流量, POS=開度
</naming_rule>

<hierarchy>
空間: Building > Floor > LargeZone > SmallZone > Room
設備: Chiller → AHU → VAV → LargeZone / VRF → SmallZone

Building_A
├─Floor_1
│ ├─LargeZone_1A(東)←AHU_1: SmallZone_1A1(Room_101,102), SmallZone_1A2(Room_103)
│ └─LargeZone_1B(西)←AHU_1: SmallZone_1B1
└─Floor_2
  └─LargeZone_2A←AHU_2

VRF_Unit_1 → SmallZone_1A1, 1A2, 1B1 (横断)
</hierarchy>
```
