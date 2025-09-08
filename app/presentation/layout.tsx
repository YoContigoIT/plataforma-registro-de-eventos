import { AppSidebar } from "@/components/layout/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/ui/breadcrumb";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/ui/sidebar";
import { Separator } from "@radix-ui/react-separator";
import React from "react";
import { Link, Outlet, useLocation } from "react-router";
import { authMiddleware } from "~/infrastructure/middleware/auth.middleware";
import type { Route } from "./+types/layout";

export function meta() {
  return [
    { title: "Página de inicio - Gestor de Finanzas" },
    { name: "description", content: "Bienvenido a el Gestor de Finanzas!" },
  ];
}

export const loader = authMiddleware;
export default function Layout({ loaderData }: Route.ComponentProps) {
  const user = loaderData?.user;

  const { pathname } = useLocation();

  if (!user) {
    return null;
  }

  const pathnames = pathname.split("/").filter((x) => x);

  return (
    <SidebarProvider>
      <AppSidebar user={user} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to="/">Inicio</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                {pathnames.length > 0 ? <BreadcrumbSeparator /> : null}
                {pathnames.map((value, index) => {
                  const to = `/${pathnames.slice(0, index + 1).join("/")}`;
                  const isLast = index === pathnames.length - 1;
                  const name = value.charAt(0).toUpperCase() + value.slice(1);

                  return (
                    <React.Fragment key={to}>
                      <BreadcrumbItem>
                        {isLast ? (
                          <BreadcrumbPage>{name}</BreadcrumbPage>
                        ) : (
                          <BreadcrumbLink asChild>
                            <Link to={to}>{name}</Link>
                          </BreadcrumbLink>
                        )}
                      </BreadcrumbItem>
                      {index < pathnames.length - 1 && <BreadcrumbSeparator />}
                    </React.Fragment>
                  );
                })}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-6 p-8">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
