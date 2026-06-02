"use client";

import { useEffect, useState } from "react";
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
              if (userId && playerId) registerToken(userId, playerId);
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
  }, [appId, userId, initialized]);

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
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/[0.06] border border-amber-500/10">
        <Bell className="h-3.5 w-3.5 text-amber-400/60" />
        <span className="text-[11px] text-amber-300/50">Push notifications enabled</span>
      </div>
    );
  }

  if (pushState === "denied") {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
        <BellOff className="h-3.5 w-3.5 text-white/20" />
        <span className="text-[11px] text-white/25">
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
                 bg-amber-500/10 border border-amber-500/15
                 text-amber-300/80 text-xs font-medium
                 hover:bg-amber-500/20 transition-colors"
    >
      <Bell className="h-3.5 w-3.5" />
      Get daily horoscope notifications
    </button>
  );
}
