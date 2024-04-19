"use client";

import { createContext, useState } from "react";

type CoverImageProvider = {
  children: React.ReactNode;
};

type TCoverImageContext = {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
};

export const CoverImageContext = createContext<TCoverImageContext | null>(null);

export default function CoverImageContextProvider({
  children,
}: CoverImageProvider) {
  const [isOpen, setIsOpen] = useState(false);

  const onOpen = () => {
    setIsOpen(true);
  };

  const onClose = () => {
    setIsOpen(false);
  };

  return (
    <CoverImageContext.Provider
      value={{
        isOpen,
        onOpen,
        onClose,
      }}
    >
      {children}
    </CoverImageContext.Provider>
  );
}
