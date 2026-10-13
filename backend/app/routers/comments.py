from fastapi import APIRouter, Depends, HTTPException, Query, Body
from datetime import datetime, timezone
import uuid
from pydantic import BaseModel
from typing import Optional

from app.models import Comment
from app.repos.json_repo import CommentRepo, ComplaintRepo, UserRepo
from app.security import get_current_user
from app.config import get_settings
from pathlib import Path

router = APIRouter()

class CommentCreate(BaseModel):
    text: str
    parent_id: Optional[str] = None

class CommentUpdate(BaseModel):
    text: str

def get_repos():
    data_dir = Path(get_settings().data_dir)
    return {
        "comments": CommentRepo(data_dir),
        "complaints": ComplaintRepo(data_dir),
        "users": UserRepo(data_dir)
    }

def comment_to_response(comment: Comment, repos, current_user_id: Optional[str] = None):
    d = comment.model_dump()
    d["helpful_count"] = len(comment.helpful)
    d["is_helpful"] = current_user_id in comment.helpful if current_user_id else False
    author = repos["users"].get(comment.user_id) if repos else None
    if author:
        d["author_name"] = author.name
        d["author_role"] = author.role
    else:
        d["author_name"] = "Citizen"
        d["author_role"] = "citizen"
    return d

@router.get("/complaints/{complaint_id}/comments")
async def get_comments(complaint_id: str):
    repos = get_repos()
    comments = repos["comments"].filter(lambda c: c.complaint_id == complaint_id)
    comments.sort(key=lambda c: c.created_at)
    return [comment_to_response(c, repos, None) for c in comments]

@router.post("/complaints/{complaint_id}/comments")
async def create_comment(
    complaint_id: str,
    payload: CommentCreate,
    current: dict = Depends(get_current_user)
):
    repos = get_repos()
    
    if not repos["complaints"].get(complaint_id):
        raise HTTPException(404, "Complaint not found")
        
    if not payload.text or not payload.text.strip():
        raise HTTPException(400, "Comment text cannot be empty")
        
    is_official = current.get("role") in ["officer", "admin"]
    
    comment = Comment(
        id=str(uuid.uuid4()),
        complaint_id=complaint_id,
        user_id=current["sub"],
        parent_id=payload.parent_id,
        text=payload.text.strip(),
        is_official=is_official,
        helpful=[],
        created_at=datetime.now(timezone.utc)
    )
    
    repos["comments"].create(comment)
    
    return comment_to_response(comment, repos, current["sub"])

@router.patch("/comments/{comment_id}")
async def update_comment(
    comment_id: str,
    payload: CommentUpdate,
    current: dict = Depends(get_current_user)
):
    repos = get_repos()
    
    if not payload.text or not payload.text.strip():
        raise HTTPException(400, "Comment text cannot be empty")
        
    def mutate(c):
        if c.user_id != current["sub"]:
            raise HTTPException(403, "Not your comment")
        c.text = payload.text.strip()
        c.edited_at = datetime.now(timezone.utc)
        return c
        
    comment = repos["comments"].mutate(comment_id, mutate)
    if not comment:
        raise HTTPException(404, "Comment not found")
        
    return comment_to_response(comment, repos, current["sub"])

@router.delete("/comments/{comment_id}")
async def delete_comment(comment_id: str, current: dict = Depends(get_current_user)):
    repos = get_repos()
    comment = repos["comments"].get(comment_id)
    
    if not comment:
        raise HTTPException(404, "Comment not found")
        
    if comment.user_id != current["sub"] and current.get("role") != "admin":
        raise HTTPException(403, "Not authorized to delete this comment")
        
    repos["comments"].delete(comment_id)
    return {"message": "Comment deleted"}

@router.post("/comments/{comment_id}/helpful")
async def toggle_helpful(comment_id: str, current: dict = Depends(get_current_user)):
    repos = get_repos()
    user_id = current["sub"]
    
    def mutate(c):
        if user_id in c.helpful:
            c.helpful.remove(user_id)
        else:
            c.helpful.append(user_id)
        return c
        
    comment = repos["comments"].mutate(comment_id, mutate)
    if not comment:
        raise HTTPException(404, "Comment not found")
        
    return {"helpful_count": len(comment.helpful), "is_helpful": user_id in comment.helpful}

@router.post("/comments/{comment_id}/report")
async def report_comment(comment_id: str, current: dict = Depends(get_current_user)):
    repos = get_repos()
    if not repos["comments"].get(comment_id):
        raise HTTPException(404, "Comment not found")
    return {"message": "Comment reported"}
