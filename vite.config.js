import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    watch: {
      ignored: (p) => {
        const norm = p.replace(/\\/g, "/");
        if (/(^|\/)assets\//.test(norm) && !/(^|\/)src\/assets\//.test(norm))
          return true;
        if (/\/dev-server\d*\.log$/.test(norm)) return true;
        return false;
      },
    },
  },
});
