from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from backend.database import get_db
from backend.models import Event
from backend.schemas import EventCreate, EventResponse, EventUpdate
from backend.services.ai_service import ai_service
from backend.models import BudgetItem, Task, Idea

router = APIRouter(prefix="/events", tags=["Events"])

@router.post("", response_model=EventResponse, status_code=status.HTTP_201_CREATED)
def create_event(payload: EventCreate, db: Session = Depends(get_db)):
    event = Event(
        type=payload.type,
        title=payload.title,
        date=payload.date,
        city=payload.city,
        guest_count=payload.guest_count,
        total_budget=payload.total_budget,
        theme=payload.theme,
        culture=payload.culture,
        priorities=payload.priorities
    )
    db.add(event)
    db.commit()
    db.refresh(event)

    # Automatically generate initial budget, timeline, and ideas for immediate richness
    try:
        budget_data = ai_service.generate_budget(event)
        for item in budget_data["items"]:
            db_item = BudgetItem(
                event_id=event.id,
                category=item["category"],
                planned=item["planned"],
                actual=0.0,
                notes=item.get("notes")
            )
            db.add(db_item)

        tasks_data = ai_service.generate_timeline(event)
        for t in tasks_data:
            db_task = Task(
                event_id=event.id,
                title=t["title"],
                due_date=t["due_date"],
                category=t["category"],
                status=t.get("status", "pending"),
                priority=t.get("priority", "medium")
            )
            db.add(db_task)

        ideas_data = ai_service.generate_ideas(event, remaining_budget=event.total_budget)
        for idea in ideas_data:
            db_idea = Idea(
                event_id=event.id,
                kind=idea["kind"],
                title=idea["title"],
                description=idea["description"],
                est_cost=idea["est_cost"],
                effort=idea["effort"],
                saved=False
            )
            db.add(db_idea)

        db.commit()
    except Exception as e:
        db.rollback()
        # Even if generation fails, the event is saved
        pass

    db.refresh(event)
    return event

@router.get("", response_model=List[EventResponse])
def list_events(db: Session = Depends(get_db)):
    return db.query(Event).order_by(Event.id.desc()).all()

@router.get("/{id}", response_model=EventResponse)
def get_event(id: int, db: Session = Depends(get_db)):
    event = db.query(Event).filter(Event.id == id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event

@router.patch("/{id}", response_model=EventResponse)
def update_event(id: int, payload: EventUpdate, db: Session = Depends(get_db)):
    event = db.query(Event).filter(Event.id == id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    update_data = payload.dict(exclude_unset=True)
    for field, val in update_data.items():
        setattr(event, field, val)
    
    db.commit()
    db.refresh(event)
    return event
