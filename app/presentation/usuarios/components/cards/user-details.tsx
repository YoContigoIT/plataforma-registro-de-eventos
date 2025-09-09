import type { User } from "@prisma/client";
import { PageHeader } from "~/shared/components/common/page-header";
import { AccountInfo } from "./account-info";
import { UserHeader } from "./user-header";

export function UserDetails({ user }: { user: Omit<User, "password"> }) {
  return (
    <>
      <div className="flex items-center mb-6">
        <PageHeader
          title="Detalles del usuario"
          goBack="/usuarios"
          description="Aquí puedes ver y editar la información del usuario."
        />
      </div>
      <div className="w-full bg-card/70 rounded-2xl  p-6">
        <UserHeader user={user} />

        <div className="w-full pt-4 grid grid-cols-1 md:grid-cols-1 ">
          <AccountInfo user={user} />
        </div>
      </div>
    </>
  );
}
