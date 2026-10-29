/** Re-mounts on every navigation, so the soft fade (see globals.css) replays for each page. Disabled for reduced motion. */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="page-fade">{children}</div>;
}
