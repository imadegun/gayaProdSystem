# gayaProdSystem - Database Migration Plan

**Author:** BMad
**Date:** 2025-11-11
**Version:** 1.0

---

## Executive Summary

This document outlines the comprehensive database migration strategy for gayaProdSystem, transitioning from the existing MySQL (gayafusionall schema) to PostgreSQL with Prisma ORM. The migration preserves all existing product collection data (11,000+ records) while adding new tables for production tracking, user management, and workflow management.

**Migration Scope:**
- Source: MySQL (gayafusionall schema)
- Target: PostgreSQL with Prisma ORM
- Data Volume: 11,000+ product records, material specifications, reference data
- Critical Success Factor: Zero data loss, 100% data integrity

---

## Current MySQL Schema Assessment

### Existing Tables (gayafusionall schema)

#### Core Product Tables
- **tblcollect_master**: Main collection table with 11,000+ products
  - Fields: id, collect_code (15-char), design_code, name_code, category_code, size_code, texture_code, color_code, material_code
  - Client attribution: client_code, client_description
  - Technical specs: dimensions (width, height, length, diameter), weights, firing temperatures
  - Media: photo1-4 (file paths), tech_draw (technical drawing)
  - Production data: time estimates, PPH rates, cost calculations

#### Reference Tables
- **tblcollect_category**: Product categories
- **tblcollect_color**: Color Name
- **tblcollect_design**: Client Design
- **tblcollect_material**: Material types
- **tblcollect_name**: Product names
- **tblcollect_size**: Size specifications
- **tblcollect_texture**: Texture Name
#### Material Tables
- **tblclay**: Clay specifications
- **tblcasting**: Casting materials
- **tblengobe**: Engobe materials
- **tblglaze**: Glaze formulations
- **tbllustre**: Lustre materials
- **tblstainoxide**: Stain and oxide materials
- **tbltexture**: Texture materials
- **tbltools**: Tool materials

### Data Characteristics
- **Volume**: 11,000+ product records
- **Relationships**: Complex interdependencies between products and materials
- **File References**: Photo and technical drawing paths
- **Encoding**: Legacy character encoding considerations
- **Constraints**: Existing business rules and validations

---

## Target PostgreSQL Schema with Prisma

### Prisma Schema Design

```prisma
// schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Existing migrated tables
model TblcollectMaster {
  id                Int      @id @default(autoincrement())
  collectCode       String   @unique @map("collect_code") // Master product code
  assemblyCode      String?  @map("assembly_code") // Assembly product code for sets and non-ceramic materials
  designCode        String   @map("design_code")
  nameCode          String   @map("name_code")
  categoryCode      String   @map("category_code")
  sizeCode          String   @map("size_code")
  textureCode       String   @map("texture_code")
  colorCode         String   @map("color_code")
  materialCode      String   @map("material_code")
  clientCode        String?  @map("client_code")
  clientDescription String?  @map("client_description")
  collectDate       DateTime? @default(sql"'0001-01-01'") @map("collect_date")
  techDraw          String?  @map("tech_draw")
  photo1            String?  @map("photo1")
  photo2            String?  @map("photo2")
  photo3            String?  @map("photo3")
  photo4            String?  @map("photo4")
  isAssembly        Boolean  @default(false) @map("is_assembly") // Indicates if this is an assembly/set product
  assemblyComponents Json?   @map("assembly_components") // JSON array of component product codes
  createdAt         DateTime @default(now()) @map("created_at")
  updatedAt         DateTime @updatedAt @map("updated_at")

  // Relations
  category          TblcollectCategory? @relation(fields: [categoryCode], references: [categoryCode])
  color             TblcollectColor?    @relation(fields: [colorCode], references: [colorCode])
  design            TblcollectDesign?   @relation(fields: [designCode], references: [designCode])
  material          TblcollectMaterial? @relation(fields: [materialCode], references: [materialCode])
  name              TblcollectName?     @relation(fields: [nameCode], references: [nameCode])
  size              TblcollectSize?     @relation(fields: [sizeCode], references: [sizeCode])
  texture           TblcollectTexture?  @relation(fields: [textureCode], references: [textureCode])

  // Production relations
  workPlanAssignments WorkPlanAssignment[]

  @@map("tblcollect_master")
}

// Reference tables (migrated)
model TblcollectCategory {
  categoryCode    String @id @map("category_code")
  categoryName    String @map("category_name")

  products        TblcollectMaster[]
  @@map("tblcollect_category")
}

// New production tracking tables
model User {
  id            Int       @id @default(autoincrement())
  username      String    @unique
  passwordHash  String    @map("password_hash")
  email         String?
  role          String    // R&D, Sales, Forming, Glaze, QC, Admin
  subRole       String?   @map("sub_role")
  isActive      Boolean   @default(true) @map("is_active")
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")

  employees     Employee[]
  purchaseOrders PurchaseOrder[] @relation("CreatedBy")
  workPlans     WorkPlan[] @relation("CreatedBy")
  productionRecaps ProductionRecap[] @relation("RecordedBy")
  qcResults     QcResult[] @relation("InspectedBy")
  revisionTickets RevisionTicket[] @relation("SubmittedBy")
  approvedTickets RevisionTicket[] @relation("ApprovedBy")
  systemLogs    SystemLog[]
  performanceAssessments PerformanceAssessment[] @relation("AssessedBy")
  attendanceRecords AttendanceRecord[] @relation("RecordedBy")
}

model PurchaseOrder {
  id              Int       @id @default(autoincrement())
  poNumber        String    @unique @map("po_number")
  clientId        Int       @map("client_id")
  orderDate       DateTime  @map("order_date")
  depositAmount   Decimal?  @db.Decimal(12, 2) @map("deposit_amount")
  depositPaid     Boolean   @default(false) @map("deposit_paid")
  depositPaidDate DateTime? @map("deposit_paid_date")
  totalAmount     Decimal?  @db.Decimal(12, 2) @map("total_amount")
  status          String    @default("draft")
  notes           String?
  createdBy       Int       @map("created_by")
  createdAt       DateTime  @default(now()) @map("created_at")
  updatedAt       DateTime  @updatedAt @map("updated_at")

  client          Client    @relation(fields: [clientId], references: [id])
  creator         User      @relation("CreatedBy", fields: [createdBy], references: [id])
  productionStages ProductionStage[]
}

model ProductionStage {
  id              Int       @id @default(autoincrement())
  name            String    // Forming, Glaze, QC & Packaging
  code            String    @unique
  sequenceOrder   Int       @map("sequence_order")
  description     String?
  isActive        Boolean   @default(true) @map("is_active")

  workPlanAssignments WorkPlanAssignment[]
  purchaseOrders PurchaseOrder[]
}

// Additional tables for complete schema...
```

