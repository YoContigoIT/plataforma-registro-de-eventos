import type { InvitationEmailDto } from "~/domain/dtos/email-invitation.dto";

export function generateInvitationEmailTemplate(
  data: InvitationEmailDto,
): string {
  const {
    userName,
    userEmail,
    userCompany,
    userTitle,
    eventName,
    eventDescription,
    eventDate,
    eventTime,
    eventLocation,
    eventCapacity,
    maxTickets,
    organizerName,
    organizerEmail,
    customMessage,
    inviteUrl,
    eventDetailsUrl,
    inviteToken,
    supportEmail,
    responseDeadline,
  } = data;

  return `<!DOCTYPE html>
<html lang="es-MX">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invitación al Evento</title>
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
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .header-content h1 {
            font-size: 32px;
            font-weight: bold;
            margin-bottom: 4px;
        }
        
        .header-content p {
            color: rgba(255, 255, 255, 0.9);
            margin-top: 4px;
        }
        
        .rsvp-badge {
            background: rgba(255, 255, 255, 0.2);
            color: white;
            padding: 4px 12px;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 500;
            border: 1px solid rgba(255, 255, 255, 0.3);
        }
        
        .content {
            padding: 24px;
        }
        
        .greeting {
            margin-bottom: 24px;
        }
        
        .greeting h2 {
            font-size: 20px;
            font-weight: 600;
            margin-bottom: 8px;
        }
        
        .greeting p {
            color: #6b7280;
        }
        
        .event-info-card {
            background: linear-gradient(135deg, #ffffff 0%, rgba(59, 130, 246, 0.05) 100%);
            border: 1px solid rgba(59, 130, 246, 0.2);
            border-radius: 12px;
            padding: 24px;
            margin: 24px 0;
        }
        
        .event-title {
            font-size: 32px;
            font-weight: bold;
            margin-bottom: 8px;
        }
        
        .event-description {
            color: #6b7280;
            margin-bottom: 24px;
        }
        
        .event-details {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 16px;
            margin-top: 24px;
        }
        
        .detail-item {
            display: flex;
            align-items: center;
            gap: 12px;
        }
        
        .detail-icon {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: rgba(59, 130, 246, 0.1);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
        }
        
        .detail-content p:first-child {
            font-size: 14px;
            color: #6b7280;
            margin-bottom: 2px;
        }
        
        .detail-content p:last-child {
            font-weight: 600;
        }
        
        .invitation-details {
            background: rgba(59, 130, 246, 0.05);
            border-radius: 8px;
            padding: 16px;
            margin: 24px 0;
        }
        
        .invitation-details h4 {
            font-weight: 600;
            margin-bottom: 8px;
        }
        
        .invitation-details .detail-list {
            display: flex;
            flex-direction: column;
            gap: 4px;
        }
        
        .invitation-details .detail-list p {
            font-size: 14px;
            color: #6b7280;
        }
        
        .cta-section {
            margin: 24px 0;
        }
        
        .button-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
            margin-bottom: 16px;
        }
        
        .btn {
            padding: 12px 24px;
            border-radius: 6px;
            text-decoration: none;
            font-weight: 500;
            text-align: center;
            display: inline-block;
            transition: all 0.2s;
        }
        
        .btn-primary {
            background: #22c55e;
            color: white;
        }
        
        .btn-primary:hover {
            background: #16a34a;
        }
        
        .btn-outline {
            background: transparent;
            color: #374151;
            border: 1px solid #d1d5db;
        }
        
        .btn-outline:hover {
            background: #f9fafb;
        }
        
        .btn-ghost {
            background: transparent;
            color: #3b82f6;
            text-align: center;
            display: block;
            margin-top: 16px;
        }
        
        .btn-ghost:hover {
            color: #2563eb;
        }
        
        .important-note {
            border-top: 1px solid #e5e7eb;
            padding-top: 16px;
            margin-top: 24px;
        }
        
        .important-note p {
            font-size: 14px;
            color: #6b7280;
        }
        
        .footer {
            background: rgba(0, 0, 0, 0.02);
            padding: 16px 24px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
        }
        
        .footer p {
            font-size: 14px;
            color: #6b7280;
            margin-bottom: 8px;
        }
        
        .footer p:last-child {
            font-size: 12px;
            margin-bottom: 0;
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
        
        .meta-info {
            text-align: center;
            margin-top: 24px;
        }
        
        .meta-info p {
            font-size: 12px;
            color: #6b7280;
        }
        
        @media (max-width: 640px) {
            body {
                padding: 16px 8px;
            }
            
            .header {
                flex-direction: column;
                text-align: center;
                gap: 12px;
            }
            
            .header-content h1 {
                font-size: 24px;
            }
            
            .event-title {
                font-size: 24px;
            }
            
            .event-details {
                grid-template-columns: 1fr;
            }
            
            .button-grid {
                grid-template-columns: 1fr;
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
                    <h1>¡Estás Invitado!</h1>
                    <p>Invitación al Evento</p>
                </div>
                <div class="rsvp-badge">
                    Confirmación Requerida
                </div>
            </div>
            
            <!-- Content -->
            <div class="content">
                <!-- Greeting -->
                <div class="greeting">
                    <h2>¡Hola ${userName || 'estimado/a invitado/a'}!</h2>
                    <p>
                        Has sido personalmente invitado/a a asistir a <strong>${eventName}</strong>. 
                        Sería un honor tenerte con nosotros en este evento exclusivo.
                    </p>
                </div>
                
                <!-- Event Information Card -->
                <div class="event-info-card">
                    <h3 class="event-title">${eventName}</h3>
                    ${eventDescription ? `<p class="event-description">${eventDescription}</p>` : ''}
                    
                    <div class="event-details">
                        <div class="detail-item">
                            <div class="detail-icon">📅</div>
                            <div class="detail-content">
                                <p>Fecha</p>
                                <p>${eventDate}</p>
                            </div>
                        </div>
                        
                        <div class="detail-item">
                            <div class="detail-icon">🕐</div>
                            <div class="detail-content">
                                <p>Hora</p>
                                <p>${eventTime}</p>
                            </div>
                        </div>
                        
                        <div class="detail-item">
                            <div class="detail-icon">📍</div>
                            <div class="detail-content">
                                <p>Ubicación</p>
                                <p>${eventLocation}</p>
                            </div>
                        </div>
                        
                        ${eventCapacity ? `
                        <div class="detail-item">
                            <div class="detail-icon">👥</div>
                            <div class="detail-content">
                                <p>Capacidad</p>
                                <p>${eventCapacity} asistentes</p>
                            </div>
                        </div>
                        ` : ''}
                    </div>
                </div>
                
                <!-- Invitation Details -->
                ${userCompany ? `
                <div class="invitation-details">
                    <h4>Detalles de la Invitación</h4>
                    <div class="detail-list">
                        <p><strong>Invitado:</strong> ${userName}</p>
                        <p><strong>Empresa:</strong> ${userCompany}</p>
                        ${userTitle ? `<p><strong>Cargo:</strong> ${userTitle}</p>` : ''}
                        <p><strong>Email:</strong> ${userEmail}</p>
                        ${maxTickets ? `<p><strong>Máximo de Boletos:</strong> ${maxTickets}</p>` : ''}
                    </div>
                </div>
                ` : ''}
                
                ${customMessage ? `
                <div class="invitation-details">
                    <h4>Mensaje Especial</h4>
                    <p>${customMessage}</p>
                </div>
                ` : ''}
                
                <!-- Call to Action -->
                <div class="cta-section">
                    <div class="button-grid">
                        <a href="${inviteUrl}" class="btn btn-primary">Aceptar Invitación</a>
                        <a href="${inviteUrl}" class="btn btn-outline">Rechazar</a>
                    </div>
                    
                    <a href="${eventDetailsUrl}" class="btn btn-ghost">
                        Ver Detalles Completos del Evento →
                    </a>
                </div>
                
                <!-- Important Information -->
                <div class="important-note">
                    <p>
                        <strong>Importante:</strong> Esta invitación es intransferible y requiere confirmación. 
                        ${responseDeadline ? `Por favor responde antes del ${responseDeadline}.` : 'Por favor responde lo antes posible.'}
                    </p>
                </div>
            </div>
            
            <!-- Footer -->
            <div class="footer">
                <p><strong>Organizado por ${organizerName}</strong></p>
                <p>¿Preguntas? Contáctanos en ${organizerEmail}</p>
                <div class="footer-links">
                    <a href="#">Política de Privacidad</a>
                    <span>•</span>
                    <a href="#">Términos de Servicio</a>
                    <span>•</span>
                    <a href="#">Cancelar Suscripción</a>
                </div>
            </div>
        </div>
        
        <!-- Meta Information -->
        <div class="meta-info">
            <p>Esta es una vista previa de la plantilla de invitación por email</p>
        </div>
    </div>
</body>
</html>`;
}
