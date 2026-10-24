from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from backend.database import get_db
from backend.models import Event, Task
from backend.schemas import (
    TaskResponse,
    TaskCreate,
    TaskUpdate,
    TimelineGenerateResponse,
    TimelineRescheduleRequest
)
from backend.services.ai_service import ai_service

router = APIRouter(tags=["Timeline"])

@router.post("/events/{id}/timeline/generate", response_model=TimelineGenerateResponse)
def generate_timeline(id: int, db: Session = Depends(get_db)):
    event = db.query(Event).filter(Event.id == id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    db.query(Task).filter(Task.event_id == id).delete()
    db.commit()

    tasks_data = ai_service.generate_timeline(event)
    created_tasks = []
    for t in tasks_data:
        db_task = Task(
            event_id=event.id,
            title=t["title"],
            due_date=t["due_date"],
            category=t["category"],
            status="pending",
            priority=t.get("priority", "medium")
        )
        db.add(db_task)
        db.commit()
        db.refresh(db_task)
        created_tasks.append(db_task)

    return TimelineGenerateResponse(
        event_id=event.id,
        tasks=created_tasks
    )

@router.get("/events/{id}/tasks", response_model=List[TaskResponse])
def get_event_tasks(id: int, db: Session = Depends(get_db)):
    return db.query(Task).filter(Task.event_id == id).order_by(Task.due_date.asc()).all()

@router.post("/events/{id}/tasks", response_model=TaskResponse)
def create_task(id: int, payload: TaskCreate, db: Session = Depends(get_db)):
    event = db.query(Event).filter(Event.id == id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    db_task = Task(
        event_id=id,
        title=payload.title,
        due_date=payload.due_date,
        category=payload.category,
        status=payload.status,
        priority=payload.priority
    )
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

@router.patch("/tasks/{id}", response_model=TaskResponse)
def update_task(id: int, payload: TaskUpdate, db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    data = payload.dict(exclude_unset=True)
    for k, v in data.items():
        setattr(task, k, v)

    db.commit()
    db.refresh(task)
    return task

@router.post("/events/{id}/timeline/reschedule", response_model=List[TaskResponse])
def reschedule_timeline(id: int, payload: TimelineRescheduleRequest, db: Session = Depends(get_db)):
    event = db.query(Event).filter(Event.id == id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    old_date = datetime.strptime(event.date, "%Y-%m-%d")
    new_date = datetime.strptime(payload.new_date, "%Y-%m-%d")
    delta_days = (new_date - old_date).days

    event.date = payload.new_date
    tasks = db.query(Task).filter(Task.event_id == id).all()

    for task in tasks:
        try:
            task_dt = datetime.strptime(task.due_date, "%Y-%m-%d")
            rescheduled_dt = task_dt + timedelta(days=delta_days)
            task.due_date = rescheduled_dt.strftime("%Y-%m-%d")
        except Exception:
            pass

    db.commit()
    return tasks
