import type { User } from "@prisma/client";
import { PageTitleBack } from "~/shared/components/common/page-title-back";
import { AccountInfo } from "./account-info";
import { UserHeader } from "./user-header";

export function UserDetails({ user }: { user: Omit<User, "password"> }) {
  return (
    <>
      <div className="flex items-center mb-6">
        <PageTitleBack
          title="Detalles del usuario"
          href="/usuarios"
          subtitle="Aquí puedes ver y editar la información del usuario."
        />
      </div>
      <div className="w-full bg-card/70 rounded-2xl  p-6">
        <UserHeader user={user} />

        <div className="w-full p-6 md:p-8 grid grid-cols-1 md:grid-cols-1 ">
          <AccountInfo user={user} />
        </div>
      </div>
    </>
  );
}
