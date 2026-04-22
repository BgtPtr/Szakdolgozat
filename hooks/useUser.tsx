"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import type { Session, User } from "@supabase/supabase-js";

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

  const getUserDetails = () => supabase.from("users").select("*").single();

  const getSubscription = () =>
    supabase
      .from("subscriptions")
      .select("*, prices(*, products(*))")
      .in("status", ["trialing", "active"])
      .single();

  useEffect(() => {
    let ignore = false;

    const syncAuthenticatedUser = async (session: Session | null) => {
      setIsLoadingUser(true);

      if (!session) {
        if (!ignore) {
          setAccessToken(null);
          setUser(null);
          setUserDetails(null);
          setSubscription(null);
          setIsLoadingUser(false);
        }
        return;
      }

      const {
        data: { user: authenticatedUser },
        error: userError,
      } = await supabase.auth.getUser();

      if (ignore) return;

      if (userError) {
        console.error("getUser error:", userError.message);
        setAccessToken(null);
        setUser(null);
        setUserDetails(null);
        setSubscription(null);
      } else {
        setAccessToken(session.access_token ?? null);
        setUser(authenticatedUser ?? null);
      }

      setIsLoadingUser(false);
    };

    const init = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (ignore) return;

      if (error) {
        console.error("getSession error:", error.message);
        setAccessToken(null);
        setUser(null);
        setUserDetails(null);
        setSubscription(null);
        setIsLoadingUser(false);
        return;
      }

      await syncAuthenticatedUser(data.session ?? null);
    };

    init();

    const {
      data: { subscription: authSubscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (ignore) return;
      await syncAuthenticatedUser(session);
    });

    return () => {
      ignore = true;
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
        getUserDetails(),
        getSubscription(),
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