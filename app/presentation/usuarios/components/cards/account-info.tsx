import type { User } from "@prisma/client";
import { Building, Calendar } from "lucide-react";
import { formatDate } from "~/shared/lib/utils";
import { InfoItem } from "./info-item";

export function AccountInfo({ user }: { user: Omit<User, "password"> }) {
  return (
    <div>
      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">
        Información de la cuenta
      </h4>
      <div className="space-y-4">
        <InfoItem
          icon={
            <Calendar className="w-4 h-4 text-gray-400 dark:text-gray-500 mr-2" />
          }
          label="Fecha de creación"
          value={formatDate(new Date(user.createdAt))}
        />

        <InfoItem
          icon={
            <Building className="w-4 h-4 text-gray-400 dark:text-gray-500 mr-2" />
          }
          label="Departamento"
          value={user.company || "No especificado"}
        />
      </div>
    </div>
  );
}
