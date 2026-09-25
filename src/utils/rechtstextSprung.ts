/* Sprungziele der Rechtstexte (Datenschutz, AGB, EULA). Getrennt von
 * `RechtstextNavigation.tsx`, weil eine Bauteil-Datei nur Bauteile
 * exportieren soll (Fast Refresh). */
import type { RefObject } from "react";

export const TOC_ID = "rt-inhalt";
export const abschnittId = (id: number) => `rt-abschnitt-${id}`;

/** Springt im Scrollbereich des Fensters zum Element mit dieser Kennung. */
export function springe(box: RefObject<HTMLDivElement | null>, elementId: string) {
   const rahmen = box.current;
   const ziel = rahmen?.querySelector<HTMLElement>(`#${elementId}`);
   if (rahmen && ziel) rahmen.scrollTo({ top: ziel.offsetTop - 16, behavior: "smooth" });
}
