#!/usr/bin/env python3
"""
センサー自動命名生成スクリプト

オントロジーに基づいた命名規則でセンサー名を自動生成し、
実センサー名とのマッピング用データを出力する
"""

import json
from dataclasses import dataclass
from typing import Optional
from enum import Enum

# ===========================================
# 定義：オントロジーに基づくコード体系
# ===========================================

class EntityType(Enum):
    BUILDING = "BLD"
    FLOOR = "FLR"
    LARGE_ZONE = "LZN"
    SMALL_ZONE = "SZN"
    ROOM = "ROM"
    CHILLER = "CHL"
    AHU = "AHU"
    VAV = "VAV"
    VRF = "VRF"

class MeasurementContext(Enum):
    OUTSIDE = "OUT"
    SUPPLY_AIR = "SUP_AIR"
    RETURN_AIR = "RET_AIR"
    SUPPLY_WATER = "SUP_WTR"
    RETURN_WATER = "RET_WTR"
    WATER_FLOW = "WTR_FLW"
    AIR_FLOW = "AIR_FLW"
    DAMPER = "DMPR"
    FAN = "FAN"
    FILTER = "FLTR"
    COMPRESSOR = "COMP"
    AMBIENT = "AMB"
    TOTAL = "TOTAL"
    UNIT = "UNIT"

class SensorType(Enum):
    TEMPERATURE = "TEMP"
    HUMIDITY = "HUMD"
    POWER = "POWR"
    FLOW = "FLOW"
    PRESSURE = "PRES"
    POSITION = "POS"
    SPEED = "SPD"
    FREQUENCY = "FREQ"
    STATUS = "STAT"
    CO2 = "CO2"
    OCCUPANCY = "OCCP"
    ILLUMINANCE = "ILLM"

# コード→ラベル変換辞書
ENTITY_TYPE_LABELS = {
    "BLD": "Building",
    "FLR": "Floor",
    "LZN": "Large Zone",
    "SZN": "Small Zone",
    "ROM": "Room",
    "CHL": "Chiller",
    "AHU": "Air Handling Unit",
    "VAV": "Variable Air Volume",
    "VRF": "Variable Refrigerant Flow"
}

MEASUREMENT_CONTEXT_LABELS = {
    "OUT": "Outside/Outdoor",
    "SUP_AIR": "Supply Air",
    "RET_AIR": "Return Air",
    "SUP_WTR": "Supply Water",
    "RET_WTR": "Return Water",
    "WTR_FLW": "Water Flow",
    "AIR_FLW": "Air Flow",
    "DMPR": "Damper",
    "FAN": "Fan",
    "FLTR": "Filter",
    "COMP": "Compressor",
    "AMB": "Ambient/Indoor",
    "TOTAL": "Total",
    "UNIT": "Unit/Equipment"
}

SENSOR_TYPE_LABELS = {
    "TEMP": ("Temperature", "°C"),
    "HUMD": ("Humidity", "%RH"),
    "POWR": ("Power", "kW"),
    "FLOW": ("Flow", "m³/h"),
    "PRES": ("Pressure", "Pa"),
    "POS": ("Position", "%"),
    "SPD": ("Speed", "rpm"),
    "FREQ": ("Frequency", "Hz"),
    "STAT": ("Status", "on/off"),
    "CO2": ("CO2", "ppm"),
    "OCCP": ("Occupancy", "persons"),
    "ILLM": ("Illuminance", "lx")
}

@dataclass
class GeneratedSensor:
    """自動生成されたセンサー定義"""
    generated_name: str
    entity_type: str
    entity_id: str
    measurement_context: str
    sensor_type: str
    natural_language_hint_ja: str
    natural_language_hint_en: str
    ontology_class: str
    unit: str

def generate_sensor_name(entity_type: str, entity_id: str, 
                         measurement_context: str, sensor_type: str) -> str:
    """命名規則に従ってセンサー名を生成"""
    return f"{entity_type}:{entity_id}:{measurement_context}:{sensor_type}"

