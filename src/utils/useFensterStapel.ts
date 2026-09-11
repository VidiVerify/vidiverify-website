/**
 * Der Stapel der offenen Fenster.
 *
 * Zwei Fehler, die beide daher kamen, dass jedes Fenster sich für das einzige
 * hielt (Anwenderbefund 10.09.2026):
 *
 * 1. **Escape schloss alles.** Öffnet man aus dem Anfrageformular die
 *    Datenschutzerklärung, hören beide Fenster auf die Taste - und beide
 *    schlossen. Der Kunde landete auf der Seite statt zurück im Formular, mit
 *    dem Eindruck, seine Eingaben seien fort.
 * 2. **Das Seitenscrollen wurde zu früh freigegeben.** Jedes Fenster setzte
 *    `overflow: hidden` und nahm es beim Schliessen zurück, auch wenn darunter
 *    noch eines offen war.
 *
 * Beides löst dieselbe Buchführung: Wer offen ist, steht im Stapel. Escape
 * trifft nur den obersten, und das Scrollen wird erst freigegeben, wenn der
 * Stapel leer ist.
 */
import { useEffect } from "react";

const stapel: symbol[] = [];

export function useFensterStapel(open: boolean, onClose: () => void) {
   useEffect(() => {
      if (!open) return;

      const ich = Symbol("fenster");
      stapel.push(ich);
      document.body.style.overflow = "hidden";

      const onKey = (e: KeyboardEvent) => {
         // Nur das oberste Fenster reagiert. Ein Fenster, über dem ein anderes
         // liegt, darf sich nicht mit schliessen.
         if (e.key === "Escape" && stapel[stapel.length - 1] === ich) {
            e.stopPropagation();
            onClose();
         }
      };
      window.addEventListener("keydown", onKey);

      return () => {
         window.removeEventListener("keydown", onKey);
         const i = stapel.indexOf(ich);
         if (i >= 0) stapel.splice(i, 1);
         if (stapel.length === 0) document.body.style.overflow = "";
      };
   }, [open, onClose]);
}

export default useFensterStapel;
