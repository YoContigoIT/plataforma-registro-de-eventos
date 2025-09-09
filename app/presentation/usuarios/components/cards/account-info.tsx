import type { User } from "@prisma/client";
import { Building, Calendar } from "lucide-react";
import { Card, CardContent } from "~/shared/components/ui/card";
import { formatDate } from "~/shared/lib/utils";
import { InfoItem } from "./info-item";

export function AccountInfo({ user }: { user: Omit<User, "password"> }) {
  return (
    <Card className="w-full shadow-lg relative z-10 overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <CardContent className="p-4 sm:p-5 md:p-6 space-y-4">
        <h4 className="text-sm sm:text-base font-semibold text-gray-600 dark:text-gray-400 mb-4">
          Información de la cuenta
        </h4>

        <div className="space-y-4">
          <InfoItem
            icon={
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 dark:text-gray-500 mr-2" />
            }
            label="Fecha de creación"
            value={formatDate(new Date(user.createdAt))}
          />

          <InfoItem
            icon={
              <Building className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 dark:text-gray-500 mr-2" />
            }
            label="Departamento"
            value={user.company || "No especificado"}
          />
        </div>
      </CardContent>
    </Card>
  );
}
