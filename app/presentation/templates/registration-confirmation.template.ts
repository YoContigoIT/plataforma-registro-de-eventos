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
    <style>
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 50%, #90caf9 100%);
            color: #37474f;
            min-height: 100vh;
            position: relative;
        }
        
        body::before {
            content: '';
            position: absolute;
            top: -50px;
            left: -50px;
            width: 200px;
            height: 200px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 50%;
            z-index: 0;
        }
        
        body::after {
            content: '';
            position: absolute;
            bottom: -100px;
            right: -100px;
            width: 300px;
            height: 300px;
            background: rgba(255, 255, 255, 0.08);
            border-radius: 50%;
            z-index: 0;
        }
        
        .container {
            width: calc(100% - 40px);
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
            position: relative;
            z-index: 1;
        }
        
        .header {
            background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
            color: white;
            padding: 40px 30px 30px;
            text-align: center;
            position: relative;
        }
        
        .header::before {
            content: '🎫';
            font-size: 48px;
            display: block;
            margin-bottom: 15px;
            opacity: 0.9;
        }
        
        .header h1 {
            margin: 0;
            font-size: 22px;
            font-weight: 600;
            line-height: 1.3;
        }
        
        .header .subtitle {
            font-size: 16px;
            font-weight: 400;
            margin-top: 8px;
            opacity: 0.9;
        }
        
        .content {
            padding: 40px 30px;
            text-align: center;
        }
        
        .greeting {
            font-size: 24px;
            font-weight: 600;
            color: #263238;
            margin-bottom: 15px;
        }
        
        .description {
            font-size: 16px;
            color: #546e7a;
            line-height: 1.5;
            margin-bottom: 30px;
        }
        
        .ticket-section {
            background: linear-gradient(135deg, #f5f5f5 0%, #eeeeee 100%);
            border-radius: 12px;
            padding: 25px 20px;
            margin: 30px 0;
            border: 1px solid #e0e0e0;
        }
        
        .ticket-number {
            font-size: 18px;
            font-weight: 600;
            color: #263238;
            margin-bottom: 20px;
        }
        
        .event-details {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin: 20px 0;
        }
        
        .detail-item {
            text-align: center;
        }
        
        .detail-icon {
            font-size: 24px;
            margin-bottom: 8px;
            display: block;
        }
        
        .detail-label {
            font-size: 12px;
            color: #78909c;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 5px;
        }
        
        .detail-value {
            font-size: 14px;
            font-weight: 600;
            color: #263238;
        }
        
        .qr-section {
            text-align: center;
            margin: 40px 0;
            padding: 30px 20px;
            background: #fafafa;
            border-radius: 12px;
        }
        
        .qr-title {
            font-size: 18px;
            font-weight: 600;
            color: #263238;
            margin-bottom: 20px;
        }
        
        .qr-code {
            display: inline-block;
            padding: 20px;
            background-color: white;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            margin-bottom: 15px;
        }
        
        .qr-code img {
            width: 120px;
            height: 120px;
            display: block;
        }
        
        .event-info {
            background: #f8f9fa;
            border-radius: 12px;
            padding: 25px;
            margin: 25px 0;
            text-align: left;
        }
        
        .event-name {
            font-size: 20px;
            font-weight: 600;
            color: #263238;
            margin-bottom: 15px;
            text-align: center;
        }
        
        .info-grid {
            display: grid;
            gap: 12px;
        }
        
        .info-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 0;
            border-bottom: 1px solid #e9ecef;
        }
        
        .info-item:last-child {
            border-bottom: none;
        }
        
        .info-label {
            font-weight: 500;
            color: #546e7a;
        }
        
        .info-value {
            font-weight: 600;
            color: #263238;
        }
        
        .message {
            background: #e3f2fd;
            padding: 20px;
            border-radius: 12px;
            margin: 25px 0;
            border-left: 4px solid #1976d2;
        }
        
        .message h3 {
            margin-top: 0;
            color: #1565c0;
            font-size: 16px;
        }
        
        .message ul {
            margin: 15px 0;
            padding-left: 20px;
            color: #37474f;
        }
        
        .message li {
            margin-bottom: 8px;
            line-height: 1.4;
        }
        
        .btn {
            display: inline-block;
            background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
            color: white;
            padding: 14px 28px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            margin: 20px 0;
            transition: transform 0.2s ease;
        }
        
        .btn:hover {
            transform: translateY(-2px);
        }
        
        .footer {
            background: #f5f5f5;
            padding: 30px 20px;
            text-align: center;
            border-top: 1px solid #e0e0e0;
        }
        
        .social-icons {
            margin: 20px 0;
        }
        
        .social-icons a {
            display: inline-block;
            margin: 0 10px;
            color: #78909c;
            font-size: 20px;
            text-decoration: none;
        }
        
        .footer-links {
            margin: 20px 0;
            font-size: 12px;
        }
        
        .footer-links a {
            color: #78909c;
            text-decoration: none;
            margin: 0 15px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .footer p {
            color: #90a4ae;
            font-size: 12px;
            margin: 10px 0;
            line-height: 1.4;
        }
        
        @media (max-width: 600px) {
            body {
                padding: 10px;
            }
            .container {
                width: calc(100% - 20px);
                border-radius: 12px;
            }
            .content {
                padding: 30px 20px;
            }
            .event-details {
                grid-template-columns: 1fr;
                gap: 15px;
            }
        }
    </style>
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