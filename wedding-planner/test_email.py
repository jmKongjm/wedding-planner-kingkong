# -*- coding: utf-8 -*-
"""
test_email.py

Gmail address and app password below, then run:
  python test_email.py
"""

import requests

# ===== FILL IN YOUR INFO =====
SMTP_EMAIL = ""       # e.g. yourname@gmail.com
APP_PASSWORD = ""     # 16-digit Google app password
TO_EMAIL = ""         # e.g. yourname@gmail.com (can be same)
# ==============================

if not SMTP_EMAIL or not APP_PASSWORD or not TO_EMAIL:
    print("Please fill in SMTP_EMAIL, APP_PASSWORD, TO_EMAIL in this file first!")
else:
    r = requests.post("http://localhost:5000/api/send-email", json={
        "smtp_email": SMTP_EMAIL,
        "smtp_password": APP_PASSWORD,
        "to_email": TO_EMAIL,
        "subject": "Wedding Planner Test",
        "body": "Test email from Wedding Planner Dashboard!"
    })
    result = r.json()
    if result.get("success"):
        print("Email sent successfully! Check your inbox.")
    else:
        print("Failed: " + str(result.get("error", "Unknown error")))
