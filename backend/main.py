from imapclient import IMAPClient
import pyzmail
from email_validator import validate_email, EmailNotValidError
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# Add your real credentials
EMAIL = "mouellhi.amall@gmail.com"
APP_PASSWORD = "afiw voic ztan kwzn"

DISPOSABLE_DOMAINS = {"mailinator.com", "guerrillamail.com", "10minutemail.com"}
DOMAIN_CORRECTIONS = {
    "gmal.com": "gmail.com",
    "outllok.com": "outlook.com",
    "hotnail.com": "hotmail.com"
}

def clean_email_list(email_list):
    cleaned = []
    for email in email_list:
        entry = {"email": email, "valid": True, "reason": "Valid", "suggestion": None}
        try:
            validated = validate_email(email)
            domain = validated["domain"]
        except EmailNotValidError:
            entry["valid"] = False
            entry["reason"] = "Invalid format"
            cleaned.append(entry)
            continue

        if domain in DISPOSABLE_DOMAINS:
            entry["valid"] = False
            entry["reason"] = "Disposable domain"

        if domain in DOMAIN_CORRECTIONS:
            entry["valid"] = False
            entry["reason"] = "Typo in domain"
            entry["suggestion"] = email.replace(domain, DOMAIN_CORRECTIONS[domain])

        cleaned.append(entry)
    return cleaned

@app.get("/inbox-emails")
def read_gmail_inbox():
    HOST = "imap.gmail.com"
    with IMAPClient(HOST) as client:
        client.login(EMAIL, APP_PASSWORD)
        client.select_folder("INBOX", readonly=True)
        uids = client.search(["UNSEEN"])  # or use ["ALL"] for full inbox

        email_senders = []
        for uid in uids[:20]:  # read the latest 20 unread
            raw_message = client.fetch([uid], ["BODY[]"])[uid][b"BODY[]"]
            message = pyzmail.PyzMessage.factory(raw_message)
            sender_email = message.get_address("from")[1]
            email_senders.append(sender_email)

        cleaned = clean_email_list(email_senders)
        return {"total": len(cleaned), "results": cleaned}
