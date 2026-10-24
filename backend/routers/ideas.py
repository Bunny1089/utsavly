from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from backend.database import get_db
from backend.models import Event, Idea, BudgetItem
from backend.schemas import (
    IdeaResponse,
    IdeaUpdate,
    IdeasGenerateResponse
)
from backend.services.ai_service import ai_service

router = APIRouter(tags=["Ideas"])

@router.get("/events/{id}/ideas", response_model=List[IdeaResponse])
def get_event_ideas(id: int, db: Session = Depends(get_db)):
    return db.query(Idea).filter(Idea.event_id == id).all()

@router.post("/events/{id}/ideas/generate", response_model=IdeasGenerateResponse)
def generate_event_ideas(id: int, db: Session = Depends(get_db)):
    event = db.query(Event).filter(Event.id == id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    budget_items = db.query(BudgetItem).filter(BudgetItem.event_id == id).all()
    actual_spent = sum(i.actual for i in budget_items)
    remaining_budget = max(0.0, event.total_budget - actual_spent)

    ideas_data = ai_service.generate_ideas(event, remaining_budget=remaining_budget)
    
    # Don't wipe saved ideas, just add or refresh unsaved
    saved_ideas = db.query(Idea).filter(Idea.event_id == id, Idea.saved == True).all()
    db.query(Idea).filter(Idea.event_id == id, Idea.saved == False).delete()
    db.commit()

    new_ideas = []
    for idea in ideas_data:
        db_idea = Idea(
            event_id=id,
            kind=idea["kind"],
            title=idea["title"],
            description=idea["description"],
            est_cost=idea["est_cost"],
            effort=idea["effort"],
            saved=False
        )
        db.add(db_idea)
        db.commit()
        db.refresh(db_idea)
        new_ideas.append(db_idea)

    all_ideas = saved_ideas + new_ideas
    return IdeasGenerateResponse(event_id=id, ideas=all_ideas)

@router.patch("/ideas/{id}", response_model=IdeaResponse)
def update_idea(id: int, payload: IdeaUpdate, db: Session = Depends(get_db)):
    idea = db.query(Idea).filter(Idea.id == id).first()
    if not idea:
        raise HTTPException(status_code=404, detail="Idea not found")

    if payload.saved is not None:
        idea.saved = payload.saved

    db.commit()
    db.refresh(idea)
    return idea
