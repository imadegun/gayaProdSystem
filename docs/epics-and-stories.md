# gayaProdSystem - Epic Breakdown

**Author:** BMad
**Date:** 2025-11-11
**Project Level:** Enterprise B2B Web Application
**Target Scale:** Single-company deployment with 100+ concurrent users

---

## Overview

This document provides the complete epic and story breakdown for gayaProdSystem, decomposing the requirements from the [PRD](./PRD.md) into implementable stories. The system transforms artisanal ceramic production into a sophisticated, data-driven enterprise platform with stock management functionality.

The epic structure follows natural groupings based on business capabilities: Foundation (database migration and infrastructure), Client Management (R&D and sales workflows), Product Management (collections and production), Quality Assurance (QC and stock), and Support Systems (users, employees, reporting).

---

## Epic 1: Foundation & Infrastructure

**Goal:** Establish the technical foundation enabling all subsequent development work, including database migration and core infrastructure setup.

### Story 1.1: Database Migration & Schema Setup
As a system administrator,
I want to migrate from MySQL (gayafusionall schema) to PostgreSQL,
So that I can leverage complex queries and improved performance for production tracking.

**Acceptance Criteria:**
**Given** existing MySQL database with 11,000+ product records
**When** migration process is executed
**Then** all data is preserved with zero loss and relationships maintained
**And** complex production tracking queries perform within 3 seconds

**Prerequisites:** None (foundation story)

**Technical Notes:** Preserve tblcollect_master, material tables, reference tables; add production tracking, user management, workflow tables; validate performance benchmarks.

### Story 1.2: User Authentication & Role Management
As a system administrator,
I want to implement user registration and role-based access control,
So that users can securely access the system with appropriate permissions.

**Acceptance Criteria:**
**Given** user registration request
**When** user provides credentials and role selection
**Then** account is created with JWT authentication
**And** role-based permissions are enforced (R&D, Sales, Forming, Glaze, QC/Packaging)

**Prerequisites:** Story 1.1

**Technical Notes:** Implement JWT with refresh tokens, role hierarchy, sub-role management, password security policies.

### Story 1.3: Real-Time Infrastructure Setup
As a developer,
I want to implement WebSocket infrastructure,
So that all users receive live production status updates.

**Acceptance Criteria:**
**Given** production data changes
**When** updates occur in any stage
**Then** all connected clients receive updates within 2 seconds
**And** performance remains stable with 100+ concurrent users

**Prerequisites:** Story 1.1

**Technical Notes:** WebSocket server integration, connection management, message queuing, fallback to polling for unsupported clients.

---

## Epic 2: Client Management & Sales Workflow

**Goal:** Enable end-to-end client lifecycle management from R&D onboarding through order fulfillment, including stock management integration.

### Story 2.1: R&D Client Onboarding & Fee Tracking
As an R&D user,
I want to onboard new clients with fee payment tracking,
So that development workflows can be initiated properly.

**Acceptance Criteria:**
**Given** new client information
**When** R&D user creates client profile
**Then** automatic client code is generated
**And** R&D fee payment status is tracked (pending, paid, overdue)
**And** client regions and departments are assigned

**Prerequisites:** Story 1.2

**Technical Notes:** Client table integration with existing schema, payment status workflow, region/department reference data.

### Story 2.2: Sample Development Workflow
As an R&D user,
I want to manage sample development with approval loops,
So that approved samples become directory listings.

**Acceptance Criteria:**
**Given** client R&D fee is paid
**When** sample development is initiated
**Then** workflow progresses through draft → development → review → approval
**And** revision loop returns to fee payment if needed
**And** approved samples automatically become directory entries

**Prerequisites:** Story 2.1

**Technical Notes:** Status tracking system, approval workflow, integration with product collections, file attachment support.

### Story 2.3: Sales Proforma & Purchase Order Management
As a sales admin,
I want to generate proformas and manage purchase orders,
So that client orders transition smoothly to production.

