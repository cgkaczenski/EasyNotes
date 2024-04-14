"use client";

import { useCurrentUser } from "@/hooks/use-current-user";
import { LoginButton } from "@/components/auth/login-button";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/spinner";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const Heading = () => {
  const { user, isLoading } = useCurrentUser();
  return (
    <div className="max-w-3xl space-y-4">
      <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold">
        Your Ideas, Notes, & Plans. Unified. Welcome to{" "}
        <span className="underline">EasyNotes</span>
      </h1>
      <h3 className="text-base sm:text-xl md:text-2xl font-medium">
        EasyNotes is the workspace where <br />
        better, faster work happens.
      </h3>
      {isLoading && (
        <div className="w-full flex items-center justify-center">
          <Spinner size="lg" />
        </div>
      )}
      {user && !isLoading && (
        <Button asChild>
          <Link href="/app/documents">
            Enter EasyNotes
            <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
        </Button>
      )}
      {!user && !isLoading && (
        <LoginButton mode="modal" asChild>
          <Button>
            Get EasyNotes free
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </LoginButton>
      )}
    </div>
  );
};
