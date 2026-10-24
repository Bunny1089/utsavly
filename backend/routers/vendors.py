from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from backend.database import get_db
from backend.models import Event, Vendor
from backend.schemas import (
    VendorResponse,
    VendorCreate,
    VendorUpdate,
    VendorAiQuestionsResponse
)
from backend.services.ai_service import ai_service

router = APIRouter(tags=["Vendors"])

@router.get("/events/{id}/vendors", response_model=List[VendorResponse])
def get_event_vendors(id: int, db: Session = Depends(get_db)):
    return db.query(Vendor).filter(Vendor.event_id == id).all()

@router.post("/events/{id}/vendors", response_model=VendorResponse, status_code=status.HTTP_201_CREATED)
def create_vendor(id: int, payload: VendorCreate, db: Session = Depends(get_db)):
    event = db.query(Event).filter(Event.id == id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    vendor = Vendor(
        event_id=id,
        category=payload.category,
        name=payload.name,
        contact=payload.contact,
        quote=payload.quote,
        advance_paid=payload.advance_paid,
        status=payload.status,
        notes=payload.notes
    )
    db.add(vendor)
    db.commit()
    db.refresh(vendor)
    return vendor

@router.patch("/vendors/{id}", response_model=VendorResponse)
def update_vendor(id: int, payload: VendorUpdate, db: Session = Depends(get_db)):
    vendor = db.query(Vendor).filter(Vendor.id == id).first()
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")

    data = payload.dict(exclude_unset=True)
    for k, v in data.items():
        setattr(vendor, k, v)

    db.commit()
    db.refresh(vendor)
    return vendor

@router.delete("/vendors/{id}")
def delete_vendor(id: int, db: Session = Depends(get_db)):
    vendor = db.query(Vendor).filter(Vendor.id == id).first()
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")
    db.delete(vendor)
    db.commit()
    return {"message": "Vendor deleted"}

@router.post("/vendors/{id}/ai-questions", response_model=VendorAiQuestionsResponse)
def get_vendor_ai_guidance(id: int, db: Session = Depends(get_db)):
    vendor = db.query(Vendor).filter(Vendor.id == id).first()
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")

    event = db.query(Event).filter(Event.id == vendor.event_id).first()
    culture = event.culture if event else "Indian"

    guidance = ai_service.generate_vendor_questions(vendor.category, culture=culture)

    return VendorAiQuestionsResponse(
        vendor_id=vendor.id,
        category=vendor.category,
        questions_to_ask=guidance["questions_to_ask"],
        red_flags=guidance["red_flags"]
    )
