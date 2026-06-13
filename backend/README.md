# MPBSE Results Backend (Laravel 12)

Laravel + MySQL backend for the existing static `results.html` marksheet page and an admin dashboard.

## Features

- Admin login / logout (session auth)
- Bootstrap 5 admin dashboard (EduManager style)
- CRUD for student results
- Search and class filter
- Excel / CSV bulk import (skips duplicate Roll + DOB)
- CSV export
- Public API for existing frontend lookup

## Database Schema

### `student_results`

| Column | Type | Notes |
|--------|------|-------|
| id | bigint | PK |
| roll_number | string | indexed |
| date_of_birth | date | unique with roll_number |
| class | string | 10th / 12th |
| enrollment_number | string | |
| student_name | string | |
| father_name | string | |
| mother_name | string | |
| school_name | string | |
| school_code | integer | |
| examination_year | integer | |
| subjects | json | array of subject marks |
| total_obtained | integer | |
| maximum_marks | integer | default 600 |
| percentage | decimal | |
| division | string | |
| result_status | string | PASS / FAIL |
| serial_number | integer | |
| issue_date | string | e.g. 22.05.2018 |
| status | string | active / on_leave |

Unique key: `(roll_number, date_of_birth)`

## Setup (XAMPP) — already configured on this machine

Composer dependencies are installed via junction:

- `backend/vendor` → `C:\xampp\htdocs\mpbse-backend\vendor`

If `vendor` is missing, run `setup.bat`.

### Start MySQL (XAMPP)

Start **MySQL** from XAMPP Control Panel (or run `C:\xampp\xampp_start.exe`).

### Run backend

```bash
cd backend
start-server.bat
```

Or:

```bash
php artisan serve
```

### Current credentials

- **Admin:** http://127.0.0.1:8000/admin/login
- Email: `admin@mpbse.org`
- Password: `Admin@123`

### Result page

- Static site: http://127.0.0.1:5500/results.html
- Backend API: http://127.0.0.1:8000

Test roll: `201889321` / DOB: `1996-07-10`

---

## Manual Setup (fresh machine)

### 1. Create MySQL database

```sql
CREATE DATABASE mpbse_results CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Install PHP dependencies

```bash
cd backend
composer install
copy .env.example .env
php artisan key:generate
```

Update `.env`:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=mpbse_results
DB_USERNAME=root
DB_PASSWORD=
APP_URL=http://127.0.0.1:8000
```

### 3. Migrate and seed

```bash
php artisan migrate
php artisan db:seed
```

Default admin:

- Email: `admin@mpbse.org`
- Password: `Admin@123`

Seeder also imports existing JSON from `../resources/data/results-2026-jun.json`.

### 4. Run backend

```bash
php artisan serve
```

Admin panel: http://127.0.0.1:8000/admin/login

### 5. Connect existing frontend

`results.html` already includes:

```html
<script>window.MPBSE_API_BASE = "http://127.0.0.1:8000";</script>
```

Keep static site on Live Server (5500). Result lookup calls Laravel API on port 8000.

## API

### POST `/api/results/lookup`

Request JSON:

```json
{
  "rollNumber": "201889321",
  "dateOfBirth": "1996-07-10"
}
```

Success `200`:

```json
{
  "success": true,
  "data": { "...same shape as existing JSON..." }
}
```

Not found `404`:

```json
{
  "success": false,
  "message": "No marksheet found for the given Roll Number and Date of Birth."
}
```

## Excel Import Columns

Minimum required:

- `roll_number`
- `date_of_birth`
- `student_name`

Optional:

- `class`, `enrollment_number`, `father_name`, `mother_name`
- `school_name`, `school_code`, `examination_year`
- `subjects_json` (JSON array) **or** flat columns:
  - `subject1_name`, `subject1_theory`, `subject1_practical`, `subject1_total`
- `total_obtained`, `maximum_marks`, `percentage`, `division`
- `result_status`, `serial_number`, `issue_date`, `status`

Duplicates (same roll + DOB) are skipped during import.

## Project Structure

```
backend/
  app/Http/Controllers/Admin/   # Auth, dashboard, CRUD, import
  app/Http/Controllers/Api/     # Result lookup API
  app/Models/StudentResult.php
  app/Imports/StudentResultsImport.php
  database/migrations/
  resources/views/admin/
  routes/web.php
  routes/api.php
```

## Notes

- Frontend HTML/CSS design is unchanged; only backend API config + JS data source updated.
- Same roll number with different DOB is allowed (matches existing marksheet logic).
- Change `MPBSE_API_BASE` in production to your Laravel domain.
