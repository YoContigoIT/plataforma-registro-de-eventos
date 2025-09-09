import {
  Briefcase,
  Key,
  Loader2,
  Mail,
  Shield,
  UserCircle,
} from "lucide-react";
import { Form } from "react-router";
import { FormField } from "~/shared/components/common/form-field";
import { PageTitleBack } from "~/shared/components/common/page-title-back";
import { PasswordInput } from "~/shared/components/common/password-input";
import { SelectInput } from "~/shared/components/common/select-input";
import { TextInput } from "~/shared/components/common/text-input";
import { Button } from "~/shared/components/ui/button";
import { useUserForm } from "../../hooks/use-create-user-form.hook";

interface UserFormProps {
  isEditing?: boolean;
  actionUrl: string;
}

export function UserForm({ isEditing, actionUrl }: UserFormProps) {
  const { isSubmitting, errors, handleInputChange, defaultValues } =
    useUserForm(isEditing);

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center mb-8">
        <PageTitleBack
          title={isEditing ? "Editar usuario" : "Crear usuario"}
          subtitle={
            isEditing
              ? "Modifica la información del usuario"
              : "Completa la información para crear un nuevo usuario"
          }
          href="/usuarios"
        />
      </div>

      {/* Card con los colores de identidad */}
      <div className="bg-card rounded-xl shadow-sm p-6 md:p-8 border border-border">
        <Form method="post" action={actionUrl} className="space-y-8">
          {/* Sección de datos personales */}
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center">
              <UserCircle size={20} className="mr-2 text-primary" />
              Información personal
            </h2>
            <div className="grid gap-5 md:grid-cols-2">
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
                    <UserCircle size={20} className="text-muted-foreground" />
                  }
                  disabled={isSubmitting}
                  onChange={handleInputChange}
                  aria-invalid={Boolean(errors?.name)}
                  aria-describedby={errors?.name ? "name-error" : undefined}
                />
              </FormField>

              <FormField id="email" error={errors?.email}>
                <TextInput
                  defaultValue={defaultValues.email || ""}
                  label="Correo electrónico"
                  icon={<Mail size={20} className="text-muted-foreground" />}
                  id="email"
                  name="email"
                  type="email"
                  placeholder="ejemplo@correo.com"
                  required
                  disabled={isSubmitting}
                  onChange={handleInputChange}
                  aria-invalid={Boolean(errors?.email)}
                  aria-describedby={errors?.email ? "email-error" : undefined}
                />
              </FormField>
            </div>
          </section>

          {/* Sección de información laboral */}
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center">
              <Briefcase size={20} className="mr-2 text-primary" />
              Información laboral
            </h2>
            <div className="grid gap-5 md:grid-cols-2">
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
                  aria-describedby={errors?.title ? "title-error" : undefined}
                />
              </FormField>

              <FormField id="phone" error={errors?.phone}>
                <TextInput
                  defaultValue={defaultValues.phone || ""}
                  label="Teléfono"
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="+52 123 456 7890"
                  disabled={isSubmitting}
                  onChange={handleInputChange}
                  aria-invalid={Boolean(errors?.phone)}
                  aria-describedby={errors?.phone ? "phone-error" : undefined}
                />
              </FormField>
            </div>
          </section>

          {/* Sección de permisos */}
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center">
              <Shield size={20} className="mr-2 text-primary" />
              Permisos y acceso
            </h2>
            <div className="grid gap-5">
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
                  onValueChange={(value) => {
                    // setSelectedRole(value);
                    handleInputChange({
                      target: { name: "role", value },
                    } as React.ChangeEvent<HTMLInputElement>);
                  }}
                />
                <p className="mt-2 text-sm text-muted-foreground">
                  Selecciona el nivel de acceso adecuado para este usuario
                </p>
              </FormField>

              {/* Contraseña (solo al crear) */}
              {!isEditing && (
                <FormField id="password" error={errors?.password}>
                  <PasswordInput
                    name="password"
                    label="Contraseña"
                    placeholder="Escribe una contraseña segura"
                    autoComplete="new-password"
                    icon={<Key size={20} className="text-muted-foreground" />}
                    required
                  />
                  <p className="mt-2 text-sm text-muted-foreground">
                    La contraseña debe tener al menos 8 caracteres, incluyendo
                    mayúsculas, minúsculas y números
                  </p>
                </FormField>
              )}
            </div>
          </section>

          {/* Botones de acción */}
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-6 border-t border-border">
            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto"
              disabled={isSubmitting}
              onClick={() => window.history.back()}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={isSubmitting}
              aria-busy={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditing ? "Guardando cambios..." : "Creando usuario..."}
                </>
              ) : isEditing ? (
                "Guardar cambios"
              ) : (
                "Crear usuario"
              )}
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
}
