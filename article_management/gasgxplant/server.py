#!/usr/bin/env python3
import json
import math
import os
import re
from collections import defaultdict
from datetime import datetime, timedelta
from decimal import Decimal
from http import HTTPStatus
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlparse

import pymysql
from pymysql.cursors import DictCursor


ROOT_DIR = Path(__file__).resolve().parent
HOST = os.getenv("GASGXPLANT_HOST", "127.0.0.1")
PORT = int(os.getenv("GASGXPLANT_PORT", "8096"))
MAX_SERIES = 14
MAX_POINTS_PER_SERIES = 1200
NUMERIC_PATTERN = re.compile(r"^-?\d+(\.\d+)?$")

PRESET_LIBRARY = {
    "core-health": {
        "name": "核心生命体征",
        "description": "用于快速判断润滑、温度、电气和发电稳定性。",
        "parameters": [
            "Engine Oil Pressure",
            "water temperature",
            "oil temperature",
            "battery voltage",
            "frequency",
            "engine speed",
            "generator power",
            "power factor",
            "Actual number of faults",
        ],
    },
    "start-system": {
        "name": "启动系统排查",
        "description": "定位启动困难、转速起不来、故障计数增加等问题。",
        "parameters": [
            "battery voltage",
            "engine speed",
            "RPM",
            "Number of startups",
            "Actual number of faults",
            "Engine Oil Pressure",
        ],
    },
    "thermal-risk": {
        "name": "过热风险巡检",
        "description": "重点看冷却和热负荷，辅助判断温控与散热风险。",
        "parameters": [
            "water temperature",
            "oil temperature",
            "Inlet manifold temperature",
            "A发动机A温度",
            "B发动机A温度",
            "发动机舱室温",
            "室外温度",
        ],
    },
    "load-quality": {
        "name": "负载与电能质量",
        "description": "排查输出波动、功率不足、电能质量异常。",
        "parameters": [
            "generator power",
            "Reserve power",
            "frequency",
            "Generator PF",
            "power factor",
            "Generator Voltage L1-L2",
            "Generator Voltage L2-L3",
            "generator current L1",
            "generator current L2",
            "generator current L3",
        ],
    },
    "air-fuel": {
        "name": "进气增压与执行器",
        "description": "辅助判断燃烧效率、增压状态和执行器动作。",
        "parameters": [
            "intake pressure",
            "booster pressure",
            "Throttle position",
            "GOV output",
            "AVR output",
            "engine speed",
            "generator power",
        ],
    },
}


def load_env_file():
    env_file = ROOT_DIR / ".env"
    if not env_file.exists():
        return
    for raw_line in env_file.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        key = key.strip().lstrip("\ufeff")
        value = value.strip().strip("'").strip('"')
        if key and key not in os.environ:
            os.environ[key] = value


def get_db_config():
    config = {
        "host": os.getenv("GASGX_DB_HOST"),
        "port": int(os.getenv("GASGX_DB_PORT", "3306")),
        "user": os.getenv("GASGX_DB_USER"),
        "password": os.getenv("GASGX_DB_PASSWORD"),
        "database": os.getenv("GASGX_DB_NAME"),
        "charset": "utf8mb4",
        "cursorclass": DictCursor,
        "connect_timeout": 10,
        "read_timeout": 15,
        "write_timeout": 15,
        "autocommit": True,
    }
    missing = [k for k, v in config.items() if k in {"host", "user", "password", "database"} and not v]
    if missing:
        raise RuntimeError(
            "Missing database env vars: "
            + ", ".join(f"GASGX_DB_{name.upper()}" for name in missing)
        )
    return config


def get_connection():
    return pymysql.connect(**get_db_config())


def parse_datetime(raw_value, fallback):
    if not raw_value:
        return fallback
    value = raw_value.strip().replace("T", " ")
    for fmt in ("%Y-%m-%d %H:%M:%S", "%Y-%m-%d %H:%M", "%Y-%m-%d"):
        try:
            return datetime.strptime(value, fmt)
        except ValueError:
            continue
    return fallback


