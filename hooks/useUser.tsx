"use client";

import {
  useEffect,
  useState,
  createContext,
  useContext,
} from "react";
import type { User, Session, SupabaseClient } from "@supabase/supabase-js";
import { Subscription, UserDetails } from "@/types";
import { useSupabase } from "@/providers/SupabaseProvider";
import { Database } from "@/types_db";

type UserContextType = {
  accessToken: string | null;
  user: User | null;
  userDetails: UserDetails | null;
  isLoading: boolean;
  subscription: Subscription | null;
};

export const UserContext = createContext<UserContextType | undefined>(
  undefined
);

export interface Props {
  [propName: string]: unknown;
}

export const MyUserContextProvider = (props: Props) => {
  const supabase = useSupabase();

  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  const [isLoadingData, setIsLoadingData] = useState(false);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);

  const getUserDetails = () => supabase.from("users").select("*").single();
  const getSubscription = () =>
    supabase
      .from("subscriptions")
      .select("*, prices(*, products(*))")
      .in("status", ["trialing", "active"])
      .single();

  // 1) Session + user figyelése
  useEffect(() => {
    let ignore = false;

    const getInitialSession = async () => {
      setIsLoadingUser(true);

      const { data, error } = await supabase.auth.getSession();

      if (ignore) return;

      if (error) {
        console.error("getSession error:", error.message);
        setUser(null);
        setAccessToken(null);
      } else {
        setUser(data.session?.user ?? null);
        setAccessToken(data.session?.access_token ?? null);
      }

      setIsLoadingUser(false);
    };

    getInitialSession();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event: unknown, session: Session | null) => {
        if (ignore) return;

        setUser(session?.user ?? null);
        setAccessToken(session?.access_token ?? null);

        if (!session) {
          setUserDetails(null);
          setSubscription(null);
        }
      }
    );

    return () => {
      ignore = true;
      listener.subscription.unsubscribe();
    };
  }, [supabase]);

  // 2) UserDetails + Subscription betöltése
  useEffect(() => {
    if (user && !isLoadingData && !userDetails && !subscription) {
      setIsLoadingData(true);

      Promise.allSettled([getUserDetails(), getSubscription()]).then(
        (results) => {
          const userDetailsPromise = results[0];
          const subscriptionPromise = results[1];

          if (userDetailsPromise.status === "fulfilled") {
            setUserDetails(
              userDetailsPromise.value.data as unknown as UserDetails
            );
          }

          if (subscriptionPromise.status === "fulfilled") {
            setSubscription(
              subscriptionPromise.value.data as unknown as Subscription
            );
          }

          setIsLoadingData(false);
        }
      );
    } else if (!user && !isLoadingUser && !isLoadingData) {
      setUserDetails(null);
      setSubscription(null);
    }
  }, [
    user,
    isLoadingUser,
    isLoadingData,
    userDetails,
    subscription,
    supabase,
  ]);

  const value: UserContextType = {
    accessToken,
    user,
    userDetails,
    isLoading: isLoadingUser || isLoadingData,
    subscription,
  };

  return <UserContext.Provider value={value} {...props} />;
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a MyUserContextProvider");
  }
  return context;
};
