export function getWhatsAppNumber(override?: string | null) {
  return (
    override ||
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ||
    process.env.WHATSAPP_NUMBER ||
    "994553535368"
  ).replace(/\D/g, "");
}

export function buildWhatsAppUrl(message: string, override?: string | null) {
  const phone = getWhatsAppNumber(override);
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

export function bookingWhatsAppMessage(params: {
  locale: string;
  customerName: string;
  phone: string;
  serviceName: string;
  barberName: string;
  date: string;
  time: string;
  notes?: string;
  price?: number;
}) {
  if (params.locale === "en") {
    const lines = [
      "CAVADOV BARBER — New booking request",
      "",
      `Name: ${params.customerName}`,
      `Phone: ${params.phone}`,
      `Service: ${params.serviceName}${params.price != null ? ` (${params.price} AZN)` : ""}`,
      `Barber: ${params.barberName}`,
      `Date: ${params.date}`,
      `Time: ${params.time}`,
    ];
    if (params.notes) lines.push(`Notes: ${params.notes}`);
    lines.push("", "Please reply to CONFIRM or CANCEL this booking.");
    return lines.join("\n");
  }

  const lines = [
    "CAVADOV BARBER — Yeni rezervasiya sorğusu",
    "",
    `Ad: ${params.customerName}`,
    `Telefon: ${params.phone}`,
    `Xidmət: ${params.serviceName}${params.price != null ? ` (${params.price} AZN)` : ""}`,
    `Usta: ${params.barberName}`,
    `Tarix: ${params.date}`,
    `Saat: ${params.time}`,
  ];
  if (params.notes) lines.push(`Qeyd: ${params.notes}`);
  lines.push("", "Zəhmət olmasa TƏSDİQLƏ və ya LƏĞV ET yazaraq cavab verin.");
  return lines.join("\n");
}

export function normalizePhone(input: string) {
  const digits = input.replace(/\D/g, "");
  if (digits.startsWith("994") && digits.length >= 12) return `+${digits}`;
  if (digits.startsWith("0") && digits.length === 10) return `+994${digits.slice(1)}`;
  if (digits.length === 9) return `+994${digits}`;
  if (input.trim().startsWith("+")) return `+${digits}`;
  return digits ? `+${digits}` : "";
}
