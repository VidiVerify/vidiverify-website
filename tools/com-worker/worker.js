// Cloudflare Worker `vidiverify-com-en`: vidiverify.com als Reverse-Proxy
// zum GitHub-Pages-Build. Anfragen kommen auf vidiverify.com/<pfad>, werden
// intern bei vidiverify.de geholt und unter vidiverify.com ausgeliefert.
// Die React-App erkennt anhand des Hostnames (vidiverify.com) automatisch
// Englisch als Default-Sprache (i18n-Hostname-Detector).
//
// Umleitungen (30.09.2026): GitHub Pages antwortet auf einen Ordner ohne
// Schrägstrich (`/agb`) mit 301 auf `https://vidiverify.de/agb/`. Der Worker
// reichte das unverändert durch, der Besucher landete auf .de und damit auf
// Deutsch - auch der Prüfer bei der Paddle-Freigabe. Zeigt `Location` auf
// vidiverify.de, wird es auf vidiverify.com umgeschrieben; alle anderen
// Antworten gehen unberührt durch.
//
// Bis zum 30.09.2026 lag dieser Code nur im Cloudflare-Dashboard. Ausrollen
// nur den Code, nicht über `wrangler deploy` (setzt Routen und Einstellungen):
// siehe README.md daneben.

const HERKUNFT = /^https?:\/\/(www\.)?vidiverify\.de(?=\/|$)/i;
const ZIEL = "https://vidiverify.com";

export default {
   async fetch(request) {
      const url = new URL(request.url);
      const originUrl = `https://vidiverify.de${url.pathname}${url.search}`;

      const originRequest = new Request(originUrl, {
         method: request.method,
         headers: request.headers,
         body: request.body,
         redirect: "manual",
      });

      const antwort = await fetch(originRequest);
      const location = antwort.headers.get("Location");
      if (!location || !HERKUNFT.test(location)) return antwort;

      const kopf = new Headers(antwort.headers);
      kopf.set("Location", location.replace(HERKUNFT, ZIEL));
      return new Response(antwort.body, {
         status: antwort.status,
         statusText: antwort.statusText,
         headers: kopf,
      });
   },
};
