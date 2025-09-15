import type { InvitationEmailDto } from "~/domain/dtos/email-invitation.dto";

export function generateRevocationEmailTemplate(
  data: Pick<InvitationEmailDto, 'userName' | 'eventName' | 'eventDate' | 'customMessage'>,
): string {
  const {
    userName,
    eventName,
    eventDate,
    customMessage,
  } = data;

  return `<!DOCTYPE html>
<html lang="es-MX">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invitación revocada</title>
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
            background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
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
        
        .revocation-badge {
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
            background: linear-gradient(135deg, #ffffff 0%, rgba(220, 38, 38, 0.08) 100%);
            border: 2px solid rgba(220, 38, 38, 0.2);
            border-radius: 16px;
            padding: 40px 32px;
            margin: 32px 0;
            text-align: center;
        }
        
        .event-name {
            font-size: 42px;
            font-weight: 800;
            margin-bottom: 16px;
            background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            line-height: 1.2;
        }
        
        .event-date {
            font-size: 24px;
            font-weight: 600;
            color: #374151;
            margin-bottom: 8px;
        }
        
        .revocation-icon {
            font-size: 48px;
            margin-bottom: 16px;
            color: #dc2626;
        }
        
        .custom-message {
            background: rgba(220, 38, 38, 0.05);
            border-left: 4px solid #dc2626;
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
            font-style: italic;
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
                font-size: 20px;
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
                    <h1>Invitación Revocada</h1>
                    <p>Tu invitación al evento ha sido cancelada</p>
                    <div class="revocation-badge">
                        Invitación Cancelada
                    </div>
                </div>
            </div>
            
            <!-- Content -->
            <div class="content">
                <!-- Greeting -->
                <div class="greeting">
                    <h2>Hola ${userName || 'estimado/a invitado/a'},</h2>
                    <p>
                        Lamentamos informarte que tu invitación al siguiente evento ha sido revocada.
                    </p>
                </div>
                
                <!-- Event Highlight -->
                <div class="event-highlight">
                    <div class="revocation-icon">❌</div>
                    <h3 class="event-name">${eventName}</h3>
                    <p class="event-date">${eventDate}</p>
                </div>
                
                ${customMessage ? `
                <div class="custom-message">
                    <h4>Mensaje del Organizador</h4>
                    <p>${customMessage}</p>
                </div>
                ` : ''}
                
                <!-- Important Information -->
                <div class="important-note">
                    <p>
                        <strong>Información importante:</strong> Tu registro para este evento ha sido eliminado. 
                        Si crees que esto es un error, por favor contacta al organizador del evento.
                    </p>
                </div>
            </div>
            
            <!-- Footer -->
            <div class="footer">
                <div class="footer-links">
                    <a href="#">Política de privacidad</a>
                    <span>•</span>
                    <a href="#">Términos de servicio</a>
                    <span>•</span>
                </div>
                <p>© 2024 Event Manager. Todos los derechos reservados.</p>
            </div>
        </div>
    </div>
</body>
</html>`;
}