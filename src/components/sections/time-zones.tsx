"use client";

import { useEffect, useState } from "react";
import { formatClock, inBusinessHours, MARKET_ZONES, parseHours } from "@/lib/time";

/** Clocks render after mount, so the server HTML never disagrees with the visitor's actual time. */
export function TimeZones({ agencyTz, hours }: { agencyTz?: string; hours: string }) {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the current time is only known in the browser
    setNow(new Date());
    const id = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(id);
  }, []);

  const range = parseHours(hours);
  let agencyOpen: boolean | null = null;
  if (agencyTz && now) {
    try {
      agencyOpen = inBusinessHours(agencyTz, now, range);
    } catch {
      agencyOpen = null; // an invalid time zone in config should never break the page
    }
  }

  return (
    <div className="clocks">
      <ul className="clocks__list">
        {MARKET_ZONES.map((z) => {
          const open = now ? inBusinessHours(z.tz, now) : false;
          const overlap = agencyOpen !== null && agencyOpen && open;
          return (
            <li className="clock" key={z.tz}>
              <span className="clock__city">{z.label}</span>
              <time className="clock__time" suppressHydrationWarning>{now ? formatClock(z.tz, now) : "--:--"}</time>
              <span className={`clock__state${open ? " is-open" : ""}`}>
                {now ? (open ? (overlap ? "Business hours · we overlap now" : "Business hours") : "Outside business hours") : " "}
              </span>
            </li>
          );
        })}
      </ul>
      <p className="fine">
        {agencyTz ? `We work ${hours.replace("-", "–")} (${agencyTz.replace("_", " ")}), Monday to Friday, and plan calls around your day.` : "Times shown are local business hours (Monday to Friday, 9:00–18:00) in each market."}
      </p>
    </div>
  );
}
