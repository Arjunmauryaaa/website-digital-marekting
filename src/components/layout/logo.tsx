import Link from "next/link";
import { site } from "@/config/site";

/** Typographic logo: set the agency name once in src/config/site.ts (or NEXT_PUBLIC_AGENCY_NAME). */
export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="logo" aria-label={`${site.name} home`}>
      <span className="logo__mark" aria-hidden="true">
        {site.name.trim().charAt(0).toUpperCase()}
      </span>
      <span>{site.name}</span>
    </Link>
  );
}
