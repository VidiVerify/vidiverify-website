import { useSyncExternalStore } from "react";

const subscribe = (): (() => void) => () => {};

const getSnapshot = (): boolean => {
   if (globalThis.window == null) return false;
   const ua = globalThis.navigator?.userAgent ?? "";
   if (/Windows/i.test(ua)) return false;
   return /Android|iPhone|iPad|iPod/i.test(ua);
};

const getServerSnapshot = (): boolean => false;

const useIsMobileNonWindows = (): boolean => {
   return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
};

export default useIsMobileNonWindows;
