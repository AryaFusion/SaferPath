from sqlalchemy.types import UserDefinedType


class Geometry(UserDefinedType):
    """Minimal PostGIS type declaration; geometry serialization stays at the routing boundary."""

    cache_ok = True

    def __init__(self, geometry_type: str, srid: int = 4326) -> None:
        self.geometry_type = geometry_type
        self.srid = srid

    def get_col_spec(self, **kw: object) -> str:
        return f"geometry({self.geometry_type},{self.srid})"
