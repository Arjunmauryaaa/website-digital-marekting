"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { nav, site } from "@/config/site";
import { ButtonLink } from "@/components/ui/ui";
import { Logo } from "./logo";

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the menu after any navigation.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset UI state when the route changes
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.classList.toggle("menu-open", open);
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        btnRef.current?.focus();
      }
      // Keep keyboard focus inside the open menu (button + links).
      if (e.key === "Tab") {
        const focusable = [btnRef.current, ...Array.from(menuRef.current?.querySelectorAll<HTMLElement>("a") ?? [])].filter(Boolean) as HTMLElement[];
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    const onResize = () => window.innerWidth >= 960 && setOpen(false);
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
      document.body.classList.remove("menu-open");
    };
  }, [open]);

  const current = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <>
      <header className="header" data-scrolled={scrolled || open}>
        <div className="container header__inner">
          <Logo />
          <nav className="nav" aria-label="Primary">
            {nav.map((item) => (
              <Link key={item.href} href={item.href} aria-current={current(item.href) ? "page" : undefined}>
                {item.label}
                {item.badge && <span className="nav__badge" aria-hidden="true">{item.badge}</span>}
              </Link>
            ))}
          </nav>
          <ButtonLink href="/contact" small className="header__cta">
            Let&apos;s Talk
          </ButtonLink>
          <button ref={btnRef} type="button" className="menu-btn" aria-expanded={open} aria-controls="mobile-menu" aria-label={open ? "Close menu" : "Open menu"} onClick={() => setOpen((v) => !v)}>
            <span />
          </button>
        </div>
      </header>
      <div ref={menuRef} id="mobile-menu" className="mobile-menu" data-open={open} role="dialog" aria-modal="true" aria-label={`${site.name} menu`} hidden={false} inert={!open}>
        <nav aria-label="Mobile">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} aria-current={current(item.href) ? "page" : undefined}>
              {item.label}
              {item.badge && <span className="nav__badge" aria-hidden="true">{item.badge}</span>}
            </Link>
          ))}
        </nav>
        <ButtonLink href="/contact">Let&apos;s Talk</ButtonLink>
      </div>
    </>
  );
}
