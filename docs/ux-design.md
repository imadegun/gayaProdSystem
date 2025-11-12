# gayaProdSystem - UX Design Document

**Author:** BMad
**Date:** 2025-11-11
**Version:** 1.0

---

## Executive Summary

This UX design document defines the user interface and experience for gayaProdSystem, a comprehensive enterprise web application for ceramic craft production management. The design focuses on production floor usability, real-time collaboration, and professional data presentation while maintaining accessibility and mobile responsiveness.

**Design Principles:**
- **Production-First:** Interfaces optimized for factory floor use with minimal cognitive load
- **Real-Time Awareness:** Live updates and status indicators throughout the system
- **Professional Data Display:** Clean, filterable tables and dashboards for complex production data
- **Mobile-Responsive:** Progressive Web App capabilities for workers on tablets and phones

---

## Design System

### Color Palette

```css
/* Primary Colors */
--primary: #2563eb;        /* Blue-600 - Main actions */
--primary-dark: #1d4ed8;   /* Blue-700 - Hover states */
--primary-light: #dbeafe;  /* Blue-100 - Background highlights */

/* Status Colors */
--success: #16a34a;        /* Green-600 - Completed/Good */
--warning: #ca8a04;        /* Yellow-600 - Pending/In Progress */
--error: #dc2626;          /* Red-600 - Errors/Rejects */
--info: #2563eb;           /* Blue-600 - Information */

/* Production Stage Colors */
--forming: #7c3aed;        /* Violet-600 - Forming stage */
--glaze: #c2410c;          /* Orange-600 - Glaze stage */
--qc: #16a34a;             /* Green-600 - QC stage */

/* Neutral Colors */
--background: #ffffff;
--surface: #f8fafc;         /* Slate-50 */
--text-primary: #0f172a;    /* Slate-900 */
--text-secondary: #64748b;  /* Slate-500 */
--border: #e2e8f0;         /* Slate-200 */
```

### Typography

- **Primary Font:** Inter (sans-serif) - Clean, readable for data-heavy interfaces
- **Monospace:** JetBrains Mono - For code-like data display (collect codes, PO numbers)
- **Hierarchy:**
  - H1: 2.25rem (36px) - Page titles
  - H2: 1.875rem (30px) - Section headers
  - H3: 1.5rem (24px) - Card headers
  - Body: 1rem (16px) - Primary content
  - Small: 0.875rem (14px) - Secondary content

### Component Library (shadcn/ui)

- **Data Tables:** Sortable, filterable tables with pagination
- **Cards:** Information containers with consistent spacing
- **Forms:** Accessible forms with validation feedback
- **Navigation:** Sidebar navigation with role-based menu items
- **Charts:** Recharts integration for production analytics
- **Calendars:** Drag-and-drop calendar for work planning
- **Modals:** Confirmation dialogs and detail views

---

## User Roles & Navigation

### Role-Based Navigation Structure

#### R&D User
```
Dashboard
├── Client Management
├── Sample Development
├── Directory Management
└── Revision Approvals
```

#### Sales Admin
```
Dashboard
├── Client Management
├── Proforma Generation
├── Purchase Orders
└── Stock Management
```

#### Forming User
```
Dashboard
├── Work Plans
├── Daily Recap
├── Production Tracking
└── Performance
```

#### Glaze User
```
Dashboard
├── Work Plans
├── Glaze Tracking
├── Daily Recap
└── Performance
```

#### QC User
```
Dashboard
├── QC Results
├── Stock Management
├── Packing Lists
└── Performance
```

### Global Navigation Elements

- **Top Bar:** User profile, notifications, logout
- **Sidebar:** Role-specific menu with icons
- **Breadcrumbs:** Current page location
- **Search:** Global search across relevant data
- **Real-time Indicators:** Live update badges and status dots

---

## Key User Interfaces

### 1. Public Product Catalog

**URL:** `/collections`
**Access:** No login required
**Purpose:** Professional product showcase for clients

