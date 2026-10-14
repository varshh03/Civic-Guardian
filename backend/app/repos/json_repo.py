import json, threading, uuid, os, shutil
from datetime import datetime, timezone
from pathlib import Path
from typing import TypeVar, Generic, Type, Callable
from pydantic import BaseModel

T = TypeVar('T', bound=BaseModel)

class JsonCollection(Generic[T]):
    def __init__(self, path: Path, model: Type[T]):
        self._path = path
        self._model = model
        self._lock = threading.Lock()
        if not path.exists():
            self._write_raw([])
    
    def _read_raw(self) -> list[dict]:
        with open(self._path, 'r', encoding='utf-8') as f:
            return json.load(f)
    
    def _write_raw(self, data: list[dict]):
        tmp = self._path.with_suffix('.tmp')
        with open(tmp, 'w', encoding='utf-8') as f:
            json.dump(data, f, default=str, ensure_ascii=False, indent=2)
        shutil.move(str(tmp), str(self._path))
    
    def all(self) -> list[T]:
        with self._lock:
            return [self._model.model_validate(d) for d in self._read_raw()]
    
    def get(self, id: str) -> T | None:
        with self._lock:
            for d in self._read_raw():
                if d.get('id') == id:
                    return self._model.model_validate(d)
        return None
    
    def create(self, item: T) -> T:
        with self._lock:
            data = self._read_raw()
            data.append(item.model_dump())
            self._write_raw(data)
        return item
    
    def update(self, id: str, item: T) -> T | None:
        with self._lock:
            data = self._read_raw()
            for i, d in enumerate(data):
                if d.get('id') == id:
                    data[i] = item.model_dump()
                    self._write_raw(data)
                    return item
        return None
    
    def mutate(self, id: str, fn: Callable[[T], T]) -> T | None:
        with self._lock:
            data = self._read_raw()
            for i, d in enumerate(data):
                if d.get('id') == id:
                    item = fn(self._model.model_validate(d))
                    data[i] = item.model_dump()
                    self._write_raw(data)
                    return item
        return None
    
    def delete(self, id: str) -> bool:
        with self._lock:
            data = self._read_raw()
            new_data = [d for d in data if d.get('id') != id]
            if len(new_data) < len(data):
                self._write_raw(new_data)
                return True
        return False
    
    def filter(self, fn: Callable[[T], bool]) -> list[T]:
        return [item for item in self.all() if fn(item)]
    
    def find_one(self, fn: Callable[[T], bool]) -> T | None:
        for item in self.all():
            if fn(item):
                return item
        return None

from app.models import User, Complaint, Comment, Notification, Activity, Department
from app.config import Settings

def get_data_dir() -> Path:
    from app.config import get_settings
    return Path(get_settings().data_dir)

class UserRepo:
    def __init__(self, data_dir: Path):
        self._col = JsonCollection(data_dir / 'users.json', User)
    
    def create(self, user: User) -> User: return self._col.create(user)
    def get(self, id: str) -> User | None: return self._col.get(id)
    def get_by_email(self, email: str) -> User | None: return self._col.find_one(lambda u: u.email == email)
    def all(self) -> list[User]: return self._col.all()
    def update(self, id: str, user: User) -> User | None: return self._col.update(id, user)
    def mutate(self, id: str, fn) -> User | None: return self._col.mutate(id, fn)

class ComplaintRepo:
    def __init__(self, data_dir: Path):
        self._col = JsonCollection(data_dir / 'complaints.json', Complaint)
    
    def create(self, c: Complaint) -> Complaint: return self._col.create(c)
    def get(self, id: str) -> Complaint | None: return self._col.get(id)
    def all(self) -> list[Complaint]: return self._col.all()
    def update(self, id: str, c: Complaint) -> Complaint | None: return self._col.update(id, c)
    def mutate(self, id: str, fn) -> Complaint | None: return self._col.mutate(id, fn)
    def filter(self, fn) -> list[Complaint]: return self._col.filter(fn)
    def next_id(self, year: int) -> str:
        prefix = f"KRR-{year}-"
        existing = [c.id for c in self.all() if c.id.startswith(prefix)]
        max_num = max((int(c.split('-')[-1]) for c in existing), default=0)
        return f"{prefix}{(max_num+1):05d}"

class CommentRepo:
    def __init__(self, data_dir: Path):
        self._col = JsonCollection(data_dir / 'comments.json', Comment)
    
    def create(self, c: Comment) -> Comment: return self._col.create(c)
    def get(self, id: str) -> Comment | None: return self._col.get(id)
    def all(self) -> list[Comment]: return self._col.all()
    def update(self, id: str, c: Comment) -> Comment | None: return self._col.update(id, c)
    def mutate(self, id: str, fn) -> Comment | None: return self._col.mutate(id, fn)
    def for_complaint(self, complaint_id: str) -> list[Comment]: return self._col.filter(lambda c: c.complaint_id == complaint_id)
    def delete(self, id: str) -> bool: return self._col.delete(id)

class NotificationRepo:
    def __init__(self, data_dir: Path):
        self._col = JsonCollection(data_dir / 'notifications.json', Notification)
    
    def create(self, n: Notification) -> Notification: return self._col.create(n)
    def for_user(self, user_id: str) -> list[Notification]: return self._col.filter(lambda n: n.user_id == user_id)
    def mutate(self, id: str, fn) -> Notification | None: return self._col.mutate(id, fn)
    def all(self) -> list[Notification]: return self._col.all()

class ActivityRepo:
    def __init__(self, data_dir: Path):
        self._col = JsonCollection(data_dir / 'activity.json', Activity)
    
    def create(self, a: Activity) -> Activity: return self._col.create(a)
    def for_user(self, user_id: str) -> list[Activity]: return self._col.filter(lambda a: a.user_id == user_id)
    def recent(self, limit: int = 50) -> list[Activity]:
        acts = self._col.all()
        acts.sort(key=lambda a: a.created_at, reverse=True)
        return acts[:limit]

class DepartmentRepo:
    def __init__(self, data_dir: Path):
        self._col = JsonCollection(data_dir / 'departments.json', Department)
    
    def all(self) -> list[Department]: return self._col.all()
    def get(self, id: str) -> Department | None: return self._col.get(id)
    def create(self, d: Department) -> Department: return self._col.create(d)
    def update(self, id: str, d: Department) -> Department | None: return self._col.update(id, d)
    def delete(self, id: str) -> bool: return self._col.delete(id)
    def for_issue(self, issue_type: str) -> Department | None:
        return self._col.find_one(lambda d: issue_type in d.issue_types)
