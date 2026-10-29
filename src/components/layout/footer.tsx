import Link from "next/link";
import { site } from "@/config/site";
import { services } from "@/content/services";
import { CookieButton } from "./consent";
import { Logo } from "./logo";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__grid">
          <div>
            <Logo />
            <p>{site.tagline}. Digital strategy, creative execution, and development, working together for ambitious businesses.</p>
          </div>
          <nav aria-label="Explore">
            <h2>Explore</h2>
            <ul>
              <li><Link href="/">Home</Link></li>
              <li><Link href="/about">About</Link></li>
              <li><Link href="/work">Our Work</Link></li>
              <li><Link href="/insights">Insights</Link></li>
              <li><Link href="/tools">Free AI tools</Link></li>
              <li><Link href="/process">Process</Link></li>
              <li><Link href="/contact">Contact</Link></li>
            </ul>
          </nav>
          <nav aria-label="Services">
            <h2>Services</h2>
            <ul>
              {services.map((s) => (
                <li key={s.slug}>
                  <Link href={`/services/${s.slug}`}>{s.page.title.replace("Design and ", "").replace("Search Engine Optimization", "SEO")}</Link>
                </li>
              ))}
            </ul>
          </nav>
          <div>
            <h2>Contact</h2>
            <ul>
              <li>
                {site.email ? <a href={`mailto:${site.email}`}>{site.email}</a> : <span className="placeholder">{site.emailPlaceholder} (placeholder)</span>}
              </li>
              {site.socials.map((s) => (
                <li key={s.label}>{s.href ? <a href={s.href} target="_blank" rel="noopener noreferrer">{s.label}<span className="visually-hidden"> (opens in a new tab)</span></a> : <span className="placeholder">{s.label} (placeholder)</span>}</li>
              ))}
            </ul>
          </div>
        </div>
        {(site.legal.name || site.legal.registration || site.legal.location || site.profiles.some((p) => p.href)) && (
          <div className="footer__trust">
            {site.legal.name && <span>{site.legal.name}</span>}
            {site.legal.registration && <span>Reg. {site.legal.registration}</span>}
            {site.legal.location && <span>{site.legal.location}</span>}
            {site.profiles.filter((p) => p.href && p.label !== "LinkedIn").map((p) => (
              <a key={p.label} href={p.href} target="_blank" rel="noopener noreferrer">{p.label}<span className="visually-hidden"> (opens in a new tab)</span></a>
            ))}
          </div>
        )}
        <div className="footer__base">
          <p style={{ margin: 0, maxWidth: "none" }}>
            © {year} {site.name}. All rights reserved.
          </p>
          <ul className="footer__legal" style={{ display: "flex" }}>
            <li><Link href="/privacy">Privacy Policy</Link></li>
            <li><Link href="/terms">Terms of Service</Link></li>
            <li><CookieButton /></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
