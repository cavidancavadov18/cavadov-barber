from __future__ import annotations

from datetime import datetime, timezone

from sqlalchemy import ForeignKey, Integer, String, Text, TypeDecorator, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .db import Base


class PrismaDateTime(TypeDecorator):
    """Prisma SQLite DateTime is stored as epoch milliseconds."""

    impl = Integer
    cache_ok = True

    def process_bind_param(self, value, dialect):
        if value is None:
            return None
        if isinstance(value, datetime):
            if value.tzinfo is None:
                value = value.replace(tzinfo=timezone.utc)
            return int(value.timestamp() * 1000)
        return int(value)

    def process_result_value(self, value, dialect):
        if value is None:
            return None
        if isinstance(value, datetime):
            return value
        return datetime.fromtimestamp(int(value) / 1000, tz=timezone.utc)


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class AdminUser(Base):
    __tablename__ = "AdminUser"
    id: Mapped[str] = mapped_column(String, primary_key=True)
    username: Mapped[str] = mapped_column(String, unique=True)
    passwordHash: Mapped[str] = mapped_column(String)
    createdAt: Mapped[datetime] = mapped_column(PrismaDateTime, default=utcnow)


class Barber(Base):
    __tablename__ = "Barber"
    id: Mapped[str] = mapped_column(String, primary_key=True)
    slug: Mapped[str] = mapped_column(String, unique=True)
    nameAz: Mapped[str] = mapped_column(String)
    nameEn: Mapped[str] = mapped_column(String)
    roleAz: Mapped[str] = mapped_column(String)
    roleEn: Mapped[str] = mapped_column(String)
    bioAz: Mapped[str] = mapped_column(Text)
    bioEn: Mapped[str] = mapped_column(Text)
    image: Mapped[str] = mapped_column(String)
    experience: Mapped[int] = mapped_column(Integer)
    createdAt: Mapped[datetime] = mapped_column(PrismaDateTime, default=utcnow)
    bookings = relationship("Booking", back_populates="barber")


class Service(Base):
    __tablename__ = "Service"
    id: Mapped[str] = mapped_column(String, primary_key=True)
    slug: Mapped[str] = mapped_column(String, unique=True)
    nameAz: Mapped[str] = mapped_column(String)
    nameEn: Mapped[str] = mapped_column(String)
    descriptionAz: Mapped[str] = mapped_column(Text)
    descriptionEn: Mapped[str] = mapped_column(Text)
    price: Mapped[int] = mapped_column(Integer)
    priceNoteAz: Mapped[str | None] = mapped_column(String, nullable=True)
    priceNoteEn: Mapped[str | None] = mapped_column(String, nullable=True)
    durationMin: Mapped[int] = mapped_column(Integer)
    image: Mapped[str] = mapped_column(String)
    sortOrder: Mapped[int] = mapped_column(Integer, default=0)
    createdAt: Mapped[datetime] = mapped_column(PrismaDateTime, default=utcnow)
    bookings = relationship("Booking", back_populates="service")


class Booking(Base):
    __tablename__ = "Booking"
    __table_args__ = (UniqueConstraint("barberId", "date", "time"),)

    id: Mapped[str] = mapped_column(String, primary_key=True)
    barberId: Mapped[str] = mapped_column(String, ForeignKey("Barber.id"))
    serviceId: Mapped[str] = mapped_column(String, ForeignKey("Service.id"))
    customerName: Mapped[str] = mapped_column(String)
    phone: Mapped[str] = mapped_column(String)
    date: Mapped[str] = mapped_column(String)
    time: Mapped[str] = mapped_column(String)
    locale: Mapped[str] = mapped_column(String, default="az")
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String, default="pending")
    createdAt: Mapped[datetime] = mapped_column(PrismaDateTime, default=utcnow)

    barber = relationship("Barber", back_populates="bookings")
    service = relationship("Service", back_populates="bookings")


class GalleryItem(Base):
    __tablename__ = "GalleryItem"
    id: Mapped[str] = mapped_column(String, primary_key=True)
    src: Mapped[str] = mapped_column(String)
    alt: Mapped[str] = mapped_column(String)
    labelAz: Mapped[str] = mapped_column(String)
    labelEn: Mapped[str] = mapped_column(String)
    focus: Mapped[str] = mapped_column(String, default="object-center")
    sortOrder: Mapped[int] = mapped_column(Integer, default=0)
    createdAt: Mapped[datetime] = mapped_column(PrismaDateTime, default=utcnow)


