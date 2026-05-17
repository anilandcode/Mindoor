# Mindoor 🚪🩺

### The HIPAA-grade AI front-desk agent for healthcare and wellness clinics.

---

**Mindoor** is an intelligent, secure, and production-ready AI front-desk receptionist designed specifically for medical practices, wellness clinics, and healthcare providers. It provides patients with seamless support while enforcing robust, enterprise-grade security and strict HIPAA compliance.

## 🚀 Key Features

- **HIPAA-Grade Security**: Integrated with deep prompt inspection guardrails to prevent data leaks, prompt injection, and PII exposure.
- **AI Front-Desk Agent**: Handles client intake, answers complex scheduling/service queries, and acts as the gatekeeper for clinic interactions.
- **Veea Lobster Trap Integration**: A reverse-proxy guardrail engine inspecting all incoming and outgoing prompts for secure alignment.
- **Premium Frontend UI**: Built on Next.js 15, React, and TypeScript with sleek animations, glassmorphic styles, and real-time security telemetry feedback.
- **FastAPI Core Orchestration**: Asynchronous, highly performant Python backend orchestrating LLM integration and business rules.

---

## 📂 Repository Structure

The project is structured as a monorepo with clean separation between the frontend and secure backend:

```text
Mindoor/
├── secure-ai-receptionist/   # Python FastAPI backend + security gateway
│   ├── main.py               # Core orchestrator and agent routing
│   └── veea-security/        # Lobster Trap prompt inspection and security policies
└── receptionist-ui/          # Premium Next.js frontend application
    ├── src/                  # Application source code
    └── package.json          # Node dependencies and scripts
```

---

## 🛠️ Quick Start

### 1. Prerequisites
- **Node.js** (v18+)
- **Python** (v3.10+)
- **GitHub CLI** (`gh`)

### 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd secure-ai-receptionist
   ```
2. Create and activate a Python virtual environment:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```
3. Install dependencies and run the server:
   ```bash
   pip install -r requirements.txt # if applicable
   python3 main.py
   ```

### 3. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd receptionist-ui
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```

---

## 🛡️ Security & Compliance
Mindoor prioritizes clinical data protection and absolute compliance. By wrapping all LLM calls inside the Veea Lobster Trap inspection layer, Mindoor guarantees:
- **PII / PHI Redaction**: Automatic interception and block of patient health information leakage.
- **Prompt Injection Block**: Active sanitization of prompt-hacking attempts.
- **Audited Compliance Logs**: Standardized logging for access audits.
