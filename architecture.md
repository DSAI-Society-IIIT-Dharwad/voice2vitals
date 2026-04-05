# MediFlow AI - Architecture Plan

## 1. Implementation Plan
- **Phase 1: Foundation & Navigation**
  - Setup React Router with nested routes and role-based access.
  - Create global layout components (Sidebar, Topbar) and a clean CSS variables theme for cohesive SaaS styling.
- **Phase 2: Authentication & Onboarding**
  - Implement generic Login and Registration pages (reusable for different roles).
  - Implement Profile Setup pages for specific roles with state-driven flows.
- **Phase 3: Core Dashboards**
  - Build common dashboard UI components (Summary Cards, Status Chips, Lists, Data Tables).
  - Build specific Dashboards for Patient, Doctor, Customer, and Executive.
- **Phase 4: Live Session Interface**
  - Build the Live Consultation/Session layout with transcript block, extraction block, and timer.
  - Mock live generative functionality.
- **Phase 5: Report & Review Flow**
  - Build the forms where Doctors and Executives review and tweak extracted info.
  - Implement read-only Report Views for Patients and Customers.
- **Phase 6: Outbound Calling Module**
  - Build Outbound Call Management UI with list creation, call progress simulation, and simulated batch processing state.
- **Phase 7: Mock Services Integration**
  - Create pure functions representing data services fetching mock JSON structs.

## 2. App Sitemap

- **Landing / Auth**
  - Role Selection (Start Page)
  - Login (Dynamic param based on role)
  - Register (Dynamic param based on role)
- **Patient Portal (Healthcare)**
  - Dashboard
  - Start/Join Consultation
  - Live Consultation Room
  - Report / Case View
  - History Timeline
  - Profile Settings
- **Doctor Portal (Healthcare)**
  - Dashboard
  - Active Session List
  - Case Details
  - Live Consultation Room
  - Report Review Form
  - Final Notes Form
  - Patient History
  - Outbound Campaign Manager
  - Profile Settings
- **Customer Portal (Finance)**
  - Dashboard
  - Start/Join Session
  - Live Session Room
  - Report View
  - History
  - Profile Settings
- **Executive Portal (Finance)**
  - Dashboard
  - Active Session List
  - Case Details
  - Live Session Room
  - Report Review Form
  - Final Notes Form
  - Customer History
  - Outbound Campaign Manager
  - Profile Settings

## 3. Route Structure

```
/
/role-select
/login/:role
/register/:role
/setup/:role   

/patient/...
/doctor/...
/customer/...
/executive/...
```

## 4. Component Structure

- **Layouts/**: PortalLayout.jsx, AuthLayout.jsx
- **UI/**: Button, Card, Badge, Modal, TranscriptBlock, ExtractionPanel
- **Healthcare/**: VitalsWidget, MedicalHistoryList
- **Finance/**: AccountSummaryCard

## 5. Mock Data / Model Plan

- **Users**: (Patient, Doctor, Customer, Executive)
- **MedicalCase / FinanceCase**: Core state
- **TranscriptSegments**: Real-time chatting blocks
- **ExtractedEntities**: Summarized points
- **OutboundBatch**: Bulk calling jobs
