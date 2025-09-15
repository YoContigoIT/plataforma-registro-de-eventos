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
    eventDetailsUrl,
    supportEmail,
  } = data;

  return `<!DOCTYPE html>
<html lang="es-MX">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Confirmación de Registro</title>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Confirmación de tu registro</h1>
        </div>
        
        <div class="content">
            <div class="greeting">
                Hola ${userName}
            </div>
            
            <div class="description">
                Nos complace confirmar tu registro reciente. Agradecemos tu confianza y esperamos que tengas una experiencia agradable.
            </div>
            
            <div class="ticket-section">
                <div class="ticket-number">
                    Tu número de boleto digital #${qrCode}
                </div>
                
                <div class="event-details">
                    <div class="detail-item">
                        <span class="detail-icon">📅</span>
                        <div class="detail-label">Fecha del Evento</div>
                        <div class="detail-value">${eventDate}</div>
                    </div>
                    <div class="detail-item">
                        <span class="detail-icon">🕐</span>
                        <div class="detail-label">Hora del Evento</div>
                        <div class="detail-value">${eventTime}</div>
                    </div>
                </div>
            </div>
            
            <div class="event-info">
                <div class="event-name">${eventName}</div>
                <div class="info-grid">
                    <div class="info-item">
                        <span class="info-label">Ubicación:</span>
                        <span class="info-value">${eventLocation}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Fecha:</span>
                        <span class="info-value">${eventDate}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Hora:</span>
                        <span class="info-value">${eventTime}</span>
                    </div>
                </div>
            </div>
            
            <div class="qr-section">
                <div class="qr-title">Accede a tu boleto digitalmente usando el código QR</div>
                <div class="qr-code">
                    <img src="${qrCodeUrl}" alt="Código QR">
                </div>
            </div>
            
            <div class="message">
                <h3>Información importante</h3>
                <p>${customMessage || 'Te esperamos en este increíble evento. ¡Será una experiencia inolvidable!'}</p>
                <ul>
                    <li>Llega 15 minutos antes del evento</li>
                    <li>Trae una identificación válida</li>
                    <li>Guarda este correo para acceso rápido</li>
                    <li>Contáctanos si tienes preguntas</li>
                </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="${eventDetailsUrl || '#'}" class="btn">Ver detalles del evento</a>
            </div>
        </div>
        
        <div class="footer">
            <div class="footer-links">
                <a href="#">PROTECCIÓN DE DATOS</a>
                <a href="#">SITIO WEB</a>
            </div>
            
            <p>Todos los derechos reservados. Para más detalles, por favor visita nuestro sitio web</p>
            <p>Este es un correo de confirmación automático, por favor no respondas.</p>
            <p>Si tienes alguna pregunta, contáctanos en: ${supportEmail || 'support@example.com'}</p>
        </div>
    </div>
</body>
</html>`;
}