#### Layout
```
┌─────────────────────────────────────────────────┐
│ Header: Logo + Search Bar                       │
├─────────────────────────────────────────────────┤
│ Filters:                                        │
│ ┌─ Client ─┬─ Category ─┬─ Region ─┬─ Search ─┐ │
│ └──────────┴────────────┴──────────┴──────────┘ │
├─────────────────────────────────────────────────┤
│ Results Table:                                  │
│ ┌─────────────────────────────────────────────┐ │
│ │ Image │ Code │ Name │ Client │ Specs │     │ │
│ │ [50x50]│ABC-001│Product│Exclusive│Details│► │ │
│ └─────────────────────────────────────────────┘ │
│ Pagination: [1] 2 3 ... 50 >                   │
└─────────────────────────────────────────────────┘
```

#### Features
- **Advanced Filtering:** Client, category, region, search, assembly type
- **Product Cards:** Thumbnail, code, name, client attribution, assembly indicator
- **Detail Modal:** Full specifications, technical drawings, photos, assembly components (for set products)
- **Assembly Support:** Display master products and assembly components separately
- **Responsive Grid:** Mobile-optimized card layout

### 2. Production Dashboard

**URL:** `/dashboard`
**Access:** Role-based authentication
**Purpose:** Real-time production overview

#### Layout
```
┌─────────────────────────────────────────────────┐
│ Production Dashboard - [Date]                   │
├─────────────────┬───────────────────────────────┤
│ Stage Status    │ Work Plan Summary             │
│ ┌─────────────┐ │ ┌───────────────────────────┐ │
│ │ Forming     │ │ │ Week: 2025-W45            │ │
│ │ [Progress]  │ │ │ Mon: 15/15 ✓              │ │
│ │ 85%         │ │ │ Tue: 12/15 ⟳              │ │
│ └─────────────┘ │ │ Wed: 0/15 📋              │ │
│                 │ └───────────────────────────┘ │
│ ┌─────────────┐ │                               │
│ │ Glaze       │ │ Active POs                   │
│ │ [Progress]  │ │ ┌───────────────────────────┐ │
│ │ 72%         │ │ │ PO-001: Forming → Glaze   │ │
│ └─────────────┘ │ │ PO-002: QC → Complete     │ │
│                 │ └───────────────────────────┘ │
│ ┌─────────────┐ │                               │
│ │ QC          │ │ Alerts                       │
│ │ [Progress]  │ │ ┌───────────────────────────┐ │
│ │ 91%         │ │ │ ⚠️ PO-001: Quantity Short │ │
│ └─────────────┘ │ │ 🔔 PO-002: Ready for Ship │ │
│                 │ └───────────────────────────┘ │
└─────────────────┴───────────────────────────────┘
```

#### Features
- **Real-time Updates:** WebSocket-powered live data
- **Stage Progress:** Visual progress bars with completion percentages
- **Work Plan Overview:** Current week status with visual indicators
- **Active Orders:** Priority-ordered PO status list
- **Alert System:** Color-coded notifications with action buttons

### 3. Work Plan Calendar

**URL:** `/work-plans`
**Access:** Production users (Forming, Glaze)
**Purpose:** Weekly production planning with drag-and-drop

