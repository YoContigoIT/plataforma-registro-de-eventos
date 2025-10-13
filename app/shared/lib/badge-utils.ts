import type { badgeVariants } from "@/ui/badge";
import type { VariantProps } from "class-variance-authority";

type BadgeVariant = VariantProps<typeof badgeVariants>["variant"];

export interface BadgeConfig {
  variant: BadgeVariant;
  label: string;
}
// Configuración unificada para badges de roles de usuario
export function getUserRoleBadge(rol: string): BadgeConfig {
  const roleConfig: Record<string, BadgeConfig> = {
    ATTENDEE: { variant: "destructive", label: "Invitado" },
    ORGANIZER: { variant: "sky", label: "Organizador" },
    ADMIN: { variant: "emerald", label: "Admin" },
    GUARD: { variant: "emerald", label: "Guardia" },
  };

  return (
    roleConfig[rol] || {
      variant: "slate",
      label: rol.replace("_", " "),
    }
  );
}

// Configuración para badges de sesión activa
export function getSessionStatusBadge(isActive: boolean): BadgeConfig {
  return {
    variant: isActive ? "emerald" : "slate",
    label: isActive ? "Sesión Actual" : "Inactiva",
  };
}
