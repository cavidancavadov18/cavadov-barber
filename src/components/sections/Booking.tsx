"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import type { BarberItem } from "@/components/sections/Barbers";
import type { ServiceItem } from "@/components/sections/Services";
import { todayInBaku } from "@/lib/slots";
import { SectionReveal } from "@/components/ui/SectionReveal";
import { StaggerText } from "@/components/ui/StaggerText";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";

type BookingProps = {
  services: ServiceItem[];
  barbers: BarberItem[];
};

type SuccessPayload = {
  whatsappUrl: string;
};

const steps = ["service", "barber", "datetime", "details"] as const;

export function Booking({ services, barbers }: BookingProps) {
  const t = useTranslations("booking");
  const locale = useLocale();
  const [step, setStep] = useState(0);
  const [serviceId, setServiceId] = useState("");
  const [barberId, setBarberId] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [slots, setSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<SuccessPayload | null>(null);

  const minDate = useMemo(() => todayInBaku(), []);

  useEffect(() => {
    const applyHash = () => {
      const raw = window.location.hash.replace(/^#/, "");
      const [, query = ""] = raw.split("?");
      const params = new URLSearchParams(query);
      const serviceSlug = params.get("service");
      const barberSlug = params.get("barber");
      if (serviceSlug) {
        const found = services.find((s) => s.slug === serviceSlug);
        if (found) {
          setServiceId(found.id);
          setStep(1);
        }
      }
      if (barberSlug) {
        const found = barbers.find((b) => b.slug === barberSlug);
        if (found) {
          setBarberId(found.id);
          setStep((s) => Math.max(s, 2));
        }
      }
    };

    applyHash();
    window.addEventListener("hashchange", applyHash);
    return () => window.removeEventListener("hashchange", applyHash);
  }, [services, barbers]);

  // Auto-select sole barber when entering barber step
  useEffect(() => {
    if (step === 1 && barbers.length === 1 && !barberId) {
      setBarberId(barbers[0].id);
    }
  }, [step, barbers, barberId]);

  useEffect(() => {
    if (!barberId || !date) {
      setSlots([]);
      return;
    }
    let cancelled = false;
    setLoadingSlots(true);
    const qs = new URLSearchParams({
      barberId,
      date,
      ...(serviceId ? { serviceId } : {}),
    });
    fetch(`/api/bookings/slots?${qs}`)
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error || "slots");
        return data;
      })
      .then((data) => {
        if (!cancelled) {
          setSlots(data.slots || []);
          setTime("");
        }
      })
      .catch(() => {
        if (!cancelled) setSlots([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingSlots(false);
      });
    return () => {
      cancelled = true;
    };
  }, [barberId, date, serviceId]);

  const selectedService = services.find((s) => s.id === serviceId);
  const selectedBarber = barbers.find((b) => b.id === barberId);
  const progress = ((step + 1) / steps.length) * 100;

  const canNext = () => {
    if (step === 0) return Boolean(serviceId);
    if (step === 1) return Boolean(barberId);
    if (step === 2) return Boolean(date && time);
    return Boolean(name.trim().length >= 2 && phone.trim().length >= 7);
  };

  function goNext() {
    if (!canNext()) return;
    setError("");
    setStep((s) => Math.min(steps.length - 1, s + 1));
  }

  function selectService(id: string) {
    setServiceId(id);
    setError("");
  }

  function selectBarber(id: string) {
    setBarberId(id);
    setError("");
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (step !== steps.length - 1) {
      goNext();
      return;
    }
    if (!canNext()) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId,
          barberId,
          date,
          time,
          customerName: name.trim(),
          phone: phone.trim(),
          notes: notes.trim() || undefined,
          locale,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t("error"));
      setSuccess({ whatsappUrl: data.whatsappUrl });
      // Open WhatsApp confirmation for the shop
      window.open(data.whatsappUrl, "_blank", "noopener,noreferrer");
    } catch (err) {
      setError(err instanceof Error ? err.message : t("error"));
    } finally {
      setSubmitting(false);
    }
  }

  if (!services.length || !barbers.length) {
    return (
      <section id="booking" className="section-pad section-y">
        <div className="container-site max-w-[1100px]">
          <p className="text-[var(--danger)]">{t("error")}</p>
        </div>
      </section>
    );
  }

  return (
    <section id="booking" className="section-pad section-y relative scroll-mt-24">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(700px_300px_at_20%_0%,rgba(201,168,76,0.07),transparent)]" />
      <div className="relative container-site max-w-[1100px]">
        <SectionReveal>
          <p className="eyebrow">{t("eyebrow")}</p>
          <StaggerText text={t("title")} className="heading-lg mt-4" />
          <p className="mt-5 max-w-xl text-[var(--text-muted)]">{t("subtitle")}</p>
        </SectionReveal>

        <SectionReveal delay={0.08} className="mt-12">
          {success ? (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="border border-[var(--line)] bg-[var(--surface)] p-8 text-center md:p-12"
            >
              <p className="font-display text-3xl text-[var(--gold-soft)]">{t("successTitle")}</p>
              <p className="mt-4 text-[var(--text-muted)]">{t("successText")}</p>
              <a
                href={success.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary mt-8 inline-flex items-center gap-2"
                data-cursor="hover"
              >
                <WhatsAppIcon size={18} />
                <span>{t("whatsapp")}</span>
              </a>
              <button
                type="button"
                className="btn-ghost mt-4 inline-flex"
                onClick={() => {
                  setSuccess(null);
                  setStep(0);
                  setServiceId("");
                  setBarberId(barbers.length === 1 ? barbers[0].id : "");
                  setDate("");
                  setTime("");
                  setName("");
                  setPhone("");
                  setNotes("");
                }}
              >
                {locale === "en" ? "New booking" : "Yeni rezervasiya"}
              </button>
            </motion.div>
          ) : (
            <form
              onSubmit={onSubmit}
              className="overflow-hidden border border-[var(--line)] bg-[var(--surface)]"
            >
              <div className="booking-progress">
                <span style={{ width: `${progress}%` }} />
              </div>

              <div className="p-5 md:p-8">
                <ol className="mb-8 grid grid-cols-2 gap-2 md:grid-cols-4">
                  {steps.map((key, i) => {
                    const reachable = i <= step || (i < step + 1 && canNext());
                    const clickable = i < step;
                    return (
                      <li key={key}>
                        <button
                          type="button"
                          disabled={!clickable}
                          onClick={() => clickable && setStep(i)}
                          className={`w-full border px-3 py-2 text-left text-[0.65rem] uppercase tracking-[0.14em] transition ${
                            i === step
                              ? "border-[var(--gold)] text-[var(--gold-soft)]"
                              : i < step
                                ? "border-[var(--gold)]/40 text-[var(--text)] hover:border-[var(--gold)]"
                                : "border-[var(--line)] text-[var(--text-muted)]"
                          } ${clickable ? "cursor-pointer" : "cursor-default"}`}
                        >
                          <span className="mr-1 text-[var(--gold)]">{i + 1}.</span>
                          {t(`steps.${key}`)}
                          {!reachable && i === step ? null : null}
                        </button>
                      </li>
                    );
                  })}
                </ol>

                {(selectedService || selectedBarber) && (
                  <div className="mb-6 flex flex-wrap gap-2 border border-[var(--line)] bg-black/25 px-4 py-3 text-sm text-[var(--text-muted)]">
                    {selectedService && (
                      <span className="text-[var(--gold-soft)]">
                        {locale === "en" ? selectedService.nameEn : selectedService.nameAz}
                        <span className="text-[var(--text-muted)]">
                          {" "}
                          ·{" "}
                          {(locale === "en"
                            ? selectedService.priceNoteEn
                            : selectedService.priceNoteAz) ||
                            `${selectedService.price} ${t("azn")}`}
                        </span>
                      </span>
                    )}
                    {selectedBarber && (
                      <span>
                        · {locale === "en" ? selectedBarber.nameEn : selectedBarber.nameAz}
                      </span>
                    )}
                    {date && time && (
                      <span>
                        · {date} {time}
                      </span>
                    )}
                  </div>
                )}

                <AnimatePresence mode="wait">
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 18 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -14 }}
                    transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                  >
                    {step === 0 && (
                      <div>
                        <p className="mb-4 text-sm text-[var(--text-muted)]">{t("selectService")}</p>
                        <div className="grid gap-3 sm:grid-cols-2">
                          {services.map((service) => {
                            const label = locale === "en" ? service.nameEn : service.nameAz;
                            const active = serviceId === service.id;
                            return (
                              <button
                                key={service.id}
                                type="button"
                                onClick={() => selectService(service.id)}
                                onDoubleClick={() => {
                                  selectService(service.id);
                                  setStep(1);
                                }}
                                data-cursor="hover"
                                className={`flex gap-3 border p-3 text-left ${
                                  active
                                    ? "border-[var(--gold)] bg-[rgba(201,168,76,0.08)]"
                                    : "border-[var(--line)] hover:border-[var(--gold-dim)]"
                                }`}
                              >
                                <div className="media-frame media-frame--thumb overflow-hidden">
                                  <Image
                                    src={service.image}
                                    alt={label}
                                    fill
                                    sizes="64px"
                                    className="media-img"
                                  />
                                </div>
                                <div>
                                  <p className="font-display text-lg text-[var(--gold-soft)]">
                                    {label}
                                  </p>
                                  <p className="mt-1 text-sm text-[var(--text-muted)]">
                                    {(locale === "en"
                                      ? service.priceNoteEn
                                      : service.priceNoteAz) ||
                                      `${service.price} ${t("azn")}`}{" "}
                                    · {service.durationMin} {locale === "en" ? "min" : "dəq"}
                                  </p>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                        {!serviceId && (
                          <p className="mt-3 text-xs text-[var(--gold)]">
                            {locale === "en"
                              ? "Select a service to continue"
                              : "Davam etmək üçün xidmət seçin"}
                          </p>
                        )}
                      </div>
                    )}

                    {step === 1 && (
                      <div>
                        <p className="mb-4 text-sm text-[var(--text-muted)]">{t("selectBarber")}</p>
                        <div className="grid gap-3 sm:grid-cols-2">
                          {barbers.map((barber) => {
                            const label = locale === "en" ? barber.nameEn : barber.nameAz;
                            const role = locale === "en" ? barber.roleEn : barber.roleAz;
                            const active = barberId === barber.id;
                            return (
                              <button
                                key={barber.id}
                                type="button"
                                onClick={() => selectBarber(barber.id)}
                                onDoubleClick={() => {
                                  selectBarber(barber.id);
                                  setStep(2);
                                }}
                                data-cursor="hover"
                                className={`flex gap-3 border p-3 text-left ${
                                  active
                                    ? "border-[var(--gold)] bg-[rgba(201,168,76,0.08)]"
                                    : "border-[var(--line)] hover:border-[var(--gold-dim)]"
                                }`}
                              >
                                <div className="media-frame media-frame--thumb overflow-hidden">
                                  <Image
                                    src={barber.image}
                                    alt={label}
                                    fill
                                    sizes="64px"
                                    className="media-img"
                                  />
                                </div>
                                <div>
                                  <p className="font-display text-lg text-[var(--gold-soft)]">
                                    {label}
                                  </p>
                                  <p className="mt-1 text-sm text-[var(--text-muted)]">{role}</p>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {step === 2 && (
                      <div className="grid gap-6 md:grid-cols-2">
                        <label className="block">
                          <span className="text-xs uppercase tracking-[0.18em] text-[var(--gold)]">
                            {t("selectDate")}
                          </span>
                          <input
                            type="date"
                            min={minDate}
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="field-input"
                            required
                          />
                        </label>
                        <div>
                          <p className="text-xs uppercase tracking-[0.18em] text-[var(--gold)]">
                            {t("selectTime")}
                          </p>
                          <div className="mt-2 grid max-h-56 grid-cols-3 gap-2 overflow-y-auto sm:grid-cols-4">
                            {!date && (
                              <p className="col-span-full text-sm text-[var(--text-muted)]">
                                {locale === "en" ? "Pick a date first" : "Əvvəlcə tarix seçin"}
                              </p>
                            )}
                            {loadingSlots && (
                              <p className="col-span-full text-sm text-[var(--text-muted)]">
                                {locale === "en" ? "Loading slots..." : "Slotlar yüklənir..."}
                              </p>
                            )}
                            {!loadingSlots && date && slots.length === 0 && (
                              <p className="col-span-full text-sm text-[var(--text-muted)]">
                                {t("noSlots")}
                              </p>
                            )}
                            {slots.map((slot) => (
                              <button
                                key={slot}
                                type="button"
                                onClick={() => setTime(slot)}
                                data-cursor="hover"
                                className={`border px-2 py-2 text-sm ${
                                  time === slot
                                    ? "border-[var(--gold)] text-[var(--gold-soft)]"
                                    : "border-[var(--line)] text-[var(--text)] hover:border-[var(--gold-dim)]"
                                }`}
                              >
                                {slot}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {step === 3 && (
                      <div className="grid gap-5 md:grid-cols-2">
                        <label className="block">
                          <span className="text-xs uppercase tracking-[0.18em] text-[var(--gold)]">
                            {t("name")}
                          </span>
                          <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="field-input"
                            autoComplete="name"
                            required
                          />
                        </label>
                        <label className="block">
                          <span className="text-xs uppercase tracking-[0.18em] text-[var(--gold)]">
                            {t("phone")}
                          </span>
                          <input
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="+994 55 353 53 68"
                            inputMode="tel"
                            autoComplete="tel"
                            className="field-input"
                            required
                          />
                        </label>
                        <label className="block md:col-span-2">
                          <span className="text-xs uppercase tracking-[0.18em] text-[var(--gold)]">
                            {t("notes")}
                          </span>
                          <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={3}
                            className="field-input resize-none"
                          />
                        </label>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>

                {error && <p className="mt-4 text-sm text-[var(--danger)]">{error}</p>}

                <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--line)] pt-6">
                  <button
                    type="button"
                    className="btn-ghost"
                    disabled={step === 0 || submitting}
                    onClick={() => {
                      setError("");
                      setStep((s) => Math.max(0, s - 1));
                    }}
                    data-cursor="hover"
                  >
                    {t("back")}
                  </button>
                  {step < steps.length - 1 ? (
                    <button
                      type="button"
                      className="btn-primary"
                      disabled={!canNext() || submitting}
                      onClick={goNext}
                      data-cursor="hover"
                    >
                      <span>{t("next")}</span>
                    </button>
                  ) : (
                    <button
                      type="submit"
                      className="btn-primary"
                      disabled={!canNext() || submitting}
                      data-cursor="hover"
                    >
                      <span>{submitting ? t("submitting") : t("submit")}</span>
                    </button>
                  )}
                </div>
              </div>
            </form>
          )}
        </SectionReveal>
      </div>
    </section>
  );
}
