from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from backend.database import get_db
from backend.models import Event, BudgetItem
from backend.schemas import (
    BudgetItemResponse,
    BudgetItemUpdate,
    BudgetGenerateResponse,
    BudgetOverviewResponse
)
from backend.services.ai_service import ai_service

router = APIRouter(tags=["Budget"])

@router.post("/events/{id}/budget/generate", response_model=BudgetGenerateResponse)
def generate_budget_for_event(id: int, db: Session = Depends(get_db)):
    event = db.query(Event).filter(Event.id == id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    # Remove existing items to regenerate fresh
    db.query(BudgetItem).filter(BudgetItem.event_id == id).delete()
    db.commit()

    generated = ai_service.generate_budget(event)
    items_to_return = []
    for item in generated["items"]:
        db_item = BudgetItem(
            event_id=event.id,
            category=item["category"],
            planned=item["planned"],
            actual=0.0,
            notes=item.get("notes")
        )
        db.add(db_item)
        db.commit()
        db.refresh(db_item)
        items_to_return.append(
            BudgetItemResponse(
                id=db_item.id,
                event_id=db_item.event_id,
                category=db_item.category,
                planned=db_item.planned,
                actual=db_item.actual,
                notes=db_item.notes,
                percentage=item["percentage"]
            )
        )

    return BudgetGenerateResponse(
        event_id=event.id,
        total_budget=generated["total_budget"],
        allocated_total=generated["allocated_total"],
        contingency_amount=generated["contingency_amount"],
        contingency_percentage=generated["contingency_percentage"],
        items=items_to_return
    )

@router.get("/events/{id}/budget", response_model=BudgetOverviewResponse)
def get_event_budget(id: int, db: Session = Depends(get_db)):
    event = db.query(Event).filter(Event.id == id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    items = db.query(BudgetItem).filter(BudgetItem.event_id == id).all()
    total_planned = sum(item.planned for item in items)
    total_actual = sum(item.actual for item in items)
    
    contingency_item = next((i for i in items if "contingency" in i.category.lower()), None)
    contingency_amt = contingency_item.planned if contingency_item else 0.0
    contingency_pct = (contingency_amt / event.total_budget * 100) if event.total_budget > 0 else 0.0

    resp_items = []
    for i in items:
        pct = round((i.planned / event.total_budget * 100), 1) if event.total_budget > 0 else 0.0
        resp_items.append(
            BudgetItemResponse(
                id=i.id,
                event_id=i.event_id,
                category=i.category,
                planned=i.planned,
                actual=i.actual,
                notes=i.notes,
                percentage=pct
            )
        )

    return BudgetOverviewResponse(
        event_id=event.id,
        total_budget=event.total_budget,
        planned_total=total_planned,
        actual_total=total_actual,
        contingency_amount=contingency_amt,
        contingency_percentage=round(contingency_pct, 1),
        is_overspend=total_actual > event.total_budget,
        items=resp_items
    )

@router.patch("/budget/{item_id}", response_model=BudgetItemResponse)
def update_budget_item(item_id: int, payload: BudgetItemUpdate, db: Session = Depends(get_db)):
    item = db.query(BudgetItem).filter(BudgetItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Budget item not found")

    if payload.planned is not None:
        item.planned = payload.planned
    if payload.actual is not None:
        item.actual = payload.actual
    if payload.notes is not None:
        item.notes = payload.notes

    db.commit()
    db.refresh(item)
    return item
