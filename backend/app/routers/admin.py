from __future__ import annotations

import secrets
from typing import Any, Type

from fastapi import APIRouter, Depends, File, HTTPException, Response, UploadFile
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session, joinedload

from ..auth import (
    clear_admin_cookie,
    hash_password,
    require_admin,
    set_admin_cookie,
    verify_password,
)
from ..config import settings
from ..db import get_db
from ..models import (
    AdminUser,
    Barber,
    BeforeAfter,
    Booking,
    GalleryItem,
    Review,
    Service,
    SiteSettings,
    TikTokVideo,
    WorkItem,
    utcnow,
)
from ..serializers import serialize_booking
from ..utils import new_id, row_to_dict

router = APIRouter()


class LoginIn(BaseModel):
    username: str
    password: str


class PasswordIn(BaseModel):
    currentPassword: str
    newPassword: str = Field(min_length=6)


@router.post("/api/admin/login")
def login(body: LoginIn, response: Response, db: Session = Depends(get_db)):
    user = db.query(AdminUser).filter(AdminUser.username == body.username).first()
    if not user or not verify_password(body.password, user.passwordHash):
        raise HTTPException(401, "Yanlış login və ya şifrə")
    set_admin_cookie(response, user.username)
    return {"ok": True, "username": user.username}


@router.post("/api/admin/logout")
def logout(response: Response, _user: str = Depends(require_admin)):
    clear_admin_cookie(response)
    return {"ok": True}


@router.get("/api/admin/me")
def me(user: str = Depends(require_admin)):
    return {"username": user}


@router.put("/api/admin/password")
def change_password(
    body: PasswordIn,
    user: str = Depends(require_admin),
    db: Session = Depends(get_db),
):
    row = db.query(AdminUser).filter(AdminUser.username == user).first()
    if not row or not verify_password(body.currentPassword, row.passwordHash):
        raise HTTPException(400, "Cari şifrə yanlışdır")
    row.passwordHash = hash_password(body.newPassword)
    db.commit()
    return {"ok": True}


@router.get("/api/admin/stats")
def stats(_user: str = Depends(require_admin), db: Session = Depends(get_db)):
    recent = (
        db.query(Booking)
        .options(joinedload(Booking.service), joinedload(Booking.barber))
        .order_by(Booking.createdAt.desc())
        .limit(8)
        .all()
    )
    return {
        "counts": {
            "services": db.query(Service).count(),
            "barbers": db.query(Barber).count(),
            "bookings": db.query(Booking).count(),
            "gallery": db.query(GalleryItem).count(),
            "reviews": db.query(Review).count(),
            "tiktok": db.query(TikTokVideo).count(),
            "confirmed": db.query(Booking).filter(Booking.status == "confirmed").count(),
            "cancelled": db.query(Booking).filter(Booking.status == "cancelled").count(),
        },
        "recent": [serialize_booking(b, include_relations=True) for b in recent],
    }


@router.post("/api/admin/upload")
async def upload(
    file: UploadFile = File(...),
    _user: str = Depends(require_admin),
):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(400, "Only images")
    data = await file.read()
    if len(data) > 8 * 1024 * 1024:
        raise HTTPException(400, "Max 8MB")
    ext = {
        "image/png": "png",
        "image/webp": "webp",
        "image/gif": "gif",
    }.get(file.content_type, "jpg")
    settings.upload_dir.mkdir(parents=True, exist_ok=True)
    name = f"{int(utcnow().timestamp() * 1000)}-{secrets.token_hex(4)}.{ext}"
    path = settings.upload_dir / name
    path.write_bytes(data)
    return {"url": f"/media/uploads/{name}"}


def _crud_list(db: Session, model: Type, order_by=None):
    q = db.query(model)
    if order_by is not None:
        q = q.order_by(order_by)
    return [row_to_dict(i) for i in q.all()]


def _create(db: Session, model: Type, data: dict[str, Any]):
    data = {**data, "id": new_id()}
    if hasattr(model, "createdAt") and "createdAt" not in data:
        data["createdAt"] = utcnow()
    item = model(**data)
    db.add(item)
    db.commit()
    db.refresh(item)
    return row_to_dict(item)


def _update(db: Session, model: Type, item_id: str, data: dict[str, Any]):
    item = db.get(model, item_id)
    if not item:
        raise HTTPException(404, "Not found")
    for k, v in data.items():
        if v is not None or k in data:
            setattr(item, k, v)
    db.commit()
    db.refresh(item)
    return row_to_dict(item)


