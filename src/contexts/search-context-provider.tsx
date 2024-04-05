"use client";

import { createContext, useState } from "react";

type SearchContextProvider = {
  children: React.ReactNode;
};

type TSearchContext = {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  toggle: () => void;
};

export const SearchContext = createContext<TSearchContext | null>(null);

export default function SearchContextProvider({
  children,
}: SearchContextProvider) {
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
    <SearchContext.Provider
      value={{
        isOpen,
        onOpen,
        onClose,
        toggle,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
}
