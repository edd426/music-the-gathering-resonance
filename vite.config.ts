import { defineConfig } from "vite";

export default defineConfig({
  root: ".",
  publicDir: "public",
  base: "/music-the-gathering-resonance/",
  build: {
    outDir: "dist",
  },
});
