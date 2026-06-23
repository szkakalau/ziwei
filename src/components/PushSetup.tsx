"use client";

import { useEffect, useRef, useState } from "react";
import { Bell, BellOff } from "lucide-react";

type PushState = "unsupported" | "denied" | "granted" | "prompt" | "loading";

declare global {
  interface Window {
    OneSignal?: {
      init: (config: Record<string, unknown>) => void;
      on: (event: string, callback: (data: unknown) => void) => void;
      login: (externalId: string) => void;
      logout: () => void;
      getRegistrationId: () => Promise<string>;
      isPushNotificationsSupported: () => boolean;
      isPushNotificationsEnabled: () => Promise<boolean>;
      setExternalUserId: (id: string) => void;
      Notifications: {
        requestPermission: () => Promise<boolean>;
        addEventListener: (event: string, callback: (data: unknown) => void) => void;
      };
    };
  }
}

export function useOneSignal(appId: string, userId?: string) {
  const [pushState, setPushState] = useState<PushState>("loading");
  const [initialized, setInitialized] = useState(false);

  // Keep a ref to userId so the subscriptionChange callback (registered once
  // at SDK load) always sees the latest value instead of a stale closure.
  const userIdRef = useRef<string | undefined>(userId);
  userIdRef.current = userId;

  useEffect(() => {
    if (!appId || initialized) return;

    // Check support
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      setPushState("unsupported");
      return;
    }

    // Check current permission
    if ("Notification" in window) {
      if (Notification.permission === "denied") {
        setPushState("denied");
        return;
      }
    }

    // Load OneSignal SDK
    const script = document.createElement("script");
    script.src = "https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js";
    script.async = true;
    script.onload = () => {
      if (window.OneSignal) {
        window.OneSignal.init({
          appId,
          notifyButton: { enable: false },
          allowLocalhostAsSecureOrigin: process.env.NODE_ENV !== "production",
        });

        window.OneSignal.on("subscriptionChange", (isSubscribed: unknown) => {
          if (isSubscribed) {
            setPushState("granted");
            // Register player ID with backend
            window.OneSignal?.getRegistrationId().then((playerId: string) => {
              const uid = userIdRef.current;
              if (uid && playerId) registerToken(uid, playerId);
            });
          } else {
            setPushState("prompt");
          }
        });

        setInitialized(true);

        // Check existing subscription
        window.OneSignal.isPushNotificationsEnabled().then((enabled) => {
          if (enabled) {
            setPushState("granted");
          } else if (Notification.permission === "denied") {
            setPushState("denied");
          } else {
            setPushState("prompt");
          }
        });
      }
    };
    document.head.appendChild(script);

    return () => {
      if (script.parentNode) script.parentNode.removeChild(script);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appId]);

  // When userId resolves (after /api/auth/me) and the SDK is loaded, set the
  // external user id — without re-running the SDK-load effect above.
  useEffect(() => {
    if (!initialized || !userId || !window.OneSignal) return;
    try {
      window.OneSignal.setExternalUserId(userId);
    } catch {
      /* non-critical */
    }
  }, [initialized, userId]);

  const requestPush = async () => {
    if (!window.OneSignal) return;
    setPushState("loading");
    try {
      const granted = await window.OneSignal.Notifications.requestPermission();
      setPushState(granted ? "granted" : "denied");
    } catch {
      setPushState("denied");
    }
  };

  return { pushState, requestPush };
}

async function registerToken(userId: string, playerId: string) {
  try {
    await fetch("/api/push/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ playerId }),
    });
  } catch {
    // Non-critical — push will work even without backend registration
  }
}

export function PushPrompt({
  pushState,
  onEnable,
}: {
  pushState: PushState;
  onEnable: () => void;
}) {
  if (pushState === "unsupported" || pushState === "loading") return null;

  if (pushState === "granted") {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/[0.06] border border-gold/08">
        <Bell className="h-3.5 w-3.5 text-gold/60" />
        <span className="text-[11px] text-amber-300/50">Push notifications enabled</span>
      </div>
    );
  }

  if (pushState === "denied") {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-black/[0.02] border border-white/[0.04]">
        <BellOff className="h-3.5 w-3.5 text-ink-dim/60" />
        <span className="text-[11px] text-ink-dim/70">
          Notifications blocked. Enable in browser settings.
        </span>
      </div>
    );
  }

  // prompt state — show CTA to enable
  return (
    <button
      onClick={onEnable}
      className="flex items-center gap-2 px-4 py-2.5 rounded-xl
                 bg-amber-500/10 border border-gold/10
                 text-amber-700/80 text-xs font-medium
                 hover:bg-amber-500/20 transition-colors"
    >
      <Bell className="h-3.5 w-3.5" />
      Get daily horoscope notifications
    </button>
  );
}
