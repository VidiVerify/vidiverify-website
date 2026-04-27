import { useState, useEffect } from "react";

export interface ReleaseData {
   version: string;
   publishedAt: string;
   fileSize: number | null;
   downloadUrl: string;
   sha256: string | null;
}

interface UseLatestReleaseResult {
   data: ReleaseData | null;
   loading: boolean;
   error: boolean;
}

// Module-level cache — survives re-renders, cleared on page reload
let _cache: ReleaseData | null = null;
let _cacheTime = 0;
const CACHE_TTL = 5 * 60 * 1000;

export function useLatestRelease(
   owner: string,
   repo: string,
   assetName: string,
): UseLatestReleaseResult {
   const [data, setData] = useState<ReleaseData | null>(_cache);
   const [loading, setLoading] = useState(_cache === null);
   const [error, setError] = useState(false);

   useEffect(() => {
      if (_cache && Date.now() - _cacheTime < CACHE_TTL) {
         setData(_cache);
         setLoading(false);
         return;
      }

      let cancelled = false;

      const fetchRelease = async () => {
         try {
            const res = await fetch(
               `https://api.github.com/repos/${owner}/${repo}/releases/latest`,
            );
            if (!res.ok) throw new Error("API error");
            const json = await res.json();

            const version: string = json.tag_name ?? "";
            const publishedAt: string = json.published_at ?? "";

            const assets: Array<{ name: string; size: number; browser_download_url: string; digest?: string }> =
               json.assets ?? [];

            const mainAsset = assets.find((a) => a.name === assetName);

            const downloadUrl =
               mainAsset?.browser_download_url ??
               `https://github.com/${owner}/${repo}/releases/latest/download/${assetName}`;

            let sha256: string | null = null;
            if (mainAsset?.digest?.startsWith("sha256:")) {
               sha256 = mainAsset.digest.slice(7).toUpperCase();
            }

            const result: ReleaseData = {
               version,
               publishedAt,
               fileSize: mainAsset?.size ?? null,
               downloadUrl,
               sha256,
            };

            _cache = result;
            _cacheTime = Date.now();

            if (!cancelled) {
               setData(result);
               setLoading(false);
            }
         } catch {
            if (!cancelled) {
               setError(true);
               setLoading(false);
            }
         }
      };

      fetchRelease();
      return () => { cancelled = true; };
   }, [owner, repo, assetName]);

   return { data, loading, error };
}
