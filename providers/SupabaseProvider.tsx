"use client";

import { useMemo, createContext, useContext } from "react";
import { createBrowserSupabaseClient } from "@/utils/supabase/client";

type SupabaseClientType = ReturnType<typeof createBrowserSupabaseClient>;

type SupabaseCtx = {
  supabase: SupabaseClientType;
};

const SupabaseContext = createContext<SupabaseCtx | null>(null);

export const useSupabase = () => {
  const ctx = useContext(SupabaseContext);
  if (!ctx) throw new Error("SupabaseContext missing");
  return ctx.supabase;
};

interface SupabaseProviderProps {
  children: React.ReactNode;
}

const SupabaseProvider: React.FC<SupabaseProviderProps> = ({ children }) => {
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);

  return (
    <SupabaseContext.Provider value={{ supabase }}>
      {children}
    </SupabaseContext.Provider>
  );
};

export default SupabaseProvider;
