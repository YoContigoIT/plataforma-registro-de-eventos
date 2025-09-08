import type { User } from "@prisma/client";
import { Edit, Mail, Trash2 } from "lucide-react";
import { ActionButton } from "~/shared/components/common/action-button";
import { Badge } from "~/shared/components/ui/badge";
import { getUserRoleBadge } from "~/shared/lib/badge-utils";
import { formatName, getUserInitials } from "~/shared/lib/utils";

export function UserHeader({ user }: { user: Omit<User, "password"> }) {
  const { label, variant } = getUserRoleBadge(user.role);

  return (
    <div className="p-6 md:p-8 border-b bg-border flex flex-col sm:flex-row sm:items-center gap-6">
      <div className="h-20 w-20 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-sm flex-shrink-0">
        <span className="text-2xl font-medium text-white">
          {getUserInitials(user)}
        </span>
      </div>
      <div className="flex-grow">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
          {formatName(user)}
        </h3>
        <div className="flex items-center text-gray-500 dark:text-gray-400 mb-3">
          <Mail className="w-4 h-4 mr-2 flex-shrink-0" />
          <span>{user.email}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant={variant}>{label}</Badge>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:ml-auto sm:items-center">
        <ActionButton
          icon={<Edit className="w-4 h-4 mr-2" />}
          text="Editar"
          variant="bg-primary dark:bg-primary/30 border-secondary dark:border-primary text-white hover:bg-primary/10  hover:text-white dark:hover:bg-primary/10 active:bg-primary/10 dark:active:bg-secondary/10 active:text-black dark:active:text-white active:shadow-inner transition-all duration-200"
          href={`/usuarios/actualizar/${user.id}`}
        />

        <ActionButton
          icon={<Trash2 className="w-4 h-4 mr-2" />}
          text="Eliminar"
          onClick={() => {}}
          variant={`bg-secondary dark:bg-secondary border-secondary dark:border-primary text-white hover:bg-primary/10  hover:text-white dark:hover:bg-primary/10 active:bg-primary/10 dark:active:bg-secondary/10 active:text-black dark:active:text-white active:shadow-inner  flex w-full sm:w-auto items-center justify-center px-4 py-2.5 border rounded-lg transition-all duration-200 `}
        />
      </div>
    </div>
  );
}
