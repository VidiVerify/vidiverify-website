/**
 * Welche Paddle-Umgebung gilt - und warum es dafür eine eigene Datei gibt.
 *
 * Die Wahl entscheidet, ob ein Klick auf „Kaufen" Geld bewegt oder eine
 * Testkarte akzeptiert. Beide Fehlrichtungen sind schlimm, aber nicht gleich
 * schlimm: Ein Sandkasten-Fenster auf der ausgelieferten Seite nimmt
 * Bestellungen entgegen, für die nie jemand zahlt, und stellt anschliessend
 * Lizenzen aus. Deshalb steht die Regel hier als reine Funktion, mit dem Host
 * als Parameter, damit ein Prüfstand sie prüfen kann, ohne `window.location`
 * zu fälschen (`src/__tests__/paddle.test.ts`).
 *
 * DIE UMGEBUNG WIRD NICHT GESCHALTET, SIE WIRD ABGELESEN: Paddle-Token tragen
 * ihre Umgebung im Präfix (`test_` gegen `live_`). Ein zweiter Schalter
 * daneben wäre eine Angabe, die man vergessen kann - und die dann genau das
 * Falsche tut.
 *
 * Plan: 05_DOKUMENTATION/PLANUNGEN/PRO Lizenzierungsmodul/
 *       2026-09-10_Paddle-Anbindung.md
 */

/* Der Client-Token des Sandkasten-Kontos.
 *
 * Kein Geheimnis - er steht im ausgelieferten Seitenquelltext, und mehr als
 * ein Bezahlfenster öffnen kann man mit ihm nicht. Die Geheimnisse liegen im
 * Worker (`PADDLE_WEBHOOK_SECRET`, `PADDLE_API_KEY`).
 */
export const PADDLE_TOKEN_SANDKASTEN = "test_59faf825345b6f40d6c60af9e4d";

/* Der Client-Token des Wirkkontos. LEER, solange der Wirkkatalog nicht
 * angelegt und die Paddle-Freigabe nicht erteilt ist.
 *
 * Was bei leerem Token passiert, ist die eigentliche Aussage dieser Datei:
 * Der Kauf wird NICHT angeboten. Er fällt nicht in den Sandkasten zurück.
 */
export const PADDLE_TOKEN_LIVE = "";

/** Die Preiskennungen des Sandkasten-Katalogs, angelegt am 10.09.2026. */
export const PREISE_SANDKASTEN = {
   pro: "pri_01m261pyz096dmzht8a6gm3y84",
   lifetime: "pri_01m261r6ft6rdf4tqemt1e5rh0",
};

/** Die Preiskennungen des Wirkkatalogs, angelegt am 26.09.2026. Ohne
 *  Wirktoken bleiben sie wirkungslos, siehe oben. */
export const PREISE_LIVE = {
   pro: "pri_01m3etex3jb8a2t02w272epztg",
   lifetime: "pri_01m3etdj3xc91q4z61d0ez7kw3",
};

export interface PaddleAufbau {
   token: string;
   umgebung: "sandbox" | "production";
   preise: { pro: string; lifetime: string };
   /* Wo die Erfolgsansicht nach der fertigen Lizenz fragt.
    *
    * Sie MUSS derselben Welt folgen wie das Bezahlfenster: Ein Testkauf im
    * Sandkasten landet in der Sandkasten-Ablage, und eine Erfolgsansicht, die
    * beim Wirk-Worker nachschaut, wartete ewig auf eine Lizenz, die woanders
    * längst liegt.
    *
    * Der Umweg über einen zweiten Proxy-Pfad des Entwicklungsservers
    * (`vite.config.js`) statt der vollen Adresse ist Absicht: Ein Abruf von
    * `localhost` direkt auf `workers.dev` wäre ein fremder Ursprung, und
    * `/api/lizenz` gibt bewusst keine CORS-Freigabe heraus. Über den Proxy
    * bleibt es derselbe Ursprung - ohne dass am Wirk-Worker etwas gelockert
    * werden muss.
    */
   lizenzAbruf: string;
   /** Wo der Vorgang vor dem Bezahlfenster angelegt wird - dieselbe Welt wie
    *  der Abruf, aus demselben Grund. */
   vorgangAnlegen: string;
   /** Die Wurzel der Schnittstelle - fuer Preisauskunft und Codepruefung. */
   basis: string;
}

/** Liest die Umgebung aus dem Token, statt sie zusätzlich zu führen. */
export function paddleUmgebung(token: string): "sandbox" | "production" {
   return token.startsWith("test_") ? "sandbox" : "production";
}

/**
 * Der Aufbau für diesen Host - oder `null`, wenn hier nicht gekauft werden
 * kann.
 *
 * `null` ist ein gültiges Ergebnis und kein Fehler: Solange der Wirkkatalog
 * fehlt, zeigt die Kaufseite ihre Lizenzen und den Weg, aber keinen
 * Bezahlknopf. Das ist der ehrliche Zustand. Ein Knopf, der in den Sandkasten
 * führt, nähme eine Bestellung entgegen, die niemandem etwas berechnet.
 */