def _delete(db: Session, model: Type, item_id: str):
    item = db.get(model, item_id)
    if not item:
        raise HTTPException(404, "Not found")
    db.delete(item)
    db.commit()
    return {"ok": True}


# ---- Barbers ----
@router.get("/api/admin/barbers")
def barbers_list(_u: str = Depends(require_admin), db: Session = Depends(get_db)):
    return _crud_list(db, Barber, Barber.experience.desc())


@router.post("/api/admin/barbers", status_code=201)
def barbers_create(payload: dict[str, Any], _u: str = Depends(require_admin), db: Session = Depends(get_db)):
    return _create(db, Barber, payload)


@router.put("/api/admin/barbers/{item_id}")
def barbers_update(item_id: str, payload: dict[str, Any], _u: str = Depends(require_admin), db: Session = Depends(get_db)):
    return _update(db, Barber, item_id, payload)


@router.delete("/api/admin/barbers/{item_id}")
def barbers_delete(item_id: str, _u: str = Depends(require_admin), db: Session = Depends(get_db)):
    db.query(Booking).filter(Booking.barberId == item_id).delete()
    return _delete(db, Barber, item_id)


# ---- Services ----
@router.get("/api/admin/services")
def services_list(_u: str = Depends(require_admin), db: Session = Depends(get_db)):
    return _crud_list(db, Service, Service.sortOrder.asc())


@router.post("/api/admin/services", status_code=201)
def services_create(payload: dict[str, Any], _u: str = Depends(require_admin), db: Session = Depends(get_db)):
    return _create(db, Service, payload)


@router.put("/api/admin/services/{item_id}")
def services_update(item_id: str, payload: dict[str, Any], _u: str = Depends(require_admin), db: Session = Depends(get_db)):
    return _update(db, Service, item_id, payload)


@router.delete("/api/admin/services/{item_id}")
def services_delete(item_id: str, _u: str = Depends(require_admin), db: Session = Depends(get_db)):
    db.query(Booking).filter(Booking.serviceId == item_id).delete()
    return _delete(db, Service, item_id)


# ---- Gallery ----
@router.get("/api/admin/gallery")
def gallery_list(_u: str = Depends(require_admin), db: Session = Depends(get_db)):
    return _crud_list(db, GalleryItem, GalleryItem.sortOrder.asc())


@router.post("/api/admin/gallery", status_code=201)
def gallery_create(payload: dict[str, Any], _u: str = Depends(require_admin), db: Session = Depends(get_db)):
    return _create(db, GalleryItem, payload)


@router.put("/api/admin/gallery/{item_id}")
def gallery_update(item_id: str, payload: dict[str, Any], _u: str = Depends(require_admin), db: Session = Depends(get_db)):
    return _update(db, GalleryItem, item_id, payload)


@router.delete("/api/admin/gallery/{item_id}")
def gallery_delete(item_id: str, _u: str = Depends(require_admin), db: Session = Depends(get_db)):
    return _delete(db, GalleryItem, item_id)


# ---- Reviews ----
@router.get("/api/admin/reviews")
def reviews_list(_u: str = Depends(require_admin), db: Session = Depends(get_db)):
    return _crud_list(db, Review, Review.sortOrder.asc())


@router.post("/api/admin/reviews", status_code=201)
def reviews_create(payload: dict[str, Any], _u: str = Depends(require_admin), db: Session = Depends(get_db)):
    return _create(db, Review, payload)


@router.put("/api/admin/reviews/{item_id}")
def reviews_update(item_id: str, payload: dict[str, Any], _u: str = Depends(require_admin), db: Session = Depends(get_db)):
    return _update(db, Review, item_id, payload)


@router.delete("/api/admin/reviews/{item_id}")
def reviews_delete(item_id: str, _u: str = Depends(require_admin), db: Session = Depends(get_db)):
    return _delete(db, Review, item_id)


# ---- TikTok ----
@router.get("/api/admin/tiktok")
def tiktok_list(_u: str = Depends(require_admin), db: Session = Depends(get_db)):
    return _crud_list(db, TikTokVideo, TikTokVideo.sortOrder.asc())


@router.post("/api/admin/tiktok", status_code=201)
def tiktok_create(payload: dict[str, Any], _u: str = Depends(require_admin), db: Session = Depends(get_db)):
    return _create(db, TikTokVideo, payload)


@router.put("/api/admin/tiktok/{item_id}")
def tiktok_update(item_id: str, payload: dict[str, Any], _u: str = Depends(require_admin), db: Session = Depends(get_db)):
    return _update(db, TikTokVideo, item_id, payload)


@router.delete("/api/admin/tiktok/{item_id}")
def tiktok_delete(item_id: str, _u: str = Depends(require_admin), db: Session = Depends(get_db)):
    return _delete(db, TikTokVideo, item_id)


