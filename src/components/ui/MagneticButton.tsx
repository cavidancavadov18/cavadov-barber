"use client";

import type {
  ReactNode,
  ButtonHTMLAttributes,
  AnchorHTMLAttributes,
} from "react";

type Common = {
  children: ReactNode;
  className?: string;
  strength?: number;
};

type AsButton = Common &
  ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };

type AsLink = Common &
  AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

export function MagneticButton(props: AsButton | AsLink) {
  const { children, className = "", strength: _strength, ...rest } = props;

  if ("href" in props && props.href) {
    const { href, ...anchorRest } = rest as AnchorHTMLAttributes<HTMLAnchorElement> & {
      href: string;
    };
    return (
      <a href={href} className={className} data-cursor="hover" {...anchorRest}>
        {children}
      </a>
    );
  }

  return (
    <button
      type="button"
      className={className}
      data-cursor="hover"
      {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}
    >
      {children}
    </button>
  );
}
