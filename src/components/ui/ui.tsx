import Link from "next/link";
import type { ReactNode } from "react";
import { Arrow } from "./icons";

type BtnProps = { href: string; children: ReactNode; variant?: "primary" | "ghost" | "ghost-dark"; small?: boolean; arrow?: boolean; external?: boolean; className?: string };

export function ButtonLink({ href, children, variant = "primary", small, arrow = true, external, className = "" }: BtnProps) {
  const cls = `btn btn--${variant}${small ? " btn--sm" : ""} ${className}`.trim();
  const inner = (
    <>
      {children}
      {arrow && <Arrow />}
    </>
  );
  return external ? (
    <a className={cls} href={href} target="_blank" rel="noopener noreferrer">
      {inner}
      <span className="visually-hidden"> (opens in a new tab)</span>
    </a>
  ) : (
    <Link className={cls} href={href}>
      {inner}
    </Link>
  );
}

export function SectionHead({ eyebrow, title, children, center, as: Tag = "h2", id }: { eyebrow?: string; title: ReactNode; children?: ReactNode; center?: boolean; as?: "h1" | "h2"; id?: string }) {
  return (
    <header className={`section-head${center ? " section-head--center" : ""}`} data-reveal>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <Tag className="h2" id={id}>
        {title}
      </Tag>
      {children && <p className="lede">{children}</p>}
    </header>
  );
}
