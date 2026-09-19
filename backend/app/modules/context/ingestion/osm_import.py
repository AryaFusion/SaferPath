import hashlib
import json
from datetime import UTC, datetime, timedelta
from urllib.parse import urlparse
from urllib.request import Request, urlopen

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.models.context import SafetySignal

ALLOWED_HOSTS = {"overpass-api.de"}


def pilot_bbox() -> tuple[float, float, float, float]:
    values = tuple(float(value) for value in get_settings().osm_pilot_bbox.split(","))
    if len(values) != 4 or not (
        18.85 <= values[0] < values[2] <= 19.35 and 72.75 <= values[1] < values[3] <= 73.15
    ):
        raise ValueError("Invalid Mumbai OSM pilot bounds")
    return values


def overpass_url() -> str:
    value = get_settings().osm_overpass_url
    parsed = urlparse(value)
    if (
        parsed.scheme != "https"
        or parsed.hostname not in ALLOWED_HOSTS
        or parsed.port not in {None, 443}
        or parsed.username
        or parsed.password
    ):
        raise ValueError("Configured OSM endpoint is not allowed")
    return value


def normalize(element: dict) -> list[tuple[str, str]]:
    tags = element.get("tags", {})
    values = []
    if tags.get("highway") == "street_lamp":
        values.append(("LIGHTING", "STREET_LAMP"))
    if tags.get("lit") in {"yes", "no"}:
        values.append(("LIGHTING", f"MAPPED_LIT_{tags['lit'].upper()}"))
    if tags.get("highway") in {"footway", "path", "pedestrian", "steps", "crossing"} or tags.get(
        "sidewalk"
    ) in {"both", "left", "right", "no"}:
        values.append(("PEDESTRIAN_INFRASTRUCTURE", "MAPPED"))
    if any(tags.get(key) for key in ("amenity", "shop", "office", "tourism", "leisure")):
        values.append(("ACTIVITY", "MAPPED_AMENITY"))
    if (
        tags.get("public_transport")
        or tags.get("railway") in {"station", "halt"}
        or tags.get("highway") == "bus_stop"
    ):
        values.append(("TRANSIT", "MAPPED_TRANSIT"))
    if any(tags.get(key) for key in ("wheelchair", "tactile_paving", "kerb", "ramp")):
        values.append(("ACCESSIBILITY", "MAPPED_ACCESSIBILITY"))
    if tags.get("highway"):
        values.append(("ROAD_CONTEXT", "MAPPED_ROAD"))
    return values


def _point(coordinates: tuple[float, float]) -> str:
    lon, lat = coordinates
    return f"POINT({lon} {lat})"


def _geometry(element: dict, nodes: dict[int, tuple[float, float]]) -> str | None:
    def valid(point):
        return (
            all(
                isinstance(value, (int, float)) and not isinstance(value, bool) and value == value
                for value in point
            )
            and -180 <= point[0] <= 180
            and -90 <= point[1] <= 90
        )

    if element.get("type") == "node":
        point = (element.get("lon"), element.get("lat"))
        if not valid(point):
            raise ValueError("invalid OSM node coordinate")
        return _point(point)
    if element.get("type") == "way":
        references = element.get("nodes")
        if not isinstance(references, list) or len(references) < 2:
            raise ValueError("invalid OSM way")
        try:
            points = [nodes[reference] for reference in references]
        except KeyError as exc:
            raise ValueError("missing OSM way node") from exc
        if not all(valid(point) for point in points):
            raise ValueError("invalid OSM way coordinate")
        rendered = ",".join(f"{lon} {lat}" for lon, lat in points)
        if (
            len(points) >= 4
            and points[0] == points[-1]
            and any(element.get("tags", {}).get(key) for key in ("amenity", "leisure", "tourism"))
        ):
            return f"POLYGON(({rendered}))"
        return f"LINESTRING({rendered})"
    raise ValueError(f"unsupported OSM element type: {element.get('type')}")


def import_osm(db: Session, payload: dict | None = None) -> dict[str, int]:
    settings = get_settings()
    south, west, north, east = pilot_bbox()
    if payload is None:
        query = f"[out:json][timeout:{settings.osm_import_timeout_seconds}];(nwr[highway]({south},{west},{north},{east});nwr[amenity]({south},{west},{north},{east}););out center tags;"
        request = Request(
            overpass_url(),
            data=query.encode(),
            headers={"Content-Type": "application/x-www-form-urlencoded"},
        )
        with urlopen(request, timeout=settings.osm_import_timeout_seconds) as response:
            payload = json.loads(response.read(10_000_000))
    elements = payload.get("elements") if isinstance(payload, dict) else None
    if not isinstance(elements, list) or len(elements) > settings.osm_import_max_features:
        raise ValueError("Invalid OSM response")
    stats = {"fetched": len(elements), "accepted": 0, "inserted": 0, "updated": 0, "skipped": 0}
    nodes = {
        element["id"]: (element.get("lon"), element.get("lat"))
        for element in elements
        if element.get("type") == "node" and "id" in element
    }
    for element in elements:
        if not isinstance(element, dict) or "id" not in element:
            stats["skipped"] += 1
            continue
        try:
            geometry = _geometry(element, nodes)
        except ValueError:
            stats["skipped"] += 1
            continue
        for signal_type, value in normalize(element):
            identity = hashlib.sha256(
                f"{element.get('type')}:{element['id']}:{signal_type}:{value}".encode()
            ).hexdigest()
            existing = db.scalar(
                select(SafetySignal).where(SafetySignal.source_identity == identity)
            )
            now = datetime.now(UTC)
            if existing:
                existing.observed_at = now
                existing.provenance = {"source": "OSM", "element_id": element["id"]}
                existing.geometry = func.ST_GeomFromText(geometry, 4326)
                stats["updated"] += 1
            else:
                db.add(
                    SafetySignal(
                        signal_type=signal_type,
                        normalized_value={"value": value},
                        source_type="OSM",
                        source_reference=str(element["id"]),
                        source_identity=identity,
                        geometry=func.ST_GeomFromText(geometry, 4326),
                        observed_at=now,
                        expires_at=now + timedelta(days=180),
                        confidence="medium",
                        verification_status="mapped",
                        privacy_class="public",
                        provenance={"source": "OSM", "element_id": element["id"]},
                    )
                )
                db.flush()
                stats["inserted"] += 1
            stats["accepted"] += 1
    db.commit()
    return stats


if __name__ == "__main__":
    from app.db.session import SessionLocal

    with SessionLocal() as session:
        print(import_osm(session))
