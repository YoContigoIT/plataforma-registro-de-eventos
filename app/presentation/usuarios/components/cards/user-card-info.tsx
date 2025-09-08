import type { User } from "@prisma/client";
import { ChevronRight, Mail, UserCircle } from "lucide-react";
import { Link } from "react-router";
import { Badge } from "~/shared/components/ui/badge";
import {
  formatName,
  getUserInitials,
  getUserRoleBadge,
} from "~/shared/lib/utils";

interface UserCardInfoProps {
  user: User;
}

export function UserCardInfo({ user }: UserCardInfoProps) {
  const { label, variant } = getUserRoleBadge(user.role);
  return (
    <Link
      to={`/usuarios/ver/${user.id}`}
      key={user.id}
      className={`group bg-card rounded-lg shadow-sm dark:shadow-lg transition-all duration-200 overflow-hidden
        active:border-[#6A1C32]/30 dark:active:border-[#BE9657]/30 active:shadow-inner active:bg-gray-50 dark:active:bg-[#4D4D4D]
        touch-manipulation text-left w-full flex flex-col h-full lg:cursor-pointer lg:hover:scale-[1.01] lg:hover:shadow-lg lg:hover:border-[#6A1C32]/30 dark:lg:hover:border-[#BE9657]/30
        sm:transform sm:transition-transform sm:duration-200 sm:ease-in-out`}
      aria-label={`Ver detalles de ${formatName(user)}`}
    >
      <div className="p-4 sm:p-5 md:p-6 flex-grow">
        <div className="flex items-start space-x-3 sm:space-x-4">
          <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-lg bg-gradient-to-br from-[#6A1C32] to-[#BE9657] dark:from-[#BE9657] dark:to-[#6A1C32] flex items-center justify-center shadow-sm flex-shrink-0">
            <span className="text-sm sm:text-base font-medium text-white">
              {getUserInitials(user)}
            </span>
          </div>

          <div className="flex-grow min-w-0">
            <h4 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-1 truncate">
              {formatName(user)}
            </h4>
            <div className="flex items-center text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">
              <Mail className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1 flex-shrink-0" />
              <span className="truncate">{user.email}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-3 sm:mt-4">
          <Badge
            className={`px-2 py-1 sm:px-2.5 sm:py-1.5 inline-flex items-center text-xs leading-5 font-semibold rounded-full `}
            variant={variant}
          >
            <UserCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1.5" />
            {label}
          </Badge>
          {/* <Badge
            className={`px-2 py-1 sm:px-2.5 sm:py-1.5 inline-flex items-center text-xs leading-5 font-semibold rounded-full ${statusInfo.className}`}
          >
            {statusInfo.label}
          </Badge> */}
        </div>
      </div>

      <div className="w-full px-3 py-2.5 sm:px-4 sm:py-3 md:px-6 md:py-4 bg-primary/10 dark:bg-primary/10 border-t border-gray-200 dark:border-[#5D5D5D] touch-manipulation active:bg-primary/20 dark:active:bg-primary/20 transition-all duration-200 rounded-none">
        <div className="flex items-center justify-center space-x-2 text-xs sm:text-sm font-medium text-primary">
          <span>Ver detalles</span>
          <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" />
        </div>
      </div>
    </Link>
  );
}
