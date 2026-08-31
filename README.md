# Sterling Assurance Asset Management System

A centralized web-based **Asset Management System** developed to help Sterling Assurance manage, track, assign, monitor, and maintain company assets efficiently.

The system replaces fragmented/manual asset tracking processes with a centralized platform where authorized employees can manage the complete lifecycle of company assets — from registration and assignment to maintenance, documentation, transfer, and retirement.

---

## 📌 Table of Contents

* [Project Overview](#-project-overview)
* [Problem Statement](#-problem-statement)
* [User Requirements](#-user-requirements)
* [How the Problem Was Solved](#-how-the-problem-was-solved)
* [System Objectives](#-system-objectives)
* [Core Features](#-core-features)
* [User Roles](#-user-roles)
* [Asset Lifecycle](#-asset-lifecycle)
* [System Workflow](#-system-workflow)
* [Functional Requirements](#-functional-requirements)
* [Non-Functional Requirements](#-non-functional-requirements)
* [System Architecture](#-system-architecture)
* [Database Design](#-database-design)
* [Technology Stack](#-technology-stack)
* [Security](#-security)
* [Installation & Setup](#-installation--setup)
* [Example Use Case](#-example-use-case)
* [Challenges & Solutions](#-challenges--solutions)
* [Future Improvements](#-future-improvements)
* [Project Impact](#-project-impact)

---

# 📋 Project Overview

The Sterling Assurance Asset Management System is designed to provide an organized and centralized way of managing company assets.

In a typical organization, assets such as:

* Laptops
* Desktop computers
* Monitors
* Mobile devices
* Printers
* Networking equipment
* Office equipment
* Furniture
* Software licenses
* Other company-owned equipment

need to be properly recorded and monitored.

The system provides a single source of truth for this information.

Instead of relying on spreadsheets, physical documents, emails, or manually maintained records, authorized staff can access the system to determine:

> **What assets does the company own?**

> **Where is each asset?**

> **Who is responsible for it?**

> **What department owns it?**

> **What is its current condition?**

> **When was it purchased?**

> **When does its warranty expire?**

> **Has it been maintained?**

> **What documents are associated with it?**

---

# ❗ Problem Statement

Before implementing a centralized asset management solution, asset information can easily become difficult to manage when it is distributed across spreadsheets, documents, emails, and physical records.

This creates several problems.

### 1. Difficult Asset Tracking

Employees may have difficulty determining the current location or owner of an asset.

For example:

```text
Laptop
   ↓
Assigned to John
   ↓
John moved to Finance
   ↓
Laptop transferred
   ↓
Spreadsheet not updated
```

The organization may then have an inaccurate record of who currently possesses the laptop.

---

### 2. Poor Accountability

Without a reliable assignment history, it becomes difficult to determine who was responsible for an asset at a particular point in time.

This is particularly important for expensive equipment such as:

* laptops
* servers
* networking equipment
* mobile devices

---

### 3. Scattered Documentation

Asset-related documents can be stored separately from the actual asset record.

For example:

```text
Laptop Record
     |
     ├── Purchase Invoice
     ├── Warranty Document
     ├── Delivery Document
     └── Maintenance Record
```

Without a centralized system, finding these documents can take unnecessary time.

---

### 4. Difficulty Monitoring Asset Condition

Assets can have different statuses and conditions:

```text
Available
Assigned
Under Maintenance
Damaged
Lost
Retired
Disposed
```

Without proper tracking, management may not have an accurate overview of the organization's usable assets.

---

### 5. Lack of Centralized Reporting

Management may need answers such as:

* How many laptops does the company have?
* How many assets are currently assigned?
* Which assets are under maintenance?
* Which department owns the most assets?
* Which assets are damaged?
* Which assets are available?
* Which assets have been retired?

Manually generating these reports can be time-consuming.

---

# 👥 User Requirements

The system was designed based on the requirements of the people who interact with company assets.

## 1. IT / Asset Administrator Requirements

The administrator should be able to:

* Register new assets
* Update asset information
* Assign assets to employees
* Transfer assets between employees
* Transfer assets between departments
* View asset history
* Upload asset-related documents
* Record maintenance activities
* Change asset status
* Search for assets
* Filter assets
* Generate reports
* View asset statistics
* Manage users
* Manage departments
* Track asset ownership and responsibility

---

## 2. Employee Requirements

Employees should be able to:

* View assets assigned to them
* View basic asset information
* See the condition of their assigned assets
* Report asset problems
* View relevant asset documentation
* View assignment information

Employees should not have access to administrative functionality unless authorized.

---

## 3. Management Requirements

Management should be able to access summarized information such as:

```text
Total Assets
      ↓
Assigned Assets
      ↓
Available Assets
      ↓
Assets Under Maintenance
      ↓
Damaged Assets
      ↓
Retired Assets
```

This allows management to understand the organization's asset position without manually inspecting individual records.

---

# 💡 How I Solved the Problem

The major solution was to transform asset management from a fragmented/manual process into a **centralized digital asset lifecycle management system**.

Instead of storing asset information in separate locations, I designed the system around the concept of a single asset record.

Each asset has a unique identity.

For example:

```text
Asset
 ├── Asset ID
 ├── Asset Code
 ├── Name
 ├── Category
 ├── Serial Number
 ├── Manufacturer
 ├── Model
 ├── Purchase Date
 ├── Manufacturing Date
 ├── Purchase Price
 ├── Warranty Information
 ├── Condition
 ├── Status
 ├── Department
 ├── Assigned Employee
 ├── Documents
 └── Maintenance History
```

This allows information relating to an asset to be accessed from one centralized location.

---

# 🎯 System Objectives

The main objectives of the system are to:

1. Centralize company asset information.
2. Improve asset accountability.
3. Track asset ownership and assignment.
4. Monitor asset condition.
5. Maintain asset history.
6. Store asset-related documentation.
7. Track maintenance activities.
8. Provide useful management statistics.
9. Reduce manual record keeping.
10. Improve the efficiency of the IT/administrative team.
11. Make asset information easier to search and retrieve.
12. Provide a foundation for future reporting and automation.

---

# 🚀 Core Features

## Asset Registration

Administrators can register new assets.

Information captured can include:

* Asset name
* Asset code
* Serial number
* Asset category
* Manufacturer
* Model
* Purchase date
* Manufacturing date
* Purchase price
* Warranty information
* Department
* Condition
* Status
* Description

---

## Unique Asset Identification

Every asset receives a unique identifier.

Example:

```text
AST-000001
AST-000002
AST-000003
```

The asset code provides a human-readable reference for identifying physical assets.

The database primary key remains separate from the asset code.

This prevents the business-facing asset identifier from being tightly coupled to the database implementation.

---

# 👤 Asset Assignment

An administrator can assign an asset to an employee.

Example:

```text
Asset:
Dell Latitude 7420

Assigned To:
John Doe

Department:
Information Technology

Status:
Assigned
```

This establishes accountability between the asset and its current custodian.

---

# 🔄 Asset Transfer

The system supports transferring assets.

For example:

```text
John
IT Department
      ↓
      ↓ Transfer
      ↓
Mary
Finance Department
```

Rather than simply changing the employee field and losing the previous information, the system can maintain an assignment history.

This provides traceability.

---

# 📜 Asset History

The system maintains important historical events associated with assets.

For example:

```text
Asset Created
      ↓
Purchased
      ↓
Assigned to John
      ↓
Transferred to Mary
      ↓
Sent for Maintenance
      ↓
Returned
      ↓
Assigned Again
      ↓
Retired
```

This makes it possible to understand what happened to an asset throughout its lifecycle.

---

# 🛠 Maintenance Management

Assets can be placed under maintenance when they develop problems.

A maintenance record can contain information such as:

* Asset
* Maintenance date
* Problem description
* Technician
* Maintenance provider
* Cost
* Resolution
* Status
* Completion date

Example:

```text
Asset: Laptop AST-00012

Problem:
Laptop battery failing

Status:
Completed

Cost:
₦45,000

Resolution:
Battery replaced
```

---

# 📁 Document Management

Asset-related documents can be associated with the asset.

Examples include:

* Purchase invoices
* Warranty documents
* Receipts
* Delivery documents
* Maintenance documents
* Asset photographs
* Other supporting documentation

Instead of searching through separate folders, the administrator can access documents from the asset record.

---

# 🔎 Search & Filtering

The system provides mechanisms for quickly finding assets.

Assets can be searched or filtered by:

* Asset code
* Name
* Serial number
* Category
* Department
* Assigned employee
* Status
* Condition
* Location

Example:

```text
Search:
AST-00045
```

or:

```text
Department:
Information Technology

Status:
Assigned
```

---

# 📊 Dashboard

The system provides an overview of the organization's assets.

Example dashboard metrics:

```text
┌─────────────────┐
│  TOTAL ASSETS   │
│      1,250      │
└─────────────────┘

┌─────────────────┐
│    ASSIGNED     │
│       980       │
└─────────────────┘

┌─────────────────┐
│    AVAILABLE    │
│       180       │
└─────────────────┘

┌─────────────────┐
│  MAINTENANCE    │
│        45       │
└─────────────────┘
```

The dashboard gives administrators and management a quick overview without requiring them to inspect every asset.

---

# 👥 User Roles

The system can implement role-based access control.

## Administrator

Full access to asset management functionality.

Permissions may include:

```text
Create Asset
Update Asset
Delete Asset
Assign Asset
Transfer Asset
Manage Users
Manage Departments
Manage Documents
Manage Maintenance
View Reports
```

---

## IT Staff

Can manage operational asset activities.

```text
View Assets
Register Assets
Assign Assets
Record Maintenance
Update Asset Status
View Asset History
```

---

## Employee

Limited access.

```text
View Assigned Assets
View Asset Details
Report Asset Problems
```

---

## Management

Primarily focused on visibility and reporting.

```text
View Dashboard
View Asset Statistics
View Reports
View Asset Information
```

---

# 🔄 Asset Lifecycle

The system models the complete lifecycle of an asset.

```text
                 ┌──────────────┐
                 │   PURCHASE   │
                 └──────┬───────┘
                        ↓
                 ┌──────────────┐
                 │   REGISTER   │
                 └──────┬───────┘
                        ↓
                 ┌──────────────┐
                 │   AVAILABLE  │
                 └──────┬───────┘
                        ↓
                 ┌──────────────┐
                 │    ASSIGNED  │
                 └──────┬───────┘
                        ↓
                 ┌──────────────┐
                 │   IN USE     │
                 └──────┬───────┘
                        ↓
              ┌─────────┴─────────┐
              ↓                   ↓
       ┌──────────────┐    ┌──────────────┐
       │ MAINTENANCE  │    │   TRANSFER   │
       └──────┬───────┘    └──────┬───────┘
              │                   │
              └─────────┬─────────┘
                        ↓
                 ┌──────────────┐
                 │    RETIRED   │
                 └──────┬───────┘
                        ↓
                 ┌──────────────┐
                 │   DISPOSED   │
                 └──────────────┘
```

---

# ⚙️ System Workflow

### Step 1 — Asset Registration

An administrator enters the asset information.

```text
Administrator
      ↓
Create Asset
      ↓
Validate Information
      ↓
Generate Asset Code
      ↓
Save Asset
```

---

### Step 2 — Asset Assignment

```text
Select Asset
      ↓
Select Employee
      ↓
Select Department
      ↓
Confirm Assignment
      ↓
Asset Status → ASSIGNED
```

---

### Step 3 — Asset Usage

The employee becomes responsible for the assigned asset.

---

### Step 4 — Asset Transfer

If the asset changes hands:

```text
Current Employee
       ↓
Transfer Request
       ↓
New Employee
       ↓
Update Assignment
       ↓
Create History Record
```

---

### Step 5 — Maintenance

If the asset develops a problem:

```text
Report Problem
      ↓
Create Maintenance Record
      ↓
Asset Status → MAINTENANCE
      ↓
Repair
      ↓
Complete Maintenance
      ↓
Asset Status → AVAILABLE / ASSIGNED
```

---

# 📌 Functional Requirements

The system should allow authorized users to:

### Asset Management

* Create assets
* Read assets
* Update assets
* Archive/retire assets
* Search assets
* Filter assets
* Categorize assets

### Assignment Management

* Assign assets
* Transfer assets
* Unassign assets
* View current custodian
* View assignment history

### Maintenance

* Create maintenance records
* Update maintenance records
* Track maintenance costs
* Track maintenance status
* View maintenance history

### Documents

* Upload documents
* Associate documents with assets
* View documents
* Delete documents where authorized

### User Management

* Create users
* Assign roles
* Update users
* Disable users
* Associate users with departments

### Reporting

* View asset statistics
* Filter asset reports
* View department asset distribution
* View asset status distribution

---

# 🔐 Non-Functional Requirements

## Security

The system should protect asset information from unauthorized access.

Security mechanisms include:

* Authentication
* Authorization
* Role-based access control
* Input validation
* Secure password storage
* Protected API endpoints

---

## Performance

The system should efficiently handle:

* Asset searches
* Filtering
* Dashboard statistics
* Database queries
* Document retrieval

Database indexes can be introduced for frequently searched fields such as:

```text
asset_code
serial_number
status
department_id
assigned_user_id
```

---

## Scalability

The application should be structured so that it can support increasing numbers of:

* Assets
* Users
* Departments
* Maintenance records
* Documents
* Transactions

---

# 🏗 System Architecture

The application follows a client-server architecture.

```text
┌─────────────────────────────┐
│          FRONTEND           │
│                             │
│   React / Next.js / TS      │
│                             │
│   Dashboard                 │
│   Asset Management          │
│   Users                     │
│   Departments               │
│   Reports                   │
└──────────────┬──────────────┘
               │
               │ HTTP / REST API
               ↓
┌─────────────────────────────┐
│          BACKEND            │
│                             │
│       Spring Boot           │
│                             │
│ Controllers                │
│ Services                   │
│ Repositories               │
│ Authentication             │
│ Business Logic              │
└──────────────┬──────────────┘
               │
               │ SQL
               ↓
┌─────────────────────────────┐
│          DATABASE           │
│                             │
│        PostgreSQL           │
│                             │
│ Users                       │
│ Assets                      │
│ Departments                 │
│ Assignments                 │
│ Maintenance                 │
│ Documents                   │
│ History                     │
└─────────────────────────────┘
```

---

# 🗄 Database Design

A relational database is appropriate because the system contains strongly related entities.

A simplified database structure is:

```text
users
  |
  | belongs to
  ↓
departments
  |
  | manages
  ↓
assets
  |
  ├──────────────→ categories
  |
  ├──────────────→ assignments
  |
  ├──────────────→ maintenance_records
  |
  ├──────────────→ documents
  |
  └──────────────→ asset_history
```

### Assets

Possible fields:

```text
id
asset_code
name
serial_number
category_id
manufacturer
model
purchase_date
manufacturing_date
purchase_price
warranty_expiry
condition
status
department_id
description
created_at
updated_at
```

### Users

```text
id
name
email
password
role
department_id
created_at
updated_at
```

### Assignments

```text
id
asset_id
user_id
department_id
assigned_at
returned_at
status
notes
```

### Maintenance

```text
id
asset_id
reported_by
problem
description
maintenance_date
cost
technician
status
resolution
completed_at
```

### Documents

```text
id
asset_id
name
file_url
document_type
uploaded_by
created_at
```

### Asset History

```text
id
asset_id
action
previous_status
new_status
performed_by
description
created_at
```

---

# 🛠 Technology Stack

## Frontend

* TypeScript
* React / Next.js
* Tailwind CSS
* REST API integration

## Backend

* Java
* Spring Boot
* Spring Web
* Spring Data JPA
* Spring Security

## Database

* PostgreSQL

## Development Tools

* Git
* GitHub
* VS Code / IntelliJ IDEA
* Postman
* Docker

---

# 🔐 Security Design

Security was considered because asset systems contain organizational information.

The backend should not rely on the frontend to enforce permissions.

Instead:

```text
Frontend
   ↓
Authentication
   ↓
Backend Authorization
   ↓
Permission Check
   ↓
Business Logic
   ↓
Database
```

For example, a normal employee should not be able to send an API request to delete an asset simply because the frontend hides the delete button.

The backend must independently verify the user's permissions.

---

# 🧪 Validation

Input validation is performed before information is persisted.

Examples:

```text
Asset code → Required + Unique

Serial number → Validated

Purchase price → Numeric

Purchase date → Valid date

Email → Valid email format

Required fields → Cannot be empty
```

This prevents invalid or inconsistent information from entering the database.

---

# 💻 Installation & Setup

## Clone the repository

```bash
git clone <repository-url>
cd sterling-asset-management
```

---

## Backend Setup

Navigate to the backend:

```bash
cd backend
```

Configure the database connection:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/sterling_assets
spring.datasource.username=postgres
spring.datasource.password=your_password
```

Run the application:

```bash
./mvnw spring-boot:run
```

On Windows:

```bash
mvnw.cmd spring-boot:run
```

---

## Frontend Setup

Navigate to the frontend:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The frontend can then communicate with the Spring Boot REST API.

---

# 🧑‍💼 Example Business Use Case

### Scenario

Sterling Assurance purchases a new laptop.

The IT administrator logs into the system.

### 1. Register

```text
Name:
Dell Latitude 7420

Category:
Laptop

Serial Number:
DL7420XXXXX

Purchase Date:
2026-08-01

Condition:
New

Status:
Available
```

The system generates:

```text
AST-000102
```

---

### 2. Assign

The administrator assigns the laptop to:

```text
Employee:
John Doe

Department:
IT

Status:
Assigned
```

---

### 3. Maintenance

Three months later, John reports a battery problem.

The administrator records:

```text
Problem:
Battery degradation

Status:
Under Maintenance
```

The asset's status changes to:

```text
MAINTENANCE
```

---

### 4. Repair

After the repair:

```text
Maintenance Status:
Completed
```

The asset becomes:

```text
ASSIGNED
```

again.

---

### 5. Transfer

John later leaves the IT department.

The laptop is transferred to another employee.

The system records the new assignment while preserving the previous assignment history.

This means the organization can still determine:

```text
Who previously had it?
Who currently has it?
When was it transferred?
What department was it previously assigned to?
```

---

# 🧩 Challenges & Solutions

## Challenge 1 — Keeping Asset Information Centralized

### Problem

Asset information can become scattered across spreadsheets and documents.

### Solution

I designed a centralized relational database where each asset has a single primary record and related information is connected through relationships.

```text
Asset
 ├── Assignment
 ├── Maintenance
 ├── Documents
 └── History
```

---

## Challenge 2 — Tracking Responsibility

### Problem

Simply storing the current employee does not provide historical accountability.

### Solution

I introduced an assignment/history concept.

Instead of overwriting the old record:

```text
John → Laptop
```

with:

```text
Mary → Laptop
```

the system can preserve the historical relationship:

```text
John
↓
Assigned: January

Mary
↓
Assigned: June
```

This improves traceability.

---

## Challenge 3 — Asset Status Management

### Problem

An asset can move through multiple states during its lifecycle.

### Solution

I implemented clearly defined asset statuses.

For example:

```text
AVAILABLE
ASSIGNED
MAINTENANCE
DAMAGED
LOST
RETIRED
DISPOSED
```

This allows the system to accurately represent the current state of an asset.

---

## Challenge 4 — Connecting Documents to Assets

### Problem

Documents are often stored separately from the information they describe.

### Solution

Documents are associated directly with an asset record.

```text
AST-000102
     |
     ├── Invoice
     ├── Warranty
     ├── Maintenance Report
     └── Asset Photograph
```

This makes document retrieval significantly easier.

---

## Challenge 5 — Maintaining Data Integrity

### Problem

Manually maintained records can contain:

* Duplicate assets
* Invalid users
* Incorrect assignments
* Missing information
* Inconsistent statuses

### Solution

The database uses relationships, constraints and validation to maintain data integrity.

For example:

```text
Asset Code → UNIQUE
Serial Number → UNIQUE where applicable
User → Valid Foreign Key
Department → Valid Foreign Key
Asset → Valid Foreign Key
```

---

# 📈 Project Impact

The system is designed to provide several organizational benefits.

### Improved Visibility

Management can see the organization's asset position from one dashboard.

### Improved Accountability

Every assignment can be linked to an employee and department.

### Better Asset Lifecycle Management

Assets can be tracked from:

```text
Purchase
   ↓
Registration
   ↓
Assignment
   ↓
Maintenance
   ↓
Transfer
   ↓
Retirement
```

### Reduced Manual Work

Instead of repeatedly searching spreadsheets and physical records, authorized users can search the system.

### Better Record Keeping

Asset documents, maintenance information, assignments and history can be associated with the asset.

### Better Decision Making

Management can use the available data to determine:

* Asset utilization
* Maintenance requirements
* Departmental distribution
* Available equipment
* Aging assets
* Replacement requirements

---

# 🔮 Future Improvements

Potential future versions of the system could introduce:

### QR / Barcode Asset Identification

Each asset could receive a QR code.

```text
Scan QR Code
      ↓
Asset Record
      ↓
View / Update
```

This would make physical asset audits faster.

---

### Automated Notifications

The system could notify administrators when:

* warranties are expiring
* maintenance is due
* assets have been reported damaged
* an assignment requires approval
* assets remain under maintenance for too long

---

### Audit Logs

A complete audit trail could record:

```text
WHO
WHAT
WHEN
```

For example:

```text
Admin John
Transferred AST-000102
From David → Mary
2026-08-31 10:32
```

---

### Advanced Reporting

The system could generate:

* PDF reports
* Excel reports
* Department reports
* Asset valuation reports
* Maintenance cost reports
* Asset depreciation reports
* Audit reports

---

### QR-Based Physical Auditing

During an annual asset audit, IT staff could walk around the organization and scan asset QR codes.

The system could immediately display:

```text
Asset:
AST-000102

Expected User:
Mary Doe

Expected Location:
IT Department

Condition:
Good

Status:
Assigned
```

This can help identify discrepancies between physical assets and database records.

---

# 📚 Engineering Concepts Demonstrated

This project demonstrates practical application of:

* Object-Oriented Programming
* REST API development
* Relational database design
* CRUD operations
* Authentication
* Authorization
* Role-Based Access Control
* Entity relationships
* Data validation
* File management
* State management
* Asset lifecycle modelling
* Audit/history tracking
* API integration
* Exception handling
* Database transactions
* Software architecture
* Git version control

---

# 🏁 Conclusion

The Sterling Assurance Asset Management System was developed to solve the practical problem of managing organizational assets in a centralized, traceable and efficient manner.

The system moves asset management away from fragmented manual records toward a structured digital workflow.

The key idea behind the solution is:

```text
             CENTRALIZED ASSET RECORD
                       │
       ┌───────────────┼────────────────┐
       ↓               ↓                ↓
   ASSIGNMENT      MAINTENANCE       DOCUMENTS
       │               │                │
       └───────────────┼────────────────┘
                       ↓
                 ASSET HISTORY
                       ↓
                  REPORTING
                       ↓
              BETTER DECISIONS
```

By connecting assets with their users, departments, maintenance activities, documents and historical events, the system provides a more complete view of the organization's assets and creates a foundation for future automation, auditing and reporting.
