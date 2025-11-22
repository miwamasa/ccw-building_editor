#!/usr/bin/env python3
"""
センサーマッチングアルゴリズム

自動生成されたセンサー名と物理センサー名をマッチングする
"""

import json
import csv
import re
from dataclasses import dataclass, field
from typing import Optional
from enum import Enum

# ===========================================
# マッチング用の辞書・パターン定義
# ===========================================

# センサータイプのマッピング（物理センサーtype → 生成センサーSensorType）
SENSOR_TYPE_MAPPING = {
    "temperature": "TEMP",
    "humidity": "HUMD",
    "power": "POWR",
    "flow": "FLOW",
    "pressure": "PRES",
    "position": "POS",
    "speed": "SPD",
    "frequency": "FREQ",
    "status": "STAT",
    "co2": "CO2",
    "occupancy": "OCCP",
    "illuminance": "ILLM"
}

# 測定コンテキストを推定するためのキーワード辞書
MEASUREMENT_CONTEXT_KEYWORDS = {
    "OUT": ["外気", "外部", "屋外", "外壁", "outdoor", "outside", "ambient"],
    "SUP_AIR": ["給気", "供給", "吹出", "supply", "sa"],
    "RET_AIR": ["還気", "戻り", "還り", "return", "ra", "還"],
    "SUP_WTR": ["送水", "冷水供給", "供給配管", "chws", "supply water"],
    "RET_WTR": ["還水", "戻り水", "還配管", "chwr", "return water", "冷水還"],
    "WTR_FLW": ["水流量", "水量", "water flow"],
    "AIR_FLW": ["風量", "air flow", "airflow"],
    "DMPR": ["ダンパー", "damper", "開度"],
    "FAN": ["ファン", "fan", "送風機", "回転"],
    "FLTR": ["フィルタ", "filter", "差圧"],
    "COMP": ["圧縮機", "compressor", "コンプレッサー", "周波数"],
    "AMB": ["室内", "室温", "環境", "天井", "壁面", "ラック"],
    "TOTAL": ["総", "合計", "total", "全体"],
    "UNIT": ["機器", "本体", "unit", "メーター", "電力計", "電力メーター"]
}

# エンティティタイプを推定するためのキーワード辞書
ENTITY_TYPE_KEYWORDS = {
    "BLD": ["建物", "全館", "building"],
    "FLR": ["階", "floor", "フロア"],
    "LZN": ["大ゾーン", "large zone", "エリア全体"],
    "SZN": ["小ゾーン", "small zone"],
    "ROM": ["会議室", "オフィス", "執務室", "サーバールーム", "room", "室"],
    "CHL": ["チラー", "chiller", "冷凍機"],
    "AHU": ["ahu", "外調機", "空調機", "エアハン"],
    "VAV": ["vav"],
    "VRF": ["vrf", "室外機", "マルチ"]
}

# エンティティID抽出用の正規表現パターン
ENTITY_ID_PATTERNS = [
    # AHU関連
    (r'AHU[-_]?(\d+)', 'AHU', lambda m: f"AHU_{m.group(1)}"),
    (r'(\d+)[F階][-_]?AHU[-_]?(\d+)', 'AHU', lambda m: f"AHU_{m.group(2)}"),
    (r'外調機(\d+)', 'AHU', lambda m: f"AHU_{m.group(1)}"),
    
    # チラー関連
    (r'チラー(\d+)', 'CHL', lambda m: f"Chiller_{m.group(1)}"),
    (r'chiller[-_]?(\d+)', 'CHL', lambda m: f"Chiller_{m.group(1)}"),
    
    # VRF関連
    (r'VRF[-_]?(?:室外機)?[-_]?(\d+)', 'VRF', lambda m: f"VRF_Unit_{m.group(1)}"),
    (r'VRF[-_]?OU[-_]?(\d+)', 'VRF', lambda m: f"VRF_Unit_{m.group(1)}"),
    (r'室外機(\d+)', 'VRF', lambda m: f"VRF_Unit_{m.group(1)}"),
    
    # VAV関連
    (r'VAV[-_]?(\d+[A-Za-z]?\d*)', 'VAV', lambda m: f"VAV_{m.group(1).upper()}"),
    
    # 部屋関連
    (r'会議室(\d+)', 'ROM', lambda m: f"Room_{m.group(1)}"),
    (r'オフィス(\d+)', 'ROM', lambda m: f"Room_{m.group(1)}"),
    (r'サーバールーム(\d+)', 'ROM', lambda m: f"Room_{m.group(1)}"),
    (r'オープンオフィス(\d+)', 'ROM', lambda m: f"Room_{m.group(1)}"),
    (r'Room[-_]?(\d+)', 'ROM', lambda m: f"Room_{m.group(1)}"),
    
    # ゾーン関連
    (r'大ゾーン[-_]?(\d+[A-Za-z]?)', 'LZN', lambda m: f"LargeZone_{m.group(1).upper()}"),
    (r'小ゾーン[-_]?(\d+[A-Za-z]?\d*)', 'SZN', lambda m: f"SmallZone_{m.group(1).upper()}"),
    
    # 建物
    (r'[A-Z]棟', 'BLD', lambda m: "Building_A"),
]


