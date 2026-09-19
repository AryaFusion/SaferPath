import hashlib
import uuid
from datetime import UTC, datetime

import pytest
from sqlalchemy import func, select, text
from sqlalchemy.exc import SQLAlchemyError

from app.db.session import SessionLocal
from app.models.context import SafetySignal
from app.modules.context.ingestion.osm_import import (
    _geometry,
    import_osm,
    normalize,
)


@pytest.fixture
def clean_osm_signals():
    test_prefix = f"test-osm-{uuid.uuid4().hex[:8]}"
    yield test_prefix
    with SessionLocal() as session:
        session.execute(
            text("DELETE FROM safety_signals WHERE source_reference LIKE :prefix"),
            {"prefix": f"{test_prefix}%"},
        )
        session.commit()


def test_osm_node_to_point_persisted_srid_4326(clean_osm_signals):
    element_id = f"{clean_osm_signals}-node-1"
    payload = {
        "elements": [
            {
                "type": "node",
                "id": element_id,
                "lon": 72.8373,
                "lat": 19.0269,
                "tags": {"highway": "street_lamp"},
            }
        ]
    }
    with SessionLocal() as session:
        stats = import_osm(session, payload)
        # highway=street_lamp yields LIGHTING + ROAD_CONTEXT
        assert stats["inserted"] == 2
        assert stats["accepted"] == 2

        signal = session.scalar(
            select(SafetySignal).where(
                SafetySignal.source_reference == str(element_id),
                SafetySignal.signal_type == "LIGHTING",
            )
        )
        assert signal is not None
        assert signal.signal_type == "LIGHTING"
        assert signal.normalized_value == {"value": "STREET_LAMP"}
        assert signal.source_type == "OSM"

        # Verify actual persisted geometry in PostGIS
        geom_type = session.scalar(
            select(func.GeometryType(SafetySignal.geometry)).where(SafetySignal.id == signal.id)
        )
        assert geom_type == "POINT"

        srid = session.scalar(
            select(func.ST_SRID(SafetySignal.geometry)).where(SafetySignal.id == signal.id)
        )
        assert srid == 4326

        wkt = session.scalar(
            select(func.ST_AsText(SafetySignal.geometry)).where(SafetySignal.id == signal.id)
        )
        assert wkt == "POINT(72.8373 19.0269)"


def test_osm_open_way_to_linestring_persisted_srid_4326(clean_osm_signals):
    way_id = f"{clean_osm_signals}-way-1"
    payload = {
        "elements": [
            {"type": "node", "id": 9001, "lon": 72.8300, "lat": 19.0200},
            {"type": "node", "id": 9002, "lon": 72.8310, "lat": 19.0210},
            {"type": "node", "id": 9003, "lon": 72.8320, "lat": 19.0220},
            {
                "type": "way",
                "id": way_id,
                "nodes": [9001, 9002, 9003],
                "tags": {"highway": "footway"},
            },
        ]
    }
    with SessionLocal() as session:
        stats = import_osm(session, payload)
        # highway=footway yields PEDESTRIAN_INFRASTRUCTURE + ROAD_CONTEXT
        assert stats["inserted"] == 2

        signal = session.scalar(
            select(SafetySignal).where(
                SafetySignal.source_reference == str(way_id),
                SafetySignal.signal_type == "PEDESTRIAN_INFRASTRUCTURE",
            )
        )
        assert signal is not None
        assert signal.signal_type == "PEDESTRIAN_INFRASTRUCTURE"

        geom_type = session.scalar(
            select(func.GeometryType(SafetySignal.geometry)).where(SafetySignal.id == signal.id)
        )
        assert geom_type == "LINESTRING"

        srid = session.scalar(
            select(func.ST_SRID(SafetySignal.geometry)).where(SafetySignal.id == signal.id)
        )
        assert srid == 4326

        wkt = session.scalar(
            select(func.ST_AsText(SafetySignal.geometry)).where(SafetySignal.id == signal.id)
        )
        assert wkt == "LINESTRING(72.83 19.02,72.831 19.021,72.832 19.022)"