def parse_time_window(query, default_hours=24):
    now = datetime.now()
    end_default = now
    start_default = now - timedelta(hours=default_hours)
    start_at = parse_datetime((query.get("start") or [""])[0], start_default)
    end_at = parse_datetime((query.get("end") or [""])[0], end_default)
    if end_at < start_at:
        start_at, end_at = end_at, start_at
    return start_at, end_at


def downsample(points, max_points):
    if len(points) <= max_points:
        return points
    step = len(points) / float(max_points)
    sampled = []
    idx = 0.0
    while int(idx) < len(points):
        sampled.append(points[int(idx)])
        idx += step
    return sampled


def json_response(handler, payload, status=HTTPStatus.OK):
    def _json_default(obj):
        if isinstance(obj, datetime):
            return obj.strftime("%Y-%m-%d %H:%M:%S")
        if isinstance(obj, Decimal):
            return float(obj)
        if hasattr(obj, "isoformat"):
            return obj.isoformat()
        return str(obj)

    body = json.dumps(payload, ensure_ascii=False, default=_json_default).encode("utf-8")
    handler.send_response(status)
    handler.send_header("Content-Type", "application/json; charset=utf-8")
    handler.send_header("Cache-Control", "no-store")
    handler.send_header("Content-Length", str(len(body)))
    handler.end_headers()
    handler.wfile.write(body)


def is_numeric_value(value):
    return bool(NUMERIC_PATTERN.match(str(value).strip()))


def classify_parameter(data_name, data_unit):
    lower = data_name.lower()
    if "temperature" in lower or "温度" in data_name:
        return "温度系统"
    if "pressure" in lower or "压力" in data_name:
        return "压力系统"
    if any(k in lower for k in ["voltage", "current", "power", "frequency", "pf"]) or data_unit in {"V", "A", "kW", "kVA", "kVAr", "Hz", "PF", "cosPhi"}:
        return "发电电气"
    if any(k in lower for k in ["fault", "startup", "hours", "cycles"]) or data_unit in {"times", "h"}:
        return "寿命计数"
    if "流量" in data_name or "flow" in lower:
        return "流量系统"
    return "其他监测"


def normalize_value(data_name, unit, raw_value):
    value = float(raw_value)
    lower = data_name.lower()
    normalized = value
    scale = 1.0
    note = ""

    if ("temperature" in lower or "温度" in data_name) and abs(value) > 180:
        scale = 0.1
        normalized = value * scale
        note = "温度值按 x0.1 映射"
    elif ("frequency" in lower or "频率" in data_name) and abs(value) > 120:
        scale = 0.01
        normalized = value * scale
        note = "频率值按 x0.01 映射"
    elif ("battery voltage" in lower) and abs(value) > 60:
        scale = 0.1
        normalized = value * scale
        note = "电池电压按 x0.1 映射"
    elif (("pressure" in lower) or ("压力" in data_name)) and abs(value) > 20:
        scale = 0.01
        normalized = value * scale
        note = "压力值按 x0.01 映射"
    elif (("power factor" in lower) or ("generator pf" in lower) or unit in {"PF", "cosPhi"}) and abs(value) > 2:
        scale = 0.01
        normalized = value * scale
        note = "功率因数按 x0.01 映射"

    invalid = False
    if ("temperature" in lower or "温度" in data_name) and (normalized < -40 or normalized > 220):
        invalid = True
    if ("frequency" in lower or "频率" in data_name) and (normalized < 0 or normalized > 80):
        invalid = True
    if ("battery voltage" in lower) and (normalized < 0 or normalized > 80):
        invalid = True

    return {
        "raw_value": value,
        "value": normalized,
        "scale": scale,
        "note": note,
        "invalid": invalid,
    }


def metric_alias_map(stats_by_name):
    index = {}
    for name, item in stats_by_name.items():
        key = name.lower()
        index[key] = item
    return index


def pick_metric(stats_index, candidates):
    for key in candidates:
        for actual_key, value in stats_index.items():
            if key in actual_key:
                return value
    return None


def health_level(score):
    if score >= 85:
        return "优"
    if score >= 70:
        return "注意"
    if score >= 50:
        return "风险"
    return "危险"


