"use client";

import { useRouter } from "next/navigation";
import { twMerge } from "tailwind-merge";
import { RxCaretLeft, RxCaretRight } from "react-icons/rx";
import { FaUserAlt } from "react-icons/fa";
import { toast } from "react-hot-toast";

import useAuthModal from "@/hooks/useAuthModal";
import Button from "./Button";
import { useSupabase } from "@/providers/SupabaseProvider";
import { useUser } from "@/hooks/useUser";
import usePlayer from "@/hooks/usePlayer";

interface HeaderProps {
  children: React.ReactNode;
  className?: string;
}

const Header: React.FC<HeaderProps> = ({ children, className }) => {
  const router = useRouter();
  const authModal = useAuthModal();
  const supabaseClient = useSupabase();
  const { user } = useUser();
  const player = usePlayer();

  const handleLogout = async () => {
    const { error } = await supabaseClient.auth.signOut();

    // Player leállítása / eltüntetése
    player.reset();
    // Oldal frissítés (UI, session, stb.)
    router.refresh();

    if (error) {
      toast.error(error.message);
    }
  };

  const handleNavigateBack = () => {
    router.back();
  };

  const handleNavigateForward = () => {
    router.forward();
  };

  return (
    <div
      className={twMerge(
        `
        h-fit
        bg-gradient-to-b
        from-[#d6d31a]
        via-[#d6d31a]/80
        to-transparent
        p-6
      `,
        className
      )}
    >
      {/* Felső navigációs sáv */}
      <div className="w-full mb-4 flex items-center justify-between">
        <div className="flex items-center gap-x-2">
          <button
            onClick={handleNavigateBack}
            className="
              rounded-full
              bg-black/40
              hover:bg-black/60
              transition
              flex
              items-center
              justify-center
              p-1.5
            "
          >
            <RxCaretLeft size={26} className="text-white" />
          </button>
          <button
            onClick={handleNavigateForward}
            className="
              rounded-full
              bg-black/40
              hover:bg-black/60
              transition
              flex
              items-center
              justify-center
              p-1.5
            "
          >
            <RxCaretRight size={26} className="text-white" />
          </button>
        </div>

        {/* Jobb felső: auth részek */}
        <div className="flex items-center gap-x-4">
          {user ? (
            <>
              <Button
                onClick={handleLogout}
                className="
                  bg-white
                  text-black
                  px-6
                  py-2
                  rounded-full
                  hover:scale-[1.02]
                  transition-transform
                  text-sm
                  font-semibold
                "
              >
                Kijelentkezés
              </Button>
              <button
                className="
                  rounded-full
                  bg-black/40
                  hover:bg-black/60
                  transition
                  p-2.5
                  flex
                  items-center
                  justify-center
                "
              >
                <FaUserAlt className="text-white" size={16} />
              </button>
            </>
          ) : (
            <div className="flex items-center gap-x-3">
              <Button
                onClick={authModal.openSignUp}
                className="bg-transparent text-black font-semibold text-sm"
              >
                Regisztráció
              </Button>
              <Button
                onClick={authModal.openSignIn}
                className="
                  bg-white
                  text-black
                  px-6
                  py-2
                  rounded-full
                  hover:scale-[1.02]
                  transition-transform
                  text-sm
                  font-semibold
                "
              >
                Bejelentkezés
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* PETIFY HERO BLOKK */}
      <div className="mb-6 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div className="flex items-center gap-4">
          {/* „Logó” jel – P betű egy kis dobozban */}
          <div
            className="
              flex
              h-12
              w-12
              items-center
              justify-center
              rounded-2xl
              bg-black/25
              backdrop-blur-md
              shadow-[0_0_20px_rgba(0,0,0,0.4)]
            "
          >
            <span
              className="
                text-xl
                font-black
                tracking-tight
                bg-gradient-to-br
                from-black
                via-neutral-900
                to-neutral-700
                bg-clip-text
                text-transparent
              "
            >
              P
            </span>
          </div>

          {/* Főcím + alcím */}
          <div className="flex flex-col">
            <h1
              className="
                text-4xl
                md:text-5xl
                lg:text-6xl
                font-extrabold
                tracking-tight
                bg-gradient-to-r
                from-black
                via-neutral-900
                to-neutral-600
                bg-clip-text
                text-transparent
                drop-shadow-[0_0_18px_rgba(0,0,0,0.45)]
                tracking-wide
              "
            >
              Petify
            </h1>
            <p
              className="
                mt-1
                text-sm
                md:text-base
                font-medium
                text-black/85
                tracking-wider
                uppercase
              "
            >
              zene. füleidnek.
            </p>
          </div>
        </div>
      </div>

      {/* Az oldal további tartalma */}
      {children}
    </div>
  );
};

export default Header;
