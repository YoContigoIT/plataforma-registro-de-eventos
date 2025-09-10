import { Building, Calendar } from "lucide-react";
import type { UserEntity } from "~/domain/entities/user.entity";
import { Card, CardContent } from "~/shared/components/ui/card";
import { formatDate } from "~/shared/lib/utils";

export function AccountInfo({ user }: { user: Omit<UserEntity, "password"> }) {
  return (
    <Card>
      <CardContent className="p-4 sm:p-5 md:p-6 space-y-4">
        <h4 className="text-sm sm:text-base font-semibold text-gray-600 dark:text-gray-400 mb-4">
          Información de la cuenta
        </h4>
        <div className="space-y-4">
          <div className="flex items-center">
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 dark:text-gray-500 mr-2" />
            <span className="text-gray-700 dark:text-gray-200">
              Fecha de creación: {formatDate(new Date(user.createdAt))}
            </span>
          </div>
          <div className="flex items-center">
            <Building className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 dark:text-gray-500 mr-2" />
            <span className="text-gray-700 dark:text-gray-200">
              Departamento: {user.company || "No especificado"}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