def create_nl_hint_ja(entity_type: str, entity_id: str, 
                      measurement_context: str, sensor_type: str) -> str:
    """日本語の自然言語ヒントを生成"""
    et_map = {"BLD": "建物", "FLR": "階", "LZN": "大ゾーン", "SZN": "小ゾーン",
              "ROM": "部屋", "CHL": "チラー", "AHU": "外調機", "VAV": "VAV", "VRF": "VRF"}
    mc_map = {"OUT": "外気", "SUP_AIR": "給気", "RET_AIR": "還気", "SUP_WTR": "送水",
              "RET_WTR": "還水", "WTR_FLW": "水流量", "AIR_FLW": "風量", "DMPR": "ダンパー",
              "FAN": "ファン", "FLTR": "フィルタ", "COMP": "圧縮機", "AMB": "環境",
              "TOTAL": "総", "UNIT": "機器"}
    st_map = {"TEMP": "温度", "HUMD": "湿度", "POWR": "電力", "FLOW": "流量",
              "PRES": "差圧", "POS": "開度", "SPD": "回転数", "FREQ": "周波数",
              "STAT": "運転状態", "CO2": "CO2濃度", "OCCP": "在室", "ILLM": "照度"}
    
    return f"{et_map.get(entity_type, entity_type)}({entity_id})の{mc_map.get(measurement_context, measurement_context)}{st_map.get(sensor_type, sensor_type)}センサー"

def create_nl_hint_en(entity_type: str, entity_id: str,
                      measurement_context: str, sensor_type: str) -> str:
    """英語の自然言語ヒントを生成"""
    et = ENTITY_TYPE_LABELS.get(entity_type, entity_type)
    mc = MEASUREMENT_CONTEXT_LABELS.get(measurement_context, measurement_context)
    st = SENSOR_TYPE_LABELS.get(sensor_type, (sensor_type, ""))[0]
    return f"{st} sensor measuring {mc} of {et} {entity_id}"

def get_ontology_class(sensor_type: str) -> str:
    """センサータイプからオントロジークラスを取得"""
    mapping = {
        "TEMP": "wb:TemperatureSensor",
        "HUMD": "wb:HumiditySensor", 
        "POWR": "wb:PowerSensor",
        "FLOW": "wb:FlowSensor",
        "PRES": "brick:Pressure_Sensor",
        "POS": "wb:PositionSensor",
        "SPD": "brick:Speed_Sensor",
        "FREQ": "brick:Frequency_Sensor",
        "STAT": "brick:Status",
        "CO2": "brick:CO2_Sensor",
        "OCCP": "brick:Occupancy_Sensor",
        "ILLM": "brick:Illuminance_Sensor"
    }
    return mapping.get(sensor_type, "brick:Point")

def generate_sensors_from_json(json_data: dict) -> list[GeneratedSensor]:
    """JSONデータからセンサーリストを自動生成"""
    sensors = []
    
    # 建物センサー
    building = json_data["building"]
    building_sensors = [
        ("OUT", "TEMP"),
        ("OUT", "HUMD"),
        ("TOTAL", "POWR")
    ]
    for mc, st in building_sensors:
        sensors.append(create_sensor("BLD", building["id"], mc, st))
    
    # チラーセンサー
    for chiller in json_data.get("centralHVAC", {}).get("chillers", []):
        chiller_sensors = [
            ("SUP_WTR", "TEMP"),
            ("RET_WTR", "TEMP"),
            ("WTR_FLW", "FLOW"),
            ("UNIT", "POWR"),
            ("UNIT", "STAT")
        ]
        for mc, st in chiller_sensors:
            sensors.append(create_sensor("CHL", chiller["id"], mc, st))
    
    # AHUセンサー
    for ahu in json_data.get("centralHVAC", {}).get("ahus", []):
        ahu_sensors = [
            ("OUT", "TEMP"),
            ("OUT", "HUMD"),
            ("SUP_AIR", "TEMP"),
            ("SUP_AIR", "HUMD"),
            ("RET_AIR", "TEMP"),
            ("RET_AIR", "HUMD"),
            ("AIR_FLW", "FLOW"),
            ("DMPR", "POS"),
            ("FAN", "SPD"),
            ("UNIT", "POWR"),
            ("FLTR", "PRES")
        ]
        for mc, st in ahu_sensors:
            sensors.append(create_sensor("AHU", ahu["id"], mc, st))
    
    # VAVセンサー
    for vav in json_data.get("centralHVAC", {}).get("vavs", []):
        vav_sensors = [
            ("SUP_AIR", "TEMP"),
            ("DMPR", "POS"),
            ("AIR_FLW", "FLOW")
        ]
        for mc, st in vav_sensors:
            sensors.append(create_sensor("VAV", vav["id"], mc, st))
    
    # VRFセンサー
    for vrf in json_data.get("individualHVAC", {}).get("vrfs", []):
        vrf_sensors = [
            ("OUT", "TEMP"),
            ("UNIT", "POWR"),
            ("UNIT", "STAT"),
            ("COMP", "FREQ")
        ]
        for mc, st in vrf_sensors:
            sensors.append(create_sensor("VRF", vrf["id"], mc, st))
    
    # 大ゾーンセンサー
    for lz in json_data.get("largeZones", []):
        zone_sensors = [("AMB", "TEMP"), ("AMB", "HUMD")]
        for mc, st in zone_sensors:
            sensors.append(create_sensor("LZN", lz["id"], mc, st))
    
    # 小ゾーンセンサー
    for sz in json_data.get("smallZones", []):
        zone_sensors = [("AMB", "TEMP"), ("AMB", "HUMD")]
        for mc, st in zone_sensors:
            sensors.append(create_sensor("SZN", sz["id"], mc, st))
    
    # 部屋センサー
    for room in json_data.get("rooms", []):
        room_sensors = [
            ("AMB", "TEMP"),
            ("AMB", "HUMD"),
            ("AMB", "CO2"),
            ("AMB", "OCCP"),
            ("AMB", "ILLM")
        ]
        for mc, st in room_sensors:
            sensors.append(create_sensor("ROM", room["id"], mc, st))
    
    return sensors

