import { ReactNode } from "react";
import GamesNavigation from "../games/games-navigation";
import { Show } from "@clerk/nextjs";
import HomeNavbar from "../components/home-navbar";

export default function ScenariosLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Show when="signed-in">
        <GamesNavigation />
      </Show>
      <Show when="signed-out">
        <HomeNavbar />
      </Show>
      {children}
    </>
  );
}
