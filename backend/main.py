from fastapi import FastAPI, UploadFile, File, Body, HTTPException
from fastapi.responses import StreamingResponse
from email_validator import validate_email, EmailNotValidError
from rapidfuzz.distance import Levenshtein
import dns.resolver
import pandas as pd
import io
import re
from fastapi.middleware.cors import CORSMiddleware
app = FastAPI()

# CORS settings for local development with frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



#in-memory cache
LAST_RESULT: pd.DataFrame | None = None

# Common domains for typo suggestions
COMMON_DOMAINS = [
    "gmail.com","outlook.com","hotmail.com","yahoo.com","live.com",
    "proton.me","icloud.com","aol.com","gmx.com","pm.me"
]

# Disposable domains (starter list; extend later)
DISPOSABLE = {
    "mailinator.com","10minutemail.com","guerrillamail.com","discard.email",
    "temp-mail.org","yopmail.com","getnada.com","sharklasers.com"
}

EMAIL_COL_NAMES = {"email","emails","adresse","adresse_email","mail"}

def has_mx(domain: str) -> bool:
    try:
        dns.resolver.resolve(domain, "MX")
        return True
    except Exception:
        return False

def suggest_domain(domain: str) -> str | None:
    # closest common domain (edit distance <=2)
    best, best_dist = None, 99
    for d in COMMON_DOMAINS:
        dist = Levenshtein.distance(domain, d)
        if dist < best_dist:
            best, best_dist = d, dist
    return best if best_dist <= 2 and best != domain else None

def analyze_emails(emails: list[str]) -> pd.DataFrame:
    rows = []
    seen = set()
    for raw in emails:
        email = (raw or "").strip()
        if not email:
            continue
        if email.lower() in seen:
            # de-dup at source; mark as duplicate if you want
            pass
        seen.add(email.lower())

        status = "Valid"
        reason = "-"
        suggestion = None
        domain = None

        # 1) Syntax / IDN normalization
        try:
            v = validate_email(email, allow_smtputf8=True)
            email_norm = v.normalized
            domain = v["domain"]
        except EmailNotValidError as e:
            status, reason = "Invalid", "Invalid format"
            rows.append({"email": email, "status": status, "reason": reason, "suggestion": suggestion})
            continue

        # 2) Disposable check
        if domain in DISPOSABLE:
            status, reason = "Invalid", "Disposable domain"

        # 3) MX check (lightweight)
        elif not has_mx(domain):
            status, reason = "Invalid", "No MX records"

        # 4) Typo suggestion (only if still valid so far)
        if status == "Valid":
            sug = suggest_domain(domain)
            if sug and sug != domain:
                status, reason = "Invalid", "Likely domain typo"
                suggestion = email.replace(domain, sug)

        rows.append({"email": email, "status": status, "reason": reason, "suggestion": suggestion})

    df = pd.DataFrame(rows)
    # Sorting: Invalid first, then by reason
    df["status_rank"] = df["status"].map({"Invalid": 0, "Valid": 1})
    df = df.sort_values(["status_rank", "reason", "email"]).drop(columns=["status_rank"])
    return df

@app.post("/analyze/list")
def analyze_list(payload: dict = Body(...)):
    """
    JSON:
    {
      "emails": ["a@x.com","b@x.com", ...]
    }
    """
    emails = payload.get("emails")
    if not isinstance(emails, list):
        raise HTTPException(400, "Body must contain 'emails': list[str]")
    df = analyze_emails(emails)
    global LAST_RESULT
    LAST_RESULT = df
    return {"count": len(df), "results": df.to_dict(orient="records")}

@app.post("/analyze/upload")
async def analyze_upload(file: UploadFile = File(...)):
    """
    Accepts CSV (with a column named like: email/emails/adresse_email/mail)
    """
    content = await file.read()
    try:
        df = pd.read_csv(io.BytesIO(content))
    except Exception:
        try:
            df = pd.read_excel(io.BytesIO(content))
        except Exception as e:
            raise HTTPException(400, "Upload must be CSV or Excel") from e

    # find an email column
    col = None
    for c in df.columns:
        if c.strip().lower() in EMAIL_COL_NAMES:
            col = c
            break
    if not col:
        # if not found, try to detect emails from the first column by regex
        col = df.columns[0]
        # optional: extract email-like tokens from this column
        df[col] = df[col].astype(str).str.extract(r'([A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})', flags=re.I)

    emails = df[col].dropna().astype(str).tolist()
    out = analyze_emails(emails)
    global LAST_RESULT
    LAST_RESULT = out
    return {"count": len(out), "results": out.to_dict(orient="records")}

@app.get("/analyze/export")
def export_last():
    if LAST_RESULT is None:
        raise HTTPException(404, "No analysis to export yet.")
    buf = io.StringIO()
    LAST_RESULT.to_csv(buf, index=False)
    buf.seek(0)
    return StreamingResponse(
        io.BytesIO(buf.getvalue().encode("utf-8")),
        media_type="text/csv",
        headers={"Content-Disposition": 'attachment; filename="email_analysis.csv"'}
    )
