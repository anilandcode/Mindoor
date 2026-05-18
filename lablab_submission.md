# Mindoor — lablab.ai Submission Copy

## Project Title (under 60 chars)
Mindoor: HIPAA-Grade AI Front Desk with Veea Guard

## Short Description (under 200 chars)
AI receptionist for healthcare clinics. Every patient conversation inspected by Veea Lobster Trap. One-click HIPAA audit PDF. The trust layer compliance officers sign off on.

## Long Description (paste into lablab form)

Healthcare clinics are deploying AI front-desk agents to replace burnt-out receptionists — but every AI conversation that touches a patient inherits HIPAA. A single prompt injection, a PHI exfiltration attempt, or a role-escalation attack creates a reportable breach with $10M average liability. Existing AI receptionists ship with zero conversation-layer security and nothing a compliance officer can sign off on.

**Mindoor** solves this by building Veea's Lobster Trap into the core architecture as the trust layer, not an afterthought. Every patient message is deep-inspected by Lobster Trap before it reaches Google Gemini 2.5 Flash. Every interaction is logged. Every security incident is exportable as a regulator-readable HIPAA compliance audit PDF — mapped to §164.312 Technical Safeguards, signed by the clinic administrator, and defensible in a CMS audit.

**What we built:** A full-stack AI receptionist with three security layers — Veea Lobster Trap at the network layer (policy enforcement, quarantine, DPI), custom FastAPI regex patterns at the application layer (22 healthcare-specific attack signatures), and a hardened Gemini system prompt at the model layer. The Operator Dashboard shows the patient chat and live security event feed side-by-side in real time — risk scores, detected intent, and blocked prompt snippets visible as attacks happen. The "Download HIPAA Audit Report" button generates a 5-section PDF in seconds.

**Red-team validated:** We built a 10-prompt adversarial battery covering PHI exfiltration, billing fraud, privilege escalation, jailbreak/roleplay, indirect prompt injection, credential phishing, and data poisoning — all healthcare-specific, not generic "tell me a joke" attacks. The system blocks [BLOCK_RATE_%] of adversarial prompts with [FPR_%] false positives on legitimate appointment requests, adding [LATENCY_MS]ms median latency.

**Business case:** 200,000+ US healthcare and wellness clinics are HIPAA-anxious about AI adoption. At $400/clinic/month, the SAM is $1B. Distribution channel: white-label through EHR platforms (Epic, Athena, Jane, SimplePractice) as a drop-in front-desk security layer. The Veea Lobster Trap integration becomes the compliance moat that prevents commoditization.

## Category Tags
Security, Healthcare, Web Application, Virtual Assistant, Enterprise AI

## Technology Tags
Gemini AI, Gemini 2.5 Flash, AI Studio, Lobster Trap, Veea, FastAPI, Next.js, Vercel, Fly.io, ReportLab, Python, TypeScript, GSAP

## Primary Track
Agent Security & AI Governance — Veea

## Secondary Track
AI Agents with Google AI Studio

## Live URL
https://[YOUR_VERCEL_URL].vercel.app

## Operator Dashboard URL
https://[YOUR_VERCEL_URL].vercel.app/operator

## Demo credentials
(no login required — open access for judges)

## GitHub Repository
https://github.com/[YOUR_USERNAME]/mindoor

## Cover image description
Dark glassmorphic UI showing the Mindoor operator dashboard: patient chat on left, live security event feed on right with red BLOCK badges, risk scores, and the "Download HIPAA Audit Report" button prominent at bottom.
