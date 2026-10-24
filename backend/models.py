from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from backend.database import Base

class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    type = Column(String(50), nullable=False)  # wedding, birthday, community
    title = Column(String(255), nullable=False)
    date = Column(String(50), nullable=False)  # YYYY-MM-DD
    city = Column(String(100), nullable=False)
    guest_count = Column(Integer, nullable=False, default=100)
    total_budget = Column(Float, nullable=False, default=500000.0)
    theme = Column(String(100), nullable=True)
    culture = Column(String(100), nullable=True)
    priorities = Column(JSON, default=list)  # stored as list of strings
    created_at = Column(DateTime, default=datetime.utcnow)

    budget_items = relationship("BudgetItem", back_populates="event", cascade="all, delete-orphan")
    tasks = relationship("Task", back_populates="event", cascade="all, delete-orphan")
    vendors = relationship("Vendor", back_populates="event", cascade="all, delete-orphan")
    ideas = relationship("Idea", back_populates="event", cascade="all, delete-orphan")

class BudgetItem(Base):
    __tablename__ = "budget_items"

    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id"), nullable=False, index=True)
    category = Column(String(100), nullable=False)
    planned = Column(Float, nullable=False, default=0.0)
    actual = Column(Float, nullable=False, default=0.0)
    notes = Column(Text, nullable=True)

    event = relationship("Event", back_populates="budget_items")

class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    due_date = Column(String(50), nullable=False)  # YYYY-MM-DD
    category = Column(String(100), nullable=False)
    status = Column(String(50), nullable=False, default="pending")  # pending, in_progress, completed
    priority = Column(String(50), nullable=False, default="medium")  # low, medium, high, critical

    event = relationship("Event", back_populates="tasks")

class Vendor(Base):
    __tablename__ = "vendors"

    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id"), nullable=False, index=True)
    category = Column(String(100), nullable=False)
    name = Column(String(255), nullable=False)
    contact = Column(String(100), nullable=True)
    quote = Column(Float, nullable=False, default=0.0)
    advance_paid = Column(Float, nullable=False, default=0.0)
    status = Column(String(50), nullable=False, default="researching")  # researching, contacted, negotiating, booked, rejected
    notes = Column(Text, nullable=True)

    event = relationship("Event", back_populates="vendors")

class Idea(Base):
    __tablename__ = "ideas"

    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id"), nullable=False, index=True)
    kind = Column(String(50), nullable=False)  # decor, menu, entertainment, invites, gifts
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    est_cost = Column(Float, nullable=False, default=0.0)
    effort = Column(String(50), nullable=False, default="medium")  # low, medium, high
    saved = Column(Boolean, default=False)

    event = relationship("Event", back_populates="ideas")
