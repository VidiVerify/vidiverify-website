import { useState, useEffect } from "react";

let _cache: number | null = null;
let _cacheTime = 0;
const CACHE_TTL = 5 * 60 * 1000;
const BASE_OFFSET = 350;

interface UseGitHubDownloadCountResult {
   count: number | null;
   loading: boolean;
}

export function useGitHubDownloadCount(
   owner: string,
   repo: string,
): UseGitHubDownloadCountResult {
   const [count, setCount] = useState<number | null>(_cache);
   const [loading, setLoading] = useState(_cache === null);

   useEffect(() => {
      if (_cache !== null && Date.now() - _cacheTime < CACHE_TTL) {
         setCount(_cache);
         setLoading(false);
         return;
      }

      let cancelled = false;

      const fetchCounts = async () => {
         try {
            let page = 1;
            let total = 0;
            while (true) {
               const res = await fetch(
                  `https://api.github.com/repos/${owner}/${repo}/releases?per_page=100&page=${page}`,
               );
               if (!res.ok) throw new Error("API error");
               const releases: Array<{ assets: Array<{ download_count: number }> }> =
                  await res.json();
               if (releases.length === 0) break;
               for (const release of releases) {
                  for (const asset of release.assets) {
                     total += asset.download_count;
                  }
               }
               if (releases.length < 100) break;
               page++;
            }
            const result = total + BASE_OFFSET;
            _cache = result;
            _cacheTime = Date.now();
            if (!cancelled) {
               setCount(result);
               setLoading(false);
            }
         } catch {
            if (!cancelled) setLoading(false);
         }
      };

      fetchCounts();
      return () => { cancelled = true; };
   }, [owner, repo]);

   return { count, loading };
}
