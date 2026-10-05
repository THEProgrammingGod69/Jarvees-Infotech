/**
 * Re-mounts on every navigation, so its CSS entrance replays as a page
 * transition. CSS rather than Framer Motion: the animation must not wait
 * for hydration, or the page would sit invisible on a slow phone.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="page-enter">{children}</div>;
}
