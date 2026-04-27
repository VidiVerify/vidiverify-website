import { useState, useEffect } from "react";

const BASE_OFFSET = 3500;

const CACHE_TTL = 60 * 1000;
let _cache: number | null = null;
let _cacheTime = 0;
let _inflightPromise: Promise<number | null> | null = null;

export interface PageViewConfig {
   namespace?: string;
   gcCode?: string;
}

interface UsePageViewCountResult {
   count: number | null;
   loading: boolean;
}

async function fetchPageViews(cfg: PageViewConfig): Promise<number | null> {
   // ── GoatCounter public counter endpoint ───────────────────────────────────
   // Requires "Allow adding visitor counts on your website" in GC settings.
   // No auth header needed → no CORS block. Path %2F = root "/".
   if (cfg.gcCode) {
      try {
         const r = await fetch(
            `https://${cfg.gcCode}.goatcounter.com/counter/%2F.json`,
            { signal: AbortSignal.timeout(6000) },
         );
         if (r.ok) {
            const d = await r.json() as { count?: string };
            const n = parseInt((d.count ?? "").replace(/\D/g, ""), 10);
            if (!isNaN(n)) return n + BASE_OFFSET;
         }
      } catch {
         // timeout or network error — fall through
      }
   }

   return null;
}

export function usePageViewCount(cfg: PageViewConfig): UsePageViewCountResult {
   const [count, setCount] = useState<number | null>(_cache);
   const [loading, setLoading] = useState(_cache === null);

   const key = `${cfg.gcCode ?? ""}|${cfg.namespace ?? ""}`;

   useEffect(() => {
      if (!cfg.gcCode && !cfg.namespace) {
         setLoading(false);
         return;
      }

      if (_cache !== null && Date.now() - _cacheTime < CACHE_TTL) {
         setCount(_cache);
         setLoading(false);
         return;
      }

      let cancelled = false;

      const run = async () => {
         if (!_inflightPromise) {
            _inflightPromise = fetchPageViews(cfg)
               .then((result) => {
                  if (result !== null) {
                     _cache = result;
                     _cacheTime = Date.now();
                  }
                  _inflightPromise = null;
                  return result;
               })
               .catch(() => {
                  _inflightPromise = null;
                  return null;
               });
         }

         const result = await _inflightPromise;
         if (!cancelled) {
            if (result !== null) setCount(result);
            setLoading(false);
         }
      };

      run();
      return () => { cancelled = true; };
   // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [key]);

   return { count, loading };
}