### Migration Strategy Phases

#### Phase 1: Schema Analysis & Planning (Week 1)
**Objective:** Complete assessment and planning
**Duration:** 1 week
**Activities:**
- Detailed schema analysis of MySQL gayafusionall database
- Data volume and complexity assessment
- Dependency mapping and relationship validation
- Performance benchmark establishment
- Migration tool selection (pgloader, custom scripts, Prisma migration)
- Backup strategy development

**Deliverables:**
- Complete schema documentation
- Migration risk assessment
- Tool selection recommendation
- Backup and recovery procedures

#### Phase 2: Development Environment Setup (Week 2)
**Objective:** Prepare migration infrastructure
**Duration:** 1 week
**Activities:**
- PostgreSQL server provisioning
- Prisma schema development
- Migration script development
- Test data preparation
- Validation script creation
- Performance testing environment setup

**Deliverables:**
- PostgreSQL database instance
- Complete Prisma schema
- Migration scripts
- Validation framework

#### Phase 3: Data Migration Execution (Week 3)
**Objective:** Execute migration with validation
**Duration:** 1 week
**Activities:**
- Full database backup (MySQL)
- Incremental data migration
- Relationship integrity validation
- Data transformation and cleansing
- Performance validation against benchmarks
- Rollback procedure testing

**Deliverables:**
- Migrated PostgreSQL database
- Migration execution logs
- Validation reports
- Performance test results

#### Phase 4: Production Migration & Validation (Week 4)
**Objective:** Production deployment with monitoring
**Duration:** 1 week
**Activities:**
- Production PostgreSQL setup
- Final data synchronization
- Application testing against migrated data
- Performance monitoring implementation
- Documentation and training
- Go-live readiness assessment

**Deliverables:**
- Production PostgreSQL database
- Migration completion report
- Performance monitoring dashboard
- Operational documentation

### Migration Tools & Technologies

#### Primary Migration Tools
- **pgloader**: High-performance PostgreSQL data loader
- **Prisma Migrate**: Schema migration and data seeding
- **Custom ETL Scripts**: Python/Node.js scripts for complex transformations
- **AWS DMS**: Database Migration Service for large-scale migrations

#### Validation & Testing Tools
- **Data Validation Scripts**: Automated integrity checks
- **Performance Benchmarking**: Query performance validation
- **Data Comparison Tools**: Source vs target data verification
- **Application Testing**: End-to-end workflow validation

