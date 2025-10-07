# Instrucciones para Importar Correos desde Excel

## Formato del Archivo Excel

Para importar correos electrónicos al formulario de invitaciones, puedes utilizar un archivo Excel (.xlsx o .xls) con la siguiente estructura:

### Opción 1: Archivo con columna específica de correos

El sistema buscará automáticamente columnas con nombres como:
- "Correo"
- "Email"
- "E-mail"
- "Mail"

Ejemplo:

| No. Empleado | Nombre         | Correo                   | Ocupación     |
|-------------|----------------|--------------------------|---------------|
| 1001        | Juan Pérez     | juan.perez@ejemplo.com   | Desarrollador |
| 1002        | María López    | maria.lopez@ejemplo.com  | Diseñadora    |
| 1003        | Carlos Rodríguez | carlos.rodriguez@ejemplo.com | Analista   |

### Opción 2: Archivo sin columna específica

Si el archivo no tiene una columna con nombre específico para correos, el sistema buscará en todas las celdas cualquier texto que parezca una dirección de correo electrónico válida.

Ejemplo:

| ID  | Información de contacto                                 | Departamento |
|-----|--------------------------------------------------------|--------------|
| A01 | Juan Pérez, Tel: 555-1234, juan.perez@ejemplo.com      | Ventas       |
| A02 | María López, Oficina 302, maria.lopez@ejemplo.com      | Marketing    |
| A03 | carlos.rodriguez@ejemplo.com, Ext. 4567                | Sistemas     |

## Pasos para Importar

1. En el formulario de invitaciones, haz clic en el botón "Seleccionar archivo"
2. Selecciona tu archivo Excel (.xlsx o .xls)
3. El sistema procesará el archivo y extraerá los correos electrónicos válidos
4. Los correos extraídos se agregarán automáticamente al campo de correos electrónicos
5. Puedes seguir añadiendo más correos manualmente si lo deseas
6. Completa el resto del formulario y envía las invitaciones

## Notas Importantes

- El sistema validará que los correos tengan un formato válido (ejemplo@dominio.com)
- Se eliminarán automáticamente los correos duplicados
- Si no se encuentran correos válidos en el archivo, se mostrará un mensaje de advertencia
- Tamaño máximo de archivo: 100MB