@dataclass
class MatchCandidate:
    """マッチング候補"""
    generated_name: str
    score: float
    breakdown: dict = field(default_factory=dict)
    

@dataclass
class MatchResult:
    """マッチング結果"""
    physical_sensor_id: str
    physical_sensor_name: str
    best_match: Optional[str]
    confidence: float
    all_candidates: list
    match_details: dict


class SensorMatcher:
    """センサーマッチングエンジン"""
    
    def __init__(self, generated_sensors: list[dict]):
        """
        Args:
            generated_sensors: 自動生成されたセンサーのリスト
        """
        self.generated_sensors = generated_sensors
        self._build_index()
        
    def _build_index(self):
        """検索用インデックスを構築"""
        # センサータイプ別インデックス
        self.by_sensor_type = {}
        for gs in self.generated_sensors:
            st = gs["semantic_breakdown"]["sensor_type"]
            if st not in self.by_sensor_type:
                self.by_sensor_type[st] = []
            self.by_sensor_type[st].append(gs)
            
        # エンティティID別インデックス
        self.by_entity_id = {}
        for gs in self.generated_sensors:
            eid = gs["semantic_breakdown"]["entity_id"]
            if eid not in self.by_entity_id:
                self.by_entity_id[eid] = []
            self.by_entity_id[eid].append(gs)
    
    def match(self, physical_sensor: dict) -> MatchResult:
        """
        物理センサーに対して最適な生成センサーをマッチング
        
        Args:
            physical_sensor: 物理センサー情報 (id, name, type, location, unit)
            
        Returns:
            MatchResult: マッチング結果
        """
        ps_id = physical_sensor.get("id", "")
        ps_name = physical_sensor.get("name", "")
        ps_type = physical_sensor.get("type", "")
        ps_location = physical_sensor.get("location", "")
        
        # 検索用テキストを結合
        search_text = f"{ps_name} {ps_location}".lower()
        
        # Step 1: センサータイプでフィルタリング
        target_sensor_type = SENSOR_TYPE_MAPPING.get(ps_type.lower())
        if not target_sensor_type:
            return MatchResult(
                physical_sensor_id=ps_id,
                physical_sensor_name=ps_name,
                best_match=None,
                confidence=0.0,
                all_candidates=[],
                match_details={"error": f"Unknown sensor type: {ps_type}"}
            )
        
        candidates = self.by_sensor_type.get(target_sensor_type, [])
        if not candidates:
            return MatchResult(
                physical_sensor_id=ps_id,
                physical_sensor_name=ps_name,
                best_match=None,
                confidence=0.0,
                all_candidates=[],
                match_details={"error": f"No generated sensors for type: {target_sensor_type}"}
            )
        
        # Step 2: エンティティIDを抽出
        extracted_entity = self._extract_entity_id(ps_name, ps_location)
        
        # Step 3: 測定コンテキストを推定
        extracted_context = self._extract_measurement_context(ps_name, ps_location)
        
        # Step 4: 各候補にスコアを付与
        scored_candidates = []
        for gs in candidates:
            score, breakdown = self._calculate_score(
                gs, 
                extracted_entity, 
                extracted_context,
                search_text
            )
            scored_candidates.append(MatchCandidate(
                generated_name=gs["generated_name"],
                score=score,
                breakdown=breakdown
            ))
        
        # スコア順にソート
        scored_candidates.sort(key=lambda x: x.score, reverse=True)
        
        # 結果を構築
        best = scored_candidates[0] if scored_candidates else None
        
        return MatchResult(
            physical_sensor_id=ps_id,
            physical_sensor_name=ps_name,
            best_match=best.generated_name if best else None,
            confidence=best.score if best else 0.0,
            all_candidates=[
                {"name": c.generated_name, "score": round(c.score, 3), "breakdown": c.breakdown}
                for c in scored_candidates[:5]  # 上位5件を返す
            ],
            match_details={
                "extracted_entity": extracted_entity,
                "extracted_context": extracted_context,
                "target_sensor_type": target_sensor_type
            }
        )
    
    def _extract_entity_id(self, name: str, location: str) -> dict:
        """物理センサー名・場所からエンティティIDを抽出"""
        combined = f"{name} {location}"
        
        for pattern, entity_type, id_generator in ENTITY_ID_PATTERNS:
            match = re.search(pattern, combined, re.IGNORECASE)
            if match:
                return {
                    "entity_type": entity_type,
                    "entity_id": id_generator(match),
                    "matched_pattern": pattern,
                    "matched_text": match.group(0)
                }
        
        # パターンマッチしなかった場合、キーワードベースで推定
        combined_lower = combined.lower()
        for entity_type, keywords in ENTITY_TYPE_KEYWORDS.items():
            for kw in keywords:
                if kw.lower() in combined_lower:
                    return {
                        "entity_type": entity_type,
                        "entity_id": None,  # 具体的なIDは不明
                        "matched_keyword": kw
                    }
        
        return {"entity_type": None, "entity_id": None}
    
    def _extract_measurement_context(self, name: str, location: str) -> dict:
        """物理センサー名・場所から測定コンテキストを推定"""
        combined = f"{name} {location}".lower()
        
        matched_contexts = []
        for context_code, keywords in MEASUREMENT_CONTEXT_KEYWORDS.items():
            for kw in keywords:
                if kw.lower() in combined:
                    matched_contexts.append({
                        "context": context_code,
                        "keyword": kw,
                        "priority": keywords.index(kw)  # リストの先頭ほど優先度高
                    })
        
        if matched_contexts:
            # 優先度でソートして最も適切なものを選択
            matched_contexts.sort(key=lambda x: x["priority"])
            best = matched_contexts[0]
            return {
                "primary_context": best["context"],
                "matched_keyword": best["keyword"],
                "all_matches": [m["context"] for m in matched_contexts]
            }
        
        return {"primary_context": None, "all_matches": []}
    
    def _calculate_score(self, generated_sensor: dict, 
                         extracted_entity: dict,
                         extracted_context: dict,
                         search_text: str) -> tuple[float, dict]:
        """マッチングスコアを計算"""
        score = 0.0
        breakdown = {}
        
        gs_breakdown = generated_sensor["semantic_breakdown"]
        gs_entity_type = gs_breakdown["entity_type"]
        gs_entity_id = gs_breakdown["entity_id"]
        gs_context = gs_breakdown["measurement_context"]
        
        # 1. エンティティID完全一致 (40点)
        if extracted_entity.get("entity_id"):
            if extracted_entity["entity_id"] == gs_entity_id:
                score += 0.40
                breakdown["entity_id_match"] = 0.40
            elif extracted_entity["entity_id"] and gs_entity_id:
                # 部分一致をチェック（数字部分の一致など）
                ext_nums = re.findall(r'\d+', extracted_entity["entity_id"])
                gs_nums = re.findall(r'\d+', gs_entity_id)
                if ext_nums and gs_nums and ext_nums[0] == gs_nums[0]:
                    score += 0.20
                    breakdown["entity_id_partial"] = 0.20
        
        # 2. エンティティタイプ一致 (25点)
        if extracted_entity.get("entity_type"):
            if extracted_entity["entity_type"] == gs_entity_type:
                score += 0.25
                breakdown["entity_type_match"] = 0.25
        
        # 3. 測定コンテキスト一致 (25点)
        if extracted_context.get("primary_context"):
            if extracted_context["primary_context"] == gs_context:
                score += 0.25
                breakdown["context_match"] = 0.25
            elif gs_context in extracted_context.get("all_matches", []):
                score += 0.15
                breakdown["context_partial"] = 0.15
        
        # 4. キーワードボーナス (10点)
        # 生成センサーのヒントに含まれるキーワードが検索テキストにあるか
        hints_ja = generated_sensor.get("hints", {}).get("ja", "").lower()
        common_keywords = self._find_common_keywords(search_text, hints_ja)
        if common_keywords:
            keyword_score = min(len(common_keywords) * 0.03, 0.10)
            score += keyword_score
            breakdown["keyword_bonus"] = keyword_score
            breakdown["matched_keywords"] = common_keywords
        
        return score, breakdown
    
    def _find_common_keywords(self, text1: str, text2: str) -> list:
        """2つのテキスト間で共通するキーワードを見つける"""
        # 重要なキーワードリスト
        important_keywords = [
            "外気", "給気", "還気", "送水", "還水", "風量", "温度", "湿度",
            "電力", "ダンパー", "開度", "圧縮機", "室外機", "チラー",
            "会議室", "オフィス", "ahu", "vav", "vrf"
        ]
        
        found = []
        for kw in important_keywords:
            if kw in text1 and kw in text2:
                found.append(kw)
        
        return found


