import { ConvexProvider, ConvexReactClient } from "convex/react";
import type { ReactNode } from "react";

const convexUrl = import.meta.env.VITE_CONVEX_URL;
if (!convexUrl) {
    console.error("VITE_CONVEX_URL environment variable is not set!");
}
const convex = new ConvexReactClient(convexUrl as string);

export function ConvexClientProvider({ children }: { children: ReactNode }) {
    return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}
