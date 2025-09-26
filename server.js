import { EventStatus, PrismaClient, RegistrationStatus } from "@prisma/client";
import compression from "compression";
import express from "express";
import morgan from "morgan";
import cron from "node-cron";
import nodemailer from "nodemailer";

// Short-circuit the type-checking of the built output.
const BUILD_PATH = "./build/server/index.js";
const DEVELOPMENT = process.env.NODE_ENV === "development";
const PORT = Number.parseInt(process.env.PORT || "3000");

console.log(process.env.NODE_ENV);

const app = express();

app.use(compression());
app.disable("x-powered-by");

if (DEVELOPMENT) {
  console.log("Starting development server");
  const viteDevServer = await import("vite").then((vite) =>
    vite.createServer({
      server: { middlewareMode: true },
    })
  );
  app.use(viteDevServer.middlewares);
  app.use(async (req, res, next) => {
    try {
      const source = await viteDevServer.ssrLoadModule("./server/app.ts");
      return await source.app(req, res, next);
    } catch (error) {
      if (typeof error === "object" && error instanceof Error) {
        viteDevServer.ssrFixStacktrace(error);
      }
      next(error);
    }
  });
} else {
  console.log("Starting production server");
  app.use(
    "/assets",
    express.static("build/client/assets", { immutable: true, maxAge: "1y" })
  );
  app.use(morgan("tiny"));
  app.use(express.static("build/client", { maxAge: "1h" }));

  try {
    const buildModule = await import(BUILD_PATH);
    app.use(buildModule.app);
  } catch (error) {
    console.error("Failed to import build module:", error);
    app.use((req, res) => {
      res.status(500).send("Server configuration error");
    });
  }
}

const HOST = DEVELOPMENT ? "localhost" : "0.0.0.0";

app.listen(PORT, HOST, () => {
  console.log(`Server is running on http://${HOST}:${PORT}`);
});

const prisma = new PrismaClient();
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: process.env.EMAIL_SECURE === "true", // true para 465, false para otros puertos
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

cron.schedule("0 1 * * *", async () => {
  const now = new Date();
  console.log("⏰ Revisando eventos...", now);

  try {
    // Cambiar estados de eventos
    await prisma.event.updateMany({
      where: { status: EventStatus.UPCOMING, start_date: { lte: now }, end_date: { gt: now } },
      data: { status: EventStatus.ONGOING },
    });

    await prisma.event.updateMany({
      where: { status: EventStatus.ONGOING, end_date: { lte: now } },
      data: { status: EventStatus.ENDED },
    });

    console.log("✅ Estados de eventos actualizados");

    const upcomingEvents = await prisma.event.findMany({
      where: {
        status: EventStatus.UPCOMING,
        start_date: { gte: now, lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) },
      },
      include: {
        registrations: {
          where: { status: RegistrationStatus.REGISTERED },
          include: { user: true },
        },
      },
    });

  } catch (error) {
    console.error("❌ Error en cronjob:", error);
  }
});

