from __future__ import annotations

import re
import uuid
from datetime import datetime, timedelta, timezone
from typing import Iterable
from urllib.parse import quote
from zoneinfo import ZoneInfo

from .config import settings

BAKU = ZoneInfo("Asia/Baku")
SLOT_INTERVAL_MIN = 30


def new_id() -> str:
    return "c" + uuid.uuid4().hex[:24]


def today_in_baku() -> str:
    return datetime.now(BAKU).strftime("%Y-%m-%d")


def baku_now_parts():
    now = datetime.now(BAKU)
    return now.strftime("%Y-%m-%d"), now.hour, now.minute


def generate_day_slots(date_str: str, start: int, end: int, sunday_start: int, sunday_end: int) -> list[str]:
    y, m, d = map(int, date_str.split("-"))
    # weekday in Baku
    probe = datetime(y, m, d, 12, 0, tzinfo=BAKU)
    is_sunday = probe.weekday() == 6
    h0 = sunday_start if is_sunday else start
    h1 = sunday_end if is_sunday else end
    slots: list[str] = []
    for h in range(h0, h1):
        for minute in range(0, 60, SLOT_INTERVAL_MIN):
            total = h * 60 + minute
            if total + SLOT_INTERVAL_MIN > h1 * 60:
                continue
            slots.append(f"{h:02d}:{minute:02d}")
    return slots


def to_minutes(time: str) -> int:
    h, m = map(int, time.split(":"))
    return h * 60 + m


def is_past_slot(date_str: str, time: str) -> bool:
    today, hour, minute = baku_now_parts()
    if date_str < today:
        return True
    if date_str > today:
        return False
    return to_minutes(time) <= hour * 60 + minute


def is_slot_blocked(
    slot: str,
    taken: Iterable[tuple[str, int]],
    duration_min: int,
) -> bool:
    start = to_minutes(slot)
    end = start + duration_min
    for t, dur in taken:
        b_start = to_minutes(t)
        b_end = b_start + dur
        if start < b_end and end > b_start:
            return True
    return False


def normalize_phone(input_phone: str) -> str:
    digits = re.sub(r"\D", "", input_phone)
    if digits.startswith("994") and len(digits) >= 12:
        return f"+{digits}"
    if digits.startswith("0") and len(digits) == 10:
        return f"+994{digits[1:]}"
    if len(digits) == 9:
        return f"+994{digits}"
    if input_phone.strip().startswith("+"):
        return f"+{digits}"
    return f"+{digits}" if digits else ""


def get_whatsapp_number(override: str | None = None) -> str:
    raw = override or settings.public_whatsapp_number or settings.whatsapp_number
    return re.sub(r"\D", "", raw)


def build_whatsapp_url(message: str, override: str | None = None) -> str:
    phone = get_whatsapp_number(override)
    return f"https://wa.me/{phone}?text={quote(message)}"


def booking_whatsapp_message(
    *,
    locale: str,
    customer_name: str,
    phone: str,
    service_name: str,
    barber_name: str,
    date: str,
    time: str,
    notes: str | None = None,
    price: int | None = None,
) -> str:
    price_bit = f" ({price} AZN)" if price is not None else ""
    if locale == "en":
        lines = [
            "CAVADOV BARBER — New booking request",
            "",
            f"Name: {customer_name}",
            f"Phone: {phone}",
            f"Service: {service_name}{price_bit}",
            f"Barber: {barber_name}",
            f"Date: {date}",
            f"Time: {time}",
        ]
        if notes:
            lines.append(f"Notes: {notes}")
        lines += ["", "Please reply to CONFIRM or CANCEL this booking."]
        return "\n".join(lines)

    lines = [
        "CAVADOV BARBER — Yeni rezervasiya sorğusu",
        "",
        f"Ad: {customer_name}",
        f"Telefon: {phone}",
        f"Xidmət: {service_name}{price_bit}",
        f"Usta: {barber_name}",
        f"Tarix: {date}",
        f"Saat: {time}",
    ]
    if notes:
        lines.append(f"Qeyd: {notes}")
    lines += ["", "Zəhmət olmasa TƏSDİQLƏ və ya LƏĞV ET yazaraq cavab verin."]
    return "\n".join(lines)


def row_to_dict(obj, extra: dict | None = None) -> dict:
    data = {c.name: getattr(obj, c.name) for c in obj.__table__.columns}
    for k, v in list(data.items()):
        if isinstance(v, datetime):
            data[k] = v.replace(tzinfo=timezone.utc).isoformat().replace("+00:00", "Z")
    if extra:
        data.update(extra)
    return data
