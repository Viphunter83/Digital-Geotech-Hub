"""
Email notification service.
Sends SMTP emails on audit completion and other events.
Gracefully disabled when SMTP credentials are not configured.
"""
import logging
import smtplib
import ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional
from app.core.config import settings

logger = logging.getLogger(__name__)


class EmailService:

    @property
    def enabled(self) -> bool:
        return (
            settings.EMAIL_ENABLED
            and settings.SMTP_USER is not None
            and settings.SMTP_PASSWORD is not None
        )

    def _send(self, to_email: str, subject: str, html_body: str) -> bool:
        """Low-level: send email via SMTP SSL."""
        if not self.enabled:
            logger.debug("Email disabled, skipping send to %s", to_email)
            return False

        msg = MIMEMultipart("alternative")
        msg["From"] = f"{settings.SMTP_FROM_NAME} <{settings.SMTP_FROM_EMAIL}>"
        msg["To"] = to_email
        msg["Subject"] = subject
        msg.attach(MIMEText(html_body, "html", "utf-8"))

        try:
            ctx = ssl.create_default_context()
            with smtplib.SMTP_SSL(settings.SMTP_HOST, settings.SMTP_PORT, context=ctx) as server:
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                server.send_message(msg)
            logger.info("Email sent to %s: %s", to_email, subject)
            return True
        except Exception as e:
            logger.error("Failed to send email to %s: %s", to_email, e)
            return False

    def send_audit_completed(
        self,
        to_email: str,
        company_name: str,
        filename: str,
        work_type: Optional[str] = None,
        risks_count: int = 0,
        confidence: Optional[float] = None,
        estimated_total: Optional[float] = None,
    ) -> bool:
        """
        Send email notification when AI audit is completed.
        """
        conf_pct = f"{confidence * 100:.0f}%" if confidence else "—"
        estimate_str = f"{estimated_total:,.0f} ₽".replace(",", " ") if estimated_total else "—"
        risk_color = "#ef4444" if risks_count > 2 else "#f59e0b" if risks_count > 0 else "#22c55e"

        html = f"""\
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; background: #0A0F1C; color: #ffffff; margin: 0; padding: 0;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">

    <!-- Header -->
    <div style="text-align: center; margin-bottom: 32px;">
      <h1 style="color: #F97316; font-size: 20px; margin: 0;">DIGITAL GEOTECH HUB</h1>
      <p style="color: #666; font-size: 12px; margin: 4px 0 0;">AI-аудит завершён</p>
    </div>

    <!-- Card -->
    <div style="background: #111827; border-radius: 16px; padding: 28px; border: 1px solid #1f2937;">
      <h2 style="color: #ffffff; font-size: 16px; margin: 0 0 16px;">Результаты аудита</h2>

      <table style="width: 100%; color: #d1d5db; font-size: 14px; border-collapse: collapse;">
        <tr><td style="padding: 8px 0; color: #9ca3af;">Компания</td><td style="padding: 8px 0; text-align: right; font-weight: bold;">{company_name}</td></tr>
        <tr><td style="padding: 8px 0; color: #9ca3af;">Файл</td><td style="padding: 8px 0; text-align: right;">{filename}</td></tr>
        <tr><td style="padding: 8px 0; color: #9ca3af;">Тип работ</td><td style="padding: 8px 0; text-align: right;">{work_type or '—'}</td></tr>
        <tr><td style="padding: 8px 0; color: #9ca3af;">Уверенность</td><td style="padding: 8px 0; text-align: right; font-weight: bold;">{conf_pct}</td></tr>
        <tr><td style="padding: 8px 0; color: #9ca3af;">Рисков</td><td style="padding: 8px 0; text-align: right; color: {risk_color}; font-weight: bold;">{risks_count}</td></tr>
        <tr><td style="padding: 8px 0; color: #9ca3af;">Смета</td><td style="padding: 8px 0; text-align: right; color: #22c55e; font-weight: bold;">{estimate_str}</td></tr>
      </table>

      <div style="margin-top: 24px; text-align: center;">
        <a href="{settings.FRONTEND_URL}/dashboard/audit"
           style="display: inline-block; padding: 12px 32px; background: #F97316; color: #0A0F1C; 
                  font-weight: bold; text-decoration: none; border-radius: 8px; font-size: 14px;">
          Открыть в дашборде →
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div style="text-align: center; margin-top: 32px; color: #4b5563; font-size: 11px;">
      <p>Digital Geotech Hub • geotech-hub.ru</p>
      <p>Это автоматическое уведомление. Отвечать на это письмо не нужно.</p>
    </div>
  </div>
</body>
</html>"""

        return self._send(
            to_email=to_email,
            subject=f"Аудит завершён: {filename} — {risks_count} рисков",
            html_body=html,
        )


email_service = EmailService()
