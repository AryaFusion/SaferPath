"""Small in-process operator metrics with a deliberately bounded label vocabulary.

Export is intentionally not an HTTP endpoint; deployments wire this collector to their
private metrics sink.  Callers can only submit declared labels and bounded values.
"""
from collections import Counter

HTTP_LABELS = frozenset({"method", "route", "status_class"})
MAX_LABEL_VALUE_LENGTH = 64


class SafeMetrics:
    def __init__(self) -> None:
        self.counts: Counter[tuple[str, tuple[tuple[str, str], ...]]] = Counter()

    def increment(self, name: str, labels: dict[str, str]) -> None:
        if set(labels) - HTTP_LABELS or any(
            len(value) > MAX_LABEL_VALUE_LENGTH for value in labels.values()
        ):
            return
        self.counts[(name, tuple(sorted(labels.items())))] += 1


metrics = SafeMetrics()
