"""
Seed script to populate Utsavly with 3 rich, realistic Indian demo events:
1. Wedding: Aarav & Meera's Royal Sangeet & Vivah (Jaipur)
2. Birthday: Ananya's Sweet 16 Bollywood Gala (Mumbai)
3. Community: Greenwood Heights Diwali & Annakut Mahotsav (Bengaluru)
"""
from datetime import datetime, timedelta
from backend.database import SessionLocal, Base, engine
from backend.models import Event, BudgetItem, Task, Vendor, Idea
from backend.services.ai_service import ai_service

def seed_database(clear: bool = True):
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    if clear:
        # Clear existing data
        db.query(Idea).delete()
        db.query(Vendor).delete()
        db.query(Task).delete()
        db.query(BudgetItem).delete()
        db.query(Event).delete()
        db.commit()

    now = datetime.now()

    # --- 1. WEDDING ---
    wedding_date = (now + timedelta(days=75)).strftime("%Y-%m-%d")
    wedding = Event(
        type="wedding",
        title="Aarav & Meera's Royal Sangeet & Vivah",
        date=wedding_date,
        city="Jaipur",
        guest_count=350,
        total_budget=2500000.0,
        theme="Royal Rajasthani Heritage",
        culture="North Indian Hindu",
        priorities=["Gourmet Catering", "Cinematic Photography", "Vibrant Decor"]
    )
    db.add(wedding)
    db.commit()
    db.refresh(wedding)

    # Budget
    w_budget = ai_service.generate_budget(wedding)
    for b in w_budget["items"]:
        actual_val = 0.0
        if "catering" in b["category"].lower():
            actual_val = 320000.0
        elif "photography" in b["category"].lower():
            actual_val = 110000.0
        db.add(BudgetItem(
            event_id=wedding.id,
            category=b["category"],
            planned=b["planned"],
            actual=actual_val,
            notes=b.get("notes")
        ))

    # Tasks
    w_tasks = ai_service.generate_timeline(wedding)
    for idx, t in enumerate(w_tasks):
        status = "completed" if idx < 3 else ("in_progress" if idx < 5 else "pending")
        db.add(Task(
            event_id=wedding.id,
            title=t["title"],
            due_date=t["due_date"],
            category=t["category"],
            status=status,
            priority=t["priority"]
        ))

    # Vendors
    db.add(Vendor(
        event_id=wedding.id,
        category="Venue & Heritage Fort",
        name="Nahargarh Palace Haveli",
        contact="+91 98290 11223",
        quote=750000.0,
        advance_paid=250000.0,
        status="booked",
        notes="Mandap courtyard + grand ballroom included"
    ))
    db.add(Vendor(
        event_id=wedding.id,
        category="Photography & Films",
        name="Dharohar Wedding Films",
        contact="+91 97841 44556",
        quote=220000.0,
        advance_paid=60000.0,
        status="booked",
        notes="Lead cinematographer + 2 candid photographers"
    ))
    db.add(Vendor(
        event_id=wedding.id,
        category="Catering & Banquet",
        name="Shahi Dawat Royal Caterers",
        contact="+91 98280 88990",
        quote=850000.0,
        advance_paid=0.0,
        status="negotiating",
        notes="Tasting session scheduled for this weekend"
    ))

    # Ideas
    w_ideas = ai_service.generate_ideas(wedding, remaining_budget=2000000.0)
    for i in w_ideas:
        db.add(Idea(
            event_id=wedding.id,
            kind=i["kind"],
            title=i["title"],
            description=i["description"],
            est_cost=i["est_cost"],
            effort=i["effort"],
            saved=False
        ))

    # --- 2. BIRTHDAY ---
    bday_date = (now + timedelta(days=22)).strftime("%Y-%m-%d")
    birthday = Event(
        type="birthday",
        title="Ananya's Sweet 16 Bollywood Gala",
        date=bday_date,
        city="Mumbai",
        guest_count=75,
        total_budget=350000.0,
        theme="Retro Bollywood Sparkle",
        culture="Contemporary Indian",
        priorities=["DJ & Dance Floor", "Themed Dessert Table", "Photo Booth"]
    )
    db.add(birthday)
    db.commit()
    db.refresh(birthday)

    b_budget = ai_service.generate_budget(birthday)
    for b in b_budget["items"]:
        db.add(BudgetItem(
            event_id=birthday.id,
            category=b["category"],
            planned=b["planned"],
            actual=b["planned"] * 0.4 if "food" in b["category"].lower() else 0.0,
            notes=b.get("notes")
        ))

    b_tasks = ai_service.generate_timeline(birthday)
    for idx, t in enumerate(b_tasks):
        status = "completed" if idx < 2 else "pending"
        db.add(Task(
            event_id=birthday.id,
            title=t["title"],
            due_date=t["due_date"],
            category=t["category"],
            status=status,
            priority=t["priority"]
        ))

    db.add(Vendor(
        event_id=birthday.id,
        category="Venue & Rooftop Cafe",
        name="Bayview Sky Lounge Bandra",
        contact="+91 99201 33445",
        quote=120000.0,
        advance_paid=40000.0,
        status="booked",
        notes="Includes sunset terrace access and basic sound"
    ))

    b_ideas = ai_service.generate_ideas(birthday, remaining_budget=300000.0)
    for i in b_ideas:
        db.add(Idea(
            event_id=birthday.id,
            kind=i["kind"],
            title=i["title"],
            description=i["description"],
            est_cost=i["est_cost"],
            effort=i["effort"],
            saved=True if "photo" in i["title"].lower() else False
        ))

    # --- 3. COMMUNITY ---
    comm_date = (now + timedelta(days=40)).strftime("%Y-%m-%d")
    community = Event(
        type="community",
        title="Greenwood Heights Diwali & Annakut Mahotsav",
        date=comm_date,
        city="Bengaluru",
        guest_count=500,
        total_budget=600000.0,
        theme="Deepotsav & Green Lanterns",
        culture="Pan-Indian Community",
        priorities=["Community Maha-Prasad", "Acoustic Stage & Pandal", "Eco-friendly Diyas"]
    )
    db.add(community)
    db.commit()
    db.refresh(community)

    c_budget = ai_service.generate_budget(community)
    for b in c_budget["items"]:
        db.add(BudgetItem(
            event_id=community.id,
            category=b["category"],
            planned=b["planned"],
            actual=0.0,
            notes=b.get("notes")
        ))

    c_tasks = ai_service.generate_timeline(community)
    for idx, t in enumerate(c_tasks):
        db.add(Task(
            event_id=community.id,
            title=t["title"],
            due_date=t["due_date"],
            category=t["category"],
            status="completed" if idx == 0 else "pending",
            priority=t["priority"]
        ))

    db.add(Vendor(
        event_id=community.id,
        category="Pandal & Sound Contractor",
        name="Shri Balaji Tent & Audio",
        contact="+91 94480 77889",
        quote=180000.0,
        advance_paid=50000.0,
        status="booked",
        notes="Waterproof German hanger tent + 4 JBL speakers"
    ))

    c_ideas = ai_service.generate_ideas(community, remaining_budget=550000.0)
    for i in c_ideas:
        db.add(Idea(
            event_id=community.id,
            kind=i["kind"],
            title=i["title"],
            description=i["description"],
            est_cost=i["est_cost"],
            effort=i["effort"],
            saved=False
        ))

    db.commit()
    db.close()
    print("Seed complete! Created 3 realistic Indian demo events with budgets, tasks, vendors, and ideas.")

def seed_if_empty():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        count = db.query(Event).count()
        if count == 0:
            print("Events table is empty. Running seed on startup...")
            seed_database(clear=False)
            return True
        return False
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()

