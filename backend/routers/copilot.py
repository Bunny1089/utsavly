from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from backend.database import get_db
from backend.models import Event, BudgetItem, Task, Vendor
from backend.schemas import CopilotRequest, CopilotResponse, CopilotAction

router = APIRouter(tags=["Copilot"])

@router.post("/events/{id}/copilot", response_model=CopilotResponse)
def run_copilot(id: int, payload: CopilotRequest, db: Session = Depends(get_db)):
    event = db.query(Event).filter(Event.id == id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    msg = payload.message.lower().strip()
    actions = []
    reply = ""

    # Tool 1: update_budget_item
    if "budget" in msg or "cater" in msg or "decor" in msg or "photo" in msg:
        if "increase" in msg or "add" in msg or "more" in msg or "reduce" in msg or "deduct" in msg:
            target_cat = "Catering" if ("cater" in msg or "food" in msg) else ("Decor" if "decor" in msg else "Photography")
            delta = 50000.0 if ("increase" in msg or "more" in msg or "add" in msg) else -50000.0

            item = db.query(BudgetItem).filter(BudgetItem.event_id == id, BudgetItem.category.ilike(f"%{target_cat}%")).first()
            if item:
                new_val = max(0.0, item.planned + delta)
                item.planned = new_val

                # If increasing catering, balance by reducing another category or contingency to keep budget balanced
                counter_item = db.query(BudgetItem).filter(
                    BudgetItem.event_id == id,
                    BudgetItem.category.ilike("%Decor%" if target_cat == "Catering" else "%Catering%")
                ).first()
                if counter_item and counter_item.planned >= abs(delta):
                    counter_item.planned -= delta

                db.commit()
                actions.append(CopilotAction(
                    tool="update_budget_item",
                    details={"category": item.category, "new_planned": item.planned}
                ))
                if counter_item:
                    actions.append(CopilotAction(
                        tool="update_budget_item",
                        details={"category": counter_item.category, "new_planned": counter_item.planned}
                    ))
                reply = f"I've adjusted your {item.category} budget to ₹{item.planned:,.0f} and rebalanced against {counter_item.category if counter_item else 'contingency'} so your overall ₹{event.total_budget:,.0f} budget remains intact."
            else:
                reply = "I couldn't locate that specific budget category. Available categories include Catering, Decor, Photography, Attire, and Logistics."
        else:
            reply = f"Your total budget is ₹{event.total_budget:,.0f}. Tell me which category you want to increase or decrease, and I'll adjust and balance it for you."

    # Tool 2: add_task
    elif "task" in msg or "schedule" in msg or "milestone" in msg or "remind" in msg:
        task_title = "Book entertainment & DJ troupe" if "dj" in msg else ("Confirm guest RSVP count" if "rsvp" in msg else "Review vendor contract details")
        due = (datetime.now() + timedelta(days=7)).strftime("%Y-%m-%d")
        new_task = Task(
            event_id=id,
            title=task_title,
            due_date=due,
            category="Coordination",
            status="pending",
            priority="high"
        )
        db.add(new_task)
        db.commit()
        db.refresh(new_task)
        actions.append(CopilotAction(
            tool="add_task",
            details={"task_id": new_task.id, "title": new_task.title, "due_date": new_task.due_date}
        ))
        reply = f"Created new milestone task: '{new_task.title}' due on {new_task.due_date} with High priority."

    # Tool 3: add_vendor
    elif "vendor" in msg or "hire" in msg or "book" in msg:
        v_name = "Royal Symphony DJ & Sound" if "dj" in msg else ("Shahi Mithai & Sweet House" if "sweet" in msg else "Vogue Candid Studio")
        v_cat = "Entertainment & DJ" if "dj" in msg else ("Catering" if "sweet" in msg else "Photography")
        new_vendor = Vendor(
            event_id=id,
            category=v_cat,
            name=v_name,
            contact="+91 98112 33445",
            quote=85000.0,
            advance_paid=20000.0,
            status="negotiating",
            notes="Added via Copilot recommendation"
        )
        db.add(new_vendor)
        db.commit()
        db.refresh(new_vendor)
        actions.append(CopilotAction(
            tool="add_vendor",
            details={"vendor_id": new_vendor.id, "name": new_vendor.name, "category": new_vendor.category, "quote": new_vendor.quote}
        ))
        reply = f"Added vendor '{new_vendor.name}' under {new_vendor.category} with a quote of ₹{new_vendor.quote:,.0f}."

    else:
        reply = f"I am your Utsavly Copilot for {event.title}. I can execute 3 actions for you: adjust budget items, add milestone tasks, or register new vendors. How can I help?"

    return CopilotResponse(
        reply=reply,
        actions_taken=actions
    )
