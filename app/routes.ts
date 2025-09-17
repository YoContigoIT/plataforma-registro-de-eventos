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
  },
  attendee: {
    join: "presentation/attendees/routes/join.tsx",
    inviteDetails: "presentation/attendees/routes/invite-details.tsx",
  },
  users: {
    list: "presentation/usuarios/routes/users.tsx",
    detail: "presentation/usuarios/routes/user-by-id.tsx",
    create: "presentation/usuarios/routes/create-user.tsx",
    update: "presentation/usuarios/routes/update-user.tsx",
  },
  registrations: {
    list: "presentation/registrations/routes/registrations.tsx",
    sendInvitations: "presentation/registrations/routes/send-invitations.tsx",
    deleteRegistration:
      "presentation/registrations/routes/delete-registration.tsx",
    resendInvite: "presentation/registrations/routes/resend-invite.tsx",
  },
  panel: {
    dashboard: "presentation/panel/routes/panel.tsx",
  },
  guard: {
    verifyRegistration: "presentation/guards/routes/verify-registration.tsx",
  },
};

export default [
  index(`${ROUTES_PATH.redirect_root}`),
  route("/iniciar-sesion", `${ROUTES_PATH.auth.login}`),
  route("/cerrar-sesion", `${ROUTES_PATH.auth.logout}`),
  route("/inscripcion/:inviteToken", `${ROUTES_PATH.attendee.join}`),
  route("/invitacion/:inviteToken", `${ROUTES_PATH.attendee.inviteDetails}`),
  route(
    "/verificar-registro/:qrCode",
    `${ROUTES_PATH.guard.verifyRegistration}`,
  ),
  layout(`${ROUTES_PATH.layout}`, [
    route("/panel", `${ROUTES_PATH.panel.dashboard}`),
    route("/usuarios", `${ROUTES_PATH.users.list}`),
    route("/usuarios/ver/:userId", `${ROUTES_PATH.users.detail}`),
    route("/usuarios/crear", `${ROUTES_PATH.users.create}`),
    route("/usuarios/editar/:userId", `${ROUTES_PATH.users.update}`),
    route("/eventos", `${ROUTES_PATH.events.list}`),
    route("/eventos/detalle/:id", `${ROUTES_PATH.events.detail}`),
    route("/eventos/crear", `${ROUTES_PATH.events.create}`),
    route("/eventos/actualizar/:id", `${ROUTES_PATH.events.update}`),
    route("/eventos/archivar/:id", `${ROUTES_PATH.events.archive}`),
    route("/registros", `${ROUTES_PATH.registrations.list}`),
    route(
      "/registros/enviar-invitaciones/:id",
      `${ROUTES_PATH.registrations.sendInvitations}`,
    ),
    route(
      "/registros/delete-registration",
      `${ROUTES_PATH.registrations.deleteRegistration}`,
    ),
    route(
      "/registros/resend-invite",
      `${ROUTES_PATH.registrations.resendInvite}`,
    ),
  ]),
] satisfies RouteConfig;
