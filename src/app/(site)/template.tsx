import type { ReactNode } from 'react';

/** Re-mounts on every navigation, so each route change gets the same soft entrance (pure CSS). */
export default function SiteTemplate({ children }: { children: ReactNode }) {
  return <div className="page-enter">{children}</div>;
}