def load_physical_sensors(csv_path: str) -> list[dict]:
    """CSVから物理センサーリストを読み込み"""
    sensors = []
    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            sensors.append(row)
    return sensors


def load_generated_sensors(json_path: str) -> list[dict]:
    """JSONから生成センサーリストを読み込み"""
    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    return data.get("generated_sensors", [])


def run_matching(physical_sensors: list[dict], 
                 generated_sensors: list[dict],
                 confidence_threshold: float = 0.5) -> dict:
    """
    マッチング処理を実行
    
    Args:
        physical_sensors: 物理センサーのリスト
        generated_sensors: 生成センサーのリスト
        confidence_threshold: マッチング信頼度の閾値
        
    Returns:
        マッチング結果のサマリー
    """
    matcher = SensorMatcher(generated_sensors)
    
    results = []
    high_confidence = []
    low_confidence = []
    no_match = []
    
    for ps in physical_sensors:
        result = matcher.match(ps)
        results.append(result)
        
        if result.confidence >= confidence_threshold:
            high_confidence.append(result)
        elif result.confidence > 0:
            low_confidence.append(result)
        else:
            no_match.append(result)
    
    return {
        "summary": {
            "total_physical_sensors": len(physical_sensors),
            "total_generated_sensors": len(generated_sensors),
            "high_confidence_matches": len(high_confidence),
            "low_confidence_matches": len(low_confidence),
            "no_match": len(no_match),
            "confidence_threshold": confidence_threshold
        },
        "results": [
            {
                "physical_id": r.physical_sensor_id,
                "physical_name": r.physical_sensor_name,
                "matched_to": r.best_match,
                "confidence": round(r.confidence, 3),
                "match_details": r.match_details,
                "alternatives": r.all_candidates[1:3] if len(r.all_candidates) > 1 else []
            }
            for r in results
        ],
        "high_confidence_matches": [
            {
                "physical": f"{r.physical_sensor_id}: {r.physical_sensor_name}",
                "generated": r.best_match,
                "confidence": round(r.confidence, 3)
            }
            for r in high_confidence
        ],
        "needs_review": [
            {
                "physical": f"{r.physical_sensor_id}: {r.physical_sensor_name}",
                "generated": r.best_match,
                "confidence": round(r.confidence, 3),
                "reason": "Low confidence - needs manual review"
            }
            for r in low_confidence
        ]
    }