#### Layout
```
┌─────────────────────────────────────────────────┐
│ Work Plan - Week 45, 2025                       │
├─────────────────────────────────────────────────┤
│ Toolbar: [New Plan] [Print] [Export] [Filter]   │
├─────────────────────────────────────────────────┤
│ Calendar Grid:                                  │
│ ┌─────┬─────┬─────┬─────┬─────┬─────┬─────┐     │
│ │ Mon │ Tue │ Wed │ Thu │ Fri │ Sat │ Sun │     │
│ ├─────┼─────┼─────┼─────┼─────┼─────┼─────┤     │
│ │     │     │     │     │     │     │     │     │
│ │  📋 │  ⟳  │  📋 │  📋 │  📋 │  🟡  │  🟡  │     │
│ │     │     │     │     │     │     │     │     │
│ └─────┴─────┴─────┴─────┴─────┴─────┴─────┘     │
├─────────────────────────────────────────────────┤
│ Assignment Details:                             │
│ ┌─────────────────────────────────────────────┐ │
│ │ [Photo] John Doe                             │ │
│ │ Product: ABC-001 Ceramic Bowl                │ │
│ │ Client: Exclusive Spa                        │ │
│ │ Quantity: 50 pcs                             │ │
│ │ Process: Throwing                            │ │
│ │ [Edit] [Delete]                              │ │
│ └─────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

#### Features
- **Drag-and-Drop:** Intuitive assignment creation and movement
- **Visual Indicators:**
  - 📋 Empty slot
  - ⟳ In progress
  - ✓ Completed
  - 🟡 Overtime
- **Worker Photos:** 50x50px thumbnails for easy identification
- **Group Management:** A/B group assignments with color coding
- **Print Layout:** Production-ready work plans with photos and details
- **Product Complexity Tracking:** Displays main parts, additional parts, and sub parts in assignments

### 4. Daily Production Recap

**URL:** `/recap`
**Access:** Forming users
**Purpose:** Daily production data entry and validation

#### Layout
```
┌─────────────────────────────────────────────────┐
│ Daily Recap - [Date] - Forming Stage            │
├─────────────────────────────────────────────────┤
│ Work Assignments:                               │
│ ┌─────────────────────────────────────────────┐ │
│ │ ABC-001 │ Ceramic Bowl │ 50 pcs │ ⟳       │ │
│ │ ├─ Good ─┬─ Reject ─┬─ Re-fire ─┬─ Notes ─┤ │ │
│ │ │ [50]   │ [0]      │ [2]       │ [...]    │ │
│ │ └────────┴──────────┴───────────┴──────────┘ │
│ │ [Save] [Complete]                            │ │
│ └─────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────┤
│ Validation Alerts:                              │
│ ⚠️ ABC-001: Expected 50, Reported 52 (+2 extra) │
│ ✅ All validations passed                        │
├─────────────────────────────────────────────────┤
│ Performance Summary:                            │
│ Today: +15 points │ Week: +85 points │ Month: +320 │
└─────────────────────────────────────────────────┘
```

#### Features
- **Real-time Validation:** Automatic quantity validation with alerts
- **Extra Quantity Tracking:** 15% default extra quantity (editable based on shape/size/difficulty), automatic stock creation for surplus production
- **Performance Metrics:** Plus/minus point system with trends
- **Photo Integration:** Product photos for easy identification
- **Bulk Operations:** Save progress, complete assignments

### 5. QC Results Interface

**URL:** `/qc`
**Access:** QC users
**Purpose:** Quality control data entry and stock management

#### Layout
```
┌─────────────────────────────────────────────────┐
│ QC Results - [Date]                             │
├─────────────────────────────────────────────────┤
│ Pending Inspections:                            │
│ ┌─────────────────────────────────────────────┐ │
│ │ PO-001 │ ABC-001 │ 100 pcs │ Loading High  │ │
│ │ ├─ Good ─┬─ Re-fire ─┬─ Reject ─┬─ 2nd ───┤ │ │
│ │ │ [95]   │ [3]       │ [2]      │ [0]      │ │
│ │ └────────┴───────────┴──────────┴──────────┘ │
│ │ Notes: Minor glaze defects on 2 pieces       │ │
│ │ [Save] [Complete] [Create Stock]             │ │
│ └─────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────┤
│ Stock Creation:                                 │
│ ┌─────────────────────────────────────────────┐ │
│ │ Surplus: 5 pcs from PO-001                   │ │
│ │ Grade: [1st] 2nd Quality                     │ │
│ │ Price: [95%] of standard                     │ │
│ │ [Create Stock]                               │ │
│ └─────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

#### Features
- **QC Categories:** Good, Re-fire, Reject, Second Quality tracking
- **Automatic Stock Creation:** Surplus production automatically inventoried
- **Grade Classification:** 1st/2nd quality with pricing adjustments
- **Integration:** Direct links to packing and shipping workflows

### 6. Public Production Tracking

**URL:** `/tracking`
**Access:** No login required
**Purpose:** External visibility into production progress

#### Layout
```
┌─────────────────────────────────────────────────┐
│ Production Tracking                             │
├─────────────────────────────────────────────────┤
│ Filters:                                        │
│ ┌─ PO ─────┬─ Client ─┬─ Date ───┬─ Stage ──┐   │
│ │ PO-001   │ Exclusive│ 2025-11  │ All      │   │
│ └──────────┴──────────┴──────────┴──────────┘   │
├─────────────────────────────────────────────────┤
│ Results:                                        │
│ ┌─────────────────────────────────────────────┐ │
│ │ PO      │ Client    │ Item    │ Stage    │ Status │
│ │ PO-001  │ Exclusive │ ABC-001 │ Forming  │ ✓ 85%  │ │
│ │         │           │         │ Glaze    │ ⟳ 60%  │ │
│ │         │           │         │ QC       │ 📋 0%   │ │
│ └─────────────────────────────────────────────┘ │
│ [Export CSV] [Export PDF]                       │
└─────────────────────────────────────────────────┘
```

