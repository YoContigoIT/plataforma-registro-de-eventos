import { Mail } from "lucide-react";
import type { UserEntity } from "~/domain/entities/user.entity";
import { Badge } from "~/shared/components/ui/badge";
import { Card, CardContent } from "~/shared/components/ui/card";
import { getUserRoleBadge } from "~/shared/lib/badge-utils";
import { formatName, getUserInitials } from "~/shared/lib/utils";

export function UserHeader({ user }: { user: Omit<UserEntity, "password"> }) {
  const { label, variant } = getUserRoleBadge(user.role);

  return (
    <Card>
      <CardContent className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="h-20 w-20 rounded-lg bg-gradient-to-br from-primary to-secondary dark:from-secondary dark:to-primary flex items-center justify-center shadow-md flex-shrink-0">
          <span className="text-2xl font-bold text-white">
            {getUserInitials(user)}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-1 truncate">
            {formatName(user)}
          </h3>
          <div className="flex items-center text-gray-500 dark:text-gray-400 mb-3 truncate">
            <Mail className="w-4 h-4 mr-2 flex-shrink-0" />
            <span className="truncate">{user.email}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge
              className="px-2.5 py-1.5 text-xs sm:text-sm font-semibold rounded-full"
              variant={variant}
            >
              {label}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
