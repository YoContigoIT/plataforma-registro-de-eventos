import type { InvitationEmailDto } from "~/domain/dtos/email-invitation.dto";

export function generateInvitationEmailTemplate(
  data: InvitationEmailDto,
): string {
  const {
    userName,
    eventName,
    eventDate,
    eventTime,
    eventLocation,
    customMessage,
    inviteUrl,
    eventDetailsUrl,
    inviteToken,
    supportEmail,
  } = data;

  return `<!DOCTYPE html>
<html lang="es-MX">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invitación al Evento</title>
    <style>
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, 
                oklch(0.9842 0.0034 247.8575) 0%, 
                oklch(0.9683 0.0069 247.8956) 50%, 
                oklch(0.9132 0.0422 257.1315) 100%);
            color: oklch(0.2077 0.0398 265.7549);
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
            background: oklch(0.6231 0.188 259.8145 / 0.1);
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
            background: oklch(0.7137 0.1434 254.624 / 0.08);
            border-radius: 50%;
            z-index: 0;
        }
        
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: white;
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 8px 32px oklch(0.2077 0.0398 265.7549 / 0.12);
            position: relative;
            z-index: 1;
        }
        
        .header {
            background: linear-gradient(135deg, 
                oklch(0.6231 0.188 259.8145) 0%, 
                oklch(0.5461 0.2152 262.8809) 100%);
            color: white;
            padding: 40px 30px 30px;
            text-align: center;
            position: relative;
            overflow: hidden;
        }
        
        .header::before {
            content: '';
            position: absolute;
            top: -20px;
            right: -20px;
            width: 100px;
            height: 100px;
            background: oklch(1 0 0 / 0.1);
            border-radius: 50%;
            z-index: 0;
        }
        
        .header-icon {
            font-size: 48px;
            display: block;
            margin-bottom: 15px;
            opacity: 0.95;
            position: relative;
            z-index: 1;
        }
        
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 700;
            line-height: 1.2;
            position: relative;
            z-index: 1;
        }
        
        .header .subtitle {
            font-size: 16px;
            font-weight: 400;
            margin-top: 8px;
            opacity: 0.9;
            position: relative;
            z-index: 1;
        }
        
        .content {
            padding: 40px 30px;
        }
        
        .greeting {
            font-size: 24px;
            font-weight: 600;
            color: oklch(0.2077 0.0398 265.7549);
            margin-bottom: 15px;
            text-align: center;
        }
        
        .description {
            font-size: 16px;
            color: oklch(0.5544 0.0407 257.4166);
            line-height: 1.6;
            margin-bottom: 30px;
            text-align: center;
        }
        
        .event-card {
            background: linear-gradient(135deg, 
                oklch(0.9683 0.0069 247.8956) 0%, 
                oklch(0.9132 0.0422 257.1315) 100%);
            border-radius: 16px;
            padding: 30px;
            margin: 30px 0;
            border: 1px solid oklch(0.869 0.0198 252.8943);
            position: relative;
            overflow: hidden;
        }
        
        .event-card::before {
            content: '';
            position: absolute;
            top: -10px;
            left: -10px;
            width: 60px;
            height: 60px;
            background: oklch(0.6231 0.188 259.8145 / 0.1);
            border-radius: 50%;
            z-index: 0;
        }
        
        .event-name {
            font-size: 22px;
            font-weight: 700;
            color: oklch(0.2077 0.0398 265.7549);
            margin-bottom: 20px;
            text-align: center;
            position: relative;
            z-index: 1;
        }
        
        .event-details {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin: 20px 0;
            position: relative;
            z-index: 1;
        }
        
        .detail-item {
            text-align: center;
            padding: 15px;
            background: white;
            border-radius: 12px;
            box-shadow: 0 2px 8px oklch(0.2077 0.0398 265.7549 / 0.08);
        }
        
        .detail-icon {
            font-size: 24px;
            margin-bottom: 8px;
            display: block;
            color: oklch(0.6231 0.188 259.8145);
        }
        
        .detail-label {
            font-size: 12px;
            color: oklch(0.5544 0.0407 257.4166);
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 5px;
            font-weight: 500;
        }
        
        .detail-value {
            font-size: 14px;
            font-weight: 600;
            color: oklch(0.2077 0.0398 265.7549);
            line-height: 1.3;
        }
        
        .custom-message {
            background: oklch(0.9132 0.0422 257.1315);
            padding: 25px;
            border-radius: 12px;
            margin: 25px 0;
            border-left: 4px solid oklch(0.6231 0.188 259.8145);
            position: relative;
        }
        
        .custom-message::before {
            content: '💬';
            font-size: 20px;
            position: absolute;
            top: 15px;
            right: 15px;
            opacity: 0.7;
        }
        
        .custom-message h3 {
            margin-top: 0;
            color: oklch(0.6231 0.188 259.8145);
            font-size: 16px;
            font-weight: 600;
        }
        
        .custom-message p {
            margin-bottom: 0;
            color: oklch(0.2077 0.0398 265.7549);
            line-height: 1.5;
        }
        
        .cta-section {
            text-align: center;
            margin: 40px 0;
            padding: 30px 20px;
            background: linear-gradient(135deg, 
                oklch(0.9842 0.0034 247.8575) 0%, 
                oklch(0.9683 0.0069 247.8956) 100%);
            border-radius: 16px;
            border: 1px solid oklch(0.869 0.0198 252.8943);
        }
        
        .cta-title {
            font-size: 18px;
            font-weight: 600;
            color: oklch(0.2077 0.0398 265.7549);
            margin-bottom: 20px;
        }
        
        .btn {
            display: inline-block;
            background: linear-gradient(135deg, 
                oklch(0.6231 0.188 259.8145) 0%, 
                oklch(0.5461 0.2152 262.8809) 100%);
            color: white;
            padding: 16px 32px;
            text-decoration: none;
            border-radius: 12px;
            font-weight: 600;
            font-size: 16px;
            transition: all 0.3s ease;
            box-shadow: 0 4px 12px oklch(0.6231 0.188 259.8145 / 0.3);
            border: none;
            cursor: pointer;
        }
        
        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px oklch(0.6231 0.188 259.8145 / 0.4);
        }
        
        .btn-secondary {
            background: transparent;
            color: oklch(0.6231 0.188 259.8145);
            border: 2px solid oklch(0.6231 0.188 259.8145);
            box-shadow: none;
            margin-left: 15px;
        }
        
        .btn-secondary:hover {
            background: oklch(0.6231 0.188 259.8145);
            color: white;
        }
        
        .footer {
            background: oklch(0.9288 0.0126 255.5078);
            padding: 30px;
            text-align: center;
            border-top: 1px solid oklch(0.869 0.0198 252.8943);
        }
        
        .footer-links {
            margin-bottom: 20px;
        }
        
        .footer-links a {
            color: oklch(0.6231 0.188 259.8145);
            text-decoration: none;
            margin: 0 15px;
            font-size: 12px;
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .footer p {
            margin: 8px 0;
            font-size: 12px;
            color: oklch(0.5544 0.0407 257.4166);
            line-height: 1.4;
        }
        
        .token-info {
            background: oklch(0.9683 0.0069 247.8956);
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
            border: 1px solid oklch(0.869 0.0198 252.8943);
        }
        
        .token-info p {
            margin: 0;
            font-size: 12px;
            color: oklch(0.5544 0.0407 257.4166);
        }
        
        .token-code {
            font-family: 'Monaco', 'Menlo', monospace;
            background: white;
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 11px;
            color: oklch(0.2077 0.0398 265.7549);
            border: 1px solid oklch(0.869 0.0198 252.8943);
            margin-top: 8px;
            word-break: break-all;
        }
        
        @media (max-width: 600px) {
            .container {
                margin: 10px;
                border-radius: 16px;
            }
            
            .content {
                padding: 30px 20px;
            }
            
            .event-details {
                grid-template-columns: 1fr;
                gap: 15px;
            }
            
            .btn {
                display: block;
                margin: 10px 0;
            }
            
            .btn-secondary {
                margin-left: 0;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <span class="header-icon">🎉</span>
            <h1>¡Estás Invitado!</h1>
            <p class="subtitle">Te esperamos en este increíble evento</p>
        </div>
        
        <div class="content">
            <div class="greeting">
                ¡Hola ${userName}!
            </div>
            
            <p class="description">
                Nos complace invitarte a participar en <strong>${eventName}</strong>. 
                Será una experiencia única que no querrás perderte.
            </p>
            
            <div class="event-card">
                <div class="event-name">${eventName}</div>
                
                <div class="event-details">
                    <div class="detail-item">
                        <span class="detail-icon">📅</span>
                        <div class="detail-label">Fecha</div>
                        <div class="detail-value">${eventDate}</div>
                    </div>
                    
                    <div class="detail-item">
                        <span class="detail-icon">⏰</span>
                        <div class="detail-label">Hora</div>
                        <div class="detail-value">${eventTime}</div>
                    </div>
                    
                    <div class="detail-item">
                        <span class="detail-icon">📍</span>
                        <div class="detail-label">Ubicación</div>
                        <div class="detail-value">${eventLocation}</div>
                    </div>
                    
                    <div class="detail-item">
                        <span class="detail-icon">🎫</span>
                        <div class="detail-label">Estado</div>
                        <div class="detail-value">Invitación Pendiente</div>
                    </div>
                </div>
            </div>
            
            ${
              customMessage
                ? `
            <div class="custom-message">
                <h3>Mensaje Especial</h3>
                <p>${customMessage}</p>
            </div>
            `
                : ""
            }
            
            <div class="cta-section">
                <div class="cta-title">¿Confirmas tu asistencia?</div>
                <a href="${inviteUrl}" class="btn">Confirmar Asistencia</a>
                <a href="${eventDetailsUrl}" class="btn btn-secondary">Ver Detalles</a>
            </div>
            
            <div class="token-info">
                <p><strong>Código de invitación:</strong></p>
                <div class="token-code">${inviteToken}</div>
                <p>Guarda este código para futuras referencias.</p>
            </div>
        </div>
        
        <div class="footer">
            <div class="footer-links">
                <a href="#">PROTECCIÓN DE DATOS</a>
                <a href="#">SITIO WEB</a>
                <a href="#">SOPORTE</a>
            </div>
            
            <p>Todos los derechos reservados. Para más detalles, visita nuestro sitio web.</p>
            <p>Este es un correo de invitación automático, por favor no respondas directamente.</p>
            <p>Si tienes alguna pregunta, contáctanos en: ${supportEmail}</p>
            <p>Si no deseas recibir más invitaciones, <a href="#" style="color: oklch(0.6231 0.188 259.8145);">haz clic aquí</a>.</p>
        </div>
    </div>
</body>
</html>`;
}
