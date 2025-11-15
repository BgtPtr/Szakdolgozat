"use client";

import { useRouter } from "next/navigation";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { useEffect } from "react";

import useAuthModal from "@/hooks/useAuthModal";
import Modal from "./Modal";
import { useSupabase } from "@/providers/SupabaseProvider";
import { useUser } from "@/hooks/useUser";

const AuthModal = () => {
  const supabaseClient = useSupabase();
  const router = useRouter();
  const { user } = useUser();
  const { onClose, isOpen, view} = useAuthModal();

  useEffect(() => {
    if (user && isOpen) {
      router.refresh();
      onClose();
    }
  }, [user, isOpen, router, onClose]);

  const onChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  // TS generikus ütközés miatt itt lazítunk a típuson
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const authSupabaseClient = supabaseClient as any;

  return (
    <Modal
      title="Bejelentkezés"
      description=""
      isOpen={isOpen}
      onChange={onChange}
    >
      <Auth
        supabaseClient={authSupabaseClient}
        view={view}
        providers={[]}
        theme="dark"
        appearance={{
          theme: ThemeSupa,
          variables: {
            default: {
              colors: {
                brand: "#404040",
                brandAccent: "#22c55e",
              },
            },
          },
        }}
        localization={{
          variables: {
            sign_in: {
              email_label: "E-mail cím",
              password_label: "Jelszó",
              button_label: "Bejelentkezés",
            },
            sign_up: {
              email_label: "E-mail cím",
              password_label: "Jelszó",
              button_label: "Regisztráció",
            },
            magic_link: {
              email_input_label: "E-mail cím",
              button_label: "Belépés e-mail linkkel",
            },
            forgotten_password: {
              email_label: "E-mail cím",
              button_label: "Új jelszó kérése",
            },
          },
        }}
      />
    </Modal>
  );
};

export default AuthModal;
