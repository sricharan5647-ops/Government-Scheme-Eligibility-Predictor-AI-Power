# SchemeSathi (స్కీమ్ సాథి / स्कीम साथी)

> **Find the government benefits that may fit your needs.**\
> **Track:** Civic Pulse — Digital Governance & Public Information\
> **Pilot Scope:** Telangana State + Selected Central Government Schemes of India

---

## 1. Product Overview

**SchemeSathi** is a transparent, privacy-respecting, and explainable web application that helps citizens discover welfare benefits relevant to their personal and household circumstances.

Unlike portals that claim instant approval or black-box algorithms that invent eligibility, SchemeSathi adheres to strict **Civic Tech Principles**:
1. **Accuracy Before Fluency:** Eligibility evaluations are strictly deterministic, executed against versioned rules codified directly from official government gazettes and notifications. No LLM ever invents or decides eligibility.
2. **Explainability First:** Every result breaks down exactly which conditions matched, which are unknown, and which require departmental verification.
3. **No False Certainty:** Results use transparent labels (*"Potential match"*, *"More information required"*, *"Does not appear to match"*). The application never displays *"Approved"* or *"Guaranteed eligible"*.
4. **Privacy by Design:** Zero collection of Aadhaar numbers, bank account details, passwords, OTPs, or identity document uploads. Screening answers are evaluated in-memory and kept only in session storage.
5. **Source Transparency:** Every scheme record displays its primary government department URL, official gazette citations, and human-verification dates.
6. **Honest Prototype Behavior:** Test and sample data are visibly labelled as *"Demo Data — Not an official government scheme"*.

---

## 2. Architecture & Technology Stack

```
+---------------------------------------------------------------------------------+
|                                SchemeSathi Frontend                             |
|  React 18 + TypeScript + Vite + Tailwind CSS + Lucide Icons + Trilingual i18n   |
|  (English / తెలుగు / हिन्दी)                                                    |
|                                                                                 |
|  +--------------------+  +--------------------+  +----------------------------+ |
|  | Landing & Catalogue|  | 5-Step Guided Form  |  | Transparent Match Results  | |
|  | / & /schemes       |  | /eligibility       |  | /results & /schemes/:slug  | |
|  +--------------------+  +--------------------+  +----------------------------+ |
|  | Grounded Assistant |  | Document Checklist |  | Secure Admin Dashboard     | |
|  | /assistant         |  | Interactive Session|  | /admin & /admin/schemes    | |
|  +--------------------+  +--------------------+  +----------------------------+ |
+----------------------------------------+----------------------------------------+
                                         | REST APIs (JSON)
                                         v
+---------------------------------------------------------------------------------+
|                                SchemeSathi Backend                              |
|                          Python 3.13 + FastAPI + Uvicorn                        |
|                                                                                 |
|  +----------------------------------------------------------------------------+ |
|  | Deterministic Rule Engine (services/engine.py)                             | |
|  | Operators: equals, not_equals, gt, gte, lt, lte, between, in_list, contains| |
|  | Outcomes: POTENTIAL_MATCH, MORE_INFO_REQUIRED, NO_MATCH, NOT_ASSESSED      | |
|  +----------------------------------------------------------------------------+ |
|  | Grounded AI Assistant Service (services/assistant.py)                      | |
|  | Keyword retrieval strictly cited to published gazette excerpts             | |
|  +----------------------------------------------------------------------------+ |
|  | Role-Based Auth & Audit Trail (JWT + Salted SHA-256)                        | |
|  | Roles: citizen, scheme_admin, platform_admin                               | |
|  +----------------------------------------------------------------------------+ |
+----------------------------------------+----------------------------------------+
                                         | Relational ORM (SQLAlchemy 2.0)
                                         v
+---------------------------------------------------------------------------------+
|                                 Database Layer                                  |
|  SQLite (Local Development / Zero Config) or Managed PostgreSQL (Production)    |
|  Tables: users, schemes, eligibility_rules, required_documents, scheme_sources, |
|          feedback, audit_logs                                                   |
+---------------------------------------------------------------------------------+
```

---

