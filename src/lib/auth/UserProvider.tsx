"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/client";
import type { Tables } from "@/types/database";

export type Profile = Tables<"profiles">;

type UserContextValue = {
  user: User | null;
  profile: Profile | null;
  isAdmin: boolean;
  isLoading: boolean;
};

const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({
  initialUser,
  initialProfile,
  children,
}: {
  initialUser: User | null;
  initialProfile: Profile | null;
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(initialUser);
  const [profile, setProfile] = useState<Profile | null>(initialProfile);
  const [serverUserId, setServerUserId] = useState<string | null>(initialUser?.id ?? null);
  const [isLoading, setIsLoading] = useState(false);

  // Sincronizar con los props cuando el server-side cambia el usuario
  // (típicamente después de un login/logout server-action + router.refresh()).
  // Pattern recomendado por React docs: ajustar state during render cuando un prop cambia.
  // Comparamos por id para evitar disparar en cada nueva referencia de objeto.
  const incomingId = initialUser?.id ?? null;
  if (incomingId !== serverUserId) {
    setServerUserId(incomingId);
    setUser(initialUser);
    setProfile(initialProfile);
  }

  useEffect(() => {
    const supabase = createClient();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const nextUser = session?.user ?? null;
      setUser(nextUser);

      if (!nextUser) {
        setProfile(null);
        return;
      }

      setIsLoading(true);
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", nextUser.id)
        .maybeSingle();
      setProfile(data ?? null);
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<UserContextValue>(
    () => ({
      user,
      profile,
      isAdmin: profile?.role === "admin" || profile?.role === "superadmin",
      isLoading,
    }),
    [user, profile, isLoading]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) {
    throw new Error("useUser debe usarse dentro de <UserProvider>");
  }
  return ctx;
}
