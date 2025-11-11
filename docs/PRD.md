# gayaProdSystem - Product Requirements Document

**Author:** BMad
**Date:** 2025-11-11
**Version:** 1.0

---

## Executive Summary

Build an enterprise application Product Collections Management & Production Tracking System for ceramic craft companies that serve orders from clients.

### General Description of the Flow

1. **R&D (Research & Development) Sample Development & Directory List**
   - User R&D responsible for directory listing & sample development
   - New clients and goods development
   - Client pays R&D fee
   - Sample process, review, approve/revision
   - If revision, return to fee payment and process
   - Approved becomes Directory List Client
   - Directory List becomes proforma to clients

2. **Purchase Order Management (POL)**
   - User sales admins manage and communicate with clients on Proforma & PO
   - Client pays deposit for order issued by Purchase Order List (POL) to production

3. **Product Collections**
   - Directory approved becomes client collection product with specification and technical process details
   - Frontend access (no login needed) with professional table list: filter, search, sort, pagination
   - Data uses existing MySQL database, will migrate to PostgreSQL for complex query logic and stability performance
   - All Products Collections have own Clients
   - Client Product collections types: "Exclusive", "Exclusive-Group", "General"
   - Clients Region (e.g., Bvlgari: Tokyo, Maldive, Paris, Bali, Milan)
   - Client has Departments (e.g., Spa, F&B, Restaurant, Bathroom, Public Area)

4. **Production Process & Tracking System**
   - Production divided into 3 user groups: Forming Section, Glaze Section, QC & Packaging Parts
   - Step production process: 1st Forming Stage, 2nd Glaze Stage, 3rd QC & Packaging Parts
   - Each user section responsible for production process flow
   - Start with Calendar planning: modern drag-and-drop weekly work plan for workers
   - Preparation from collection data
   - Product collection has master product codes and assembly product codes
   - Work plan as reference (printout)
   - Contains detailed items, processes, worker targets
   - Dynamic, can move forward/backward
   - Background color, overtime marking
   - Workers grouped (Group A, Group B)
   - Weekly period: 5 working days, printed Tuesday, overtime Sat/Sun or outside 8-hour week
   - Layout: worker photo (50x50px), item photo (50x50px), properties (client, POL, product code, name, quantities, process name), day/date labels (red for overtime)
   - After planning, user "forming" performs daily recap
   - Validation & Alert notification: validate planned vs actual quantity, quantity at each stage
   - Alert for rejected quantity reducing extra quantity (generally 15% extra from order qty)
   - Daily Production records: public professional table list (no login) for tracking/search, multi & dynamic filters (PO no, Client, item code, name, date range, process stage, detail), Search, Sort, Pagination
   - Logging System: record important events for future reference/learning
   - Revision ticket system: change/improvement after production (ticket_no, POL, product, title, purpose, explanation, attachments), submit to collection user for approval, update Product Collection data

5. **QC & Packaging Parts**
   - User QC & Packaging responsible for QC & Packaging (part of 4.1 c)
   - Items ready when Loading firing high or Loading firing luster
   - All QC results recorded: client, POL, good, re-firing, reject, second
   - System tracking for on-time delivery control
   - System alert & notification
   - System packing list & delivery (partial & full)
   - Used for further analysis & reports

6. **Glaze Parts**
   - User Glaze responsible for Glaze Parts (part of 4.1 b)
   - Items ready when loading biscuit

7. **Users Management**
   - System for register, login, manage accounts (username & password)
   - User has roles and sub roles

8. **Employee Management**
   - Workers executing production process
   - System performance assessment (plus and minus from 4.13)
   - System attendance assessment
   - Employee Profile
   - Each User section responsible for 8.2, 8.3

### What Makes This Special

The magic lies in transforming artisanal ceramic production from chaotic manual processes into a sophisticated, data-driven enterprise system that maintains the craft's integrity while enabling scalable business growth. What excites me most is how this system will empower ceramic artisans to focus on their craft while providing enterprise-level visibility and control over complex production workflows.

---

## Project Classification

**Technical Type:** Web Application (Enterprise B2B)
**Domain:** Manufacturing/Production (Ceramic Craft Industry)
**Complexity:** High - Complex multi-stage production workflows, real-time tracking, single-company deployment