def main():
    """メイン処理"""
    # データ読み込み
    physical_sensors = load_physical_sensors("/mnt/user-data/uploads/sample_physical_sensors.csv")
    generated_sensors = load_generated_sensors("/home/claude/ai_mapping_input.json")
    
    print(f"Loaded {len(physical_sensors)} physical sensors")
    print(f"Loaded {len(generated_sensors)} generated sensors")
    print()
    
    # マッチング実行
    results = run_matching(physical_sensors, generated_sensors, confidence_threshold=0.5)
    
    # 結果をJSONに保存
    with open("/home/claude/matching_results.json", "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)
    
    # サマリー表示
    print("=" * 60)
    print("MATCHING SUMMARY")
    print("=" * 60)
    summary = results["summary"]
    print(f"Total Physical Sensors: {summary['total_physical_sensors']}")
    print(f"Total Generated Sensors: {summary['total_generated_sensors']}")
    print(f"High Confidence Matches (>= {summary['confidence_threshold']}): {summary['high_confidence_matches']}")
    print(f"Low Confidence Matches: {summary['low_confidence_matches']}")
    print(f"No Match: {summary['no_match']}")
    print()
    
    print("=" * 60)
    print("HIGH CONFIDENCE MATCHES")
    print("=" * 60)
    for m in results["high_confidence_matches"]:
        print(f"  {m['physical']}")
        print(f"    → {m['generated']} (confidence: {m['confidence']})")
        print()
    
    print("=" * 60)
    print("NEEDS REVIEW (Low Confidence)")
    print("=" * 60)
    for m in results["needs_review"]:
        print(f"  {m['physical']}")
        print(f"    → {m['generated']} (confidence: {m['confidence']})")
        print()
    
    return results


if __name__ == "__main__":
    main()