def evaluate_engine_health(stats_by_name, alarms, end_at):
    findings = []
    anomalies = []
    score = 100
    index = metric_alias_map(stats_by_name)

    oil = pick_metric(index, ["engine oil pressure", "机油压力"])
    coolant = pick_metric(index, ["water temperature", "冷却液温度", "出水口温度"])
    oil_temp = pick_metric(index, ["oil temperature"])
    battery = pick_metric(index, ["battery voltage"])
    frequency = pick_metric(index, ["frequency", "循环泵频率"])
    pf = pick_metric(index, ["power factor", "generator pf"])
    rpm = pick_metric(index, ["engine speed", " rpm"])
    faults = pick_metric(index, ["actual number of faults"])
    power = pick_metric(index, ["generator power"])

    latest_record = max((item["latest_time"] for item in stats_by_name.values()), default=None)
    record_age_minutes = None
    if latest_record:
        record_age_minutes = int((end_at - latest_record).total_seconds() // 60)

    def add_finding(title, severity, value, threshold, advice):
        nonlocal score
        findings.append(
            {
                "title": title,
                "severity": severity,
                "value": value,
                "threshold": threshold,
                "advice": advice,
            }
        )
        if severity == "critical":
            score -= 18
        elif severity == "warn":
            score -= 8

    if oil:
        v = oil["latest"]
        if v < 1.0 or v > 9.0:
            add_finding("机油压力异常", "critical", v, "1.0 ~ 9.0 bar", "优先检查润滑系统、油泵和过滤器。")
        elif v < 1.8 or v > 7.5:
            add_finding("机油压力偏离", "warn", v, "1.8 ~ 7.5 bar", "建议复核机油黏度与负载工况。")

    if coolant:
        v = coolant["latest"]
        if v > 105:
            add_finding("冷却温度过高", "critical", v, "<=105℃", "检查冷却液循环、散热器和风扇。")
        elif v > 95:
            add_finding("冷却温度偏高", "warn", v, "<=95℃", "观察是否持续升温，必要时降载。")

    if oil_temp:
        v = oil_temp["latest"]
        if v > 125:
            add_finding("机油温度过高", "critical", v, "<=125℃", "检查润滑回路和机油冷却环节。")
        elif v > 110:
            add_finding("机油温度偏高", "warn", v, "<=110℃", "建议结合机油压力联判。")

    if battery:
        v = battery["latest"]
        if v > 18:
            low_warn, low_critical = 22.5, 21.0
            high_warn, high_critical = 29.5, 31.0
            threshold = "22.5 ~ 29.5 V"
        else:
            low_warn, low_critical = 11.2, 10.6
            high_warn, high_critical = 14.8, 15.5
            threshold = "11.2 ~ 14.8 V"
        if v < low_critical or v > high_critical:
            add_finding("启动电压异常", "critical", v, threshold, "检查蓄电池和充电回路，避免启动失败。")
        elif v < low_warn or v > high_warn:
            add_finding("启动电压偏离", "warn", v, threshold, "建议检查充放电状态并做电池容量测试。")

    if frequency:
        v = frequency["latest"]
        if v < 49.0 or v > 51.0:
            add_finding("输出频率异常", "critical", v, "49.0 ~ 51.0 Hz", "检查调速器和负载突变情况。")
        elif v < 49.5 or v > 50.5:
            add_finding("输出频率偏移", "warn", v, "49.5 ~ 50.5 Hz", "建议观察短时波动是否持续。")

    if pf:
        v = pf["latest"]
        if v < 0.70:
            add_finding("功率因数过低", "critical", v, ">=0.70", "检查负载侧无功补偿和运行工况。")
        elif v < 0.80:
            add_finding("功率因数偏低", "warn", v, ">=0.80", "建议评估负载结构与补偿策略。")

    running = False
    if rpm and rpm["latest"] >= 600:
        running = True
    if power and power["latest"] >= 20:
        running = True

    if running and rpm:
        v = rpm["latest"]
        if v < 1200 or v > 1850:
            add_finding("转速不稳定", "warn", v, "1200 ~ 1850 rpm", "建议联查调速器与燃气供给。")

    if faults and faults["latest"] > 0:
        add_finding("故障计数非零", "warn", faults["latest"], "0", "建议立即查看故障明细并追溯变化点。")

    open_alarm_count = 0
    for alarm in alarms:
        clear_time = alarm.get("clear_time")
        if clear_time is None or clear_time.year < 2008:
            open_alarm_count += 1

    if open_alarm_count > 0:
        score -= min(25, open_alarm_count * 3)
        findings.append(
            {
                "title": "存在未清除告警",
                "severity": "warn" if open_alarm_count < 4 else "critical",
                "value": open_alarm_count,
                "threshold": "0",
                "advice": "优先处理在线告警，确认是否为通讯离线或真实故障。",
            }
        )

    if record_age_minutes is not None and record_age_minutes > 20:
        score -= 18
        findings.append(
            {
                "title": "数据刷新延迟",
                "severity": "critical",
                "value": record_age_minutes,
                "threshold": "<=20 分钟",
                "advice": "可能存在通讯中断，请检查采集链路和设备在线状态。",
            }
        )

    for item in stats_by_name.values():
        if item["sample_count"] < 10 or item["stdev"] <= 0:
            continue
        z = abs((item["latest"] - item["avg"]) / item["stdev"])
        if z >= 2.6:
            anomalies.append(
                {
                    "name": item["name"],
                    "severity": "critical" if z >= 3.3 else "warn",
                    "z_score": round(z, 2),
                    "latest": item["latest"],
                    "avg": round(item["avg"], 3),
                    "unit": item["unit"],
                }
            )
    anomalies.sort(key=lambda x: x["z_score"], reverse=True)
    if anomalies:
        score -= min(15, len(anomalies) * 2)

    score = max(0, min(100, int(round(score))))
    level = health_level(score)

    running_status = "运行中" if running else "待机/停机"
    if record_age_minutes is not None and record_age_minutes > 20:
        running_status = "通讯异常"

    return {
        "health_score": score,
        "health_level": level,
        "running_status": running_status,
        "open_alarm_count": open_alarm_count,
        "record_age_minutes": record_age_minutes,
        "findings": sorted(findings, key=lambda x: 0 if x["severity"] == "critical" else 1),
        "anomalies": anomalies[:8],
    }


def build_stats(rows):
    grouped = defaultdict(list)
    units = {}
    notes = {}

    for row in rows:
        data_name = row["data_name"]
        raw = str(row["data_value"]).strip()
        if not is_numeric_value(raw):
            continue
        normalized = normalize_value(data_name, row.get("data_unit", ""), raw)
        if normalized["invalid"]:
            continue
        point = {
            "time": row["record_time"],
            "value": normalized["value"],
            "raw_value": normalized["raw_value"],
        }
        grouped[data_name].append(point)
        units[data_name] = row.get("data_unit", "")
        if normalized["note"]:
            notes[data_name] = normalized["note"]

    stats_by_name = {}
    for name, points in grouped.items():
        points.sort(key=lambda p: p["time"])
        values = [p["value"] for p in points]
        if not values:
            continue
        avg = sum(values) / len(values)
        variance = sum((v - avg) ** 2 for v in values) / len(values)
        stdev = math.sqrt(variance)
        stats_by_name[name] = {
            "name": name,
            "unit": units.get(name, ""),
            "category": classify_parameter(name, units.get(name, "")),
            "latest": values[-1],
            "latest_time": points[-1]["time"],
            "first": values[0],
            "delta": values[-1] - values[0],
            "min": min(values),
            "max": max(values),
            "avg": avg,
            "stdev": stdev,
            "sample_count": len(values),
            "normalize_note": notes.get(name, ""),
            "points": points,
        }
    return stats_by_name


def matched_parameters(all_names, target_names):
    lower_to_original = {name.lower(): name for name in all_names}
    result = []
    for item in target_names:
        candidate = lower_to_original.get(item.lower())
        if candidate and candidate not in result:
            result.append(candidate)
            continue
        for actual in all_names:
            if item.lower() in actual.lower() and actual not in result:
                result.append(actual)
                break
    return result


class GasGxPlantHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT_DIR), **kwargs)

    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path.startswith("/api/"):
            self.handle_api(parsed)
            return
        super().do_GET()

    def handle_api(self, parsed):
        try:
            if parsed.path == "/api/health":
                json_response(self, {"ok": True, "service": "gasgxplant"})
                return
            if parsed.path == "/api/devices":
                self.api_devices()
                return
            if parsed.path == "/api/presets":
                self.api_presets()
                return
            if parsed.path == "/api/parameters":
                self.api_parameters(parse_qs(parsed.query))
                return
            if parsed.path == "/api/trends":
                self.api_trends(parse_qs(parsed.query))
                return
            if parsed.path == "/api/inspection":
                self.api_inspection(parse_qs(parsed.query))
                return
            json_response(self, {"error": "Not Found"}, status=HTTPStatus.NOT_FOUND)
        except RuntimeError as exc:
            json_response(self, {"error": str(exc)}, status=HTTPStatus.BAD_REQUEST)
        except Exception as exc:  # pylint: disable=broad-except
            json_response(self, {"error": f"Server error: {exc}"}, status=HTTPStatus.INTERNAL_SERVER_ERROR)

    def api_devices(self):
        with get_connection() as conn, conn.cursor() as cursor:
            cursor.execute(
                """
                SELECT
                    device_uuid,
                    device_name,
                    MAX(record_time) AS latest_record_time,
                    COUNT(*) AS sample_count,
                    SUM(CASE WHEN record_time >= DATE_SUB(NOW(), INTERVAL 24 HOUR) THEN 1 ELSE 0 END) AS samples_24h
                FROM devices_history_data_list
                GROUP BY device_uuid, device_name
                ORDER BY latest_record_time DESC
                """
            )
            rows = cursor.fetchall()

            cursor.execute(
                """
                SELECT device_uuid, COUNT(*) AS open_alarm_count
                FROM devices_alarm_list
                WHERE deleted_at IS NULL
                  AND (clear_time IS NULL OR clear_time < '2008-01-01' OR clear_time < happen_time)
                GROUP BY device_uuid
                """
            )
            alarm_rows = cursor.fetchall()
        alarm_map = {row["device_uuid"]: int(row["open_alarm_count"]) for row in alarm_rows}
        now = datetime.now()
        for row in rows:
            latest = row.get("latest_record_time")
            row["open_alarm_count"] = alarm_map.get(row["device_uuid"], 0)
            row["record_age_minutes"] = int((now - latest).total_seconds() // 60) if latest else None
        json_response(self, {"items": rows, "count": len(rows)})

    def api_presets(self):
        items = []
        for preset_id, preset in PRESET_LIBRARY.items():
            items.append(
                {
                    "id": preset_id,
                    "name": preset["name"],
                    "description": preset["description"],
                    "parameters": preset["parameters"],
                    "parameter_count": len(preset["parameters"]),
                }
            )
        json_response(self, {"items": items, "count": len(items)})

    def api_parameters(self, query):
        device_uuid = (query.get("device_uuid") or [""])[0].strip()
        if not device_uuid:
            raise RuntimeError("device_uuid is required")

        with get_connection() as conn, conn.cursor() as cursor:
            cursor.execute(
                """
                SELECT
                    data_name,
                    COALESCE(data_unit, '') AS data_unit,
                    COUNT(*) AS sample_count,
                    MAX(record_time) AS latest_record_time
                FROM devices_history_data_list
                WHERE device_uuid = %s
                GROUP BY data_name, data_unit
                ORDER BY sample_count DESC, data_name ASC
                """,
                (device_uuid,),
            )
            rows = cursor.fetchall()

        for row in rows:
            row["category"] = classify_parameter(row["data_name"], row["data_unit"])
        json_response(self, {"items": rows, "count": len(rows)})

    def api_trends(self, query):
        device_uuid = (query.get("device_uuid") or [""])[0].strip()
        if not device_uuid:
            raise RuntimeError("device_uuid is required")
        start_at, end_at = parse_time_window(query, default_hours=24)

        raw_params = (query.get("parameters") or [""])[0]
        requested_params = [p.strip() for p in raw_params.split(",") if p.strip()][:MAX_SERIES]
        preset_id = (query.get("preset") or [""])[0].strip()
        normalize_output = (query.get("normalize") or ["true"])[0].strip().lower() != "false"

        with get_connection() as conn, conn.cursor() as cursor:
            cursor.execute(
                """
                SELECT DISTINCT data_name
                FROM devices_history_data_list
                WHERE device_uuid = %s
                ORDER BY data_name
                """,
                (device_uuid,),
            )
            all_names = [row["data_name"] for row in cursor.fetchall()]

            if preset_id in PRESET_LIBRARY and not requested_params:
                requested_params = matched_parameters(all_names, PRESET_LIBRARY[preset_id]["parameters"])

            if not requested_params:
                requested_params = matched_parameters(all_names, PRESET_LIBRARY["core-health"]["parameters"])[:6]

            if not requested_params:
                cursor.execute(
                    """
                    SELECT data_name
                    FROM devices_history_data_list
                    WHERE device_uuid = %s
                      AND record_time BETWEEN %s AND %s
                      AND data_value REGEXP '^-?[0-9]+(\\\\.[0-9]+)?$'
                    GROUP BY data_name
                    ORDER BY COUNT(*) DESC
                    LIMIT 8
                    """,
                    (device_uuid, start_at, end_at),
                )
                requested_params = [row["data_name"] for row in cursor.fetchall()]

            if not requested_params:
                cursor.execute(
                    """
                    SELECT data_name
                    FROM devices_history_data_list
                    WHERE device_uuid = %s
                      AND data_value REGEXP '^-?[0-9]+(\\\\.[0-9]+)?$'
                    GROUP BY data_name
                    ORDER BY COUNT(*) DESC
                    LIMIT 8
                    """,
                    (device_uuid,),
                )
                requested_params = [row["data_name"] for row in cursor.fetchall()]

            if not requested_params:
                json_response(
                    self,
                    {
                        "device_uuid": device_uuid,
                        "start": start_at.isoformat(sep=" "),
                        "end": end_at.isoformat(sep=" "),
                        "series": [],
                        "applied_parameters": [],
                        "message": "No parameters found for this device/time range.",
                    },
                )
                return

            placeholders = ", ".join(["%s"] * len(requested_params))
            cursor.execute(
                f"""
                SELECT
                    record_time,
                    data_name,
                    COALESCE(data_unit, '') AS data_unit,
                    data_value
                FROM devices_history_data_list
                WHERE device_uuid = %s
                  AND record_time BETWEEN %s AND %s
                  AND data_name IN ({placeholders})
                  AND data_value REGEXP '^-?[0-9]+(\\\\.[0-9]+)?$'
                ORDER BY record_time ASC
                """,
                [device_uuid, start_at, end_at, *requested_params],
            )
            rows = cursor.fetchall()

        grouped = defaultdict(list)
        unit_map = {}
        note_map = {}
        for row in rows:
            data_name = row["data_name"]
            unit = row.get("data_unit", "")
            parsed = normalize_value(data_name, unit, row["data_value"])
            if parsed["invalid"]:
                continue
            value = parsed["value"] if normalize_output else parsed["raw_value"]
            grouped[data_name].append(
                {
                    "time": row["record_time"].strftime("%Y-%m-%d %H:%M:%S"),
                    "value": round(value, 4),
                    "raw_value": round(parsed["raw_value"], 4),
                }
            )
            unit_map[data_name] = unit
            if parsed["note"]:
                note_map[data_name] = parsed["note"]

        series = []
        total_points = 0
        for name in requested_params:
            points = downsample(grouped.get(name, []), MAX_POINTS_PER_SERIES)
            total_points += len(points)
            series.append(
                {
                    "name": name,
                    "unit": unit_map.get(name, ""),
                    "category": classify_parameter(name, unit_map.get(name, "")),
                    "points": points,
                    "sampled": len(points),
                    "normalize_note": note_map.get(name, ""),
                }
            )

        json_response(
            self,
            {
                "device_uuid": device_uuid,
                "start": start_at.isoformat(sep=" "),
                "end": end_at.isoformat(sep=" "),
                "applied_parameters": requested_params,
                "series": series,
                "total_points": total_points,
                "normalize": normalize_output,
            },
        )

    def api_inspection(self, query):
        device_uuid = (query.get("device_uuid") or [""])[0].strip()
        if not device_uuid:
            raise RuntimeError("device_uuid is required")
        start_at, end_at = parse_time_window(query, default_hours=24)

        with get_connection() as conn, conn.cursor() as cursor:
            cursor.execute(
                """
                SELECT device_name
                FROM devices_history_data_list
                WHERE device_uuid = %s
                ORDER BY record_time DESC
                LIMIT 1
                """,
                (device_uuid,),
            )
            device_row = cursor.fetchone() or {}

            cursor.execute(
                """
                SELECT
                    record_time,
                    data_name,
                    COALESCE(data_unit, '') AS data_unit,
                    data_value
                FROM devices_history_data_list
                WHERE device_uuid = %s
                  AND record_time BETWEEN %s AND %s
                  AND data_value REGEXP '^-?[0-9]+(\\\\.[0-9]+)?$'
                ORDER BY record_time ASC
                """,
                (device_uuid, start_at, end_at),
            )
            rows = cursor.fetchall()

            cursor.execute(
                """
                SELECT
                    alarm_name,
                    happen_time,
                    clear_time,
                    alarm_message,
                    alarm_level
                FROM devices_alarm_list
                WHERE device_uuid = %s
                  AND happen_time BETWEEN %s AND %s
                ORDER BY happen_time DESC
                LIMIT 100
                """,
                (device_uuid, start_at, end_at),
            )
            alarms = cursor.fetchall()

        stats_by_name = build_stats(rows)
        health = evaluate_engine_health(stats_by_name, alarms, end_at)
        sorted_stats = sorted(
            stats_by_name.values(),
            key=lambda item: (item["category"], -item["sample_count"], item["name"]),
        )

        metrics = []
        for item in sorted_stats:
            metrics.append(
                {
                    "name": item["name"],
                    "category": item["category"],
                    "unit": item["unit"],
                    "latest": round(item["latest"], 4),
                    "delta": round(item["delta"], 4),
                    "avg": round(item["avg"], 4),
                    "min": round(item["min"], 4),
                    "max": round(item["max"], 4),
                    "sample_count": item["sample_count"],
                    "latest_time": item["latest_time"],
                    "normalize_note": item["normalize_note"],
                }
            )

        active_presets = []
        available_names = [item["name"] for item in metrics]
        for preset_id, preset in PRESET_LIBRARY.items():
            matched = matched_parameters(available_names, preset["parameters"])
            active_presets.append(
                {
                    "id": preset_id,
                    "name": preset["name"],
                    "description": preset["description"],
                    "matched_parameters": matched,
                }
            )

        json_response(
            self,
            {
                "device_uuid": device_uuid,
                "device_name": device_row.get("device_name", ""),
                "start": start_at.isoformat(sep=" "),
                "end": end_at.isoformat(sep=" "),
                "metric_count": len(metrics),
                "metrics": metrics,
                "health": health,
                "alarms": alarms[:20],
                "active_presets": active_presets,
            },
        )

    def log_message(self, fmt, *args):
        return


def main():
    load_env_file()
    host = os.getenv("GASGXPLANT_HOST", HOST)
    port = int(os.getenv("GASGXPLANT_PORT", str(PORT)))
    print(f"[gasgxplant] Serving {ROOT_DIR}")
    print(f"[gasgxplant] Open http://{host}:{port}/")
    print("[gasgxplant] Required env vars: GASGX_DB_HOST, GASGX_DB_PORT, GASGX_DB_NAME, GASGX_DB_USER, GASGX_DB_PASSWORD")
    server = ThreadingHTTPServer((host, port), GasGxPlantHandler)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n[gasgxplant] stopped.")
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
