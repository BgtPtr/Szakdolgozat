"use client";

import {
  useEffect,
  useState,
  createContext,
  useContext,
} from "react";
import type { User, Session } from "@supabase/supabase-js";
import { Subscription, UserDetails } from "@/types";
import { useSupabase } from "@/providers/SupabaseProvider";

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

  useEffect(() => {
    let ignore = false;

    const hydrateAuthenticatedUser = async (session: Session | null) => {
      setIsLoadingUser(true);

      if (!session) {
        if (!ignore) {
          setUser(null);
          setAccessToken(null);
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
        setUser(null);
        setAccessToken(null);
        setUserDetails(null);
        setSubscription(null);
      } else {
        setUser(authenticatedUser ?? null);
        setAccessToken(session.access_token ?? null);
      }

      setIsLoadingUser(false);
    };

    const getInitialUser = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (ignore) return;

      if (error) {
        console.error("getSession error:", error.message);
        setUser(null);
        setAccessToken(null);
        setUserDetails(null);
        setSubscription(null);
        setIsLoadingUser(false);
        return;
      }

      await hydrateAuthenticatedUser(data.session ?? null);
    };

    getInitialUser();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (ignore) return;
        await hydrateAuthenticatedUser(session);
      }
    );

    return () => {
      ignore = true;
      listener.subscription.unsubscribe();
    };
  }, [supabase]);

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