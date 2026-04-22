"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import type { User } from "@supabase/supabase-js";

import { useSupabase } from "@/providers/SupabaseProvider";
import type { Subscription, UserDetails } from "@/types";

type UserContextType = {
  accessToken: string | null;
  user: User | null;
  userDetails: UserDetails | null;
  isLoading: boolean;
  subscription: Subscription | null;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

type Props = {
  children: React.ReactNode;
};

export const MyUserContextProvider = ({ children }: Props) => {
  const supabase = useSupabase();

  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [isLoadingData, setIsLoadingData] = useState(false);

  useEffect(() => {
    let mounted = true;

    const applySession = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (!mounted) return;

      if (error) {
        console.error("getSession error:", error.message);
        setAccessToken(null);
        setUser(null);
        setIsLoadingUser(false);
        return;
      }

      setAccessToken(session?.access_token ?? null);
      setUser(session?.user ?? null);
      setIsLoadingUser(false);
    };

    applySession();

    const {
      data: { subscription: authSubscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setAccessToken(session?.access_token ?? null);
      setUser(session?.user ?? null);
      setIsLoadingUser(false);
    });

    return () => {
      mounted = false;
      authSubscription.unsubscribe();
    };
  }, [supabase]);

  useEffect(() => {
    let cancelled = false;

    const loadProfileData = async () => {
      if (!user) {
        setUserDetails(null);
        setSubscription(null);
        return;
      }

      setIsLoadingData(true);

      const [userDetailsResult, subscriptionResult] = await Promise.allSettled([
        supabase.from("users").select("*").eq("id", user.id).maybeSingle(),
        supabase
          .from("subscriptions")
          .select("*, prices(*, products(*))")
          .in("status", ["trialing", "active"])
          .eq("user_id", user.id)
          .maybeSingle(),
      ]);

      if (cancelled) return;

      if (userDetailsResult.status === "fulfilled") {
        setUserDetails(
          (userDetailsResult.value.data as UserDetails | null) ?? null
        );
      } else {
        setUserDetails(null);
      }

      if (subscriptionResult.status === "fulfilled") {
        setSubscription(
          (subscriptionResult.value.data as Subscription | null) ?? null
        );
      } else {
        setSubscription(null);
      }

      setIsLoadingData(false);
    };

    loadProfileData();

    return () => {
      cancelled = true;
    };
  }, [user, supabase]);

  const value: UserContextType = {
    accessToken,
    user,
    userDetails,
    isLoading: isLoadingUser || isLoadingData,
    subscription,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = () => {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error("useUser must be used within a MyUserContextProvider");
  }

  return context;
};
