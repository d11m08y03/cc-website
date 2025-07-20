"use client";

import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { ThemeToggle } from "./theme-toggle";

export function Navbar() {
  const { data: session, status } = useSession();
  const [hasRegisteredTeam, setHasRegisteredTeam] = useState(false);

  useEffect(() => {
    const checkRegistrationStatus = async () => {
      if (status === "authenticated") {
        try {
          const response = await fetch("/api/registration-status");
          if (response.ok) {
            const data = await response.json();
            setHasRegisteredTeam(data.isRegistered);
          } else {
            console.error("Failed to fetch registration status");
            setHasRegisteredTeam(false);
          }
        } catch (error) {
          console.error("Error fetching registration status:", error);
          setHasRegisteredTeam(false);
        }
      } else {
        setHasRegisteredTeam(false);
      }
    };

    checkRegistrationStatus();
  }, [session, status]);

  const handleSignIn = async () => {
    try {
      const result = await signIn("google");
      if (result?.error) {
        toast.error(`Login failed: ${result.error}`);
      }
    } catch {
      toast.error("An unexpected error occurred during login.");
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.info("Logged out successfully.");
    } catch {
      toast.error("An unexpected error occurred during logout.");
    }
  };

  return (
    <nav className="bg-background border-b px-4 py-2 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-lg font-semibold">Computer Club</span>
        </Link>
        <div className="hidden md:flex space-x-2">
          <Button variant="ghost" asChild>
            <Link href="/">Home</Link>
          </Button>
          {hasRegisteredTeam && (
            <Button variant="ghost" asChild>
              <Link href="/dashboard">My Team</Link>
            </Button>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-2 sm:space-x-4">
        <ThemeToggle />
        {status === "authenticated" ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={session.user?.image || ""}
                    alt={session.user?.name || "User Avatar"}
                  />
                  <AvatarFallback>
                    {session.user?.name?.[0] || "CN"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {session.user?.name}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {session.user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile">Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button onClick={handleSignIn}>Log In</Button>
        )}
      </div>
    </nav>
  );
}
