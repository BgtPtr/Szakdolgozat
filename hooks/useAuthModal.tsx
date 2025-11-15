import { create } from "zustand";

type AuthView = "sign_in" | "sign_up";

interface AuthModalStore {
  isOpen: boolean;
  view: AuthView;
  openSignIn: () => void;
  openSignUp: () => void;
  onClose: () => void;
}

const useAuthModal = create<AuthModalStore>((set) => ({
  isOpen: false,
  view: "sign_in",
  openSignIn: () => set({ isOpen: true, view: "sign_in" }),
  openSignUp: () => set({ isOpen: true, view: "sign_up" }),
  onClose: () => set({ isOpen: false }),
}));

export default useAuthModal;
