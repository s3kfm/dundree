import { ReactNode } from "react";
import GamesNavigation from "./games-navigation";

export default function GamesLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <GamesNavigation />
      {children}
    </>
  );
}
