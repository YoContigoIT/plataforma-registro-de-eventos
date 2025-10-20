import { UserRole } from "@prisma/client";
import { MonitorCog, PartyPopper, Users } from "lucide-react";
import type * as React from "react";
import { Link, useLocation } from "react-router";
import type { UserEntity } from "~/domain/entities/user.entity";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../ui/sidebar";
import { NavUser } from "./nav-user";

type NavItem = {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: UserRole[];
};

type NavSection = {
  title: string;
  items: NavItem[];
  icon?: React.ComponentType<{ className?: string }>;
  roles?: UserRole[];
};

const navMenu: NavSection[] = [
  {
    title: "Gestión",
    items: [
      {
        title: "Eventos",
        url: "/eventos",
        icon: PartyPopper,
        roles: [UserRole.ADMIN, UserRole.ORGANIZER],
      },
      {
        title: "Usuarios",
        url: "/usuarios",
        icon: Users,
        roles: [UserRole.ADMIN, UserRole.ORGANIZER],
      },
      {
        title: "Registros",
        url: "/registros",
        icon: Users,
        roles: [UserRole.ADMIN, UserRole.ORGANIZER],
      },
    ],
  },
  /* {
    title: "Configuración",
    items: [
      {
        title: "Perfil",
        url: "/perfil",
        icon: UserCircle,
      },
      {
        title: "Sesiones",
        url: "/sesiones",
        icon: Shield,
        roles: [UserRole.ADMIN],
      },
    ],
  }, */
];

const hasAccess = (userRole: UserRole, allowedRoles?: UserRole[]): boolean => {
  if (!allowedRoles || allowedRoles.length === 0) {
    return true;
  }

  return allowedRoles.includes(userRole);
};

export function AppSidebar({
  user,
  ...props
}: React.ComponentProps<typeof Sidebar> & { user: UserEntity }) {
  const location = useLocation();

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <MonitorCog className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Event Manager</span>
                  <span className="truncate text-xs">Event Management</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <div className="space-y-2 px-2">
          {navMenu
            .filter((section) => hasAccess(user.role, section.roles))
            .map((section) => {
              const accessibleItems = section.items.filter((item) =>
                hasAccess(user.role, item.roles)
              );

              if (accessibleItems.length === 0) return null;

              return (
                <SidebarGroup key={section.title}>
                  <div className="flex items-center gap-2 px-2">
                    <SidebarGroupLabel className="text-xs font-medium text-sidebar-foreground/60">
                      {section.title}
                    </SidebarGroupLabel>
                  </div>
                  <SidebarMenu className="gap-1">
                    {accessibleItems.map((item) => {
                      const isActive = location.pathname === item.url;
                      return (
                        <SidebarMenuItem key={item.title}>
                          <SidebarMenuButton
                            asChild
                            isActive={isActive}
                            className="h-10 px-3 rounded-lg hover:bg-sidebar-accent transition-colors"
                          >
                            <Link
                              to={item.url}
                              className="flex items-center gap-3 w-full"
                            >
                              <item.icon className="size-5 flex-shrink-0" />
                              <span className="font-medium">{item.title}</span>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}
                  </SidebarMenu>
                </SidebarGroup>
              );
            })}
        </div>
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
