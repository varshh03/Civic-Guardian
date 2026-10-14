from collections import defaultdict
from datetime import datetime, timezone, timedelta
import threading

class RateLimiter:
    def __init__(self, max_requests: int, window_seconds: int):
        self._max = max_requests
        self._window = window_seconds
        self._store: dict[str, list[datetime]] = defaultdict(list)
        self._lock = threading.Lock()
    
    def is_allowed(self, key: str) -> bool:
        now = datetime.now(timezone.utc)
        cutoff = now - timedelta(seconds=self._window)
        with self._lock:
            self._store[key] = [t for t in self._store[key] if t > cutoff]
            if len(self._store[key]) >= self._max:
                return False
            self._store[key].append(now)
            return True

auth_limiter = RateLimiter(max_requests=500, window_seconds=3600)
report_limiter = RateLimiter(max_requests=100, window_seconds=3600)
