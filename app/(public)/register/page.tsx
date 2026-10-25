import type { Metadata } from "next";
import RegistrationForm from "@/components/sections/registration/registration-form";
import RegistrationSidebar from "@/components/sections/registration/registration-sidebar";

export const metadata: Metadata = {
  title: "Grower Registration | APSTGA",
  description: "Register as a small tea grower with APSTGA — Arunachal Pradesh Small Tea Growers Association",
};

export default function RegisterPage() {
  return (
    <section className="bg-[#F8FAF8] min-h-screen border-b border-border">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8 w-full max-w-[1400px] mx-auto px-8 lg:px-12 xl:px-16 py-10 items-start">
        <RegistrationForm />
        <div className="hidden lg:block sticky top-[130px]">
          <RegistrationSidebar />
        </div>
      </div>
    </section>
  );
}