export function paddleAufbau(
   host: string = window.location.hostname,
): PaddleAufbau | null {
   const wirkdomain = host !== "localhost" && host !== "127.0.0.1"
      && !host.endsWith(".local");

   const token = wirkdomain ? PADDLE_TOKEN_LIVE : PADDLE_TOKEN_SANDKASTEN;
   if (!token) return null;

   const preise = wirkdomain ? PREISE_LIVE : PREISE_SANDKASTEN;
   if (!preise.pro || !preise.lifetime) return null;

   const umgebung = paddleUmgebung(token);
   return {
      token, umgebung, preise,
      lizenzAbruf: umgebung === "sandbox" ? "/sandkasten-api/lizenz" : "/api/lizenz",
      vorgangAnlegen: umgebung === "sandbox"
         ? "/sandkasten-api/paddle/vorgang" : "/api/paddle/vorgang",
      basis: umgebung === "sandbox" ? "/sandkasten-api" : "/api",
   };
}

export interface PaddleEreignis {
   name?: string;
   data?: { transaction_id?: string } & Record<string, unknown>;
}

declare global {
   interface Window {
      Paddle?: {
         Environment: { set: (u: string) => void };
         Initialize: (o: Record<string, unknown>) => void;
         Checkout: {
            open: (o: Record<string, unknown>) => void;
            close?: () => void;
         };
         PricePreview?: (o: Record<string, unknown>) => Promise<unknown>;
      };
   }
}

/* Ein einziger Horcher, den das Fenster setzt und beim Schliessen abmeldet.
 *
 * `Initialize` läuft nur einmal, und der Rückruf wird dort festgelegt - eine
 * zweite Anmeldung mit einem neuen Rückruf gäbe es nicht. Deshalb steht hier
 * ein Verteiler, an dem sich das Fenster an- und abmeldet, statt den Rückruf
 * selbst zu sein.
 */
let horcher: ((ereignis: PaddleEreignis) => void) | null = null;

export function paddleHorchen(neu: ((ereignis: PaddleEreignis) => void) | null) {
   horcher = neu;
}

/**
 * Die Einstellungen des eingebetteten Bezahlfensters - für die Kaufseite und
 * die Zahlseite der Zahlungslinks gleich (24.09.2026).
 *
 * Bis hierher setzte nur die Kaufseite sie. Ein Zahlungslink öffnete Paddles
 * Overlay im hellen Standardschema, mit eigenen Dashboard-Werten und einem
 * Logout, der die Emailadresse des angelegten Kunden austauschbar machte.
 * Beide Wege tragen jetzt dasselbe Fenster mit den Werten aus dem Dashboard
 * (Checkout settings > Inline, Paddle-Plan 8a).
 */
export function einbettung(rahmen: string, sprache: string): Record<string, unknown> {
   return {
      displayMode: "inline",
      frameTarget: rahmen,
      frameInitialHeight: "450",
      frameStyle:
         "width: 100%; min-width: 312px; background-color: transparent; border: none;",
      theme: "dark",
      locale: sprache,
      // Eine Seite statt mehrerer: Email und Anschrift stehen schon in der
      // Transaktion, übrig bleibt die Zahlung.
      variant: "one-page",
      // Die Emailadresse gehört zum angelegten Kunden und steht auf der
      // Rechnung. Im Formular austauschbar, liefe der Kauf auf eine Adresse,
      // die in unserem Vorgang nie vorkam.
      allowLogout: false,
      // Rabattcodes laufen über unser Feld und werden im Worker geprüft; ein
      // zweiter Eingang im Formular ginge an dieser Prüfung vorbei.
      showAddDiscounts: false,
      allowDiscountRemoval: false,
      // Die USt-IdNr erheben wir selbst, der Worker legt sie beim Unternehmen
      // an.
      showAddTaxId: false,
   };
}

let geladen: Promise<void> | null = null;

/**
 * Lädt Paddle.js einmal und richtet es ein.
 *
 * Die Rückgabe wird gemerkt: Ein zweites `Initialize` mit demselben Token ist
 * harmlos, ein zweites Skript-Element im Kopf ist es nicht - es überschreibt
 * `window.Paddle` mitten in einem offenen Bezahlvorgang.
 */
export function paddleLaden(
   aufbau: PaddleAufbau,
   /** Voreinstellung für Bezahlfenster, die Paddle.js selbst öffnet - der
    * Zahlungslink (`?_ptxn=`). Gilt nur beim ersten Laden. */
   voreinstellung?: Record<string, unknown>,
): Promise<void> {
   if (geladen) return geladen;
   geladen = new Promise<void>((fertig, scheitern) => {
      const einrichten = () => {
         if (!window.Paddle) { scheitern(new Error("paddle_fehlt")); return; }
         // Die Umgebung MUSS vor `Initialize` stehen. Andersherum meldet sich
         // die Bibliothek beim Wirkkonto an und wechselt danach die Adresse,
         // was den Token ungültig macht.
         if (aufbau.umgebung === "sandbox") window.Paddle.Environment.set("sandbox");
         window.Paddle.Initialize({
            token: aufbau.token,
            eventCallback: (ereignis: PaddleEreignis) => horcher?.(ereignis),
            ...(voreinstellung ? { checkout: { settings: voreinstellung } } : {}),
         });
         fertig();
      };
      if (window.Paddle) { einrichten(); return; }
      const element = document.createElement("script");
      element.src = "https://cdn.paddle.com/paddle/v2/paddle.js";
      element.async = true;
      element.onload = einrichten;
      element.onerror = () => scheitern(new Error("paddle_laden_gescheitert"));
      document.head.appendChild(element);
   });
   // Ein gescheiterter Ladeversuch darf sich nicht festsetzen - der Kunde
   // klickt erneut, und dann soll es wieder versucht werden.
   geladen.catch(() => { geladen = null; });
   return geladen;
}
