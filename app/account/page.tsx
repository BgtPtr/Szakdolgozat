"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Header from "@/components/Header";
import { useUser } from "@/hooks/useUser";
import useAuthModal from "@/hooks/useAuthModal";

const AccountPage = () => {
  const { user, isLoading } = useUser();
  const router = useRouter();

  // ✅ CSAK a szükséges action-t kérjük ki (stabilabb)
  const openSignIn = useAuthModal((state) => state.openSignIn);

  const [budapestTime, setBudapestTime] = useState<string>("");

  // 1) Auth guard
  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      openSignIn();
      router.replace("/");
    }
  }, [
    isLoading,
    user, // ⚠️ OK maradhat, de lásd lent
  ]);

  // 2) Idő frissítés
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const formatted = now.toLocaleTimeString("hu-HU", {
        timeZone: "Europe/Budapest",
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      setBudapestTime(formatted);
    };

    updateTime();
    const id = setInterval(updateTime, 1000);

    return () => clearInterval(id);
  }, []);

  if (isLoading || !user) {
    return null;
  }

  return (
    <div className="bg-neutral-900 rounded-lg h-full w-full overflow-hidden overflow-y-auto">
      <Header>
        <div className="px-6 py-6">
          <h1 className="text-white text-3xl sm:text-4xl lg:text-5xl font-bold">
            Fiókom
          </h1>
        </div>
      </Header>

      <div className="px-6 pb-6">
        <div className="bg-neutral-800 rounded-lg p-6 border border-neutral-700 max-w-xl">
          <p className="text-neutral-400 text-sm mb-2">
            Bejelentkezve ezzel az e-mail címmel:
          </p>
          <p className="text-white text-lg font-semibold">
            {user.email}
          </p>

          <div className="mt-4">
            <p className="text-neutral-400 text-sm">
              Időzóna: Budapest
            </p>
            <p className="text-white text-lg font-mono">
              {budapestTime || "—"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;