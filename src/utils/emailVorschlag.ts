/**
 * Erkennt den Vertipper in einer Emaildomain und schlägt das Naheliegende vor.
 *
 * Der Anlass: Die Emailadresse ist im Bestellweg die einzige Angabe, ohne die
 * gar nichts geht. An sie geht die Rechnung, und sie steht signiert in der
 * Lizenz. Ein `gmail.con` bedeutet: Der Kunde wartet, wir schreiben ins Leere,
 * und niemand von beiden weiss warum.
 *
 * BEWUSST KEIN WIEDERHOLUNGSFELD: Wer sich vertippt, tippt in der Wiederholung
 * meist denselben Fehler noch einmal oder kopiert das erste Feld hinüber. Der
 * Vorschlag hier fängt dieselben Fälle und kostet den Kunden keinen zweiten
 * Anlauf.
 *
 * Der Vorschlag ist NIE eine Korrektur: Er wird angeboten, und übernommen wird
 * er nur mit einem Klick. Eine Adresse stillschweigend zu ändern, wäre der
 * schlimmere Fehler - `max@gmx.net` und `max@gmx.de` sind zwei verschiedene
 * Postfächer, und welches gemeint ist, weiss nur der Kunde.
 */

import { abstand } from "./textabstand";

/* Die verbreiteten Anbieter. Die Liste muss nicht vollständig sein - was nicht
 * darin steht, ist schlicht kein Vorschlag wert. */
const DOMAINS = [
   "gmail.com", "googlemail.com",
   "web.de", "gmx.de", "gmx.net", "gmx.at", "gmx.ch",
   "t-online.de", "freenet.de", "mail.de", "posteo.de", "mailbox.org",
   "hotmail.com", "hotmail.de", "outlook.com", "outlook.de", "live.de",
   "live.com", "msn.com",
   "yahoo.com", "yahoo.de",
   "icloud.com", "me.com", "mac.com",
   "aol.com", "proton.me", "protonmail.com",
];

/**
 * Gibt die vermutlich gemeinte Adresse zurück - oder `null`, wenn die
 * eingegebene stimmig aussieht oder zu weit von allem Bekannten entfernt ist.
 */
export function emailVorschlag(email: string): string | null {
   const roh = (email || "").trim().toLowerCase();
   const at = roh.lastIndexOf("@");
   if (at < 1 || at === roh.length - 1) return null;

   const name = roh.slice(0, at);
   const domain = roh.slice(at + 1);
   if (!domain.includes(".")) {
      // `max@gmail` ohne Endung: Wenn genau eine bekannte Domain so beginnt,
      // ist der Fall eindeutig.
      const treffer = DOMAINS.filter((d) => d.startsWith(domain + "."));
      return treffer.length === 1 ? `${name}@${treffer[0]}` : null;
   }
   if (DOMAINS.includes(domain)) return null;

   /* Ein einziger Zeichenfehler zählt als Vertipper, ab zwei nur bei längeren
    * Domains. Sonst schlüge `mail.de` als `gmail.com` durch - zwei Domains,
    * die es beide gibt. */
   let beste: string | null = null;
   let bester = 99;
   for (const kandidat of DOMAINS) {
      const d = abstand(domain, kandidat);
      const grenze = kandidat.length >= 9 ? 2 : 1;
      if (d <= grenze && d < bester) {
         bester = d;
         beste = kandidat;
      }
   }
   return beste ? `${name}@${beste}` : null;
}

export default emailVorschlag;
