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
};

export default [
  index(`${ROUTES_PATH.redirect_root}`),
  route("/iniciar-sesion", `${ROUTES_PATH.auth.login}`),
  route("/cerrar-sesion", `${ROUTES_PATH.auth.logout}`),
  layout(`${ROUTES_PATH.layout}`, [
    route("/panel", "presentation/panel/routes/panel.tsx"),
    route("/usuarios", "presentation/usuarios/routes/users.tsx"),
    route(
      "/usuarios/ver/:userId",
      "presentation/usuarios/routes/user-by-id.tsx"
    ),
    // route("/usuarios/crear", "presentation/usuarios/routes/create-user.tsx"),
    // route(
    //   "/usuarios/editar/:userId",
    //   "presentation/usuarios/routes/edit-user.tsx"
    // ),
  ]),
] satisfies RouteConfig;
