# shy990 — A2Z Filings Form 990 Generator

A free, single-page web tool that lets a nonprofit enter its details and instantly
generate a draft **IRS Form 990**, preview it live, **download it as a PDF**, and
**submit it by email** to A2Z Filings (info@a2zfilings.com) plus a copy to the client.

It reuses the **theme, header, footer, and logo** of [a2zfilings.com](https://a2zfilings.com/)
so it feels like a connected part of the main site.

## Files
- `index.html` — the entire app (HTML + CSS + JS, self-contained).
- `assets/logo-a2z.jpg` — the A2Z Filings logo.
- `server.js` — local-only preview server (NOT used in production).

## How it works
- **Live preview:** every field updates the Form 990 document on the right in real time;
  totals (revenue, expenses, net assets) are auto-calculated.
- **Download PDF:** client-side via [html2pdf.js](https://github.com/eKoopmans/html2pdf.js)
  (jsPDF + html2canvas). Works instantly, no backend.
- **Submit & Email:** posts to [FormSubmit](https://formsubmit.co) which emails the
  submission (with the generated PDF attached) to `info@a2zfilings.com` and CCs the client.

## One-time email activation
FormSubmit requires a **one-time activation** the first time the form is submitted:
the very first submission sends a confirmation email to **info@a2zfilings.com** —
click the activation link in that email once, and all future submissions deliver
automatically. (The **Download PDF** button works immediately, with or without activation.)

## Deploy
Hosted free on **GitHub Pages**: <https://bennygoldstein.github.io/shy990/>

## Disclaimer
This tool prepares a **draft** of Form 990 from user-entered data. It does **not** file
with the IRS and is not tax advice. A2Z Filings reviews every submission before any
official filing.
