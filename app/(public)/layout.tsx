import AnnouncementBar from "../../components/announcement-bar";
import Header from "../../components/header";
import Footer from "../../components/sections/footer";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AnnouncementBar />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
