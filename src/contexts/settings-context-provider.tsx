"use client";

import { createContext, useState } from "react";

type SettingsContextProvider = {
  children: React.ReactNode;
};

type TSettingsContext = {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  toggle: () => void;
};

export const SettingsContext = createContext<TSettingsContext | null>(null);

export default function SettingsContextProvider({
  children,
}: SettingsContextProvider) {
  const [isOpen, setIsOpen] = useState(false);

  const onOpen = () => {
    setIsOpen(true);
  };

  const onClose = () => {
    setIsOpen(false);
  };

  const toggle = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <SettingsContext.Provider
      value={{
        isOpen,
        onOpen,
        onClose,
        toggle,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}
