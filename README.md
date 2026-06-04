# CertSync

CertSync is a production-ready, high-performance certificate collection, tracking, and compilation platform designed specifically for educational institutions to collect student certificates, cross-reference submissions against student master registers, and compile accreditation-ready (NAAC/NBA) evidence bundles.

Developed for **Kristu Jyoti College of Management and Technology** by **INOVUS LABS IEDC**.

---

## 🚀 Key Features

### 📊 Real-time Analytics Dashboard
- High-impact metrics displaying total student counts, submitted bundles, completion percentages, and pending submissions.
- Course and department distribution charts (pure CSS/SVG render).
- Security audit timeline tracing the latest faculty and student operations.

### 📝 Dynamic Forms & Student Registry
- Faculty can create form campaigns with title, description, department, and custom deadline gates.
- Upload course student master registers via Excel (.xlsx) sheets with **Smart Header Matching** (automatically identifies Roll Number and Student Name columns).

### 📤 Public Student Submission Portal
- Mobile-friendly unauthenticated submission form.
- Automated file validations: blocks non-PDF uploads, enforces 10MB file limits.
- **Resubmission Override**: automatic duplicate detection that updates the student's entry and purges orphaned file assets.
- **Unified Renaming**: automatically renames files using structured names before storage.
- **Receipt Generator**: renders a print-friendly ticket with verification timestamps and a custom-drawn QR verification code.

### ⚙️ Export Center (Accreditation-Ready)
- **Merged PDF Compiler**: concatenates all student certificates into a single consolidated PDF ordered by class rolls.
- **PDF Compressor**: supports three compression levels:
  - *Low*: Quick rendering, normal layout stream.
  - *Medium*: Structured object stream compression.
  - *High*: Compact Gzip compression stream for space-constrained uploads.
- **Accreditation ZIP (NAAC/NBA)**: bundles student folders named as `[RollNumber]_[StudentName]` containing normalized certificate filenames (`Certificate_1.pdf`, `Certificate_2.pdf`).
- **Sorting Engine**: supports four sequence tracks:
  - Excel Register sequence.
  - Roll Number Ascending / Descending.
  - Student Name Ascending.

### 📈 Excel Reports Generator
- **Submission Status Report**: lists Roll Number, Student Name, Status (Submitted / Pending), and submission timestamps with visual highlights.
- **Missing Files Audit Report**: performs gap audits to detect missing certificate pages per student and marks them.

---

## 🛠️ Technology Stack

- **Core Framework**: Next.js 15 (App Router, Server Actions)
- **Language**: TypeScript
- **Styling**: Tailwind CSS & Vanilla CSS variable bindings
- **Database**: MongoDB Atlas (via Mongoose schemas)
- **Authentication**: NextAuth.js (Credentials provider with automated admin account seeding)
- **PDF Compilation**: `pdf-lib`
- **Spreadsheet Parsing & Generation**: `xlsx` & `exceljs`
- **Media Engine**: Cloudinary integration with local disk fallback (`public/uploads`)
- **QR Generation**: `qrcode` canvas rendering

---

## ⚙️ Environment Configuration

Create a `.env.local` file at the root of the project:

```env
# MongoDB Atlas Connection
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/certsync

# NextAuth Configuration
NEXTAUTH_SECRET=your-secure-base64-secret-key
NEXTAUTH_URL=http://localhost:3000

# Cloudinary Integration (Optional for local development)
# If left blank, CertSync defaults to storing uploads locally under /public/uploads/
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

---

## 📦 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Local Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Automated Seeding / Admin Setup
On first startup, trying to log in when the database is empty automatically seeds the default administrator account:
- **Email**: `admin@certsync.com`
- **Password**: `admin123`

Faculty can log in, create campaigns, upload student lists, track submissions, and invite/register additional staff members through the **Settings** panel.

---

## 📂 Project Structure

```
├── public/                  # Static assets & Local file upload fallback directory
│   └── uploads/             # Stores student certificate PDFs if Cloudinary is offline
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── api/             # API Route Handlers (Submissions, Forms, Exports, Users)
│   │   ├── dashboard/       # Authenticated Faculty Dashboard views
│   │   ├── form/            # Public Student submission pages & receipts
│   │   └── login/           # Glassmorphic Login portal
│   ├── components/          # Reusable React components (Dashboard layout, Charts, Forms)
│   ├── lib/                 # Core server helpers (dbConnect, Auth, Cloudinary, pdf-lib, logs)
│   │   ├── models/          # Mongoose Database Schemas (User, Form, Submission, Audit)
│   │   └── pdf.ts           # PDF merging and object compression engine
```

---

## 📄 License & Attribution
Designed and built by **INOVUS LABS IEDC** for **Kristu Jyoti College of Management and Technology**.
All rights reserved.
