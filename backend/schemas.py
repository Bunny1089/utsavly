from datetime import datetime
from typing import List, Optional, Literal, Any
from pydantic import BaseModel, Field, ConfigDict

# Common Types
EventType = Literal["wedding", "birthday", "community"]
TaskStatus = Literal["pending", "in_progress", "completed"]
TaskPriority = Literal["low", "medium", "high", "critical"]
VendorStatus = Literal["researching", "contacted", "negotiating", "booked", "rejected"]
IdeaKind = Literal["decor", "menu", "entertainment", "invites", "gifts"]
IdeaEffort = Literal["low", "medium", "high"]

# --- Event Schemas ---
class EventBase(BaseModel):
    type: EventType
    title: str = Field(..., min_length=2, max_length=255)
    date: str = Field(..., description="Target date in YYYY-MM-DD")
    city: str = Field(..., min_length=2, max_length=100)
    guest_count: int = Field(..., gt=0)
    total_budget: float = Field(..., gt=0)
    theme: Optional[str] = None
    culture: Optional[str] = None
    priorities: List[str] = Field(default_factory=list)

class EventCreate(EventBase):
    pass

class EventUpdate(BaseModel):
    title: Optional[str] = None
    date: Optional[str] = None
    city: Optional[str] = None
    guest_count: Optional[int] = None
    total_budget: Optional[float] = None
    theme: Optional[str] = None
    culture: Optional[str] = None
    priorities: Optional[List[str]] = None

class EventResponse(EventBase):
    id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

# --- Budget Schemas ---
class BudgetItemBase(BaseModel):
    category: str
    planned: float = Field(default=0.0, ge=0)
    actual: float = Field(default=0.0, ge=0)
    notes: Optional[str] = None

class BudgetItemCreate(BudgetItemBase):
    pass

class BudgetItemUpdate(BaseModel):
    planned: Optional[float] = Field(None, ge=0)
    actual: Optional[float] = Field(None, ge=0)
    notes: Optional[str] = None

class BudgetItemResponse(BudgetItemBase):
    id: int
    event_id: int
    percentage: Optional[float] = 0.0
    model_config = ConfigDict(from_attributes=True)

class BudgetOverviewResponse(BaseModel):
    event_id: int
    total_budget: float
    planned_total: float
    actual_total: float
    contingency_amount: float
    contingency_percentage: float
    is_overspend: bool
    items: List[BudgetItemResponse]

class BudgetGenerateResponse(BaseModel):
    event_id: int
    total_budget: float
    allocated_total: float
    contingency_amount: float
    contingency_percentage: float
    items: List[BudgetItemResponse]

# --- Task / Timeline Schemas ---
class TaskBase(BaseModel):
    title: str
    due_date: str
    category: str
    status: TaskStatus = "pending"
    priority: TaskPriority = "medium"

class TaskCreate(TaskBase):
    pass

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    due_date: Optional[str] = None
    category: Optional[str] = None
    status: Optional[TaskStatus] = None
    priority: Optional[TaskPriority] = None

class TaskResponse(TaskBase):
    id: int
    event_id: int
    model_config = ConfigDict(from_attributes=True)

class TimelineGenerateResponse(BaseModel):
    event_id: int
    tasks: List[TaskResponse]

class TimelineRescheduleRequest(BaseModel):
    new_date: str

# --- Vendor Schemas ---
class VendorBase(BaseModel):
    category: str
    name: str
    contact: Optional[str] = None
    quote: float = Field(default=0.0, ge=0)
    advance_paid: float = Field(default=0.0, ge=0)
    status: VendorStatus = "researching"
    notes: Optional[str] = None

class VendorCreate(VendorBase):
    pass

class VendorUpdate(BaseModel):
    category: Optional[str] = None
    name: Optional[str] = None
    contact: Optional[str] = None
    quote: Optional[float] = Field(None, ge=0)
    advance_paid: Optional[float] = Field(None, ge=0)
    status: Optional[VendorStatus] = None
    notes: Optional[str] = None

class VendorResponse(VendorBase):
    id: int
    event_id: int
    model_config = ConfigDict(from_attributes=True)

class VendorAiQuestionsResponse(BaseModel):
    vendor_id: int
    category: str
    questions_to_ask: List[str]
    red_flags: List[str]

# --- Ideas Schemas ---
class IdeaBase(BaseModel):
    kind: IdeaKind
    title: str
    description: str
    est_cost: float = Field(default=0.0, ge=0)
    effort: IdeaEffort = "medium"
    saved: bool = False

class IdeaCreate(IdeaBase):
    pass

class IdeaUpdate(BaseModel):
    saved: Optional[bool] = None

class IdeaResponse(IdeaBase):
    id: int
    event_id: int
    model_config = ConfigDict(from_attributes=True)

class IdeasGenerateResponse(BaseModel):
    event_id: int
    ideas: List[IdeaResponse]

# --- Health Schemas ---
class HealthAlert(BaseModel):
    type: Literal["info", "warning", "danger", "success"]
    message: str

class HealthScoreResponse(BaseModel):
    score: int = Field(..., ge=0, le=100)
    rating: str
    days_left: int
    alerts: List[HealthAlert]
    metrics: dict[str, Any]

# --- Copilot Schemas ---
class CopilotAction(BaseModel):
    tool: str
    details: dict[str, Any]

class CopilotRequest(BaseModel):
    message: str

class CopilotResponse(BaseModel):
    reply: str
    actions_taken: List[CopilotAction] = Field(default_factory=list)