// Recordatorios medio dia todos los dias
cron.schedule("0 12 * * *", async () => {
  try {
    const now = new Date();
    const startWindow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 3, 0, 0, 0);
    const endWindow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 4, 0, 0, 0);

    console.log("⏰ Revisando eventos...", now);
    console.log("⏰ Revisando eventos...", startWindow, endWindow);



    const upcomingEvents = await prisma.event.findMany({
      where: {
        status: EventStatus.UPCOMING,
        start_date: {
          gte: startWindow,
          lt: endWindow,
        },
      },
      include: {
        registrations: {
          where: { status: RegistrationStatus.REGISTERED },
          include: { user: true },
        },
      },
    });



    for (const event of upcomingEvents) {
      for (const reg of event.registrations) {
        if (!reg.user?.email) continue;
        const mailHtml = `
<!DOCTYPE html>
<html lang="es-MX">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Recordatorio de evento</title>
<style>
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f9fafb; padding: 32px 16px; color: #1f2937; }
.container { max-width: 672px; margin: 0 auto; }
.email-card { background: white; border-radius: 12px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); overflow: hidden; }
.header { background: linear-gradient(135deg,#3b82f6 0%,#8b5cf6 100%); color:white; padding:24px; text-align:center; }
.header-content h1 { font-size:32px; font-weight:bold; margin-bottom:8px; }
.header-content p { color: rgba(255,255,255,0.9); margin-bottom:16px; }
.rsvp-badge { background: rgba(255,255,255,0.2); color:white; padding:8px 16px; border-radius:20px; font-size:14px; font-weight:600; border:1px solid rgba(255,255,255,0.3); display:inline-block; }
.content { padding:32px 24px; }
.greeting { margin-bottom:32px; text-align:center; }
.greeting h2 { font-size:24px; font-weight:600; margin-bottom:12px; color:#1f2937; }
.greeting p { color:#6b7280; font-size:16px; }
.event-highlight { background: linear-gradient(135deg,#ffffff 0%, rgba(59,130,246,0.08) 100%); border:2px solid rgba(59,130,246,0.2); border-radius:16px; padding:40px 32px; margin:32px 0; text-align:center; }
.event-name { font-size:36px; font-weight:800; margin-bottom:16px; background: linear-gradient(135deg,#3b82f6 0%,#8b5cf6 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.event-date { font-size:20px; font-weight:600; color:#374151; margin-bottom:8px; }
.event-message { font-size:16px; color:#4b5563; margin-top:16px; }
.cta-section { margin:32px 0; text-align:center; }
.btn-ghost { background:transparent; color:#3b82f6; text-align:center; display:inline-block; margin-top:16px; font-weight:600; padding:12px 24px; border:2px solid #3b82f6; border-radius:8px; text-decoration:none; transition: all 0.3s ease; }
.btn-ghost:hover { background:#3b82f6; color:white; }
.important-note { border-top:1px solid #e5e7eb; padding-top:20px; margin-top:32px; text-align:center; font-size:14px; color:#6b7280; }
.footer { background: rgba(0,0,0,0.02); padding:20px 24px; border-top:1px solid #e5e7eb; text-align:center; }
.footer p { font-size:12px; color:#9ca3af; margin-bottom:8px; }
</style>
</head>
<body>
<div class="container">
  <div class="email-card">
    <!-- Header -->
    <div class="header">
      <div class="header-content">
        <h1>¡Hola ${reg.user.name || "amig@"}!</h1>
        <p>Tenemos un recordatorio para ti 📅</p>
        <div class="rsvp-badge">Evento próximo</div>
      </div>
    </div>

    <!-- Content -->
    <div class="content">
      <p class="event-message">
        ¡Esperamos que estés tan emocionado/a como nosotros! Tu próximo evento está a la vuelta de la esquina. 
        Aquí tienes los detalles:
      </p>

      <div class="event-highlight">
        <h3 class="event-name">${event.name}</h3>
        <p class="event-date">${new Date(event.start_date).toLocaleString("es-MX", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}</p>
        <p class="event-date">Ubicación: ${event.location}</p>

        <p class="event-message">¡No olvides apartar esta fecha en tu calendario!</p>
        <p class="event-message">¡Esperamos verte allí!</p>
      </div>

    

      <div class="important-note">
        Recuerda: Este correo es automático y sirve como recordatorio. ¡Nos vemos pronto! 🎉
      </div>
    </div>

    <div class="footer">
      <p>© 2025 Event Manager. Todos los derechos reservados.</p>
    </div>
  </div>
</div>
</body>
</html>
`;

        await transporter.sendMail({
          from: process.env.EMAIL_FROM,
          to: reg.user.email,
          subject: `Recordatorio: ${event.name}`,
          html: mailHtml,
        });

        console.log(`📧 Enviado a ${reg.user.email} para evento ${event.name}`);
      }
    }
  } catch (error) {
    console.error("❌ Error en cronjob:", error);
  }
});