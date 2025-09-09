import type { User } from "@prisma/client";
import { ChevronRight, Mail, UserCircle } from "lucide-react";
import { Link } from "react-router";
import { Badge } from "~/shared/components/ui/badge";
import { Button } from "~/shared/components/ui/button";
import { Card, CardContent, CardFooter } from "~/shared/components/ui/card";
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
    <Card className="w-full max-w-sm shadow-xl relative z-10 overflow-hidden py-0">
      <CardContent className="p-4 sm:p-5 md:p-6 space-y-4">
        {/* Header con avatar y nombre */}
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-lg bg-gradient-to-br from-[#6A1C32] to-[#BE9657] dark:from-[#BE9657] dark:to-[#6A1C32] flex items-center justify-center shadow-sm flex-shrink-0">
            <span className="text-sm sm:text-base font-medium text-white">
              {getUserInitials(user)}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white truncate">
              {formatName(user)}
            </h4>
            <div className="flex items-center text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate mt-1">
              <Mail className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1 flex-shrink-0" />
              <span className="truncate">{user.email}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-2">
          <Badge
            className="px-2 py-1 sm:px-2.5 sm:py-1.5 inline-flex items-center text-xs leading-5 font-semibold rounded-full"
            variant={variant}
          >
            <UserCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1.5" />
            {label}
          </Badge>
        </div>
      </CardContent>

      <CardFooter className="bg-primary/10 dark:bg-primary/10 rounded-b-xl cursor-pointer hover:bg-primary/20 dark:hover:bg-primary/20 transition-all duration-200 p-0">
        <Link to={`/usuarios/ver/${user.id}`} className="block w-full">
          <Button
            size="lg"
            variant="ghost"
            className="w-full flex items-center justify-center space-x-2 text-primary"
          >
            <ChevronRight className="w-5 h-5" />
            Ver detalles
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