def create_sensor(entity_type: str, entity_id: str, 
                  measurement_context: str, sensor_type: str) -> GeneratedSensor:
    """センサーオブジェクトを生成"""
    unit = SENSOR_TYPE_LABELS.get(sensor_type, ("", ""))[1]
    return GeneratedSensor(
        generated_name=generate_sensor_name(entity_type, entity_id, measurement_context, sensor_type),
        entity_type=entity_type,
        entity_id=entity_id,
        measurement_context=measurement_context,
        sensor_type=sensor_type,
        natural_language_hint_ja=create_nl_hint_ja(entity_type, entity_id, measurement_context, sensor_type),
        natural_language_hint_en=create_nl_hint_en(entity_type, entity_id, measurement_context, sensor_type),
        ontology_class=get_ontology_class(sensor_type),
        unit=unit
    )

def export_for_ai_mapping(generated_sensors: list[GeneratedSensor], 
                          physical_sensors: list[dict]) -> dict:
    """AIマッピング用のデータ構造を出力"""
    return {
        "mapping_task": {
            "description": "Match each generated sensor name to the most appropriate physical sensor",
            "instructions": "Use semantic similarity between generated_name components and physical sensor name/type"
        },
        "generated_sensors": [
            {
                "generated_name": s.generated_name,
                "semantic_breakdown": {
                    "entity_type": s.entity_type,
                    "entity_type_label": ENTITY_TYPE_LABELS.get(s.entity_type, s.entity_type),
                    "entity_id": s.entity_id,
                    "measurement_context": s.measurement_context,
                    "measurement_context_label": MEASUREMENT_CONTEXT_LABELS.get(s.measurement_context, s.measurement_context),
                    "sensor_type": s.sensor_type,
                    "sensor_type_label": SENSOR_TYPE_LABELS.get(s.sensor_type, (s.sensor_type, ""))[0],
                    "unit": s.unit
                },
                "hints": {
                    "ja": s.natural_language_hint_ja,
                    "en": s.natural_language_hint_en
                },
                "ontology_class": s.ontology_class
            }
            for s in generated_sensors
        ],
        "physical_sensors": physical_sensors
    }

def main():
    # JSONデータを読み込み
    with open("/mnt/user-data/uploads/building_data_Building_A__1_.json", "r", encoding="utf-8") as f:
        json_data = json.load(f)
    
    # センサーを自動生成
    generated_sensors = generate_sensors_from_json(json_data)
    
    # 物理センサーリストを取得
    physical_sensors = json_data.get("sensors", [])
    
    # AIマッピング用データを生成
    mapping_data = export_for_ai_mapping(generated_sensors, physical_sensors)
    
    # 結果を出力
    with open("/home/claude/ai_mapping_input.json", "w", encoding="utf-8") as f:
        json.dump(mapping_data, f, ensure_ascii=False, indent=2)
    
    # サマリーを出力
    print(f"Generated {len(generated_sensors)} sensor definitions")
    print(f"Physical sensors: {len(physical_sensors)}")
    print("\n=== Generated Sensor List ===")
    for s in generated_sensors:
        print(f"  {s.generated_name}")
    
    return mapping_data

if __name__ == "__main__":
    main()
