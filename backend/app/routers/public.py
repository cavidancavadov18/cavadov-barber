from __future__ import annotations

import re

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session, joinedload

from ..db import get_db
from ..models import Barber, Booking, BeforeAfter, GalleryItem, Review, Service, SiteSettings, TikTokVideo, WorkItem
from ..utils import (
    booking_whatsapp_message,
    build_whatsapp_url,
    generate_day_slots,
    is_past_slot,
    is_slot_blocked,
    new_id,
    normalize_phone,
    row_to_dict,
)

router = APIRouter()


class BookingIn(BaseModel):
    serviceId: str
    barberId: str
    date: str = Field(pattern=r"^\d{4}-\d{2}-\d{2}$")
    time: str = Field(pattern=r"^\d{2}:\d{2}$")
    customerName: str = Field(min_length=2, max_length=80)
    phone: str = Field(min_length=7, max_length=30)
    notes: str | None = Field(default=None, max_length=500)
    locale: str = "az"


@router.get("/api/catalog")
def catalog(db: Session = Depends(get_db)):
    services = db.query(Service).order_by(Service.sortOrder.asc()).all()
    barbers = db.query(Barber).order_by(Barber.experience.desc()).all()
    return {
        "services": [row_to_dict(s) for s in services],
        "barbers": [row_to_dict(b) for b in barbers],
    }


@router.get("/api/content")
def content(db: Session = Depends(get_db)):
    settings = db.get(SiteSettings, "main")
    gallery = db.query(GalleryItem).order_by(GalleryItem.sortOrder.asc()).all()
    reviews = db.query(Review).order_by(Review.sortOrder.asc()).all()
    tiktok = db.query(TikTokVideo).order_by(TikTokVideo.sortOrder.asc()).all()
    before_after = db.query(BeforeAfter).order_by(BeforeAfter.sortOrder.asc()).all()
    works = db.query(WorkItem).order_by(WorkItem.sortOrder.asc()).all()

    settings_data = None
    if settings:
        settings_data = {
            "addressAz": settings.addressAz,
            "addressEn": settings.addressEn,
            "phoneDisplay": settings.phoneDisplay,
            "phoneTel": settings.phoneTel,
            "whatsapp": settings.whatsapp,
            "email": settings.email,
            "hoursAz": settings.hoursAz,
            "hoursEn": settings.hoursEn,
            "weekdayStart": settings.weekdayStart,
            "weekdayEnd": settings.weekdayEnd,
            "sundayStart": settings.sundayStart,
            "sundayEnd": settings.sundayEnd,
            "mapEmbedUrl": settings.mapEmbedUrl,
            "tiktokProfile": settings.tiktokProfile,
            "heroVideo": settings.heroVideo,
            "heroImage": settings.heroImage,
            "aboutImage": settings.aboutImage,
            "brandAvatar": settings.brandAvatar,
        }

    return {
        "settings": settings_data,
        "gallery": [row_to_dict(g) for g in gallery],
        "reviews": [row_to_dict(r) for r in reviews],
        "tiktok": [
            {
                "id": t.id,
                "url": t.url,
                "cover": t.cover,
                "titleAz": t.titleAz,
                "titleEn": t.titleEn,
                "focus": t.focus,
            }
            for t in tiktok
        ],
        "beforeAfter": [row_to_dict(b) for b in before_after],
        "works": [row_to_dict(w) for w in works],
    }


@router.get("/api/bookings/slots")
def slots(
    barberId: str,
    date: str,
    serviceId: str | None = None,
    db: Session = Depends(get_db),
):
    if not re.match(r"^\d{4}-\d{2}-\d{2}$", date):
        raise HTTPException(400, "barberId and date required")
    barber = db.get(Barber, barberId)
    if not barber:
        raise HTTPException(404, "Barber not found")

    duration = 30
    if serviceId:
        service = db.get(Service, serviceId)
        if service:
            duration = service.durationMin

    bookings = (
        db.query(Booking)
        .options(joinedload(Booking.service))
        .filter(Booking.barberId == barberId, Booking.date == date, Booking.status != "cancelled")
        .all()
    )
    taken = [(b.time, (b.service.durationMin if b.service else 30) or 30) for b in bookings]

    settings = db.get(SiteSettings, "main")
    start = settings.weekdayStart if settings else 10
    end = settings.weekdayEnd if settings else 24
    sunday_start = settings.sundayStart if settings else 10
    sunday_end = settings.sundayEnd if settings else 24

    available = [
        s
        for s in generate_day_slots(date, start, end, sunday_start, sunday_end)
        if not is_past_slot(date, s) and not is_slot_blocked(s, taken, duration)
    ]
    return {"slots": available, "durationMin": duration}


@router.post("/api/bookings")
def create_booking(body: BookingIn, db: Session = Depends(get_db)):
    locale = body.locale if body.locale in {"az", "en"} else "az"
    phone = normalize_phone(body.phone)
    if len(re.sub(r"\D", "", phone)) < 10:
        raise HTTPException(
            400,
            "Enter a valid phone number" if locale == "en" else "Düzgün telefon nömrəsi daxil edin",
        )
    if is_past_slot(body.date, body.time):
        raise HTTPException(
            400,
            "Selected time is in the past" if locale == "en" else "Seçilmiş saat keçmişdədir",
        )

    service = db.get(Service, body.serviceId)
    barber = db.get(Barber, body.barberId)
    if not service or not barber:
        raise HTTPException(
            400,
            "Invalid service or barber" if locale == "en" else "Xidmət və ya usta tapılmadı",
        )

    same_day = (
        db.query(Booking)
        .options(joinedload(Booking.service))
        .filter(
            Booking.barberId == body.barberId,
            Booking.date == body.date,
            Booking.status != "cancelled",
        )
        .all()
    )
    taken = [(b.time, (b.service.durationMin if b.service else 30) or 30) for b in same_day]
    if is_slot_blocked(body.time, taken, service.durationMin):
        raise HTTPException(
            409,
            "This slot is already booked" if locale == "en" else "Bu saat artıq rezerv olunub",
        )

    booking = Booking(
        id=new_id(),
        serviceId=body.serviceId,
        barberId=body.barberId,
        date=body.date,
        time=body.time,
        customerName=body.customerName.strip(),
        phone=phone,
        notes=(body.notes or "").strip() or None,
        locale=locale,
        status="pending",
    )
    db.add(booking)
    db.commit()
    db.refresh(booking)

    settings = db.get(SiteSettings, "main")
    service_name = service.nameEn if locale == "en" else service.nameAz
    barber_name = barber.nameEn if locale == "en" else barber.nameAz
    message = booking_whatsapp_message(
        locale=locale,
        customer_name=body.customerName.strip(),
        phone=phone,
        service_name=service_name,
        barber_name=barber_name,
        date=body.date,
        time=body.time,
        notes=(body.notes or "").strip() or None,
        price=service.price,
    )
    whatsapp_url = build_whatsapp_url(message, settings.whatsapp if settings else None)

    return {
        "booking": {
            "id": booking.id,
            "date": booking.date,
            "time": booking.time,
            "status": booking.status,
            "serviceName": service_name,
            "barberName": barber_name,
            "customerName": body.customerName.strip(),
            "phone": phone,
            "notes": booking.notes,
            "price": service.price,
            "priceNote": service.priceNoteEn if locale == "en" else service.priceNoteAz,
        },
        "whatsappUrl": whatsapp_url,
    }