def test_osm_closed_relevant_way_to_polygon_persisted(clean_osm_signals):
    # Amenity closed way -> POLYGON
    amenity_way_id = f"{clean_osm_signals}-poly-amenity"
    leisure_way_id = f"{clean_osm_signals}-poly-leisure"
    tourism_way_id = f"{clean_osm_signals}-poly-tourism"
    road_closed_way_id = f"{clean_osm_signals}-loop-road"

    payload = {
        "elements": [
            {"type": "node", "id": 9101, "lon": 72.8300, "lat": 19.0200},
            {"type": "node", "id": 9102, "lon": 72.8310, "lat": 19.0200},
            {"type": "node", "id": 9103, "lon": 72.8310, "lat": 19.0210},
            {"type": "node", "id": 9104, "lon": 72.8300, "lat": 19.0200},
            {
                "type": "way",
                "id": amenity_way_id,
                "nodes": [9101, 9102, 9103, 9101],
                "tags": {"amenity": "cafe"},
            },
            {
                "type": "way",
                "id": leisure_way_id,
                "nodes": [9101, 9102, 9103, 9101],
                "tags": {"leisure": "park"},
            },
            {
                "type": "way",
                "id": tourism_way_id,
                "nodes": [9101, 9102, 9103, 9101],
                "tags": {"tourism": "museum"},
            },
            {
                # Closed loop highway (e.g. roundabout) without amenity/leisure/tourism -> LINESTRING
                "type": "way",
                "id": road_closed_way_id,
                "nodes": [9101, 9102, 9103, 9101],
                "tags": {"highway": "residential"},
            },
        ]
    }
    with SessionLocal() as session:
        stats = import_osm(session, payload)
        assert stats["inserted"] == 4

        for wid in (amenity_way_id, leisure_way_id, tourism_way_id):
            sig = session.scalar(
                select(SafetySignal).where(SafetySignal.source_reference == str(wid))
            )
            assert sig is not None
            gtype = session.scalar(
                select(func.GeometryType(SafetySignal.geometry)).where(SafetySignal.id == sig.id)
            )
            assert gtype == "POLYGON"
            srid = session.scalar(
                select(func.ST_SRID(SafetySignal.geometry)).where(SafetySignal.id == sig.id)
            )
            assert srid == 4326
            wkt = session.scalar(
                select(func.ST_AsText(SafetySignal.geometry)).where(SafetySignal.id == sig.id)
            )
            assert wkt == "POLYGON((72.83 19.02,72.831 19.02,72.831 19.021,72.83 19.02))"

        # Road loop is LINESTRING
        road_sig = session.scalar(
            select(SafetySignal).where(SafetySignal.source_reference == str(road_closed_way_id))
        )
        assert road_sig is not None
        road_gtype = session.scalar(
            select(func.GeometryType(SafetySignal.geometry)).where(SafetySignal.id == road_sig.id)
        )
        assert road_gtype == "LINESTRING"


def test_malformed_way_handling():
    nodes = {1: (72.83, 19.02)}
    # Fewer than 2 nodes
    with pytest.raises(ValueError, match="invalid OSM way"):
        _geometry({"type": "way", "nodes": [1]}, nodes)

    # Empty nodes list
    with pytest.raises(ValueError, match="invalid OSM way"):
        _geometry({"type": "way", "nodes": []}, nodes)

    # Non-list nodes
    with pytest.raises(ValueError, match="invalid OSM way"):
        _geometry({"type": "way", "nodes": "not-a-list"}, nodes)

    # None nodes
    with pytest.raises(ValueError, match="invalid OSM way"):
        _geometry({"type": "way", "nodes": None}, nodes)


def test_missing_node_reference_handling():
    nodes = {1: (72.83, 19.02)}
    # References node 2 which is missing from nodes dictionary
    with pytest.raises(ValueError, match="missing OSM way node"):
        _geometry({"type": "way", "nodes": [1, 2]}, nodes)


