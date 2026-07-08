import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

// Targeted, logic-first testing (issue #53): pure functions run in a plain Node
// environment — no jsdom/React until a component genuinely needs it. The `@/` alias
// mirrors tsconfig `paths` so tests import modules the same way the app does.
export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL(".", import.meta.url)).replace(/\/$/, ""),
    },
  },
  test: {
    environment: "node",
    include: ["**/*.test.ts"],
  },
});
