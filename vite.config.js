import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "node:url";
import { readFileSync } from "node:fs";

/* Die kurzen Adressen auch beim Entwickeln.
 *
 * Im Betrieb macht `public/404.html` aus `/pro?vvid=…` ein `/?vvid=…#pro` -
 * GitHub Pages liefert bei einem unbekannten Pfad diese Seite aus, und sie
 * leitet samt Abfrage weiter. Der Dev-Server kennt das nicht: Er lieferte
 * unter `/pro` die Startseite ohne Hash, und das Fenster blieb zu
 * (Anwenderbefund 11.09.2026, zweimal derselbe Stolperstein). Dieselbe
 * Tabelle, dieselbe Weiterleitung - nur eben hier.
 *
 * Die Liste steht bewusst NICHT doppelt: Sie wird aus `public/404.html`
 * gelesen, damit beide Wege dieselben Pfade kennen. Wer dort einen ergänzt,
 * hat ihn hier.
 */
function kurzeAdressen() {
   return {
      name: "vidiverify-kurze-adressen",
      apply: "serve",
      configureServer(server) {
         const quelle = fileURLToPath(new URL("./public/404.html", import.meta.url));
         server.middlewares.use((req, res, next) => {
            const [pfad, frage = ""] = (req.url || "/").split("?");
            const sauber = pfad.replace(/\/$/, "");
            if (!sauber || sauber.includes(".")) return next();
            let tabelle = {};
            try {
               const text = readFileSync(quelle, "utf-8");
               const block = /var routes = \{([\s\S]*?)\};/.exec(text);
               for (const [, p, ziel] of (block ? block[1] : "")
                       .matchAll(/"([^"]+)"\s*:\s*"([^"]+)"/g)) {
                  tabelle[p] = ziel;
               }
            } catch {
               tabelle = {};
            }
            const ziel = tabelle[sauber];
            if (!ziel) return next();
            const [vorn, hash = ""] = ziel.split("#");
            const neu = vorn + (frage ? "?" + frage : "") + (hash ? "#" + hash : "");
            res.statusCode = 302;
            res.setHeader("Location", neu);
            res.end();
         });
      },
   };
}

export default defineConfig(() => ({
   plugins: [tailwindcss(), react(), kurzeAdressen()],
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
