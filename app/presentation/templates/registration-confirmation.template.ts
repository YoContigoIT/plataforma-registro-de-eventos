import type { RegistrationConfirmationEmailDto } from "~/domain/dtos/email-invitation.dto";

export function generateRegistrationConfirmationTemplate(
  data: RegistrationConfirmationEmailDto,
): string {
  const {
    userName,
    eventName,
    eventDate,
    eventTime,
    eventLocation,
    qrCode,
    qrCodeUrl,
    customMessage,
    eventUrl,
    privacyPolicyUrl,
    contactEmail,
    ticketsQuantity,
  } = data;

  return `<!DOCTYPE html>
<html lang="es-MX">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirmación de registro</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #1f2937;
            background-color: #f9fafb;
            padding: 32px 16px;
        }
        
        .container {
            max-width: 672px;
            margin: 0 auto;
        }
        
        .email-card {
            background: white;
            border-radius: 12px;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
            overflow: hidden;
        }
        
        .header {
            background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
            color: white;
            padding: 24px;
            text-align: center;
        }
        
        .header-content h1 {
            font-size: 32px;
            font-weight: bold;
            margin-bottom: 8px;
        }
        
        .header-content p {
            color: rgba(255, 255, 255, 0.9);
            margin-bottom: 16px;
        }
        
        .rsvp-badge {
            background: rgba(255, 255, 255, 0.2);
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 600;
            border: 1px solid rgba(255, 255, 255, 0.3);
            display: inline-block;
        }
        
        .content {
            padding: 32px 24px;
        }
        
        .greeting {
            margin-bottom: 32px;
            text-align: center;
        }
        
        .greeting h2 {
            font-size: 24px;
            font-weight: 600;
            margin-bottom: 12px;
            color: #1f2937;
        }
        
        .greeting p {
            color: #6b7280;
            font-size: 16px;
        }
        
        .event-highlight {
            background: linear-gradient(135deg, #ffffff 0%, rgba(59, 130, 246, 0.08) 100%);
            border: 2px solid rgba(59, 130, 246, 0.2);
            border-radius: 16px;
            padding: 32px 24px;
            margin: 32px 0;
            text-align: center;
        }
        
        .event-name {
            font-size: 36px;
            font-weight: 800;
            margin-bottom: 12px;
            background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            line-height: 1.2;
        }
        
        .event-date {
            font-size: 18px;
            font-weight: 600;
            color: #374151;
            margin-bottom: 8px;
        }

        .event-location {
            font-size: 16px;
            color: #6b7280;
        }
        
        .ticket-section {
            background: rgba(59, 130, 246, 0.05);
            border-radius: 12px;
            padding: 24px;
            text-align: center;
            border: 1px solid rgba(59, 130, 246, 0.15);
            margin: 24px 0;
        }

        .ticket-number {
            font-size: 18px;
            font-weight: 700;
            color: #1f2937;
            margin-bottom: 8px;
        }

        .tickets-quantity {
            font-size: 16px;
            font-weight: 600;
            color: #374151;
        }
        
        .qr-section {
            text-align: center;
            margin: 24px 0;
        }

        .qr-box {
            display: inline-block;
            padding: 16px;
            background-color: #ffffff;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            border: 1px solid #e5e7eb;
        }
        
        .custom-message {
            background: rgba(59, 130, 246, 0.05);
            border-left: 4px solid #3b82f6;
            border-radius: 8px;
            padding: 20px;
            margin: 24px 0;
        }
        
        .custom-message h4 {
            font-weight: 600;
            margin-bottom: 8px;
            color: #1f2937;
        }
        
        .custom-message p {
            color: #4b5563;
        }

        .custom-message ul {
            margin: 12px 0 0;
            padding-left: 20px;
            color: #37474f;
        }
        
        .cta-section {
            margin: 32px 0;
            text-align: center;
        }
        
        .button-container {
            display: flex;
            justify-content: center;
            gap: 16px;
            margin-bottom: 20px;
            flex-wrap: wrap;
        }
        
        .btn {
            padding: 14px 28px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 600;
            font-size: 16px;
            text-align: center;
            display: inline-block;
            transition: all 0.3s ease;
            min-width: 160px;
        }
        
        .btn-primary {
            background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
            color: white;
            box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
        }
        
        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(34, 197, 94, 0.4);
        }
        
        .btn-ghost {
            background: transparent;
            color: #3b82f6;
            text-align: center;
            display: block;
            margin-top: 16px;
            font-weight: 500;
        }
        
        .btn-ghost:hover {
            color: #2563eb;
            text-decoration: underline;
        }
        
        .important-note {
            border-top: 1px solid #e5e7eb;
            padding-top: 20px;
            margin-top: 32px;
            text-align: center;
        }
        
        .important-note p {
            font-size: 14px;
            color: #6b7280;
            line-height: 1.5;
        }
        
        .footer {
            background: rgba(0, 0, 0, 0.02);
            padding: 20px 24px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
        }
        
        .footer p {
            font-size: 12px;
            color: #9ca3af;
            margin-bottom: 8px;
        }
        
        .footer-links {
            display: flex;
            justify-content: center;
            gap: 16px;
            font-size: 12px;
            color: #6b7280;
            margin-bottom: 8px;
        }
        
        .footer-links a {
            color: #3b82f6;
            text-decoration: none;
        }
        
        .footer-links a:hover {
            color: #2563eb;
        }

        @media (max-width: 640px) {
            body {
                padding: 16px 8px;
            }
            
            .header {
                padding: 20px 16px;
            }
            
            .header-content h1 {
                font-size: 24px;
            }
            
            .content {
                padding: 24px 16px;
            }
            
            .event-name {
                font-size: 28px;
            }
            
            .event-date {
                font-size: 16px;
            }
            
            .button-container {
                flex-direction: column;
                align-items: center;
                gap: 12px;
            }
            
            .btn {
                width: 100%;
                max-width: 280px;
            }
            
            .footer-links {
                flex-direction: column;
                gap: 8px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="email-card">
            <!-- Header -->
            <div class="header">
                <div class="header-content">
                    <h1>¡Registro confirmado!</h1>
                    <div class="rsvp-badge">
                        Confirmación de registro
                    </div>
                </div>
            </div>
            
            <!-- Content -->
            <div class="content">
                <!-- Greeting -->
                <div class="greeting">
                    <h2>¡Hola ${userName || "estimado/a asistente"}!</h2>
                    <p>
                        Gracias por registrarte. Te compartimos la información clave para tu asistencia.
                    </p>
                </div>

                 <!-- QR Section -->
                <div class="qr-section">
                    <p style="font-size:18px; font-weight:600; color:#263238; margin-bottom:16px;">Presenta este código QR el día del evento</p>
                    <div class="qr-box">
                        <img src="${qrCodeUrl}" alt="Código QR" width="200" height="200" style="display:block;">
                    </div>
                </div>
                
                <!-- Event Highlight -->
                <div class="event-highlight">
                    <h3 class="event-name">${eventName}</h3>
                    <p class="event-date">${eventDate}${eventTime ? ` • ${eventTime}` : ""}</p>
                    <p class="event-location">${eventLocation}</p>
                </div>

                <!-- Ticket Section -->
                <div class="ticket-section">
                    <!-- <p class="ticket-number">Tu boleto digital #${qrCode}</p> -->
                    <p class="tickets-quantity">Has adquirido <strong>${ticketsQuantity}</strong> boleto(s) para este evento.</p>
                </div>
                
                <!-- Custom Message and Important Info -->
                <div class="custom-message">
                    <h4>Información importante</h4>
                    <p>${customMessage || ""}</p>
                    <ul>
                        <li>Llega 15 minutos antes del evento</li>
                        <li>Trae una identificación válida</li>
                        <li>Guarda este correo para acceso rápido</li>
                    </ul>
                </div>
                
                <!-- Important Note -->
                <div class="important-note">
                    <p>
                        <strong>Recuerda:</strong> Este registro es personal e intransferible.
                        Presenta tu QR y una identificación para el acceso.
                    </p>
                </div>
            </div>
            
            <!-- Footer -->
            <div class="footer">
                ${
                  privacyPolicyUrl || eventUrl
                    ? `
                <div class="footer-links">
                  ${privacyPolicyUrl ? `<a href="${privacyPolicyUrl}">Política de privacidad</a>` : ``}
                  ${privacyPolicyUrl && eventUrl ? `<span>•</span>` : ``}
                  ${eventUrl ? `<a href="${eventUrl}">Sitio web</a>` : ``}
                </div>
                `
                    : ``
                }
                <p>© 2024 Event Manager. Todos los derechos reservados.</p>
                <p>Si tienes preguntas, contáctanos en: ${contactEmail}</p>
            </div>
        </div>
    </div>
</body>
</html>`;
}
