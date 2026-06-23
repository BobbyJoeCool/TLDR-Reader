import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Change 'tldr-reader' to match your GitHub repo name
export default defineConfig({
  plugins: [react()],
  base: "/tldr-reader/",
});