class Review(Base):
    __tablename__ = "Review"
    id: Mapped[str] = mapped_column(String, primary_key=True)
    nameAz: Mapped[str] = mapped_column(String)
    nameEn: Mapped[str] = mapped_column(String)
    textAz: Mapped[str] = mapped_column(Text)
    textEn: Mapped[str] = mapped_column(Text)
    rating: Mapped[int] = mapped_column(Integer, default=5)
    sortOrder: Mapped[int] = mapped_column(Integer, default=0)
    createdAt: Mapped[datetime] = mapped_column(PrismaDateTime, default=utcnow)


class TikTokVideo(Base):
    __tablename__ = "TikTokVideo"
    id: Mapped[str] = mapped_column(String, primary_key=True)
    tiktokId: Mapped[str] = mapped_column(String, unique=True)
    url: Mapped[str] = mapped_column(String)
    cover: Mapped[str] = mapped_column(String)
    titleAz: Mapped[str] = mapped_column(String)
    titleEn: Mapped[str] = mapped_column(String)
    focus: Mapped[str] = mapped_column(String, default="object-center")
    sortOrder: Mapped[int] = mapped_column(Integer, default=0)
    createdAt: Mapped[datetime] = mapped_column(PrismaDateTime, default=utcnow)


class BeforeAfter(Base):
    __tablename__ = "BeforeAfter"
    id: Mapped[str] = mapped_column(String, primary_key=True)
    before: Mapped[str] = mapped_column(String)
    after: Mapped[str] = mapped_column(String)
    captionAz: Mapped[str] = mapped_column(String)
    captionEn: Mapped[str] = mapped_column(String)
    tiktokUrl: Mapped[str | None] = mapped_column(String, nullable=True)
    sortOrder: Mapped[int] = mapped_column(Integer, default=0)
    createdAt: Mapped[datetime] = mapped_column(PrismaDateTime, default=utcnow)


class WorkItem(Base):
    __tablename__ = "WorkItem"
    id: Mapped[str] = mapped_column(String, primary_key=True)
    kind: Mapped[str] = mapped_column(String, default="tile")
    src: Mapped[str] = mapped_column(String)
    alt: Mapped[str] = mapped_column(String)
    labelAz: Mapped[str] = mapped_column(String)
    labelEn: Mapped[str] = mapped_column(String)
    sortOrder: Mapped[int] = mapped_column(Integer, default=0)
    createdAt: Mapped[datetime] = mapped_column(PrismaDateTime, default=utcnow)


class SiteSettings(Base):
    __tablename__ = "SiteSettings"
    id: Mapped[str] = mapped_column(String, primary_key=True, default="main")
    addressAz: Mapped[str] = mapped_column(String)
    addressEn: Mapped[str] = mapped_column(String)
    phoneDisplay: Mapped[str] = mapped_column(String)
    phoneTel: Mapped[str] = mapped_column(String)
    whatsapp: Mapped[str] = mapped_column(String)
    email: Mapped[str] = mapped_column(String)
    hoursAz: Mapped[str] = mapped_column(String)
    hoursEn: Mapped[str] = mapped_column(String)
    weekdayStart: Mapped[int] = mapped_column(Integer, default=10)
    weekdayEnd: Mapped[int] = mapped_column(Integer, default=24)
    sundayStart: Mapped[int] = mapped_column(Integer, default=10)
    sundayEnd: Mapped[int] = mapped_column(Integer, default=24)
    mapEmbedUrl: Mapped[str] = mapped_column(String)
    tiktokProfile: Mapped[str] = mapped_column(String)
    heroVideo: Mapped[str] = mapped_column(String)
    heroImage: Mapped[str] = mapped_column(String)
    aboutImage: Mapped[str] = mapped_column(String)
    brandAvatar: Mapped[str] = mapped_column(String)
    updatedAt: Mapped[datetime] = mapped_column(PrismaDateTime, default=utcnow, onupdate=utcnow)
