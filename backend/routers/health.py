from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import Event, BudgetItem, Task, Vendor
from backend.schemas import HealthScoreResponse, HealthAlert

router = APIRouter(tags=["Health"])

@router.get("/events/{id}/health", response_model=HealthScoreResponse)
def get_event_health(id: int, db: Session = Depends(get_db)):
    event = db.query(Event).filter(Event.id == id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    budget_items = db.query(BudgetItem).filter(BudgetItem.event_id == id).all()
    tasks = db.query(Task).filter(Task.event_id == id).all()
    vendors = db.query(Vendor).filter(Vendor.event_id == id).all()

    # 1. Timeline & Days Left
    try:
        event_dt = datetime.strptime(event.date, "%Y-%m-%d")
        days_left = (event_dt - datetime.now()).days
    except Exception:
        days_left = 60

    # 2. Budget Health
    total_budget = event.total_budget
    total_spent = sum(i.actual for i in budget_items)
    spent_pct = (total_spent / total_budget * 100) if total_budget > 0 else 0.0

    contingency = next((i for i in budget_items if "contingency" in i.category.lower()), None)
    contingency_intact = contingency is not None and contingency.actual == 0.0

    # 3. Tasks Health
    completed_tasks = [t for t in tasks if t.status == "completed"]
    task_completion_pct = (len(completed_tasks) / len(tasks) * 100) if tasks else 100.0

    overdue_tasks = 0
    now_str = datetime.now().strftime("%Y-%m-%d")
    for t in tasks:
        if t.status != "completed" and t.due_date < now_str:
            overdue_tasks += 1

    # 4. Vendor Health
    booked_vendors = [v for v in vendors if v.status == "booked"]
    
    # Deterministic Scoring (100 Base)
    score = 100
    alerts = []

    # Budget penalties / rewards
    if total_spent > total_budget:
        over_amt = total_spent - total_budget
        score -= min(40, int((over_amt / total_budget) * 100))
        alerts.append(HealthAlert(
            type="danger",
            message=f"Budget overspend detected: ₹{over_amt:,.0f} above ceiling."
        ))
    elif contingency_intact:
        alerts.append(HealthAlert(
            type="info",
            message=f"Contingency cushion intact (₹{contingency.planned:,.0f} safety reserve available)."
        ))

    # Overdue task penalties
    if overdue_tasks > 0:
        penalty = min(25, overdue_tasks * 5)
        score -= penalty
        alerts.append(HealthAlert(
            type="warning",
            message=f"{overdue_tasks} action item(s) are overdue and need rescheduling."
        ))

    # Timeline proximity alerts
    if days_left <= 14 and len(booked_vendors) < 3:
        score -= 15
        alerts.append(HealthAlert(
            type="warning",
            message="Event is less than 2 weeks away with key vendor confirmations still pending."
        ))
    elif days_left > 0 and task_completion_pct > 60:
        alerts.append(HealthAlert(
            type="success",
            message=f"Planning on track: {task_completion_pct:.0f}% of milestone tasks completed."
        ))

    score = max(10, min(100, score))

    rating = "Excellent" if score >= 85 else ("Good" if score >= 70 else ("Needs Attention" if score >= 50 else "Critical"))

    return HealthScoreResponse(
        score=score,
        rating=rating,
        days_left=max(0, days_left),
        alerts=alerts,
        metrics={
            "budget_spent_pct": round(spent_pct, 1),
            "tasks_completed_pct": round(task_completion_pct, 1),
            "overdue_tasks_count": overdue_tasks,
            "booked_vendors_count": len(booked_vendors),
            "total_vendors_count": len(vendors)
        }
    )
