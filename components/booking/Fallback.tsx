import { Suspense, type ReactNode } from "react";
import { LoadState, Shell } from "./kit";

/**
 * Dynamic segments are read inside Suspense (Cache Components): the booking shell and
 * a skeleton prerender, and the screen streams in once the params resolve.
 */
export function WithParams({ children }: { children: ReactNode }) {
  return (
    <Suspense
      fallback={
        <Shell>
          <LoadState error={null} />
        </Shell>
      }
    >
      {children}
    </Suspense>
  );
}
