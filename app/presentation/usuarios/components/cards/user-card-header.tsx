import { UserPlus } from "lucide-react";
import { Link } from "react-router";
import { PageHeader } from "~/shared/components/common/page-header";

export default function UserCardHeader() {
  return (
    <PageHeader
      title="Usuarios"
      showSearchBar={true}
      searchPlaceholder="Buscar por nombre de usuario..."
      actions={
        <Link
          to="/usuarios/crear"
          className="inline-flex items-center justify-center text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 w-full py-3 px-4 bg-primary hover:bg-primary/90 active:bg-primary/80 dark:bg-secondary dark:hover:bg-secondary/90 dark:active:bg-secondary/80 text-white rounded-lg  duration-200 active:shadow-inner touch-manipulation lg:cursor-pointer"
        >
          <UserPlus className="w-5 h-5 mr-2" />
          Crear usuario
        </Link>
      }
    />
  );
}
