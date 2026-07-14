"use client";
import { Bell } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useMemo } from "react";

export default function GamesNavigation() {
  const pathname = usePathname();

  const activeHeader = useMemo(() => {
    if (pathname.startsWith("/scenarios")) return "scenario";
    if (pathname.startsWith("/games")) {
      return "game";
    }
  }, [pathname]);
  const gameId = useMemo(() => {
    const match = pathname.match(
      /^\/games\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/,
    );
    if (match) {
      return match[1];
    }
  }, [pathname]);

  if (gameId) {
    return null;
  }
  return (
    <header className=" top-0 w-full z-10 bg-base-100/80 backdrop-blur-xl border-b border-primary/10">
      <div className="navbar flex flex-col md:flex-row px-4 md:px-8">
        <div className="flex-1 flex gap-2">
          <Link
            href="/games"
            className="text-2xl font-bold text-primary font-headline tracking-wide cursor-pointer flex gap-2"
          >
            <Image
              alt={"bonfire icon logo"}
              src={`/bonfire.png`}
              width={30}
              height={30}
            />
            Fabley
          </Link>
        </div>
        <div className="w-full md:w-fit flex-none flex items-center mt-2 md:mt-0 justify-between gap-8">
          <nav className="flex gap-8">
            <Link
              className={`font-label uppercase tracking-widest text-xs   hover:scale-105 transition-all  ${activeHeader === "game" ? "text-primary border-b-2 border-primary pb-1" : ""}`}
              href="/games"
            >
              Games
            </Link>
            <Link
              className={`font-label uppercase tracking-widest text-xs text-base-content/70 hover:text-primary transition-colors hover:scale-105  ${activeHeader === "scenario" ? " text-primary border-b-2 border-primary pb-1" : ""}`}
              href="/scenarios"
            >
              Scenarios
            </Link>
          </nav>
          <div className="flex items-center gap-4 justify-end">
            <button className="btn btn-ghost btn-circle btn-sm">
              <Bell className="w-5 h-5 text-primary" />
            </button>

            <UserButton />
          </div>
        </div>
      </div>
    </header>
  );
}