def test_invalid_longitude_handling():
    # Longitude > 180
    with pytest.raises(ValueError, match="invalid OSM node coordinate"):
        _geometry({"type": "node", "lon": 181.0, "lat": 19.0}, {})

    # Longitude < -180
    with pytest.raises(ValueError, match="invalid OSM node coordinate"):
        _geometry({"type": "node", "lon": -181.0, "lat": 19.0}, {})

    # Non-numeric longitude
    with pytest.raises(ValueError, match="invalid OSM node coordinate"):
        _geometry({"type": "node", "lon": "invalid", "lat": 19.0}, {})

    # NaN longitude
    with pytest.raises(ValueError, match="invalid OSM node coordinate"):
        _geometry({"type": "node", "lon": float("nan"), "lat": 19.0}, {})

    # Way with invalid longitude
    nodes = {1: (72.83, 19.02), 2: (195.0, 19.02)}
    with pytest.raises(ValueError, match="invalid OSM way coordinate"):
        _geometry({"type": "way", "nodes": [1, 2]}, nodes)


def test_invalid_latitude_handling():
    # Latitude > 90
    with pytest.raises(ValueError, match="invalid OSM node coordinate"):
        _geometry({"type": "node", "lon": 72.8, "lat": 91.0}, {})

    # Latitude < -90
    with pytest.raises(ValueError, match="invalid OSM node coordinate"):
        _geometry({"type": "node", "lon": 72.8, "lat": -91.0}, {})

    # Latitude None
    with pytest.raises(ValueError, match="invalid OSM node coordinate"):
        _geometry({"type": "node", "lon": 72.8, "lat": None}, {})

    # Latitude boolean
    with pytest.raises(ValueError, match="invalid OSM node coordinate"):
        _geometry({"type": "node", "lon": 72.8, "lat": True}, {})

    # Way with invalid latitude
    nodes = {1: (72.83, 19.02), 2: (72.83, -95.0)}
    with pytest.raises(ValueError, match="invalid OSM way coordinate"):
        _geometry({"type": "way", "nodes": [1, 2]}, nodes)


def test_idempotent_duplicate_element_reimport(clean_osm_signals):
    element_id = f"{clean_osm_signals}-idempotent-node"
    payload = {
        "elements": [
            {
                "type": "node",
                "id": element_id,
                "lon": 72.8350,
                "lat": 19.0250,
                "tags": {"amenity": "cafe"},
            }
        ]
    }
    with SessionLocal() as session:
        # First import
        stats1 = import_osm(session, payload)
        assert stats1["inserted"] == 1
        assert stats1["updated"] == 0

        signal1 = session.scalar(
            select(SafetySignal).where(SafetySignal.source_reference == str(element_id))
        )
        assert signal1 is not None
        initial_id = signal1.id
        initial_source_identity = signal1.source_identity
        initial_provenance = dict(signal1.provenance)
        initial_wkt = session.scalar(
            select(func.ST_AsText(SafetySignal.geometry)).where(SafetySignal.id == initial_id)
        )

        # Re-import identical element
        stats2 = import_osm(session, payload)
        assert stats2["inserted"] == 0
        assert stats2["updated"] == 1
        assert stats2["accepted"] == 1

        # Verify no duplicate rows
        count = session.scalar(
            select(func.count())
            .select_from(SafetySignal)
            .where(SafetySignal.source_reference == str(element_id))
        )
        assert count == 1

        signal2 = session.scalar(
            select(SafetySignal).where(SafetySignal.source_reference == str(element_id))
        )
        assert signal2.id == initial_id
        assert signal2.source_identity == initial_source_identity
        assert signal2.provenance == initial_provenance
        reimported_wkt = session.scalar(
            select(func.ST_AsText(SafetySignal.geometry)).where(SafetySignal.id == initial_id)
        )
        assert reimported_wkt == initial_wkt


