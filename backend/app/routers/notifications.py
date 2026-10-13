from fastapi import APIRouter, Depends, HTTPException
from pathlib import Path
from app.config import get_settings
from app.repos.json_repo import NotificationRepo
from app.security import get_current_user

router = APIRouter()

def get_notification_repo() -> NotificationRepo:
    return NotificationRepo(Path(get_settings().data_dir))

@router.get("")
async def get_notifications(current: dict = Depends(get_current_user)):
    repo = get_notification_repo()
    notifications = repo.for_user(current["sub"])
    notifications.sort(key=lambda n: n.created_at, reverse=True)
    unread_count = sum(1 for n in notifications if not n.read)
    return {
        "notifications": [n.model_dump() for n in notifications[:50]],
        "unread_count": unread_count
    }

@router.post("/{notification_id}/read")
async def mark_read(notification_id: str, current: dict = Depends(get_current_user)):
    repo = get_notification_repo()
    n = repo.get(notification_id)
    if not n:
        raise HTTPException(404, "Notification not found")
    if n.user_id != current["sub"]:
        raise HTTPException(403, "Not your notification")
    repo.mutate(notification_id, lambda n: (setattr(n, 'read', True), n)[1])
    return {"message": "Marked as read"}

@router.post("/read-all")
async def mark_all_read(current: dict = Depends(get_current_user)):
    repo = get_notification_repo()
    notifications = repo.for_user(current["sub"])
    for n in notifications:
        if not n.read:
            repo.mutate(n.id, lambda x: (setattr(x, 'read', True), x)[1])
    return {"message": "All marked as read"}
