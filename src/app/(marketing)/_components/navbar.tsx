"use client";

import { useScrollTop } from "@/hooks/use-scroll-top";
import { useCurrentUser } from "@/hooks/use-current-user";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { LoginButton } from "@/components/auth/login-button";
import { UserButton } from "@/components/auth/user-button";
import { Spinner } from "@/components/spinner";
import Link from "next/link";
import { Logo } from "./logo";
import { cn } from "@/lib/utils";

export const Navbar = () => {
  const { user, isLoading } = useCurrentUser();
  const scrolled = useScrollTop();

  return (
    <div
      className={cn(
        "z-50 bg-background dark:bg-[#1F1F1F] fixed top-0 flex items-center w-full p-6",
        scrolled && "border-b shadow-sm"
      )}
    >
      <Logo />
      <div className="md:ml-auto md:justify-end justify-between w-full flex items-center gap-x-2">
        {isLoading && (
          <div className="w-full flex items-center justify-center">
            <Spinner size="lg" />
          </div>
        )}
        {!user && !isLoading && (
          <>
            <LoginButton mode="modal" asChild>
              <Button variant="ghost" size="sm">
                Log in
              </Button>
            </LoginButton>
            <LoginButton mode="modal" asChild>
              <Button size="sm">Get EasyNotes free</Button>
            </LoginButton>
          </>
        )}
        {user && !isLoading && (
          <>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/documents">Enter EasyNotes</Link>
            </Button>
            <UserButton />
          </>
        )}
        <ModeToggle />
      </div>
    </div>
  );
};
