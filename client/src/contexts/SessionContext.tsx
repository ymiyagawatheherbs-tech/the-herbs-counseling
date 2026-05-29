import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type SessionType = "general" | "partner" | "admin" | null;

export interface SessionInfo {
  type: SessionType;
  partnerSalonId: number | null;
  salonName: string | null;
  label: string | null;
}

interface SessionContextValue {
  session: SessionInfo | null;
  setSession: (s: SessionInfo | null) => void;
  clearSession: () => void;
  isAuthenticated: boolean;
}

const SESSION_KEY = "herbs_session";

const SessionContext = createContext<SessionContextValue>({
  session: null,
  setSession: () => {},
  clearSession: () => {},
  isAuthenticated: false,
});

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSessionState] = useState<SessionInfo | null>(() => {
    try {
      const stored = sessionStorage.getItem(SESSION_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const setSession = (s: SessionInfo | null) => {
    setSessionState(s);
    if (s) {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(s));
    } else {
      sessionStorage.removeItem(SESSION_KEY);
    }
  };

  const clearSession = () => {
    setSession(null);
    // サーバー側のhttpOnly Cookieも削除
    fetch("/api/trpc/passcode.logout", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ "0": { json: null } }),
    }).catch(() => {});
  };

  return (
    <SessionContext.Provider value={{
      session,
      setSession,
      clearSession,
      isAuthenticated: session !== null,
    }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  return useContext(SessionContext);
}
