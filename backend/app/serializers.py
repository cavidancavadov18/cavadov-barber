from __future__ import annotations

from .utils import row_to_dict


def serialize_booking(booking, *, include_relations: bool = False) -> dict:
    data = row_to_dict(booking)
    if include_relations:
        if booking.service is not None:
            data["service"] = {
                "id": booking.service.id,
                "nameAz": booking.service.nameAz,
                "price": booking.service.price,
            }
        if booking.barber is not None:
            data["barber"] = {
                "id": booking.barber.id,
                "nameAz": booking.barber.nameAz,
            }
    return data
