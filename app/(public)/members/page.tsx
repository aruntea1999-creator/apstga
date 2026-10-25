import type { Metadata } from "next";
import { UsersRound } from "lucide-react";
import { prisma } from "@/lib/db";

export const metadata: Metadata = {
  title: "Our Members | APSTGA",
  description:
    "Meet the executive members of the Arunachal Pradesh Small Tea Growers Association.",
};

export const dynamic = "force-dynamic";

interface MemberView {
  id: string;
  name: string;
  designation: string;
  photoType: string | null;
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export default async function MembersPage() {
  let members: MemberView[] = [];

  try {
    members = await prisma.executiveMember.findMany({
      where: { active: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      select: { id: true, name: true, designation: true, photoType: true },
    });
  } catch {
    members = [];
  }

  return (
    <section className="relative overflow-hidden bg-white py-20">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[380px] bg-gradient-to-b from-primary/[0.04] to-transparent" />

      <div className="relative w-full max-w-[1400px] mx-auto px-8 lg:px-12 xl:px-16">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/5 border border-primary/10 text-primary text-sm font-medium mb-5">
            <UsersRound className="w-4 h-4" />
            Leadership &amp; Governance
          </div>
          <h1 className="text-[40px] md:text-[48px] font-extrabold text-foreground leading-[1.1] tracking-[-0.02em] mb-3">
            Our <span className="text-primary">Members</span>
          </h1>
          <p className="text-muted text-[16px] max-w-2xl mx-auto">
            Meet the executive members leading APSTGA&apos;s mission to empower small tea
            growers across Arunachal Pradesh.
          </p>
        </div>

        {members.length === 0 ? (
          <div className="text-center py-16">
            <UsersRound className="w-12 h-12 text-muted/30 mx-auto mb-3" />
            <p className="text-sm font-medium text-foreground">
              Our members will be introduced soon
            </p>
            <p className="text-xs text-muted mt-1">
              Please check back later to meet the APSTGA leadership team.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 md:gap-7 justify-items-center">
            {members.map((member) => {
              const photoUrl = member.photoType
                ? `/api/members/${member.id}/photo`
                : null;

              return (
                <article
                  key={member.id}
                  className="group w-full max-w-[260px] overflow-hidden rounded-[22px] border border-border bg-white shadow-[0_2px_12px_rgba(16,24,40,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_44px_rgba(16,24,40,0.14)]"
                >
                  <div className="relative aspect-[4/5] overflow-hidden bg-[#eef5ef]">
                    {photoUrl ? (
                      <img
                        src={photoUrl}
                        alt={member.name}
                        className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.04]"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <span className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-2xl font-extrabold text-primary">
                          {initials(member.name)}
                        </span>
                      </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/25 to-transparent" />
                  </div>

                  <div className="relative p-4 text-center">
                    <h2 className="text-[15px] font-bold leading-snug text-foreground">
                      {member.name}
                    </h2>
                    <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#15803d]">
                      {member.designation}
                    </p>
                    <span className="mx-auto mt-3 block h-[3px] w-8 rounded-full bg-primary/20" />
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
