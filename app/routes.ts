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
  },
};

export default [
  index(`${ROUTES_PATH.redirect_root}`),
  route("/iniciar-sesion", `${ROUTES_PATH.auth.login}`),
  route("/cerrar-sesion", `${ROUTES_PATH.auth.logout}`),
  layout(`${ROUTES_PATH.layout}`, [
    route("/panel", "presentation/panel/routes/panel.tsx"),
    route("/eventos", `${ROUTES_PATH.events.list}`),
    route("/eventos/detalle/:id", `${ROUTES_PATH.events.detail}`),
    route("/eventos/crear", `${ROUTES_PATH.events.create}`),
    route("/eventos/actualizar/:id", `${ROUTES_PATH.events.update}`),
  ]),
] satisfies RouteConfig;
