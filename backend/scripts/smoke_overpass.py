import json
import time
import urllib.error
import urllib.request
from datetime import UTC, datetime

from app.core.config import get_settings
from app.modules.context.ingestion.osm_import import overpass_url, pilot_bbox


def run_bounded_overpass_smoke() -> dict:
    settings = get_settings()
    endpoint = overpass_url()
    south, west, north, east = pilot_bbox()

    # Highly bounded query: 0.02 deg box in South Mumbai pilot area, limit 1 feature
    bbox_south = 18.92
    bbox_west = 72.82
    bbox_north = 18.94
    bbox_east = 72.84
    assert south <= bbox_south < bbox_north <= north
    assert west <= bbox_west < bbox_east <= east

    timeout = min(settings.osm_import_timeout_seconds, 25)
    query = (
        f"[out:json][timeout:{timeout}];"
        f"node({bbox_south:.2f},{bbox_west:.2f},{bbox_north:.2f},{bbox_east:.2f})[amenity];"
        f"out 1;"
    )

    req = urllib.request.Request(
        endpoint,
        data=query.encode("utf-8"),
        headers={
            "User-Agent": "SaferPath-Verification-Smoke/1.0",
            "Content-Type": "application/x-www-form-urlencoded",
        },
    )

    start = time.perf_counter()
    report = {
        "timestamp": datetime.now(UTC).isoformat(),
        "endpoint": endpoint,
        "pilot_bbox": [south, west, north, east],
        "smoke_query_bbox": [bbox_south, bbox_west, bbox_north, bbox_east],
        "timeout_seconds": timeout,
        "feature_limit": 1,
        "persisted_data": False,
        "success": False,
        "status_code": None,
        "duration_seconds": None,
        "elements_count": 0,
        "error": None,
    }

    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            duration = time.perf_counter() - start
            report["status_code"] = resp.status
            report["duration_seconds"] = round(duration, 3)
            raw = resp.read(25_000)
            data = json.loads(raw)
            elements = data.get("elements", [])
            report["elements_count"] = len(elements)
            report["success"] = resp.status == 200
            if elements:
                report["sample_element_type"] = elements[0].get("type")
                report["sample_element_id"] = elements[0].get("id")
    except urllib.error.HTTPError as exc:
        duration = time.perf_counter() - start
        report["status_code"] = exc.code
        report["duration_seconds"] = round(duration, 3)
        report["error"] = f"HTTPError: {exc.code} {exc.reason}"
    except (urllib.error.URLError, TimeoutError, OSError) as exc:
        duration = time.perf_counter() - start
        report["duration_seconds"] = round(duration, 3)
        report["error"] = f"NetworkError: {type(exc).__name__}: {exc}"

    return report


if __name__ == "__main__":
    result = run_bounded_overpass_smoke()
    print(json.dumps(result, indent=2))

