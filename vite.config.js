import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "node:url";

export default defineConfig(() => ({
   plugins: [tailwindcss(), react()],
   base: "/",
   resolve: {
      alias: {
         "@": fileURLToPath(new URL("./src", import.meta.url)),
         "@components": fileURLToPath(
            new URL("./src/components", import.meta.url),
         ),
         "@pages": fileURLToPath(new URL("./src/pages", import.meta.url)),
         "@assets": fileURLToPath(new URL("./src/assets", import.meta.url)),
         "@utils": fileURLToPath(new URL("./src/utils", import.meta.url)),
         "@data": fileURLToPath(new URL("./src/data", import.meta.url)),
      },
   },
   server: {
      port: 3000,
      open: true,
      // Beim Entwickeln zeigen `/api/...` auf den echten Worker. Ohne das
      // beantwortet der Dev-Server die Anfrage selbst, die Seite fällt auf den
      // Listenpreis zurück und ein Rabattcode lässt sich lokal nie prüfen —
      // was aussieht, als wäre der Code ungültig.
      //
      // Die Seite ruft bewusst RELATIV auf (`/api/preise`): Im Betrieb liegen
      // Website und Worker auf derselben Zone, und eine eingebaute Domain
      // wäre auf `.com` die falsche.
      proxy: {
         "/api": {
            target: "https://vidiverify.de",
            changeOrigin: true,
         },
         /* Der Sandkasten-Worker, nur beim Entwickeln.
          *
          * Ein Testkauf über Paddle landet in der Sandkasten-Ablage; die
          * Erfolgsansicht muss dort nachfragen und nicht beim Wirk-Worker,
          * sonst wartet sie auf eine Lizenz, die woanders liegt. Der Umweg
          * über den Proxy statt der vollen Adresse hält den Abruf beim
          * gleichen Ursprung - `/api/lizenz` gibt bewusst keine CORS-Freigabe
          * heraus, und daran soll sich für den Wirkbetrieb nichts ändern.
          *
          * In der gebauten Seite gibt es diesen Pfad nicht: Dort läuft
          * entweder das Wirkkonto oder gar kein Kauf (`utils/paddle.ts`).
          */
         "/sandkasten-api": {
            target: "https://vidiverify-lizenz-sandkasten.vidiverify.workers.dev",
            changeOrigin: true,
            rewrite: (pfad) => pfad.replace(/^\/sandkasten-api/, "/api"),
         },
      },
   },
   build: {
      outDir: "build",
      sourcemap: false,
      target: "esnext",
      minify: "esbuild",
      cssCodeSplit: true,
      rollupOptions: {
         output: {
            manualChunks: {
               vendor: ["react", "react-dom"],
               icons: ["react-icons", "lucide-react"],
               animations: ["motion"],
               threejs: ["three", "@react-three/fiber", "@react-three/drei"],
               particles: ["@tsparticles/react", "@tsparticles/slim"],
            },
         },
      },
      chunkSizeWarningLimit: 1000,
   },
   test: {
      environment: "jsdom",
      globals: true,
      setupFiles: ["./src/__tests__/setup.ts"],
      // Der Smoke-Test rendert die ganze Anwendung samt Three.js und lag mit
      // rund fünf Sekunden genau auf der Vorgabegrenze - er fiel damit je nach
      // Tagesform um, ohne dass etwas kaputt war. 20 Sekunden sind weit genug
      // weg, um einen echten Stillstand trotzdem zu fangen.
      testTimeout: 20000,
   },
}));
