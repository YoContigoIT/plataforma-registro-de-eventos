import type { badgeVariants } from "@/ui/badge";
import type { VariantProps } from "class-variance-authority";

type BadgeVariant = VariantProps<typeof badgeVariants>["variant"];

interface BadgeConfig {
  variant: BadgeVariant;
  label: string;
}

// Configuración unificada para badges de estado de órdenes de compra
export function getPurchaseOrderStatusBadge(estado: string): BadgeConfig {
  const statusConfig: Record<string, BadgeConfig> = {
    BORRADOR: { variant: "secondary", label: "Borrador" },
    PENDIENTE_DE_PAGO: { variant: "amber", label: "Pendiente" },
    PAGADA_PARCIALMENTE: { variant: "sky", label: "Parcial" },
    PAGADA: { variant: "emerald", label: "Pagada" },
    VENCIDA: { variant: "destructive", label: "Vencida" },
    CANCELADA: { variant: "slate", label: "Cancelada" },
  };

  return (
    statusConfig[estado] || {
      variant: "slate",
      label: estado,
    }
  );
}

// Configuración unificada para badges de tipo de movimiento/egreso
export function getMovementTypeBadge(tipo: string): BadgeConfig {
  const typeConfig: Record<string, BadgeConfig> = {
    PAGO_ORDEN_COMPRA: { label: "Pago Orden", variant: "sky" },
    PAGO_NOMINA: { label: "Pago Nómina", variant: "emerald" },
    EGRESO_GENERAL: { label: "Egreso General", variant: "amber" },
  };

  return (
    typeConfig[tipo] || {
      label: tipo,
      variant: "slate",
    }
  );
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

// Configuración para badges de estado de fondos
export function getFundingStatusBadge(esPrestamo: boolean): BadgeConfig {
  return {
    variant: esPrestamo ? "amber" : "emerald",
    label: esPrestamo ? "Préstamo" : "Fondo",
  };
}

// Configuración para badges de estado de empleados
export function getEmployeeStatusBadge(estatus: string): BadgeConfig {
  return {
    variant: estatus === "ACTIVO" ? "emerald" : "slate",
    label: estatus === "ACTIVO" ? "Activo" : "Inactivo",
  };
}

// Configuración unificada para badges de estado de nóminas
export function getPayrollStatusBadge(estado: string): BadgeConfig {
  const statusConfig: Record<string, BadgeConfig> = {
    PENDIENTE_DE_PAGO: { variant: "amber", label: "Pendiente de Pago" },
    PAGADA: { variant: "emerald", label: "Pagada" },
  };

  return (
    statusConfig[estado] || {
      variant: "slate",
      label: estado,
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

// Función helper para formatear nombres de roles
export function formatRoleName(rol: string): string {
  const roleNames: Record<string, string> = {
    super_admin: "Super Admin",
    admin: "Admin",
    usuario: "Usuario",
  };

  return roleNames[rol] || rol.replace("_", " ");
}
