import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/cli/index.ts", "src/index.ts"],
  format: ["esm"],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  outDir: "dist",
  loader: {
    ".kusto": "text",
    ".tf": "text",
    ".sh": "text",
    ".ini": "text",
    ".tfvars": "text",
  },
});
