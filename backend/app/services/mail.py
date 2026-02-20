import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional, Dict, Any
from app.core.config import settings

logger = logging.getLogger(__name__)

class MailService:
    def __init__(self):
        self.enabled = settings.EMAIL_ENABLED
        self.host = settings.SMTP_HOST
        self.port = settings.SMTP_PORT
        self.user = settings.SMTP_USER
        self.password = settings.SMTP_PASSWORD
        self.from_name = settings.SMTP_FROM_NAME
        self.from_email = settings.SMTP_FROM_EMAIL
        self.admin_email = settings.ADMIN_EMAIL

    async def send_lead_notification(self, lead_data: Dict[str, Any]):
        """Sends an email notification to the manager about a new lead."""
        if not self.enabled:
            logger.info("Email notifications are disabled. Skipping lead email.")
            return

        if not all([self.user, self.password, self.admin_email]):
            logger.warning("SMTP credentials or ADMIN_EMAIL missing. Cannot send lead email.")
            return

        subject = f"🔔 Новый лид: {lead_data.get('name', 'Без имени')} ({lead_data.get('company', 'Без компании')})"
        
        # Plain text content
        text_content = f"""
Новая заявка на платформе Terra Expert!

👤 Имя: {lead_data.get('name')}
🏢 Компания: {lead_data.get('company')}
📞 Телефон: {lead_data.get('phone')}
📧 Email: {lead_data.get('email')}

📊 Данные аудита:
{lead_data.get('audit_data') or 'Нет данных'}

---
Это автоматическое уведомление. Пожалуйста, обработайте заявку в Directus или AmoCRM.
"""

        # HTML content for better readability
        html_content = f"""
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; padding: 20px; border-radius: 8px;">
        <h2 style="color: #F97316; border-bottom: 2px solid #F97316; padding-bottom: 10px;">🔔 Новая заявка</h2>
        <p>На платформе <strong>Terra Expert</strong> зарегистрировано новое обращение:</p>
        
        <table style="width: 100%; border-collapse: collapse;">
            <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0; color: #666; width: 150px;">Имя:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;"><strong>{lead_data.get('name')}</strong></td>
            </tr>
            <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0; color: #666;">Компания:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">{lead_data.get('company')}</td>
            </tr>
            <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0; color: #666;">Телефон:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;"><a href="tel:{lead_data.get('phone')}" style="color: #F97316;">{lead_data.get('phone')}</a></td>
            </tr>
            <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0; color: #666;">Email:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;"><a href="mailto:{lead_data.get('email')}" style="color: #F97316;">{lead_data.get('email')}</a></td>
            </tr>
        </table>

        <div style="margin-top: 20px; padding: 15px; background-color: #f9f9f9; border-left: 4px solid #F97316;">
            <h3 style="margin-top: 0; color: #444;">📊 Контекст (AI Audit)</h3>
            <pre style="white-space: pre-wrap; font-size: 13px;">{lead_data.get('audit_data') or 'Данные не прикреплены'}</pre>
        </div>

        <p style="margin-top: 25px; font-size: 12px; color: #999; text-align: center; border-top: 1px solid #eee; padding-top: 15px;">
            Это автоматическое системное сообщение.<br>
            Terra Expert &copy; 2026
        </p>
    </div>
</body>
</html>
"""

        message = MIMEMultipart("alternative")
        message["Subject"] = subject
        message["From"] = f"{self.from_name} <{self.from_email}>"
        message["To"] = self.admin_email

        message.attach(MIMEText(text_content, "plain"))
        message.attach(MIMEText(html_content, "html"))

        try:
            with smtplib.SMTP_SSL(self.host, self.port) as server:
                server.login(self.user, self.password)
                server.sendmail(self.from_email, self.admin_email, message.as_string())
            logger.info(f"Lead notification email sent to {self.admin_email}")
        except Exception as e:
            logger.error(f"Failed to send email notification: {e}")

mail_service = MailService()
