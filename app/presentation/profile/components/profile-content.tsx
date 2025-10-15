import { Key, Loader2, Mail, UserCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { Form } from "react-router";
import { useUserForm } from "~/presentation/usuarios/hooks/use-create-user-form.hook";
import { FormField } from "~/shared/components/common/form-field";
import { SelectInput } from "~/shared/components/common/select-input";
import { TextInput } from "~/shared/components/common/text-input";
import { ResetPasswordForm } from "./forms/reset-password-form";

export default function ProfileContent() {
  const { isSubmitting, errors, handleInputChange, defaultValues } =
    useUserForm(true);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  return (
    <Tabs defaultValue="personal" className="space-y-6">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="personal">Personal</TabsTrigger>
        <TabsTrigger value="security">Seguridad</TabsTrigger>
      </TabsList>

      {/* Personal Information */}
      <TabsContent value="personal" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Información personal</CardTitle>
            <CardDescription>
              Actualice sus datos personales e información de perfil.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Form method="post" replace>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <FormField id="name" error={errors?.name}>
                    <TextInput
                      defaultValue={defaultValues.name || ""}
                      label="Nombre completo"
                      id="name"
                      name="name"
                      type="text"
                      placeholder="Ej: María González"
                      required
                      icon={
                        <UserCircle
                          size={20}
                          className="text-muted-foreground"
                        />
                      }
                      disabled={isSubmitting}
                      onChange={handleInputChange}
                      aria-invalid={Boolean(errors?.name)}
                      aria-describedby={errors?.name ? "name-error" : undefined}
                    />
                  </FormField>
                </div>
                <div className="space-y-2">
                  <FormField id="email" error={errors?.email}>
                    <TextInput
                      defaultValue={defaultValues.email || ""}
                      label="Correo electrónico"
                      icon={
                        <Mail size={20} className="text-muted-foreground" />
                      }
                      id="email"
                      name="email"
                      type="email"
                      placeholder="ejemplo@correo.com"
                      required
                      disabled={isSubmitting}
                      onChange={handleInputChange}
                      aria-invalid={Boolean(errors?.email)}
                      aria-describedby={
                        errors?.email ? "email-error" : undefined
                      }
                    />
                  </FormField>
                </div>
                <div className="space-y-2">
                  <FormField id="company" error={errors?.company}>
                    <TextInput
                      defaultValue={defaultValues.company || ""}
                      label="Departamento"
                      id="company"
                      name="company"
                      type="text"
                      placeholder="Ej: Recursos Humanos"
                      disabled={isSubmitting}
                      onChange={handleInputChange}
                      aria-invalid={Boolean(errors?.company)}
                      aria-describedby={
                        errors?.company ? "company-error" : undefined
                      }
                    />
                  </FormField>
                </div>
                <div className="space-y-2">
                  <FormField id="title" error={errors?.title}>
                    <TextInput
                      defaultValue={defaultValues.title || ""}
                      label="Puesto"
                      id="title"
                      name="title"
                      type="text"
                      placeholder="Ej: Gerente de proyectos"
                      disabled={isSubmitting}
                      onChange={handleInputChange}
                      aria-invalid={Boolean(errors?.title)}
                      aria-describedby={
                        errors?.title ? "title-error" : undefined
                      }
                    />
                  </FormField>
                </div>
                <div className="space-y-2">
                  <FormField id="phone" error={errors?.phone}>
                    <TextInput
                      defaultValue={defaultValues.phone || ""}
                      label="Teléfono"
                      id="phone"
                      name="phone"
                      maxLength={10}
                      type="tel"
                      placeholder="+52 123 456 7890"
                      disabled={isSubmitting}
                      onChange={handleInputChange}
                      aria-invalid={Boolean(errors?.phone)}
                      aria-describedby={
                        errors?.phone ? "phone-error" : undefined
                      }
                    />
                  </FormField>
                </div>
                <div className="space-y-2">
                  <FormField id="role" error={errors?.role}>
                    <SelectInput
                      label="Rol"
                      required
                      options={[
                        { label: "Asistente", value: "ATTENDEE" },
                        { label: "Organizador", value: "ORGANIZER" },
                        { label: "Administrador", value: "ADMIN" },
                        { label: "Guardia", value: "GUARD" },
                      ]}
                      defaultValue={defaultValues.role || "ORGANIZER"}
                      name="role"
                      onValueChange={(value) =>
                        handleInputChange({
                          target: { name: "role", value },
                        } as React.ChangeEvent<HTMLInputElement>)
                      }
                    />
                    <p className="mt-2 text-sm text-muted-foreground">
                      Selecciona el nivel de acceso adecuado para este usuario
                    </p>
                  </FormField>
                </div>
              </div>
              <div className="flex justify-end pt-6 border-t border-border gap-3">
                <Button
                  type="submit"
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {"Guardando cambios..."}
                    </>
                  ) : (
                    "Guardar cambios"
                  )}
                </Button>
              </div>
            </Form>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Security Settings */}
      <TabsContent value="security" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Configuración de seguridad</CardTitle>
            <CardDescription>
              Administre la seguridad y autenticación de su cuenta.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-base">Contraseña</Label>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setShowPasswordForm(!showPasswordForm)}
                >
                  <Key className="mr-2 h-4 w-4" />
                  {showPasswordForm ? "Cancelar" : "Cambiar contraseña"}
                </Button>
              </div>
              <div
                className={`transition-all duration-300 overflow-hidden ${
                  showPasswordForm
                    ? "max-h-96 opacity-100"
                    : "max-h-0 opacity-0"
                }`}
              >
                <ResetPasswordForm />
              </div>

              <Separator />
              {/* TODO: Implementar cuando esten las sesion */}
              {/* <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-base">Sesiones activas</Label>
                  <p className="text-muted-foreground text-sm">
                    Administrar dispositivos que están conectados a su cuenta
                  </p>
                </div>
                <Button variant="outline">
                  <Shield className="mr-2 h-4 w-4" />
                  Administrar sesiones
                </Button>
              </div> */}
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