## 3. Seed Dataset Overview

The seed database includes **verified real schemes** from the Government of Telangana and Central Government of India, alongside **clearly labelled demo schemes** for testing edge cases:

| Scheme Name | Jurisdiction | Category | Key Eligibility Criteria | Official Source |
|---|---|---|---|---|
| **Rythu Bandhu** | Telangana (State) | Agriculture | Resident farmer, Patta landholder, >0 acres | [rythubandhu.telangana.gov.in](https://rythubandhu.telangana.gov.in/) |
| **Telangana Overseas Scholarship** | Telangana (State) | Education | Age &le; 35, Graduate, Income &le; ₹5,00,000, SC/ST/BC/Minority | [telanganaepass.cgg.gov.in](https://telanganaepass.cgg.gov.in/) |
| **Rajiv Aarogyasri Health Scheme** | Telangana (State) | Healthcare | Resident of Telangana, White Ration Card (Food Security Card) | [aarogyasri.telangana.gov.in](https://aarogyasri.telangana.gov.in/) |
| **PM-KISAN** | Central | Agriculture | Cultivable landholder family, >0 acres | [pmkisan.gov.in](https://pmkisan.gov.in/) |
| **Ayushman Bharat (AB-PMJAY)** | Central | Healthcare | BPL / Food Security Ration Card holder | [pmjay.gov.in](https://pmjay.gov.in/) |
| **PMAY-Urban** | Central | Housing | Annual family income &le; ₹6,00,000 (EWS/LIG) | [pmaymis.gov.in](https://pmaymis.gov.in/) |
| **National Apprenticeship (NAPS)** | Central | Employment | Age 14–35, Minimum 10th standard pass | [apprenticeshipindia.gov.in](https://www.apprenticeshipindia.gov.in/) |
| **PM Matru Vandana Yojana** | Central | Women Welfare | Female applicant, Age &ge; 19 | [pmmvy.wcd.gov.in](https://pmmvy.wcd.gov.in/) |
| **Telangana Dalit Bandhu** | Telangana (State) | Entrepreneurship | Native resident of Telangana, SC community | [dalitbandhu.telangana.gov.in](https://dalitbandhu.telangana.gov.in/) |
| **Telangana Aasara Pensions** | Telangana (State) | Social Security | Age &ge; 57, Annual income &le; ₹1,50,000 | [aasara.telangana.gov.in](https://aasara.telangana.gov.in/) |
| **Civic AI Fellowship [DEMO]** | Central (Demo) | Education | Age 18–28, Graduate *(Clearly marked as Demo Data)* | Demo testing suite |
| **Solar Subsidy Phase 1 [EXPIRED DEMO]** | Central (Demo) | Housing | Archived/Expired rule testing record | Demo testing suite |

---

## 4. Local Setup & Execution Guide

### Prerequisites
- Python 3.10+ (Tested on Python 3.13)
- Node.js 18+ (Tested on Node.js v24)
- npm or pnpm

### Quick Start (Single Command / Full-Stack Mode)

The FastAPI server automatically serves both the backend API and the compiled React frontend:

1. **Clone or enter the project directory:**
   ```bash
   cd NXT
   ```

2. **Install Python dependencies:**
   ```bash
   pip install fastapi uvicorn pydantic sqlalchemy python-multipart pytest pyjwt
   ```

3. **Build the React frontend:**
   ```bash
   cd frontend
   npm install
   npm run build
   cd ..
   ```

4. **Launch SchemeSathi:**
   ```bash
   python run_server.py
   ```

5. **Open your browser:**
   - **Citizen Web Application:** `http://127.0.0.1:8000`
   - **Interactive API Documentation:** `http://127.0.0.1:8000/docs`
   - **Administrator Login:** `http://127.0.0.1:8000/admin/login`

---

### Development Mode (Hot Reloading)

If you wish to edit frontend and backend simultaneously:

- **Terminal 1 (Backend API):**
  ```bash
  uvicorn backend.app.main:app --reload --port 8000
  ```
- **Terminal 2 (Frontend Dev Server):**
  ```bash
  cd frontend
  npm run dev
  ```
  *(Vite dev server runs at `http://localhost:5173` with automatic API proxy to port 8000)*

---

## 5. Running the Test Suite

Run the automated test suite verifying rule operators, edge cases, missing data handling, and API endpoints:

```bash
python -m pytest backend/tests -v
```

**17 automated tests verify:**
- Exact match, case-insensitivity, and negative matches (`equals`, `not_equals`)
- Numeric thresholds (`greater_than`, `greater_than_or_equal`, `less_than`, `less_than_or_equal`)
- Range boundaries (`between`)
- Category inclusion (`in_list`, `contains`)
- Missing answers & "Prefer not to say" evaluating to `UNKNOWN`
- Mandatory conditions flipping status to `NO_MATCH` vs `MORE_INFO_REQUIRED`
- Rule expiration and effective dates
- Authentication, role-based authorization, and administrative stats

---

## 6. Demo Walkthrough Guide

### Journey 1: Find Matching Schemes as a Citizen
1. Open `http://127.0.0.1:8000` and click **"Check Eligibility"**.
2. Select **State: Telangana** (and optional district, e.g. Warangal or Karimnagar).
3. Enter **Age: 32**.
4. Select **Education: Graduate** and **Occupation: Farmer**.
5. Check **"Are you an agricultural cultivator or patta landholder?"** and enter **3.5 Acres**.
6. Check **"Holds active Food Security Card (White Ration Card)"**.
7. Review your answers in Step 5 and click **"Find Matching Schemes"**.
8. **Inspect Results:**
   - Notice **Rythu Bandhu** and **Rajiv Aarogyasri** appearing under **Potential Matches**.
   - Click **"Show detailed rule breakdown"** to view why each condition matched.
   - Expand the **Required Documents** checklist to tick off items you already hold.

### Journey 2: Language Switching
- In the top navigation bar, toggle between **EN** (English), **తెలుగు** (Telugu), and **हिन्दी** (Hindi).
- Notice all navigation, status labels, disclaimers, and questionnaire prompts immediately translating without page reload.

### Journey 3: Grounded AI Assistant
1. Navigate to `/assistant`.
2. Click the sample prompt: *"What are the land rules for Rythu Bandhu in Telangana?"*
3. Read the answer: observe how it quotes official eligibility rules and includes clickable source citations with verified dates.

### Journey 4: Administrator Management Console
1. Navigate to `/admin/login`.
2. Click the **"Platform Admin"** quick-fill button (`admin@schemesathi.in` / `Admin@SchemeSathi2025!`) and sign in.
3. In the Dashboard:
   - View live metric indicators (Published, Draft, Under Review, Expired).
   - View recent audit logs tracking administrative actions.
4. Click **"New Scheme"**:
   - Create a scheme with title, category, department, and custom rules.
   - Use the **Rule Builder** to specify field keys, comparison operators, and mandatory flags.
   - Save the scheme as Draft or Publish it.
5. In the Schemes list, click **Publish** or **Archive** to watch the status change and generate audit trail records.

---

## 7. Security & Privacy Guarantees

- **No Third-Party Analytics / Trackers:** Zero external telemetry tracking citizen activities.
- **No Document Uploads:** Document preparation is handled via an in-browser checklist.
- **Zero Sensitive PII:** No Aadhaar numbers, PAN cards, OTPs, or bank account numbers are collected.
- **Session-Scoped Storage:** Answers persist only in the citizen's browser session and can be cleared with one click.
- **Salted SHA-256 Passwords:** Admin authentication uses cryptographically salted hashes with signed JWT bearer tokens.

---

## 8. Known Limitations & Phase 2 Roadmap

- **State Scope:** Initial pilot scope is focused on Telangana State and Central Government schemes. Future iterations will add Andhra Pradesh, Karnataka, Maharashtra, and other Indian states.
- **Official API Integrations:** Direct integration with state databases (such as Dharani Land Records or ePASS) is designed for Phase 2, subject to authorized governmental MoUs and APIs.
- **Audio & Accessibility:** Voice input and regional speech synthesis for rural citizens will be introduced in Phase 2.
