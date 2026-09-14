/**
 * Eine von mehreren Beschriftungen eines Knopfs, der seine Breite nie ändert.
 *
 * Alle Beschriftungen liegen übereinander in derselben Rasterzelle (der Knopf
 * trägt `display: inline-grid`), nur eine ist sichtbar. Die Breite ist damit
 * immer die der längsten - ohne geratene Pixelzahl, die in der zweiten
 * Sprache wieder nicht passt. Anlass: „Einlösen"/„Entfernen" beim Rabattcode
 * wechselte die Breite und schob das Nachbarfeld (Anwenderbefund 14.09.2026).
 */
export default function KnopfText({ an, text }: { an: boolean; text: string }) {
   return (
      <span aria-hidden={!an} style={{ gridArea: "1 / 1", visibility: an ? "visible" : "hidden" }}>
         {text}
      </span>
   );
}