#### Features
- **Advanced Filtering:** PO number, client, date range, process stage
- **Real-time Status:** Live progress updates without refresh
- **Export Capabilities:** CSV and PDF generation for reports
- **Professional Display:** Clean table format suitable for client sharing

---

## Mobile Responsiveness

### Progressive Web App Features

- **Offline Capability:** Core forms work without internet
- **Push Notifications:** Production alerts and updates
- **Touch Optimization:** Large touch targets for tablets
- **Camera Integration:** Photo uploads for quality documentation

### Mobile Layouts

#### Work Plan (Tablet)
```
┌─────────────────┐
│ Mon Tue Wed ... │ ← Swipe navigation
├─────────────────┤
│                 │
│  [Photo] John   │
│  ABC-001        │
│  50 pcs         │
│                 │
│  [Drag Handle]  │ ← Touch drag
└─────────────────┘
```

#### Daily Recap (Phone)
```
┌─────────────────┐
│ ABC-001         │
│ ━━━━━━━━━━━━━━━━ │
│ Good: [50]      │
│ Reject: [0]     │
│ Notes: [...]    │
│                 │
│ [Save] [Next]   │
└─────────────────┘
```

---

## Accessibility Compliance

### WCAG 2.1 AA Standards

- **Keyboard Navigation:** All interactive elements keyboard accessible
- **Screen Reader Support:** Proper ARIA labels and semantic HTML
- **Color Contrast:** Minimum 4.5:1 ratio for text
- **Focus Indicators:** Visible focus outlines for keyboard users
- **Alt Text:** All images have descriptive alt attributes
- **Form Labels:** All form inputs properly labeled

### Production Environment Considerations

- **High Contrast Mode:** For workers with visual impairments
- **Large Text Option:** Scalable text for readability
- **Reduced Motion:** Respects user motion preferences
- **Touch Targets:** Minimum 44px touch targets for mobile

---

## Performance Optimization

### Loading Strategies

- **Code Splitting:** Route-based code splitting for faster initial loads
- **Image Optimization:** Automatic WebP conversion and lazy loading
- **Data Pagination:** Server-side pagination for large datasets
- **Caching:** Aggressive caching for static assets and API responses

### Real-Time Performance

- **WebSocket Optimization:** Efficient message batching and compression
- **Update Throttling:** Debounced updates to prevent UI overload
- **Virtual Scrolling:** For large tables and calendars
- **Progressive Loading:** Critical content loads first

---

## Error Handling & Feedback

### User Feedback Patterns

- **Success States:** Green checkmarks with brief confirmation messages
- **Error States:** Red alerts with clear error descriptions and solutions
- **Loading States:** Skeleton screens and progress indicators
- **Empty States:** Helpful guidance when no data is available

### Validation Feedback

- **Inline Validation:** Real-time field validation with helpful hints
- **Form Errors:** Clear error messages with field highlighting
- **Confirmation Dialogs:** For destructive actions with clear consequences
- **Undo Options:** Where appropriate for reversible actions

---

## Implementation Guidelines

### Component Architecture

- **Atomic Design:** Buttons, inputs → molecules → organisms → templates
- **Consistent Spacing:** 8px grid system throughout
- **Design Tokens:** Centralized color, typography, and spacing values
- **Responsive Breakpoints:** Mobile (320px), Tablet (768px), Desktop (1024px+)

### Development Workflow

- **Design System First:** Implement shadcn/ui components before custom interfaces
- **Mobile-First Development:** Design mobile layouts before desktop
- **Accessibility Testing:** Automated and manual accessibility audits
- **User Testing:** Regular feedback sessions with production users

---

This UX design provides a solid foundation for gayaProdSystem, balancing the needs of production workers, managers, and external stakeholders while maintaining professional standards and accessibility compliance.