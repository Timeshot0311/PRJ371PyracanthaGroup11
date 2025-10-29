import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteTsConfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";
import viteReact from "@vitejs/plugin-react";

const config = defineConfig({
  plugins: [
    viteTsConfigPaths({
      projects: ["./tsconfig.json"],
    }),
    tailwindcss(),
    tanstackStart({
      customViteReactPlugin: true,
    }),
    viteReact(),
  ],

  server: {
    port: 3000,
    host: true,                 // allow LAN/dev-tunnels if you want
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
      },
    },
  },
  preview: {
    host: true,
    port: 3000,
  },
});

export default config;