**Acceptance Criteria:**
**Given** approved directory items
**When** sales admin creates proforma
**Then** professional proforma is generated
**And** client communication is tracked
**And** deposit payment status is monitored
**And** approved orders automatically initiate production workflow

**Prerequisites:** Story 2.2

**Technical Notes:** Proforma generation from directory data, payment integration, order status tracking, production workflow triggers.

---

## Epic 3: Product Collections & Catalog Management

**Goal:** Provide comprehensive product collection management with public access and client attribution, serving as the foundation for production workflows.

### Story 3.1: Collection Type Management
As a product manager,
I want to manage collection types (Exclusive, Exclusive-Group, General),
So that products are properly attributed to clients.

**Acceptance Criteria:**
**Given** product collection data
**When** collection type is assigned
**Then** client ownership is established
**And** Exclusive-Group collections link to client groups
**And** General collections allow multi-client access

**Prerequisites:** Story 1.1

**Technical Notes:** Collection type validation, client group management, ownership rules enforcement.

### Story 3.2: Public Product Catalog
As a client,
I want to browse product collections without login,
So that I can view available products professionally.

**Acceptance Criteria:**
**Given** public access to catalog
**When** client browses collections
**Then** professional table interface displays with search, sort, pagination
**And** client-specific views show appropriate collection types
**And** advanced filters work by region, department, category

**Prerequisites:** Story 3.1

**Technical Notes:** No-authentication interface, responsive table design, filtering logic, performance optimization for large datasets.

### Story 3.3: Collection Data Integration
As a system integrator,
I want to integrate existing collection schema,
So that all product specifications and materials are available.

**Acceptance Criteria:**
**Given** existing MySQL gayafusionall schema
**When** collections are accessed
**Then** tblcollect_master data is fully integrated
**And** material tables (clay, glaze, tools) are accessible
**And** reference tables (categories, colors, sizes) support filtering

**Prerequisites:** Story 1.1

**Technical Notes:** Schema mapping, data transformation, relationship preservation, query optimization.

---

## Epic 4: Production Process & Tracking

**Goal:** Implement the three-stage production workflow with calendar planning, real-time validation, and comprehensive tracking capabilities.

### Story 4.1: Calendar Planning System
As a production manager,
I want to create drag-and-drop weekly work plans,
So that workers are efficiently scheduled across production stages.

**Acceptance Criteria:**
**Given** production orders and worker availability
**When** manager creates weekly plan
**Then** drag-and-drop interface allows assignment
**And** worker groups (A, B) are managed
**And** overtime is marked with visual indicators
**And** plans print with photos, properties, day/date labels

**Prerequisites:** Story 3.3

**Technical Notes:** Calendar component integration, drag-drop functionality, worker photo storage, print layout generation.

### Story 4.2: Daily Production Recap & Validation
As a forming user,
I want to perform daily recaps with real-time validation,
So that production progress is accurately tracked.

**Acceptance Criteria:**
**Given** planned production quantities
**When** forming user enters daily recap
**Then** quantities are validated against plan
**And** alerts trigger for discrepancies >15% extra reduction
**And** stage-by-stage validation ensures consistency
**And** performance metrics are recorded for assessment

**Prerequisites:** Story 4.1

**Technical Notes:** Real-time validation logic, alert system, performance calculation, integration with employee management.

### Story 4.3: Public Production Tracking
As a stakeholder,
I want to view production progress publicly,
So that I can monitor status without login.

**Acceptance Criteria:**
**Given** production data access
**When** user views tracking table
**Then** professional interface shows PO, client, item details
**And** multi-dynamic filters work (PO, client, code, date range, stage)
**And** real-time updates display without refresh

**Prerequisites:** Story 4.2

**Technical Notes:** Public interface design, advanced filtering, WebSocket integration, export capabilities.

### Story 4.4: Revision Ticket System
As a production user,
I want to submit post-production improvement tickets,
So that collection data can be updated for future orders.

**Acceptance Criteria:**
**Given** production completion
**When** user identifies improvement need
**Then** ticket is created with POL, product, explanation, attachments
**And** approval workflow routes to collection users
**And** approved changes update collection data automatically

