# API Contract: Utsavly (Event Planning Assistant)

This contract is the single source of truth between the FastAPI backend and React frontend.
All AI endpoints return strictly structured JSON. Currency is INR (`₹`).

---

## 1. Global Standards
- Base URL: `http://localhost:8000/api`
- Content-Type: `application/json`
- Standard Error Response:
  ```json
  {
    "detail": "Error description message"
  }
  ```

---

## 2. Event Models

### Enums
- `EventType`: `"wedding"` | `"birthday"` | `"community"`
- `TaskStatus`: `"pending"` | `"in_progress"` | `"completed"`
- `TaskPriority`: `"low"` | `"medium"` | `"high"` | `"critical"`
- `VendorStatus`: `"researching"` | `"contacted"` | `"negotiating"` | `"booked"` | `"rejected"`
- `IdeaKind`: `"decor"` | `"menu"` | `"entertainment"` | `"invites"` | `"gifts"`
- `IdeaEffort`: `"low"` | `"medium"` | `"high"`

### Event Object
```json
{
  "id": 1,
  "type": "wedding",
  "title": "Aarav & Meera's Royal Sangeet & Vivah",
  "date": "2026-11-20",
  "city": "Jaipur",
  "guest_count": 350,
  "total_budget": 2500000.0,
  "theme": "Royal Rajasthani Heritage",
  "culture": "North Indian Hindu",
  "priorities": ["Gourmet Catering", "Cinematic Photography", "Vibrant Decor"],
  "created_at": "2026-10-24T18:00:00Z"
}
```

---

## 3. Endpoints

### 3.1 Event Management

#### `POST /api/events`
Create a new event.
- Request Body:
  ```json
  {
    "type": "wedding",
    "title": "Aarav & Meera Wedding",
    "date": "2026-11-20",
    "city": "Jaipur",
    "guest_count": 350,
    "total_budget": 2500000.0,
    "theme": "Royal Rajasthani",
    "culture": "North Indian",
    "priorities": ["Food", "Decor", "Photography"]
  }
  ```
- Response (201 Created): Full `Event` object with `id`.

#### `GET /api/events`
List all events.
- Response (200 OK): `Event[]`

#### `GET /api/events/{id}`
Retrieve event details with summary counts.
- Response (200 OK): `Event` with optional nested `budget_items`, `tasks`, `vendors`, `ideas` or full aggregate.

---

### 3.2 AI Budget

#### `POST /api/events/{id}/budget/generate`
Generates an AI-powered category breakdown summing strictly to `total_budget`.
Includes 8-10% contingency allocation.
- Query / Body: `{ "force_regenerate": true }`
- Response (200 OK):
  ```json
  {
    "event_id": 1,
    "total_budget": 2500000.0,
    "allocated_total": 2500000.0,
    "contingency_amount": 225000.0,
    "contingency_percentage": 9.0,
    "items": [
      {
        "id": 1,
        "event_id": 1,
        "category": "Catering & Banquet",
        "planned": 900000.0,
        "actual": 0.0,
        "percentage": 36.0,
        "notes": "Multi-cuisine buffet + live Chaat counters for 350 guests"
      },
      {
        "id": 2,
        "event_id": 1,
        "category": "Decor & Lighting",
        "planned": 450000.0,
        "actual": 0.0,
        "percentage": 18.0,
        "notes": "Marigold mandap, fairy-light ceiling canopy, floral stage"
      }
    ]
  }
  ```

#### `GET /api/events/{id}/budget`
List budget items for an event.
- Response (200 OK):
  ```json
  {
    "event_id": 1,
    "total_budget": 2500000.0,
    "planned_total": 2500000.0,
    "actual_total": 350000.0,
    "is_overspend": false,
    "items": [ ...BudgetItem ]
  }
  ```

#### `PATCH /api/budget/{item_id}`
Update actual spend or notes.
- Request Body:
  ```json
  {
    "actual": 475000.0,
    "notes": "Added gourmet live pasta counter"
  }
  ```
- Response (200 OK): Updated `BudgetItem`.

---

### 3.3 AI Timeline

#### `POST /api/events/{id}/timeline/generate`
Generates backward-planned tasks from event date.
- Response (200 OK):
  ```json
  {
    "event_id": 1,
    "tasks": [
      {
        "id": 1,
        "event_id": 1,
        "title": "Book Venue & Banquet Hall",
        "due_date": "2026-08-20",
        "category": "Venue",
        "status": "completed",
        "priority": "critical"
      },
      {
        "id": 2,
        "event_id": 1,
        "title": "Finalize Caterer & Tasting Menu",
        "due_date": "2026-09-15",
        "category": "Food",
        "status": "in_progress",
        "priority": "high"
      }
    ]
  }
  ```