### Risk Mitigation

#### Technical Risks
- **Data Loss Prevention:** Multiple backup strategies, incremental migration approach
- **Performance Degradation:** Comprehensive benchmarking, query optimization
- **Schema Incompatibilities:** Detailed schema analysis, transformation scripts
- **Downtime Management:** Phased approach, rollback procedures

#### Operational Risks
- **Business Continuity:** Read-only MySQL access during migration
- **User Impact:** Scheduled maintenance windows, communication plan
- **Data Integrity:** Automated validation, manual verification processes
- **Rollback Capability:** Complete rollback procedures tested and documented

### Success Criteria

#### Data Integrity
- **Zero Data Loss:** 100% data preservation verified
- **Relationship Integrity:** All foreign key relationships maintained
- **Data Accuracy:** Source vs target data validation passed
- **Business Rules:** All existing validations preserved

#### Performance
- **Query Performance:** Complex queries <3 seconds (target)
- **Concurrent Users:** Support 100+ simultaneous connections
- **Data Loading:** Migration completes within maintenance window
- **System Stability:** No performance degradation post-migration

#### Operational Readiness
- **Monitoring:** Comprehensive monitoring and alerting in place
- **Documentation:** Complete operational documentation provided
- **Training:** Database administrators trained on new system
- **Support:** 24/7 support availability during go-live

### Rollback Procedures

#### Immediate Rollback (< 4 hours)
- **Trigger:** Critical data corruption or system failure
- **Procedure:**
  1. Stop application traffic
  2. Restore MySQL from backup
  3. Verify data integrity
  4. Resume operations
  5. Schedule new migration attempt

#### Phased Rollback (< 24 hours)
- **Trigger:** Performance issues or application incompatibilities
- **Procedure:**
  1. Gradual traffic redirection to MySQL
  2. PostgreSQL kept as read-only backup
  3. Issue resolution and testing
  4. Complete migration or extended dual-run

### Testing Strategy

#### Unit Testing
- Schema validation tests
- Data transformation tests
- Relationship integrity tests
- Performance benchmark tests

#### Integration Testing
- Application workflow testing
- API endpoint validation
- Real-time feature testing
- File storage integration testing

#### User Acceptance Testing
- Business user workflow validation
- Report generation testing
- Data accuracy verification
- Performance validation

### Monitoring & Support

#### Post-Migration Monitoring
- **Database Performance:** Query execution times, connection pooling
- **Application Performance:** Response times, error rates
- **Data Integrity:** Automated validation checks
- **System Health:** Disk usage, memory utilization, backup status

#### Support Structure
- **Database Administration:** 24/7 DBA support during go-live week
- **Application Support:** Development team on standby
- **Business Support:** Product owners available for validation
- **Vendor Support:** Prisma and PostgreSQL vendor support engaged

---

## Implementation Timeline

```
Week 1: Schema Analysis & Planning
├── Day 1-2: MySQL schema documentation
├── Day 3-4: Dependency analysis & risk assessment
└── Day 5: Migration strategy finalization

Week 2: Development Environment Setup
├── Day 1-2: PostgreSQL provisioning & Prisma setup
├── Day 3-4: Migration script development
└── Day 5: Test environment validation

Week 3: Data Migration Execution
├── Day 1-2: Full backup & incremental migration
├── Day 3-4: Data validation & transformation
└── Day 5: Performance testing & optimization

Week 4: Production Migration & Validation
├── Day 1-2: Production deployment
├── Day 3-4: Application testing & monitoring setup
└── Day 5: Go-live & support handover
```

---

## Resource Requirements

### Team Composition
- **Database Architect:** Lead migration design and execution
- **Data Engineer:** ETL script development and validation
- **DevOps Engineer:** Infrastructure provisioning and monitoring
- **QA Engineer:** Testing coordination and validation
- **Business Analyst:** Requirements validation and UAT coordination

### Infrastructure Requirements
- **Development Environment:** PostgreSQL test instance, migration tools
- **Staging Environment:** Full replica of production infrastructure
- **Production Environment:** PostgreSQL cluster with monitoring
- **Backup Systems:** Automated backup and recovery systems
- **Monitoring Tools:** Database monitoring and alerting systems

### Budget Considerations
- **Infrastructure:** PostgreSQL hosting and monitoring costs
- **Tools:** Migration tools and testing software licenses
- **Personnel:** Additional DBA and engineering resources
- **Contingency:** Rollback and recovery system costs

---

This migration plan ensures a smooth transition from MySQL to PostgreSQL while maintaining data integrity and system performance. The phased approach minimizes risk and provides multiple rollback options for business continuity.