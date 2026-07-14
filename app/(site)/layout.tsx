import HomeNavbar from "../components/home-navbar";
import HomeFooter from "../components/home-footer";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-base-100 text-base-content selection:bg-primary/30 overflow-x-hidden">
      <HomeNavbar />
      {children}
      <HomeFooter />
    </div>
  );
}