# ---- Before/After ----
@router.get("/api/admin/before-after")
def ba_list(_u: str = Depends(require_admin), db: Session = Depends(get_db)):
    return _crud_list(db, BeforeAfter, BeforeAfter.sortOrder.asc())


@router.post("/api/admin/before-after", status_code=201)
def ba_create(payload: dict[str, Any], _u: str = Depends(require_admin), db: Session = Depends(get_db)):
    return _create(db, BeforeAfter, payload)


@router.put("/api/admin/before-after/{item_id}")
def ba_update(item_id: str, payload: dict[str, Any], _u: str = Depends(require_admin), db: Session = Depends(get_db)):
    return _update(db, BeforeAfter, item_id, payload)


@router.delete("/api/admin/before-after/{item_id}")
def ba_delete(item_id: str, _u: str = Depends(require_admin), db: Session = Depends(get_db)):
    return _delete(db, BeforeAfter, item_id)


# ---- Works ----
@router.get("/api/admin/works")
def works_list(_u: str = Depends(require_admin), db: Session = Depends(get_db)):
    return _crud_list(db, WorkItem, WorkItem.sortOrder.asc())


@router.post("/api/admin/works", status_code=201)
def works_create(payload: dict[str, Any], _u: str = Depends(require_admin), db: Session = Depends(get_db)):
    return _create(db, WorkItem, payload)


@router.put("/api/admin/works/{item_id}")
def works_update(item_id: str, payload: dict[str, Any], _u: str = Depends(require_admin), db: Session = Depends(get_db)):
    return _update(db, WorkItem, item_id, payload)


@router.delete("/api/admin/works/{item_id}")
def works_delete(item_id: str, _u: str = Depends(require_admin), db: Session = Depends(get_db)):
    return _delete(db, WorkItem, item_id)


# ---- Bookings ----
@router.get("/api/admin/bookings")
def bookings_list(_u: str = Depends(require_admin), db: Session = Depends(get_db)):
    rows = (
        db.query(Booking)
        .options(joinedload(Booking.service), joinedload(Booking.barber))
        .order_by(Booking.createdAt.desc())
        .all()
    )
    return [serialize_booking(b, include_relations=True) for b in rows]


@router.post("/api/admin/bookings", status_code=201)
def bookings_create(payload: dict[str, Any], _u: str = Depends(require_admin), db: Session = Depends(get_db)):
    payload = {**payload, "id": new_id(), "createdAt": utcnow()}
    if "notes" in payload and payload["notes"] == "":
        payload["notes"] = None
    item = Booking(**{k: v for k, v in payload.items() if hasattr(Booking, k)})
    db.add(item)
    db.commit()
    db.refresh(item)
    item = (
        db.query(Booking)
        .options(joinedload(Booking.service), joinedload(Booking.barber))
        .filter(Booking.id == item.id)
        .one()
    )
    return serialize_booking(item, include_relations=True)


@router.put("/api/admin/bookings/{item_id}")
def bookings_update(item_id: str, payload: dict[str, Any], _u: str = Depends(require_admin), db: Session = Depends(get_db)):
    item = db.get(Booking, item_id)
    if not item:
        raise HTTPException(404, "Not found")
    for k, v in payload.items():
        if hasattr(item, k):
            if k == "notes" and v == "":
                v = None
            setattr(item, k, v)
    db.commit()
    item = (
        db.query(Booking)
        .options(joinedload(Booking.service), joinedload(Booking.barber))
        .filter(Booking.id == item_id)
        .one()
    )
    return serialize_booking(item, include_relations=True)


@router.delete("/api/admin/bookings/{item_id}")
def bookings_delete(item_id: str, _u: str = Depends(require_admin), db: Session = Depends(get_db)):
    return _delete(db, Booking, item_id)


# ---- Settings ----
@router.get("/api/admin/settings")
def settings_get(_u: str = Depends(require_admin), db: Session = Depends(get_db)):
    row = db.get(SiteSettings, "main")
    return row_to_dict(row) if row else None


@router.put("/api/admin/settings")
def settings_put(payload: dict[str, Any], _u: str = Depends(require_admin), db: Session = Depends(get_db)):
    row = db.get(SiteSettings, "main")
    if not row:
        row = SiteSettings(id="main", **payload)
        db.add(row)
    else:
        for k, v in payload.items():
            if hasattr(row, k):
                setattr(row, k, v)
        row.updatedAt = utcnow()
    db.commit()
    db.refresh(row)
    return row_to_dict(row)
