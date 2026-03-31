# -*- coding: utf-8 -*-
"""
Wedding Email Server - UTF-8 Fixed
"""

import smtplib
import json
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.header import Header
from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

CONFIG_FILE = "wedding_config.json"
CONFIG = {
    "SMTP_EMAIL": "",
    "SMTP_APP_PASSWORD": "",
    "TO_EMAIL": "",
    "GROOM_NAME": "",
    "BRIDE_NAME": "",
    "WEDDING_DATE": "",
}

if os.path.exists(CONFIG_FILE):
    with open(CONFIG_FILE, "r", encoding="utf-8") as f:
        CONFIG.update(json.load(f))


def save_config():
    with open(CONFIG_FILE, "w", encoding="utf-8") as f:
        json.dump(CONFIG, f, ensure_ascii=False, indent=2)


def send_email(smtp_email, smtp_password, to_email, subject, body):
    msg = MIMEMultipart("alternative")
    msg["From"] = smtp_email
    msg["To"] = to_email
    msg["Subject"] = Header(subject, "utf-8")

    text_part = MIMEText(body, "plain", "utf-8")
    msg.attach(text_part)

    html_body = build_html_email(body)
    html_part = MIMEText(html_body, "html", "utf-8")
    msg.attach(html_part)

    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
        server.login(smtp_email, smtp_password)
        server.send_message(msg)

    print("Email sent to " + to_email + " at " + datetime.now().strftime("%Y-%m-%d %H:%M"))


def build_html_email(text_body):
    lines = text_body.split("\n")
    html_lines = []
    for line in lines:
        stripped = line.strip()
        if not stripped:
            html_lines.append("<br/>")
        elif stripped.startswith("==") or stripped.startswith("--"):
            html_lines.append('<hr style="border:1px solid #E8E0D8;margin:16px 0;"/>')
        else:
            html_lines.append("<div style=\"padding:3px 0;color:#3E2723;font-size:14px;line-height:1.7;\">" + stripped + "</div>")

    content = "\n".join(html_lines)

    return """<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#F8FAF5;font-family:sans-serif;">
<div style="max-width:560px;margin:0 auto;padding:32px 20px;">
<div style="text-align:center;padding:32px;background:linear-gradient(135deg,#FFFDE7,#E8F5E9);border-radius:16px 16px 0 0;">
<div style="font-size:40px;margin-bottom:12px;">🌿</div>
<div style="font-size:14px;color:#4E7D3A;font-weight:600;letter-spacing:2px;">WEDDING PLANNER</div>
</div>
<div style="background:#fff;padding:28px 24px;border:1px solid #E8E0D8;border-top:none;">
""" + content + """
</div>
<div style="text-align:center;padding:16px;color:#A1887F;font-size:12px;border-radius:0 0 16px 16px;background:#fff;border:1px solid #E8E0D8;border-top:none;">
This email was sent from Wedding Planner Dashboard.
</div>
</div></body></html>"""


@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "time": datetime.now().isoformat()})


@app.route("/api/send-email", methods=["POST"])
def api_send_email():
    try:
        data = request.get_json(force=True)

        smtp_email = data.get("smtp_email", "") or CONFIG.get("SMTP_EMAIL", "")
        smtp_password = data.get("smtp_password", "") or CONFIG.get("SMTP_APP_PASSWORD", "")
        to_email = data.get("to_email", "") or CONFIG.get("TO_EMAIL", "")
        subject = data.get("subject", "Wedding Planner Alert")
        body = data.get("body", "")

        if not smtp_email or not smtp_password:
            return jsonify({"error": "SMTP email and app password required."}), 400
        if not to_email:
            return jsonify({"error": "Recipient email required."}), 400

        CONFIG["SMTP_EMAIL"] = smtp_email
        CONFIG["SMTP_APP_PASSWORD"] = smtp_password
        CONFIG["TO_EMAIL"] = to_email
        save_config()

        send_email(smtp_email, smtp_password, to_email, subject, body)

        return jsonify({
            "success": True,
            "message": "Email sent to " + to_email,
            "sent_at": datetime.now().isoformat()
        })

    except smtplib.SMTPAuthenticationError:
        return jsonify({"error": "Gmail auth failed. Check your app password (16-digit code, not regular password)."}), 401
    except smtplib.SMTPException as e:
        return jsonify({"error": "SMTP error: " + str(e)}), 500
    except Exception as e:
        return jsonify({"error": "Send failed: " + repr(e)}), 500


@app.route("/api/update-config", methods=["POST"])
def api_update_config():
    data = request.get_json(force=True)
    CONFIG.update(data)
    save_config()
    return jsonify({"success": True})


def setup_scheduler():
    try:
        from apscheduler.schedulers.background import BackgroundScheduler
        scheduler = BackgroundScheduler()
        scheduler.add_job(
            scheduled_email, "cron",
            day=1, hour=9, minute=0,
            id="monthly_wedding_email", replace_existing=True
        )
        scheduler.start()
        print("Scheduler started (monthly, 1st day 09:00)")
        return scheduler
    except ImportError:
        print("apscheduler not installed. Auto-send disabled.")
        return None


def scheduled_email():
    if not CONFIG.get("SMTP_EMAIL") or not CONFIG.get("SMTP_APP_PASSWORD") or not CONFIG.get("TO_EMAIL"):
        print("SMTP not configured. Skipping auto-send.")
        return
    try:
        subject = "Wedding Planner Monthly Alert"
        body = "Monthly wedding preparation reminder.\nPlease check your dashboard for current tasks."
        send_email(CONFIG["SMTP_EMAIL"], CONFIG["SMTP_APP_PASSWORD"], CONFIG["TO_EMAIL"], subject, body)
        print("Monthly email sent!")
    except Exception as e:
        print("Auto-send failed: " + repr(e))


if __name__ == "__main__":
    print("=" * 50)
    print("Wedding Email Server")
    print("=" * 50)
    print("Server: http://localhost:5000")
    print("Send API: POST http://localhost:5000/api/send-email")
    print("Health: GET http://localhost:5000/api/health")
    print("=" * 50)

    scheduler = setup_scheduler()

    try:
        app.run(host="0.0.0.0", port=5000, debug=False)
    finally:
        if scheduler:
            scheduler.shutdown()
