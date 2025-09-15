import {
  index,
  layout,
  route,
  type RouteConfig,
} from "@react-router/dev/routes";

const ROUTES_PATH = {
  redirect_root: "presentation/root-redirect.tsx",
  layout: "presentation/layout.tsx",
  auth: {
    login: "presentation/auth/routes/login.tsx",
    logout: "presentation/auth/routes/logout.tsx",
  },
  events: {
    list: "presentation/events/routes/events.tsx",
    detail: "presentation/events/routes/detail.tsx",
    create: "presentation/events/routes/create.tsx",
    update: "presentation/events/routes/update.tsx",
    archive: "presentation/events/routes/archive.ts",
    testEmail: "presentation/events/routes/test-email.ts",
  },
  attendee: {
    join: "presentation/attendees/routes/join.tsx",
  },
};

export default [
  index(`${ROUTES_PATH.redirect_root}`),
  route("/iniciar-sesion", `${ROUTES_PATH.auth.login}`),
  route("/cerrar-sesion", `${ROUTES_PATH.auth.logout}`),
  route("/join/:eventId", `${ROUTES_PATH.attendee.join}`),
  layout(`${ROUTES_PATH.layout}`, [
    route("/panel", "presentation/panel/routes/panel.tsx"),
    route("/usuarios", "presentation/usuarios/routes/users.tsx"),
    route(
      "/usuarios/ver/:userId",
      "presentation/usuarios/routes/user-by-id.tsx"
    ),
    route("/usuarios/crear", "presentation/usuarios/routes/create-user.tsx"),
    route(
      "/usuarios/editar/:userId",
      "presentation/usuarios/routes/update-user.tsx"
    ),
    route("/eventos", `${ROUTES_PATH.events.list}`),
    route("/eventos/detalle/:id", `${ROUTES_PATH.events.detail}`),
    route("/eventos/crear", `${ROUTES_PATH.events.create}`),
    route("/eventos/actualizar/:id", `${ROUTES_PATH.events.update}`),
    route("/eventos/archivar/:id", `${ROUTES_PATH.events.archive}`),
    route("/eventos/test-email", `${ROUTES_PATH.events.testEmail}`),
  ]),
] satisfies RouteConfig;
