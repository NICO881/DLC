/**
 * hooks/useOnlineStatus.js
 *
 * Tracks browser connectivity so the header can show an offline indicator.
 * Important for the spec's Offline Access feature: school computers/
 * tablets connecting over a local Wi-Fi router may lose the upstream
 * connection while local resources are still browsable.
 */
import { useEffect, useState } from "react";

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    function handleOnline() {
      setIsOnline(true);
    }
    function handleOffline() {
      setIsOnline(false);
    }
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return isOnline;
}