This is a sophisticated enterprise web application for a dedicated ceramic craft company with complex production processes involving multiple user roles, real-time tracking, and integration with existing MySQL databases migrating to PostgreSQL.

{{#if domain_context_summary}}

### Domain Context

{{domain_context_summary}}
{{/if}}

---

## Success Criteria

Success means ceramic craft companies can seamlessly manage their entire production lifecycle from client R&D samples to final delivery, with real-time visibility and quality control. Key metrics include:

- 95% on-time delivery rate for production orders
- Zero data loss in production tracking across all stages
- 100% audit trail for quality control decisions
- 50% reduction in production coordination time
- Client satisfaction score of 4.5/5 for order management
- System uptime of 99.9% during business hours

{{#if business_metrics}}

### Business Metrics

{{business_metrics}}
{{/if}}

---

## Product Scope

### MVP - Minimum Viable Product

Core production tracking system with:

**R&D Sample Development & Directory Management:**
- Client onboarding with R&D fee payment tracking
- Sample development workflow: development → review → approve/revise (loop back on revision)
- Directory listing for approved samples
- Automatic proforma generation from directory items

**Purchase Order Management (POL):**
- Sales admin tools for client communication on proformas and POs
- Deposit payment tracking and validation
- Seamless transition from paid orders to production workflow

**Product Collections Management:**
- Collection types: Exclusive, Exclusive-Group, General
- Client attribution with region and department metadata
- Public catalog access (no login) with professional filtering: search, sort, pagination
- Database migration path: existing MySQL to PostgreSQL for complex queries and performance

**Production Process & Tracking System:**
- Three-stage workflow: Forming → Glaze → QC/Packaging with user role separation
- Calendar planning: drag-and-drop weekly work planning with worker assignments
- Real-time validation: quantity validation at each stage with alerts for discrepancies
- Daily recap recording with performance metrics
- Public production tracking (no login) with advanced filtering: PO no, Client, item code, name, date range, process stage, detail
- Logging system for production events and learning
- Revision ticket system for post-production improvements with approval workflow

**QC & Packaging Parts:**
- QC recording: re-fire, reject, second quality metrics
- Stock management: automatic stock creation from extra production, stock offering system with 1st/2nd grade categories
- Packaging management: packing lists and delivery tracking (partial/full) including stock deliveries
- Alert system for quality issues and delivery deadlines

**Glaze Parts:**
- Glaze stage management within production workflow

**Users Management:**
- User registration/login with username & password
- Role-based access with sub-roles

**Employee Management:**
- Worker profiles for production execution
- Performance assessment system (plus/minus from daily recaps)
- Attendance tracking
- Department/section responsibility assignment

**Additional MVP Features:**
- Real-time production status dashboard
- Basic reporting and analytics
- File attachment support for revisions and documentation

### Growth Features (Post-MVP)

- Advanced analytics and reporting dashboard with production efficiency metrics
- Mobile PWA for workers: offline production updates, time tracking, photo uploads
- Complete database migration to PostgreSQL with optimized complex queries
- Enhanced calendar planning: AI-suggested scheduling, resource optimization
- Automated alert system: production delays, quality issues, delivery deadlines
- Client portal: order tracking, approvals, revision requests, catalog browsing
- Inventory management: materials tracking, supply chain integration, reorder alerts, production stock management
- Advanced QC analytics: defect trend analysis, predictive quality insights
- Advanced single-company features: enhanced reporting, analytics, and process optimization
- API integrations: ERP systems, accounting software, shipping providers
- Advanced logging: AI-powered insights from production patterns

### Vision (Future)

AI-powered production optimization: predictive scheduling, automated process improvements, quality defect prediction. Integrated automated quality inspection systems, predictive maintenance for kilns and equipment, global supply chain visibility for international ceramic craft networks, blockchain traceability for luxury ceramic products, and AR/VR training for artisans.

---

{{#if domain_considerations}}

## Domain-Specific Requirements

{{domain_considerations}}

This section shapes all functional and non-functional requirements below.
{{/if}}

---

{{#if innovation_patterns}}

## Innovation & Novel Patterns

{{innovation_patterns}}

### Validation Approach

{{validation_approach}}
{{/if}}

---

{{#if project_type_requirements}}

## Web Application (SaaS B2B) Specific Requirements

**Single-Company Architecture:** Dedicated deployment for one ceramic craft company with comprehensive data management and customizable workflows.

**Database Migration Strategy:** Seamless transition from existing MySQL (gayafusionall schema) to PostgreSQL with complex query optimization for production tracking. Preserve all existing data relationships and add new tables for production tracking, user management, and workflow management while maintaining backward compatibility.

**Real-Time Features:** WebSocket connections for live production status updates across all user roles.

**Public Access Components:** Product Collections and Daily Production Records accessible without login for client visibility.

**Role-Based Security:** Granular permissions for R&D, Sales Admin, Forming, Glaze, QC/Packaging users with department and region restrictions.

**Offline Capability:** Progressive Web App features for production floor workers in areas with poor connectivity.
{{/if}}

{{#if endpoint_specification}}

### API Specification

{{endpoint_specification}}
{{/if}}

{{#if authentication_model}}

### Authentication & Authorization

{{authentication_model}}
{{/if}}

{{#if platform_requirements}}

### Platform Support

{{platform_requirements}}
{{/if}}

{{#if device_features}}

### Device Capabilities

{{device_features}}
{{/if}}

{{#if tenant_model}}

### Multi-Tenancy Architecture

{{tenant_model}}
{{/if}}

{{#if permission_matrix}}

### Permissions & Roles

{{permission_matrix}}
{{/if}}
{{/if}}

---

{{#if ux_principles}}

## User Experience Principles

{{ux_principles}}

### Key Interactions

{{key_interactions}}
{{/if}}

---

## Functional Requirements

### 1. R&D Sample Development & Directory Management
- **User R&D Responsibility:** Directory listing and sample development management
- **New Client & Goods Development:** Process for onboarding new clients and developing new products
- **R&D Fee Payment:** Client payment tracking for R&D services
- **Sample Process:** Development, review, and approval workflow
- **Approval/Revision Loop:** If revision needed, return to fee payment and reprocess
- **Directory List Client:** Approved samples become client directory entries
- **Proforma Generation:** Directory items automatically become proformas for clients

### 2. Purchase Order Management (POL)
- **Sales Admin Responsibility:** Manage and communicate with clients regarding proformas and purchase orders
- **Deposit Payment:** Client deposit tracking for orders issued by POL to production
- **Order Transition:** Seamless handoff from paid orders to production workflow

### 3. Product Collections Management
- **Collection Creation:** Approved directory becomes client collection product with detailed specifications and technical processes
- **Public Frontend Access:** No-login required professional table interface with filter, search, sort, pagination
- **Database Strategy:** Utilize existing MySQL database (gayafusionall schema), migrate to PostgreSQL for complex query logic and performance stability
- **Client Ownership:** All product collections belong to specific clients via ClientCode and ClientDescription fields
- **Collection Types:**
  - **Exclusive:** Products collected only by the specific client
  - **Exclusive-Group:** Products collected by clients in the same group (e.g., Bvlgari-Bali, Bvlgari-Tokyo)
  - **General:** Products that can be collected by other clients
- **Client Regions:** Geographic regions (e.g., Bvlgari: Tokyo, Maldive, Paris, Bali, Milan)
- **Client Departments:** Functional areas (e.g., Spa, F&B, Restaurant, Bathroom, Public Area)
- **Existing Schema Integration:**
  - **tblcollect_master:** Main collection table with comprehensive product specifications
  - **tblcollect_category, tblcollect_color, tblcollect_design, tblcollect_material, tblcollect_name, tblcollect_size, tblcollect_texture:** Reference tables for product attributes
  - **Material Tables:** tblclay, tblcasting, tblengobe, tblestruder, tblglaze, tbllustre, tblstainoxide, tbltexture, tbltools for production materials
  - **Product Coding:** CollectCode (15-char), DesignCode, NameCode, CategoryCode, SizeCode, TextureCode, ColorCode, MaterialCode
  - **Technical Specifications:** Dimensions (Width, Height, Length, Diameter), weights, firing temperatures, glaze details
  - **Production Data:** Time estimates per process, PPH (pieces per hour) rates, cost calculations
  - **Media Storage:** Photo1-4 fields for product images, TechDraw for technical drawings

### 4. Production Process & Tracking System
- **User Group Division:** Three production groups - Forming Section, Glaze Section, QC & Packaging Parts
- **Production Stages:**
  - **1st Forming Stage:** Throwing, trimming, decoration, drying
  - **2nd Glaze Stage:** Loading-firing biscuit, unloading, loading-firing high, loading-firing luster, waxing, glazing & decoration
  - **3rd QC & Packaging Parts:** Unloading firing high, unloading firing luster, quality control, wrapping, packaging
- **Section Responsibility:** Each user section manages their production process flow
- **Calendar Planning:** Modern drag-and-drop weekly work plan for workers in each division
- **Data Preparation:** All required materials and data sourced from existing collection data (tblcollect_master, material tables)
- **Product Codes:** Utilize existing CollectCode system and add master/assembly product codes for production tracking (ceramic and non-ceramic materials, set products)
- **Work Plan Reference:** Serves as printed work reference with detailed items and completion processes
- **Worker Targets:** Includes production targets for each worker
- **Dynamic Planning:** Work plans can move forward/backward based on field conditions
- **Visual Indicators:** Initial background color, overtime marking for easy goods movement tracking
- **Worker Groups:** Workers grouped within plans (Group A, Group B, etc.)
- **Weekly Period:** 5 working days, plans printed every Tuesday
- **Overtime Options:** Saturday/Sunday or outside standard 8-hour work week when production is full
- **Work Plan Layout:**
  - Worker photo (50x50px) on left, employee name below
  - Item photo (50x50px) in middle
  - Item properties: client, POL, product code, product name, order quantity, production quantity, target quantity, process name
  - Day of week and date labels above (red for overtime Sat/Sun)
- **Daily Recap:** After planning execution, Forming user performs daily process recap
- **Validation & Alert System:** Critical data validation
  - Validate planned quantity vs actual quantity
  - Validate quantity at each process stage (e.g., 10 pieces thrown = 10 pieces trimmed = 10 pieces decorated = 10 pieces dried = 10 pieces loaded for biscuit firing)
  - Alert notifications for rejected quantities reducing extra quantity (generally 15% extra from order qty)
- **Public Production Records:** Professional table list (no login) for cross-department tracking and search
  - Multi & dynamic filters: PO no, Client, item code, item name, date range, process stage, process detail name
  - Search, Sort, Pagination features
- **Logging System:** Record important production events for future reference and learning
- **Revision Ticket System:** Post-production changes/improvements
  - Fields: ticket_no, POL, product, revision title, purpose, explanation, attachments
  - Submit to collection user for approval
  - Update Product Collection data for future orders

### 5. QC & Packaging Parts
- **User Responsibility:** QC & Packaging Parts management (part of Production Stage 3)
- **Item Readiness:** Items become available when reaching Loading firing high or Loading firing luster
- **QC Results Recording:** All results tracked - client, POL, good, re-firing, reject, second quality
- **Stock Management:** Automatic stock creation from extra production after order completion (e.g., GC-001 Product A, qty order 100, good QC 110 = stock 10 pcs)
- **Stock Offer System:** Sales admin offers extra stock while updating client order status
- **Stock Categories:**
  - **1st Grade:** Premium quality stock with discount pricing
  - **2nd Grade:** Secondary quality stock with higher discount pricing
- **Stock Delivery Logic:** If client purchases extra stock, delivered together with PO; if not purchased, becomes managed stock in QC system for future re-orders
- **Stock Availability:** Sales admin can check stock data directly during client re-orders
- **Delivery Control:** System tracking for on-time delivery management
- **Alert & Notification System:** Automated alerts for issues and deadlines
- **Packing List & Delivery:** Support for partial and full deliveries
- **Analysis & Reports:** QC data used for further analysis and reporting

### 6. Glaze Parts
- **User Responsibility:** Glaze Parts management (part of Production Stage 2)
- **Item Readiness:** Items become available when reaching loading biscuit stage

### 7. Users Management
- **Account System:** User registration, login, and account management (username & password)
- **Role System:** Users have roles and sub-roles for access control

### 8. Employee Management
- **Worker Profiles:** Employees who execute production processes
- **Performance Assessment:** System tracking plus/minus points from daily recaps (section 4.13)
- **Attendance Assessment:** System tracking worker attendance
- **Employee Profiles:** Comprehensive worker information
- **Section Responsibility:** Each user section responsible for performance (8.2) and attendance (8.3) assessment

### Additional Functional Requirements
- **File Attachments:** Support for uploads in revision tickets, documentation, and integration with existing product photos (Photo1-4) and technical drawings (TechDraw)
- **Real-Time Updates:** Live production status across all user interfaces
- **Single-Company Data Management:** Comprehensive data management for one ceramic craft company
- **Export Capabilities:** Data export for reporting and analysis

---

## Non-Functional Requirements

### Performance
- **Real-Time Updates:** Production status updates within 2 seconds of data entry across all user interfaces
- **Query Response:** Complex production tracking queries (with multiple filters) return within 3 seconds
- **Concurrent Users:** Support 100+ simultaneous users across production floor, office, and public access
- **Public Catalog:** Product collections and production tracking tables load within 1 second for external viewers
- **Calendar Planning:** Drag-and-drop operations respond within 500ms
- **File Uploads:** Revision ticket attachments upload within 10 seconds for files up to 50MB
- **Daily Recap Processing:** Batch processing of daily production data completes within 30 seconds

### Security
- **Role-Based Access:** Strict separation between R&D, Sales Admin, Forming, Glaze, QC/Packaging roles with granular permissions
- **Data Encryption:** Client data, production records, and financial information encrypted at rest and in transit
- **Audit Trails:** Complete logging of all production decisions, quality control actions, and system changes
- **Data Security:** Comprehensive data protection with role-based access control and audit trails for all company data
- **Public Access Security:** No-login public interfaces protected against unauthorized data access and injection attacks
- **Employee Data Protection:** Worker personal information and performance data secured with role-based visibility

### Scalability
- **Database Growth:** Support for 500,000+ production records with optimized indexing for complex queries
- **User Expansion:** Scale from 10 to 1000+ users per company with performance degradation <10%
- **Production Volume:** Handle 50,000+ items in active production simultaneously across all stages
- **File Storage:** Support for revision ticket attachments, production photos, worker images, and integration with existing product photos (Photo1-4) and technical drawings (TechDraw) with CDN integration
- **Concurrent Planning:** Support multiple users creating/updating work plans simultaneously without conflicts
- **Reporting Load:** Handle heavy reporting periods (end-of-month) with response times <5 seconds

### Integration
- **Database Migration:** Seamless MySQL (gayafusionall) to PostgreSQL transition with zero data loss and validation, preserving all existing product collection data and relationships
- **Legacy System Integration:** APIs for existing company databases, accounting systems, and workflows
- **Export Capabilities:** CSV/Excel/PDF export for production reports, QC analysis, and client statements
- **API Readiness:** RESTful APIs for mobile apps, client portals, and third-party integrations (ERP, shipping)
- **Email/SMS Integration:** Automated notifications for alerts, approvals, and status updates
- **Print Integration:** Direct printing support for work plans, packing lists, and delivery documents

### Usability
- **Progressive Web App:** Offline capability for production floor workers in poor connectivity areas
- **Mobile Responsiveness:** Full functionality on tablets and phones for workers and managers
- **Accessibility:** WCAG 2.1 AA compliance for all user interfaces
- **Multi-Language Support:** English default with framework for additional languages
- **Training Requirements:** Intuitive interfaces requiring minimal training for production workers

### Reliability
- **System Uptime:** 99.9% availability during business hours (6 AM - 10 PM local time)
- **Data Backup:** Automated daily backups with 30-day retention and disaster recovery testing
- **Transaction Integrity:** ACID compliance for all production data operations
- **Error Recovery:** Graceful error handling with user-friendly messages and automatic retry mechanisms
- **Monitoring:** Real-time system health monitoring with automated alerts for administrators

### Maintainability
- **Code Quality:** Modular architecture with comprehensive test coverage (>80%)
- **Documentation:** Complete API documentation and system architecture guides
- **Deployment:** Automated deployment pipelines with zero-downtime updates
- **Logging:** Structured logging for debugging and performance analysis
- **Version Control:** Complete audit trail of system changes and configurations

---

## Implementation Planning

### Development Phases

**Phase 1: Foundation (Weeks 1-4)**
- Database migration: MySQL (gayafusionall schema) to PostgreSQL with schema optimization and data preservation
- User management and authentication system
- Integration with existing product collections (tblcollect_master and related tables)
- Employee management foundation

**Phase 2: Core Production (Weeks 5-12)**
- R&D sample development workflow
- Purchase order management (POL)
- Production process tracking (Forming, Glaze, QC/Packaging)
- Calendar planning with drag-and-drop functionality
- Daily recap and validation systems

**Phase 3: Advanced Features (Weeks 13-20)**
- Public access interfaces (Product Collections, Production Tracking)
- Logging and revision ticket systems
- Alert and notification systems
- QC analytics and reporting
- Performance assessment integration

**Phase 4: Optimization & Launch (Weeks 21-24)**
- Performance optimization for concurrent users
- Mobile responsiveness and PWA features
- Integration testing with legacy systems
- Security audit and penetration testing
- Production deployment and training

### Epic Breakdown Required

Requirements must be decomposed into epics and bite-sized stories (200k context limit).

**Next Step:** Run `*create-epics-and-stories` to create the implementation breakdown.

---

## Technical Architecture Overview

- **Frontend:** React.js with TypeScript, Material-UI component library optimized for production floor usability
- **Backend:** Node.js with Express.js framework, RESTful APIs for all operations
- **Database:** PostgreSQL (migrated from MySQL gayafusionall schema) with complex query optimization for production tracking and existing product collections
  - **Existing Tables:** tblcollect_master (11,000+ products), material tables (clay, glaze, tools, etc.), reference tables (categories, colors, sizes, etc.)
  - **New Tables:** Production tracking, user management, workflows, logging, revisions
- **Real-Time:** WebSocket integration for live production updates across all user roles
- **File Storage:** AWS S3 or equivalent for attachments, images, and integration with existing product photos (Photo1-4 fields)
- **Deployment:** Docker containers with Kubernetes orchestration for scalability
- **Security:** JWT authentication with role-based access control (R&D, Sales, Forming, Glaze, QC/Packaging)
- **Integration:** APIs for existing MySQL database during migration period, export capabilities for reporting

---

## Risk Assessment

**High Risk:**
- Database migration complexity with zero data loss requirement (preserving 11,000+ product records from gayafusionall schema)
- Real-time validation system accuracy for production tracking
- Single-company data management with comprehensive security controls

**Medium Risk:**
- Drag-and-drop calendar performance with large datasets
- Offline PWA functionality in production environments
- Integration with existing MySQL databases (gayafusionall schema with 11,000+ product records)

**Low Risk:**
- Public access interfaces (no authentication required)
- File upload and attachment management
- Basic CRUD operations for users and employees

---

## Success Metrics

- **Development:** All epics completed within 24 weeks with <10% scope creep
- **Quality:** <5 critical bugs in production, >95% test coverage
- **Performance:** All non-functional requirements met in staging environment
- **User Adoption:** >80% user training completion, <2 hour average task completion time
- **Business Impact:** 30% reduction in production coordination time within 3 months

---

## References

{{#if product_brief_path}}

- Product Brief: {{product_brief_path}}
  {{/if}}
  {{#if domain_brief_path}}
- Domain Brief: {{domain_brief_path}}
  {{/if}}
  {{#if research_documents}}
- Research: {{research_documents}}
  {{/if}}

---

## Next Steps

1. **Epic & Story Breakdown** - Run: `*create-epics-and-stories`
2. **Technical Architecture** - Run: `*create-architecture`
3. **UX Design** - Run: `*create-ux-design`
4. **Database Migration Plan** - Run: `*create-database-migration`

---

_This PRD captures the essence of gayaProdSystem - The magic lies in transforming artisanal ceramic production from chaotic manual processes into a sophisticated, data-driven enterprise system that maintains the craft's integrity while enabling scalable business growth._

_Created through collaborative discovery between BMad and AI facilitator._