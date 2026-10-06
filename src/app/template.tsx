import RouteTransition from "@/components/RouteTransition";

/**
 * Re-mounts on every navigation, so RouteTransition can play its sweep and
 * fade for client-side page changes (and stay out of the way on first load).
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return <RouteTransition>{children}</RouteTransition>;
}