#### `GET /api/events/{id}/tasks`
List all tasks for an event.
- Response (200 OK): `Task[]`

#### `PATCH /api/tasks/{id}`
Update task status, due_date, or priority.
- Request Body:
  ```json
  {
    "status": "completed",
    "due_date": "2026-09-18"
  }
  ```
- Response (200 OK): Updated `Task`.

#### `POST /api/events/{id}/timeline/reschedule`
Recalculates all remaining due dates when the event date changes.
- Request Body:
  ```json
  {
    "new_date": "2026-12-05"
  }
  ```
- Response (200 OK): Updated `Task[]`.

---

### 3.4 Vendor Checklist & AI Guidance

#### `GET /api/events/{id}/vendors`
List vendors for an event.
- Response (200 OK): `Vendor[]`

#### `POST /api/events/{id}/vendors`
Add a vendor.
- Request Body:
  ```json
  {
    "category": "Photography",
    "name": "Memories Studio",
    "contact": "+91 98765 43210",
    "quote": 120000.0,
    "advance_paid": 30000.0,
    "status": "booked",
    "notes": "Includes drone coverage and 2 candid photographers"
  }
  ```
- Response (201 Created): Created `Vendor`.

#### `PATCH /api/vendors/{id}`
Update vendor status, quote, or advance paid.

#### `POST /api/vendors/{id}/ai-questions`
AI generated "questions to ask" and "red flags" specific to vendor category and event culture.
- Response (200 OK):
  ```json
  {
    "vendor_id": 1,
    "category": "Photography",
    "questions_to_ask": [
      "Will the principal photographer shoot personally or send junior associates?",
      "How many raw hours of shoot and lighting equipment are included in the package?",
      "What is the turnaround time for the teaser, album, and full 4K raw footage?"
    ],
    "red_flags": [
      "No written contract detailing delivery timelines and backup camera gear",
      "Demands 100% payment upfront before event day",
      "Vague response on drone permissions or copyright ownership"
    ]
  }
  ```

---

### 3.5 AI Ideas Engine

#### `POST /api/events/{id}/ideas/generate`
Generates personalized ideas for decor, menu, entertainment, invites, and gifts fitting the remaining budget.
- Response (200 OK):
  ```json
  {
    "event_id": 1,
    "ideas": [
      {
        "id": 1,
        "event_id": 1,
        "kind": "decor",
        "title": "Marigold & Brass Urli Entrance Walkway",
        "description": "Traditional floating marigold urlis paired with brass diyas to welcome guests with fragrant warmth.",
        "est_cost": 25000.0,
        "effort": "low",
        "saved": false
      },
      {
        "id": 2,
        "event_id": 1,
        "kind": "entertainment",
        "title": "Interactive Live Dhol & Folk Fusion Troupe",
        "description": "Rajasthani folk instruments mixed with modern upbeat rhythms for spontaneous sangeet flashmobs.",
        "est_cost": 45000.0,
        "effort": "medium",
        "saved": false
      }
    ]
  }
  ```

#### `PATCH /api/ideas/{id}`
Toggle saved state or add to plan.
- Request Body: `{ "saved": true }`

---

### 3.6 Event Health & Smart Alerts (Deterministic, Zero AI Call)

#### `GET /api/events/{id}/health`
Computes an objective 0-100 score + smart alerts based on overdue tasks, unbooked critical vendors, and budget variance.
- Response (200 OK):
  ```json
  {
    "score": 82,
    "rating": "Good",
    "days_left": 27,
    "alerts": [
      {
        "type": "warning",
        "message": "Catering vendor quote pending with only 27 days left."
      },
      {
        "type": "info",
        "message": "Contingency reserve remains untouched at 9% (₹2,25,000)."
      }
    ],
    "metrics": {
      "budget_spent_pct": 14.0,
      "tasks_completed_pct": 65.0,
      "critical_vendors_booked": 3,
      "critical_vendors_total": 4
    }
  }
  ```

---

### 3.7 Planner Copilot

#### `POST /api/events/{id}/copilot`
Context-aware planner assistant with allowlisted tool-calling (update budget, add task, recommend ideas).
- Request Body:
  ```json
  {
    "message": "We decided to increase our catering budget by 50,000 and reduce decor."
  }
  ```
- Response (200 OK):
  ```json
  {
    "reply": "I've updated your catering budget by ₹50,000 and deducted ₹50,000 from decor so your overall budget remains balanced at ₹25,00,000.",
    "actions_taken": [
      {
        "tool": "update_budget_item",
        "category": "Catering & Banquet",
        "new_planned": 950000.0
      },
      {
        "tool": "update_budget_item",
        "category": "Decor & Lighting",
        "new_planned": 400000.0
      }
    ]
  }
  ```