**Prerequisites:** Story 4.2

**Technical Notes:** Ticket workflow, file attachment handling, approval routing, collection data updates.

---

## Epic 5: Quality Control & Stock Management

**Goal:** Enable comprehensive QC processes with automatic stock creation, offering system, and delivery management.

### Story 5.1: QC Results Recording
As a QC user,
I want to record quality control results,
So that production quality is tracked and analyzed.

**Acceptance Criteria:**
**Given** items reach QC stage (loading firing high/luster)
**When** QC inspection completes
**Then** results are recorded: good, re-fire, reject, second quality
**And** client and POL associations are maintained
**And** data supports analysis and reporting

**Prerequisites:** Story 4.2

**Technical Notes:** QC interface design, result categorization, data storage, reporting integration.

### Story 5.2: Automatic Stock Creation & Management
As a QC user,
I want to automatically create stock from extra production,
So that surplus items become available for future sales.

**Acceptance Criteria:**
**Given** order completion with extra quantities
**When** QC results show surplus (e.g., order 100, good 110)
**Then** stock is automatically created
**And** categorized as 1st grade (premium) or 2nd grade (secondary)
**And** stock data is available for sales admin checking

**Prerequisites:** Story 5.1

**Technical Notes:** Stock calculation logic, grade determination, inventory tracking, sales integration.

### Story 5.3: Stock Offering & Order Integration
As a sales admin,
I want to offer stock to clients during re-orders,
So that extra production generates additional revenue.

**Acceptance Criteria:**
**Given** client re-order inquiry
**When** sales admin checks stock availability
**Then** relevant stock is displayed with grades and discounts
**And** client can purchase stock alongside new orders
**And** stock delivery integrates with PO fulfillment

**Prerequisites:** Story 5.2

**Technical Notes:** Stock search interface, discount pricing logic, order integration, delivery coordination.

### Story 5.4: Packaging & Delivery Management
As a QC user,
I want to manage packaging and delivery tracking,
So that orders are shipped on time with proper documentation.

**Acceptance Criteria:**
**Given** QC completion
**When** items are ready for shipping
**Then** packing lists are generated
**And** partial/full deliveries are tracked
**And** delivery control system monitors on-time performance
**And** alerts trigger for delays

**Prerequisites:** Story 5.1

**Technical Notes:** Packing list generation, delivery tracking, alert system, integration with stock management.

---

## Epic 6: Glaze Stage Management

**Goal:** Enable glaze users to manage the critical glaze stage with proper readiness tracking and quality monitoring.

### Story 6.1: Glaze Readiness Tracking
As a glaze user,
I want to track item readiness for glaze processes,
So that I know when items are available from biscuit firing.

**Acceptance Criteria:**
**Given** items complete forming stage
**When** items reach loading biscuit stage
**Then** automatic notifications alert glaze users
**And** glaze process interface becomes available
**And** integration with overall production workflow is maintained

**Prerequisites:** Story 4.2

**Technical Notes:** Stage transition triggers, notification system, workflow integration.

### Story 6.2: Glaze Process Recording
As a glaze user,
I want to record glaze application details,
So that production progress and quality are monitored.

**Acceptance Criteria:**
**Given** items ready for glazing
**When** glaze processes are applied
**Then** application details are logged with timestamps
**And** quality checks are performed during glaze stage
**And** data integrates with QC and packaging stages

**Prerequisites:** Story 6.1

**Technical Notes:** Glaze logging interface, quality checkpoints, data flow to subsequent stages.

---

## Epic 7: Employee Management & Performance

**Goal:** Provide comprehensive employee profiles, performance assessment, and attendance tracking integrated with production workflows.

### Story 7.1: Employee Profile Management
As an HR manager,
I want to manage comprehensive employee profiles,
So that worker information is centralized and accessible.

**Acceptance Criteria:**
**Given** new employee data
**When** profile is created
**Then** photo upload is supported
**And** department and role assignments are managed
**And** profile data integrates with production planning

