import type { ServiceIcon } from "@/content/services";

export const Arrow = ({ className = "arrow" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12h14m-6-6 6 6-6 6" />
  </svg>
);

export const Check = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </svg>
);

const paths: Record<ServiceIcon | "compass" | "pen" | "link" | "chat", React.ReactNode> = {
  social: (
    <>
      <rect x="4" y="3" width="16" height="18" rx="4" />
      <circle cx="12" cy="11" r="3.5" />
      <circle cx="16.8" cy="6.8" r=".6" />
      <path d="M8 17.5h8" />
    </>
  ),
  web: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="3" />
      <path d="M3 9h18M7 6.5h.01M10 6.5h.01" />
      <path d="m9 15 2-2-2-2m4 4h3" />
    </>
  ),
  ads: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="12" cy="12" r="1" />
      <path d="M12 3.5V1m8.5 11H23" />
    </>
  ),
  seo: (
    <>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m15.5 15.5 5 5M7.5 12.5l2-2.5 2 1.5 2.5-3" />
    </>
  ),
  content: (
    <>
      <path d="M4 20 9 9l6 6-11 5Z" />
      <path d="m14 6 4 4M17 3l4 4-3 3-4-4 3-3Z" />
    </>
  ),
  leads: (
    <>
      <path d="M3 5h18l-7 8.5V20l-4-2v-4.5L3 5Z" />
    </>
  ),
  compass: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m15.5 8.5-2 5-5 2 2-5 5-2Z" />
    </>
  ),
  pen: (
    <>
      <path d="m4 20 1-4L16.5 4.5a2.1 2.1 0 0 1 3 3L8 19l-4 1Z" />
      <path d="m14.5 6.5 3 3" />
    </>
  ),
  link: (
    <>
      <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1" />
      <path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" />
    </>
  ),
  chat: (
    <>
      <path d="M4 5h16v11H9l-5 4V5Z" />
      <path d="M8 9.5h8M8 12.5h5" />
    </>
  ),
};

export const Icon = ({ name }: { name: keyof typeof paths }) => (
  <span className="card__icon" aria-hidden="true">
    <svg viewBox="0 0 24 24">{paths[name]}</svg>
  </span>
);