def test_changed_osm_feature_refresh(clean_osm_signals):
    element_id = f"{clean_osm_signals}-refresh-node"
    initial_payload = {
        "elements": [
            {
                "type": "node",
                "id": element_id,
                "lon": 72.8350,
                "lat": 19.0250,
                "tags": {"amenity": "restaurant"},
            }
        ]
    }
    with SessionLocal() as session:
        # Initial import
        stats1 = import_osm(session, initial_payload)
        assert stats1["inserted"] == 1

        initial_signal = session.scalar(
            select(SafetySignal).where(SafetySignal.source_reference == str(element_id))
        )
        initial_id = initial_signal.id
        initial_identity = initial_signal.source_identity

        # Modified geometry payload
        updated_payload = {
            "elements": [
                {
                    "type": "node",
                    "id": element_id,
                    "lon": 72.8400,
                    "lat": 19.0300,
                    "tags": {"amenity": "restaurant"},
                }
            ]
        }
        stats2 = import_osm(session, updated_payload)
        assert stats2["inserted"] == 0
        assert stats2["updated"] == 1

        # Total rows remain 1
        count = session.scalar(
            select(func.count())
            .select_from(SafetySignal)
            .where(SafetySignal.source_reference == str(element_id))
        )
        assert count == 1

        refreshed_signal = session.scalar(
            select(SafetySignal).where(SafetySignal.source_reference == str(element_id))
        )
        assert refreshed_signal.id == initial_id
        assert refreshed_signal.source_identity == initial_identity

        # PostGIS geometry is updated to new coordinates
        updated_wkt = session.scalar(
            select(func.ST_AsText(SafetySignal.geometry)).where(SafetySignal.id == initial_id)
        )
        assert updated_wkt == "POINT(72.84 19.03)"


def test_deterministic_source_identity():
    # Source identity must be stable and deterministic
    node_element = {"type": "node", "id": 12345, "tags": {"highway": "street_lamp"}}
    signals = normalize(node_element)
    assert len(signals) == 2
    for signal_type, value in signals:
        expected_identity = hashlib.sha256(
            f"node:12345:{signal_type}:{value}".encode()
        ).hexdigest()
        computed_1 = hashlib.sha256(
            f"{node_element.get('type')}:{node_element['id']}:{signal_type}:{value}".encode()
        ).hexdigest()
        computed_2 = hashlib.sha256(
            f"{node_element.get('type')}:{node_element['id']}:{signal_type}:{value}".encode()
        ).hexdigest()

        assert computed_1 == expected_identity
        assert computed_2 == expected_identity


def test_provenance_preservation(clean_osm_signals):
    element_id = f"{clean_osm_signals}-prov-node"
    payload = {
        "elements": [
            {
                "type": "node",
                "id": element_id,
                "lon": 72.8360,
                "lat": 19.0260,
                "tags": {"amenity": "pharmacy"},
            }
        ]
    }
    with SessionLocal() as session:
        import_osm(session, payload)
        signal = session.scalar(
            select(SafetySignal).where(SafetySignal.source_reference == str(element_id))
        )
        assert signal.provenance == {"source": "OSM", "element_id": element_id}

        # Refresh
        import_osm(session, payload)
        refreshed = session.scalar(
            select(SafetySignal).where(SafetySignal.source_reference == str(element_id))
        )
        assert refreshed.provenance == {"source": "OSM", "element_id": element_id}


def test_srid_4326_enforcement_and_persistence(clean_osm_signals):
    element_id = f"{clean_osm_signals}-srid-test"
    with SessionLocal() as session:
        # Standard insert through import_osm ensures SRID 4326
        payload = {
            "elements": [
                {
                    "type": "node",
                    "id": element_id,
                    "lon": 72.8373,
                    "lat": 19.0269,
                    "tags": {"amenity": "bank"},
                }
            ]
        }
        import_osm(session, payload)
        sig = session.scalar(
            select(SafetySignal).where(SafetySignal.source_reference == str(element_id))
        )
        srid = session.scalar(
            select(func.ST_SRID(SafetySignal.geometry)).where(SafetySignal.id == sig.id)
        )
        assert srid == 4326

        # Attempting to insert a geometry with SRID 3857 into safety_signals column must be rejected by PostGIS
        with pytest.raises(SQLAlchemyError):
            session.execute(
                text(
                    "INSERT INTO safety_signals (id, signal_type, normalized_value, source_type, source_reference, source_identity, geometry, observed_at, confidence, verification_status, privacy_class, provenance) "
                    "VALUES (:id, 'TEST', '{\"value\": 1}', 'OSM', 'test', :ident, ST_SetSRID(ST_MakePoint(72.8, 19.0), 3857), :now, 'medium', 'mapped', 'public', '{}')"
                ),
                {
                    "id": uuid.uuid4(),
                    "ident": f"srid-mismatch-{uuid.uuid4()}",
                    "now": datetime.now(UTC),
                },
            )
            session.commit()
