"use client";

type MarqueeProps = {
  text: string;
  className?: string;
};

export function Marquee({ text, className = "" }: MarqueeProps) {
  const chunk = text.trim();
  const content = `${chunk}  ·  ${chunk}  ·  `;

  return (
    <div
      className={`marquee-wrap overflow-hidden border-y border-[var(--line)] bg-[var(--bg-elevated)] py-3.5 md:py-4 ${className}`}
      aria-hidden
    >
      <div className="marquee-track font-display text-[clamp(1.1rem,2.5vw,1.75rem)] tracking-[0.18em] uppercase text-[var(--gold-soft)]/85">
        <span className="whitespace-nowrap px-4">{content}</span>
        <span className="whitespace-nowrap px-4">{content}</span>
      </div>
    </div>
  );
}