**Prerequisites:** Story 1.2

**Technical Notes:** Profile interface, photo storage, department/role management, planning integration.

### Story 7.2: Performance Assessment System
As a section manager,
I want to assess employee performance from production data,
So that workers receive fair evaluations based on metrics.

**Acceptance Criteria:**
**Given** daily production recaps
**When** performance is evaluated
**Then** plus/minus points are calculated automatically
**And** performance dashboard shows trends
**And** integration with production tracking data is seamless

**Prerequisites:** Story 4.2

**Technical Notes:** Performance calculation logic, dashboard design, historical tracking.

### Story 7.3: Attendance Tracking
As a section manager,
I want to track employee attendance,
So that attendance patterns can be monitored and reported.

**Acceptance Criteria:**
**Given** employee work schedules
**When** attendance is recorded
**Then** automated tracking captures attendance data
**And** reports and analytics are available
**And** integration with performance assessment works

**Prerequisites:** Story 7.1

**Technical Notes:** Attendance interface, automation logic, reporting capabilities.

---

## Epic 8: Reporting & Analytics

**Goal:** Provide comprehensive reporting capabilities for production tracking, QC analysis, stock management, and business intelligence.

### Story 8.1: Production Efficiency Reports
As a manager,
I want to generate production reports,
So that I can analyze efficiency and identify improvements.

**Acceptance Criteria:**
**Given** production tracking data
**When** report is requested
**Then** custom report builder allows filtering
**And** export capabilities support CSV, Excel, PDF
**And** scheduled report generation is available

**Prerequisites:** Story 4.3

**Technical Notes:** Report builder interface, export functionality, scheduling system.

### Story 8.2: QC & Stock Analytics
As a QC manager,
I want to analyze quality trends and stock performance,
So that I can identify improvement opportunities.

**Acceptance Criteria:**
**Given** QC and stock data
**When** analytics are accessed
**Then** trend analysis shows defects and rejections
**And** stock utilization metrics are displayed
**And** predictive insights highlight potential issues

**Prerequisites:** Story 5.4

**Technical Notes:** Analytics dashboard, trend analysis algorithms, predictive modeling.

### Story 8.3: Business Intelligence Dashboard
As a business analyst,
I want to track key performance indicators,
So that business goals are monitored effectively.

**Acceptance Criteria:**
**Given** system data across all modules
**When** KPI dashboard is accessed
**Then** real-time metrics display
**And** custom KPI definitions are supported
**And** alert system triggers for threshold breaches

**Prerequisites:** Story 8.1

**Technical Notes:** KPI framework, real-time calculations, alert configuration.

---

## Epic 9: System Integration & File Management

**Goal:** Ensure seamless integration with existing systems and robust file management for attachments and media.

### Story 9.1: Legacy System Integration
As a system integrator,
I want to maintain compatibility with existing MySQL data,
So that current operations continue during migration.

**Acceptance Criteria:**
**Given** existing MySQL gayafusionall schema
**When** integration is active
**Then** read-only access preserves current data
**And** synchronization occurs during migration period
**And** data integrity is continuously validated

**Prerequisites:** Story 1.1

**Technical Notes:** Read-only API layer, synchronization logic, validation checks.

### Story 9.2: File Attachment Management
As a system user,
I want to manage file attachments securely,
So that documents and images are stored and accessed properly.

**Acceptance Criteria:**
**Given** file upload requirement (revision tickets, documentation)
**When** files are attached
**Then** secure storage is provided
**And** integration with existing product photos (Photo1-4) works
**And** access controls are enforced by role

**Prerequisites:** Story 1.3

**Technical Notes:** File upload system, storage integration, access control, existing photo field integration.

---

_Epics are sequenced for logical dependency flow: Foundation enables Client Management, which enables Product Management, which enables Production tracking, Quality Control, and Reporting. Stock management is integrated throughout QC processes. Each epic contains vertically-sliced stories completable by single dev agents within focused sessions._