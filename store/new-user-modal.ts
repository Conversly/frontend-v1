import { create } from "zustand";

interface NewUserModalState {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  showModal: () => void;
  hideModal: () => void;
}

export const useNewUserModal = create<NewUserModalState>((set) => ({
  isOpen: false,
  setIsOpen: (open: boolean) => set({ isOpen: open }),
  showModal: () => set({ isOpen: true }),
  hideModal: () => set({ isOpen: false }),
}));
