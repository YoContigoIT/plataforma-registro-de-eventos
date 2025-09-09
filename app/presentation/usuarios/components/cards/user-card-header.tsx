import { UserPlus } from "lucide-react";
import { Link } from "react-router";
import { PageHeader } from "~/shared/components/common/page-header";
import { Button } from "~/shared/components/ui/button";

export default function UserCardHeader() {
  return (
    <PageHeader
      title="Usuarios"
      showSearchBar={true}
      searchPlaceholder="Buscar por nombre de usuario..."
      actions={
        <Link to="/usuarios/crear">
          <Button size="lg">
            <UserPlus className="w-5 h-5 mr-2" />
            Crear usuario
          </Button>
        </Link>
      }
    />
  );
}
